import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getTool } from "../src/registry.js";
import { installTool, planInstall, opStatus } from "../src/install.js";
import { readManifest, MANIFEST_FILE } from "../src/detect.js";

let tmp;
test.beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dev-workflow-install-"));
  process.env.MY_WORKFLOW_HOME = tmp;
});
test.afterEach(() => {
  delete process.env.MY_WORKFLOW_HOME;
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("install claude writes skills + command + manifest", () => {
  const tool = getTool("claude");
  const ops = installTool(tool);
  assert.equal(ops.length, 3);
  for (const op of ops) assert.ok(fs.existsSync(op.dest), `missing ${op.dest}`);
  assert.equal(ops.filter((o) => o.status === "installed").length, 3);
  assert.equal(ops[0].rel, "skills/backlog/SKILL.md");
  assert.equal(ops[1].rel, "skills/story/SKILL.md");
  assert.equal(ops[2].rel, "commands/init-workflow.md");
  const manifest = readManifest(tool);
  assert.equal(manifest.tool, "claude");
  assert.equal(manifest.installed["commands/init-workflow.md"], "commands/claude/init-workflow.md");
  assert.ok(fs.existsSync(path.join(tmp, ".claude", MANIFEST_FILE)));
});

test("installed skill content equals the packaged source", () => {
  const tool = getTool("claude");
  installTool(tool);
  const dest = path.join(tmp, ".claude", "skills", "backlog", "SKILL.md");
  const source = path.join(process.cwd(), "skills", "backlog", "SKILL.md");
  assert.equal(fs.readFileSync(dest, "utf8"), fs.readFileSync(source, "utf8"));
});

test("second install is a no-op: everything up-to-date", () => {
  const tool = getTool("claude");
  installTool(tool);
  const ops = installTool(tool);
  assert.ok(ops.every((o) => o.status === "up-to-date"));
});

test("updated content is detected and rewritten", () => {
  const tool = getTool("claude");
  installTool(tool);
  const dest = path.join(tmp, ".claude", "skills", "backlog", "SKILL.md");
  fs.appendFileSync(dest, "\n# manual tweak\n");
  const ops = installTool(tool);
  const op = ops.find((o) => o.rel === "skills/backlog/SKILL.md");
  assert.equal(op.status, "updated");
  assert.equal(opStatus(planInstall(tool)[0]), "up-to-date"); // reinstated
});

test("dry-run writes nothing", () => {
  const tool = getTool("claude");
  const ops = installTool(tool, { dryRun: true });
  assert.equal(ops.length, 3);
  assert.ok(!fs.existsSync(path.join(tmp, ".claude")));
});

test("manifest carries package version for update detection", () => {
  const tool = getTool("claude");
  installTool(tool);
  const manifest = readManifest(tool);
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  assert.equal(manifest.version, pkg.version);
});
