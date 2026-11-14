"use client";
/** Batch read hooks (feature 016, contracts/data-access.md). */
import { useMemo } from "react";
import { batchStatus, daysLeft, daysLeftLabel, unbatchedQty } from "./batches";
import { useAppStore } from "./store/StoreProvider";
import type { Pill, StockBatch } from "./types";

export type BatchRow = StockBatch & { days: number; daysLabel: string; status: Pill };

/** Every batch, earliest expiry first. */
export function useBatchRows(): BatchRow[] {
  const batches = useAppStore((s) => s.stock.batches);
  return useMemo(
    () => [...batches].sort((a, b) => a.expiry.localeCompare(b.expiry) || a.product.localeCompare(b.product)).map((b) => ({ ...b, days: daysLeft(b.expiry), daysLabel: daysLeftLabel(b.expiry), status: batchStatus(b) })),
    [batches],
  );
}

/** Stock of a product at a store that is not in a batch yet (0 when there is none there). */
export function useUnbatched(product: string, store: string): number {
  const levels = useAppStore((s) => s.stock.levels);
  const batches = useAppStore((s) => s.stock.batches);
  return useMemo(() => unbatchedQty(levels.find((l) => l.product === product && l.store === store)?.quantity ?? 0, batches, product, store), [levels, batches, product, store]);
}
