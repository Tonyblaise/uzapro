"use client";
/**
 * Customers › Customer credits / Suppliers › Supplier credit notes: Ref, Customer/Supplier, Reason/Source, Issued (with
 * "Expires …"), Amount, Used, Left, Status. Row actions Use to pay (opens the payment form with
 * the credit method) and Void credit (only while unused).
 */
import { useCredits, type CreditRow, type Pill, type Side } from "@/data";
import { useCreditActions } from "./CreditBits";
import { MoneyKpis } from "./MoneyKpis";
import { MoneyOverlays } from "./MoneyOverlays";
import { MoneyTable, Stack, col, docDate, fmt, pillCol, type MoneyCol } from "./shared";

/** The design voids a credit by setting Used to the amount, so Left reads 0 and the pill is red. */
const used = (c: CreditRow) => (c.voided ? c.amount : c.used);
const left = (c: CreditRow) => (c.voided ? 0 : c.left);
const status = (c: CreditRow): Pill => (c.voided ? { label: "Voided", tone: "danger" } : c.status);

export function CreditList({ side }: { side: Side }) {
  const rows = useCredits(side);
  const creditItems = useCreditActions(side);
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
        actions={creditItems}
      />
      <MoneyOverlays side={side} />
    </Stack>
  );
}
