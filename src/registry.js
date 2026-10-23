import path from "node:path";
import { home, appdata, platform } from "./paths.js";

const win = () => platform() === "win32";

/**
 * Agent registry. One row per supported tool: where its global skills and
 * commands live, and which packaged command file (if any) to install.
 * Adding a tool = adding one row.
 */
export const TOOLS = [
  {
    id: "agents",
    label: "Universal (shared .agents tree)",
    skillsDir: () => home(".agents", "skills"),
    commandsDir: null,
    commandFile: null,
    note: "shared by Amp, Codex, Antigravity, Zed, GSD and any tool that reads .agents/skills",
  },
  {
    id: "claude",
    label: "Claude Code",
    skillsDir: () => home(".claude", "skills"),
    commandsDir: () => home(".claude", "commands"),
    commandFile: "commands/claude/devflow-init.md",
  },
  {
    id: "opencode",
    label: "OpenCode",
    skillsDir: () => home(".config", "opencode", "skills"),
    commandsDir: () => home(".config", "opencode", "commands"),
    commandFile: "commands/opencode/devflow-init.md",
  },
  {
    id: "kilocode",
    label: "Kilo Code",
    skillsDir: () => home(".kilo", "skills"),
    commandsDir: () => home(".kilo", "commands"),
    commandFile: "commands/kilo/devflow-init.md",
  },
  {
    id: "cursor",
    label: "Cursor",
    skillsDir: () => (win() ? appdata("Cursor", "skills") : home(".cursor", "skills")),
    commandsDir: () => (win() ? appdata("Cursor", "commands") : home(".cursor", "commands")),
    commandFile: "commands/cursor/devflow-init.md",
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    skillsDir: () => home(".copilot", "skills"),
    commandsDir: null,
    commandFile: null,
    note: "CLI reads skills only; IDE prompts (.github/prompts) are project-level, out of scope",
  },
  {
    id: "codex",
    label: "Codex",
    skillsDir: null,
    commandsDir: null,
    commandFile: null,
    sharesSkillsWith: "agents",
    note: "reads .agents/skills, the same tree as Universal",
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    skillsDir: () => home(".gemini", "skills"),
    commandsDir: () => home(".gemini", "commands"),
    commandFile: "commands/gemini/devflow-init.toml",
  },
  {
    id: "qwen",
    label: "Qwen Code",
    skillsDir: () => home(".qwen", "skills"),
    commandsDir: () => home(".qwen", "commands"),
    commandFile: "commands/qwen/devflow-init.md",
  },
  {
    id: "devin",
    label: "Devin Desktop (ex Windsurf)",
    skillsDir: () => home(".codeium", "windsurf", "skills"),
    commandsDir: () => home(".codeium", "windsurf", "global_workflows"),
    commandFile: "commands/devin/devflow-init.md",
  },
  {
    id: "cline",
    label: "Cline",
    skillsDir: () => home(".cline", "skills"),
    commandsDir: null,
    commandFile: null,
    note: "no global commands; workflows are project-level (.clinerules)",
  },
];

/** The two skills every tool gets. */
export const SKILLS = [
  { name: "backlog", source: "skills/backlog/SKILL.md" },
  { name: "story", source: "skills/story/SKILL.md" },
];

export function getTool(id) {
  return TOOLS.find((t) => t.id === id);
}

/** Where this tool's global skills live; null if it has no skills tree. */
export function skillsRootFor(tool) {
  if (tool.skillsDir) return tool.skillsDir();
  if (tool.sharesSkillsWith) return skillsRootFor(getTool(tool.sharesSkillsWith));
  return null;
}

/** The tool root we manage: dirname(skillsRoot), where the manifest lives. */
export function rootFor(tool) {
  const skills = skillsRootFor(tool);
  return skills ? path.dirname(skills) : null;
}

/** Destination file name of this tool's command, already in its folder. */
export function commandDestination(tool) {
  return tool.commandFile ? path.basename(tool.commandFile) : null;
}
