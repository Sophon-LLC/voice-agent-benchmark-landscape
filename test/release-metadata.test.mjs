import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { isCalendarDate } from "../scripts/validate.mjs";

const root = new URL("../", import.meta.url);

test("keeps package, citation, and dataset-card release identities aligned", async () => {
  const [packageJson, citation, card] = await Promise.all([
    readFile(new URL("package.json", root), "utf8").then(JSON.parse),
    readFile(new URL("CITATION.cff", root), "utf8"),
    readFile(new URL("huggingface/README.md", root), "utf8"),
  ]);
  const citationVersion = citation.match(/^version: ([^\n]+)$/m)?.[1];
  const citationDoi = citation.match(/^doi: "?([^"\n]+)"?$/m)?.[1];
  const citationDate = citation.match(/^date-released: ([^\n]+)$/m)?.[1];
  const cardRelease = card.match(/current archived release is \[v([^\]]+)\]\(https:\/\/doi\.org\/([^\)]+)\)/i);
  const cardDate = card.match(/Archived release date: `([^`]+)`/i)?.[1];
  assert.equal(citationVersion, packageJson.version);
  assert.equal(cardRelease?.[1], packageJson.version);
  assert.equal(cardRelease?.[2], citationDoi);
  assert.equal(cardDate, citationDate);
  assert.equal(isCalendarDate(citationDate), true, "release date must be a real calendar date");
  assert.ok(citationDate <= new Date().toISOString().slice(0, 10), "release date cannot be in the future");
});
