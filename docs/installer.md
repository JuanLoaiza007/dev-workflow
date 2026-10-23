# Installer design

`@juanloaiza007/dev-workflow` — global installer for the Backlog + OpenSpec workflow.

## Install model

- npm package, git-installed from `github:juanloaiza007/dev-workflow`. `package.json` `files` whitelist ships `bin/`, `src/`, `skills/`, `commands/`, `workflow/`. The canonical skill and command files are published as-is (no asset duplication).
- Bin: `dev-workflow`.
- Node ≥ 20.19.0, pure `fs` file copies — no shell, no symlinks, no sudo, nothing outside the user home.

## Layout

| Path | Job |
|---|---|
| `src/registry.js` | agent table: skills dir, commands dir, command source per tool |
| `src/paths.js` | `MY_WORKFLOW_HOME` override + per-OS resolution (`%APPDATA%` on Windows) |
| `src/package.js` | package root, name, version |
| `src/detect.js` | presence + installed state + manifest read |
| `src/install.js` | copy plan, statuses (installed/updated/up-to-date), manifest write |
| `src/uninstall.js` | manifest-driven removal with traversal guard + empty-dir pruning |
| `src/prompt.js` | `@clack/prompts` multi-select (filter, arrows, space) |
| `src/cli.js` | arg parsing, commands, dedupe of shared roots |
| `scripts/check-sync.js` | embedded workflow block == `workflow/backlog-openspec.md` |

## Manifest

Per tool root (e.g. `~/.claude/.dev-workflow.json`):

```json
{
  "tool": "claude",
  "package": "@juanloaiza007/dev-workflow",
  "version": "1.0.0",
  "installedAt": "2026-10-23T21:00:00.000Z",
  "installed": {
    "skills/backlog/SKILL.md": "skills/backlog/SKILL.md",
    "skills/story/SKILL.md": "skills/story/SKILL.md",
    "commands/devflow-init.md": "commands/claude/devflow-init.md"
  }
}
```

Keys are destinations relative to the tool root; values are sources inside the package.
`uninstall` resolves each key, rejects paths escaping the root, deletes the file, prunes empty dirs up to (not including) the root, and removes the manifest.

## Detection

- *Present*: the tool's config/skills parent dir exists.
- *Installed*: a manifest exists; per-file state comes from its `installed` map.
- *Outdated*: manifest version != package version.
- `agents` and `codex` share one physical tree (`~/.agents/skills`); the CLI dedupes by root and installs once.

## UI

Default `install` lists detected tools only (`--all` for everything). Rows are pre-selected when not installed or outdated. Typing filters, space toggles, enter confirms. No TTY → `--tools` is required.

## Decision log

- **Universal target** = the shared `.agents/skills` tree (OpenSpec "agents" style), matching the manual setup.
- **Copilot**: CLI is skills-only; `.github/prompts` is project-level → no global command.
- **OpenCode** global commands dir is plural `commands/` (docs), not `command/`.
- **Kilo**: skills at `~/.kilo/skills/`, commands at `~/.kilo/commands/` (current docs; `~/.kilocode/...` is legacy).
- **Gemini** is the only tool with TOML commands; **Qwen** migrated from TOML to Markdown.
- **Devin**: global workflows live in `~/.codeium/windsurf/global_workflows/` (note the name).
- **Cursor** global commands are legacy/best-effort; skills are the preferred path.
- Claude Code merged custom commands into skills; `~/.claude/commands/` still works and is kept for compatibility.

## Explicit non-goals

- Editing agent configs (settings.json, MCP, PATH, shellrc).
- Installing OpenSpec or running `openspec init` in projects.
- Writing into project `AGENTS.md` files (that is `/devflow-init` per project).
- Shell completions, brew/nix/deno installs, native installers.
- Telemetry, login, accounts.
