"use client";
/**
 * Field sales › Field sales, Sales reps and Deliveries (feature 024, design `UZ_MODS` field). A
 * field sale's row opens its delivery (`?view=DLV-…`); a rep's row lists that rep's sales (`?rep=`).
 */
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { hrefFor } from "@/config/modules";
import { deliveryOpen, fieldTotal, setFieldRepActive, useCan, useCanSee, useFieldReps, useFieldSales, type FieldRepRow, type FieldSale } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { FieldDeliveryView } from "./FieldDeliveryView";
import { docDate, useOverlay } from "../sales/shared";
import { NewFieldSaleForm } from "./NewFieldSaleForm";
import { RepForm } from "./RepForm";
import { TwoLine, deliveryPill, itemCount, k0, payPill } from "./shared";

/** Opens the form on the Field sales tab (from Sales reps too). */
export function NewFieldSaleAction() {
  const router = useRouter();
  // The Store keeper sees only Deliveries (design UZ_ROLES), so takes no orders.
  const canTake = useCanSee("field", "Field sales");
  if (!canTake) return null;
  return (
    <Button icon="plus" onClick={() => router.push(hrefFor("field", "Field sales", { action: "new" }), { scroll: false })}>
      New field sale
    </Button>
  );
}

/** "New sales rep" on the Sales reps tab (design). */
export function NewRepAction() {
  const { open } = useOverlay();
  if (!useCan("write")) return null;
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New sales rep
    </Button>
  );
}

/** "New delivery" on the Deliveries tab (design): a delivery on its own, not a field sale. */
export function NewDeliveryAction() {
  const { open } = useOverlay();
  if (!useCan("write")) return null;
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New delivery
    </Button>
  );
}

export function FieldSalesList() {
  const all = useFieldSales();
  const { params, open, close } = useOverlay();
  const rep = params.get("rep");
  const rows = useMemo(() => all.filter((x) => x.kind !== "delivery" && (!rep || x.rep === rep)), [all, rep]);
  const view = params.get("view");
  const columns: DataColumn<FieldSale>[] = [
    { key: "ref", title: "Sale", text: (x) => x.ref, render: (x) => <TwoLine strong main={x.ref} note={`${docDate(x.date)}, ${x.time}`} /> },
    { key: "rep", title: "Rep and route", text: (x) => `${x.rep} ${x.route}`, render: (x) => <TwoLine main={x.rep} note={x.route || "—"} /> },
    { key: "customer", title: "Customer and location", text: (x) => `${x.customer} ${x.location}`, render: (x) => <TwoLine main={x.customer} note={x.location} /> },
    { key: "items", title: "Items", numeric: true, text: (x) => String(itemCount(x)) },
    { key: "total", title: "Total (KES)", numeric: true, text: (x) => k0(fieldTotal(x)) },
    { key: "pay", title: "Payment", text: (x) => payPill(x).label, render: (x) => <StatusPill tone={payPill(x).tone}>{payPill(x).label}</StatusPill> },
    { key: "delivery", title: "Delivery", text: (x) => x.delivery.status, render: (x) => <StatusPill tone={deliveryPill(x).tone}>{deliveryPill(x).label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (x) => <RowActions items={[{ label: "View delivery", need: "read", onClick: () => open({ view: x.delivery.ref }) }]} />,
    },
  ];
  return (
    <>
      {rep && (
        <div className="type-small flex flex-wrap items-center gap-2 text-text-secondary">
          Showing {rep}&apos;s sales.
          <button type="button" onClick={close} className="font-semibold text-green-700">
            Show all reps
          </button>
        </div>
      )}
      <DataTable columns={columns} rows={rows} rowKey={(x) => x.ref} onRowClick={(x) => open({ view: x.delivery.ref })} noun="field sale" minWidth={980} empty="No field sales yet." />
      {params.get("action") === "new" && <NewFieldSaleForm onClose={close} />}
      {view && <FieldDeliveryView key={view} refId={view} onClose={close} />}
    </>
  );
}

export function RepsList() {
  const reps = useFieldReps();
  const router = useRouter();
  const canWrite = useCan("write");
  const { params, open, close } = useOverlay();
  const editing = reps.find((r) => r.name === params.get("edit"));
  const sales = (r: FieldRepRow) => router.push(hrefFor("field", "Field sales", { rep: r.name }));
  const columns: DataColumn<FieldRepRow>[] = [
    { key: "name", title: "Rep", text: (r) => `${r.name} ${r.phone}`, render: (r) => <TwoLine strong main={r.name} note={r.phone} /> },
    { key: "route", title: "Route" },
    { key: "vehicle", title: "Vehicle" },
    { key: "today", title: "Orders today", numeric: true, text: (r) => String(r.ordersToday) },
    { key: "sales", title: "Sales (KES)", numeric: true, text: (r) => k0(r.sales) },
    { key: "open", title: "Open deliveries", numeric: true, text: (r) => String(r.openDeliveries) },
    {
      key: "status",
      title: "Status",
      text: (r) => (r.active === false ? "Off duty" : "On route"),
      render: (r) => <StatusPill tone={r.active === false ? "neutral" : "success"}>{r.active === false ? "Off duty" : "On route"}</StatusPill>,
    },
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "See their sales", need: "read", onClick: () => sales(r) },
            ...(canWrite
              ? [
                  { label: "Edit", onClick: () => open({ edit: r.name }) },
                  { label: r.active === false ? "Mark on route" : "Mark off duty", onClick: () => void setFieldRepActive(r.name, r.active === false) },
                ]
              : []),
          ]}
        />
      ),
    },
  ];
  return (
    <>
      <DataTable columns={columns} rows={reps} rowKey={(r) => r.name} onRowClick={sales} noun="rep" minWidth={900} />
      {params.get("action") === "new" && <RepForm onClose={close} />}
      {editing && <RepForm key={editing.name} edit={editing} onClose={close} />}
    </>
  );
}

