import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { loadRows } from "../scripts/data.mjs";

const root = new URL("../", import.meta.url);
const npmOptions = {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env, npm_config_loglevel: "notice" },
};

function documentedArgs(text) {
  const command = text.replace(/\\\r?\n\s*/g, " ").match(
    /^\s*(npm run(?: --silent)? query --[^\n]* --format json)\s*$/m,
  )?.[1];
  assert.ok(command, "documentation must include a runnable JSON query example");
  return command.split(/\s+/).slice(1);
}

const readme = await readFile(new URL("README.md", root), "utf8");
const cliHelp = execFileSync("npm", ["run", "--silent", "query", "--", "--help"], npmOptions);
const candidates = (await loadRows()).filter((row) => row.computer_or_browser_action === "yes");
assert.ok(candidates.length > 0, "the documented example must return useful results");

for (const [source, text] of [["README", readme], ["CLI help", cliHelp]]) {
  const args = documentedArgs(text);
  for (const format of ["json", "jsonl", "csv"]) {
    test(`${source} npm example emits clean ${format} stdout`, () => {
      const exportArgs = [...args];
      exportArgs[exportArgs.indexOf("--format") + 1] = format;
      if (format === "csv") exportArgs.push("--fields", "id");
      const stdout = execFileSync("npm", exportArgs, npmOptions);

      if (format === "csv") {
        const [header, ...ids] = stdout.trimEnd().split("\n");
        assert.equal(header, "id");
        assert.deepEqual(ids.sort(), candidates.map((row) => row.id).sort());
      } else {
        const rows = format === "json"
          ? JSON.parse(stdout)
          : stdout.trimEnd().split("\n").map((line) => JSON.parse(line));
        assert.deepEqual(rows.map((row) => row.name).sort(), candidates.map((row) => row.name).sort());
        assert.ok(rows.every((row) => row.computer_or_browser_action === "yes"));
      }
    });
  }
}
