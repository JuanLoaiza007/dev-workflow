import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  TOOLS,
  SKILLS,
  getTool,
  skillsRootFor,
  rootFor,
  commandDestination,
} from "../src/registry.js";
import { asset } from "../src/package.js";

test("roster has the 11 planned tools, in order", () => {
  assert.deepEqual(
    TOOLS.map((t) => t.id),
    [
      "agents",
      "claude",
      "opencode",
      "kilocode",
      "cursor",
      "github-copilot",
      "codex",
      "gemini",
      "qwen",
      "devin",
      "cline",
    ]
  );
});

test("tool ids are unique", () => {
  assert.equal(new Set(TOOLS.map((t) => t.id)).size, TOOLS.length);
});

test("codex shares the agents tree", () => {
  assert.equal(skillsRootFor(getTool("codex")), skillsRootFor(getTool("agents")));
});

test("every tool resolves a skills root", () => {
  for (const t of TOOLS) {
    assert.ok(skillsRootFor(t), `${t.id} must resolve a skills dir`);
  }
});

test("every packed skill source exists", () => {
  for (const s of SKILLS) {
    assert.ok(fs.existsSync(asset(s.source)), `missing ${s.source}`);
  }
});

test("tools with a commands dir declare an existing command source", () => {
  for (const t of TOOLS) {
    if (!t.commandsDir) continue;
    assert.ok(t.commandFile, `${t.id} has commandsDir but no commandFile`);
    assert.ok(fs.existsSync(asset(t.commandFile)), `${t.id}: missing ${t.commandFile}`);
  }
});

test("commandDestination returns the file name only", () => {
  assert.equal(commandDestination(getTool("claude")), "init-workflow.md");
  assert.equal(commandDestination(getTool("gemini")), "init-workflow.toml");
  assert.equal(commandDestination(getTool("github-copilot")), null); // skills only
});

test("rootFor nests under the tool config root", () => {
  process.env.MY_WORKFLOW_HOME = "/tmp/fake-home";
  try {
    assert.equal(rootFor(getTool("claude")), "/tmp/fake-home/.claude");
    assert.equal(rootFor(getTool("agents")), "/tmp/fake-home/.agents");
    assert.equal(rootFor(getTool("opencode")), "/tmp/fake-home/.config/opencode");
  } finally {
    delete process.env.MY_WORKFLOW_HOME;
  }
});
