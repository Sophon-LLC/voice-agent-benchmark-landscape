import assert from "node:assert/strict";
import test from "node:test";

import { auditRows, classifyStatus, sourceUrlsFromRows, summarize } from "../scripts/audit-links.mjs";

const fields = ["github_url", "huggingface_url", "paper_url"];
const row = (url) => ({ github_url: url, huggingface_url: null, paper_url: null });
const response = (status, location) => ({
  status,
  headers: { get: (name) => (name === "location" ? location : null) },
  body: { cancel: async () => {} },
});

test("classifies redirects and successful responses as reachable", () => {
  assert.equal(classifyStatus(200), "ok");
  assert.equal(classifyStatus(301), "warning");
});

test("distinguishes missing sources from transient or protected responses", () => {
  assert.equal(classifyStatus(404), "broken");
  assert.equal(classifyStatus(410), "broken");
  assert.equal(classifyStatus(403), "warning");
  assert.equal(classifyStatus(429), "warning");
  assert.equal(classifyStatus(503), "warning");
});

test("deduplicates source URLs and ignores nulls", () => {
  assert.deepEqual(sourceUrlsFromRows([row("https://github.com/example/repo"), row("https://github.com/example/repo")], fields), ["https://github.com/example/repo"]);
  assert.deepEqual(sourceUrlsFromRows([], fields), []);
});

test("falls back to a range GET before declaring a HEAD-only 404 broken", async () => {
  const calls = [];
  const fetchImpl = async (_url, options) => {
    calls.push(options);
    return response(options.method === "HEAD" ? 404 : 200);
  };
  const results = await auditRows([row("https://github.com/example/repo")], { fields, fetchImpl, concurrency: 1 });
  assert.deepEqual(results[0], { url: "https://github.com/example/repo", status: 200, result: "ok", method: "GET" });
  assert.equal(calls[1].headers.range, "bytes=0-0");
});

test("falls back to a range GET when HEAD throws", async () => {
  const calls = [];
  const fetchImpl = async (_url, options) => {
    calls.push(options.method);
    if (options.method === "HEAD") throw new Error("socket closed on HEAD");
    return response(200);
  };
  const results = await auditRows([row("https://github.com/example/repo")], { fields, fetchImpl, concurrency: 1 });
  assert.deepEqual(results[0], { url: "https://github.com/example/repo", status: 200, result: "ok", method: "GET" });
  assert.deepEqual(calls, ["HEAD", "GET"]);
});

test("reports a source broken only after GET confirms 404", async () => {
  const results = await auditRows([row("https://github.com/example/missing")], {
    fields,
    fetchImpl: async () => response(404),
    concurrency: 1,
  });
  assert.equal(results[0].result, "broken");
  assert.equal(results[0].method, "GET");
});

test("revalidates redirects and refuses non-source destinations", async () => {
  const results = await auditRows([row("https://github.com/example/repo")], {
    fields,
    fetchImpl: async () => response(302, "https://127.0.0.1/private"),
    concurrency: 1,
  });
  assert.equal(results[0].result, "warning");
  assert.match(results[0].detail, /not approved/);
});

test("turns fetch failures into warnings and summarizes every class", async () => {
  const results = await auditRows([row("https://github.com/example/repo")], {
    fields,
    fetchImpl: async () => {
      throw new Error("network unavailable");
    },
    concurrency: 1,
  });
  assert.equal(results[0].result, "warning");
  assert.deepEqual(summarize([...results, { result: "ok" }, { result: "broken" }]), { ok: 1, warning: 1, broken: 1 });
});
