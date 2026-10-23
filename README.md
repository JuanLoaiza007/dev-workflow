# dev-workflow

Backlog + OpenSpec per story, for your local AI agents. Installs two skills (`/backlog`, `/story`) and the `devflow-init` command into each agent's global directories. The `devflow-init` command drops the workflow section into any project's `AGENTS.md`.

## Install

Requirement: Node.js ≥ 20.19.0.

```sh
npm install -g github:juanloaiza007/dev-workflow
```

Then install into your agents:

```sh
dev-workflow              # interactive: detects agents, pick with space
dev-workflow install --tools claude,opencode   # non-interactive
```

Supported agents: Claude Code, OpenCode, Kilo, Cursor, Copilot, Gemini, Qwen, Devin, Cline, and the shared `.agents` tree.

## Use in a project

1. Open a project and run `/devflow-init` in any agent where it was installed.
2. The agent reads the project's `AGENTS.md`, reports conflicts (decides nothing), and adds or replaces the delimited `<!-- workflow:backlog-openspec -->` section.
3. Then the flow: `/backlog` → `/story` → OpenSpec per story (proposal → spec → design → tasks → apply) → archive the spec.
