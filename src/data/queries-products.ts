"use client";
/** Extra read hooks for the products feature (US4). */
import { useMemo } from "react";
import { unitList } from "./commands/catalog";
import { useAppStore } from "./store/StoreProvider";

/**
 * Tax options for the product form: "No tax" plus the active rows of the design's
 * Settings › Taxes table, labelled as the design's `prodTaxes` does ("VAT (16%)").
 */
export const PRODUCT_TAX_OPTIONS = ["No tax", "VAT (16%)", "Zero-rated (0%)", "Exempt"] as const;
export const DEFAULT_PRODUCT_TAX = "VAT (16%)";

/** Every unit of measure (the design's `UZ_UNITS`, including session edits). */
export function useUnitList(): string[] {
  const units = useAppStore((s) => s.catalog.units);
  return useMemo(() => unitList(units), [units]);
}

/** Per-store quantities for one product (the stock history drawer's store cards). */
export function useProductLevels(name: string | null | undefined) {
  const levels = useAppStore((s) => s.stock.levels);
  return useMemo(() => (name ? levels.filter((l) => l.product === name) : []), [levels, name]);
}
