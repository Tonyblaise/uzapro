/** Pure stock count rules (design `scVals`, feature 025): differences, totals and status. Quantities are base units. */
import type { CountLine, Pill, StockCount } from "./types";

/** Counted less system; null until the line is counted. */
export const variance = (l: Pick<CountLine, "system" | "counted">) => (l.counted === null ? null : l.counted - l.system);

/** "+3", "−2", "0", or "—" when not counted. */
export function signed(n: number | null): string {
  if (n === null) return "—";
  return n > 0 ? `+${n.toLocaleString("en-US")}` : n < 0 ? `−${Math.abs(n).toLocaleString("en-US")}` : "0";
}

/** "+KES 1,200", "−KES 980", "KES 0" (design `K`). */
export const signedKes = (n: number) => `${n < 0 ? "−" : n > 0 ? "+" : ""}KES ${Math.abs(Math.round(n)).toLocaleString("en-KE")}`;

export interface CountTotals {
  lines: number;
  counted: number;
  /** Counted lines that differ from the system figure. */
  diffs: number;
  /** Lines counted short / over, and their value at cost. */
  shortLines: number;
  overLines: number;
  shortValue: number;
  overValue: number;
  /** Net value at cost, KES. */
  value: number;
}

export function countTotals(count: Pick<StockCount, "lines">, cost: (product: string) => number): CountTotals {
  const t: CountTotals = { lines: count.lines.length, counted: 0, diffs: 0, shortLines: 0, overLines: 0, shortValue: 0, overValue: 0, value: 0 };
  for (const l of count.lines) {
    const v = variance(l);
    if (v === null) continue;
    t.counted += 1;
    if (v === 0) continue;
    const val = v * cost(l.product);
    t.diffs += 1;
    if (v < 0) {
      t.shortLines += 1;
      t.shortValue += val;
    } else {
      t.overLines += 1;
      t.overValue += val;
    }
    t.value += val;
  }
  return t;
}

const TONE: Record<StockCount["status"], Pill["tone"]> = { Counting: "info", "Waiting approval": "warning", Approved: "success", Cancelled: "danger" };

export const countStatus = (c: Pick<StockCount, "status">): Pill => ({ label: c.status, tone: TONE[c.status] });

export const isOpenCount = (c: Pick<StockCount, "status">) => c.status === "Counting" || c.status === "Waiting approval";

/** System quantities are hidden while a blind count is being counted. */
export const hidesSystem = (c: Pick<StockCount, "status" | "blind">) => c.blind && c.status === "Counting";

/** A counted quantity must be a whole number of 0 or more. */
export const validCounted = (n: number | null) => n === null || (Number.isInteger(n) && n >= 0);
