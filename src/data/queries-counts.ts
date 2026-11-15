"use client";
/** Stock count read hooks (feature 025). */
import { useCallback, useMemo } from "react";
import { ROLES, ROLE_IDS } from "@/config/roles";
import { countStores } from "./commands/counts";
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

/** Stores, categories and staff for "New stock count", and how many lines a count would have. */
export function useCountSetup(category: string | null) {
  const stock = useAppStore((s) => s.stock);
  const products = useAppStore((s) => s.catalog.products);
  return useMemo(
    () => ({
      stores: countStores({ stock }),
      categories: Array.from(new Set(products.map((p) => p.category))),
      // Design: the people who can count are the staff on the demo roles.
      staff: ROLE_IDS.map((id) => ROLES[id].name),
      lines: products.filter((p) => !category || p.category === category).length,
    }),
    [stock, products, category],
  );
}
