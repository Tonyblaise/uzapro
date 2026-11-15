"use client";
/**
 * New field sale (feature 024, design `fs`), full screen, opened by `?action=new` on Field sales.
 * Customer and delivery location, items, delivery (store, date, driver, notes), the rep and route,
 * and payment: Paid now, On delivery or On credit. Saving sends it to Deliveries; stock leaves the
 * store when it is dispatched. Prices follow the customer's price list (feature 012).
 * With `mode="delivery"` it is "New delivery" (Field sales › Deliveries): linked to a sale or
 * invoice or to nothing, Already paid / Collect on delivery / Nothing to collect, no rep.
 */
import { useMemo, useState } from "react";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { kes } from "@/lib/format";
import {
  FIELD_PAY_METHODS,
  WALK_IN,
  createDelivery,
  createFieldSale,
  fieldTotal,
  fieldVat,
  useCustomers,
  useFieldDrivers,
  useFieldReps,
  usePricer,
  useProducts,
  useQuantity,
  useInvoices,
  useSales,
  useStores,
  type FieldLine,
  type DeliveryPay,
  type FieldPayMode,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CustomerForm } from "@/features/customers";

const MODES: [FieldPayMode, string, string][] = [
  ["now", "Paid now", "banknote"],
  ["delivery", "On delivery", "truck"],
  ["credit", "On credit", "calendar"],
];

const DLV_MODES: [DeliveryPay, string, string][] = [
  ["paid", "Already paid", "circle-check"],
  ["delivery", "Collect on delivery", "truck"],
  ["none", "Nothing to collect", "x"],
];

const card = "flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-surface p-5";

