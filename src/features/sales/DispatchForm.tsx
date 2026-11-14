"use client";
/** Dispatch goods against a sales order (feature 013, `?view=SO-…&step=dispatch`). */
import { useState } from "react";
import { dispatchOrder, itemName, leftToDispatch, type OrderRow } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";

export function DispatchForm({
  order,
  onClose,
  onDone,
}: {
  order: OrderRow;
  onClose: () => void;
  onDone: (deliveryNote: string) => void;
}) {
  const [qty, setQty] = useState<string[]>(() =>
    order.lines.map((l) => String(leftToDispatch(l))),
  );
  const [driver, setDriver] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const confirm = async () => {
    const r = await dispatchOrder({
      order: order.number,
      qty: qty.map((q) => Number(q) || 0),
      driver,
      vehicle,
      notes,
    });
    if (r.ok) onDone(r.value.number);
    else setError(r.message);
  };

  return (
    <Drawer
      open
      title={`Dispatch ${order.number}`}
      subtitle={`${order.customer} · from ${order.store}`}
      width={560}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <div role="table" aria-label="Items to send" className="flex flex-col">
          <div
            role="row"
            className="type-table-head grid items-center gap-3 rounded-sm bg-canvas p-3 text-text-muted"
            style={{ gridTemplateColumns: "minmax(0,1fr) 70px 96px" }}
          >
            <span role="columnheader">Item</span>
            <span role="columnheader" className="text-right">
              Left
            </span>
            <span role="columnheader" className="text-right">
              Send now
            </span>
          </div>
          {order.lines.map((l, i) => {
            const left = leftToDispatch(l);
            return (
              <div
                role="row"
                key={`${itemName(l)}|${l.unit}|${i}`}
                className="grid items-center gap-3 border-b border-border px-3 py-2"
                style={{ gridTemplateColumns: "minmax(0,1fr) 70px 96px" }}
              >
                <span
                  role="cell"
                  className="type-label min-w-0 break-words text-text"
                >
                  {itemName(l)}
                  <span className="type-caption block font-normal text-text-muted">
                    {l.unit}
                  </span>
                </span>
                <span
                  role="cell"
                  className="type-body u-num text-right text-text"
                >
                  {left}
                </span>
                <span role="cell">
                  <Input
                    size="sm"
                    type="number"
                    min="0"
                    max={left}
                    disabled={left === 0}
                    aria-label={`Send now: ${itemName(l)}`}
                    value={qty[i] ?? "0"}
                    onChange={(e) => {
                      setQty((q) =>
                        q.map((x, j) => (j === i ? e.target.value : x)),
                      );
                      setError("");
                    }}
                  />
                </span>
              </div>
            );
          })}
        </div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}
        >
          <Input
            label="Driver"
            placeholder="Driver's name"
            value={driver}
            onChange={(e) => {
              setDriver(e.target.value);
              setError("");
            }}
          />
          <Input
            label="Vehicle registration"
            placeholder="For example, KDG 412X"
            value={vehicle}
            onChange={(e) => {
              setVehicle(e.target.value);
              setError("");
            }}
          />
        </div>
        <Textarea
          label="Notes (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button icon="truck" onClick={confirm}>
            Confirm dispatch
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
