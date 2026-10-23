import * as clack from "@clack/prompts";

export const intro = (t) => clack.intro(t);
export const logStep = (t) => clack.log.step(t);
export const logInfo = (t) => clack.log.info(t);
export const logSuccess = (t) => clack.log.success(t);
export const logMessage = (t) => clack.log.message(t);

/**
 * Multi-select with the terminal: type to filter, ↑/↓ to move,
 * space to toggle, enter to confirm. Throws when no TTY.
 */
export async function chooseTools(entries, message) {
  if (!process.stdin.isTTY) {
    throw new Error(
      "No TTY detected. Pass --tools <id1,id2,...> (ids: agents, claude, opencode, kilocode, cursor, github-copilot, codex, gemini, qwen, devin, cline)"
    );
  }
  const selection = await clack.multiselect({
    message,
    options: entries,
    required: false,
  });
  if (clack.isCancel(selection)) {
    clack.cancel("Cancelled.");
    process.exit(130);
  }
  return selection;
}
