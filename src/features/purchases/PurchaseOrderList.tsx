"use client";
/**
 * Purchases › Purchase orders: Supplier, Ref, Total, Received, Status. Row click opens the order;
 * row actions View, Edit, Accept, Accept and receive goods, Download PDF (design `m.id === 'buy'`
 * row actions). Header action "New purchase order" (also on the Overview).
 */
import { acceptPurchaseOrder, downloadPurchasePdf, usePurchaseOrders, type PurchaseOrder } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { PurchaseOverlays } from "./PurchaseOverlays";
import { amount, usePurchaseOverlay } from "./shared";

export function NewPurchaseOrderAction() {
  const { open } = usePurchaseOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New purchase order
    </Button>
  );
}

export function PurchaseOrderList() {
  const orders = usePurchaseOrders();
  const { open } = usePurchaseOverlay();
  const columns: DataColumn<PurchaseOrder>[] = [
    { key: "supplier", title: "Supplier", render: (r) => <span className="font-medium text-text">{r.supplier}</span> },
    { key: "ref", title: "Ref" },
    { key: "total", title: "Total", numeric: true, text: (r) => amount(r.total) },
    { key: "received", title: "Received", text: (r) => r.received.label, render: (r) => <StatusPill tone={r.received.tone}>{r.received.label}</StatusPill> },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      text: () => "",
      render: (r) => {
        const st = r.status.label;
        return (
          <RowActions
            items={[
              { label: "View", onClick: () => open({ view: r.ref }) },
              { label: "Edit", onClick: () => open({ edit: r.ref }) },
              { label: "Accept", disabled: st === "Accepted" || st === "Completed", onClick: () => void acceptPurchaseOrder(r.ref) },
              { label: "Accept and receive goods", disabled: st === "Completed", onClick: () => open({ view: r.ref, step: "receive" }) },
              { label: "Download PDF", onClick: () => void downloadPurchasePdf(r.ref) },
            ]}
          />
        );
      },
    },
  ];
  return (
    <>
      <DataTable columns={columns} rows={orders} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} />
      <PurchaseOverlays create="order" />
    </>
  );
}
