/**
 * Shared, pure stock operations used by sales, stock and credit-note commands.
 * Quantities never go below zero (FR-016).
 */
import { DEMO_TODAY } from "@/lib/demo-clock";
import { clampBatches, consume, expiredQty } from "../batches";
import { unitFactor } from "../units";
import type { Pill, StockLevel, StockMovement } from "../types";
import type { AppState } from "./state";

export function qtyAt(state: AppState, product: string, store: string): number {
  return state.stock.levels.find((l) => l.product === product && l.store === store)?.quantity ?? 0;
}

export interface StockChange {
  product: string;
  variant: string;
  store: string;
  change: number; // signed, in `unit`
  /**
   * The line's unit (feature 014). Stock is counted in base units, so a change in a bulk unit is
   * multiplied by what the unit contains. Left out = base units.
   */
  unit?: string;
  /** Take outgoing stock from this batch first (feature 016). */
  batchId?: string;
  kind: Pill;
  ref: string;
  by: string;
}

/** A change in base units (feature 014, research R2). */
export function baseChange(state: Pick<AppState, "catalog">, c: StockChange): number {
  return c.change * unitFactor(state.catalog.products, c.product, c.variant, c.unit);
}

/** Returns the first product that would go negative, or null if every change fits. `available` is in base units. */
export function findShortfall(state: AppState, changes: readonly StockChange[]): { product: string; store: string; available: number } | null {
  const running = new Map<string, number>();
  for (const c of changes) {
    const key = `${c.product}@@${c.store}`;
    // Feature 016: a sale cannot use expired batches, so it is checked against in-date stock.
    const sold = c.kind.label === "Sold";
    const current = running.get(key) ?? qtyAt(state, c.product, c.store) - (sold ? expiredQty(state.stock.batches, c.product, c.store) : 0);
    const next = current + baseChange(state, c);
    if (next < 0) return { product: c.product, store: c.store, available: current };
    running.set(key, next);
  }
  return null;
}

/** Apply stock changes and log one movement per change (newest first). Caller checks shortfall first. */
export function applyStockChanges(state: AppState, changes: readonly StockChange[]): Pick<AppState, "stock"> {
  let levels: StockLevel[] = state.stock.levels.slice();
  let batches = state.stock.batches;
  const newMoves: StockMovement[] = [];
  changes.forEach((c, i) => {
    const idx = levels.findIndex((l) => l.product === c.product && l.store === c.store);
    const current = idx >= 0 ? levels[idx]!.quantity : 0;
    const change = baseChange(state, c);
    const left = Math.max(0, current + change);
    // Feature 016: outgoing stock comes out of the product's batches; they never exceed what is left.
    if (change < 0 && batches.some((b) => b.product === c.product && b.store === c.store)) {
      batches = clampBatches(consume(batches, c.product, c.store, -change, { sold: c.kind.label === "Sold", batchId: c.batchId }), c.product, c.store, left);
    }
    if (idx >= 0) levels[idx] = { ...levels[idx]!, quantity: left };
    else levels = [...levels, { product: c.product, store: c.store, quantity: left }];
    newMoves.unshift({
      id: `m-${Date.now()}-${i}`,
      date: DEMO_TODAY,
      product: c.product,
      variant: c.variant,
      kind: c.kind,
      store: c.store,
      change,
      left,
      by: c.by,
      ref: c.ref,
    });
  });
  return { stock: { ...state.stock, levels, batches, movements: [...newMoves, ...state.stock.movements] } };
}

export const KIND = {
  sold: { label: "Sold", tone: "info" },
  received: { label: "Received", tone: "success" },
  movedOut: { label: "Moved out", tone: "neutral" },
  movedIn: { label: "Moved in", tone: "neutral" },
  damaged: { label: "Damaged or lost", tone: "danger" },
  returned: { label: "Received", tone: "success" },
  /** A stock count correction (feature 017). */
  counted: { label: "Counted", tone: "neutral" },
} satisfies Record<string, Pill>;

/**
 * Feature 016, for callers that allow overselling (the till): the first sale line that would need
 * expired stock. `available` is the in-date quantity in base units. Products with no expired
 * batch are never reported.
 */
export function findExpiredShortfall(state: AppState, changes: readonly StockChange[]): { product: string; store: string; available: number } | null {
  const running = new Map<string, number>();
  for (const c of changes) {
    const expired = expiredQty(state.stock.batches, c.product, c.store);
    if (!expired || c.kind.label !== "Sold") continue;
    const key = `${c.product}@@${c.store}`;
    const current = running.get(key) ?? qtyAt(state, c.product, c.store) - expired;
    const next = current + baseChange(state, c);
    if (next < 0) return { product: c.product, store: c.store, available: Math.max(0, current) };
    running.set(key, next);
  }
  return null;
}
