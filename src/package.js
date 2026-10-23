import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PKG_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const pkg = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"));

export const PACKAGE_NAME = pkg.name;
export const PACKAGE_VERSION = pkg.version;

/** Absolute path of a packaged asset (skills/..., commands/...). */
export const asset = (rel) => path.join(PKG_ROOT, rel);
