import { readFile } from "node:fs/promises";

export const dataPath = new URL("../data/benchmarks.jsonl", import.meta.url);
export const schemaPath = new URL("../data/schema.json", import.meta.url);

export async function loadRows() {
  const raw = await readFile(dataPath, "utf8");
  if (raw.trim() === "") return [];
  return raw.trim().split("\n").map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Line ${index + 1} is not valid JSON: ${error.message}`);
    }
  });
}

export async function loadSchema() {
  return JSON.parse(await readFile(schemaPath, "utf8"));
}

export function schemaFields(schema) {
  return Object.keys(schema.properties);
}

export function sourceUrlFields(schema) {
  return schemaFields(schema).filter((field) => schema.properties[field]["x-source-url"] === true);
}
