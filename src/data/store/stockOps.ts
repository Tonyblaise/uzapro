/**
 * Shared, pure stock operations used by sales, stock and credit-note commands.
 * Quantities never go below zero (FR-016).
 */
import { DEMO_TODAY } from "@/lib/demo-clock";
import type { Pill, StockLevel, StockMovement } from "../types";
import type { AppState } from "./state";

export function qtyAt(state: AppState, product: string, store: string): number {
  return state.stock.levels.find((l) => l.product === product && l.store === store)?.quantity ?? 0;
}

export interface StockChange {
  product: string;
  variant: string;
  store: string;
  change: number; // signed
  kind: Pill;
  ref: string;
  by: string;
}

/** Returns the first product that would go negative, or null if every change fits. */
export function findShortfall(state: AppState, changes: readonly StockChange[]): { product: string; store: string; available: number } | null {
  const running = new Map<string, number>();
  for (const c of changes) {
    const key = `${c.product}@@${c.store}`;
    const current = running.get(key) ?? qtyAt(state, c.product, c.store);
    const next = current + c.change;
    if (next < 0) return { product: c.product, store: c.store, available: current };
    running.set(key, next);
  }
  return null;
}

/** Apply stock changes and log one movement per change (newest first). Caller checks shortfall first. */
export function applyStockChanges(state: AppState, changes: readonly StockChange[]): Pick<AppState, "stock"> {
  let levels: StockLevel[] = state.stock.levels.slice();
  const newMoves: StockMovement[] = [];
  changes.forEach((c, i) => {
    const idx = levels.findIndex((l) => l.product === c.product && l.store === c.store);
    const current = idx >= 0 ? levels[idx]!.quantity : 0;
    const left = Math.max(0, current + c.change);
    if (idx >= 0) levels[idx] = { ...levels[idx]!, quantity: left };
    else levels = [...levels, { product: c.product, store: c.store, quantity: left }];
    newMoves.unshift({
      id: `m-${Date.now()}-${i}`,
      date: DEMO_TODAY,
      product: c.product,
      variant: c.variant,
      kind: c.kind,
      store: c.store,
      change: c.change,
      left,
      by: c.by,
      ref: c.ref,
    });
  });
  return { stock: { ...state.stock, levels, movements: [...newMoves, ...state.stock.movements] } };
}

export const KIND = {
  sold: { label: "Sold", tone: "info" },
  received: { label: "Received", tone: "success" },
  movedOut: { label: "Moved out", tone: "neutral" },
  movedIn: { label: "Moved in", tone: "neutral" },
  damaged: { label: "Damaged or lost", tone: "danger" },
  returned: { label: "Received", tone: "success" },
} satisfies Record<string, Pill>;
