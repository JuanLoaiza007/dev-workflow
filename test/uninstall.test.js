import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getTool } from "../src/registry.js";
import { installTool } from "../src/install.js";
import { uninstallTool } from "../src/uninstall.js";
import { readManifest, MANIFEST_FILE } from "../src/detect.js";

let tmp;
test.beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dev-workflow-uninstall-"));
  process.env.MY_WORKFLOW_HOME = tmp;
});
test.afterEach(() => {
  delete process.env.MY_WORKFLOW_HOME;
  fs.rmSync(tmp, { recursive: true, force: true });
});

function installedDest(rel) {
  return path.join(tmp, ".claude", rel);
}

test("uninstall removes exactly the owned files and keeps unrelated ones", () => {
  const tool = getTool("claude");
  installTool(tool);
  const foreign = installedDest("commands/other.md");
  fs.writeFileSync(foreign, "user file");
  const removed = uninstallTool(tool);
  assert.equal(removed.length, 3);
  assert.ok(removed.includes(installedDest("skills/backlog/SKILL.md")));
  assert.ok(removed.includes(installedDest("skills/story/SKILL.md")));
  assert.ok(removed.includes(installedDest("commands/devflow-init.md")));
  assert.ok(fs.existsSync(foreign), "unrelated file must survive");
  assert.ok(!fs.existsSync(path.join(tmp, ".claude", MANIFEST_FILE)));
  assert.equal(readManifest(tool), null);
  assert.ok(fs.existsSync(path.join(tmp, ".claude")), "tool root is preserved");
});

test("uninstall prunes empty skills dirs but not the tool root", () => {
  const tool = getTool("claude");
  installTool(tool);
  uninstallTool(tool);
  assert.ok(!fs.existsSync(installedDest("skills")));
  assert.ok(fs.existsSync(path.join(tmp, ".claude")));
});

test("uninstall dry-run removes nothing", () => {
  const tool = getTool("claude");
  installTool(tool);
  const removed = uninstallTool(tool, { dryRun: true });
  assert.equal(removed.length, 3);
  assert.ok(fs.existsSync(installedDest("skills/backlog/SKILL.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".claude", MANIFEST_FILE)));
});

test("uninstall without a manifest is a no-op", () => {
  const tool = getTool("claude");
  assert.deepEqual(uninstallTool(tool), []);
});

test("uninstall ignores entries escaping the tool root", () => {
  const tool = getTool("claude");
  installTool(tool);
  const manifest = readManifest(tool);
  manifest.installed["../escape.md"] = "skills/backlog/SKILL.md";
  fs.writeFileSync(path.join(tmp, ".claude", MANIFEST_FILE), JSON.stringify(manifest));
  const victim = path.join(tmp, "escape.md");
  fs.writeFileSync(victim, "x");
  const removed = uninstallTool(tool);
  assert.ok(!removed.includes(victim));
  assert.ok(fs.existsSync(victim));
  assert.equal(removed.length, 3);
});
