"use client";
/** Sales › Sales orders and Sales › Deliveries, with their overlays (feature 013). */
import { useCallback, useState } from "react";
import { cancelOrder, canDispatch, canEditOrder, canInvoice, invoiceOrder, printDocument, useDeliveries, useOrders, type DeliveryRow, type OrderRow } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { DeliveryView } from "./DeliveryView";
import { DispatchForm } from "./DispatchForm";
import { OrderForm } from "./OrderForm";
import { OrderView } from "./OrderView";
import { Lead, amount, docDate, useOverlay, useStatusFilter } from "./shared";

export function NewOrderAction() {
  const { open } = useOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "order" })}>
      New order
    </Button>
  );
}

export function OrderList() {
  const rows = useOrders();
  const { params, open, close } = useOverlay();
  const [cancel, setCancel] = useState<string | null>(null);
  const pill = useCallback((r: OrderRow) => r.status.label, []);
  const filter = useStatusFilter(rows, pill);
  const view = params.get("view");
  const step = params.get("step");
  const editing = rows.find((o) => o.number === params.get("edit") && canEditOrder(o));
  const viewing = view ? rows.find((o) => o.number === view) : undefined;

  const items = (r: OrderRow): MenuItem[] => [
    { label: "View", onClick: () => open({ view: r.number }) },
    ...(canEditOrder(r) ? [{ label: "Edit", onClick: () => open({ edit: r.number }) }] : []),
    ...(canDispatch(r) ? [{ label: "Dispatch", icon: "truck" as const, onClick: () => open({ view: r.number, step: "dispatch" }) }] : []),
    ...(canInvoice(r) ? [{ label: "Create invoice", icon: "receipt" as const, onClick: () => void invoiceOrder(r.number) }] : []),
    ...(canEditOrder(r) ? [{ label: "Cancel order", danger: true, onClick: () => setCancel(r.number) }] : []),
  ];
  const columns: DataColumn<OrderRow>[] = [
    { key: "number", title: "Order #", render: (r) => <Lead>{r.number}</Lead> },
    { key: "customer", title: "Customer" },
    { key: "date", title: "Order date", text: (r) => docDate(r.date) },
    { key: "deliverBy", title: "Deliver by", text: (r) => docDate(r.deliverBy) },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    { key: "amount", title: "Amount (KES)", numeric: true, text: (r) => amount(r.amount) },
    { key: "_act", title: "", numeric: true, width: 48, text: () => "", render: (r) => <RowActions items={items(r)} /> },
  ];
  return (
    <>
      <DataTable columns={columns} rows={filter.shown} rowKey={(r) => r.number} onRowClick={(r) => open({ view: r.number })} filters={filter.control} noun="order" />
      {params.get("action") === "order" && <OrderForm onClose={close} />}
      {editing && <OrderForm key={editing.number} edit={editing} onClose={close} />}
      {view && step !== "dispatch" && (
        <OrderView
          number={view}
          onClose={close}
          onEdit={() => open({ edit: view })}
          onDispatch={() => open({ view, step: "dispatch" })}
          onInvoice={() => void invoiceOrder(view)}
          onCancel={() => setCancel(view)}
        />
      )}
      {viewing && step === "dispatch" && canDispatch(viewing) && <DispatchForm key={viewing.number} order={viewing} onClose={() => open({ view: viewing.number })} onDone={() => open({ view: viewing.number })} />}
      <ConfirmDialog
        open={cancel !== null}
        title={`Cancel ${cancel ?? ""}?`}
        message="The order stays in the list as Cancelled. Nothing has been dispatched, so no stock changes."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        danger
        onClose={() => setCancel(null)}
        onConfirm={() => {
          if (cancel) void cancelOrder(cancel);
          setCancel(null);
        }}
      />
    </>
  );
}

export function DeliveryList() {
  const rows = useDeliveries();
  const { params, open, close } = useOverlay();
  const pill = useCallback((r: DeliveryRow) => r.status.label, []);
  const filter = useStatusFilter(rows, pill);
  const view = params.get("view");
  const columns: DataColumn<DeliveryRow>[] = [
    { key: "number", title: "Delivery note", render: (r) => <Lead>{r.number}</Lead> },
    { key: "order", title: "Order" },
    { key: "customer", title: "Customer" },
    { key: "date", title: "Date", text: (r) => docDate(r.date) },
    { key: "driver", title: "Driver" },
    { key: "vehicle", title: "Vehicle" },
    { key: "items", title: "Items", numeric: true, text: (r) => String(r.items) },
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
            { label: "View", onClick: () => open({ view: r.number }) },
            { label: "Print", need: "read", onClick: () => void printDocument(r.number) },
          ]}
        />
      ),
    },
  ];
  return (
    <>
      <DataTable columns={columns} rows={filter.shown} rowKey={(r) => r.number} onRowClick={(r) => open({ view: r.number })} filters={filter.control} noun="delivery note" minWidth={860} />
      {view && <DeliveryView key={view} number={view} onClose={close} />}
    </>
  );
}
