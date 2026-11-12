"use client";
/** Office, People and Settings read hooks (specs/005-office-people-settings/contracts/data-access.md). */
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { AiState } from "./store/state";
import { viewingLabel } from "./uzaai";
import { receivableRows } from "./money";
import { runReport, type ReportSource } from "./reports";
import { comingUp, visibleEvents } from "./calendar";
import { storageTotals } from "./docs";
import { currentUserFirst, currentUserName } from "./profile";
import { bizCompletion, storageCode } from "./settings";
import { useAppStore } from "./store/StoreProvider";
import type {
  BizCompletion,
  BranchRow,
  BusinessProfile,
  CalEvent,
  DocFile,
  Folder,
  GenericRow,
  GroupRow,
  ModuleId,
  ReportPeriod,
  ReportResult,
  Profile,
  StorageLocationRow,
  StorageTotals,
  TerminalsState,
} from "./types";

// Read-only reference lists the forms need.
export { CAL_TYPES } from "./fixtures/calendar";
export { DOC_QUOTA_KB, DOC_SORT_OPTIONS, DOC_TYPE_OPTIONS } from "./fixtures/docs";
export {
  BIZ_CHANNELS,
  BIZ_CUSTOMERS,
  BIZ_INDUSTRIES,
  BIZ_REQUIRED,
  BIZ_SECTION_TITLES,
  BIZ_STAFF_SIZES,
  BIZ_TYPES,
  CITIES,
  COUNTRIES,
  PASSWORD_RULES,
  STRUCT_HELP,
  UZ_LOC_TYPES,
} from "./fixtures/settings";
export { GENERIC_FORMS, NEW_RECORD_STATUSES, REPORT_CARDS } from "./fixtures/generic";
export * from "./calendar";
export * from "./docs";
export * from "./settings";
export { currentUserFirst, currentUserName, nameInitials } from "./profile";

const NO_ROWS: GenericRow[] = [];

// ---- Calendar ---------------------------------------------------------------------------------

/** Every event this role may see, sorted by date and time (FR-003). */
export function useCalendarEvents(): CalEvent[] {
  const events = useAppStore((s) => s.calendar.events);
  const role = useAppStore((s) => s.session.role);
  return useMemo(() => visibleEvents(events, role), [events, role]);
}

/** One visible event by id, or undefined. */
export function useCalendarEvent(id: string | null | undefined): CalEvent | undefined {
  const events = useCalendarEvents();
  return useMemo(() => (id ? events.find((e) => e.id === id) : undefined), [events, id]);
}

/** "Coming up": the first 5 visible events on or after 1 Nov 2026. */
export function useComingUp(): CalEvent[] {
  const events = useCalendarEvents();
  return useMemo(() => comingUp(events), [events]);
}

export function useCalendarTypes(): string[] {
  return useAppStore((s) => s.calendar.types);
}

// ---- File Manager -----------------------------------------------------------------------------

export function useDocs(): { folders: Folder[]; files: DocFile[]; starred: string[] } {
  const folders = useAppStore((s) => s.docs.folders);
  const files = useAppStore((s) => s.docs.files);
  const starred = useAppStore((s) => s.docs.starred);
  return useMemo(() => ({ folders, files, starred }), [folders, files, starred]);
}

/** Storage rings, in KB. */
export function useStorageTotals(): StorageTotals {
  const files = useAppStore((s) => s.docs.files);
  return useMemo(() => storageTotals(files), [files]);
}

// ---- Settings ---------------------------------------------------------------------------------

export function useBusinessProfile(): BusinessProfile {
  return useAppStore((s) => s.settings.biz);
}

export function useBizCompletion(): BizCompletion {
  const biz = useBusinessProfile();
  return useMemo(() => bizCompletion(biz), [biz]);
}

/** Branches with their storage location count and whether Delete is allowed. */
export function useBranches(): BranchRow[] {
  const branches = useAppStore((s) => s.settings.branches);
  const stores = useAppStore((s) => s.stock.stores);
  return useMemo(
    () =>
      branches.map((b) => {
        const n = stores.filter((x) => x.branch === b.name).length;
        return { ...b, stores: n, canDelete: !n && !b.hq };
      }),
    [branches, stores],
  );
}

/** Branch names for every branch picker (replaces the static `UZ_LOC.branches`, FR-013). */
export function useBranchNames(): string[] {
  const branches = useAppStore((s) => s.settings.branches);
  return useMemo(() => branches.map((b) => b.name), [branches]);
}

