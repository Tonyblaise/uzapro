"use client";
/**
 * New / edit purchase order (design `isPoForm`, opened by `poOpen`): General information, Payment,
 * Line items, the summary card and "Save and approve" / "Save as draft" / "Cancel".
 * Opens with `?action=new` or `?edit=<ref>` (contracts/routes.md).
 */
import { useMemo, useState, type ReactNode } from "react";
import { PO_ACCOUNTS, PO_TERMS, UZ_PAYMETHODS, savePurchaseOrder, usePurchaseOrder, useProducts, useSuppliers, variantNames, type PurchaseOrder } from "@/data";
import { SupplierForm } from "@/features/suppliers";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CRUMB, NotesField, PurchaseDrawer, docDate, money, splitKey, useStoreOptions, useUnitOptions } from "./shared";

interface Line {
  id: string;
  key: string;
  qty: string;
  unit: string;
  cost: string;
  sell: number;
  recv?: number;
}

export function PurchaseOrderForm({ edit, onClose }: { edit?: string; onClose: () => void }) {
  const order = usePurchaseOrder(edit);
  if (edit && !order) {
    return (
      <PurchaseDrawer title={`Edit ${edit}`} onClose={onClose}>
        <div className="type-body text-text-muted">{edit} is not in the list.</div>
      </PurchaseDrawer>
    );
  }
  return <Form key={edit ?? "new"} order={order} onClose={onClose} />;
}

function Section({ icon, title, extra, children }: { icon: IconName; title: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border bg-green-50 px-5 py-4">
        <span className="grid size-8 place-items-center rounded-sm bg-surface text-green-700">
          <Icon name={icon} size={16} />
        </span>
        <span className="type-title text-text">{title}</span>
        {extra}
      </div>
      <div className="flex flex-col gap-4 p-5">{children}</div>
    </section>
  );
}

