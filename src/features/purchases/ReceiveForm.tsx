"use client";
/**
 * Receive goods (design `isPoRecv`, `rv`, opened by `poRecvOpen`): "Receive {ref}", "Receive all as
 * ordered", Delivery details, Items to receive (Ordered / Received / Accepted / Rejected), "Accept all
 * received", and the Order summary with "Receive {n} lines". Opens with `?view=<ref>&step=receive`.
 */
import { useState } from "react";
import { receiveGoods, usePurchaseOrder, useRole, type PurchaseOrder } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { NotesField, Panel, PurchaseDrawer, Row, money, orderStatus, useStoreOptions } from "./shared";

interface RvLine {
  i: number;
  on: boolean;
  recv: string;
  acc: string;
}

const COLS = "28px minmax(0,1fr) 80px 96px 96px 80px 30px";
const n = (x: string) => Math.max(0, Number(x) || 0);
const left = (o: PurchaseOrder, i: number) => {
  const l = o.lines[i];
  return l ? Math.max(0, l.qty - l.recv) : 0;
};

export function ReceiveForm({ refId, onClose, onDone }: { refId: string; onClose: () => void; onDone: () => void }) {
  const order = usePurchaseOrder(refId);
  if (!order) {
    return (
      <PurchaseDrawer title="Receive goods" onClose={onClose}>
        <div className="type-body text-text-muted">That purchase order is not in the list.</div>
      </PurchaseDrawer>
    );
  }
  return <Form key={order.ref} order={order} onClose={onClose} onDone={onDone} />;
}

