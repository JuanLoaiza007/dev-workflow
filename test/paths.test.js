import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { home, appdata } from "../src/paths.js";

test("home() joins under MY_WORKFLOW_HOME when set", () => {
  process.env.MY_WORKFLOW_HOME = "/tmp/fake-home";
  try {
    assert.equal(home(".claude", "skills"), path.join("/tmp/fake-home", ".claude", "skills"));
  } finally {
    delete process.env.MY_WORKFLOW_HOME;
  }
});

test("home() falls back to os.homedir()", () => {
  delete process.env.MY_WORKFLOW_HOME;
  assert.equal(home(".claude"), path.join(os.homedir(), ".claude"));
});

test("appdata() outside win32 uses the home root", () => {
  process.env.MY_WORKFLOW_HOME = "/tmp/fake-home";
  try {
    assert.equal(appdata("Cursor"), path.join("/tmp/fake-home", "Cursor"));
  } finally {
    delete process.env.MY_WORKFLOW_HOME;
  }
});
