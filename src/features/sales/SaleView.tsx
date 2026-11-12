"use client";
/** Sale record (design `isPosView`): opened by `?view=SAL-…` on All sales. */
import type { ReactNode } from "react";
import { downloadPdf, printDocument } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Drawer } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { Chip, Eyebrow, Panel, Row, docDate, money, sku, useSaleDoc } from "./shared";

function Fact({ label, value, sub, tone = "text-text" }: { label: string; value: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className={`type-label mt-0.5 ${tone}`}>{value}</div>
      {sub !== undefined && <div className="type-caption text-text-muted">{sub}</div>}
    </div>
  );
}

const GRID_ITEMS = { gridTemplateColumns: "minmax(0,2fr) 110px 70px 120px 130px" };
const GRID_PAYS = { gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 130px" };

export function SaleView({ refId, onClose, onCredit, onVoid }: { refId: string; onClose: () => void; onCredit: () => void; onVoid: () => void }) {
  const found = useSaleDoc(refId);
  if (!found) {
    return (
      <Drawer open title={`Sale ${refId}`} subtitle="Sales" onClose={onClose} width={9999}>
        <div className="type-body text-text-muted">{refId} is not in the list any more.</div>
      </Drawer>
    );
  }
  const { doc, voided } = found;
  const paid = doc.pays.reduce((a, p) => a + p.amount, 0);
  const bal = Math.max(0, doc.total - paid);
  const status = voided ? "Voided" : doc.status.label === "Paid" ? "Completed" : doc.status.label;
  const tone = voided ? "danger" : doc.status.label === "Paid" ? "success" : doc.status.tone;
  const opened = docDate(doc.date || "2026-11-01") + (doc.time ? `, ${doc.time}` : "");
  const payStatus = voided ? "Voided" : bal <= 0 ? "Fully paid" : paid ? "Part paid" : "Not paid";
  const payTone = voided ? "text-danger-text" : bal <= 0 ? "text-green-700" : "text-warning-text";
  const n = doc.lines.length;
  const pn = doc.pays.length;

  return (
    <Drawer open title={`Sale ${doc.ref}`} subtitle="Sales" onClose={onClose} width={9999}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <Panel flush className="flex flex-wrap items-center gap-4 px-5 py-4">
          <span className="grid size-12 flex-none place-items-center rounded-md bg-green-50 text-green-700">
            <Icon name="file-text" size={22} />
          </span>
          <div className="min-w-[220px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-card-title text-text">Sale {doc.ref}</span>
              <StatusPill tone={tone}>{status}</StatusPill>
            </div>
            <div className="type-small mt-0.5 text-text-secondary">
              {opened} · {doc.cust}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon="file-text" onClick={() => printDocument(doc.ref, true)}>
              Reprint
            </Button>
            <Button variant="secondary" icon="download" onClick={() => downloadPdf(doc.ref)}>
              PDF
            </Button>
            {!voided && (
              <>
                <Button variant="soft" icon="refresh-cw" onClick={onCredit}>
                  Credit note
                </Button>
                <Button variant="danger" icon="x" onClick={onVoid}>
                  Void
                </Button>
              </>
            )}
          </div>
        </Panel>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[2_1_560px] flex-col gap-4">
            <Panel flush>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="type-title m-0 text-text">Items</h3>
                  <div className="type-small text-text-secondary">Products in this sale</div>
                </div>
                <Chip>
                  {n} {n === 1 ? "item" : "items"}
                </Chip>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[680px]" role="table" aria-label="Products in this sale">
                  <div role="row" className="type-eyebrow grid gap-3 bg-canvas px-5 py-2 text-text-muted" style={GRID_ITEMS}>
                    <span role="columnheader">Product</span>
                    <span role="columnheader">SKU</span>
                    <span role="columnheader" className="text-right">Qty</span>
                    <span role="columnheader" className="text-right">Unit price</span>
                    <span role="columnheader" className="text-right">Line total</span>
                  </div>
                  {doc.lines.map((l, i) => (
                    <div role="row" key={`${l.product}-${l.variant}-${i}`} className="type-body grid items-center gap-3 border-t border-border px-5 py-3 text-text" style={GRID_ITEMS}>
                      <span role="cell" className="min-w-0">
                        <span className="block font-semibold">{l.product}</span>
                        <span className="type-caption block text-text-muted">{[l.variant, l.unit].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span role="cell" className="type-small u-num text-text-secondary">
                        {/^Items on/.test(l.product) ? "—" : sku(l.product)}
                      </span>
                      <span role="cell" className="u-num text-right">
                        {l.qty}
                      </span>
                      <span role="cell" className="u-num text-right text-text-secondary">
                        {money(l.price)}
                      </span>
                      <span role="cell" className="u-num text-right font-semibold">
                        {money(l.price * l.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel flush>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="type-title m-0 text-text">Payments</h3>
                  <div className="type-small text-text-secondary">Money received for this sale</div>
                </div>
                <Chip>
                  {pn} {pn === 1 ? "record" : "records"}
                </Chip>
              </div>
              {pn === 0 ? (
                <div className="type-body border-t border-border p-5 text-center text-text-muted">No payments yet. This sale was made on credit and is in Receivables.</div>
              ) : (
                <div className="overflow-x-auto">
                <div className="min-w-[560px]" role="table" aria-label="Payments">
                  <div role="row" className="type-eyebrow grid gap-3 bg-canvas px-5 py-2 text-text-muted" style={GRID_PAYS}>
                    <span role="columnheader">Method</span>
                    <span role="columnheader">Reference</span>
                    <span role="columnheader">Date</span>
                    <span role="columnheader" className="text-right">Amount</span>
                  </div>
                  {doc.pays.map((p, i) => (
                    <div role="row" key={i} className="type-body grid items-center gap-3 border-t border-border px-5 py-3 text-text" style={GRID_PAYS}>
                      <span role="cell" className="font-semibold">
                        {p.method}
                      </span>
                      <span role="cell" className="text-text-secondary">
                        {p.ref || "—"}
                      </span>
                      <span role="cell" className="text-text-secondary">
                        {p.date}
                      </span>
                      <span role="cell" className="u-num text-right font-semibold">
                        {money(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                </div>
              )}
            </Panel>
          </div>

          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            <Panel className="flex flex-col gap-3">
              <h3 className="type-title m-0 text-text">Summary</h3>
              <Row label="Subtotal" value={money(doc.subtotal)} />
              <Row label="VAT" value={money(doc.vat)} />
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <span className="type-label text-text">Grand total</span>
                <span className="type-card-title u-num text-green-700">{money(doc.total)}</span>
              </div>
              <Row label="Amount paid" value={money(paid)} />
              <div className="type-label flex justify-between rounded-md bg-canvas p-3 text-text">
                <span>Balance due</span>
                <span className={`u-num ${bal > 0 ? "text-danger-text" : "text-green-700"}`}>{money(bal)}</span>
              </div>
            </Panel>
            <Panel className="grid grid-cols-2 gap-4">
              <h3 className="type-title col-span-2 m-0 text-text">Details</h3>
              <Fact label="Sale type" value={doc.type === "Sale" ? "Point of sale" : doc.type} />
              <Fact label="Channel" value={doc.channel} />
              <Fact label="Payment status" value={payStatus} tone={payTone} />
              <Fact label="Sold from" value={doc.store} />
              <Fact label="Opened" value={opened} sub={doc.who} />
              <Fact
                label="Closed"
                value={doc.closedAt || "Still open"}
                tone={doc.closedAt ? "text-text" : "text-warning-text"}
                sub={doc.closedAt ? doc.who : "Waiting for payment"}
              />
            </Panel>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
