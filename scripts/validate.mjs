import { pathToFileURL } from "node:url";

import { loadRows, loadSchema, schemaFields, sourceUrlFields } from "./data.mjs";

const sourceHosts = {
  github_url: new Set(["github.com"]),
  huggingface_url: new Set(["huggingface.co"]),
  paper_url: new Set(["arxiv.org", "github.com"]),
};
const approvedSourceHosts = new Set(Object.values(sourceHosts).flatMap((hosts) => [...hosts]));

export function isApprovedSourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && approvedSourceHosts.has(url.hostname);
  } catch {
    return false;
  }
}

export function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validateRows(rows, schema, today = new Date().toISOString().slice(0, 10)) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("Dataset must contain at least one record");

  const allowedFields = new Set(schemaFields(schema));
  const urlFields = sourceUrlFields(schema);
  const coverageFields = schemaFields(schema).filter((field) => schema.properties[field].$ref === "#/$defs/coverage");
  const coverageValues = new Set(schema.$defs.coverage.enum);
  const requiredStrings = schema.required.filter((field) => schema.properties[field].type === "string");
  const seen = new Set();

  for (const [index, row] of rows.entries()) {
    const line = index + 1;
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error(`Line ${line}: record must be an object`);

    const unexpectedFields = Object.keys(row).filter((field) => !allowedFields.has(field));
    if (unexpectedFields.length > 0) throw new Error(`Line ${line}: unexpected fields: ${unexpectedFields.join(", ")}`);
    const missingFields = schema.required.filter((field) => !(field in row));
    if (missingFields.length > 0) throw new Error(`Line ${line}: missing fields: ${missingFields.join(", ")}`);

    for (const field of requiredStrings) {
      if (typeof row[field] !== "string" || row[field].trim() === "") {
        throw new Error(`Line ${line}: ${field} must be a non-empty string`);
      }
    }
    if (seen.has(row.id)) throw new Error(`Line ${line}: duplicate id ${row.id}`);
    if (!new RegExp(schema.properties.id.pattern).test(row.id)) {
      throw new Error(`Line ${line}: id must be a lowercase kebab-case slug`);
    }
    seen.add(row.id);

    for (const field of coverageFields) {
      if (!coverageValues.has(row[field])) {
        throw new Error(`Line ${line}: ${field} must be ${[...coverageValues].join(", ")}`);
      }
    }
    for (const field of urlFields) {
      if (row[field] === null) continue;
      let url;
      try {
        url = new URL(row[field]);
      } catch {
        throw new Error(`Line ${line}: ${field} is not a valid URL`);
      }
      if (url.protocol !== "https:") throw new Error(`Line ${line}: ${field} must use HTTPS`);
      if (!sourceHosts[field]?.has(url.hostname)) {
        throw new Error(`Line ${line}: ${field} must use an approved first-party host`);
      }
      const schemaPattern = schema.properties[field].oneOf.find((option) => option.type === "string")?.pattern;
      if (!schemaPattern || !new RegExp(schemaPattern).test(row[field])) {
        throw new Error(`Line ${line}: ${field} must use its canonical approved first-party URL form`);
      }
    }
    if (!isCalendarDate(row.last_verified)) throw new Error(`Line ${line}: last_verified must be a valid YYYY-MM-DD date`);
    if (row.last_verified > today) throw new Error(`Line ${line}: last_verified cannot be in the future`);
    if (!urlFields.some((field) => row[field])) throw new Error(`Line ${line}: at least one first-party source URL is required`);
  }

  return rows;
}

async function main() {
  const [rows, schema] = await Promise.all([loadRows(), loadSchema()]);
  validateRows(rows, schema);
  console.log(`Validated ${rows.length} benchmark records.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
