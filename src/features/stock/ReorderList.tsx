"use client";
/**
 * Stock › Reorder (feature 014): each product and store with a reorder point, what is on hand and
 * on order, and what to order. Reorder points are set on a product's variant in the product form
 * (every store at once); here a store's line can be edited (`?edit=<product>|<store>`) or removed.
 */
import { useState } from "react";
import { createReorderDrafts, removeReorderRule, useCan, useReorderRows, type ReorderRow } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { num } from "@/lib/format";
import { ReorderForm } from "./ReorderForm";
import { useCanDelete, useOverlayParams } from "./shared";

const keyOf = (r: { product: string; store: string }) => `${r.product}|${r.store}`;
const suggested = (r: ReorderRow) => (r.units > 0 ? `${num(r.units)} ${r.unit}` : "—");

export function ReorderList() {
  const rows = useReorderRows();
  const { get, open, close } = useOverlayParams();
  const canWrite = useCan("write");
  const canBuy = useCan("write", "buy");
  const canDelete = useCanDelete();
  const [confirm, setConfirm] = useState<ReorderRow | null>(null);
  const editing = rows.find((r) => keyOf(r) === get("edit"));
  const due = rows.filter((r) => r.units > 0).length;

  const columns: DataColumn<ReorderRow>[] = [
    {
      key: "product",
      title: "Product",
      text: (r) => `${r.product} ${r.variant}`,
      render: (r) => (
        <span className="inline-flex flex-col">
          <span className="font-medium text-text">{r.product}</span>
          <span className="type-caption text-text-muted">Order: {r.variant}</span>
        </span>
      ),
    },
    { key: "store", title: "Store" },
    { key: "onHand", title: "On hand", numeric: true, text: (r) => num(r.onHand) },
    { key: "onOrder", title: "On order", numeric: true, text: (r) => (r.onOrder ? num(r.onOrder) : "—") },
    { key: "min", title: "Reorder at", numeric: true, text: (r) => num(r.min) },
    { key: "max", title: "Order up to", numeric: true, text: (r) => num(r.max) },
    {
      key: "units",
      title: "Suggested order",
      text: suggested,
      render: (r) =>
        r.units > 0 ? (
          <span className="inline-flex flex-col">
            <span className="font-semibold text-text">{suggested(r)}</span>
            {r.factor > 1 && <span className="type-caption text-text-muted">{num(r.need)} in base units</span>}
          </span>
        ) : (
          "—"
        ),
    },
    { key: "supplier", title: "Supplier", text: (r) => r.supplier || "Not set" },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "Edit", onClick: () => open({ edit: keyOf(r) }) },
            ...(canDelete ? [{ label: "Remove", danger: true, onClick: () => setConfirm(r) }] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <div className="type-body text-text">
          <span className="font-semibold">{due}</span> {due === 1 ? "line" : "lines"} to reorder
          <span className="type-small block text-text-secondary">A line is suggested when what is on hand and on order is at or below its reorder point.</span>
        </div>
        {canWrite && canBuy && (
          <Button variant="secondary" icon="shopping-cart" disabled={due === 0} onClick={() => void createReorderDrafts()}>
            Create draft purchase orders
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={keyOf}
        onRowClick={canWrite ? (r) => open({ edit: keyOf(r) }) : undefined}
        empty="No reorder points yet. Set them on a product's variants in Products › All products."
        noun="reorder point"
        minWidth={980}
      />
      <ReorderForm open={!!editing} edit={editing} onClose={close} />
      <ConfirmDialog
        open={!!confirm}
        title="Remove this reorder point?"
        message={confirm ? `${confirm.product} at ${confirm.store} will no longer be suggested for reordering.` : ""}
        confirmLabel="Remove"
        danger
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) void removeReorderRule(confirm.product, confirm.store);
          setConfirm(null);
        }}
      />
    </>
  );
}
