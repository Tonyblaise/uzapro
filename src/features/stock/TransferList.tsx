"use client";

import { useTransfers, type Transfer } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { date } from "@/lib/format";
import { transferPill, useOverlayParams } from "./shared";
import { TransferOverlay } from "./TransferForm";

/** Design "Transfer stock" table: Ref, Date, From, To, Products, Quantity, Status. */
export function TransferList() {
  const transfers = useTransfers();
  const { open } = useOverlayParams();
  const view = (t: Transfer) => open({ view: t.ref });

  // Design `transferActions`.
  const actions = (t: Transfer): MenuItem[] => {
    if (t.status === "In transit") return [{ label: "View", onClick: () => view(t) }, { label: "Mark as received", onClick: () => view(t) }];
    if (t.status === "Received" || t.status === "Cancelled") return [{ label: "View", onClick: () => view(t) }];
    return [
      { label: "Edit", onClick: () => view(t) },
      { label: "Cancel transfer", danger: true, onClick: () => open({ view: t.ref, cancel: "1" }) },
    ];
  };

  const columns: DataColumn<Transfer>[] = [
    { key: "ref", title: "Ref" },
    { key: "date", title: "Date", text: (t) => (t.date ? date(t.date) : "—") },
    { key: "from", title: "From" },
    { key: "to", title: "To" },
    { key: "products", title: "Products", numeric: true, text: (t) => String(t.items.length) },
    { key: "qty", title: "Quantity", numeric: true, text: (t) => String(t.items.reduce((a, i) => a + i.qty, 0)) },
    {
      key: "status",
      title: "Status",
      text: (t) => t.status,
      render: (t) => <StatusPill tone={transferPill(t.status).tone}>{t.status}</StatusPill>,
    },
    { key: "actions", title: "", width: 48, render: (t) => <RowActions items={actions(t)} /> },
  ];

  return (
    <>
      <DataTable columns={columns} rows={transfers} rowKey={(t) => t.ref} onRowClick={view} />
      <TransferOverlay />
    </>
  );
}
