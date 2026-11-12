"use client";
/** Raise credit note against a sale (design `isCnForm`), from the sale view's "Credit note" button. */
import { useState } from "react";
import { UZ_REFUND, createCreditNote } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { Choice, Eyebrow, Panel, Row, docDate, money, useCredited, useSaleDoc } from "./shared";

type MoneyBack = "cash" | "credit" | "original";
let extraReasons: string[] = [];

const GRID = { gridTemplateColumns: "minmax(0,2fr) 60px 60px 60px 100px 110px 120px" };

export function CreditNoteForm({ saleRef, onClose, onDone }: { saleRef: string; onClose: () => void; onDone: () => void }) {
  const found = useSaleDoc(saleRef);
  const credited = useCredited(saleRef);
  const [mode, setMode] = useState<"all" | "sel">("all");
  const [qty, setQty] = useState<Record<number, string>>({});
  const [reason, setReason] = useState("Returned goods");
  const [reasons, setReasons] = useState(() => [...UZ_REFUND.reasons, ...extraReasons]);
  const [notes, setNotes] = useState("");
  const [back, setBack] = useState(true);
  const [moneyBack, setMoneyBack] = useState<MoneyBack>("cash");
  const [confirm, setConfirm] = useState(false);

  if (!found) {
    return (
      <Drawer open title="Raise credit note" subtitle="Sales" onClose={onClose} width={9999}>
        <div className="type-body text-text-muted">{saleRef} is not in the list any more.</div>
      </Drawer>
    );
  }
  const doc = found.doc;
  const L = doc.lines.map((l, i) => {
    const used = credited(l.product, l.variant);
    const open = Math.max(0, l.qty - used);
    const q = mode === "all" ? open : Math.min(open, Math.max(0, Number(qty[i]) || 0));
    return { i, l, used, open, q };
  });
  const sub = L.reduce((a, x) => a + x.q * x.l.price, 0);
  const vat = Math.round(sub * 0.16 * 100) / 100;
  const tot = sub + vat;
  const qtyTot = L.reduce((a, x) => a + x.q, 0);
  const paid = doc.pays.reduce((a, p) => a + p.amount, 0);
  const over = mode !== "all" && L.some((x) => (Number(qty[x.i]) || 0) > x.open);
  const method = doc.pays[0]?.method || "Cash";
  const hint = !qtyTot
    ? "Nothing left to credit on this sale."
    : over
      ? "A credit quantity is more than what is still open."
      : !reason
        ? "Pick a reason."
        : !confirm
          ? "Confirm the items and amounts to continue."
          : "";

  const facts: [string, string, boolean][] = [
    ["Sale", doc.ref, true],
    ["Date", docDate(doc.date || "2026-11-01"), false],
    ["Customer", doc.cust, false],
    ["Sold from", doc.store, false],
    ["Total", money(doc.total), true],
  ];

  const save = async () => {
    const r = await createCreditNote({
      source: doc.ref,
      customer: doc.cust,
      items: L.filter((x) => x.q > 0).map((x) => ({
        product: x.l.product,
        variant: x.l.variant || "Standard",
        sold: x.l.qty,
        credited: x.used,
        qty: x.q,
        unitPrice: x.l.price * 1.16,
        price: x.l.price,
        unit: x.l.unit || "Piece",
      })),
      reason,
      notes,
      returnToStock: back,
      refundMethod: { cash: "Cash", credit: "Store credit", original: method }[moneyBack],
      moneyBack,
      scope: mode === "all" && L.every((x) => x.used === 0) ? "Full" : "Partial",
      store: doc.store,
    });
    if (r.ok) onDone();
  };

  return (
    <Drawer open title="Raise credit note" subtitle="Sales" onClose={onClose} width={9999}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="type-body max-w-[520px] text-text-secondary">
            The sale stays as it is. The credit note is saved as <b>waiting approval</b>. Stock and money only move once it is approved.
          </div>
          <Panel flush className="flex flex-wrap items-center gap-5 px-4 py-3">
            {facts.map(([label, value, green]) => (
              <div key={label}>
                <Eyebrow>{label}</Eyebrow>
                <div className={`type-label ${green ? "text-green-700" : "text-text"}`}>{value}</div>
              </div>
            ))}
          </Panel>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[2_1_600px] flex-col gap-4">
            <Panel className="flex flex-col gap-3">
              <Eyebrow>1. What is being credited</Eyebrow>
              <div role="radiogroup" aria-label="What is being credited" className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <Choice
                  on={mode === "all"}
                  title="Everything remaining"
                  text={`${L.filter((x) => x.open).length} line(s) still open on this sale.`}
                  onPick={() => {
                    setMode("all");
                    setQty({});
                  }}
                />
                <Choice
                  on={mode === "sel"}
                  title="Selected items"
                  text="Choose lines and quantities."
                  onPick={() => {
                    setMode("sel");
                    setQty(Object.fromEntries(L.map((y) => [y.i, String(y.open)])));
                  }}
                />
              </div>
            </Panel>

            <Panel flush>
              <div className="px-5 py-4">
                <Eyebrow>2. Items</Eyebrow>
                <div className="type-small mt-0.5 text-text-secondary">Amounts come from the sale&apos;s own line prices, including VAT.</div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[640px]" role="table" aria-label="Items">
                  <div role="row" className="type-eyebrow grid gap-3 bg-canvas px-5 py-2 text-text-muted" style={GRID}>
                    <span role="columnheader">Item</span>
                    <span role="columnheader" className="text-right">Sold</span>
                    <span role="columnheader" className="text-right">Credited</span>
                    <span role="columnheader" className="text-right">Open</span>
                    <span role="columnheader" className="text-center">Credit qty</span>
                    <span role="columnheader" className="text-right">Unit price</span>
                    <span role="columnheader" className="text-right">Credit</span>
                  </div>
                  {L.map((x) => (
                    <div role="row" key={x.i} className="type-body grid items-center gap-3 border-t border-border px-5 py-3 text-text" style={GRID}>
                      <span role="cell" className="min-w-0">
                        <span className="block font-semibold">{x.l.product}</span>
                        <span className="type-caption block text-text-muted">{[x.l.variant, x.l.unit].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span role="cell" className="text-right">
                        {x.l.qty}
                      </span>
                      <span role="cell" className="text-right text-text-secondary">
                        {x.used}
                      </span>
                      <span role="cell" className="text-right font-semibold">
                        {x.open}
                      </span>
                      <span role="cell">
                        <Input
                          size="sm"
                          type="number"
                          min="0"
                          aria-label="Credit quantity"
                          disabled={mode === "all" || !x.open}
                          value={mode === "all" ? String(x.open) : (qty[x.i] ?? "0")}
                          onChange={(e) => {
                            const v = e.target.value;
                            setQty((q) => ({ ...q, [x.i]: v }));
                          }}
                        />
                      </span>
                      <span role="cell" className="u-num text-right text-text-secondary">
                        {money(x.l.price * 1.16)}
                      </span>
                      <span role="cell" className="u-num text-right font-semibold text-green-700">
                        {money(x.q * x.l.price * 1.16)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel className="flex flex-col gap-3">
              <Eyebrow>3. Reason</Eyebrow>
              <div className="max-w-[420px]">
                <SearchSelect
                  label="Reason"
                  noun="reason"
                  options={reasons}
                  value={reason}
                  onChange={setReason}
                  onCreate={(name) => {
                    extraReasons = [...extraReasons, name];
                    setReasons((r) => [...r, name]);
                    return name;
                  }}
                />
              </div>
              <Textarea label="Notes (optional, shown on the credit note)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Panel>
          </div>

          <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
            <Panel className="flex flex-col gap-3">
              <Eyebrow>4. Stock</Eyebrow>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={back} onChange={(e) => setBack(e.target.checked)} className="mt-[3px] size-4 accent-[var(--action)]" />
                <span>
                  <span className="type-label text-text">Return goods to stock</span>
                  <span className="type-small block text-text-secondary">
                    Untick when the goods are not coming back (damaged, used up, or a price correction). Applied on approval.
                  </span>
                </span>
              </label>
            </Panel>
            <Panel className="flex flex-col gap-3">
              <Eyebrow>5. Money back</Eyebrow>
              <div className="type-small text-text-secondary">
                {paid
                  ? `${money(paid)} was paid on this sale. Up to ${money(Math.min(paid, tot))} is owed back once approved.`
                  : "Nothing was paid on this sale yet, so the credit reduces what the customer owes."}
              </div>
              <div role="radiogroup" aria-label="Money back" className="flex flex-col gap-3">
                <Choice on={moneyBack === "cash"} title="Refund in cash" text="Paid out from the cash drawer." onPick={() => setMoneyBack("cash")} />
                <Choice on={moneyBack === "credit"} title="Keep as customer credit" text="Held on the customer's account for their next purchase." onPick={() => setMoneyBack("credit")} />
                <Choice on={moneyBack === "original"} title="Back to the original method" text={`Refunded the way they paid (${method}).`} onPick={() => setMoneyBack("original")} />
              </div>
            </Panel>
            <Panel className="flex flex-col gap-3">
              <Eyebrow>Summary</Eyebrow>
              <Row label="Lines" value={String(L.filter((x) => x.q > 0).length)} />
              <Row label="Quantity" value={String(qtyTot)} />
              <Row label="Subtotal" value={money(sub)} />
              <Row label="VAT" value={money(vat)} />
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <span className="type-label text-text">Credit total</span>
                <span className="type-card-title u-num text-green-700">{money(tot)}</span>
              </div>
              <label className="type-small flex cursor-pointer items-start gap-3 text-text-secondary">
                <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 size-4 accent-[var(--action)]" />
                I confirm these items and amounts. The credit note will wait for approval before stock or money moves.
              </label>
              <Button fullWidth icon="check" disabled={!!hint} onClick={save}>
                Raise credit note
              </Button>
              {hint && <div className="type-small text-danger-text">{hint}</div>}
            </Panel>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
