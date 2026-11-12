"use client";
/** Read hooks for Purchases and Suppliers (specs/002-purchases-suppliers/contracts/data-access.md). */
import { useMemo } from "react";
import { parseAmount } from "@/lib/format";
import { GRN_ROWS, PO_ROWS, PRT_ROWS, REJ_ROWS, UZ_BUY } from "./fixtures/purchases";
import { SUPPLIER_ROWS } from "./fixtures/suppliers";
import { useAppStore } from "./store/StoreProvider";
import type { GoodsReceipt } from "./types";

export function useSupplierList() {
  return useAppStore((s) => s.suppliers);
}

export function useNations() {
  return useAppStore((s) => s.purchases.nations);
}

export function usePurchaseOrders() {
  return useAppStore((s) => s.purchases.orders);
}

export function usePurchaseOrder(ref: string | null | undefined) {
  return useAppStore((s) => (ref ? s.purchases.orders.find((o) => o.ref === ref) : undefined));
}

export function useGoodsReceipts() {
  return useAppStore((s) => s.purchases.receipts);
}

export function useGoodsReceipt(ref: string | null | undefined) {
  return useAppStore((s) => (ref ? s.purchases.receipts.find((g) => g.ref === ref) : undefined));
}

export function usePurchaseReturns() {
  return useAppStore((s) => s.purchases.returns);
}

export function usePurchaseReturn(ref: string | null | undefined) {
  return useAppStore((s) => (ref ? s.purchases.returns.find((r) => r.ref === ref) : undefined));
}

export function useRejectedItems() {
  return useAppStore((s) => s.purchases.rejected);
}

export function useRejectedItem(ref: string | null | undefined) {
  return useAppStore((s) => (ref ? s.purchases.rejected.find((r) => r.ref === ref) : undefined));
}

/** Per line key: accepted on the receipt minus already returned ("Can return"). */
export function canReturn(grn: GoodsReceipt): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of grn.lines) out[l.key] = Math.max(0, l.acc - (grn.returned[l.key] ?? 0));
  return out;
}

export function useCanReturn(grn: GoodsReceipt | undefined) {
  return useMemo(() => (grn ? canReturn(grn) : {}), [grn]);
}

/**
 * Purchases overview (research R7): KPIs computed once from the seed lists, as the design's
 * `v.bKpis` does, then frozen (feature 001 FR-005 rule). Charts and on-time from UZ_BUY.
 */
const num = (v: string) => parseAmount(v);
const OVERVIEW = {
  kpis: [
    { label: "Total orders", value: String(PO_ROWS.length), caption: "to suppliers", icon: "shopping-cart" },
    { label: "Total spend", value: `KES ${PO_ROWS.reduce((a, r) => a + num(r[2]), 0).toLocaleString("en-US")}`, caption: UZ_BUY.spendDelta, icon: "banknote" },
    { label: "Active suppliers", value: String(SUPPLIER_ROWS.filter((r) => r[5].label === "Active").length), caption: "on record", icon: "store" },
    { label: "Goods received", value: String(GRN_ROWS.length), caption: "deliveries", icon: "package" },
    { label: "Avg lead time", value: UZ_BUY.leadTime, caption: "order to delivery", icon: "clock" },
    { label: "Orders pending", value: String(PO_ROWS.filter((r) => r[4].label === "To receive").length), caption: "requires action", icon: "clipboard-list" },
    { label: "Rejected items", value: String(REJ_ROWS.reduce((a, r) => a + num(r[4]), 0)), caption: "not accepted", icon: "circle-alert" },
    { label: "Returns", value: String(PRT_ROWS.reduce((a, r) => a + num(r[5]), 0)), caption: "items sent back", icon: "refresh-cw" },
  ],
  orders: UZ_BUY.orders,
  spend: UZ_BUY.spend,
  onTime: UZ_BUY.onTime,
  /** Status stages of the design's `bStatus`: [name, colour token, statuses]. */
  stages: [
    ["Draft", "var(--status-neutral)", []],
    ["Sent", "var(--info)", ["To receive"]],
    ["Accepted", "var(--green-200)", ["Approved"]],
    ["Delivered", "var(--green-600)", ["Completed"]],
    ["Cancelled", "var(--danger)", ["Cancelled"]],
  ] as const,
};

/** Seed-derived panels of `v.isBuyBoard`, frozen with the KPIs: status ring counts and "Top suppliers". */
const TOP = (() => {
  const totals = new Map<string, { name: string; sum: number; n: number }>();
  for (const r of PO_ROWS) {
    const t = totals.get(r[0]) ?? { name: r[0], sum: 0, n: 0 };
    t.sum += num(r[2]);
    t.n += 1;
    totals.set(r[0], t);
  }
  const tops = [...totals.values()].sort((a, b) => b.sum - a.sum);
  const peak = tops[0]?.sum || 1;
  return tops.map((t) => ({
    name: t.name,
    total: `KES ${t.sum.toLocaleString("en-US")}`,
    share: (t.sum / peak) * 100,
    orders: `${t.n}${t.n === 1 ? " order" : " orders"}`,
    pct: UZ_BUY.onTime[t.name] ?? 0,
  }));
})();
const STATUS = OVERVIEW.stages.map(([name, color, statuses]) => ({
  name,
  color,
  count: PO_ROWS.filter((r) => (statuses as readonly string[]).includes(r[4].label)).length,
}));
Object.assign(OVERVIEW, { top: TOP, status: STATUS, totalOrders: PO_ROWS.length });

export type PurchasesOverviewData = typeof OVERVIEW & { top: typeof TOP; status: typeof STATUS; totalOrders: number };
export const purchasesOverviewData = (): PurchasesOverviewData => OVERVIEW as PurchasesOverviewData;

// ---- Reference lists the purchases forms use (design logic values) ---------------------------

/** Payment term options (design `poTerms`); "New" adds to the form's own list. */
export const PO_TERMS = ["Cash on delivery", "Pay on order", "7 days", "14 days", "30 days"] as const;

/** "Pay from account" options (design `fAccounts`: the Financials › Bank accounts names in erp-data.js). */
export const PO_ACCOUNTS = ["Equity Bank — Main", "M-Pesa Till", "Cash drawer"] as const;

/** Purchase return reasons (design `prt.reasons`). */
export const RETURN_REASONS = ["Damaged", "Wrong item", "Expired", "Poor quality", "Too many delivered", "Other"] as const;

/**
 * Supplier credits that name a purchase return (erp-data.js Payables › Supplier credits), used by
 * the purchase return view's "What it does" panel. Read-only: Payables is out of scope (FR-018).
 */
export const SUPPLIER_CREDITS: readonly { ref: string; text: string; amount: number }[] = [{ ref: "SCR-0002", text: "Returned damaged wheels (PRT-0005)", amount: 684 }];
