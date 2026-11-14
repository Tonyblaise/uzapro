/**
 * Pure batch and expiry rules (feature 016, research R1–R3). Batches break down a store's stock
 * of a product by expiry date; what is left over is "not in a batch". Quantities are base units.
 */
import { DEMO_TODAY } from "@/lib/demo-clock";
import type { Pill, StockBatch } from "./types";

/** A batch "expires soon" when this many days or fewer are left. */
export const SOON_DAYS = 30;

const DAY = 86_400_000;
const t = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);

/** Whole days until the expiry date; negative once it has passed. */
export function daysLeft(expiry: string, today = DEMO_TODAY): number {
  return Math.round((t(expiry) - t(today)) / DAY);
}

export const isExpired = (b: Pick<StockBatch, "expiry">, today = DEMO_TODAY) => daysLeft(b.expiry, today) < 0;

export function batchStatus(b: Pick<StockBatch, "expiry">, today = DEMO_TODAY): Pill {
  const d = daysLeft(b.expiry, today);
  if (d < 0) return { label: "Expired", tone: "danger" };
  if (d <= SOON_DAYS) return { label: "Expires soon", tone: "warning" };
  return { label: "OK", tone: "success" };
}

/** "18 days", "1 day", "Today", "Expired 10 days ago". */
export function daysLeftLabel(expiry: string, today = DEMO_TODAY): string {
  const d = daysLeft(expiry, today);
  if (d === 0) return "Today";
  const n = Math.abs(d);
  return d > 0 ? `${n} ${n === 1 ? "day" : "days"}` : `Expired ${n} ${n === 1 ? "day" : "days"} ago`;
}

const at = (b: Pick<StockBatch, "product" | "store">, product: string, store: string) => b.product === product && b.store === store;

export function expiredQty(batches: readonly StockBatch[], product: string, store: string, today = DEMO_TODAY): number {
  return batches.reduce((a, b) => (at(b, product, store) && isExpired(b, today) ? a + b.qty : a), 0);
}

export function batchedQty(batches: readonly StockBatch[], product: string, store: string): number {
  return batches.reduce((a, b) => (at(b, product, store) ? a + b.qty : a), 0);
}

/** Stock on hand that is not in any batch. */
export function unbatchedQty(level: number, batches: readonly StockBatch[], product: string, store: string): number {
  return Math.max(0, level - batchedQty(batches, product, store));
}

/**
 * Take `qty` out of a product's batches at a store and return the new list.
 * - A sale uses in-date batches, earliest expiry first, and never an expired one.
 * - Anything else uses the named batch first (a write-off), then the earliest expiry, which puts
 *   expired batches first.
 * Whatever is not covered by batches comes from stock that is not in a batch. Empty batches go.
 */
export function consume(batches: readonly StockBatch[], product: string, store: string, qty: number, opts: { sold: boolean; batchId?: string; today?: string }): StockBatch[] {
  if (!(qty > 0)) return batches.slice();
  const today = opts.today ?? DEMO_TODAY;
  const order = batches
    .filter((b) => at(b, product, store) && !(opts.sold && isExpired(b, today)))
    .sort((a, b) => (a.id === opts.batchId ? -1 : b.id === opts.batchId ? 1 : a.expiry.localeCompare(b.expiry)));
  const take = new Map<string, number>();
  let left = qty;
  for (const b of order) {
    if (left <= 0) break;
    const n = Math.min(b.qty, left);
    take.set(b.id, n);
    left -= n;
  }
  return batches.flatMap((b) => {
    const n = take.get(b.id);
    if (!n) return [b];
    return b.qty - n > 0 ? [{ ...b, qty: b.qty - n }] : [];
  });
}

/** Keep batches within the stock on hand (FR-003): trim the earliest expiry first. */
export function clampBatches(batches: readonly StockBatch[], product: string, store: string, level: number): StockBatch[] {
  const over = batchedQty(batches, product, store) - Math.max(0, level);
  return over > 0 ? consume(batches, product, store, over, { sold: false }) : batches.slice();
}

export interface BatchInput {
  product: string;
  store: string;
  batch: string;
  expiry: string;
  qty: number;
}

export function validateBatch(input: BatchInput, batches: readonly StockBatch[], level: number | undefined): string | null {
  if (!input.product || !input.store || level === undefined) return "Pick a product and store";
  const no = input.batch.trim();
  if (!no) return "Enter a batch number";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.expiry)) return "Pick the expiry date";
  if (!Number.isInteger(input.qty) || input.qty < 1) return "Enter a quantity of 1 or more";
  if (batches.some((b) => at(b, input.product, input.store) && b.batch.toLowerCase() === no.toLowerCase())) return `${input.product} already has a batch ${no} at ${input.store}.`;
  const free = unbatchedQty(level, batches, input.product, input.store);
  if (input.qty > free) return `Only ${free} ${input.product} at ${input.store} is not in a batch yet.`;
  return null;
}
