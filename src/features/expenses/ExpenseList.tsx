"use client";
/**
 * Expenses › Expenses (design `exp` table, composite cells at `m.id === 'exp' && activeTab.t === 'Expenses'`):
 * Date (Paid / Recorded / Bill), Reference and reason, Branch, Category and payee, Source account
 * (method or "Pay later"), Net amount ("− KES …" with the tax and cost note) and Status.
 * Row actions View / Approve (only while waiting approval) / Void (not for a partly paid bill).
 */
import { approveExpense, useExpenses, useUnvoidableExpenses, type Expense } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { ExpenseOverlays } from "./ExpenseOverlays";
import { Stack, docDate, expensePill, fmt2, useExpenseOverlay } from "./shared";

function Cell({ main, note, mainClass = "text-text", noteClass = "text-text-muted", right }: { main: string; note: string; mainClass?: string; noteClass?: string; right?: boolean }) {
  return (
    <span className={`inline-flex flex-col ${right ? "items-end" : ""}`}>
      <span className={mainClass}>{main}</span>
      <span className={`type-caption ${noteClass}`}>{note}</span>
    </span>
  );
}

const dateNote = (e: Expense) => (e.status === "Paid" ? "Paid" : e.status === "Unpaid bill" ? "Bill" : "Recorded");
const reasonNote = (e: Expense) => (e.reason === "—" ? "No reason given" : e.reason);
const payeeNote = (e: Expense) => (e.payee === "—" ? "No payee" : `Payee: ${e.payee}`);
const accountNote = (e: Expense) => (e.account === "Not paid yet" ? "Pay later" : e.method || "Cash");
const net = (e: Expense) => `− KES ${fmt2(e.amount)}`;
const netNote = (e: Expense) => [e.tax ? `Includes tax: ${fmt2(e.tax)}` : "No tax", ...(e.fee ? [`+ cost ${fmt2(e.fee)}`] : [])].join(" · ");

const COLUMNS: DataColumn<Expense>[] = [
  { key: "date", title: "Date", text: (e) => docDate(e.date), render: (e) => <Cell main={docDate(e.date)} note={dateNote(e)} /> },
  { key: "ref", title: "Reference and reason", text: (e) => e.ref, render: (e) => <Cell main={e.ref} note={reasonNote(e)} /> },
  { key: "branch", title: "Branch", text: (e) => e.branch || "All branches" },
  { key: "category", title: "Category and payee", text: (e) => e.category, render: (e) => <Cell main={e.category} note={payeeNote(e)} /> },
  { key: "account", title: "Source account", text: (e) => e.account, render: (e) => <Cell main={e.account} note={accountNote(e)} /> },
  {
    key: "amount",
    title: "Net amount",
    numeric: true,
    text: net,
    render: (e) => <Cell right main={net(e)} note={netNote(e)} mainClass="font-semibold text-danger-text" noteClass={e.tax ? "text-warning-text" : "text-text-muted"} />,
  },
  {
    key: "status",
    title: "Status",
    text: (e) => e.status,
    render: (e) => {
      const p = expensePill(e.status);
      return <StatusPill tone={p.tone}>{p.label}</StatusPill>;
    },
  },
];

export function ExpenseList() {
  const rows = useExpenses();
  const blocked = useUnvoidableExpenses();
  const { open } = useExpenseOverlay();
  const columns: DataColumn<Expense>[] = [
    ...COLUMNS,
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (e) => (
        <RowActions
          items={[
            { label: "View", onClick: () => open({ view: e.ref }) },
            { label: "Approve", disabled: e.status !== "Waiting approval", onClick: () => void approveExpense(e.ref) },
            { label: "Void", danger: true, disabled: blocked.includes(e.ref), onClick: () => open({ view: e.ref, step: "void" }) },
          ]}
        />
      ),
    },
  ];
  return (
    <Stack>
      <DataTable columns={columns} rows={rows} rowKey={(e) => e.ref} onRowClick={(e) => open({ view: e.ref })} minWidth={1080} />
      <ExpenseOverlays create="expense" />
    </Stack>
  );
}