/**
 * Field sales › Deliveries (design): every field-sale delivery and delivery made on its own, those still to go out first (oldest
 * first, marked Today or Late), then delivered and cancelled ones (newest first).
 */
export function FieldDeliveryList() {
  const all = useFieldSales();
  const { params, open, close } = useOverlay();
  const rows = useMemo(
    () =>
      all.slice().sort((a, b) => {
        const oa = deliveryOpen(a.delivery);
        const ob = deliveryOpen(b.delivery);
        if (oa !== ob) return oa ? -1 : 1;
        return oa ? a.delivery.date.localeCompare(b.delivery.date) : b.delivery.date.localeCompare(a.delivery.date);
      }),
    [all],
  );
  const view = params.get("view");
  const columns: DataColumn<FieldSale>[] = [
    { key: "ref", title: "Delivery", text: (x) => `${x.delivery.ref} ${x.ref}`, render: (x) => <TwoLine strong main={x.delivery.ref} note={x.kind === "delivery" ? (x.link ? `For ${x.link}` : "Standalone") : `From ${x.ref}`} /> },
    { key: "customer", title: "Customer and location", text: (x) => `${x.customer} ${x.location}`, render: (x) => <TwoLine main={x.customer} note={x.location} /> },
    {
      key: "date",
      title: "Delivery date",
      text: (x) => docDate(x.delivery.date),
      render: (x) => {
        const isOpen = deliveryOpen(x.delivery);
        const late = isOpen && x.delivery.date < DEMO_TODAY;
        return <TwoLine main={docDate(x.delivery.date)} note={late ? "Late" : isOpen && x.delivery.date === DEMO_TODAY ? "Today" : ""} noteClass={late ? "text-danger-text" : "text-text-muted"} />;
      },
    },
    { key: "driver", title: "Driver and store", text: (x) => `${x.delivery.driver} ${x.store}`, render: (x) => <TwoLine main={x.delivery.driver} note={x.store} /> },
    { key: "items", title: "Items", numeric: true, text: (x) => String(itemCount(x)) },
    {
      key: "collect",
      title: "To collect (KES)",
      numeric: true,
      text: (x) => (x.pay.mode === "delivery" && !x.delivery.collected && x.delivery.status !== "Cancelled" ? k0(fieldTotal(x)) : "—"),
    },
    { key: "status", title: "Status", text: (x) => x.delivery.status, render: (x) => <StatusPill tone={deliveryPill(x).tone}>{deliveryPill(x).label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (x) => <RowActions items={[{ label: "View delivery", need: "read", onClick: () => open({ view: x.delivery.ref }) }]} />,
    },
  ];
  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(x) => x.delivery.ref} onRowClick={(x) => open({ view: x.delivery.ref })} noun="delivery" minWidth={900} empty="No deliveries yet." />
      {params.get("action") === "new" && <NewFieldSaleForm mode="delivery" onClose={close} />}
      {view && <FieldDeliveryView key={view} refId={view} onClose={close} />}
    </>
  );
}
