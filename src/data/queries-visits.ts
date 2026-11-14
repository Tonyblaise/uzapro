"use client";
/** Van sales read hooks (feature 021). */
import { useMemo } from "react";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { useAppStore } from "./store/StoreProvider";
import { VAN_TYPE, daySummary, type DaySummary } from "./visits";
import type { Visit } from "./types";

/** Storage locations of the type "Van". */
export function useVans(): string[] {
  const stores = useAppStore((s) => s.stock.stores);
  return useMemo(() => stores.filter((x) => x.type === VAN_TYPE).map((x) => x.name), [stores]);
}

export function useVisits(van: string, date = DEMO_TODAY): Visit[] {
  const visits = useAppStore((s) => s.sales.visits);
  return useMemo(() => visits.filter((v) => v.van === van && v.date === date), [visits, van, date]);
}

/** What is on the van: products with stock there. */
export function useVanStock(van: string): { product: string; quantity: number }[] {
  const levels = useAppStore((s) => s.stock.levels);
  return useMemo(() => levels.filter((l) => l.store === van && l.quantity > 0).map((l) => ({ product: l.product, quantity: l.quantity })), [levels, van]);
}

export function useDaySummary(van: string, date = DEMO_TODAY): DaySummary {
  const visits = useAppStore((s) => s.sales.visits);
  const sales = useAppStore((s) => s.sales.sales);
  return useMemo(() => daySummary(visits, sales, van, date), [visits, sales, van, date]);
}