export function NewFieldSaleForm({ onClose, mode = "sale" }: { onClose: () => void; mode?: "sale" | "delivery" }) {
  const isD = mode === "delivery";
  const customers = useCustomers();
  const allSales = useSales();
  const invoices = useInvoices();
  const products = useProducts();
  const reps = useFieldReps();
  const drivers = useFieldDrivers();
  const stores = useStores()
    .filter((s) => s.type !== "Transfer")
    .map((s) => s.name);

  const [cust, setCust] = useState("");
  const [phone, setPhone] = useState("");
  const [loc, setLoc] = useState("");
  const [prod, setProd] = useState("");
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState("1");
  const [lines, setLines] = useState<FieldLine[]>([]);
  const [store, setStore] = useState("Main Store");
  const [date, setDate] = useState(DEMO_TODAY);
  const [driver, setDriver] = useState("");
  const [note, setNote] = useState("");
  const [rep, setRep] = useState("");
  const [route, setRoute] = useState("");
  const [pay, setPay] = useState<FieldPayMode>("delivery");
  const [method, setMethod] = useState<string>("M-Pesa");
  const [ref, setRef] = useState("");
  const [dpay, setDpay] = useState<DeliveryPay>("paid");
  const [doc, setDoc] = useState("None");
  const [err, setErr] = useState("");
  const [newCust, setNewCust] = useState<string | null>(null);
  const pricer = usePricer(cust || WALK_IN);
  const left = useQuantity(prod, store);

  /** "Linked to": sales with items (their items load below) and invoices. */
  const docs = useMemo(
    () => ["None", ...invoices.map((i) => `${i.number} · ${i.customer}`), ...allSales.filter((x) => x.type !== "Field sale" && x.lines.length > 0).map((x) => `${x.ref} · ${x.customer}`)],
    [invoices, allSales],
  );
  const pickDoc = (v: string) => {
    setDoc(v);
    clear();
    const ref = v.split(" · ")[0] ?? "";
    const sale = allSales.find((x) => x.ref === ref);
    const inv = invoices.find((i) => i.number === ref);
    const who = sale?.customer ?? inv?.customer;
    // Seed invoices may use a short name ("Morningview"): match it to the customer list.
    const known = who ? (customers.find((c) => c.name === who) ?? customers.find((c) => c.name.startsWith(`${who} `))) : undefined;
    if (known) pickCustomer(known.name);
    if (sale)
      setLines(
        sale.lines.map((l) => ({
          product: l.product,
          variant: l.variant || "Standard",
          qty: l.qty,
          price: l.price,
        })),
      );
  };
  const customerOptions = useMemo(() => customers.map((c) => c.name).sort((a, b) => (a === WALK_IN ? -1 : b === WALK_IN ? 1 : a.localeCompare(b))), [customers]);
  const product = products.find((p) => p.name === prod);
  const variants = product?.variants ?? [];
  const v = variants.find((x) => x.name === variant) ?? variants[0];
  const unitPrice = (vName: string, q: number) => {
    const vv = variants.find((x) => x.name === vName);
    return vv ? (pricer.price(prod, vv.name, vv.unit || "Piece", q)?.price ?? vv.price) : 0;
  };
  const walk = !cust || cust === WALK_IN;
  const total = fieldTotal({ lines });
  const vat = fieldVat(total);
  const clear = () => setErr("");

  const pickCustomer = (name: string) => {
    const c = customers.find((x) => x.name === name);
    setCust(name);
    if (c?.phone && c.phone !== "—") setPhone(c.phone);
    if (c?.address && c.address !== "—") setLoc(c.address);
    clear();
  };
  const pickRep = (name: string) => {
    const r = reps.find((x) => x.name === name);
    setRep(name);
    if (r?.route) setRoute(r.route);
    if (!driver) setDriver(name);
    clear();
  };
  const addLine = () => {
    if (!prod || !v) return setErr("Pick a product to add.");
    const q = Math.max(1, Math.round(Number(qty) || 1));
    setLines((ls) => {
      const at = ls.findIndex((l) => l.product === prod && l.variant === v.name);
      if (at >= 0) return ls.map((l, i) => (i === at ? { ...l, qty: l.qty + q } : l));
      return [...ls, { product: prod, variant: v.name, qty: q, price: unitPrice(v.name, q) }];
    });
    setProd("");
    setVariant("");
    setQty("1");
    clear();
  };
  const bump = (i: number, d: number) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, qty: Math.max(1, l.qty + d) } : l)));
  const save = async () => {
    const r = isD
      ? await createDelivery({
          link: doc === "None" ? "" : (doc.split(" · ")[0] ?? ""),
          customer: cust,
          phone,
          location: loc,
          lines,
          store,
          date,
          driver,
          note,
          pay: dpay,
        })
      : await createFieldSale({
          customer: cust,
          phone,
          location: loc,
          lines,
          store,
          date,
          driver,
          note,
          rep,
          route,
          pay,
          method,
          ref,
        });
    if (r.ok) onClose();
    else setErr(r.message);
  };

  const payNote = isD
    ? dpay === "paid"
      ? "The customer has already paid. The driver collects nothing."
      : dpay === "none"
        ? "For example a replacement, a sample or a transfer to a customer."
        : "The driver collects the total shown below."
    : pay === "now"
      ? "The rep has already collected the money."
      : pay === "delivery"
        ? "The driver collects the money when the goods arrive."
        : walk
          ? "Pick a named customer to sell on credit."
          : `Added to ${cust}'s balance in Receivables, due in 30 days.`;

  return (
    <>
      <Drawer
        open={newCust === null}
        title={isD ? "New delivery" : "New field sale"}
        subtitle={isD ? "Send goods to a customer, for a sale already made or anything else." : "A sale taken by a rep away from the shop. It goes to Deliveries when you save."}
        onClose={onClose}
        width={9999}
      >
        <div className="mx-auto grid w-full max-w-[1280px] items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <section className={card}>
              <div className="type-title text-text">Customer</div>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                }}
              >
                <SearchSelect label="Customer" noun="customer" options={customerOptions} value={cust} onChange={pickCustomer} onNew={(typed) => setNewCust(typed)} />
                <Input label="Phone number" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Input label="Delivery location" icon="map-pin" placeholder="For example, Ruiru, Kimbo, next to Naivas" value={loc} onChange={(e) => (setLoc(e.target.value), clear())} />
            </section>

            <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
                <div className="type-title text-text">Items</div>
                <div className="grid items-end gap-3 grid-cols-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_90px_auto]">
                  <SearchSelect
                    label="Product"
                    noun="product"
                    options={products.map((p) => p.name)}
                    value={prod}
                    onChange={(p) => {
                      setProd(p);
                      setVariant(products.find((x) => x.name === p)?.variants[0]?.name ?? "");
                      clear();
                    }}
                  />
                  <SearchSelect label="Option" noun="option" options={variants.map((x) => x.name)} value={v?.name ?? ""} onChange={setVariant} />
                  <Input label="Qty" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
                  <Button icon="plus" onClick={addLine}>
                    Add
                  </Button>
                </div>
                {prod && v && (
                  <div className={`type-small ${left > 0 ? "text-text-secondary" : "text-warning-text"}`}>
                    {left > 0 ? `${left} in stock at ${store} · ${kes(unitPrice(v.name, 1))} each` : `None in stock at ${store}. You can still take the order.`}
                  </div>
                )}
              </div>
              {lines.map((l, i) => (
                <div key={`${l.product}|${l.variant}`} className="grid grid-cols-[minmax(0,1fr)_auto_120px_30px] items-center gap-3 border-b border-border px-5 py-3">
                  <div className="min-w-0">
                    <div className="type-label text-text">{l.product}</div>
                    <div className="type-small text-text-muted">
                      {l.variant !== "Standard" ? `${l.variant} · ` : ""}
                      {kes(l.price)} each
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton icon="minus" size="sm" variant="secondary" label={`Fewer ${l.product}`} onClick={() => bump(i, -1)} />
                    <span className="type-label u-num w-8 text-center">{l.qty}</span>
                    <IconButton icon="plus" size="sm" variant="secondary" label={`More ${l.product}`} onClick={() => bump(i, 1)} />
                  </div>
                  <span className="type-label u-num text-right">{kes(l.price * l.qty)}</span>
                  <IconButton icon="trash-2" size="sm" label={`Remove ${l.product}`} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} />
                </div>
              ))}
              {lines.length === 0 && <div className="type-body p-6 text-center text-text-muted">Pick a product above and add it.</div>}
            </section>

            <section className={card}>
              <div className="type-title text-text">Delivery</div>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                }}
              >
                <SearchSelect label="Deliver from" noun="store" options={stores} value={store} onChange={setStore} />
                <Input label="Delivery date" type="date" value={date} onChange={(e) => (setDate(e.target.value), clear())} />
                <SearchSelect label="Driver" noun="driver" options={drivers} value={driver} onChange={setDriver} />
              </div>
              <Textarea label="Delivery notes (optional)" rows={2} placeholder="For example, call before arriving, gate code 1234" value={note} onChange={(e) => setNote(e.target.value)} />
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-0">
            {isD ? (
              <section className={card}>
                <div className="type-title text-text">Linked to (optional)</div>
                <SearchSelect label="Sale or invoice" noun="sale or invoice" options={docs} value={doc} onChange={pickDoc} />
                <div className="type-small text-text-secondary">
                  {doc !== "None" ? `The items from ${doc.split(" · ")[0]} were added below. Change them if only part is going out.` : "Leave as None for a delivery that isn't tied to a sale."}
                </div>
              </section>
            ) : (
              <section className={card}>
                <div className="type-title text-text">Sales rep</div>
                <SearchSelect label="Rep who took the order" noun="rep" options={reps.map((r) => r.name)} value={rep} onChange={pickRep} />
                <Input label="Route or area" placeholder="For example, Thika Road" value={route} onChange={(e) => setRoute(e.target.value)} />
              </section>
            )}

            <section className={card}>
              <div className="type-title text-text">Payment</div>
              <div role="group" aria-label="Payment" className="grid grid-cols-3 gap-1.5">
                {(isD ? DLV_MODES : MODES).map(([k, label, icon]) => {
                  const on = isD ? dpay === k : pay === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={on}
                      onClick={() => (isD ? setDpay(k as DeliveryPay) : setPay(k as FieldPayMode), clear())}
                      className={`type-small flex flex-col items-center gap-1 rounded-md border-2 px-1.5 py-2.5 font-semibold ${on ? "border-green-600 bg-green-50 text-text" : "border-border bg-surface text-text-secondary"}`}
                    >
                      <Icon name={icon} size={18} />
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className={`type-small ${!isD && pay === "credit" && walk ? "text-danger-text" : "text-text-secondary"}`}>{payNote}</div>
              {!isD && pay === "now" && (
                <div className="grid grid-cols-2 gap-3">
                  <SearchSelect label="Paid by" options={[...FIELD_PAY_METHODS]} value={method} onChange={setMethod} />
                  <Input label="Reference" placeholder="M-Pesa code" value={ref} onChange={(e) => setRef(e.target.value)} />
                </div>
              )}
            </section>

            <section className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface p-5">
              <div className="type-body flex justify-between text-text-secondary">
                <span>Subtotal (before VAT)</span>
                <span className="u-num">{kes(total - vat)}</span>
              </div>
              <div className="type-body flex justify-between text-text-secondary">
                <span>VAT 16% (included)</span>
                <span className="u-num">{kes(vat)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-2">
                <span className="type-title text-text">Total</span>
                <span className="u-num text-[26px] font-extrabold text-text">{kes(total)}</span>
              </div>
              {err && (
                <div role="alert" className="type-small text-danger-text">
                  {err}
                </div>
              )}
              <Button size="lg" icon="truck" fullWidth onClick={() => void save()} className="mt-2">
                {isD ? "Create delivery" : "Save and send to deliveries"}
              </Button>
            </section>
          </div>
        </div>
      </Drawer>
      <CustomerForm open={newCust !== null} initialName={newCust ?? ""} crumb="Field sales" onClose={() => setNewCust(null)} onSaved={(name) => pickCustomer(name)} />
    </>
  );
}
