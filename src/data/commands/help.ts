/**
 * Ask UzaPro chat (feature 006, design `send`): a non-blank message adds the user's message and the
 * design's fixed reply in one update. The design shows no toast.
 */
import { CHAT_REPLY } from "../fixtures/help";
import { getStore } from "../store";
import { fail, ok, type Result } from "../types";

export { CHAT_REPLY };

export async function sendChatMessage(text: string): Promise<Result<void>> {
  const t = text.trim();
  if (!t) return fail("Type a message.");
  getStore().setState((s) => ({ help: { messages: [...s.help.messages, { me: true, text: t }, { me: false, text: CHAT_REPLY }] } }));
  return ok(undefined);
}
