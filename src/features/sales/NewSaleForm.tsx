"use client";
/** New sale (design `isSaleNew`), opened by `?action=new` on All sales. */
import { useMemo, useState } from "react";
import { PAY_LATER, WALK_IN, recordSale, useCustomers, useProducts, type SaleLine } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { docTotals } from "@/lib/totals";
import { CustomerForm } from "@/features/customers";
import { money } from "./shared";

const PAY_OPTIONS = ["M-Pesa", "Cash", "Card", PAY_LATER];

type CartLine = SaleLine & { id: number };

let lineId = 0;

export function NewSaleForm({ onClose }: { onClose: () => void }) {
  const customers = useCustomers();
  const products = useProducts();
  const [cust, setCust] = useState(WALK_IN);
  const [prod, setProd] = useState("");
  const [variant, setVariant] = useState("");
  const [unit, setUnit] = useState("Piece");
  const [amt, setAmt] = useState("");
  const [qty, setQty] = useState("1");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [pay, setPay] = useState("M-Pesa");
  const [payOpts, setPayOpts] = useState(PAY_OPTIONS);
  const [payRef, setPayRef] = useState("");
  const [newCust, setNewCust] = useState<string | null>(null);

  const customerOptions = useMemo(
    () => customers.map((c) => c.name).sort((a, b) => (a === WALK_IN ? -1 : b === WALK_IN ? 1 : a.localeCompare(b))),
    [customers],
  );
  const product = products.find((p) => p.name === prod);
  const variants = product?.variants ?? [];
  const v = variants.find((x) => x.name === variant);
  const units = v ? [{ unit: v.unit || "Piece", price: v.price }, ...v.extraUnits.map((u) => ({ unit: u.unit, price: u.price }))] : [{ unit: "Piece", price: 0 }];
  const priceText = (n: number) => (n ? String(n) : "");

  const pickProduct = (name: string) => {
    const p = products.find((x) => x.name === name);
    const only = p && p.variants.length === 1 ? p.variants[0] : undefined;
    setProd(name);
    setVariant(only?.name ?? "");
    setUnit(only?.unit || "Piece");
    setAmt(priceText(only?.price ?? 0));
    setQty("1");
  };
  const pickVariant = (name: string) => {
    const x = variants.find((y) => y.name === name);
    setVariant(name);
    setUnit(x?.unit || "Piece");
    setAmt(priceText(x?.price ?? 0));
  };
  const pickUnit = (u: string) => {
    const hit = units.find((x) => x.unit === u);
    setUnit(u);
    if (hit) setAmt(priceText(hit.price));
  };

  const lineAmt = Number(amt);
  const lineQty = Number(qty);
  const blocked = !variant || !(lineAmt > 0) || !(lineQty > 0);
  const addLine = () => {
    setLines((ls) => [...ls, { id: ++lineId, product: prod, variant, unit, qty: lineQty, price: lineAmt, taxable: product?.taxable ?? true }]);
    setProd("");
    setVariant("");
    setAmt("");
    setQty("1");
    setUnit("Piece");
  };

  const t = docTotals(lines.map((l) => ({ qty: l.qty, price: l.price, taxable: l.taxable })));
  const credit = pay === PAY_LATER;

  const record = async () => {
    const r = await recordSale({ customer: cust, lines: lines.map((l) => ({ product: l.product, variant: l.variant, unit: l.unit, qty: l.qty, price: l.price, taxable: l.taxable })), payMethod: pay, payRef });
    if (r.ok) onClose();
  };

  return (
    <>
      <Drawer open={newCust === null} title="New sale" subtitle="Sales" onClose={onClose} width={9999}>
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[3_1_560px] flex-col gap-4 rounded-lg border border-border bg-surface p-5">
            <div className="type-title text-text">Customer and items</div>
            <SearchSelect label="Customer" noun="customer" options={customerOptions} value={cust} onChange={setCust} onNew={(typed) => setNewCust(typed)} />
            <div className="flex flex-col gap-3 rounded-md bg-canvas p-4">
              <SearchSelect label="Product" noun="product" options={products.map((p) => p.name)} value={prod} onChange={pickProduct} />
              {prod && (
                <>
                  <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
                    <SearchSelect label="Product variant" noun="variant" options={variants.map((x) => x.name)} value={variant} onChange={pickVariant} />
                    <SearchSelect label="Unit of measure" noun="unit" options={units.map((u) => u.unit)} value={unit} onChange={pickUnit} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Amount each (KES)" type="number" min="0" value={amt} onChange={(e) => setAmt(e.target.value)} />
                    <Input label="Number of units" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
                  </div>
                  <div>
                    <Button variant="secondary" icon="plus" disabled={blocked} onClick={addLine}>
                      Add to sale
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="sticky top-0 flex min-w-0 flex-[2_1_340px] flex-col gap-4 rounded-lg border border-border bg-surface p-5">
            <div className="type-title text-text">This sale</div>
            <div>
              {lines.length === 0 && <div className="type-small py-2 text-text-muted">No items in this sale.</div>}
              {lines.map((l) => (
                <div key={l.id} className="type-body flex items-center gap-2 border-b border-border py-2">
                  <span className="min-w-0 flex-1 text-text">
                    {l.product} · {l.variant} × {l.qty}
                    {l.unit ? ` ${l.unit}` : ""}
                  </span>
                  <span className="u-num text-text">{(l.price * l.qty).toLocaleString("en-US", { maximumFractionDigits: 3 })}</span>
                  <IconButton icon="trash-2" size="sm" label="Remove from sale" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} />
                </div>
              ))}
              <div className="type-small flex justify-between py-2 text-text-muted">
                <span>VAT 16%</span>
                <span className="u-num">{t.vat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</span>
              </div>
              <div className="type-card-title flex justify-between py-1 text-text">
                <span>Total</span>
                <span className="u-num">{money(t.total)}</span>
              </div>
            </div>
            <SearchSelect
              label="Paid by"
              noun="payment method"
              options={payOpts}
              value={pay}
              onChange={setPay}
              onCreate={(name) => {
                setPayOpts((o) => [...o, name]);
                return name;
              }}
            />
            {!credit && (
              <Input label="Payment reference (optional)" placeholder="For example, M-Pesa code or card slip number" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button fullWidth icon="check" disabled={lines.length === 0} onClick={record}>
                Record sale
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
      <CustomerForm
        open={newCust !== null}
        initialName={newCust ?? ""}
        crumb="Sales"
        onClose={() => setNewCust(null)}
        onSaved={(name) => setCust(name)}
      />
    </>
  );
}
