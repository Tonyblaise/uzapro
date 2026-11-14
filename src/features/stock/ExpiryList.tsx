"use client";
/**
 * Stock › Expiry (feature 016): batches with their expiry dates, earliest first.
 * "Record batch" → `?action=new`. Expired batches can be written off as wastage.
 */
import { useState } from "react";
import { SOON_DAYS, removeBatch, useBatchRows, useCan, writeOffBatch, type BatchRow } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { date as fmtDate, num } from "@/lib/format";
import { BatchForm } from "./BatchForm";
import { useCanDelete, useOverlayParams } from "./shared";

export function ExpiryActions() {
  const { open } = useOverlayParams();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      Record batch
    </Button>
  );
}

export function ExpiryList() {
  const rows = useBatchRows();
  const { action, close } = useOverlayParams();
  const canWrite = useCan("write");
  const canDelete = useCanDelete();
  const [confirm, setConfirm] = useState<{ row: BatchRow; what: "writeoff" | "remove" } | null>(null);
  const expired = rows.filter((r) => r.days < 0).length;
  const soon = rows.filter((r) => r.days >= 0 && r.days <= SOON_DAYS).length;

  const columns: DataColumn<BatchRow>[] = [
    { key: "product", title: "Product", render: (r) => <span className="font-medium text-text">{r.product}</span> },
    { key: "store", title: "Store" },
    { key: "batch", title: "Batch" },
    { key: "expiry", title: "Expiry date", text: (r) => fmtDate(r.expiry) },
    { key: "days", title: "Days left", text: (r) => r.daysLabel },
    { key: "qty", title: "Quantity", numeric: true, text: (r) => num(r.qty) },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => {
        const items = [
          ...(canWrite && r.days < 0 ? [{ label: "Write off", need: "write" as const, onClick: () => setConfirm({ row: r, what: "writeoff" }) }] : []),
          ...(canDelete ? [{ label: "Remove", danger: true, onClick: () => setConfirm({ row: r, what: "remove" }) }] : []),
        ];
        return items.length ? <RowActions items={items} /> : null;
      },
    },
  ];

  const c = confirm?.row;
  return (
    <>
      <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-3">
        <div className="type-body text-text">
          <span className="font-semibold">{expired}</span> expired · <span className="font-semibold">{soon}</span> expiring in {SOON_DAYS} days
        </div>
        <div className="type-small text-text-secondary">Sales use the earliest expiry first and never use expired stock. Stock that is not in a batch is not listed here.</div>
      </div>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty="No batches recorded yet." noun="batch" minWidth={820} />
      <BatchForm open={action === "new"} onClose={close} />
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.what === "writeoff" ? `Write off batch ${c?.batch ?? ""}?` : `Remove batch ${c?.batch ?? ""}?`}
        message={
          c
            ? confirm.what === "writeoff"
              ? `${num(c.qty)} ${c.product} at ${c.store} will be recorded as wastage with the reason Expired.`
              : `The batch record goes. The ${num(c.qty)} ${c.product} stays in stock at ${c.store}, not in a batch.`
            : ""
        }
        confirmLabel={confirm?.what === "writeoff" ? "Write off" : "Remove"}
        danger
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) void (confirm.what === "writeoff" ? writeOffBatch(confirm.row.id) : removeBatch(confirm.row.id));
          setConfirm(null);
        }}
      />
    </>
  );
}
