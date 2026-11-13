"use client";
/**
 * Read hooks (contracts/data-access.md). Selectors return stable store slices; derived lists are
 * memoised so zustand v5 never sees a new snapshot per render.
 */
import { createContext, useCallback, useContext, useMemo } from "react";
import { MODULES } from "@/config/modules";
import { canSee, visibleModules, visibleTabs } from "@/config/roles";
import { ROLE_COLOURS } from "./fixtures/permissions";
import { accessFor, has, initials, moduleSummary, roleWithAccess, rowActionNeed, withLocks } from "./permissions";
import type { AccessLevel, ModuleId, Product, Role, RoleAccess, StockLevel } from "./types";
import { useAppStore } from "./store/StoreProvider";

// ---- Session & config -------------------------------------------------------------------------

export function useSession(): { authed: boolean; hydrated: boolean; role: Role; remember: boolean; navClosed: Record<string, boolean> } {
  const session = useAppStore((s) => s.session);
  const role = useRole();
  return useMemo(() => ({ ...session, role }), [session, role]);
}

/** The signed-in role with module visibility from its saved Read access (feature 011, R1). */
export function useRole(): Role {
  const id = useAppStore((s) => s.session.role);
  const access = useAppStore((s) => s.permissions.access[id]);
  return useMemo(() => roleWithAccess(id, access ?? withLocks(id, {} as RoleAccess)), [id, access]);
}

// ---- Permissions (feature 011) ----------------------------------------------------------------

/** The module screen's access, provided by ModuleScreen. Outside a module: no limits. */
export const AccessContext = createContext<{ module?: ModuleId; level: AccessLevel }>({ level: "delete" });

export function useAccess() {
  return useContext(AccessContext);
}

/** A checker for labelled actions in the current module (row menus, record-view buttons; research R4). */
export function useAllowed(): (label: string, need?: AccessLevel) => boolean {
  const { level } = useContext(AccessContext);
  return useCallback((label: string, need?: AccessLevel) => has(level, need ?? rowActionNeed(label)), [level]);
}

/** Whether the signed-in role has `need` on a module (default: the current module screen's). */
export function useCan(need: AccessLevel, moduleId?: ModuleId): boolean {
  const ctx = useContext(AccessContext);
  const id = useAppStore((s) => s.session.role);
  const level = useAppStore((s) => (moduleId ? (s.permissions.access[id]?.[moduleId] ?? "none") : undefined));
  return has(moduleId ? (level ?? "none") : ctx.level, need);
}

/** The signed-in role's level on one module. */
export function useModuleLevel(moduleId: ModuleId): AccessLevel {
  const id = useAppStore((s) => s.session.role);
  return useAppStore((s) => s.permissions.access[id]?.[moduleId] ?? "none");
}

export interface RoleCardView {
  key: string;
  name: string;
  colour: number;
  locked: boolean;
  users: number;
  avatars: string[];
  extra: number;
  open: number;
  total: number;
}

export function useRoleCards(): RoleCardView[] {
  const perms = useAppStore((s) => s.permissions);
  return useMemo(
    () =>
      perms.roles.map((r) => {
        const avatars = r.people.slice(0, 4).map(initials);
        const { open, total } = moduleSummary(accessFor({ permissions: perms }, r.key));
        return { key: r.key, name: r.name, colour: ((r.colour - 1) % ROLE_COLOURS) + 1, locked: r.locked, users: r.users, avatars, extra: Math.max(0, r.users - avatars.length), open, total };
      }),
    [perms],
  );
}

export function useRoleAccess(key: string): RoleAccess {
  const perms = useAppStore((s) => s.permissions);
  return useMemo(() => accessFor({ permissions: perms }, key), [perms, key]);
}

export function useRoleDefs() {
  return useAppStore((s) => s.permissions.roles);
}

/** Modules grouped by sidebar section, in sidebar order. */
export function useModuleGroups(): { section: string; modules: { id: ModuleId; name: string; icon: string }[] }[] {
  return useMemo(() => {
    const out: { section: string; modules: { id: ModuleId; name: string; icon: string }[] }[] = [];
    for (const m of MODULES) {
      let g = out.find((x) => x.section === m.section);
      if (!g) out.push((g = { section: m.section, modules: [] }));
      g.modules.push({ id: m.id, name: m.name, icon: m.icon });
    }
    return out;
  }, []);
}

/** Whether the signed-in role can open a module (and tab). */
export function useCanSee(moduleId: ModuleId, tab?: string): boolean {
  const role = useRole();
  return canSee(role, moduleId, tab);
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

/** The role's quick tasks and alerts it can act on: hidden modules drop out; create tasks need Write (FR-009, FR-011). */
export function useHomeItems() {
  const role = useRole();
  const access = useAppStore((s) => s.permissions.access[s.session.role]);
  return useMemo(
    () => ({
      tasks: role.tasks.filter((t) => canSee(role, t.module, t.tab) && (!t.action || has(access?.[t.module] ?? "none", "write"))),
      attention: role.attention.filter((a) => canSee(role, a.module, a.tab)),
    }),
    [role, access],
  );
}
