/** The design's row helpers from erp-data.js: `P(text, tone)` status pills and tone keys. */
import type { Pill, Tone } from "../types";

const T: Record<string, Tone> = { good: "success", warn: "warning", bad: "danger", info: "info", mut: "neutral" };

export const P = (label: string, c: "good" | "warn" | "bad" | "info" | "mut"): Pill => ({ label, tone: T[c] ?? "neutral" });
