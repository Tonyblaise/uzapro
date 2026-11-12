"use client";
/**
 * Read hooks for the Stock feature (US5). They follow the design's rules:
 * - stock levels are kept per product + store (research R11); the Stock management table splits
 *   them across variants the way the design's `stockVariants` does (an even split of the seed
 *   quantity, then each movement adjusts its own variant and the rest is rebalanced to the total);
 * - the level filter uses the design's `LOW_STOCK = 20` and `levelTests` (in > 0, low > 0 and < 20,
 *   out = 0), with option counts taken from the store's product lines (`levelFilterOptions`).
 */
import { useMemo } from "react";
import { STOCK_LINES } from "./fixtures/stock";
import { useAppStore } from "./store/StoreProvider";
import type { Product, StockMovement } from "./types";

export const LOW_STOCK = 20;

export type StockLevelFilter = "all" | "in" | "low" | "out";

const LEVEL_TESTS: Record<StockLevelFilter, (qty: number) => boolean> = {
  all: () => true,
  in: (q) => q > 0,
  low: (q) => q > 0 && q < LOW_STOCK,
  out: (q) => q === 0,
};

const LEVEL_LABELS: [StockLevelFilter, string][] = [
  ["all", "All stock"],
  ["in", "In stock"],
  ["low", "Low stock"],
  ["out", "Out of stock"],
];

export const ALL_STORES = "All stores";

/** Variant names of a product (design `variantsOf`, default "Standard"). */
export function variantNames(products: readonly Product[], name: string): string[] {
  const p = products.find((x) => x.name === name);
  return p && p.variants.length ? p.variants.map((v) => v.name) : ["Standard"];
}

/** The design's `vCost`: the variant's cost, else the average variant cost. */
function variantCost(products: readonly Product[], product: string, variant: string): number {
  const vs = products.find((x) => x.name === product)?.variants ?? [];
  const v = vs.find((x) => x.name === variant);
  if (v) return v.cost;
  return vs.length ? vs.reduce((a, x) => a + x.cost, 0) / vs.length : 0;
}

type VariantMap = Record<string, number>;

/** Even split with the remainder on the first variants (design `stockVariants` first call). */
function evenSplit(names: string[], total: number): VariantMap {
  const m: VariantMap = {};
  const n = names.length;
  const each = Math.floor(total / n);
  names.forEach((v, i) => {
    m[v] = each + (i < total - each * n ? 1 : 0);
  });
  return m;
}

/** Bring the variant sum back to the line total, largest variant first (design `stockVariants`). */
function rebalance(m: VariantMap, total: number): void {
  let diff = total - Object.values(m).reduce((a, b) => a + b, 0);
  if (!diff) return;
  const order = Object.keys(m).sort((a, b) => m[b]! - m[a]!);
  for (const v of order) {
    if (!diff) break;
    const take = diff > 0 ? diff : -Math.min(m[v]!, -diff);
    m[v] = m[v]! + take;
    diff -= take;
  }
}

const SEED_QTY = new Map(STOCK_LINES.map(([p, s, q]) => [`${p}|${s}`, q]));

/** Variant quantities for every (product, store) line: seed split, then this session's movements replayed. */
export function variantLevels(movements: readonly StockMovement[], products: readonly Product[]) {
  const session = movements.filter((m) => !m.id.startsWith("seed-")).slice().reverse();
  const maps = new Map<string, VariantMap>();
  const get = (product: string, store: string) => {
    const key = `${product}|${store}`;
    let m = maps.get(key);
    if (!m) {
      m = evenSplit(variantNames(products, product), SEED_QTY.get(key) ?? 0);
      maps.set(key, m);
    }
    return m;
  };
  for (const mv of session) {
    const m = get(mv.product, mv.store);
    if (mv.variant && m[mv.variant] !== undefined) m[mv.variant] = Math.max(0, m[mv.variant]! + mv.change);
    rebalance(m, mv.left);
  }
  return (product: string, store: string, total: number): VariantMap => {
    const m = { ...get(product, store) };
    for (const v of variantNames(products, product)) if (m[v] === undefined) m[v] = 0;
    rebalance(m, total);
    return m;
  };
}

export interface StockVariantRow {
  product: string;
  variant: string;
  store: string;
  quantity: number;
  /** Quantity × variant cost, KES. */
  value: number;
}

/**
 * Stock management rows (one per product variant per store) for the store and level filters,
 * plus the level filter options with their counts.
 */
export function useStockVariantRows(store: string, level: StockLevelFilter) {
  const levels = useAppStore((s) => s.stock.levels);
  const movements = useAppStore((s) => s.stock.movements);
  const products = useAppStore((s) => s.catalog.products);
  return useMemo(() => {
    const lines = levels.filter((l) => store === ALL_STORES || l.store === store);
    const split = variantLevels(movements, products);
    const rows: StockVariantRow[] = [];
    for (const l of lines) {
      const m = split(l.product, l.store, l.quantity);
      for (const v of Object.keys(m)) {
        const q = m[v]!;
        if (!LEVEL_TESTS[level](q)) continue;
        rows.push({ product: l.product, variant: v, store: l.store, quantity: q, value: Math.round(q * variantCost(products, l.product, v)) });
      }
    }
    const levelOptions = LEVEL_LABELS.map(([value, label]) => ({
      value,
      label: value === "all" ? label : `${label} (${lines.filter((l) => LEVEL_TESTS[value](l.quantity)).length})`,
    }));
    return { rows, levelOptions };
  }, [levels, movements, products, store, level]);
}

/** Quantity of each product at one store (design `trLines` / `wLines`). */
export function useStoreQuantities(store: string): Map<string, number> {
  const levels = useAppStore((s) => s.stock.levels);
  return useMemo(() => {
    const m = new Map<string, number>();
    for (const l of levels) if (l.store === store) m.set(l.product, (m.get(l.product) ?? 0) + l.quantity);
    return m;
  }, [levels, store]);
}

/** Warehouses tab rows: each store with the total quantity it holds (design "Items" column). */
export function useWarehouseRows() {
  const stores = useAppStore((s) => s.stock.stores);
  const levels = useAppStore((s) => s.stock.levels);
  return useMemo(
    () => stores.map((st) => ({ ...st, items: levels.filter((l) => l.store === st.name).reduce((a, l) => a + l.quantity, 0) })),
    [stores, levels],
  );
}

/** Per-store quantities of one product, for the stock history drawer (design `histStores`). */
export function useProductStoreLevels(product: string | null | undefined) {
  const levels = useAppStore((s) => s.stock.levels);
  return useMemo(() => (product ? levels.filter((l) => l.product === product) : []), [levels, product]);
}

export function useTransfer(ref: string | null | undefined) {
  return useAppStore((s) => (ref ? s.stock.transfers.find((t) => t.ref === ref) : undefined));
}

/**
 * Active suppliers for the Stock in form (design `stSuppliers`: the Suppliers tab rows with status
 * Active), from the suppliers slice (feature 002).
 */
export function useSuppliers(): readonly string[] {
  const suppliers = useAppStore((s) => s.suppliers);
  return useMemo(() => suppliers.filter((x) => x.status.label === "Active").map((x) => x.name), [suppliers]);
}
