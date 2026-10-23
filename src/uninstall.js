import fs from "node:fs";
import path from "node:path";
import { rootFor } from "./registry.js";
import { MANIFEST_FILE, readManifest } from "./detect.js";

function pruneEmptyUp(dir, stop) {
  while (dir.length > stop.length && dir.startsWith(stop)) {
    try {
      fs.rmdirSync(dir);
    } catch {
      return; // not empty (or locked) — stop pruning
    }
    dir = path.dirname(dir);
  }
}

/**
 * Remove exactly the files this tool's manifest claims, plus the manifest.
 * Leaves everything else alone. Returns the list of removed paths.
 */
export function uninstallTool(tool, { dryRun = false } = {}) {
  const root = rootFor(tool);
  const manifest = readManifest(tool);
  const removed = [];
  if (!root || !manifest) return removed;
  const rootAbs = path.resolve(root) + path.sep;
  for (const rel of Object.keys(manifest.installed ?? {})) {
    const abs = path.resolve(root, rel);
    if (!abs.startsWith(rootAbs)) continue; // path-traversal guard
    if (!fs.existsSync(abs)) continue;
    if (!dryRun) fs.rmSync(abs);
    removed.push(abs);
  }
  if (!dryRun) {
    for (const abs of removed) pruneEmptyUp(path.dirname(abs), root);
    const manifestPath = path.join(root, MANIFEST_FILE);
    if (fs.existsSync(manifestPath)) fs.rmSync(manifestPath);
  }
  return removed;
}
