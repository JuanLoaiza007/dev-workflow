import os from "node:os";
import path from "node:path";

/**
 * All installs resolve inside one root: the real home dir, or
 * MY_WORKFLOW_HOME when set (tests, CI, or a sandboxed run).
 */
function root() {
  return process.env.MY_WORKFLOW_HOME || os.homedir();
}

/** ~/.<name>/... (also on Windows: most tools keep using ~/.) */
export const home = (...parts) => path.join(root(), ...parts);

/** %APPDATA%\... on Windows, ~/... elsewhere. */
export const appdata = (...parts) =>
  process.platform === "win32"
    ? path.join(process.env.APPDATA || path.join(root(), "AppData", "Roaming"), ...parts)
    : path.join(root(), ...parts);

export const platform = () => process.platform;