/** Location groups with their branch and sub-group counts and whether Delete is allowed. */
export function useGroups(): GroupRow[] {
  const groups = useAppStore((s) => s.settings.groups);
  const branches = useAppStore((s) => s.settings.branches);
  return useMemo(
    () =>
      groups.map((g) => {
        const nb = branches.filter((b) => b.group === g.name).length;
        const ns = groups.filter((x) => x.parent === g.name).length;
        return { ...g, branches: nb, subGroups: ns, canDelete: !nb && !ns };
      }),
    [groups, branches],
  );
}

/** Storage locations: the Stock › Warehouses records with their POS flag and in-use state. */
export function useStorageLocations(): StorageLocationRow[] {
  const stores = useAppStore((s) => s.stock.stores);
  const levels = useAppStore((s) => s.stock.levels);
  const pos = useAppStore((s) => s.settings.pos);
  const terminals = useAppStore((s) => s.settings.terminals.list);
  return useMemo(
    () =>
      stores.map((st, i) => {
        const hasStock = levels.some((l) => l.store === st.name && l.quantity > 0);
        const hasTerminal = terminals.some((t) => t.store === st.name);
        return { ...st, code: storageCode(i), pos: !!pos[st.name], hasStock, hasTerminal, canDelete: !hasStock && !hasTerminal };
      }),
    [stores, levels, pos, terminals],
  );
}

/**
 * POS-enabled storage locations for the terminal dialog, limited to `branch` unless it is empty
 * or "Any branch" (design `stores`).
 */
export function usePosStores(branch: string): string[] {
  const stores = useAppStore((s) => s.stock.stores);
  const pos = useAppStore((s) => s.settings.pos);
  return useMemo(
    () => stores.filter((x) => pos[x.name] && (!branch || branch === "Any branch" || x.branch === branch)).map((x) => x.name),
    [stores, pos, branch],
  );
}

/** Storage location types (`UZ_LOC.types` plus any added). */
export function useLocationTypes(): string[] {
  return useAppStore((s) => s.settings.locTypes);
}

export function useTerminals(): TerminalsState {
  return useAppStore((s) => s.settings.terminals);
}

// ---- Profile ----------------------------------------------------------------------------------

/** The session role's profile. */
export function useProfile(): Profile {
  return useAppStore((s) => s.profiles[s.session.role]);
}

/** "{first} {last}" of the current user (header chip, menu, dashboard greeting). */
export function useCurrentUserName(): string {
  return useAppStore(currentUserName);
}

export function useCurrentUserFirst(): string {
  return useAppStore(currentUserFirst);
}

// ---- Generic screens --------------------------------------------------------------------------

/** Rows of a generic table tab ("{moduleId}/{tabSlug}"). */
export function useGenericRows(moduleId: ModuleId, tab: string): GenericRow[] {
  return useAppStore((s) => s.generic[`${moduleId}/${tab}`] ?? NO_ROWS);
}

/** Uza AI panel state (feature 008). */
export function useUzaAi(): AiState {
  return useAppStore((s) => s.ai);
}

/** The "Viewing:" chip text for the current screen (research R9). */
export function useViewingLabel(): string {
  return viewingLabel(usePathname() ?? "/");
}

/** Run a report over the live store (feature 009, research R1). */
export function useReport(name: string, period: ReportPeriod): ReportResult {
  const receivables = useAppStore((s) => s.money.receivables);
  const payables = useAppStore((s) => s.money.payables);
  const creditNotes = useAppStore((s) => s.sales.creditNotes);
  const expenses = useAppStore((s) => s.expenses.expenses);
  const accounts = useAppStore((s) => s.accounts.accounts);
  const ledger = useAppStore((s) => s.accounts.ledger);
  const levels = useAppStore((s) => s.stock.levels);
  const movements = useAppStore((s) => s.stock.movements);
  const wastage = useAppStore((s) => s.stock.wastage);
  const products = useAppStore((s) => s.catalog.products);
  const targets = useAppStore((s) => s.sales.targets);
  const sales = useAppStore((s) => s.sales.sales);
  const stores = useAppStore((s) => s.stock.stores);
  return useMemo(() => {
    const src: ReportSource = { receivables: receivableRows(receivables), payables, creditNotes, expenses, accounts, ledger, levels, movements, wastage, products, targets, sales, stores };
    return runReport(name, period, src);
  }, [name, period, receivables, payables, creditNotes, expenses, accounts, ledger, levels, movements, wastage, products, targets, sales, stores]);
}

/** The period last chosen for reports. */
export function useReportPeriod(): ReportPeriod {
  return useAppStore((s) => s.ui.reportPeriod);
}
