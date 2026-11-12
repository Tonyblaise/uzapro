"use client";
/** Receivables and Payables read hooks (specs/003-receivables-payables/contracts/data-access.md). */
import { useMemo } from "react";
import { date as fmtDate } from "@/lib/format";
import { MONEY_ACCOUNTS } from "./fixtures/money";
import { ageing, balance, creditLeft, creditStatus, creditUsable, payStatus, planNextDue, rcvStatus } from "./money";
import { useAppStore } from "./store/StoreProvider";
import type { AgeingRow, Credit, CreditRow, MoneyPayment, PayableRow, Plan, PlanRow, ReceivableRow, Side } from "./types";

export { MONEY_ACCOUNTS };
export { PLAN_FREQS, planEach, planStep } from "./money";

export function useReceivables(): ReceivableRow[] {
  const list = useAppStore((s) => s.money.receivables);
  return useMemo(() => list.map((r) => ({ ...r, balance: balance(r), status: rcvStatus(r) })), [list]);
}

export function usePayables(): PayableRow[] {
  const list = useAppStore((s) => s.money.payables);
  return useMemo(() => list.map((p) => ({ ...p, balance: balance(p), status: payStatus(p) })), [list]);
}

export function usePayments(side: Side): MoneyPayment[] {
  return useAppStore((s) => (side === "rcv" ? s.money.rcvPayments : s.money.payPayments));
}

export function useBulkPayments(side: Side): MoneyPayment[] {
  const list = usePayments(side);
  return useMemo(() => list.filter((p) => p.type === "Bulk"), [list]);
}

function planRows(plans: Plan[], open: (target: string) => number): PlanRow[] {
  return plans.map((p) => {
    const done = p.paid >= p.count || open(p.target) === 0;
    const status = done && p.status.label === "Active" ? { label: "Completed", tone: "success" as const } : p.status;
    const next = planNextDue(p);
    return { ...p, status, progress: `${p.paid} of ${p.count} paid`, nextDue: done || !next || status.label !== "Active" ? "—" : fmtDate(next) };
  });
}

export function usePlans(side: Side): PlanRow[] {
  const plans = useAppStore((s) => (side === "rcv" ? s.money.rcvPlans : s.money.payPlans));
  const items = useAppStore((s) => (side === "rcv" ? s.money.receivables : s.money.payables));
  return useMemo(() => {
    const bal = new Map<string, number>(items.map((x) => [x.ref, balance(x)]));
    return planRows(plans, (t) => bal.get(t) ?? 0);
  }, [plans, items]);
}

export function useCredits(side: Side): CreditRow[] {
  const list = useAppStore((s) => (side === "rcv" ? s.money.customerCredits : s.money.supplierCredits));
  return useMemo(() => list.map((c: Credit) => ({ ...c, left: creditLeft(c), status: creditStatus(c) })), [list]);
}

/** Open items for a party, oldest due first. Payables: Approved only. Receivables: not voided. */
export function useOpenItems(side: Side, party: string): (ReceivableRow | PayableRow)[] {
  const rcv = useReceivables();
  const pay = usePayables();
  return useMemo(() => {
    if (!party) return [];
    const list: (ReceivableRow | PayableRow)[] =
      side === "rcv" ? rcv.filter((r) => r.party === party && r.balance > 0 && !r.voided) : pay.filter((p) => p.party === party && p.balance > 0 && p.approval === "Approved");
    return [...list].sort((a, b) => a.due.localeCompare(b.due));
  }, [side, party, rcv, pay]);
}

/** Credit the party can still use (not voided, not expired). */
export function useUsableCredit(side: Side, party: string): number {
  const list = useAppStore((s) => (side === "rcv" ? s.money.customerCredits : s.money.supplierCredits));
  return useMemo(() => list.filter((c) => c.party === party && creditUsable(c)).reduce((a, c) => a + creditLeft(c), 0), [list, party]);
}

/** Parties for the payment form pickers: customers / suppliers that appear in the lists. */
export function useMoneyParties(side: Side): string[] {
  const customers = useAppStore((s) => s.customers);
  const suppliers = useAppStore((s) => s.suppliers);
  const rcv = useAppStore((s) => s.money.receivables);
  const pay = useAppStore((s) => s.money.payables);
  return useMemo(() => {
    const names = side === "rcv" ? [...customers.map((c) => c.name), ...rcv.map((r) => r.party)] : [...suppliers.map((x) => x.name), ...pay.map((p) => p.party)];
    return [...new Set(names)];
  }, [side, customers, suppliers, rcv, pay]);
}

export function useStatementFilter() {
  return useAppStore((s) => s.money.statement);
}

/**
 * Receivables statement (applied filter: raised date within from–to, customer) or Supplier ageing
 * (payables not Rejected), grouped into the design's age buckets.
 */
export function useAgeing(side: Side): AgeingRow[] {
  const rcv = useReceivables();
  const pay = usePayables();
  const f = useStatementFilter();
  return useMemo(() => {
    if (side === "pay") return ageing(pay.filter((p) => p.approval !== "Rejected").map((p) => ({ party: p.party, due: p.due, balance: p.balance })));
    return ageing(
      rcv
        .filter((r) => {
          // Design `rs`: a missing raised date counts as today; an empty from/to is ignored.
          const raised = r.raised || "2026-11-10";
          return !r.voided && (!f.from || raised >= f.from) && (!f.to || raised <= f.to) && (f.customer === "All customers" || r.party === f.customer);
        })
        .map((r) => ({ party: r.party, due: r.due, balance: r.balance })),
    );
  }, [side, rcv, pay, f]);
}
