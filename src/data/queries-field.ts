"use client";
/** Field sales read hooks (feature 024). */
import { useMemo } from "react";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { deliveryOpen, fieldTotal } from "./commands/field";
import { useAppStore } from "./store/StoreProvider";
import type { FieldRep, FieldSale } from "./types";

/** Newest first. */
export function useFieldSales(): FieldSale[] {
  return useAppStore((s) => s.field.sales);
}

/** A field sale by its FS- or DLV- ref. */
export function useFieldSale(ref: string | null | undefined): FieldSale | undefined {
  const sales = useFieldSales();
  return useMemo(() => (ref ? sales.find((x) => x.ref === ref || x.delivery.ref === ref) : undefined), [sales, ref]);
}

export interface FieldRepRow extends FieldRep {
  ordersToday: number;
  /** Total of the rep's sales that were not cancelled, KES. */
  sales: number;
  openDeliveries: number;
}

/** Sales reps with today's orders, their sales and open deliveries (design `Sales reps` tab). */
export function useFieldReps(): FieldRepRow[] {
  const reps = useAppStore((s) => s.field.reps);
  const sales = useFieldSales();
  return useMemo(
    () =>
      reps.map((r) => {
        const mine = sales.filter((x) => x.kind !== "delivery" && x.rep === r.name && x.delivery.status !== "Cancelled");
        return {
          ...r,
          ordersToday: mine.filter((x) => x.date === DEMO_TODAY).length,
          sales: mine.reduce((a, x) => a + fieldTotal(x), 0),
          openDeliveries: mine.filter((x) => deliveryOpen(x.delivery)).length,
        };
      }),
    [reps, sales],
  );
}

/** Reps first, then the other drivers (design `drivers`). */
export function useFieldDrivers(): string[] {
  const reps = useAppStore((s) => s.field.reps);
  const drivers = useAppStore((s) => s.field.drivers);
  return useMemo(() => Array.from(new Set([...reps.map((r) => r.name), ...drivers])), [reps, drivers]);
}
