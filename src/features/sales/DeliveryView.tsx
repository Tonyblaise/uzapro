"use client";
/** Delivery note record (feature 013, `?view=DN-…`), with "Mark delivered" (proof of delivery) and print. */
import Link from "next/link";
import { useState } from "react";
import { DELIVERY_RETURN_REASONS, itemName, markDelivered, printDocument, returnDelivery, returnable, returnedQty, useDelivery, useMyApprovals, useOrder } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { Eyebrow, Panel, docDate } from "./shared";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="type-label mt-0.5 text-text">{children}</div>
    </div>
  );
}

export function DeliveryView({ number, onClose }: { number: string; onClose: () => void }) {
  const note = useDelivery(number);
  const [marking, setMarking] = useState(false);
  const mayDispatch = useMyApprovals().dispatch;
  const [receivedBy, setReceivedBy] = useState("");
  const [error, setError] = useState("");
  // Feature 019: goods that came back.
  const order = useOrder(note?.order ?? null);
  const [returning, setReturning] = useState(false);
  const [back, setBack] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [returnErr, setReturnErr] = useState("");
  if (!note) {
    return (
      <Drawer open title={number} subtitle="Sales" onClose={onClose} width={640}>
        <div className="type-body text-text-muted">{number} is not in the list any more.</div>
      </Drawer>
    );
  }
  const confirm = async () => {
    const r = await markDelivered(note.number, receivedBy);
    if (r.ok) setMarking(false);
    else setError(r.message);
  };
  const canReturn = note.lines.map((l) => returnable(note, order, l));
  const anyReturnable = canReturn.some((n) => n > 0);
  const confirmReturn = async () => {
    const r = await returnDelivery({ note: note.number, qty: note.lines.map((_, i) => Number(back[i]) || 0), reason });
    if (r.ok) {
      setReturning(false);
      setBack([]);
      setReason("");
    } else setReturnErr(r.message);
  };
  return (
    <Drawer open title={note.number} subtitle="Sales › Deliveries" onClose={onClose} width={640}>
      <div className="flex flex-col gap-5">
        <div>
          <StatusPill tone={note.status.tone}>{note.status.label}</StatusPill>
        </div>
        <Panel className="grid gap-4" >
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
            <Fact label="Order">
              <Link href={`/sales/sales-orders?view=${note.order}`} className="text-green-700 underline">
                {note.order}
              </Link>
            </Fact>
            <Fact label="Customer">{note.customer}</Fact>
            <Fact label="Dispatched from">{note.store}</Fact>
            <Fact label="Date">{docDate(note.date)}</Fact>
            <Fact label="Driver">{note.driver}</Fact>
            <Fact label="Vehicle">{note.vehicle}</Fact>
            <Fact label="Dispatched by">{note.by}</Fact>
            <Fact label="Received by">{note.delivered ? `${note.receivedBy}, ${note.deliveredAt}` : "Not delivered yet"}</Fact>
          </div>
          {note.notes && <Fact label="Notes">{note.notes}</Fact>}
        </Panel>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Item", "Unit", "Quantity", "Returned"].map((h, i) => (
                <th key={h} scope="col" className={`type-eyebrow p-2 text-text-muted ${i >= 2 ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {note.lines.map((l, i) => (
              <tr key={`${itemName(l)}|${l.unit}|${i}`} className="border-b border-border">
                <td className="type-small p-2 font-medium text-text">{itemName(l)}</td>
                <td className="type-small p-2 text-text">{l.unit}</td>
                <td className="type-small u-num p-2 text-right text-text">{l.qty}</td>
                <td className="type-small u-num p-2 text-right text-text">{returnedQty(note, l) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {note.returns.length > 0 && (
          <Panel>
            <h3 className="type-card-title m-0 pb-2 text-text">Returns</h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {note.returns.map((r) => (
                <li key={r.ref} className="type-small text-text">
                  <span className="font-medium">{r.ref}</span> · {docDate(r.date)} · {r.reason}
                  <span className="block text-text-secondary">{r.lines.map((l) => `${l.qty} ${l.unit} of ${itemName(l)}`).join(", ")}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {returning && (
          <div className="flex flex-col gap-3 rounded-md bg-canvas p-4">
            <div className="type-label text-text">Record return</div>
            {note.lines.map((l, i) => (
              <div key={`${itemName(l)}|${l.unit}|${i}`} className="grid items-end gap-3" style={{ gridTemplateColumns: "minmax(0,1fr) 110px" }}>
                <div className="type-small min-w-0 break-words text-text">
                  {itemName(l)}
                  <span className="type-caption block text-text-muted">
                    Can return {canReturn[i]} {l.unit}
                  </span>
                </div>
                <Input
                  size="sm"
                  type="number"
                  min="0"
                  max={canReturn[i]}
                  disabled={!canReturn[i]}
                  aria-label={`Return now: ${itemName(l)}`}
                  value={back[i] ?? "0"}
                  onChange={(e) => {
                    setBack((b) => note.lines.map((_, j) => (j === i ? e.target.value : (b[j] ?? "0"))));
                    setReturnErr("");
                  }}
                />
              </div>
            ))}
            <SearchSelect
              label="Reason"
              noun="reason"
              options={DELIVERY_RETURN_REASONS}
              value={reason}
              onChange={(v) => {
                setReason(v);
                setReturnErr("");
              }}
            />
            {returnErr && (
              <div role="alert" className="type-small text-danger-text">
                {returnErr}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={confirmReturn}>Confirm return</Button>
              <Button variant="secondary" onClick={() => setReturning(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {returning ? null : marking && !note.delivered ? (
          <div className="flex flex-col gap-3 rounded-md bg-canvas p-4">
            <Input
              label="Received by"
              placeholder="Name of the person who took the goods"
              value={receivedBy}
              error={error || undefined}
              onChange={(e) => {
                setReceivedBy(e.target.value);
                setError("");
              }}
            />
            <div className="flex gap-2">
              <Button icon="check" onClick={confirm}>
                Confirm delivery
              </Button>
              <Button variant="secondary" onClick={() => setMarking(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {!note.delivered && mayDispatch && (
              <Button icon="check" onClick={() => setMarking(true)}>
                Mark delivered
              </Button>
            )}
            {mayDispatch && anyReturnable && (
              <Button variant="secondary" onClick={() => setReturning(true)}>
                Record return
              </Button>
            )}
            <Button variant="secondary" icon="printer" onClick={() => void printDocument(note.number)}>
              Print delivery note
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
