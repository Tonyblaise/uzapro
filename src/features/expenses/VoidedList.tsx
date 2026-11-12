"use client";
/** Expenses › Voided: Ref, Date, Category, Payee, Amount, Voided on, Voided by, Reason. Row action View (expense view). */
import { useVoidedExpenses, type VoidedExpense } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { ExpenseOverlays } from "./ExpenseOverlays";
import { Stack, docDate, fmt, useExpenseOverlay } from "./shared";

const COLUMNS: DataColumn<VoidedExpense>[] = [
  { key: "ref", title: "Ref", text: (v) => v.ref },
  { key: "date", title: "Date", text: (v) => docDate(v.date) },
  { key: "category", title: "Category", text: (v) => v.category },
  { key: "payee", title: "Payee", text: (v) => v.payee },
  { key: "amount", title: "Amount (KES)", numeric: true, text: (v) => fmt(v.amount) },
  { key: "voidedOn", title: "Voided on", text: (v) => docDate(v.voidedOn) },
  { key: "voidedBy", title: "Voided by", text: (v) => v.voidedBy },
  { key: "reason", title: "Reason", text: (v) => v.reason },
];

export function VoidedList() {
  const rows = useVoidedExpenses();
  const { open } = useExpenseOverlay();
  const columns: DataColumn<VoidedExpense>[] = [
    ...COLUMNS,
    { key: "_act", title: "", numeric: true, width: 48, text: () => "", render: (v) => <RowActions items={[{ label: "View", onClick: () => open({ view: v.ref }) }]} /> },
  ];
  return (
    <Stack>
      <DataTable columns={columns} rows={rows} rowKey={(v) => v.ref} onRowClick={(v) => open({ view: v.ref })} minWidth={960} />
      <ExpenseOverlays />
    </Stack>
  );
}
