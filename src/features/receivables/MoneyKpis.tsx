"use client";
/** The design's `expKpis` for `rcv` (every tab but the statement) and `pay` (every tab). */
import { useCredits, usePayables, usePayments, useReceivables, type Side } from "@/data";
import { KpiStrip, fmt, type Kpi } from "./shared";

/** Payments dated in November 2026 (design `/Nov 2026$/`). */
const inNovember = (iso: string) => iso.startsWith("2026-11");

function useRcvKpis(): Kpi[] {
  const rv = useReceivables();
  const pays = usePayments("rcv");
  const credits = useCredits("rcv");
  const out = rv.reduce((a, r) => a + r.balance, 0);
  const late = rv.filter((r) => r.status.label === "Overdue");
  const credit = credits.filter((c) => !c.voided).reduce((a, c) => a + c.left, 0);
  const month = pays.filter((p) => inNovember(p.date)).reduce((a, p) => a + p.amount, 0);
  return [
    { label: "Customers owe you", value: `KES ${fmt(out)}`, note: `${rv.filter((r) => r.balance > 0).length} open receivables`, color: "text-info-text" },
    { label: "Overdue", value: `KES ${fmt(late.reduce((a, r) => a + r.balance, 0))}`, note: `${late.length} past their due date`, color: "text-danger-text" },
    { label: "Collected this month", value: `KES ${fmt(month)}`, note: "Payments in November", color: "text-green-700" },
    { label: "Customer credit", value: `KES ${fmt(credit)}`, note: "Available to use", color: "text-warning-text" },
  ];
}

function usePayKpis(): Kpi[] {
  const pv = usePayables();
  const pays = usePayments("pay");
  const owe = pv.reduce((a, r) => a + r.balance, 0);
  const late = pv.filter((r) => r.status.label === "Overdue");
  const wait = pv.filter((r) => r.approval === "Waiting approval");
  const month = pays.filter((p) => inNovember(p.date)).reduce((a, p) => a + p.amount, 0);
  return [
    { label: "You owe suppliers", value: `KES ${fmt(owe)}`, note: `${pv.filter((r) => r.balance > 0).length} open payables`, color: "text-info-text" },
    { label: "Overdue", value: `KES ${fmt(late.reduce((a, r) => a + r.balance, 0))}`, note: `${late.length} past their due date`, color: "text-danger-text" },
    { label: "Paid this month", value: `KES ${fmt(month)}`, note: "Supplier payments in November", color: "text-green-700" },
    {
      label: "Waiting approval",
      value: String(wait.length),
      note: wait.length ? `KES ${fmt(wait.reduce((a, r) => a + r.balance, 0))} to approve` : "Nothing to approve",
      color: "text-warning-text",
    },
  ];
}

function RcvKpis() {
  return <KpiStrip kpis={useRcvKpis()} />;
}

function PayKpis() {
  return <KpiStrip kpis={usePayKpis()} />;
}

export function MoneyKpis({ side }: { side: Side }) {
  return side === "rcv" ? <RcvKpis /> : <PayKpis />;
}
