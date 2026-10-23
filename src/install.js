import fs from "node:fs";
import path from "node:path";
import { asset, PACKAGE_NAME, PACKAGE_VERSION } from "./package.js";
import { SKILLS, skillsRootFor, rootFor, commandDestination } from "./registry.js";
import { MANIFEST_FILE } from "./detect.js";

/** Compute the copy operations for one tool (no writes). */
export function planInstall(tool) {
  const ops = [];
  const skillsDir = skillsRootFor(tool);
  const root = rootFor(tool);
  const add = (source, dest) =>
    ops.push({ source, dest, rel: path.relative(root, dest) });
  for (const s of SKILLS) add(s.source, path.join(skillsDir, s.name, "SKILL.md"));
  if (tool.commandFile) {
    add(tool.commandFile, path.join(tool.commandsDir(), commandDestination(tool)));
  }
  return ops;
}

/**
 * Status per operation:
 *  - "installed"  file did not exist
 *  - "updated"    file existed but was different
 *  - "up-to-date" file existed with identical content
 */
export function opStatus(op) {
  if (!fs.existsSync(op.dest)) return "installed";
  const a = fs.readFileSync(op.dest);
  const b = fs.readFileSync(asset(op.source));
  return a.equals(b) ? "up-to-date" : "updated";
}

/**
 * Install (or update) one tool. Returns the operations with their status.
 * Writes nothing when dryRun is true.
 */
export function installTool(tool, { dryRun = false } = {}) {
  const ops = planInstall(tool).map((op) => ({ ...op, status: opStatus(op) }));
  if (dryRun) return ops;
  for (const op of ops) {
    if (op.status === "up-to-date") continue;
    fs.mkdirSync(path.dirname(op.dest), { recursive: true });
    fs.copyFileSync(asset(op.source), op.dest);
  }
  const root = rootFor(tool);
  const manifest = {
    tool: tool.id,
    package: PACKAGE_NAME,
    version: PACKAGE_VERSION,
    installedAt: new Date().toISOString(),
    installed: Object.fromEntries(ops.map((op) => [op.rel, op.source])),
  };
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + "\n");
  return ops;
}
