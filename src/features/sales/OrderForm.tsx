"use client";
/**
 * New / edit sales order (feature 013, contracts/ui.md). No stock moves and nothing is owed until
 * goods are dispatched and invoiced. Rates follow the customer's price list and the order total is
 * credit checked on save (feature 012).
 */
import { useMemo, useState } from "react";
import {
  WALK_IN,
  addStoreQuick,
  createOrder,
  orderTotals,
  unitsOf,
  updateOrder,
  useCreditCheck,
  useCustomers,
  usePricer,
  useProducts,
  useStores,
  type CreditStop as Stop,
  type OrderRow,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { DEMO_TODAY, addDays } from "@/lib/demo-clock";
import { CreditStop, CustomerForm } from "@/features/customers";
import { money } from "./shared";

interface Line {
  id: number;
  product: string;
  variant: string;
  unit: string;
  qty: string;
  rate: string;
  taxable: boolean;
  /** The rate was typed, or comes from a saved order: it is not repriced. */
  hand: boolean;
}

let lineId = 0;
const GRID = { gridTemplateColumns: "minmax(0,1fr) 76px 130px 110px 110px 34px" };

export function OrderForm({ edit, onClose }: { edit?: OrderRow; onClose: () => void }) {
  const customers = useCustomers();
  const products = useProducts();
  const stores = useStores();
  const [cust, setCust] = useState(edit?.customer ?? "");
  const [date, setDate] = useState(edit?.date ?? DEMO_TODAY);
  const [deliverBy, setDeliverBy] = useState(edit?.deliverBy ?? addDays(DEMO_TODAY, 2));
  const [store, setStore] = useState(edit?.store ?? "Main Store");
  const [raw, setLines] = useState<Line[]>(() =>
    (edit?.lines ?? []).map((l) => ({ id: ++lineId, product: l.product, variant: l.variant, unit: l.unit, qty: String(l.qty), rate: String(l.rate), taxable: l.taxable, hand: true })),
  );
  const [notes, setNotes] = useState(edit?.notes ?? "");
  const [newCust, setNewCust] = useState<string | null>(null);
  const [stop, setStop] = useState<Stop | null>(null);
  const [error, setError] = useState("");
  const pricer = usePricer(cust);
  const creditCheck = useCreditCheck(cust);

  const customerOptions = useMemo(() => customers.filter((c) => c.name !== WALK_IN).map((c) => c.name).sort((a, b) => a.localeCompare(b)), [customers]);
  const items = useMemo(() => products.flatMap((p) => p.variants.map((v) => ({ key: `${p.name} · ${v.name}`, product: p.name, variant: v, taxable: p.taxable }))), [products]);
  const variantOf = (l: Line) => items.find((i) => i.product === l.product && i.variant.name === l.variant)?.variant;

  // A line that was not typed by hand takes the customer's price for its unit and quantity.
  const lines = raw.map((l) => {
    const p = l.hand ? null : pricer.price(l.product, l.variant, l.unit, Number(l.qty) > 0 ? Number(l.qty) : 1);
    const list = pricer.price(l.product, l.variant, l.unit, Number(l.qty) > 0 ? Number(l.qty) : 1);
    return { ...l, rate: p ? String(p.price) : l.rate, note: l.hand ? "" : pricer.note(p), restore: l.hand && !!list && Number(l.rate) !== list.price ? (list.source === "list" ? `Use ${pricer.group.name} price` : "Use standard price") : "" };
  });
  const totals = orderTotals(lines.map((l) => ({ qty: Number(l.qty) || 0, rate: Number(l.rate) || 0, taxable: l.taxable })));
  const blocked = !cust || !date || !deliverBy || !lines.length || lines.some((l) => !(Number(l.qty) > 0));

  const setLine = (id: number, patch: Partial<Line>) => {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setError("");
  };
  const addItem = (key: string) => {
    const i = items.find((x) => x.key === key);
    if (i) setLines((ls) => [...ls, { id: ++lineId, product: i.product, variant: i.variant.name, unit: unitsOf(i.variant)[0]!, qty: "1", rate: String(i.variant.price), taxable: i.taxable, hand: false }]);
    setError("");
  };

  const save = async (approval?: { reason: string }) => {
    const input = {
      customer: cust,
      date,
      deliverBy,
      store,
      lines: lines.map((l) => ({ product: l.product, variant: l.variant, unit: l.unit, qty: Number(l.qty), rate: Number(l.rate) || 0, taxable: l.taxable })),
      notes,
      ...(approval ? { approval } : {}),
    };
    if (edit) {
      const r = await updateOrder(edit.number, input);
      return r.ok ? onClose() : setError(r.message);
    }
    if (!approval) {
      const hit = creditCheck(totals.total);
      if (hit) return setStop(hit);
    }
    const r = await createOrder(input);
    if (r.ok) onClose();
    else if (r.stop) setStop(r.stop);
    else setError(r.message);
  };

  return (
    <>
      <Drawer open={newCust === null && !stop} title={edit ? `Edit ${edit.number}` : "New sales order"} subtitle="Sales" onClose={onClose} width={860}>
        <div className="flex flex-col gap-5">
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            <SearchSelect label="Customer" noun="customer" options={customerOptions} value={cust} onChange={setCust} onNew={(t) => setNewCust(t)} />
            <SearchSelect label="Dispatch from" noun="store" options={stores.map((s) => s.name)} value={store} onChange={setStore} onCreate={(n) => addStoreQuick(n)} />
            <Input label="Order date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Deliver by" type="date" value={deliverBy} onChange={(e) => setDeliverBy(e.target.value)} />
          </div>

          <div className="flex flex-col gap-3">
            {/* Focusable so the table can be scrolled sideways from the keyboard on a narrow screen. */}
            <div className="overflow-x-auto" tabIndex={0} role="group" aria-label="Order items">
              <div className="min-w-[640px]" role="table" aria-label="Items">
                <div role="row" className="type-table-head grid items-center gap-2 rounded-sm bg-canvas p-3 text-text-muted" style={GRID}>
                  <span role="columnheader">Item</span>
                  <span role="columnheader" className="text-right">Qty</span>
                  <span role="columnheader">Unit</span>
                  <span role="columnheader" className="text-right">Rate</span>
                  <span role="columnheader" className="text-right">Amount</span>
                  <span role="columnheader" />
                </div>
                {lines.length === 0 && <div className="type-small p-5 text-center text-text-muted">No items added yet.</div>}
                {lines.map((l) => {
                  const v = variantOf(l);
                  return (
                    <div role="row" key={l.id} className="grid items-center gap-2 border-b border-border px-3 py-2" style={GRID}>
                      <span role="cell" className="type-label min-w-0 break-words text-text">
                        {l.product} · {l.variant}
                        {l.note && <span className="type-caption block font-normal text-text-muted">{l.note}</span>}
                        {l.restore && (
                          <button type="button" className="type-caption block cursor-pointer border-0 bg-transparent p-0 font-normal text-green-700 underline" onClick={() => setLine(l.id, { hand: false })}>
                            {l.restore}
                          </button>
                        )}
                      </span>
                      <span role="cell">
                        <Input size="sm" type="number" min="1" aria-label="Quantity" value={l.qty} onChange={(e) => setLine(l.id, { qty: e.target.value })} />
                      </span>
                      <span role="cell">
                        <SearchSelect noun="unit" options={v ? unitsOf(v) : [l.unit]} value={l.unit} onChange={(u) => setLine(l.id, { unit: u })} />
                      </span>
                      <span role="cell">
                        <Input size="sm" type="number" min="0" aria-label="Rate" value={l.rate} onChange={(e) => setLine(l.id, { rate: e.target.value, hand: true })} />
                      </span>
                      <span role="cell" className="type-label u-num text-right text-text">
                        {Math.round((Number(l.qty) || 0) * (Number(l.rate) || 0)).toLocaleString("en-US")}
                      </span>
                      <span role="cell">
                        <IconButton icon="trash-2" size="sm" label="Remove item" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="min-w-[240px] flex-[0_1_340px]">
                <SearchSelect label="Add item" noun="product" options={items.map((i) => i.key)} value="" onChange={addItem} />
              </div>
              <div className="flex min-w-[240px] flex-[0_1_320px] flex-col">
                <div className="type-body flex justify-between border-b border-border py-2 text-text">
                  <span>Subtotal</span>
                  <span className="u-num">{money(totals.subtotal)}</span>
                </div>
                <div className="type-body flex justify-between border-b border-border py-2 text-text">
                  <span>VAT 16%</span>
                  <span className="u-num">{money(totals.vat)}</span>
                </div>
                <div className="type-title flex justify-between py-3 text-text">
                  <span>Total</span>
                  <span className="u-num">{money(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <Textarea label="Notes (optional)" rows={2} placeholder="Anything the store or driver should know" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <p className="type-small m-0 text-text-secondary">Saving an order does not move stock. Stock leaves {store || "the store"} when you dispatch.</p>
          {error && (
            <div role="alert" className="type-small text-danger-text">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Button disabled={blocked} onClick={() => void save()}>
              Save
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Drawer>
      <CustomerForm open={newCust !== null} initialName={newCust ?? ""} crumb="Sales" onClose={() => setNewCust(null)} onSaved={(n) => setCust(n)} />
      <CreditStop
        stop={stop}
        onClose={() => setStop(null)}
        onApprove={(reason) => {
          setStop(null);
          void save({ reason });
        }}
      />
    </>
  );
}
