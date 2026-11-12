"use client";
/** Purchases › Goods receipts: Ref, PO, Supplier, Location, Lines, Status. Row click and "View" open the receipt. */
import { useGoodsReceipts, type GoodsReceipt } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { PurchaseOverlays } from "./PurchaseOverlays";
import { usePurchaseOverlay } from "./shared";

export function GoodsReceiptList() {
  const receipts = useGoodsReceipts();
  const { open } = usePurchaseOverlay();
  const columns: DataColumn<GoodsReceipt>[] = [
    { key: "ref", title: "Ref", render: (r) => <span className="font-medium text-text">{r.ref}</span> },
    { key: "po", title: "PO" },
    { key: "supplier", title: "Supplier" },
    { key: "store", title: "Location" },
    { key: "lineCount", title: "Lines", numeric: true },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    { key: "_act", title: "", numeric: true, text: () => "", render: (r) => <RowActions items={[{ label: "View", onClick: () => open({ view: r.ref }) }]} /> },
  ];
  return (
    <>
      <DataTable columns={columns} rows={receipts} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} />
      <PurchaseOverlays />
    </>
  );
}
