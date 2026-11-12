"use client";
/**
 * Goods receipt view (design `isGrnView`, `gv`): "Goods receipt {ref}" with "Stock updated", Print and
 * PDF, Supplier, "Received into" with its facts, "Items received" ("Only accepted quantities go into
 * stock"), Notes and the Summary. Opens with `?view=<GRN>`.
 */
import { downloadPurchasePdf, printGoodsReceipt, toast, useGoodsReceipt, usePurchaseOrders } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { Chip, Eyebrow, Fact, Panel, PurchaseDrawer, Row, SupplierBlock, docDate, money } from "./shared";

export function GoodsReceiptView({ refId, onClose, onOpenOrder }: { refId: string; onClose: () => void; onOpenOrder: (po: string) => void }) {
  const g = useGoodsReceipt(refId);
  const orders = usePurchaseOrders();
  const title = `Goods receipt ${refId}`;
  if (!g) {
    return (
      <PurchaseDrawer title={title} onClose={onClose}>
        <div className="type-body text-text-muted">{refId} is not in the list.</div>
      </PurchaseDrawer>
    );
  }
  const order = orders.find((o) => o.ref === g.po);
  const total = (k: "ordered" | "recv" | "acc" | "rej") => g.lines.reduce((a, l) => a + l[k], 0);
  const delivered = g.lines.reduce((a, l) => a + l.recv * l.cost, 0);
  const accepted = g.lines.reduce((a, l) => a + l.acc * l.cost, 0);
  const lineCount = `${g.lines.length}${g.lines.length === 1 ? " line" : " lines"}`;
  const openPo = () => (order ? onOpenOrder(order.ref) : toast("That purchase order is not in the list."));
  const facts: [string, string, string, string][] = [
    ["Purchase order", g.po, "", "text-link"],
    ["Delivery note", g.dn || "—", "", "text-text"],
    ["Supplier invoice", g.inv || "—", "", "text-text"],
    ["Received", docDate(g.date), g.who, "text-text"],
    ["Payment", order ? (order.paid ? "Paid" : order.term || "Cash on delivery") : "—", "", "text-text"],
    ["Lines", String(g.lineCount), "", "text-text"],
  ];
  const rej = total("rej");
  const sum: [string, string, string][] = [
    ["Items", lineCount, "text-text"],
    ["Ordered", String(total("ordered")), "text-text"],
    ["Received", String(total("recv")), "text-text"],
    ["Accepted", String(total("acc")), "text-green-700"],
    ["Rejected", String(rej), rej ? "text-danger-text" : "text-text"],
  ];
  const th = "type-eyebrow bg-canvas px-3 py-2 text-text-muted";
  const td = "p-3";

  return (
    <PurchaseDrawer title={title} onClose={onClose}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <Panel className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md bg-green-50 text-green-700">
              <Icon name="package" size={22} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-card-title text-text">Goods receipt {g.ref}</span>
                <StatusPill tone="success">Stock updated</StatusPill>
              </div>
              <div className="type-small mt-0.5 flex flex-wrap items-center gap-2 text-text-secondary">
                <span>{docDate(g.date)}</span>
                <span>·</span>
                <span>{g.supplier}</span>
                <span>·</span>
                <button type="button" onClick={openPo} className="type-small cursor-pointer border-0 bg-transparent p-0 font-semibold text-link">
                  {g.po}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon="printer" onClick={() => printGoodsReceipt(g.ref)}>
              Print
            </Button>
            <Button variant="secondary" icon="download" onClick={() => downloadPurchasePdf(g.ref)}>
              PDF
            </Button>
          </div>
        </Panel>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[1_1_680px] flex-col gap-4">
            <section className="grid rounded-lg border border-border bg-surface" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              <SupplierBlock name={g.supplier} />
              <div className="flex flex-col gap-4 p-5">
                <div>
                  <Eyebrow>Received into</Eyebrow>
                  <div className="type-title mt-0.5 text-text">{g.store}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {facts.map(([label, value, sub, color]) => (
                    <Fact key={label} label={label} value={value} sub={sub} color={color} />
                  ))}
                </div>
              </div>
            </section>

            <Panel flush>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="type-title text-text">Items received</div>
                  <div className="type-small text-text-muted">Only accepted quantities go into stock</div>
                </div>
                <Chip>{lineCount}</Chip>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr>
                      <th className={`${th} text-left`}>#</th>
                      <th className={`${th} text-left`}>Product</th>
                      <th className={`${th} text-right`}>Ordered</th>
                      <th className={`${th} text-right`}>Received</th>
                      <th className={`${th} text-right`}>Accepted</th>
                      <th className={`${th} text-right`}>Rejected</th>
                      <th className={`${th} text-right`}>Unit cost</th>
                      <th className={`${th} text-right`}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.lines.map((l, i) => (
                      <tr key={`${l.key}-${i}`} className="type-body u-num border-t border-border text-text">
                        <td className={td}>{i + 1}</td>
                        <td className={td}>{l.key}</td>
                        <td className={`${td} text-right text-text-secondary`}>{l.ordered}</td>
                        <td className={`${td} text-right font-semibold`}>{l.recv}</td>
                        <td className={`${td} text-right font-semibold text-green-700`}>{l.acc}</td>
                        <td className={`${td} text-right ${l.rej ? "text-danger-text" : "text-text-muted"}`}>{l.rej}</td>
                        <td className={`${td} text-right text-text-secondary`}>{money(l.cost)}</td>
                        <td className={`${td} text-right font-semibold`}>{money(l.acc * l.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel flush className="px-5 py-4">
              <div className="type-label text-text">Notes</div>
              <div className="type-body mt-1 whitespace-pre-wrap text-text-secondary">{g.notes || "No notes."}</div>
            </Panel>
          </div>

          <Panel className="flex min-w-[280px] flex-[0_1_380px] flex-col gap-2">
            <div className="type-title mb-1 text-text">Summary</div>
            {sum.map(([label, value, color]) => (
              <Row key={label} label={label} value={value} color={color} />
            ))}
            <div className="type-body flex justify-between border-t border-border pt-2 text-text-secondary">
              <span>Value delivered</span>
              <span className="u-num text-text">{money(delivered)}</span>
            </div>
            <div className="type-title flex items-baseline justify-between border-t border-border pt-2 text-text">
              <span>Value accepted</span>
              <span className="u-num text-green-700">{money(accepted)}</span>
            </div>
            <div className="type-caption text-text-muted">Only the accepted quantity is paid for.</div>
          </Panel>
        </div>
      </div>
    </PurchaseDrawer>
  );
}
