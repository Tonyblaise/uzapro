/**
 * Pure price rules (feature 012, contracts/data-access.md). A customer's group price for a variant
 * and unit at the highest quantity break reached; otherwise the standard price.
 */
import type { CustomerGroup, LinePrice, PriceBreak, PriceEntry, PricingState, Variant } from "./types";
import { GROUP_ROWS, PRICE_ROWS, RETAIL_GROUP } from "./fixtures/pricing";

export { RETAIL_GROUP };
export const GROUP_NAME_MAX = 40;

export function seedPricing(): PricingState {
  return {
    groups: GROUP_ROWS.map(([id, name]) => ({ id, name, builtIn: id === RETAIL_GROUP })),
    prices: PRICE_ROWS.map(([group, product, variant, unit, breaks]) => ({ group, product, variant, unit, breaks: breaks.map(([from, price]) => ({ from, price })) })),
    groupNo: 0,
  };
}

const baseUnit = (v: Pick<Variant, "unit">) => v.unit || "Piece";

/** The units a variant sells in, base unit first. */
export function unitsOf(v: Pick<Variant, "unit" | "extraUnits">): string[] {
  return [baseUnit(v), ...v.extraUnits.map((u) => u.unit)];
}

/** Research R3: the base price, the extra unit's price, or the base price as the last resort. */
export function standardPrice(v: Pick<Variant, "price" | "unit" | "extraUnits">, unit: string): number {
  if (unit === baseUnit(v)) return v.price;
  return v.extraUnits.find((u) => u.unit === unit)?.price ?? v.price;
}

const same = (e: PriceEntry, group: string, product: string, variant: string, unit: string) => e.group === group && e.product === product && e.variant === variant && e.unit === unit;

export function findEntry(prices: readonly PriceEntry[], group: string, product: string, variant: string, unit: string): PriceEntry | undefined {
  return prices.find((e) => same(e, group, product, variant, unit));
}

/** The break with the highest `from` at or below the quantity. */
export function breakFor(entry: Pick<PriceEntry, "breaks">, qty: number): PriceBreak | undefined {
  let hit: PriceBreak | undefined;
  for (const b of entry.breaks) if (b.from <= qty && (!hit || b.from > hit.from)) hit = b;
  return hit;
}

export function priceFor(a: { prices: readonly PriceEntry[]; group: string; product: string; variant: Pick<Variant, "name" | "price" | "unit" | "extraUnits">; unit: string; qty: number }): LinePrice {
  const std = standardPrice(a.variant, a.unit);
  const entry = a.group === RETAIL_GROUP ? undefined : findEntry(a.prices, a.group, a.product, a.variant.name, a.unit);
  if (!entry || !entry.breaks.length) return { price: std, source: "std" };
  const hit = breakFor(entry, a.qty);
  if (hit) return { price: hit.price, source: "list", group: a.group };
  const first = entry.breaks.reduce((m, b) => (b.from < m.from ? b : m));
  return { price: std, source: "std", group: a.group, hint: { from: first.from, unit: a.unit } };
}

/** "Wholesale price" / "Wholesale price from 2 Tray" / "" (contracts/ui.md). */
export function priceNote(p: LinePrice, groupName: string): string {
  if (p.source === "list") return `${groupName} price`;
  return p.hint ? `${groupName} price from ${p.hint.from} ${p.hint.unit}` : "";
}

export function validateEntry(e: PriceEntry, prices: readonly PriceEntry[], editing?: PriceEntry): string | null {
  if (!e.product || !e.variant || !e.unit) return "Pick a product, variant and unit";
  if (!e.breaks.length) return "Enter a quantity of 1 or more";
  const seen = new Set<number>();
  for (const b of e.breaks) {
    if (!Number.isInteger(b.from) || b.from < 1) return "Enter a quantity of 1 or more";
    if (!(b.price > 0)) return "Enter a price above 0";
    if (seen.has(b.from)) return `Two breaks start at ${b.from}`;
    seen.add(b.from);
  }
  const clash = prices.find((x) => x !== editing && same(x, e.group, e.product, e.variant, e.unit));
  if (clash) return `This list already has a price for ${e.product} (${e.variant}, ${e.unit}). Edit that one.`;
  return null;
}

export function validateGroupName(name: string, groups: readonly CustomerGroup[], exceptId?: string): string | null {
  const n = name.trim();
  if (!n) return "Enter a name";
  if (n.length > GROUP_NAME_MAX) return `Use ${GROUP_NAME_MAX} characters or fewer`;
  if (groups.some((g) => g.id !== exceptId && g.name.toLowerCase() === n.toLowerCase())) return `Another group is already called ${n}.`;
  return null;
}

export const groupName = (groups: readonly CustomerGroup[], id: string) => groups.find((g) => g.id === id)?.name ?? "Retail";
