"use client";
/**
 * Payment plans for both sides: Ref, Customer/Supplier, Receivable/Payable, Total, Instalments
 * ("1 of 3 paid"), Each, Next due, Status. Row actions Record instalment (customer) or Pay
 * instalment (supplier), and Cancel plan, both only while Active.
 */
import { cancelPlan, usePayables, usePlans, useReceivables, type PlanRow, type Side } from "@/data";
import { MoneyKpis } from "./MoneyKpis";
import { MoneyOverlays } from "./MoneyOverlays";
import { MoneyTable, Stack, col, fmt, pillCol, useMoneyOverlay, type MoneyCol } from "./shared";

export function PlanList({ side }: { side: Side }) {
  const rows = usePlans(side);
  const receivables = useReceivables();
  const payables = usePayables();
  const { open } = useMoneyOverlay();
  const rcv = side === "rcv";
  const balanceOf = (ref: string) => (rcv ? receivables : payables).find((x) => x.ref === ref)?.balance;
  const columns: MoneyCol<PlanRow>[] = [
    col("ref", "Ref", (p) => p.ref),
    col("party", rcv ? "Customer" : "Supplier", (p) => p.party),
    col("target", rcv ? "Receivable" : "Payable", (p) => p.target),
    col("total", "Total (KES)", (p) => fmt(p.total), { numeric: true }),
    col("progress", "Instalments", (p) => p.progress),
    col("each", "Each (KES)", (p) => fmt(p.each), { numeric: true }),
    col("next", "Next due", (p) => p.nextDue),
    pillCol("status", "Status", (p) => p.status),
  ];
  return (
    <Stack>
      <MoneyKpis side={side} />
      <MoneyTable
        side={side}
        columns={columns}
        rows={rows}
        rowKey={(p) => p.ref}
        minWidth={900}
        actions={(p) => [
          {
            label: rcv ? "Record instalment" : "Pay instalment",
            disabled: p.status.label !== "Active",
            onClick: () => {
              const bal = balanceOf(p.target);
              if (bal === undefined) return;
              open({ action: "pay", party: p.party, sel: p.target, amount: String(Math.min(p.each, bal)), plan: p.ref });
            },
          },
          { label: "Cancel plan", danger: true, disabled: p.status.label !== "Active", onClick: () => void cancelPlan(side, p.ref) },
        ]}
      />
      <MoneyOverlays side={side} />
    </Stack>
  );
}
