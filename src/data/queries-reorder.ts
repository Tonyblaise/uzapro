"use client";
/** Reorder read hooks (feature 014, contracts/data-access.md). */
import { useMemo } from "react";
import { reorderRows } from "./commands/reorder";
import { reorderStores } from "./reorder";
import { useAppStore } from "./store/StoreProvider";

export type ReorderRow = ReturnType<typeof reorderRows>[number];

/** Every reorder line with what is on hand, on order and suggested. */
export function useReorderRows(): ReorderRow[] {
  const stock = useAppStore((s) => s.stock);
  const catalog = useAppStore((s) => s.catalog);
  const purchases = useAppStore((s) => s.purchases);
  return useMemo(() => reorderRows({ stock, catalog, purchases }), [stock, catalog, purchases]);
}

/**
 * A product's reorder point as the product form shows it: the shared variant and levels when every
 * store it applies to has the same rule, "mixed" when they differ by store, or
 * null when it has none.
 */
export function useProductReorder(product?: string): { variant: string; min: number; max: number } | "mixed" | null {
  const rules = useAppStore((s) => s.stock.reorder);
  const stores = useAppStore((s) => s.stock.stores);
  return useMemo(() => {
    const mine = product ? rules.filter((r) => r.product === product) : [];
    const first = mine[0];
    if (!first) return null;
    const names = reorderStores(stores).map((x) => x.name);
    const sameAll =
      mine.length === names.length &&
      names.every((n) => mine.some((r) => r.store === n && r.variant === first.variant && r.min === first.min && r.max === first.max));
    return sameAll ? { variant: first.variant, min: first.min, max: first.max } : "mixed";
  }, [product, rules, stores]);
}
