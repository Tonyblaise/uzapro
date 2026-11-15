"use client";
/**
 * A field sale's delivery (feature 024, design `dv`), full screen: progress steps, who and where,
 * items, history, money, and the next action: Send it out (dispatch), Confirm delivery (with the
 * money for pay on delivery), Couldn't deliver (reschedule) or Cancel. Opens with `?view=DLV-…`
 * from Field sales (its Field sales and Deliveries tabs). Changing it needs Write on Field sales.
 */
import { useState } from "react";
import { DEMO_TODAY, addDays } from "@/lib/demo-clock";
import { kes } from "@/lib/format";
import {
  FIELD_PAY_METHODS,
  cancelField,
  deliverField,
  dispatchFieldDelivery,
  fieldTotal,
  rescheduleField,
  useCan,
  useFieldDrivers,
  useFieldSale,
  type FieldSale,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { DELIVERY_TONE } from "./shared";
import { Eyebrow, Panel, docDate } from "../sales/shared";

const LEVEL: Record<FieldSale["delivery"]["status"], number> = { Pending: 0, Rescheduled: 0, "Out for delivery": 1, Delivered: 2, Cancelled: 2 };

function Steps({ x }: { x: FieldSale }) {
  const d = x.delivery;
  const cancelled = d.status === "Cancelled";
  const lvl = LEVEL[d.status];
  const steps: [string, string, string][] = [
    ["Order taken", "receipt", `${docDate(x.date)} ${x.time}`],
    ["Dispatched", "truck", d.outAt ?? ""],
    [cancelled ? "Cancelled" : "Delivered", cancelled ? "x" : "circle-check", d.doneAt ?? ""],
  ];
  return (
    <ol aria-label="Progress" className="m-0 flex list-none flex-wrap items-center gap-3 p-0">
      {steps.map(([label, icon, when], i) => {
        const done = i <= lvl;
        const red = cancelled && i === 2;
        const tone = done ? (red ? "border-danger bg-danger-soft text-danger-text" : "border-green-200 bg-green-50 text-green-700") : "border-border bg-surface text-text-muted";
        return (
          <li key={label} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden="true" className={`h-0.5 w-12 ${i <= lvl ? (red ? "bg-danger-text" : "bg-green-500") : "bg-border"}`} />}
            <span className={`grid size-8 place-items-center rounded-full border ${tone}`}>
              <Icon name={done ? (red ? "x" : i === 2 ? "circle-check" : "check") : icon} size={15} />
            </span>
            <span className="flex flex-col">
              <span className={`type-label ${done ? "text-text" : "text-text-muted"}`}>{label}</span>
              <span className="type-small text-text-muted">{done ? when : i === lvl + 1 && !cancelled ? "Next" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="type-label mt-0.5 text-text [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}

export function FieldDeliveryView({ refId, onClose }: { refId: string; onClose: () => void }) {
  const x = useFieldSale(refId);
  const drivers = useFieldDrivers();
  const canAct = useCan("write", "field");
  const [driver, setDriver] = useState(x?.delivery.driver ?? "");
  const [sub, setSub] = useState<"" | "fail" | "cancel">("");
  const [recv, setRecv] = useState("");
  const [method, setMethod] = useState<string>("M-Pesa");
  const [cref, setCref] = useState("");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [newDate, setNewDate] = useState(addDays(DEMO_TODAY, 1));
  const [err, setErr] = useState("");

  if (!x) {
    return (
      <Drawer open title={refId} subtitle="Field sales" onClose={onClose} width={640}>
        <div className="type-body text-text-muted">{refId} is not in the list any more.</div>
      </Drawer>
    );
  }
  const d = x.delivery;
  const total = fieldTotal(x);
  const status = d.status;
  const toCollect = x.pay.mode === "delivery" && status !== "Delivered" && status !== "Cancelled";
  const isPending = (status === "Pending" || status === "Rescheduled") && !sub;
  const isOut = status === "Out for delivery" && !sub;
  const isDone = status === "Delivered" || status === "Cancelled";
  const run = async (p: Promise<{ ok: boolean; message: string }>, after?: () => void) => {
    const r = await p;
    if (r.ok) {
      setErr("");
      after?.();
    } else setErr(r.message);
  };
  const payment =
    x.pay.mode === "now"
      ? `Paid by ${x.pay.method}${x.pay.ref && x.pay.ref !== "—" ? ` · ${x.pay.ref}` : ""}`
      : x.pay.mode === "credit"
        ? "On credit (Receivables)"
        : d.collected
          ? `Collected by ${d.collected.method}`
          : "Collect on delivery";
  const facts: [string, string][] = [
    ["Delivery date", docDate(d.date)],
    ["Deliver from", x.store],
    ["Driver", d.driver],
    ["Sales rep", `${x.rep}${x.route ? ` · ${x.route}` : ""}`],
    ["Notes", d.note || "None"],
    ["Received by", d.receivedBy || "—"],
  ];
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${x.location}, Kenya`)}`;

  return (
    <Drawer open title={`Delivery ${d.ref}`} subtitle={`Field sale ${x.ref} · taken by ${x.rep} on ${docDate(x.date)}`} onClose={onClose} width={9999}>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">
        <div>
          <StatusPill tone={DELIVERY_TONE[status]}>{status}</StatusPill>
        </div>
        <Panel className="flex flex-wrap items-center gap-3">
          <Steps x={x} />
        </Panel>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[1_1_640px] flex-col gap-4">
            <Panel flush className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
              <div className="flex flex-col gap-2 border-border p-5 [border-right-width:1px]">
                <Eyebrow>Deliver to</Eyebrow>
                <div className="type-title text-text">{x.customer}</div>
                <div className="type-body flex items-center gap-1.5 text-text-secondary">
                  <Icon name="phone" size={14} />
                  {x.phone}
                </div>
                <div className="type-body flex items-start gap-1.5 text-text-secondary">
                  <Icon name="map-pin" size={14} />
                  <span>{x.location}</span>
                </div>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="type-small font-semibold text-green-700">
                  Open in Google Maps
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4 p-5">
                {facts.map(([label, value]) => (
                  <Fact key={label} label={label} value={value} />
                ))}
              </div>
            </Panel>
            <Panel flush>
              <div className="type-title px-5 py-4 text-text">Items</div>
              {x.lines.map((l) => (
                <div key={`${l.product}|${l.variant}`} className="type-body grid grid-cols-[minmax(0,1fr)_70px_120px] gap-3 border-t border-border px-5 py-3">
                  <span>
                    {l.product}
                    <span className="type-small block text-text-muted">
                      {l.variant !== "Standard" ? `${l.variant} · ` : ""}
                      {kes(l.price)} each
                    </span>
                  </span>
                  <span className="u-num text-right">{l.qty}</span>
                  <span className="u-num text-right">{kes(l.price * l.qty)}</span>
                </div>
              ))}
              <div className="type-title flex justify-between border-t border-border px-5 py-3">
                <span>Total</span>
                <span className="u-num">{kes(total)}</span>
              </div>
            </Panel>
            <Panel className="flex flex-col gap-3">
              <div className="type-title text-text">History</div>
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {d.history
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-1.5 size-2 flex-none rounded-full bg-green-500" />
                      <span className="min-w-0">
                        <span className="type-body block text-text">{h.what}</span>
                        <span className="type-small block text-text-muted">
                          {h.when} · {h.who}
                        </span>
                      </span>
                    </li>
                  ))}
              </ol>
            </Panel>
          </div>

          <div className="flex min-w-[min(300px,100%)] flex-[0_1_400px] flex-col gap-4">
            <Panel className="flex flex-col gap-2">
              <div className="type-title text-text">Money</div>
              <div className="type-body flex justify-between gap-3 text-text-secondary">
                <span>Sale total</span>
                <span className="u-num text-text">{kes(total)}</span>
              </div>
              <div className="type-body flex justify-between gap-3 text-text-secondary">
                <span>Payment</span>
                <span className={x.pay.mode === "delivery" && !d.collected ? "text-warning-text" : "text-text"}>{payment}</span>
              </div>
              <div className="type-body flex justify-between gap-3 text-text-secondary">
                <span>Still to collect</span>
                <span className={`u-num ${toCollect ? "text-warning-text" : "text-green-700"}`}>{kes(toCollect ? total : 0)}</span>
              </div>
            </Panel>

            {canAct && isPending && (
              <Panel className="flex flex-col gap-3">
                <div className="type-title text-text">Send it out</div>
                <SearchSelect label="Driver" noun="driver" options={drivers} value={driver} onChange={setDriver} />
                <div className="type-small text-text-muted">Dispatching takes the items out of {x.store}.</div>
                {err && (
                  <div role="alert" className="type-small text-danger-text">
                    {err}
                  </div>
                )}
                <Button icon="truck" fullWidth onClick={() => void run(dispatchFieldDelivery(d.ref, driver))}>
                  Dispatch
                </Button>
                <button type="button" onClick={() => (setSub("cancel"), setReason(""), setErr(""))} className="type-small self-start font-semibold text-danger-text">
                  Cancel this delivery
                </button>
              </Panel>
            )}

            {canAct && isOut && (
              <Panel className="flex flex-col gap-3">
                <div className="type-title text-text">Confirm delivery</div>
                <Input label="Received by" placeholder="Name of the person who received it" value={recv} onChange={(e) => (setRecv(e.target.value), setErr(""))} />
                {x.pay.mode === "delivery" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <SearchSelect label="Collected by" options={[...FIELD_PAY_METHODS]} value={method} onChange={setMethod} />
                      <Input label="Reference" placeholder="M-Pesa code" value={cref} onChange={(e) => setCref(e.target.value)} />
                    </div>
                    <div className="type-small text-warning-text">Collect {kes(total)} from the customer.</div>
                  </>
                )}
                <Textarea label="Note (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                {err && (
                  <div role="alert" className="type-small text-danger-text">
                    {err}
                  </div>
                )}
                <Button icon="check" fullWidth onClick={() => void run(deliverField(d.ref, { receivedBy: recv, method, payRef: cref, note }), () => (setRecv(""), setCref(""), setNote("")))}>
                  Mark as delivered
                </Button>
                <button
                  type="button"
                  onClick={() => (setSub("fail"), setReason(""), setNewDate(addDays(DEMO_TODAY, 1)), setErr(""))}
                  className="type-small self-start font-semibold text-warning-text"
                >
                  Couldn&apos;t deliver
                </button>
              </Panel>
            )}

            {canAct && sub && !isDone && (
              <section className="flex min-w-0 flex-col gap-3 rounded-lg border border-warning bg-surface p-5">
                <div className="type-title text-text">{sub === "fail" ? "Couldn't deliver" : "Cancel this delivery"}</div>
                <Input label="Reason" placeholder="For example, customer not at the shop" value={reason} onChange={(e) => (setReason(e.target.value), setErr(""))} />
                {sub === "fail" && (
                  <>
                    <Input label="Try again on" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    <div className="type-small text-text-muted">The items go back into {x.store} until it&apos;s sent out again.</div>
                  </>
                )}
                {err && (
                  <div role="alert" className="type-small text-danger-text">
                    {err}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => (setSub(""), setErr(""))}>
                    Back
                  </Button>
                  <Button variant="danger" onClick={() => void run(sub === "fail" ? rescheduleField(d.ref, reason, newDate) : cancelField(d.ref, reason), () => setSub(""))}>
                    {sub === "fail" ? "Reschedule" : "Cancel delivery"}
                  </Button>
                </div>
              </section>
            )}

            {isDone && (
              <section className={`flex items-start gap-3 rounded-lg border p-5 ${status === "Delivered" ? "border-green-200 bg-green-50" : "border-danger bg-danger-soft"}`}>
                <span className={status === "Delivered" ? "text-green-700" : "text-danger-text"}>
                  <Icon name={status === "Delivered" ? "circle-check" : "x"} size={22} />
                </span>
                <div>
                  <div className="type-title text-text">{status}</div>
                  <div className="type-small text-text-secondary">
                    {status === "Delivered" ? `Received by ${d.receivedBy || "—"} on ${d.doneAt ?? ""}.` : `This delivery was cancelled on ${d.doneAt ?? ""}.`}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
