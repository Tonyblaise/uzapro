"use client";
/**
 * Customer credits / Supplier credits: Ref, Customer/Supplier, Reason/Source, Issued (with
 * "Expires …"), Amount, Used, Left, Status. Row actions Use to pay (opens the payment form with
 * the credit method) and Void credit (only while unused).
 */
import { useCredits, voidCredit, type CreditRow, type Pill, type Side } from "@/data";
import { MoneyKpis } from "./MoneyKpis";
import { MoneyOverlays } from "./MoneyOverlays";
import { MoneyTable, Stack, col, docDate, fmt, pillCol, useMoneyOverlay, type MoneyCol } from "./shared";

const CREDIT: Record<Side, string> = { rcv: "Customer credit", pay: "Supplier credit" };

/** The design voids a credit by setting Used to the amount, so Left reads 0 and the pill is red. */
const used = (c: CreditRow) => (c.voided ? c.amount : c.used);
const left = (c: CreditRow) => (c.voided ? 0 : c.left);
const status = (c: CreditRow): Pill => (c.voided ? { label: "Voided", tone: "danger" } : c.status);

export function CreditList({ side }: { side: Side }) {
  const rows = useCredits(side);
  const { open } = useMoneyOverlay();
  const rcv = side === "rcv";
  const columns: MoneyCol<CreditRow>[] = [
    col("ref", "Ref", (c) => c.ref),
    col("party", rcv ? "Customer" : "Supplier", (c) => c.party),
    col("reason", rcv ? "Reason" : "Source", (c) => c.reason),
    col("issued", "Issued", (c) => c.issued, { note: (c) => (c.expires ? `Expires ${docDate(c.expires)}` : "") }),
    col("amount", "Amount (KES)", (c) => (rcv && c.currency && c.currency !== "KES" ? `${c.currency} ${fmt(c.amount)}` : fmt(c.amount)), { numeric: true }),
    col("used", "Used (KES)", (c) => fmt(used(c)), { numeric: true }),
    col("left", "Left (KES)", (c) => fmt(left(c)), { numeric: true }),
    pillCol("status", "Status", status),
  ];
  return (
    <Stack>
      <MoneyKpis side={side} />
      <MoneyTable
        side={side}
        columns={columns}
        rows={rows}
        rowKey={(c) => c.ref}
        minWidth={900}
        actions={(c) => [
          { label: "Use to pay", disabled: !left(c) || c.voided, onClick: () => open({ action: "pay", party: c.party, method: CREDIT[side], ref: c.ref }) },
          { label: "Void credit", danger: true, disabled: used(c) > 0 || c.voided, onClick: () => void voidCredit(side, c.ref) },
        ]}
      />
      <MoneyOverlays side={side} />
    </Stack>
  );
}
