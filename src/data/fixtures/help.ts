/**
 * Ask UzaPro chat seed, ported verbatim from the design (initial state `messages`, the `send`
 * reply). Every message gets the same reply, as in the canvas.
 */
import type { ChatMessage } from "../types";

export const CHAT_SEED: readonly ChatMessage[] = [
  { me: false, text: "Ask about stock, an invoice, or how to do something." },
  { me: true, text: "How do I issue a credit note?" },
  { me: false, text: "Go to Sales → Refunds → New, pick the original invoice, choose the lines to return, and save. Returned items restock automatically." },
];

export const CHAT_REPLY = "Open Reports for the full figures, or search for a record by its ID, for example INV-0355.";
