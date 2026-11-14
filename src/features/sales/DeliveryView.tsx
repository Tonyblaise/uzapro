"use client";
/** Delivery note record (feature 013, `?view=DN-…`), with "Mark delivered" (proof of delivery) and print. */
import Link from "next/link";
import { useState } from "react";
import { itemName, markDelivered, printDocument, useDelivery, useMyApprovals } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
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
              {["Item", "Unit", "Quantity"].map((h, i) => (
                <th key={h} scope="col" className={`type-eyebrow p-2 text-text-muted ${i === 2 ? "text-right" : "text-left"}`}>
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
              </tr>
            ))}
          </tbody>
        </table>

        {marking && !note.delivered ? (
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
            <Button variant="secondary" icon="printer" onClick={() => void printDocument(note.number)}>
              Print delivery note
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
