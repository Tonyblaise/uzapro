"use client";
/** Sales order record (feature 013, `?view=SO-…`): lines with ordered, dispatched and left; delivery notes; invoices. */
import Link from "next/link";
import { canDispatch, canEditOrder, canInvoice, itemName, leftToDispatch, useMyApprovals, useOrder, useOrderDeliveries } from "@/data";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/ui/Can";
import { Drawer } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { Eyebrow, Panel, amount, docDate, money } from "./shared";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="type-label mt-0.5 text-text">{value}</div>
    </div>
  );
}

export function OrderView({
  number,
  onClose,
  onEdit,
  onDispatch,
  onInvoice,
  onCancel,
}: {
  number: string;
  onClose: () => void;
  onEdit: () => void;
  onDispatch: () => void;
  onInvoice: () => void;
  onCancel: () => void;
}) {
  const order = useOrder(number);
  const notes = useOrderDeliveries(number);
  // Feature 018: dispatching has its own right and does not need Write on Sales.
  const mayDispatch = useMyApprovals().dispatch;
  if (!order) {
    return (
      <Drawer open title={number} subtitle="Sales" onClose={onClose} width={860}>
        <div className="type-body text-text-muted">{number} is not in the list any more.</div>
      </Drawer>
    );
  }
  const heads = ["Item", "Unit", "Ordered", "Dispatched", "Left", "Rate", "Amount"];
  return (
    <Drawer open title={order.number} subtitle="Sales › Sales orders" onClose={onClose} width={860}>
      <div className="flex flex-col gap-5">
        <div>
          <StatusPill tone={order.status.tone}>{order.status.label}</StatusPill>
        </div>
        <div className="flex flex-wrap gap-2">
          {mayDispatch && canDispatch(order) && (
            <Button icon="truck" onClick={onDispatch}>
              Dispatch
            </Button>
          )}
          <Can need="write">
            {canInvoice(order) && (
              <Button variant={canDispatch(order) ? "secondary" : "primary"} icon="receipt" onClick={onInvoice}>
                Create invoice
              </Button>
            )}
            {canEditOrder(order) && (
              <Button variant="secondary" icon="pencil" onClick={onEdit}>
                Edit
              </Button>
            )}
          </Can>
          <Can need="delete">
            {canEditOrder(order) && (
              <Button variant="secondary" onClick={onCancel}>
                Cancel order
              </Button>
            )}
          </Can>
        </div>
        <Panel className="grid gap-4" >
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
            <Fact label="Customer" value={order.customer} />
            <Fact label="Order date" value={docDate(order.date)} />
            <Fact label="Deliver by" value={docDate(order.deliverBy)} />
            <Fact label="Dispatch from" value={order.store} />
            <Fact label="Taken by" value={order.by} />
            <Fact label="Total" value={money(order.amount)} />
          </div>
          {order.creditApproval && <Fact label="Credit approved by" value={`${order.creditApproval.by}: ${order.creditApproval.reason}`} />}
          {order.notes && <Fact label="Notes" value={order.notes} />}
        </Panel>

        <div className="overflow-x-auto" tabIndex={0} role="group" aria-label="Order lines">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                {heads.map((h, i) => (
                  <th key={h} scope="col" className={`type-eyebrow whitespace-nowrap p-2 text-text-muted ${i >= 2 ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.lines.map((l, i) => (
                <tr key={`${itemName(l)}|${l.unit}|${i}`} className="border-b border-border">
                  <td className="type-small p-2 font-medium text-text">{itemName(l)}</td>
                  <td className="type-small p-2 text-text">{l.unit}</td>
                  <td className="type-small u-num p-2 text-right text-text">{l.qty}</td>
                  <td className="type-small u-num p-2 text-right text-text">{l.dispatched}</td>
                  <td className={`type-small u-num p-2 text-right ${leftToDispatch(l) ? "font-semibold text-warning-text" : "text-text-muted"}`}>{leftToDispatch(l)}</td>
                  <td className="type-small u-num p-2 text-right text-text">{amount(l.rate)}</td>
                  <td className="type-small u-num p-2 text-right text-text">{amount(l.qty * l.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
          <Panel>
            <h3 className="type-card-title m-0 pb-2 text-text">Delivery notes</h3>
            {notes.length === 0 && <div className="type-small text-text-muted">Nothing dispatched yet.</div>}
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {notes.map((d) => (
                <li key={d.number} className="type-small flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/sales/deliveries?view=${d.number}`} className="font-medium text-green-700 underline">
                    {d.number}
                  </Link>
                  <span className="text-text-secondary">
                    {docDate(d.date)} · {d.items} {d.items === 1 ? "item" : "items"}
                  </span>
                  <StatusPill tone={d.status.tone}>{d.status.label}</StatusPill>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h3 className="type-card-title m-0 pb-2 text-text">Invoices</h3>
            {order.invoices.length === 0 && <div className="type-small text-text-muted">Not invoiced yet.</div>}
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {order.invoices.map((n) => (
                <li key={n} className="type-small">
                  <Link href={`/sales/invoices?view=${n}`} className="font-medium text-green-700 underline">
                    {n}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

      </div>
    </Drawer>
  );
}
