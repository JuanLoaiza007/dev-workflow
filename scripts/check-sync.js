/**
 * Checks that every packaged command (commands/<tool>/...) embeds the exact
 * workflow block from workflow/backlog-openspec.md (the single source of
 * truth). Run before tagging/publishing: `npm run check:sync`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const OPEN = "<!-- workflow:backlog-openspec";
const CLOSE = "<!-- /workflow:backlog-openspec -->";

function extractBlock(text) {
  // Real markers carry a version ("<!-- workflow:backlog-openspec v1.0.0 -->");
  // step text mentions the bare form ("...openspec -->"), so reject that one.
  const m = text.match(/<!-- workflow:backlog-openspec(?!\s*-->)/);
  if (!m) return null;
  const start = m.index;
  const end = text.lastIndexOf(CLOSE);
  if (end < 0) return null;
  return text.slice(start, end + CLOSE.length);
}

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), "utf8");
}

const workflow = read("workflow/backlog-openspec.md");
const canonical = extractBlock(workflow);
if (!canonical) {
  console.error("check-sync: canonical workflow block not found in workflow/backlog-openspec.md");
  process.exit(1);
}

const commandsDir = path.join(ROOT, "commands");
const commandFiles = fs
  .readdirSync(commandsDir, { withFileTypes: true })
  .flatMap((d) =>
    d.isDirectory()
      ? fs.readdirSync(path.join(commandsDir, d.name)).map((f) => `commands/${d.name}/${f}`)
      : [`commands/${d.name}`]
  )
  .filter((f) => /\.md$|\.toml$|\.prompt\.md$/i.test(f))
  .sort();

let failed = false;
for (const file of commandFiles) {
  const block = extractBlock(read(file));
  if (block === null) {
    console.error(`check-sync: MISSING workflow block in ${file}`);
    failed = true;
  } else if (block !== canonical) {
    console.error(`check-sync: STALE workflow block in ${file} (differs from workflow/backlog-openspec.md)`);
    failed = true;
  } else {
    console.log(`check-sync: ok ${file}`);
  }
}

const versionMatch = canonical.match(/workflow:backlog-openspec v([\d.]+)/);
const pkgVersion = JSON.parse(read("package.json")).version;
if (versionMatch && versionMatch[1] !== pkgVersion) {
  console.error(
    `check-sync: marker version v${versionMatch[1]} != package.json v${pkgVersion} — bump both`
  );
  failed = true;
}

process.exit(failed ? 1 : 0);
