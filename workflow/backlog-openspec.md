# Workflow: Backlog + OpenSpec per story

Canonical AGENTS.md section. This file is the single source of truth; the `init-workflow` command embeds a copy. Update both and bump the version.

```markdown
<!-- workflow:backlog-openspec v1.0.0 -->
## Workflow: Backlog + OpenSpec per story

Requirement (minimum): OpenSpec installed in this project.

The user invokes the modes, never the agent:

1. `/backlog` slices the idea into small vertical user stories, each with verifiable end-to-end value → `specs/backlog.md` (versioned, disposable).
2. `/story` refines ONE story into 3-5 acceptance criteria, a 5-bullet mini plan and an explicit **out of scope** → `specs/<HU-ID>/story.md` (versioned, disposable; `<HU-ID>` = `HU-001-<slug>`).
3. OpenSpec runs per story: proposal → spec → design → tasks → apply, scoped to that story. The story is the input of the change.
4. When the change closes, archive the spec in OpenSpec's persistent directory. That archive is the system's living documentation.
5. The story's `plan.md` and the backlog are disposable. Delete the backlog with its own commit once no story remains.

Rules:
- One story = one vertical slice with verifiable end-to-end value.
- Out of scope is mandatory: it stops the agent from filling gaps.
- The user invokes modes (backlog, story, apply, archive); the agent never switches modes on its own.
- Alert when a change grows too large or interferes with other backlog stories.
<!-- /workflow:backlog-openspec -->
```