function Form({ order, onClose }: { order?: PurchaseOrder; onClose: () => void }) {
  const suppliers = useSuppliers();
  const stores = useStoreOptions();
  const units = useUnitOptions();
  const products = useProducts();
  const [supplier, setSupplier] = useState(order?.supplier ?? "");
  const [store, setStore] = useState(order?.store ?? "Main Store");
  const [orderDate, setOrderDate] = useState(order?.date ?? "2026-11-01");
  const [expected, setExpected] = useState(order?.expected ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [term, setTerm] = useState(order?.term || "Cash on delivery");
  const [method, setMethod] = useState(order?.method || "Cash");
  const [account, setAccount] = useState(order?.account ?? "");
  const [paid, setPaid] = useState(!!order?.paid);
  const [defQty, setDefQty] = useState("1");
  const [terms, setTerms] = useState<string[]>([...PO_TERMS]);
  const [newSupplier, setNewSupplier] = useState<string | null>(null);

  const sellOf = (key: string) => {
    const { name, variant } = splitKey(key);
    const v = products.find((p) => p.name === name)?.variants.find((x) => x.name === variant);
    return v ? { cost: v.cost, price: v.price } : null;
  };
  const [lines, setLines] = useState<Line[]>(() =>
    (order?.lines ?? []).map((l) => ({ id: l.id, key: l.key, qty: String(l.qty), unit: l.unit, cost: String(l.cost), sell: sellOf(l.key)?.price ?? 0, recv: l.recv })),
  );

  const items = useMemo(() => products.flatMap((p) => variantNames(products, p.name).map((v) => `${p.name} · ${v}`)), [products]);

  const pick = (key: string) => {
    const v = sellOf(key);
    setLines((ls) => [...ls, { id: `new-${Date.now()}`, key, qty: String(Number(defQty) || 1), unit: units.base, cost: v ? String(v.cost) : "", sell: v?.price ?? 0 }]);
  };
  const set = (id: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const total = lines.reduce((a, l) => a + (Number(l.qty) || 0) * (Number(l.cost) || 0), 0);
  const blocked = !supplier || !store || lines.length === 0 || lines.some((l) => !(Number(l.qty) > 0));
  const summary = [
    { label: "Supplier", value: supplier || "Not set" },
    { label: "Deliver to", value: store || "Not set" },
    { label: "Expected", value: expected ? docDate(expected) : "Not set" },
    { label: "Payment", value: term + (paid ? ", paid" : "") },
    { label: "Items", value: String(lines.length) },
  ];

  const save = async (approve: boolean) => {
    const r = await savePurchaseOrder(
      {
        supplier,
        store,
        date: orderDate,
        expected,
        notes,
        term,
        method,
        account,
        paid,
        lines: lines.map((l) => ({
          key: l.key,
          qty: Number(l.qty) || 0,
          unit: l.unit,
          cost: Number(l.cost) || 0,
          ...(l.id.startsWith("new-") ? {} : { id: l.id }),
          ...(l.recv !== undefined ? { recv: l.recv } : {}),
        })),
      },
      { approve, edit: order?.ref },
    );
    if (r.ok) onClose();
  };

  const eyebrow = "type-eyebrow mb-1.5 text-text-muted";

  return (
    <>
      <PurchaseDrawer title={order ? `Edit ${order.ref}` : "New purchase order"} onClose={onClose}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4">
          <div className="type-body text-text-secondary">Choose a supplier and add the items you need.</div>
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex min-w-0 flex-[1_1_620px] flex-col gap-4">
              <Section icon="file-text" title="General information">
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                  <SearchSelect label="Supplier" noun="supplier" options={suppliers} value={supplier} onChange={setSupplier} onNew={(typed) => setNewSupplier(typed)} />
                  <SearchSelect label="Destination store" noun="store" options={stores.names} value={store} onChange={setStore} onCreate={stores.create} />
                  <Input label="Order date" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                  <Input label="Expected delivery (optional)" type="date" value={expected} onChange={(e) => setExpected(e.target.value)} />
                </div>
                <NotesField id="po-notes" label="Internal notes (optional)" rows={3} placeholder="Reason for the order, special instructions" value={notes} onChange={setNotes} />
              </Section>

              <Section icon="wallet" title="Payment">
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
                  <SearchSelect
                    label="Payment term"
                    options={terms}
                    value={term}
                    onChange={setTerm}
                    onCreate={(n) => {
                      setTerms((t) => [...t, n]);
                      return n;
                    }}
                  />
                  <SearchSelect label="Payment method" options={UZ_PAYMETHODS} value={method} onChange={setMethod} />
                  <SearchSelect label="Pay from account (optional)" options={PO_ACCOUNTS} value={account} onChange={setAccount} />
                </div>
                <Checkbox checked={paid} onChange={setPaid} label="Already paid" />
              </Section>

              <Section icon="list" title="Line items" extra={<span className="type-caption text-text-muted">{lines.length + (lines.length === 1 ? " item" : " items")}</span>}>
                <div className="grid gap-4" style={{ gridTemplateColumns: "140px minmax(0,1fr)" }}>
                  <Input label="Default quantity" type="number" min={1} value={defQty} onChange={(e) => setDefQty(e.target.value)} />
                  <SearchSelect label="Search products" noun="product" options={items} value="" onChange={pick} />
                </div>
                {lines.length === 0 && (
                  <div className="type-small rounded-md border border-dashed border-border-strong p-5 text-center text-text-muted">No items added yet. Search for a product above.</div>
                )}
                {lines.map((l, i) => (
                  <div key={l.id} role="group" aria-label={l.key} className="flex flex-col gap-3 rounded-md border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="type-eyebrow inline-flex items-center gap-2 text-text-muted">
                        <span className="grid h-[22px] min-w-[22px] place-items-center rounded-sm bg-green-50 text-green-700">{i + 1}</span>
                        Item
                      </span>
                      <IconButton icon="trash-2" size="sm" label="Remove item" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} />
                    </div>
                    <div className="grid items-start gap-3" style={{ gridTemplateColumns: "minmax(0,1.4fr) 90px 140px minmax(0,1fr)" }}>
                      <div>
                        <div className={eyebrow}>Product</div>
                        <div className="type-label py-1.5 text-text [overflow-wrap:anywhere]">{l.key}</div>
                      </div>
                      <div>
                        <div className={eyebrow}>Qty</div>
                        <Input size="sm" type="number" min={1} aria-label="Quantity" value={l.qty} onChange={(e) => set(l.id, { qty: e.target.value })} />
                      </div>
                      <div>
                        <div className={eyebrow}>Unit</div>
                        <SearchSelect noun="unit" options={units.options} value={l.unit} onChange={(v) => set(l.id, { unit: v })} onCreate={units.create} />
                      </div>
                      <div>
                        <div className={eyebrow}>Cost price (KES)</div>
                        <Input size="sm" type="number" min={0} aria-label="Cost price" value={l.cost} onChange={(e) => set(l.id, { cost: e.target.value })} />
                        {l.sell > 0 && <div className="type-caption mt-1 text-text-muted">Selling price: KES {l.sell.toLocaleString("en-US")}</div>}
                      </div>
                    </div>
                    <div className="type-small flex justify-end gap-2 border-t border-border pt-2 text-text-muted">
                      Line total <b className="u-num text-text">{money((Number(l.qty) || 0) * (Number(l.cost) || 0))}</b>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-3 text-right">
                  <div className="type-eyebrow text-text-muted">Estimated total</div>
                  <div className="type-kpi u-num text-text">{money(total)}</div>
                </div>
              </Section>
            </div>

            <div className="sticky top-0 flex min-w-[260px] flex-[0_1_320px] flex-col gap-3">
              <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
                {summary.map((s) => (
                  <div key={s.label} className="type-body flex justify-between gap-3 text-text-secondary">
                    <span>{s.label}</span>
                    <span className="text-right font-medium text-text">{s.value}</span>
                  </div>
                ))}
                <div className="type-title flex justify-between border-t border-border pt-3 text-text">
                  <span>Total</span>
                  <span className="u-num">{money(total)}</span>
                </div>
              </section>
              <Button fullWidth disabled={blocked} onClick={() => save(true)}>
                Save and approve
              </Button>
              <Button variant="soft" fullWidth disabled={blocked} onClick={() => save(false)}>
                Save as draft
              </Button>
              <Button variant="secondary" fullWidth onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </PurchaseDrawer>
      <SupplierForm open={newSupplier !== null} initialName={newSupplier ?? ""} crumb={CRUMB} onClose={() => setNewSupplier(null)} onSaved={(name) => setSupplier(name)} />
    </>
  );
}
