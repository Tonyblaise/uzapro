"use client";
/** Reorder read hooks (feature 014, contracts/data-access.md). */
import { useMemo } from "react";
import { reorderRows } from "./commands/reorder";
import { useAppStore } from "./store/StoreProvider";

export type ReorderRow = ReturnType<typeof reorderRows>[number];

/** Every reorder line with what is on hand, on order and suggested. */
export function useReorderRows(): ReorderRow[] {
  const stock = useAppStore((s) => s.stock);
  const catalog = useAppStore((s) => s.catalog);
  const purchases = useAppStore((s) => s.purchases);
  return useMemo(() => reorderRows({ stock, catalog, purchases }), [stock, catalog, purchases]);
}