function Form({ order, onClose, onDone }: { order: PurchaseOrder; onClose: () => void; onDone: () => void }) {
  const who = useRole().name;
  const stores = useStoreOptions();
  const fill = () => order.lines.map((_, i) => ({ i, on: left(order, i) > 0, recv: String(left(order, i)), acc: String(left(order, i)) }));
  const [lines, setLines] = useState<RvLine[]>(fill);
  const [store, setStore] = useState(order.store);
  const [recvDate, setRecvDate] = useState("2026-11-10");
  const [dn, setDn] = useState("");
  const [inv, setInv] = useState("");
  const [notes, setNotes] = useState("");

  const setL = (i: number, patch: Partial<RvLine>) => setLines((ls) => ls.map((x) => (x.i === i ? { ...x, ...patch } : x)));
  const on = lines.filter((x) => x.on);
  const totRecv = on.reduce((a, x) => a + n(x.recv), 0);
  const totAcc = on.reduce((a, x) => a + Math.min(n(x.acc), n(x.recv)), 0);
  const value = on.reduce((a, x) => a + Math.min(n(x.acc), n(x.recv)) * (order.lines[x.i]?.cost ?? 0), 0);
  const bad = on.some((x) => n(x.acc) > n(x.recv));
  // Receiving more than is still to come is blocked (spec edge case; the design does not check it).
  const over = on.some((x) => n(x.recv) > left(order, x.i));
  const blocked = !on.length || !totRecv || bad || over || !store || !recvDate;
  const rej = totRecv - totAcc;
  const sum: [string, string, string][] = [
    ["Lines receiving", `${on.length} of ${lines.length}`, "text-text"],
    ["Ordered quantity", String(on.reduce((a, x) => a + (order.lines[x.i]?.qty ?? 0), 0)), "text-text"],
    ["Received", String(totRecv), "text-text"],
    ["Accepted", String(totAcc), "text-green-700"],
    ["Rejected", String(rej), rej ? "text-danger-text" : "text-text"],
  ];

  const save = async () => {
    const r = await receiveGoods(order.ref, {
      store,
      date: recvDate,
      dn,
      inv,
      notes,
      lines: on.map((x) => ({ id: order.lines[x.i]!.id, recv: n(x.recv), acc: Math.min(n(x.acc), n(x.recv)) })),
    });
    if (r.ok) onDone();
  };

  return (
    <PurchaseDrawer title="Receive goods" onClose={onClose}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <Panel className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md bg-green-50 text-green-700">
              <Icon name="package" size={22} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-card-title text-text">Receive {order.ref}</span>
                <StatusPill tone={order.status.tone}>{orderStatus(order.status)}</StatusPill>
                <StatusPill tone="neutral">{order.term || "Cash on delivery"}</StatusPill>
              </div>
              <div className="type-small mt-0.5 text-text-secondary">
                {order.supplier} · {order.store}
              </div>
            </div>
          </div>
          <Button variant="secondary" icon="check" onClick={() => setLines(fill())}>
            Receive all as ordered
          </Button>
        </Panel>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[1_1_680px] flex-col gap-4">
            <Panel flush>
              <div className="flex flex-wrap justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <div className="type-title text-text">Delivery details</div>
                  <div className="type-small text-text-muted">Where the goods went and the supplier&apos;s paperwork</div>
                </div>
                <div className="type-small text-text-muted">
                  Receiving by <b className="font-semibold text-text">{who}</b>
                </div>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
                  <SearchSelect label="Destination store" noun="store" options={stores.names} value={store} onChange={setStore} />
                  <Input label="Received on" type="date" value={recvDate} onChange={(e) => setRecvDate(e.target.value)} />
                  <Input label="Delivery note no. (optional)" placeholder="For example, DN-12345" value={dn} onChange={(e) => setDn(e.target.value)} />
                  <Input label="Supplier invoice no. (optional)" placeholder="For example, INV-2026-001" value={inv} onChange={(e) => setInv(e.target.value)} />
                </div>
                <NotesField
                  id="rv-notes"
                  label="Reference or notes (optional)"
                  rows={2}
                  placeholder="For example, received from the supplier's driver with invoice 123"
                  value={notes}
                  onChange={setNotes}
                />
              </div>
            </Panel>

            <Panel flush>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <div className="type-title text-text">Items to receive</div>
                  <div className="type-small text-text-muted">
                    {on.length} of {lines.length} lines selected{bad ? " · accepted cannot be more than received" : ""}
                  </div>
                </div>
                <Button variant="secondary" size="sm" icon="check" onClick={() => setLines((ls) => ls.map((x) => ({ ...x, acc: x.recv })))}>
                  Accept all received
                </Button>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="type-eyebrow grid items-center gap-3 bg-canvas px-5 py-2 text-text-muted" style={{ gridTemplateColumns: COLS }}>
                    <input
                      type="checkbox"
                      aria-label="Select all lines"
                      checked={lines.length > 0 && on.length === lines.length}
                      onChange={(e) => setLines((ls) => ls.map((x) => ({ ...x, on: e.target.checked })))}
                      className="accent-[var(--action)]"
                    />
                    <span>Product</span>
                    <span className="text-center">Ordered</span>
                    <span className="text-center">Received</span>
                    <span className="text-center">Accepted</span>
                    <span className="text-center">Rejected</span>
                    <span />
                  </div>
                  {lines.map((x) => {
                    const l = order.lines[x.i]!;
                    const rest = left(order, x.i);
                    const r = Math.max(0, n(x.recv) - n(x.acc));
                    return (
                      <div
                        key={l.id}
                        role="group"
                        aria-label={l.key}
                        className="grid items-center gap-3 border-t border-border px-5 py-3"
                        style={{ gridTemplateColumns: COLS, opacity: x.on ? 1 : 0.5 }}
                      >
                        <input type="checkbox" aria-label="Receive this line" checked={x.on} onChange={(e) => setL(x.i, { on: e.target.checked })} className="accent-[var(--action)]" />
                        <span className="min-w-0">
                          <span className="type-label block text-text [overflow-wrap:anywhere]">{l.key}</span>
                          <span className={`type-caption block ${rest ? "text-green-700" : "text-text-muted"}`}>
                            {rest ? (l.recv ? `${l.recv} already received, ${rest} to go` : "Ready") : "Already received in full"}
                          </span>
                        </span>
                        <span className="type-label text-center text-text">
                          {l.qty}
                          <span className="type-caption block text-text-muted">{l.unit}</span>
                        </span>
                        <Input size="sm" type="number" min={0} aria-label="Received" value={x.recv} onChange={(e) => setL(x.i, { recv: e.target.value, acc: e.target.value })} />
                        <Input size="sm" type="number" min={0} aria-label="Accepted" value={x.acc} onChange={(e) => setL(x.i, { acc: e.target.value })} />
                        <span className={`type-label text-center ${r ? "text-danger-text" : "text-text-muted"}`}>{r}</span>
                        <IconButton icon="x" size="sm" label="Skip this line" onClick={() => setL(x.i, { on: false })} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>
          </div>

          <Panel className="flex min-w-[280px] flex-[0_1_380px] flex-col gap-2">
            <div className="type-title mb-1 text-text">Order summary</div>
            {sum.map(([label, val, color]) => (
              <Row key={label} label={label} value={val} color={color} />
            ))}
            <div className="type-title mt-1 flex items-baseline justify-between border-t border-border pt-3 text-text">
              <span>Value accepted</span>
              <span className="u-num text-green-700">{money(value)}</span>
            </div>
            <div className="type-caption text-text-muted">{order.paid ? "This order is already paid." : `Payment: ${order.term || "Cash on delivery"} by ${order.method || "Cash"}.`}</div>
            <Button fullWidth icon="check" disabled={blocked} onClick={save}>
              {`Receive ${on.length}${on.length === 1 ? " line" : " lines"}`}
            </Button>
            <Button variant="ghost" fullWidth onClick={onClose}>
              Cancel
            </Button>
          </Panel>
        </div>
      </div>
    </PurchaseDrawer>
  );
}
