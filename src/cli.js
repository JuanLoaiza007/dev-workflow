import { TOOLS, getTool, rootFor } from "./registry.js";
import { detectAll } from "./detect.js";
import { installTool } from "./install.js";
import { uninstallTool } from "./uninstall.js";
import { PACKAGE_VERSION } from "./package.js";
import * as ui from "./prompt.js";

const splitIds = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function parseArgs(argv) {
  const out = { _: [], tools: null, all: false, dryRun: false, json: false, yes: false };
  const value = (i, flag) => {
    const inline = argv[i];
    if (inline.includes("=")) return inline.slice(inline.indexOf("=") + 1);
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("-")) throw new Error(`Missing value for ${flag}`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--tools" || a.startsWith("--tools=")) {
      out.tools = splitIds(value(i, "--tools"));
      if (a === "--tools") i++;
    } else if (a === "--all") out.all = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--json") out.json = true;
    else if (a === "--yes" || a === "-y") out.yes = true;
    else if (a === "--version" || a === "-v") out.version = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else if (a.startsWith("-")) throw new Error(`Unknown flag: ${a}`);
    else out._.push(a);
  }
  return out;
}

function assertKnownIds(ids) {
  const unknown = ids.filter((id) => !getTool(id));
  if (unknown.length) {
    throw new Error(
      `Unknown tool id(s): ${unknown.join(", ")}\nValid ids: ${TOOLS.map((t) => t.id).join(", ")}`
    );
  }
}

/** One pass per physical root: agents + codex share the same tree. */
function dedupeById(ids) {
  const seen = new Set();
  const tools = [];
  for (const id of ids) {
    const tool = getTool(id);
    const key = rootFor(tool);
    if (seen.has(key)) continue;
    seen.add(key);
    tools.push(tool);
  }
  return tools;
}

function hintFor(state) {
  if (!state.present) return "not detected";
  if (state.outdated) return `installed v${state.version} -> v${PACKAGE_VERSION}`;
  if (state.version) return `installed v${state.version}`;
  return "not installed";
}

async function resolveSelection(args, states) {
  const shown = args.all ? states : states.filter((s) => s.present);
  if (shown.length === 0) {
    throw new Error("No agents detected on this machine. Pass --all to see every supported tool.");
  }
  const entries = shown.map((s) => ({
    value: s.tool.id,
    label: s.tool.label,
    hint: hintFor(s),
    selected: !s.version || s.outdated,
  }));
  return ui.chooseTools(entries, "Install the workflow into which agents?");
}

async function cmdInstall(args) {
  const states = detectAll();
  const ids = args.tools ?? (await resolveSelection(args, states));
  assertKnownIds(ids);
  const tools = dedupeById(ids);
  ui.intro("dev-workflow");
  for (const tool of tools) {
    if (tool.commandFile) {
      ui.logStep(`[${tool.id}] ${tool.label}`);
    } else {
      ui.logInfo(`[${tool.id}] ${tool.label} — skills only${tool.note ? ` (${tool.note})` : ""}`);
    }
    const ops = installTool(tool, { dryRun: args.dryRun });
    for (const op of ops) {
      const mark = op.status === "installed" ? "+" : op.status === "updated" ? "~" : "=";
      ui.logMessage(`  ${mark} ${op.rel}  (${op.status})`);
    }
    ui.logMessage(`  manifest -> ${rootFor(tool)}/.dev-workflow.json`);
  }
  if (args.dryRun) ui.logMessage("dry-run: nothing written");
  ui.logSuccess(`done (${args.dryRun ? "dry-run" : `v${PACKAGE_VERSION}`})`);
  return 0;
}

async function cmdUpdate(args) {
  const states = detectAll();
  const filters = args.tools;
  if (filters) assertKnownIds(filters);
  const tools = dedupeById(
    states
      .filter((s) => s.manifest && (!filters || filters.includes(s.tool.id)))
      .map((s) => s.tool.id)
  );
  if (tools.length === 0) {
    ui.logMessage(`Nothing to update — no installed agents${filters ? ` for ${filters.join(", ")}` : ""}.`);
    return 0;
  }
  ui.intro("dev-workflow update");
  for (const tool of tools) {
    ui.logStep(`[${tool.id}] ${tool.label}`);
    const ops = installTool(tool, { dryRun: args.dryRun });
    for (const op of ops) {
      if (op.status === "up-to-date") continue;
      const mark = op.status === "installed" ? "+" : "~";
      ui.logMessage(`  ${mark} ${op.rel}  (${op.status})`);
    }
  }
  if (args.dryRun) ui.logMessage("dry-run: nothing written");
  return 0;
}

async function cmdUninstall(args) {
  const states = detectAll();
  const withManifest = states.filter((s) => s.manifest);
  const ids =
    args.tools ??
    (withManifest.length
      ? await ui.chooseTools(
          withManifest.map((s) => ({
            value: s.tool.id,
            label: s.tool.label,
            hint: `v${s.version}`,
            selected: false,
          })),
          "Remove the workflow from which agents?"
        )
      : []);
  assertKnownIds(ids);
  const tools = dedupeById(ids);
  ui.intro("dev-workflow uninstall");
  for (const tool of tools) {
    const removed = uninstallTool(tool, { dryRun: args.dryRun });
    ui.logStep(`[${tool.id}] ${tool.label}`);
    for (const file of removed) ui.logMessage(`  - ${file}`);
    if (removed.length === 0) ui.logMessage("  (nothing to remove)");
  }
  if (args.dryRun) ui.logMessage("dry-run: nothing deleted");
  return 0;
}

function cmdList(args) {
  const states = detectAll();
  if (args.json) {
    process.stdout.write(JSON.stringify(states, null, 2) + "\n");
    return 0;
  }
  ui.intro("dev-workflow list");
  const rows = states.map((s) => {
    const status = !s.present
      ? "not detected"
      : s.outdated
        ? `installed v${s.version} -> v${PACKAGE_VERSION}`
        : s.version
          ? `installed v${s.version}`
          : "not installed";
    return `  ${s.tool.id.padEnd(14)} ${s.tool.label.padEnd(28)} ${status}`;
  });
  ui.logMessage(rows.join("\n"));
  return 0;
}

const HELP = `dev-workflow — Backlog + OpenSpec per story installer

Usage:
  dev-workflow [install]      interactive install (detected agents)
  dev-workflow update         refresh installed agents to current version
  dev-workflow uninstall      remove only the files we installed
  dev-workflow list           show detection + install status per agent
  dev-workflow --version

Flags:
  --tools <id1,id2>   non-interactive; ids: ${TOOLS.map((t) => t.id).join(", ")}
  --all               show every supported tool, detected or not
  --dry-run           compute actions, write nothing
  --json              machine-readable output (list)
  --yes, -y           skip interactive confirmations
`;

export async function main(argv) {
  const args = parseArgs(argv);
  if (args.version) {
    process.stdout.write(PACKAGE_VERSION + "\n");
    return 0;
  }
  if (args.help) {
    process.stdout.write(HELP);
    return 0;
  }
  const cmd = args._[0] ?? "install";
  switch (cmd) {
    case "install":
      return cmdInstall(args);
    case "update":
      return cmdUpdate(args);
    case "uninstall":
      return cmdUninstall(args);
    case "list":
      return cmdList(args);
    default:
      throw new Error(`Unknown command: ${cmd}\n\n${HELP}`);
  }
}
