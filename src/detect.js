import fs from "node:fs";
import path from "node:path";
import { SKILLS, TOOLS, skillsRootFor, rootFor, commandDestination } from "./registry.js";
import { PACKAGE_VERSION } from "./package.js";

/** Manifest file written at each tool root; it lists exactly the files we own. */
export const MANIFEST_FILE = ".dev-workflow.json";

export function readManifest(tool) {
  const root = rootFor(tool);
  if (!root) return null;
  const file = path.join(root, MANIFEST_FILE);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** Per-file install state for one tool. */
export function toolState(tool) {
  const skillsDir = skillsRootFor(tool);
  const commandsDir = tool.commandsDir ? tool.commandsDir() : null;
  const present =
    (skillsDir && fs.existsSync(path.dirname(skillsDir))) ||
    (commandsDir && fs.existsSync(path.dirname(commandsDir)));
  const manifest = readManifest(tool);
  const claimed = new Set(Object.keys(manifest?.installed ?? {}));
  const installed = {
    skills: Object.fromEntries(
      SKILLS.map((s) => [s.name, claimed.has(path.join("skills", s.name, "SKILL.md"))])
    ),
    command: tool.commandFile ? claimed.has(path.join("commands", commandDestination(tool))) : false,
  };
  const version = manifest?.version ?? null;
  return {
    tool,
    present,
    installed,
    version,
    outdated: version !== null && version !== PACKAGE_VERSION,
    manifest,
  };
}

export function detectAll() {
  return TOOLS.map(toolState);
}
