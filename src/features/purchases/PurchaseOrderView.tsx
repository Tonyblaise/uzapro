"use client";
import { Can } from "@/components/ui/Can";
/**
 * Purchase order view (design `isPoView`, `pv`): header with status and payment pills, Download PDF
 * and Edit, the four steps, Supplier / Deliver to, Items, Goods receipts, Notes, Next step,
 * Payment ("Mark as paid"), Activity and Summary. Opens with `?view=<ref>`.
 */
import {
  acceptPurchaseOrder,
  downloadPurchasePdf,
  markPurchaseOrderPaid,
  sendPurchaseOrder,
  useGoodsReceipts,
  usePurchaseOrder,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { Chip, Eyebrow, Panel, PurchaseDrawer, SupplierBlock, docDate, money, orderStatus } from "./shared";

export function PurchaseOrderView({ refId, onClose, onEdit, onReceive, onOpenReceipt }: { refId: string; onClose: () => void; onEdit: () => void; onReceive: () => void; onOpenReceipt: (grn: string) => void }) {
  const order = usePurchaseOrder(refId);
  const receipts = useGoodsReceipts();
  const title = `Purchase order ${refId}`;
  if (!order) {
    return (
      <PurchaseDrawer title={title} onClose={onClose}>
        <div className="type-body text-text-muted">That purchase order is not in the list.</div>
      </PurchaseDrawer>
    );
  }
  const st = order.status.label;
  const total = order.lines.reduce((a, l) => a + l.qty * l.cost, 0);
  const units = order.lines.reduce((a, l) => a + l.qty, 0);
  const sent = st !== "Draft";
  const accepted = st === "Accepted" || st === "Completed";
  const received = st === "Completed" || order.received.label === "Full";
  const by = (t: string) => order.activity.find((a) => a[0] === t)?.[1] ?? "";
  const done = [true, sent, accepted, received];
  const steps: [string, string][] = [
    ["Created", docDate(order.date)],
    ["Sent", sent ? `To ${order.supplier}` : "Not yet"],
    ["Accepted", accepted ? by("Accepted") || "By supplier" : "Waiting"],
    ["Received", received ? "Goods in store" : "Waiting"],
  ];
  const grns = receipts.filter((g) => g.po === order.ref);
  const next: [string, string, string] = !sent
    ? ["This order is still a draft. Send it to the supplier when it is ready.", "Mark as sent", "check"]
    : !accepted
      ? ["Waiting for the supplier to accept. Record it when they confirm.", "Mark as accepted", "circle-check"]
      : !received
        ? ["The supplier accepted. Receive the goods when they arrive.", "Receive goods", "package"]
        : ["Everything on this order has been received.", "", ""];
  const runNext = () => {
    if (st === "Draft") void sendPurchaseOrder(order.ref);
    else if (!accepted) void acceptPurchaseOrder(order.ref);
    else onReceive();
  };
  const status = orderStatus(order.status);
  const facts: [string, string][] = [
    ["Reference", order.ref],
    ["Status", status],
    ["Currency", "KES"],
    ["Order date", docDate(order.date)],
    ["Expected delivery", order.expected ? docDate(order.expected) : "Not set"],
    ["Payment term", order.term || "Cash on delivery"],
  ];
  const pay: [string, string][] = [
    ["Term", order.term || "Cash on delivery"],
    ["Method", order.method || "Cash"],
    ...(order.account ? ([["From account", order.account]] as [string, string][]) : []),
  ];
  const countText = `${order.lines.length}${order.lines.length === 1 ? " line" : " lines"} · ${units}${units === 1 ? " unit" : " units"}`;
  const payPill = order.paid ? "Paid" : "Unpaid";
  const payTone = order.paid ? "success" : "warning";
  const th = "type-eyebrow bg-canvas px-3 py-2 text-text-muted";

  return (
    <PurchaseDrawer title={title} onClose={onClose}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <Panel className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-md bg-green-50 text-green-700">
                <Icon name="file-text" size={22} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="type-card-title text-text">Purchase order {order.ref}</span>
                  <StatusPill tone={order.status.tone}>{status}</StatusPill>
                  <StatusPill tone={payTone}>{payPill}</StatusPill>
                </div>
                <div className="type-small mt-0.5 whitespace-pre text-text-secondary">{`${docDate(order.date)}  ·  ${order.supplier}  ·  ${order.store}  ·  ${money(total)}`}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon="download" onClick={() => downloadPurchasePdf(order.ref)}>
                Download PDF
              </Button>
              <Can need="write">
                <Button variant="secondary" icon="pencil" onClick={onEdit}>
                  Edit
                </Button>
              </Can>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 border-t border-border pt-4">
            {steps.map(([label, sub], i) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`type-caption grid size-6 flex-none place-items-center rounded-full font-semibold ${done[i] ? "bg-green-600 text-white" : "bg-canvas text-text-muted"}`}>
                    {done[i] ? "✓" : String(i + 1)}
                  </span>
                  <span className={`h-0.5 flex-1 ${i === 3 ? "bg-transparent" : done[i + 1] ? "bg-green-500" : "bg-border"}`} />
                </div>
                <div className={`type-label ${done[i] ? "text-text" : "text-text-muted"}`}>{label}</div>
                <div className="type-caption text-text-muted">{sub}</div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[1_1_640px] flex-col gap-4">
            <section className="grid rounded-lg border border-border bg-surface" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              <SupplierBlock name={order.supplier} showType />
              <div className="flex flex-col gap-4 p-5">
                <div>
                  <Eyebrow>Deliver to</Eyebrow>
                  <div className="type-title mt-0.5 text-text">{order.store}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {facts.map(([label, value]) => (
                    <div key={label}>
                      <Eyebrow>{label}</Eyebrow>
                      <div className={`type-label mt-0.5 ${label === "Status" ? "text-green-700" : "text-text"}`}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <Panel flush>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="type-title text-text">Items</div>
                  <div className="type-small text-text-muted">What was ordered from the supplier</div>
                </div>
                <Chip>{countText}</Chip>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse">
                  <thead>
                    <tr>
                      <th className={`${th} text-left`}>#</th>
                      <th className={`${th} text-left`}>Product</th>
                      <th className={`${th} text-right`}>Qty</th>
                      <th className={`${th} text-right`}>Unit price</th>
                      <th className={`${th} text-right`}>Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lines.map((l, i) => (
                      <tr key={l.id} className="type-body u-num border-t border-border text-text">
                        <td className="p-3">{i + 1}</td>
                        <td className="p-3">{l.key}</td>
                        <td className="p-3 text-right">
                          {l.qty} {l.unit}
                        </td>
                        <td className="p-3 text-right">{money(l.cost)}</td>
                        <td className="p-3 text-right font-semibold">{money(l.qty * l.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel flush>
              <div className="border-b border-border px-5 py-4">
                <div className="type-title text-text">Goods receipts</div>
                <div className="type-small text-text-muted">Deliveries recorded against this order</div>
              </div>
              {grns.length === 0 && <div className="type-body p-6 text-center text-text-muted">Nothing has been received on this order yet.</div>}
              {grns.map((g) => (
                <button
                  key={g.ref}
                  type="button"
                  onClick={() => onOpenReceipt(g.ref)}
                  className="type-body flex w-full cursor-pointer justify-between gap-3 border-0 border-t border-border bg-transparent px-5 py-3 text-left text-text first:border-t-0"
                >
                  <span>
                    <b className="font-semibold text-link">{g.ref}</b> · {g.store}
                  </span>
                  <span className="text-text-secondary">
                    {g.lineCount}
                    {g.lineCount === 1 ? " line" : " lines"} ›
                  </span>
                </button>
              ))}
            </Panel>

            <Panel flush className="px-5 py-4">
              <div className="type-label text-text">Notes</div>
              <div className="type-body mt-1 whitespace-pre-wrap text-text-secondary">{order.notes || "No notes."}</div>
            </Panel>
          </div>

          <div className="flex min-w-[280px] flex-[0_1_380px] flex-col gap-4">
            <Panel className="flex flex-col gap-3">
              <div className="type-title text-text">Next step</div>
              <div className="type-body text-text-secondary">{next[0]}</div>
              {next[1] && (
                <Button fullWidth icon={next[2]} onClick={runNext}>
                  {next[1]}
                </Button>
              )}
            </Panel>
            <Panel className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="type-title text-text">Payment</span>
                <StatusPill tone={payTone}>{payPill}</StatusPill>
              </div>
              {pay.map(([label, value]) => (
                <div key={label} className="type-body flex justify-between gap-3 text-text-secondary">
                  <span>{label}</span>
                  <span className="text-right text-text">{value}</span>
                </div>
              ))}
              {!order.paid && (
                <Button variant="soft" fullWidth icon="banknote" onClick={() => markPurchaseOrderPaid(order.ref)}>
                  Mark as paid
                </Button>
              )}
            </Panel>
            <Panel>
              <div className="type-title mb-3 text-text">Activity</div>
              {order.activity.map(([t, sub], i) => (
                <div key={`${t}-${i}`} className="flex gap-3 pb-3">
                  <span className="mt-[5px] size-2.5 flex-none rounded-full bg-green-500" />
                  <div>
                    <div className="type-label text-text">{t}</div>
                    <div className="type-small text-text-muted">{sub}</div>
                  </div>
                </div>
              ))}
            </Panel>
            <Panel className="flex flex-col gap-2">
              <div className="type-title text-text">Summary</div>
              <div className="type-body flex justify-between text-text-secondary">
                <span>Items</span>
                <span className="text-text">{countText}</span>
              </div>
              <div className="type-body flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="u-num text-text">{money(total)}</span>
              </div>
              <div className="type-title flex items-baseline justify-between border-t border-border pt-2 text-text">
                <span>Grand total</span>
                <span className="u-num text-green-700">{money(total)}</span>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </PurchaseDrawer>
  );
}
