"use client";
/**
 * Quotation / invoice / credit note form (design `isQuoteForm`, switched by `qKind`).
 * Opened by `?action=quote`, `?action=invoice` and `?action=credit`, and by Edit / Convert to invoice.
 */
import { useMemo, useState } from "react";
import {
  UZ_BIZ,
  UZ_REFUND,
  addStoreQuick,
  createCreditDocument,
  createInvoice,
  createQuotation,
  unitList,
  updateDocument,
  useCreditNotes,
  useCustomers,
  useInvoices,
  useProducts,
  useQuotations,
  useRole,
  useStockLevels,
  useStores,
  useUnits,
  WALK_IN,
  type DocLine,
  type Quotation,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { addDays } from "@/lib/demo-clock";
import { nextRef } from "@/lib/refs";
import { CustomerForm } from "@/features/customers";
import { money } from "./shared";

export type DocKind = "quote" | "invoice" | "credit";

interface QLine {
  id: number;
  key: string;
  taxable: boolean;
  qty: string;
  unit: string;
  price: string;
}

let qId = 0;
let extraReasons: string[] = [];
let bizName = UZ_BIZ.name;
let bizLogo = "";

const WORD = {
  big: { quote: "QUOTATION", invoice: "INVOICE", credit: "CREDIT NOTE" },
  to: { quote: "Quotation to", invoice: "Invoice to", credit: "Credit note to" },
  no: { quote: "Quotation no.", invoice: "Invoice no.", credit: "Credit note no." },
  date: { quote: "Quotation date", invoice: "Invoice date", credit: "Credit note date" },
  title: { quote: "New quotation", invoice: "New invoice", credit: "New credit note" },
} as const;

const toLines = (lines: DocLine[]): QLine[] => lines.map((l) => ({ id: ++qId, key: l.description, taxable: l.taxable, qty: String(l.qty), unit: l.unit, price: String(l.rate) }));
/** Seed documents carry no lines; the design shows one "Items on …" line for the listed amount. */
const seedLines = (doc: Quotation): QLine[] =>
  doc.lines.length ? toLines(doc.lines) : [{ id: ++qId, key: `Items on ${doc.number}`, taxable: false, qty: "1", unit: "Piece", price: String(doc.amount) }];

export function DocumentForm({
  kind,
  edit,
  from,
  convertFrom,
  onClose,
}: {
  kind: DocKind;
  /** The quotation or invoice being edited. */
  edit?: Quotation;
  /** Prefill (Convert to invoice). */
  from?: Quotation;
  convertFrom?: string;
  onClose: () => void;
}) {
  const role = useRole();
  const customers = useCustomers();
  const products = useProducts();
  const stores = useStores();
  const units = unitList(useUnits());
  const levels = useStockLevels();
  const quotations = useQuotations();
  const invoices = useInvoices();
  const creditNotes = useCreditNotes();
  const src = edit ?? from;
  const [biz, setBiz] = useState(bizName);
  const [logo, setLogo] = useState(bizLogo);
  const [cust, setCust] = useState(src?.customer ?? "");
  const [date, setDate] = useState(src?.date || "2026-11-01");
  const [due, setDue] = useState(from ? addDays(from.date || "2026-11-10", 30) : edit?.due || "2026-12-01");
  const [store, setStore] = useState(src?.store ?? "Main Store");
  const [lines, setLines] = useState<QLine[]>(() => (src ? seedLines(src) : []));
  const [disc, setDisc] = useState(src ? String(src.discount.value) : "0");
  const [discType, setDiscType] = useState<"KES" | "%">(src?.discount.type ?? "KES");
  const [pay, setPay] = useState(src?.pay ?? "");
  const [note, setNote] = useState(src?.notes ?? "");
  const [terms, setTerms] = useState(src?.terms ?? "");
  const [refInv, setRefInv] = useState("");
  const [reason, setReason] = useState("");
  const [reasons, setReasons] = useState(() => [...UZ_REFUND.reasons, ...extraReasons]);
  const [refund, setRefund] = useState("Cash");
  const [back, setBack] = useState(true);
  const [newCust, setNewCust] = useState<string | null>(null);

  const credit = kind === "credit";
  const customerOptions = useMemo(
    () => customers.map((c) => c.name).sort((a, b) => (a === WALK_IN ? -1 : b === WALK_IN ? 1 : a.localeCompare(b))),
    [customers],
  );
  const custInfo = (() => {
    const c = customers.find((x) => x.name === cust);
    return c ? [c.phone, c.email, c.address].filter((x) => x && x !== "—") : [];
  })();
  const items = products.flatMap((p) => p.variants.map((v) => ({ key: `${p.name} · ${v.name}`, product: p.name, price: v.price, taxable: p.taxable })));
  const itemKeys = !credit
    ? items.map((i) => i.key)
    : (() => {
        const onHand = (prod: string) => levels.filter((l) => l.product === prod).reduce((a, l) => a + l.quantity, 0);
        const inv = refInv ? invoices.find((i) => i.number === refInv) : undefined;
        const sold = inv && inv.lines.length ? inv.lines.map((l) => l.description) : null;
        return items.filter((i) => levels.some((l) => l.product === i.product) && (!sold || sold.includes(i.key))).map((i) => `${i.key} — ${onHand(i.product)} in stock`);
      })();

  const number = edit
    ? edit.number
    : kind === "credit"
      ? nextRef(creditNotes.map((c) => c.number), "CRN-", 4)
      : kind === "invoice"
        ? nextRef(invoices.map((c) => c.number), "INV-", 4)
        : nextRef(quotations.map((c) => c.number), "Q-", 6, 1000);

  // Totals, as the design's `qSub`/`qAfter`/`qLevel`/`qVat`.
  const net = (l: QLine) => Math.max(0, Number(l.qty) * Number(l.price) || 0);
  const after = lines.reduce((a, l) => a + net(l), 0);
  const level = discType === "%" ? (after * (Number(disc) || 0)) / 100 : Number(disc) || 0;
  const final = Math.max(0, after - level);
  const ratio = after ? final / after : 0;
  const taxable = lines.filter((l) => l.taxable).reduce((a, l) => a + net(l), 0) * ratio;
  const vat = Math.round(taxable * 16) / 100;
  const grand = final + vat;
  const blocked = (credit && !reason) || !cust || !date || !due || !lines.length || lines.some((l) => !(Number(l.qty) > 0));

  const setLine = (id: number, patch: Partial<QLine>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const addItem = (value: string) => {
    const k = value.split(" — ")[0];
    const i = items.find((x) => x.key === k);
    if (i) setLines((ls) => [...ls, { id: ++qId, key: i.key, taxable: i.taxable, qty: "1", unit: units[0] ?? "Piece", price: String(i.price) }]);
  };
  const pickInvoice = (ref: string) => {
    const inv = invoices.find((x) => x.number === ref);
    setRefInv(ref);
    if (inv) {
      setCust(inv.customer);
      setStore(inv.store);
      setLines(seedLines(inv));
    }
  };

  const finish = async (approve: boolean) => {
    bizName = biz;
    const docLines: DocLine[] = lines.map((l) => ({ description: l.key, qty: Number(l.qty), unit: l.unit, rate: Number(l.price) || 0, taxable: l.taxable }));
    const discount = { value: Number(disc) || 0, type: discType };
    let ok = false;
    if (credit) {
      ok = (await createCreditDocument({ customer: cust, date, store, lines: docLines, discount, notes: note, refInv, reason, refundMethod: refund, returnToStock: back, approve })).ok;
    } else {
      const input = { kind, customer: cust, date, due, store, lines: docLines, discount, notes: note, terms, pay, approve, convertedFrom: convertFrom };
      if (edit) ok = (await updateDocument(kind, edit.number, input)).ok;
      else ok = (await (kind === "invoice" ? createInvoice(input) : createQuotation(input))).ok;
    }
    if (ok) onClose();
  };

  const pickLogo = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) {
        bizLogo = URL.createObjectURL(f);
        setLogo(bizLogo);
      }
    };
    input.click();
  };

  const LGRID = { gridTemplateColumns: "minmax(0,1fr) 70px 130px 100px 56px 110px 34px" };

  return (
    <>
      <Drawer open={newCust === null} title={edit ? `Edit ${edit.number}` : WORD.title[kind]} subtitle="Sales" onClose={onClose} width={9999}>
        <div className="mx-auto flex max-w-[1040px] flex-col gap-6 rounded-lg border border-border p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <button
              type="button"
              onClick={pickLogo}
              aria-label="Upload logo"
              className="type-small flex h-[120px] w-[150px] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md border-2 border-dashed border-border-strong bg-surface p-0 text-text-muted"
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Business logo" className="size-full object-contain" />
              ) : (
                <>
                  <Icon name="upload" size={20} />
                  <span>Upload logo</span>
                </>
              )}
            </button>
            <div className="flex flex-col items-end gap-1 text-right">
              <input
                aria-label="Business name"
                value={biz}
                onChange={(e) => setBiz(e.target.value)}
                className="type-title w-[280px] max-w-full border-0 bg-transparent p-0 text-right text-text"
              />
              <div className="text-[44px] font-bold leading-[1.1] text-text">{WORD.big[kind]}</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-6">
            <div className="flex min-w-0 max-w-[420px] flex-[1_1_320px] flex-col gap-2">
              <SearchSelect label={WORD.to[kind]} noun="customer" options={customerOptions} value={cust} onChange={setCust} onNew={(t) => setNewCust(t)} />
              {custInfo.map((t) => (
                <div key={t} className="type-body text-text-secondary">
                  {t}
                </div>
              ))}
              {credit && (
                <>
                  <SearchSelect label="Original invoice (optional)" noun="invoice" options={invoices.map((i) => i.number)} value={refInv} onChange={pickInvoice} />
                  <SearchSelect
                    label="Reason"
                    noun="reason"
                    options={reasons}
                    value={reason}
                    onChange={setReason}
                    onCreate={(n) => {
                      extraReasons = [...extraReasons, n];
                      setReasons((r) => [...r, n]);
                      return n;
                    }}
                  />
                  <SearchSelect label="Refund method" options={UZ_REFUND.methods} value={refund} onChange={setRefund} />
                  <label className="type-body inline-flex cursor-pointer items-center gap-2 text-text">
                    <input type="checkbox" checked={back} onChange={(e) => setBack(e.target.checked)} className="accent-[var(--action)]" />
                    <span>Put returned items back in stock</span>
                  </label>
                </>
              )}
            </div>
            <div className="flex flex-[0_1_300px] flex-col gap-3">
              <div className="text-right">
                <div className="type-label text-text">{WORD.no[kind]}</div>
                <div className="type-body mt-0.5 text-text-secondary">{number}</div>
              </div>
              <Input label={WORD.date[kind]} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              {!credit && <Input label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} />}
              <SearchSelect label="Sales store" noun="store" options={stores.map((s) => s.name)} value={store} onChange={setStore} onCreate={(n) => addStoreQuick(n)} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto">
              <div className="min-w-[720px]" role="table" aria-label="Items">
                <div role="row" className="type-table-head grid items-center gap-2 rounded-sm bg-canvas p-3 text-text-muted" style={LGRID}>
                  <span role="columnheader">Item description</span>
                  <span role="columnheader" className="text-right">Qty</span>
                  <span role="columnheader">Unit</span>
                  <span role="columnheader" className="text-right">Rate</span>
                  <span role="columnheader" className="text-right">Tax</span>
                  <span role="columnheader" className="text-right">Amount</span>
                  <span role="columnheader" />
                </div>
                {lines.length === 0 && <div className="type-small p-5 text-center text-text-muted">No items added yet.</div>}
                {lines.map((l) => (
                  <div role="row" key={l.id} className="grid items-center gap-2 border-b border-border px-3 py-2" style={LGRID}>
                    <span role="cell" className="type-label min-w-0 break-words text-text">
                      {l.key}
                    </span>
                    <Input size="sm" type="number" min="1" aria-label="Quantity" value={l.qty} onChange={(e) => setLine(l.id, { qty: e.target.value })} />
                    <SearchSelect noun="unit" options={units} value={l.unit} onChange={(u) => setLine(l.id, { unit: u })} />
                    <Input size="sm" type="number" min="0" aria-label="Rate" value={l.price} onChange={(e) => setLine(l.id, { price: e.target.value })} />
                    <span role="cell" className="type-small text-right text-text-secondary">
                      {l.taxable ? "16%" : "0%"}
                    </span>
                    <span role="cell" className="type-label u-num text-right text-text">
                      {Math.round(net(l)).toLocaleString("en-US")}
                    </span>
                    <IconButton icon="trash-2" size="sm" label="Remove item" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="min-w-[240px] flex-[0_1_340px]">
                <SearchSelect label={credit ? "Add item from stock" : "Add item"} noun="product" options={itemKeys} value="" onChange={addItem} />
              </div>
              <div className="flex min-w-[260px] flex-[0_1_340px] flex-col">
                <div className="type-body flex justify-between border-b border-border py-2 text-text">
                  <span>Subtotal</span>
                  <span className="u-num">{money(after)}</span>
                </div>
                <div className="type-body flex items-center justify-between gap-2 border-b border-border py-2 text-text">
                  <span>Discount</span>
                  <span className="flex items-center gap-1">
                    <span className="w-[90px]">
                      <Input size="sm" type="number" min="0" aria-label="Discount" value={disc} onChange={(e) => setDisc(e.target.value)} />
                    </span>
                    <span className="w-[84px]">
                      <SearchSelect noun="discount type" options={["KES", "%"]} value={discType} onChange={(v) => setDiscType(v === "%" ? "%" : "KES")} />
                    </span>
                  </span>
                </div>
                <div className="type-body flex justify-between border-b border-border py-2 text-text">
                  <span>VAT 16%</span>
                  <span className="u-num">{money(vat)}</span>
                </div>
                <div className="type-title flex justify-between py-3 text-text">
                  <span>Total</span>
                  <span className="u-num">{money(grand)}</span>
                </div>
              </div>
            </div>
          </div>

          {!credit && (
            <Area title="Payment method" placeholder="Bank name and account number, or M-Pesa paybill" value={pay} onChange={setPay} />
          )}
          <Area title="Note" placeholder="Anything the customer should know" value={note} onChange={setNote} />
          {!credit && <Area title="Terms and conditions" placeholder="Payment terms, delivery and warranty" value={terms} onChange={setTerms} />}

          <div className="min-w-[260px] self-end text-center">
            <div className="type-title border-b border-border pb-2 text-text">{role.name}</div>
            <div className="type-body pt-2 text-text-secondary">{role.role}</div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="soft" disabled={blocked} onClick={() => finish(false)}>
              Save
            </Button>
            <Button disabled={blocked} onClick={() => finish(true)}>
              Save and approve
            </Button>
          </div>
        </div>
      </Drawer>
      <CustomerForm open={newCust !== null} initialName={newCust ?? ""} crumb="Sales" onClose={() => setNewCust(null)} onSaved={(n) => setCust(n)} />
    </>
  );
}

function Area({ title, placeholder, value, onChange }: { title: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="type-title text-text">{title}</div>
      <textarea
        rows={3}
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="type-body w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2 text-text"
      />
    </div>
  );
}
