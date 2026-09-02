import assert from "node:assert/strict";
import test from "node:test";

import { loadSchema } from "../scripts/data.mjs";
import { isApprovedSourceUrl, validateRows } from "../scripts/validate.mjs";

const schema = await loadSchema();
const valid = {
  id: "example-bench",
  name: "Example Bench",
  primary_focus: "Example evaluation",
  audio_input: "yes",
  audio_output: "no",
  multi_turn: "partial",
  tool_use: "yes",
  goal_completion: "no",
  computer_or_browser_action: "no",
  meeting_or_long_form: "no",
  real_time: "unclear",
  public_data: "yes",
  code_license: "MIT",
  data_license: "MIT",
  github_url: "https://github.com/example/bench",
  huggingface_url: null,
  paper_url: null,
  last_verified: "2026-09-02",
  evidence_notes: "The first-party repository documents the evaluation scope.",
};

test("accepts a complete schema-compatible record", () => {
  assert.deepEqual(validateRows([valid], schema, "2026-09-02"), [valid]);
});

test("rejects missing, unexpected, and duplicate fields", () => {
  const { name: _name, ...missing } = valid;
  assert.throws(() => validateRows([missing], schema, "2026-09-02"), /missing fields: name/);
  assert.throws(() => validateRows([{ ...valid, extra: true }], schema, "2026-09-02"), /unexpected fields: extra/);
  assert.throws(() => validateRows([valid, valid], schema, "2026-09-02"), /duplicate id/);
});

test("rejects invalid slugs and coverage values", () => {
  assert.throws(() => validateRows([{ ...valid, id: "Not Valid" }], schema, "2026-09-02"), /kebab-case slug/);
  assert.throws(() => validateRows([{ ...valid, tool_use: "maybe" }], schema, "2026-09-02"), /tool_use must be/);
});

test("rejects impossible and future verification dates", () => {
  assert.throws(() => validateRows([{ ...valid, last_verified: "2026-02-31" }], schema, "2026-09-02"), /valid YYYY-MM-DD date/);
  assert.throws(() => validateRows([{ ...valid, last_verified: "2026-99-99" }], schema, "2026-09-02"), /valid YYYY-MM-DD date/);
  assert.throws(() => validateRows([{ ...valid, last_verified: "2026-09-03" }], schema, "2026-09-02"), /cannot be in the future/);
  assert.doesNotThrow(() => validateRows([{ ...valid, last_verified: "2024-02-29" }], schema, "2026-09-02"));
});

test("requires HTTPS sources on approved first-party hosts", () => {
  assert.throws(() => validateRows([{ ...valid, github_url: "http://github.com/example/bench" }], schema, "2026-09-02"), /must use HTTPS/);
  assert.throws(() => validateRows([{ ...valid, github_url: "https://127.0.0.1/private" }], schema, "2026-09-02"), /approved first-party host/);
  assert.throws(() => validateRows([{ ...valid, github_url: "https://GitHub.com/example/bench" }], schema, "2026-09-02"), /canonical approved/);
  assert.throws(() => validateRows([{ ...valid, github_url: "https://github.com:443/example/bench" }], schema, "2026-09-02"), /canonical approved/);
  assert.throws(() => validateRows([{ ...valid, github_url: null }], schema, "2026-09-02"), /at least one first-party source URL/);
  assert.equal(isApprovedSourceUrl("https://github.com/example/bench"), true);
  assert.equal(isApprovedSourceUrl("https://localhost/private"), false);
});
