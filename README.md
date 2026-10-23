# dev-workflow

> **Early development.** Not published to the npm registry; installed from the GitHub repo. API and layout can change without notice.

Backlog + OpenSpec per story, for your local AI agents. Installs two skills (`/backlog`, `/story`) and the `devflow-init` command into each agent's global directories. The `devflow-init` command drops the workflow section into any project's `AGENTS.md`.

## Install

Requirement: Node.js ≥ 20.19.0.

```sh
npm install -g github:juanloaiza007/dev-workflow
```

Newer npm versions refuse git dependencies by default (`EALLOWGIT: Fetching packages of type "git" have been disabled`). If that hits, re-enable git fetches for the install — temporary workaround until the package is on the registry:

```sh
npm install -g github:juanloaiza007/dev-workflow --allow-git=all
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
