"use client";
/**
 * Payments and Bulk payments tabs for both sides. Payments: Ref, Date, Customer/Supplier,
 * Receivables/Payables, Method, Type, Amount, Verification with the filters Payment method,
 * Payment type, Verification and the row actions Verify / View. Bulk payments: the Payments list
 * filtered to type Bulk (design `activeTab.t === 'Bulk payments'`), row action View.
 */
import { useBulkPayments, usePayments, verifyPayment, type MoneyPayment, type Side } from "@/data";
import { MoneyKpis } from "./MoneyKpis";
import { MoneyOverlays } from "./MoneyOverlays";
import { MoneyTable, Stack, col, docDate, fmt, pillCol, useMoneyOverlay, type MoneyCol, type MoneyFilter } from "./shared";

const refs = (p: MoneyPayment) => Object.keys(p.alloc).join(", ");

const FILTERS: MoneyFilter<MoneyPayment>[] = [
  { label: "Payment method", all: "All methods", value: (p) => p.method },
  { label: "Payment type", all: "All types", value: (p) => p.type },
  { label: "Verification", all: "All", value: (p) => p.verification.label },
];

export function PaymentList({ side }: { side: Side }) {
  const rows = usePayments(side);
  const { open } = useMoneyOverlay();
  const rcv = side === "rcv";
  const columns: MoneyCol<MoneyPayment>[] = [
    col("ref", "Ref", (p) => p.ref),
    col("date", "Date", (p) => docDate(p.date)),
    col("party", rcv ? "Customer" : "Supplier", (p) => p.party),
    col("refs", rcv ? "Receivables" : "Payables", refs),
    col("method", "Method", (p) => p.method),
    col("type", "Type", (p) => p.type),
    col("amount", "Amount (KES)", (p) => fmt(p.amount), { numeric: true }),
    pillCol("verification", "Verification", (p) => p.verification),
  ];
  return (
    <Stack>
      <MoneyKpis side={side} />
      <MoneyTable
        side={side}
        columns={columns}
        rows={rows}
        rowKey={(p) => p.ref}
        filters={FILTERS}
        minWidth={900}
        actions={(p) => [
          { label: "Verify", icon: "circle-check", disabled: p.verification.label === "Verified", onClick: () => void verifyPayment(side, p.ref) },
          { label: "View", onClick: () => open({ view: p.ref }) },
        ]}
      />
      <MoneyOverlays side={side} />
    </Stack>
  );
}

export function BulkPaymentList({ side }: { side: Side }) {
  const rows = useBulkPayments(side);
  const { open } = useMoneyOverlay();
  const rcv = side === "rcv";
  const columns: MoneyCol<MoneyPayment>[] = [
    col("ref", "Ref", (p) => p.ref),
    col("date", "Date", (p) => docDate(p.date)),
    col("party", rcv ? "Customer" : "Supplier", (p) => p.party),
    col("refs", rcv ? "Receivables paid" : "Payables paid", refs),
    col("method", "Method", (p) => p.method),
    col("amount", "Amount (KES)", (p) => fmt(p.amount), { numeric: true }),
  ];
  return (
    <Stack>
      <MoneyKpis side={side} />
      <MoneyTable side={side} columns={columns} rows={rows} rowKey={(p) => p.ref} actions={(p) => [{ label: "View", onClick: () => open({ view: p.ref }) }]} />
      <MoneyOverlays side={side} />
    </Stack>
  );
}
