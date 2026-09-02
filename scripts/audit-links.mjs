import { pathToFileURL } from "node:url";

import { loadRows, loadSchema, sourceUrlFields } from "./data.mjs";
import { isApprovedSourceUrl } from "./validate.mjs";

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 20_000;

export function classifyStatus(status) {
  if (status >= 200 && status < 300) return "ok";
  if (status === 404 || status === 410) return "broken";
  return "warning";
}

async function request(url, method, fetchImpl, redirectCount = 0) {
  if (!isApprovedSourceUrl(url)) throw new Error("URL host is not approved for source audits");
  if (redirectCount > MAX_REDIRECTS) throw new Error("Too many redirects");

  const response = await fetchImpl(url, {
    method,
    redirect: "manual",
    headers: {
      "user-agent": "voice-agent-benchmark-landscape-link-audit/1.0",
      ...(method === "GET" ? { range: "bytes=0-0" } : {}),
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers?.get?.("location");
    await response.body?.cancel?.();
    if (!location) throw new Error(`Redirect ${response.status} has no Location header`);
    return request(new URL(location, url).href, method, fetchImpl, redirectCount + 1);
  }
  await response.body?.cancel?.();
  return response.status;
}

async function check(url, fetchImpl) {
  let headFailure;
  try {
    const headStatus = await request(url, "HEAD", fetchImpl);
    if (classifyStatus(headStatus) === "ok") return { url, status: headStatus, result: "ok", method: "HEAD" };
  } catch (error) {
    headFailure = error;
  }

  try {
    const getStatus = await request(url, "GET", fetchImpl);
    return { url, status: getStatus, result: classifyStatus(getStatus), method: "GET" };
  } catch (error) {
    const detail = headFailure ? `HEAD: ${headFailure.message}; GET: ${error.message}` : error.message;
    return { url, status: null, result: "warning", detail };
  }
}

export function sourceUrlsFromRows(rows, fields) {
  return [...new Set(rows.flatMap((row) => fields.map((field) => row[field])).filter(Boolean))];
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

export async function auditRows(rows, { fields, fetchImpl = fetch, concurrency = 6 } = {}) {
  if (!Array.isArray(fields) || fields.length === 0) throw new Error("Source URL fields are required");
  const urls = sourceUrlsFromRows(rows, fields);
  return mapWithConcurrency(urls, concurrency, (url) => check(url, fetchImpl));
}

export function summarize(results) {
  return results.reduce(
    (summary, { result }) => ({ ...summary, [result]: summary[result] + 1 }),
    { ok: 0, warning: 0, broken: 0 },
  );
}

async function main() {
  const strict = process.argv.slice(2).includes("--strict");
  const unknownArgs = process.argv.slice(2).filter((argument) => argument !== "--strict");
  if (unknownArgs.length) throw new Error(`Unknown argument: ${unknownArgs[0]}`);

  const [rows, schema] = await Promise.all([loadRows(), loadSchema()]);
  const results = await auditRows(rows, { fields: sourceUrlFields(schema) });
  for (const result of results) {
    console.log(`${result.result.padEnd(7)} ${String(result.status ?? "-").padEnd(3)} ${result.url}${result.detail ? ` (${result.detail})` : ""}`);
  }

  const summary = summarize(results);
  console.log(`\nChecked ${results.length} source URLs: ${summary.ok} ok, ${summary.warning} warnings, ${summary.broken} broken.`);
  if (summary.broken > 0 || summary.ok === 0 || (strict && summary.warning > 0)) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
