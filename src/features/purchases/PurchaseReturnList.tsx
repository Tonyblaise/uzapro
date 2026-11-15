"use client";
/**
 * Purchases › Purchase returns: Ref, Supplier, Purchase order, Goods receipt, Reason, Qty, Value (KES),
 * Status. Row actions View and Approve (disabled once Approved). Header action "New purchase return".
 */
import { approvePurchaseReturn, usePurchaseReturns, type PurchaseReturn } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { PurchaseOverlays } from "./PurchaseOverlays";
import { amount, usePurchaseOverlay } from "./shared";

export function NewPurchaseReturnAction() {
  const { open } = usePurchaseOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New purchase return
    </Button>
  );
}

export function PurchaseReturnList() {
  const returns = usePurchaseReturns();
  const { open } = usePurchaseOverlay();
  const columns: DataColumn<PurchaseReturn>[] = [
    { key: "ref", title: "Ref", render: (r) => <span className="font-medium text-text">{r.ref}</span> },
    { key: "supplier", title: "Supplier" },
    { key: "po", title: "Purchase order" },
    { key: "grn", title: "Goods receipt" },
    { key: "reason", title: "Reason" },
    { key: "qty", title: "Qty", numeric: true },
    { key: "value", title: "Value (KES)", numeric: true, text: (r) => amount(r.value) },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "View", onClick: () => open({ view: r.ref }) },
            { label: "Approve", disabled: r.status.label === "Approved", onClick: () => void approvePurchaseReturn(r.ref, "list") },
          ]}
        />
      ),
    },
  ];
  return (
    <>
      <DataTable columns={columns} rows={returns} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} minWidth={760} />
      <PurchaseOverlays create="return" />
    </>
  );
}
