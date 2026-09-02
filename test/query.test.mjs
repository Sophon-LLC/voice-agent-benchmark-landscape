import assert from "node:assert/strict";
import test from "node:test";

import { parseArgs, runQuery } from "../scripts/query.mjs";

const rows = [
  { name: "Meeting", audio_input: "yes", tool_use: "no", meeting_or_long_form: "yes", github_url: null },
  { name: "Agent", audio_input: "yes", tool_use: "yes", meeting_or_long_form: "no", github_url: "https://example.com/agent" },
];
const schema = {
  properties: Object.fromEntries(["name", "audio_input", "tool_use", "meeting_or_long_form", "github_url"].map((field) => [field, {}])),
};

test("combines repeated exact-match filters", () => {
  const options = parseArgs(["--where", "audio_input=yes", "--where", "tool_use=yes", "--fields", "name,tool_use"]);
  assert.match(runQuery(rows, options, schema), /\| Agent \| yes \|/);
  assert.doesNotMatch(runQuery(rows, options, schema), /Meeting/);
});

test("supports null URL filters and JSON output", () => {
  const options = parseArgs(["--where", "github_url=null", "--fields", "name,github_url", "--format", "json"]);
  assert.deepEqual(JSON.parse(runQuery(rows, options, schema)), [{ name: "Meeting", github_url: null }]);
});

test("escapes markdown cell delimiters", () => {
  const options = parseArgs(["--fields", "name"]);
  assert.match(runQuery([{ name: "A | B" }], options, schema), /A \\| B/);
});

test("rejects unknown fields and malformed filters", () => {
  const unknown = parseArgs(["--fields", "missing"]);
  assert.throws(() => runQuery(rows, unknown, schema), /Unknown field: missing/);
  const malformed = parseArgs(["--where", "audio_input", "--fields", "name"]);
  assert.throws(() => runQuery(rows, malformed, schema), /field=value/);
});

test("uses the schema contract even when the dataset is empty", () => {
  const options = parseArgs(["--fields", "name"]);
  assert.equal(runQuery([], options, schema), "| name |\n| --- |");
});

test("emits JSONL in explicit sort order", () => {
  const options = parseArgs(["--fields", "name", "--format", "jsonl", "--sort", "name"]);
  assert.equal(runQuery(rows, options, schema), '{"name":"Agent"}\n{"name":"Meeting"}');
});

test("quotes CSV record separators and neutralizes spreadsheet formulas", () => {
  const options = parseArgs(["--fields", "name", "--format", "csv"]);
  const cases = [
    ["A,B", 'name\n"A,B"'],
    ['A"B', 'name\n"A""B"'],
    ["A\nB", 'name\n"A\nB"'],
    ["A\rB", 'name\n"A\rB"'],
    ["=HYPERLINK(\"https://example.com\")", 'name\n"\'=HYPERLINK(""https://example.com"")"'],
    ["  =1+1", "name\n'  =1+1"],
    ["\t@SUM(1,1)", 'name\n"\'\t@SUM(1,1)"'],
    ["\u001b-1+1", "name\n'\u001b-1+1"],
  ];
  for (const [name, expected] of cases) assert.equal(runQuery([{ name }], options, schema), expected);
});
