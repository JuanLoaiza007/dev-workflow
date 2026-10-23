# dev-workflow

Installable workflow: **Backlog + OpenSpec per story**. Skills stay decoupled; OpenSpec installs separately; the workflow enters any project's `AGENTS.md` via the `init-workflow` command.

This repo is also the source of an npm installer (`@juanloaiza007/dev-workflow`) that drops the `backlog`/`story` skills and the `init-workflow` command into the **global** directories of your local AI agents.

## What gets installed

| Artefact | Content |
|---|---|
| `skills/backlog/SKILL.md` | `/backlog`: slices an idea into small vertical user stories. Doesn't care what happens next. |
| `skills/story/SKILL.md` | `/story`: refines ONE story (criteria, mini plan, out of scope). Doesn't care what happens next. |
| `commands/<tool>/init-workflow.*` | command that installs/updates the workflow section in a project's `AGENTS.md` |

## Install the CLI (from this repo, no registry)

```sh
npm install -g github:juanloaiza007/dev-workflow
```

One-off, without installing:

```sh
npx -y github:juanloaiza007/dev-workflow
```

Requirements: Node.js ≥ 20.19.0. Private clones: use `git+ssh://git@github.com:juanloaiza007/dev-workflow.git` (your SSH key).

## Use the CLI

```sh
dev-workflow               # interactive: detect agents, pick with space
dev-workflow install       # same
dev-workflow install --tools claude,opencode   # non-interactive
dev-workflow update        # refresh installed agents to the current version
dev-workflow uninstall     # remove only the files we installed (manifest-driven)
dev-workflow list          # detection + install status per agent
```

Flags: `--all` (show every supported tool), `--dry-run`, `--json` (list), `--yes`.

The interactive picker supports typing to filter, ↑/↓ to move, space to toggle, enter to confirm.

### Supported agents

| id | Tool | Global skills | Global command |
|---|---|---|---|
| `agents` | Universal (shared `.agents` tree — Amp, Codex, Antigravity, Zed, GSD, …) | `~/.agents/skills/` | — |
| `claude` | Claude Code | `~/.claude/skills/` | `~/.claude/commands/` |
| `opencode` | OpenCode | `~/.config/opencode/skills/` | `~/.config/opencode/commands/` |
| `kilocode` | Kilo Code | `~/.kilo/skills/` | `~/.kilo/commands/` |
| `cursor` | Cursor | `~/.cursor/skills/` | `~/.cursor/commands/` |
| `github-copilot` | GitHub Copilot (CLI) | `~/.copilot/skills/` | — (IDE prompts are project-level) |
| `codex` | Codex | shares `agents` tree | — |
| `gemini` | Gemini CLI | `~/.gemini/skills/` | `~/.gemini/commands/` (`.toml`) |
| `qwen` | Qwen Code | `~/.qwen/skills/` | `~/.qwen/commands/` |
| `devin` | Devin Desktop (ex Windsurf) | `~/.codeium/windsurf/skills/` | `~/.codeium/windsurf/global_workflows/` |
| `cline` | Cline | `~/.cline/skills/` | — (workflows are project-level) |

Adding a tool = one row in `src/registry.js`.

Safety: the installer only ever adds/overwrites its own files, tracked in a `.dev-workflow.json` manifest per tool root. `uninstall` deletes exactly those paths; anything else is left alone. Nothing outside your home directory is touched; no shell commands are run.

## Manual install (same thing, by hand)

Skills, once per machine:

```sh
cp -r skills ~/.agents/skills/   # or the skills dir of any tool above
```

Command per host, per machine:

```sh
cp commands/opencode/init-workflow.md ~/.config/opencode/commands/init-workflow.md
cp commands/claude/init-workflow.md ~/.claude/commands/init-workflow.md
cp commands/kilo/init-workflow.md ~/.kilo/commands/init-workflow.md
```

OpenSpec installs separately, per project.

## Adopting the workflow in a project

1. Open a project and run `/init-workflow` (any tool where the command was installed).
2. The agent reads the project's `AGENTS.md`, detects conflicts (reports them, decides nothing), and adds/replaces the delimited `<!-- workflow:backlog-openspec -->` section.
3. Review the report; resolve conflicts by hand.
4. Then the flow: `/backlog` → `/story` → OpenSpec per story (proposal → spec → design → tasks → apply) → archive the spec.

## Updating

- New CLI version = new git tag + `npm update -g` (or `npm i -g github:juanloaiza007/dev-workflow`), then `dev-workflow update` in each affected machine.
- Changes to the workflow itself: edit `workflow/backlog-openspec.md` (single source of truth) and every `commands/<tool>/init-workflow.*` at the same time, bump the marker version and `package.json` version. `npm run check:sync` fails if they drift.

## Development

```sh
npm install
npm test            # node --test, sandboxed under MY_WORKFLOW_HOME
npm run check:sync  # embedded workflow block == workflow/backlog-openspec.md
```

Architecture notes live in `docs/installer.md`.
