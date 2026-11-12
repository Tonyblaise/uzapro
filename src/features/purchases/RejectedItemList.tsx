"use client";
/** Purchases › Rejected items: Ref, Goods receipt, Supplier, Item, Qty, Reason, Status. Row click and "View" open the item. */
import { useRejectedItems, type RejectedItem } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { PurchaseOverlays } from "./PurchaseOverlays";
import { usePurchaseOverlay } from "./shared";

export function RejectedItemList() {
  const items = useRejectedItems();
  const { open } = usePurchaseOverlay();
  const columns: DataColumn<RejectedItem>[] = [
    { key: "ref", title: "Ref", render: (r) => <span className="font-medium text-text">{r.ref}</span> },
    { key: "grn", title: "Goods receipt" },
    { key: "supplier", title: "Supplier" },
    { key: "item", title: "Item" },
    { key: "qty", title: "Qty", numeric: true },
    { key: "reason", title: "Reason" },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    { key: "_act", title: "", numeric: true, text: () => "", render: (r) => <RowActions items={[{ label: "View", onClick: () => open({ view: r.ref }) }]} /> },
  ];
  return (
    <>
      <DataTable columns={columns} rows={items} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} minWidth={720} />
      <PurchaseOverlays />
    </>
  );
}
