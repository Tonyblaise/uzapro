"use client";
/**
 * Expenses › Recurring: Ref, Name, Category, Paid from, Amount, Repeats, Next date, Status.
 * Row actions Edit / Record now (only while Active) / Pause or Resume (not when Ended) / Delete.
 */
import { deleteRecurring, recordRecurringNow, setRecurringActive, useRecurring, type RecurringRow } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { ExpenseOverlays } from "./ExpenseOverlays";
import { Stack, docDate, fmt, useExpenseOverlay } from "./shared";

const COLUMNS: DataColumn<RecurringRow>[] = [
  { key: "ref", title: "Ref", text: (r) => r.ref },
  { key: "name", title: "Name", text: (r) => r.name },
  { key: "category", title: "Category", text: (r) => r.category },
  { key: "account", title: "Paid from", text: (r) => r.account },
  { key: "amount", title: "Amount (KES)", numeric: true, text: (r) => fmt(r.amount) },
  { key: "repeats", title: "Repeats", text: (r) => r.repeats },
  { key: "next", title: "Next date", text: (r) => (r.nextDate ? docDate(r.nextDate) : "—") },
  { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
];

export function RecurringList() {
  const rows = useRecurring();
  const { open } = useExpenseOverlay();
  const columns: DataColumn<RecurringRow>[] = [
    ...COLUMNS,
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => {
        const paused = r.status.label === "Paused";
        return (
          <RowActions
            items={[
              { label: "Edit", onClick: () => open({ view: r.ref }) },
              { label: "Record now", disabled: r.status.label !== "Active", onClick: () => void recordRecurringNow(r.ref) },
              { label: paused ? "Resume" : "Pause", disabled: r.status.label === "Ended", onClick: () => void setRecurringActive(r.ref, paused) },
              { label: "Delete", danger: true, onClick: () => void deleteRecurring(r.ref) },
            ]}
          />
        );
      },
    },
  ];
  return (
    <Stack>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} minWidth={1000} />
      <ExpenseOverlays create="recurring" />
    </Stack>
  );
}
