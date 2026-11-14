"use client";
/** Stock count read hooks (feature 017, contracts/data-access.md). */
import { useCallback, useMemo } from "react";
import { countStatus, countTotals, type CountTotals } from "./counts";
import { useAppStore } from "./store/StoreProvider";
import type { Pill, StockCount } from "./types";

export type CountRow = StockCount & { pill: Pill; totals: CountTotals };

/** Buying price of a product's first variant (count values are at cost). */
export function useProductCost(): (product: string) => number {
  const products = useAppStore((s) => s.catalog.products);
  return useCallback((product: string) => products.find((p) => p.name === product)?.variants[0]?.cost ?? 0, [products]);
}

export function useCountRows(): CountRow[] {
  const counts = useAppStore((s) => s.stock.counts);
  const cost = useProductCost();
  return useMemo(() => counts.map((c) => ({ ...c, pill: countStatus(c), totals: countTotals(c, cost) })), [counts, cost]);
}

export function useCount(ref: string | null): CountRow | undefined {
  const rows = useCountRows();
  return ref ? rows.find((c) => c.ref === ref) : undefined;
}

/** Products in stock at a store, for the new-count tick list. */
export function useCountableProducts(store: string): { product: string; quantity: number }[] {
  const levels = useAppStore((s) => s.stock.levels);
  return useMemo(() => levels.filter((l) => l.store === store).map((l) => ({ product: l.product, quantity: l.quantity })), [levels, store]);
}
