import { pathToFileURL } from "node:url";

import { loadRows, loadSchema, schemaFields } from "./data.mjs";

export function parseArgs(argv) {
  const options = {
    format: "markdown",
    fields: ["name", "primary_focus", "audio_input", "audio_output", "multi_turn", "tool_use", "goal_completion", "computer_or_browser_action", "meeting_or_long_form", "real_time", "public_data"],
    where: [],
    sort: "name",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--format") options.format = argv[++index];
    else if (argument === "--fields") options.fields = argv[++index]?.split(",").filter(Boolean);
    else if (argument === "--where") options.where.push(argv[++index]);
    else if (argument === "--sort") options.sort = argv[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }

  if (!options.help && !["markdown", "json", "jsonl", "csv"].includes(options.format)) {
    throw new Error("--format must be markdown, json, jsonl, or csv");
  }
  if (!options.help && (!options.fields || options.fields.length === 0)) {
    throw new Error("--fields must contain at least one field");
  }
  return options;
}

function parseFilter(value) {
  const separator = value?.indexOf("=") ?? -1;
  if (separator < 1) throw new Error("--where must use field=value");
  const field = value.slice(0, separator);
  const expected = value.slice(separator + 1);
  if (!expected) throw new Error("--where must use a non-empty value");
  return { field, expected: expected === "null" ? null : expected };
}

function assertFields(schema, fields) {
  const known = new Set(schemaFields(schema));
  for (const field of fields) {
    if (!known.has(field)) throw new Error(`Unknown field: ${field}`);
  }
}

function display(value) {
  return value === null ? "" : String(value);
}

function markdown(rows, fields) {
  const escape = (value) => display(value).replaceAll("\\", "\\\\").replaceAll("|", "\\|").replace(/[\r\n]+/g, " ");
  const header = `| ${fields.join(" | ")} |`;
  const divider = `| ${fields.map(() => "---").join(" | ")} |`;
  return [header, divider, ...rows.map((row) => `| ${fields.map((field) => escape(row[field])).join(" | ")} |`)].join("\n");
}

function csv(rows, fields) {
  const escape = (value) => {
    let text = display(value);
    if (/^[\u0000-\u0020]*[=+\-@]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [fields.join(","), ...rows.map((row) => fields.map((field) => escape(row[field])).join(","))].join("\n");
}

export function runQuery(rows, options, schema) {
  const filters = options.where.map(parseFilter);
  assertFields(schema, [...options.fields, options.sort, ...filters.map(({ field }) => field)]);

  const filtered = rows.filter((row) => filters.every(({ field, expected }) => row[field] === expected));
  filtered.sort((left, right) => display(left[options.sort]).localeCompare(display(right[options.sort])));

  const project = (row) => Object.fromEntries(options.fields.map((field) => [field, row[field]]));
  if (options.format === "json") return JSON.stringify(filtered.map(project), null, 2);
  if (options.format === "jsonl") return filtered.map((row) => JSON.stringify(project(row))).join("\n");
  if (options.format === "csv") return csv(filtered, options.fields);
  return markdown(filtered, options.fields);
}

export function help() {
  return `Query the Voice Agent Benchmark Landscape without installing dependencies.

Usage:
  npm run query -- [options]

Options:
  --where field=value     Exact-match filter; repeat to combine filters
  --fields a,b,c          Output fields
  --sort field            Sort field (default: name)
  --format format         markdown, json, jsonl, or csv
  -h, --help              Show this help

Examples:
  npm run query -- --where audio_input=yes --where tool_use=yes
  npm run query -- --where meeting_or_long_form=yes --fields name,github_url,huggingface_url
  npm run query -- --where computer_or_browser_action=yes --format json`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(help());
    return;
  }
  const [rows, schema] = await Promise.all([loadRows(), loadSchema()]);
  console.log(runQuery(rows, options, schema));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
