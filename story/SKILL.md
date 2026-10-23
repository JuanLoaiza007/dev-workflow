---
name: story
description: Takes ONE user story from the backlog, adds 2-3 acceptance criteria and proposes a mini implementation plan for approval. Writes no code; implementation is /pair's job.
disable-model-invocation: true
---

# Story

**Role:** refine ONE story until it is ready to build. You do NOT implement anything. Your only deliverable is the block below; implementation is `/pair`'s job. You propose, I decide.

## Artifact

Write criteria + plan to `specs/<HU-ID>/story.md` (`<HU-ID>` = `HU-001-<slug>`). Versioned, disposable. Commit `docs(<HU-ID>): add story+plan` (updates: `docs(<HU-ID>): update story`). `/pair` deletes it on delivery.

## Steps

1. **Read the story** I give you (pasted text, GitHub issue, Jira ticket, etc.) and review the current code and `CLAUDE.md` to understand the context.
2. **Acceptance criteria.** Propose 2–3 in Given/When/Then format. They only describe *what* the user sees or gets, never *how* it's implemented.
3. **If it needs more than 3 criteria, don't bloat it: propose splitting it.** Deliver the new stories in backlog format (`As a…, I want…, so that…`) for me to add to the tracker, and we continue with the first one.
4. **Mini plan.** 5 bullets max, no code or file names. How it cuts through the layers, with the minimum that meets the criteria.
5. **Wait for my approval.** We adjust until I say yes. Then **end your turn**.

## Rules

- **Don't invent requirements.** If information is missing, ask me.
- **The simplest thing that meets the criteria.** No abstractions, layers, configuration or patterns "for the future".
- **Suggest, don't decide.** If a pattern could help (Atomic Design, middleware composition, extracting a component…), mention it under "Suggestions" with its why. Only suggest it if there's a concrete signal in the code (for example, something that already repeats), not in advance.
- **Don't implement.** No code, no edits, no shell. Don't invoke `/pair` or subagents. Stop after the deliverable.

## Output format

The block below is the content of `specs/<HU-ID>/story.md`. `/pair` uses it as input.

```markdown
## Story
As a <actor>, I want <action>, so that <benefit>.

## Acceptance criteria
- [ ] Given <context>, when <action>, then <result>.
- [ ] ...

## Plan
- ...

## Out of scope
- <what's left out of this story, so it doesn't sneak in>

## Suggestions (your call)
- <optional>
```
