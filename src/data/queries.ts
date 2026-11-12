"use client";
/**
 * Read hooks (contracts/data-access.md). Selectors return stable store slices; derived lists are
 * memoised so zustand v5 never sees a new snapshot per render.
 */
import { useMemo } from "react";
import { ROLES, visibleModules, visibleTabs } from "@/config/roles";
import type { ModuleId, Product, Role, StockLevel } from "./types";
import { useAppStore } from "./store/StoreProvider";

// ---- Session & config -------------------------------------------------------------------------

export function useSession(): { authed: boolean; hydrated: boolean; role: Role; remember: boolean; navClosed: Record<string, boolean> } {
  const session = useAppStore((s) => s.session);
  return useMemo(() => ({ ...session, role: ROLES[session.role] }), [session]);
}

export function useRole(): Role {
  const id = useAppStore((s) => s.session.role);
  return ROLES[id];
}

export function useVisibleModules() {
  const role = useRole();
  return useMemo(() => visibleModules(role), [role]);
}

export function useVisibleTabs(moduleId: ModuleId) {
  const role = useRole();
  return useMemo(() => visibleTabs(role, moduleId), [role, moduleId]);
}

export function useToast() {
  return useAppStore((s) => s.ui.toast);
}

export function useSearch(): string {
  return useAppStore((s) => s.ui.search);
}

// ---- Catalogue --------------------------------------------------------------------------------

export interface ProductRow extends Product {
  onHand: number;
}

function onHandMap(levels: StockLevel[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of levels) m.set(l.product, (m.get(l.product) ?? 0) + l.quantity);
  return m;
}

export function useProducts(): ProductRow[] {
  const products = useAppStore((s) => s.catalog.products);
  const levels = useAppStore((s) => s.stock.levels);
  return useMemo(() => {
    const oh = onHandMap(levels);
    return products.map((p) => ({ ...p, onHand: oh.get(p.name) ?? 0 }));
  }, [products, levels]);
}

export function useProduct(name: string | null | undefined) {
  const products = useProducts();
  const movements = useAppStore((s) => s.stock.movements);
  return useMemo(() => {
    if (!name) return undefined;
    const product = products.find((p) => p.name === name);
    if (!product) return undefined;
    return { product, history: movements.filter((m) => m.product === name) };
  }, [products, movements, name]);
}

export function useCategories() {
  return useAppStore((s) => s.catalog.categories);
}

export function useUnits() {
  return useAppStore((s) => s.catalog.units);
}

// ---- Stock ------------------------------------------------------------------------------------

export function useStores() {
  return useAppStore((s) => s.stock.stores);
}

export interface StockLevelRow extends StockLevel {
  value: number;
  status: "ok" | "low" | "out";
}

/** Base-variant cost for valuing stock. */
function costOf(products: Product[], name: string): number {
  return products.find((p) => p.name === name)?.variants[0]?.cost ?? 0;
}

export function useStockLevels(filter: { store: string; level: "all" | "low" | "out" } = { store: "All stores", level: "all" }): StockLevelRow[] {
  const levels = useAppStore((s) => s.stock.levels);
  const products = useAppStore((s) => s.catalog.products);
  return useMemo(() => {
    return levels
      .map((l) => {
        const status: StockLevelRow["status"] = l.quantity <= 0 ? "out" : l.quantity < 20 ? "low" : "ok";
        return { ...l, value: l.quantity * costOf(products, l.product), status };
      })
      .filter((l) => filter.store === "All stores" || l.store === filter.store)
      .filter((l) => filter.level === "all" || l.status === filter.level);
  }, [levels, products, filter.store, filter.level]);
}

export function useQuantity(product: string, store: string): number {
  return useAppStore((s) => s.stock.levels.find((l) => l.product === product && l.store === store)?.quantity ?? 0);
}

export function useMovements(opts: { product?: string; limit?: number } = {}) {
  const movements = useAppStore((s) => s.stock.movements);
  return useMemo(() => {
    const list = opts.product ? movements.filter((m) => m.product === opts.product) : movements;
    return opts.limit ? list.slice(0, opts.limit) : list;
  }, [movements, opts.product, opts.limit]);
}

export function useTransfers() {
  return useAppStore((s) => s.stock.transfers);
}

export function useWastage() {
  return useAppStore((s) => s.stock.wastage);
}

export function useWasteReasons(): string[] {
  const extra = useAppStore((s) => s.catalog.extraWasteReasons);
  return useMemo(() => ["Damaged", "Expired", "Lost", "Stolen", "Quality reject", ...extra], [extra]);
}

// ---- Sales & customers ------------------------------------------------------------------------

export function useCustomers() {
  return useAppStore((s) => s.customers);
}

export function useSales() {
  return useAppStore((s) => s.sales.sales);
}

export function useSale(ref: string | null | undefined) {
  return useAppStore((s) => (ref ? s.sales.sales.find((x) => x.ref === ref) : undefined));
}

export function useQuotations() {
  return useAppStore((s) => s.sales.quotations);
}

export function useInvoices() {
  return useAppStore((s) => s.sales.invoices);
}

export function useCreditNotes() {
  return useAppStore((s) => s.sales.creditNotes);
}

export function useVoids() {
  return useAppStore((s) => s.sales.voids);
}

export function useTargets() {
  return useAppStore((s) => s.sales.targets);
}

// ---- Dashboard recent activity ----------------------------------------------------------------

export interface ActivityRow {
  name: string;
  sub: string;
  total: string;
  pill?: { label: string; tone: string };
}

/** Recent activity tabs on the dashboard read from the live lists (research R9). */
export function useRecentActivity(kind: "Sale" | "Purchase"): ActivityRow[] {
  const sales = useAppStore((s) => s.sales.sales);
  return useMemo(() => {
    if (kind === "Purchase") return [];
    return sales.slice(0, 4).map((s) => ({ name: s.customer, sub: `${s.type}, ${s.channel}`, total: s.total.toLocaleString("en-US"), pill: s.status }));
  }, [sales, kind]);
}
