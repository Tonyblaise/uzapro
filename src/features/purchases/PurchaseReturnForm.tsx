"use client";
/**
 * New purchase return (design `isPrtForm`, `prt`, opened by `prtOpen`): (1) supplier filter, purchase
 * order and goods receipt, (2) reason and notes, (3) items with "Can return" and a return quantity,
 * the Return summary, and Cancel / "Submit only" / "Submit and approve". Opens with `?action=new`.
 */
import { useMemo, useState } from "react";
import { RETURN_REASONS, canReturn, createPurchaseReturn, useGoodsReceipts, usePurchaseOrders } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { Panel, PurchaseDrawer, StepTitle, money } from "./shared";

const ALL = "All suppliers";
const COLS = "28px minmax(0,1fr) 90px 100px 110px";
const n = (x: string) => Math.max(0, Number(x) || 0);

interface PrtLine {
  i: number;
  on: boolean;
  qty: string;
}

export function PurchaseReturnForm({ onClose }: { onClose: () => void }) {
  const orders = usePurchaseOrders();
  const receipts = useGoodsReceipts();
  const [sup, setSup] = useState(ALL);
  const [po, setPo] = useState("");
  const [grn, setGrn] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [reasons, setReasons] = useState<string[]>([...RETURN_REASONS]);
  const [picked, setPicked] = useState<PrtLine[]>([]);

  const withGrn = useMemo(() => orders.filter((o) => receipts.some((g) => g.po === o.ref)), [orders, receipts]);
  const poRows = withGrn.filter((o) => sup === ALL || o.supplier === sup);
  const label = (o: (typeof orders)[number]) => `${o.ref} (${o.status.label === "Approved" ? "Sent" : o.status.label})`;
  const poRow = poRows.find((o) => label(o) === po);
  const grnRows = poRow ? receipts.filter((g) => g.po === poRow.ref) : [];
  const grnRow = grnRows.find((g) => g.ref === grn);
  const max = grnRow ? canReturn(grnRow) : {};
  const lines = (grnRow?.lines ?? [])
    .map((l, i) => {
      const x = picked.find((y) => y.i === i) ?? { i, on: false, qty: "0" };
      return { i, l, max: max[l.key] ?? 0, on: x.on, qty: x.qty };
    })
    .filter((x) => x.max > 0);
  const chosen = lines.filter((x) => x.on && n(x.qty) > 0);
  const over = chosen.some((x) => n(x.qty) > x.max);
  const total = chosen.reduce((a, x) => a + n(x.qty) * x.l.cost, 0);
  const qty = chosen.reduce((a, x) => a + n(x.qty), 0);
  const blocked = !grnRow || !reason || !chosen.length || over;

  const setL = (i: number, patch: Partial<PrtLine>) =>
    setPicked((list) => {
      const at = list.findIndex((y) => y.i === i);
      if (at >= 0) return list.map((y, k) => (k === at ? { ...y, ...patch } : y));
      return [...list, { i, on: false, qty: "0", ...patch }];
    });

  const finish = async (approve: boolean) => {
    if (!grnRow) return;
    const r = await createPurchaseReturn({ grn: grnRow.ref, reason, notes, lines: chosen.map((x) => ({ key: x.l.key, qty: n(x.qty) })) }, approve);
    if (r.ok) onClose();
  };

  const supOptions = [ALL, ...Array.from(new Set(withGrn.map((o) => o.supplier)))];

  return (
    <PurchaseDrawer title="New purchase return" onClose={onClose}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <div className="type-body text-text-secondary">Send items back to a supplier against a goods receipt.</div>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[1_1_680px] flex-col gap-4">
            <Panel className="flex flex-col gap-4">
              <StepTitle n={1}>Choose the order and goods receipt</StepTitle>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <SearchSelect
                  label="Supplier (optional filter)"
                  options={supOptions}
                  value={sup}
                  onChange={(v) => {
                    setSup(v);
                    setPo("");
                    setGrn("");
                    setPicked([]);
                  }}
                />
                <SearchSelect
                  label="Purchase order"
                  options={poRows.map(label)}
                  value={po}
                  onChange={(v) => {
                    setPo(v);
                    setGrn("");
                    setPicked([]);
                  }}
                />
                <SearchSelect
                  label="Return against goods receipt"
                  options={grnRows.map((g) => g.ref)}
                  value={grn}
                  onChange={(v) => {
                    setGrn(v);
                    setPicked([]);
                  }}
                />
              </div>
            </Panel>

            <Panel className="flex flex-col gap-4">
              <StepTitle n={2}>Reason for the return</StepTitle>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                <SearchSelect
                  label="Reason"
                  noun="reason"
                  options={reasons}
                  value={reason}
                  onChange={setReason}
                  onCreate={(r) => {
                    setReasons((rs) => [...rs, r]);
                    return r;
                  }}
                />
                <Input label="Notes (optional)" placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="type-small text-warning-text">↓ Stock goes down when this return is approved.</div>
            </Panel>

            <Panel flush>
              <div className="border-b border-border p-5">
                <StepTitle n={3}>Items to return</StepTitle>
              </div>
              {lines.length === 0 ? (
                <div className="type-body px-5 py-8 text-center text-text-muted">
                  {!grnRow ? "Choose a goods receipt above to load the items you can return." : "Everything on this goods receipt has already been returned or was rejected on delivery."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[560px]">
                    <div className="type-eyebrow grid items-center gap-3 bg-canvas px-5 py-2 text-text-muted" style={{ gridTemplateColumns: COLS }}>
                      <span />
                      <span>Product</span>
                      <span className="text-center">Can return</span>
                      <span className="text-center">Return qty</span>
                      <span className="text-right">Value</span>
                    </div>
                    {lines.map((x) => (
                      <div key={x.i} role="group" aria-label={x.l.key} className="grid items-center gap-3 border-t border-border px-5 py-3" style={{ gridTemplateColumns: COLS }}>
                        <input
                          type="checkbox"
                          aria-label="Return this item"
                          checked={x.on}
                          onChange={(e) => setL(x.i, { on: e.target.checked, qty: e.target.checked && !n(x.qty) ? String(x.max) : x.qty })}
                          className="accent-[var(--action)]"
                        />
                        <span className="type-label text-text [overflow-wrap:anywhere]">
                          {x.l.key}
                          <span className="type-caption block font-normal text-text-muted">{money(x.l.cost)} each</span>
                        </span>
                        <span className="type-label text-center text-text">
                          {x.max} {x.l.unit}
                        </span>
                        <Input size="sm" type="number" min={0} aria-label="Return quantity" value={x.qty} onChange={(e) => setL(x.i, { qty: e.target.value, on: true })} />
                        <span className="type-label u-num text-right text-text">{money(n(x.qty) * x.l.cost * (x.on ? 1 : 0))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="secondary" fullWidth icon="x" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="soft" fullWidth icon="check" disabled={blocked} onClick={() => finish(false)}>
                Submit only
              </Button>
              <Button fullWidth icon="check" disabled={blocked} onClick={() => finish(true)}>
                Submit and approve
              </Button>
            </div>
          </div>

          <Panel className="flex min-w-[260px] flex-[0_1_340px] flex-col gap-3">
            <div className="type-eyebrow text-text-muted">Return summary</div>
            <div className="type-body flex justify-between text-text-secondary">
              <span>Items</span>
              <span className="type-title text-text">{chosen.length}</span>
            </div>
            <div className="type-body flex justify-between text-text-secondary">
              <span>Quantity</span>
              <span className="type-title text-text">{qty}</span>
            </div>
            <div className="type-body flex items-baseline justify-between border-t border-border pt-3 text-text-secondary">
              <span>Total value</span>
              <span className="type-title u-num text-text">{money(total)}</span>
            </div>
          </Panel>
        </div>
      </div>
    </PurchaseDrawer>
  );
}
