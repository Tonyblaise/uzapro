/**
 * Bulk units (feature 014, research R2–R3). Stock is counted in a variant's base unit; a price in
 * another unit says how many base units it contains, and stock movements convert with that.
 */
import type { ExtraUnitPrice, Product, Variant } from "./types";

export const baseUnitOf = (v: Pick<Variant, "unit">) => v.unit || "Piece";

/**
 * Base units in one `unit` of a product variant: 1 for the base unit, `contains` for a unit the
 * variant is priced in, and 1 for any other unit (such lines move stock by their quantity, as
 * before this feature). An unknown variant name falls back to the product's first variant that
 * has the unit.
 */
export function unitFactor(products: readonly Product[], product: string, variant: string, unit: string | undefined): number {
  if (!unit) return 1;
  const p = products.find((x) => x.name === product);
  if (!p) return 1;
  const named = p.variants.find((v) => v.name === variant);
  const v = named ?? p.variants.find((x) => x.extraUnits.some((u) => u.unit === unit));
  if (!v || unit === baseUnitOf(v)) return 1;
  const extra = v.extraUnits.find((u) => u.unit === unit);
  return extra ? Math.max(1, Math.round(extra.contains) || 1) : 1;
}

/** "Carton of 10 Piece" */
export function containsLabel(v: Pick<Variant, "unit">, u: Pick<ExtraUnitPrice, "unit" | "contains">): string {
  return `${u.unit} of ${u.contains} ${baseUnitOf(v)}`;
}

/** The default when "Contains" is left blank: the price ratio, at least 1. */
export function defaultContains(basePrice: number, unitPrice: number): number {
  return basePrice > 0 && unitPrice > 0 ? Math.max(1, Math.round(unitPrice / basePrice)) : 1;
}
