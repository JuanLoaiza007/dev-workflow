#!/usr/bin/env node
import { main } from "../src/cli.js";

try {
  const code = await main(process.argv.slice(2));
  process.exitCode = code ?? 0;
} catch (err) {
  console.error(`dev-workflow: ${err.message}`);
  process.exitCode = 1;
}
