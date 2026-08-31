import { readFile } from "node:fs/promises";

const path = new URL("../data/benchmarks.jsonl", import.meta.url);
const raw = await readFile(path, "utf8");
const lines = raw.trim().split("\n");
const rows = lines.map((line, index) => {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`Line ${index + 1} is not valid JSON: ${error.message}`);
  }
});

const coverageFields = [
  "audio_input",
  "audio_output",
  "multi_turn",
  "tool_use",
  "goal_completion",
  "computer_or_browser_action",
  "meeting_or_long_form",
  "real_time",
  "public_data",
];
const coverageValues = new Set(["yes", "no", "partial", "unclear"]);
const requiredStrings = [
  "id",
  "name",
  "primary_focus",
  "code_license",
  "data_license",
  "last_verified",
  "evidence_notes",
];
const urlFields = ["github_url", "huggingface_url", "paper_url"];
const seen = new Set();

for (const [index, row] of rows.entries()) {
  const line = index + 1;
  for (const field of requiredStrings) {
    if (typeof row[field] !== "string" || row[field].trim() === "") {
      throw new Error(`Line ${line}: ${field} must be a non-empty string`);
    }
  }
  if (seen.has(row.id)) throw new Error(`Line ${line}: duplicate id ${row.id}`);
  seen.add(row.id);

  for (const field of coverageFields) {
    if (!coverageValues.has(row[field])) {
      throw new Error(`Line ${line}: ${field} must be yes, no, partial, or unclear`);
    }
  }
  for (const field of urlFields) {
    if (row[field] !== null) {
      let url;
      try {
        url = new URL(row[field]);
      } catch {
        throw new Error(`Line ${line}: ${field} is not a valid URL`);
      }
      if (url.protocol !== "https:") {
        throw new Error(`Line ${line}: ${field} must use HTTPS`);
      }
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.last_verified)) {
    throw new Error(`Line ${line}: last_verified must use YYYY-MM-DD`);
  }
  if (!urlFields.some((field) => row[field])) {
    throw new Error(`Line ${line}: at least one first-party source URL is required`);
  }
}

console.log(`Validated ${rows.length} benchmark records.`);
