"use client";
/**
 * Expenses › Expense categories: Category (with its colour), Parent, Monthly budget ("No limit"),
 * Spent this month ("{n} over" when above budget), Needs approval, Status. Row actions Edit / Delete
 * (Delete is disabled while an expense, recurring expense or sub-category uses the category).
 */
import { deleteExpenseCategory, useExpenseCategories, type CategoryRow } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { ExpenseOverlays } from "./ExpenseOverlays";
import { Dot, Stack, fmt, useExpenseOverlay } from "./shared";

const over = (c: CategoryRow) => !!c.budget && c.spent > c.budget;

const COLUMNS: DataColumn<CategoryRow>[] = [
  {
    key: "name",
    title: "Category",
    text: (c) => c.name,
    render: (c) => (
      <span className="inline-flex items-center gap-2 text-text">
        <Dot color={c.color} />
        {c.name}
      </span>
    ),
  },
  { key: "parent", title: "Parent", text: (c) => c.parent || "—" },
  { key: "budget", title: "Monthly budget (KES)", numeric: true, text: (c) => (c.budget ? fmt(c.budget) : "No limit") },
  {
    key: "spent",
    title: "Spent this month (KES)",
    numeric: true,
    text: (c) => (over(c) ? `${fmt(c.spent)} over` : fmt(c.spent)),
    render: (c) => (over(c) ? <StatusPill tone="danger">{`${fmt(c.spent)} over`}</StatusPill> : fmt(c.spent)),
  },
  { key: "approval", title: "Needs approval", text: (c) => (c.approval ? "Yes" : "No") },
  {
    key: "status",
    title: "Status",
    text: (c) => (c.active ? "Active" : "Inactive"),
    render: (c) => <StatusPill tone={c.active ? "success" : "neutral"}>{c.active ? "Active" : "Inactive"}</StatusPill>,
  },
];

export function CategoryList() {
  const rows = useExpenseCategories();
  const { open } = useExpenseOverlay();
  const columns: DataColumn<CategoryRow>[] = [
    ...COLUMNS,
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (c) => (
        <RowActions
          items={[
            { label: "Edit", onClick: () => open({ view: c.name }) },
            { label: "Delete", danger: true, disabled: c.inUse, onClick: () => void deleteExpenseCategory(c.name) },
          ]}
        />
      ),
    },
  ];
  return (
    <Stack>
      <DataTable columns={columns} rows={rows} rowKey={(c) => c.name} onRowClick={(c) => open({ view: c.name })} minWidth={900} />
      <ExpenseOverlays create="category" />
    </Stack>
  );
}
