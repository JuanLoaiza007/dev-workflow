import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../src/cli.js";

test("parses --tools=claude,opencode", () => {
  const args = parseArgs(["--tools=claude,opencode", "--dry-run"]);
  assert.deepEqual(args.tools, ["claude", "opencode"]);
  assert.equal(args.dryRun, true);
  assert.deepEqual(args._, []);
});

test("parses --tools with a separate value", () => {
  const args = parseArgs(["install", "--tools", "agents, codex"]);
  assert.deepEqual(args.tools, ["agents", "codex"]);
  assert.deepEqual(args._, ["install"]);
});

test("rejects unknown flags", () => {
  assert.throws(() => parseArgs(["--nope"]), /Unknown flag/);
});

test("reports missing --tools value", () => {
  assert.throws(() => parseArgs(["--tools"]), /Missing value/);
});
