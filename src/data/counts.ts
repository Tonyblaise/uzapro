/** Pure stock count rules (feature 017): variance, totals and status. Quantities are base units. */
import type { CountLine, Pill, StockCount } from "./types";

/** Counted less system; null until the line is counted. */
export const variance = (l: Pick<CountLine, "system" | "counted">) => (l.counted === null ? null : l.counted - l.system);

/** "+3", "−2", "0", or "—" when not counted. */
export function signed(n: number | null): string {
  if (n === null) return "—";
  return n > 0 ? `+${n.toLocaleString("en-US")}` : n < 0 ? `−${Math.abs(n).toLocaleString("en-US")}` : "0";
}

export interface CountTotals {
  lines: number;
  counted: number;
  /** Units found over the system figure. */
  over: number;
  /** Units missing (a positive number). */
  short: number;
  net: number;
  /** Net value at cost, KES. */
  value: number;
}

export function countTotals(count: Pick<StockCount, "lines">, cost: (product: string) => number): CountTotals {
  const t: CountTotals = { lines: count.lines.length, counted: 0, over: 0, short: 0, net: 0, value: 0 };
  for (const l of count.lines) {
    const v = variance(l);
    if (v === null) continue;
    t.counted += 1;
    if (v > 0) t.over += v;
    if (v < 0) t.short += -v;
    t.net += v;
    t.value += v * cost(l.product);
  }
  return t;
}

export function countStatus(c: Pick<StockCount, "status">): Pill {
  const tone = c.status === "In progress" ? "info" : c.status === "Waiting approval" ? "warning" : c.status === "Approved" ? "success" : "neutral";
  return { label: c.status, tone };
}

export const isOpenCount = (c: Pick<StockCount, "status">) => c.status === "In progress" || c.status === "Waiting approval";

/** A counted quantity must be a whole number of 0 or more. */
export const validCounted = (n: number | null) => n === null || (Number.isInteger(n) && n >= 0);
