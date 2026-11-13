"use client";
/**
 * The design's shared record view (`isCnView` with `cv`): quotation and invoice (`docView`),
 * credit note (`cnView`) and voided item (`voidView`). Opened by `?view=<ref>` on their tabs.
 */
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  approveCreditNote,
  approveDocument,
  downloadPdf,
  printDocument,
  toast,
  useCreditNotes,
  useInvoices,
  useProducts,
  useQuotations,
  useVoids,
  type DocLine,
  type Quotation,
  useAllowed,
} from "@/data";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Drawer } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { addDays } from "@/lib/demo-clock";
import { Chip, Eyebrow, Panel, Row, docDate, money, useSaleDoc } from "./shared";

export type RecordKind = "quote" | "invoice" | "credit" | "void";

interface Line {
  name: string;
  sub: string;
  back: string;
  qty: string;
  price: string;
  disc: string;
  tax: string;
  total: string;
}
interface Step {
  done: boolean;
  title: string;
  sub: string;
}
interface Action {
  label: string;
  icon: IconName;
  variant: ButtonVariant;
  run: () => void;
}
interface CV {
  kindLabel: string;
  itemsTitle: string;
  itemsSub: string;
  totalLabel: string;
  infoA: string;
  infoB: string;
  costLabel: string;
  effectsTitle: string;
  ref: string;
  cust: string;
  status: string;
  tone: string;
  scope: string;
  date: string;
  source?: { label: string; open: () => void };
  canApprove: boolean;
  approve: () => void;
  actions: Action[];
  steps: Step[];
  count: string;
  lines: Line[];
  total: string;
  subtotal: string;
  vat: string;
  cost: string;
  reason: string;
  notes: string;
  effects: { icon: IconName; title: string; text: string }[];
}

const TITLE: Record<RecordKind, string> = { quote: "Quotation ", invoice: "Invoice ", credit: "Credit note ", void: "Voided item " };
const GRID = { gridTemplateColumns: "minmax(0,2fr) 60px 120px 90px 90px 130px" };

const split = (key: string) => {
  const cut = key.indexOf(" · ");
  return cut < 0 ? { name: key, variant: "" } : { name: key.slice(0, cut), variant: key.slice(cut + 3) };
};
const count = (lines: number, units: number) => `${lines}${lines === 1 ? " line, " : " lines, "}${units}${units === 1 ? " unit" : " units"}`;

interface Calc {
  key: string;
  unit: string;
  q: number;
  pr: number;
  disc: number;
  net: number;
  tax: number;
}
function calc(lines: { key: string; unit: string; qty: number; price: number; taxable: boolean }[]): Calc[] {
  return lines.map((l) => {
    const net = Math.max(0, l.qty * l.price);
    return { key: l.key, unit: l.unit, q: l.qty, pr: l.price, disc: 0, net, tax: l.taxable ? Math.round(net * 16) / 100 : 0 };
  });
}
const fromDocLines = (lines: DocLine[]) => lines.map((l) => ({ key: l.description, unit: l.unit, qty: l.qty, price: l.rate, taxable: l.taxable }));

export function RecordView({
  kind,
  refId,
  onClose,
  onEdit,
  onConvert,
  onVoid,
  onPay,
}: {
  kind: RecordKind;
  refId: string;
  onClose: () => void;
  onEdit?: (doc: Quotation) => void;
  onConvert?: (doc: Quotation) => void;
  onVoid?: (doc: Quotation) => void;
  /** FR-016a: "Record payment" on an unpaid invoice that has an open receivable. */
  onPay?: (doc: Quotation) => void;
}) {
  const router = useRouter();
  const allowed = useAllowed();
  const quotations = useQuotations();
  const invoices = useInvoices();
  const notes = useCreditNotes();
  const voids = useVoids();
  const products = useProducts();
  const voidRow = kind === "void" ? voids.find((v) => v.ref === refId) : undefined;
  const voidSale = useSaleDoc(voidRow && /^SAL-/.test(voidRow.original) ? voidRow.original : null);

  const costOf = (key: string) => {
    const { name, variant } = split(key);
    const p = products.find((x) => x.name === name);
    const v = p?.variants.find((x) => x.name === variant) ?? (kind === "credit" ? p?.variants[0] : undefined);
    return v?.cost ?? 0;
  };
  const step = (done: boolean, title: string, sub: string): Step => ({ done, title, sub });
  const print = (ref: string) => () => printDocument(ref);
  const pdf = (ref: string) => () => downloadPdf(ref);

  let cv: CV | null = null;

  if (kind === "quote" || kind === "invoice") {
    const doc = (kind === "quote" ? quotations : invoices).find((d) => d.number === refId);
    if (doc) {
      const raw = doc.lines.length ? fromDocLines(doc.lines) : [{ key: `Items on ${doc.number}`, unit: "Piece", qty: 1, price: doc.amount, taxable: false }];
      const L = calc(raw);
      const sub = L.reduce((a, x) => a + x.net, 0);
      const vat = L.reduce((a, x) => a + x.tax, 0);
      const ddisc = doc.discount.type === "%" ? (sub * doc.discount.value) / 100 : doc.discount.value;
      const tot = L.length && sub + vat ? sub - ddisc + vat : doc.amount;
      const cost = L.reduce((a, x) => a + costOf(x.key) * x.q, 0);
      const units = L.reduce((a, x) => a + x.q, 0);
      const stat = doc.status;
      const paid = kind === "invoice" ? ("paid" in doc ? (doc.paid as number) : 0) || (stat.label === "Paid" ? tot : 0) : 0;
      const bal = Math.max(0, tot - paid);
      const approved = stat.label === "Approved" || stat.label === "Paid";
      const isPaid = stat.label === "Paid" || (kind === "invoice" && !bal && tot > 0);
      const converted = kind === "quote" ? doc.convertedTo || "" : "";
      const date = docDate(doc.date || "2026-11-01");
      const actions: Action[] = [];
      if (!(kind === "quote" && approved) && onEdit) actions.push({ label: "Edit", icon: "pencil", variant: "secondary", run: () => onEdit(doc) });
      if (kind === "quote" && !converted && onConvert) actions.push({ label: "Convert to invoice", icon: "file-text", variant: "soft", run: () => onConvert(doc) });
      if (kind === "invoice" && !isPaid && onPay) actions.push({ label: "Record payment", icon: "banknote", variant: "primary", run: () => onPay(doc) });
      if (kind === "invoice" && onVoid) actions.push({ label: "Void", icon: "x", variant: "danger", run: () => onVoid(doc) });
      cv = {
        kindLabel: kind === "quote" ? "Quotation" : "Invoice",
        itemsTitle: "Items",
        itemsSub: kind === "quote" ? "What is being quoted to the customer." : "What the customer is being billed for.",
        totalLabel: kind === "quote" ? "Quoted total" : "Invoice total",
        infoA: kind === "quote" ? "Valid until" : "Due date",
        infoB: "Notes",
        costLabel: "Cost of goods",
        effectsTitle: kind === "quote" ? "What happens next" : "Payment",
        ref: doc.number,
        cust: doc.customer,
        status: kind === "invoice" && isPaid ? "Paid" : stat.label,
        tone: kind === "invoice" && isPaid ? "success" : stat.tone,
        scope: "",
        date,
        canApprove: !approved,
        approve: () => approveDocument(kind, doc.number),
        actions,
        steps:
          kind === "quote"
            ? [step(true, "Created", date), step(approved, "Approved", approved ? doc.approvedAt || "Done" : "Waiting for approval"), step(!!converted, "Invoiced", converted || "Not invoiced yet")]
            : [
                step(true, "Issued", date),
                step(approved || isPaid, "Approved", approved || isPaid ? doc.approvedAt || "Done" : "Waiting for approval"),
                step(isPaid, "Paid", isPaid ? "Fully paid" : paid ? `${money(paid)} paid, ${money(bal)} left` : "Nothing paid yet"),
              ],
        count: count(L.length, units),
        lines: L.map((x) => {
          const s = split(x.key);
          return { name: s.name, sub: [s.variant, x.unit].filter(Boolean).join(" · "), back: "", qty: String(x.q), price: money(x.pr), disc: "—", tax: x.tax ? money(x.tax) : "—", total: money(x.net + x.tax) };
        }),
        total: money(tot),
        subtotal: money(sub || tot),
        vat: money(vat),
        cost: cost ? money(cost) : "—",
        reason: docDate(doc.due || addDays(doc.date || "2026-11-01", 30)),
        notes: doc.notes || doc.terms || "—",
        effects:
          kind === "quote"
            ? [
                {
                  icon: "file-text",
                  title: approved ? "Ready to invoice" : "Needs approval",
                  text: approved ? "Convert it to an invoice when the customer agrees." : `Approve it before sending to ${doc.customer}.`,
                },
                { icon: "banknote", title: "Estimated profit", text: cost ? `${money(sub - ddisc - cost)} before tax` : "Add costs to products to see profit." },
              ]
            : [
                { icon: "banknote", title: isPaid ? "Fully paid" : `Balance ${money(bal)}`, text: `${money(paid)} paid of ${money(tot)}.` },
                { icon: "boxes", title: "Stock", text: `${units} unit(s) taken from ${doc.store || "stock"}.` },
              ],
      };
    }
  }

  if (kind === "credit") {
    const cn = notes.find((c) => c.number === refId);
    if (cn) {
      const raw = cn.items.length
        ? cn.items.map((i) => ({ key: `${i.product} · ${i.variant || "Standard"}`, unit: i.unit || "Piece", qty: i.qty, price: i.price ?? i.unitPrice / 1.16, taxable: true }))
        : cn.lines?.length
          ? fromDocLines(cn.lines)
          : [{ key: `Items on ${cn.number}`, unit: "Piece", qty: 1, price: cn.amount, taxable: false }];
      const L = calc(raw);
      const sub = L.reduce((a, x) => a + x.net, 0);
      const vat = L.reduce((a, x) => a + x.tax, 0);
      const tot = L.length && sub + vat ? sub + vat : cn.amount;
      const cost = L.reduce((a, x) => a + costOf(x.key) * x.q, 0);
      const units = L.reduce((a, x) => a + x.q, 0);
      const approved = cn.status.label === "Approved";
      const back = cn.returnToStock && (cn.items.length > 0 || (cn.lines?.length ?? 0) > 0);
      const src = cn.source;
      const isSale = /^SAL-/.test(src);
      const mb = cn.moneyBack ?? (/credit/i.test(cn.refundMethod) ? "credit" : "cash");
      const moneyText: [string, string] =
        mb === "credit"
          ? ["Kept as customer credit", `${money(tot)} added to ${cn.customer}'s credit.`]
          : mb === "original"
            ? ["Refunded to the original method", `${money(tot)} paid back by ${cn.refundMethod || "the original method"}.`]
            : ["Refunded in cash", `${money(tot)} paid out from the cash drawer.`];
      const raised = cn.raisedAt || docDate(cn.date);
      cv = {
        kindLabel: "Credit note",
        itemsTitle: "Credited items",
        itemsSub: "Line values from the original sale, for the quantity credited.",
        totalLabel: "Total credited",
        infoA: "Reason",
        infoB: "Notes",
        costLabel: "Cost of goods",
        effectsTitle: "What it does",
        ref: cn.number,
        cust: cn.customer,
        status: cn.status.label,
        tone: cn.status.tone,
        scope: cn.scope || "",
        date: raised,
        source:
          src && src !== "—"
            ? {
                label: (isSale ? "Sale " : "Invoice ") + src,
                open: () =>
                  isSale
                    ? router.push(`/sales/all-sales?view=${src}`)
                    : invoices.some((i) => i.number === src)
                      ? router.push(`/sales/invoices?view=${src}`)
                      : toast(`${src} is not in the list any more.`),
              }
            : undefined,
        canApprove: !approved && cn.status.label !== "Not finished",
        approve: () => approveCreditNote(cn.number),
        actions: [],
        steps: [step(true, "Raised", raised), step(approved, "Approved", approved ? cn.approvedAt || raised : "Waiting for approval"), step(approved, "Stock and balance", approved ? "Updated" : "Moves once approved")],
        count: count(L.length, units),
        lines: L.map((x) => {
          const s = split(x.key);
          return {
            name: s.name,
            sub: [s.variant, x.unit].filter(Boolean).join(" · "),
            back: back && x.key.includes(" · ") ? "↺ Back to stock" : "",
            qty: String(x.q),
            price: money(x.pr),
            disc: "—",
            tax: x.tax ? money(x.tax) : "—",
            total: money(x.net + x.tax),
          };
        }),
        total: money(tot),
        subtotal: money(sub || tot),
        vat: money(vat),
        cost: cost ? money(cost) : "—",
        reason: cn.reason || "—",
        notes: cn.notes || "—",
        effects: [
          back
            ? { icon: "boxes", title: approved ? "Returned stock" : "Returns stock", text: `${units} unit(s) go back to ${cn.store || "stock"}.` }
            : { icon: "boxes", title: "Stock not returned", text: "The goods are not coming back." },
          { icon: "banknote", title: moneyText[0], text: moneyText[1] + (approved ? "" : " Happens on approval.") },
        ],
      };
    }
  }

  if (kind === "void" && voidRow) {
    const v = voidRow;
    const amt = v.amount;
    const src = v.original;
    const isSale = /^SAL-/.test(src);
    const isInv = /^INV-/.test(src);
    const sale = voidSale?.doc ?? (v.sale && v.sale.lines.length ? { date: v.sale.date, lines: v.sale.lines } : null);
    let L = (sale?.lines ?? []).map((l) => ({ name: l.product, sub: [l.variant, l.unit].filter(Boolean).join(" · "), q: l.qty, pr: l.price }));
    if (!L.length) L = [{ name: `Items on ${src === "Sale" ? "this sale" : src}`, sub: "", q: 1, pr: Math.round((amt / 1.16) * 100) / 100 }];
    const sub = L.reduce((a, x) => a + x.q * x.pr, 0);
    const units = L.reduce((a, x) => a + x.q, 0);
    const on = docDate(v.date);
    cv = {
      kindLabel: "Voided item",
      itemsTitle: "Voided items",
      itemsSub: `Everything on the original ${isInv ? "invoice" : "sale"} was cancelled.`,
      totalLabel: "Amount voided",
      infoA: "Reason",
      infoB: "Voided by",
      costLabel: `Original ${isInv ? "invoice" : "sale"}`,
      effectsTitle: "What it did",
      ref: v.ref,
      cust: v.customer,
      status: "Voided",
      tone: "danger",
      scope: "",
      date: on,
      source:
        isSale || isInv
          ? {
              label: (isSale ? "Sale " : "Invoice ") + src,
              open: () => (isSale ? router.push(`/sales/all-sales?view=${src}`) : toast(`${src} was voided, so it is no longer in the Invoices list.`)),
            }
          : undefined,
      canApprove: false,
      approve: () => {},
      actions: [],
      steps: [
        step(true, isInv ? "Invoiced" : "Sold", sale?.date ? docDate(sale.date) : `Before ${on}`),
        step(true, "Voided", `${on} by ${v.by}`),
        step(true, "Kept on record", "Cannot be undone"),
      ],
      count: count(L.length, units),
      lines: L.map((x) => ({ name: x.name, sub: x.sub, back: "", qty: String(x.q), price: money(x.pr), disc: "—", tax: money(x.q * x.pr * 0.16), total: money(x.q * x.pr * 1.16) })),
      total: money(amt),
      subtotal: money(sub),
      vat: money(amt - sub > 0 ? amt - sub : 0),
      cost: src === "Sale" ? "Point of sale" : src,
      reason: v.reason || "—",
      notes: v.by || "—",
      effects: [
        { icon: "x", title: "Removed from sales", text: "It no longer counts in sales totals or reports." },
        {
          icon: "banknote",
          title: `KES ${Math.round(amt).toLocaleString("en-US")} cancelled`,
          text: isInv ? "The customer no longer owes this amount." : `Any money taken should be refunded to ${v.customer}.`,
        },
      ],
    };
  }

  const title = TITLE[kind] + refId;
  if (!cv) {
    return (
      <Drawer open title={title} subtitle="Sales" onClose={onClose} width={9999}>
        <div className="type-body text-text-muted">{refId} is not in the list any more.</div>
      </Drawer>
    );
  }
  const c = cv;
  return (
    <Drawer open title={title} subtitle="Sales" onClose={onClose} width={9999}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <Panel flush>
          <div className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="grid size-12 flex-none place-items-center rounded-md bg-green-50 text-green-700">
              <Icon name="file-text" size={22} />
            </span>
            <div className="min-w-[240px] flex-1">
              <Eyebrow>{c.kindLabel}</Eyebrow>
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-card-title u-num text-text">{c.ref}</span>
                <StatusPill tone={c.tone}>{c.status}</StatusPill>
                {c.scope && <span className="type-caption rounded-sm bg-canvas px-2 py-0.5 font-bold uppercase text-text-secondary">{c.scope}</span>}
              </div>
              <div className="type-small mt-0.5 flex flex-wrap items-center gap-3 text-text-secondary">
                <span>{c.date}</span>
                {c.source && (
                  <button type="button" onClick={c.source.open} className="type-label cursor-pointer border-0 bg-transparent p-0 text-green-700">
                    {c.source.label}
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.actions.filter((a) => allowed(a.label)).map((a) => (
                <Button key={a.label} variant={a.variant} icon={a.icon} onClick={a.run}>
                  {a.label}
                </Button>
              ))}
              {c.canApprove && allowed("Approve") && (
                <Button icon="check" onClick={c.approve}>
                  Approve
                </Button>
              )}
              <Button variant="secondary" icon="file-text" onClick={print(c.ref)}>
                Print
              </Button>
              <Button variant="secondary" icon="download" onClick={pdf(c.ref)}>
                PDF
              </Button>
            </div>
          </div>
          <div className="grid border-t border-border bg-canvas" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {c.steps.map((s) => (
              <div key={s.title} className="flex items-center gap-3 border-r border-border px-5 py-3">
                <span className={`grid size-7 flex-none place-items-center rounded-full font-bold ${s.done ? "bg-green-100 text-green-700" : "bg-canvas text-text-muted"}`}>
                  {s.done ? "✓" : "…"}
                </span>
                <span>
                  <span className="type-label block text-text">{s.title}</span>
                  <span className="type-caption block text-text-muted">{s.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[2_1_600px] flex-col gap-4">
            <Panel flush>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="type-title m-0 text-text">{c.itemsTitle}</h3>
                  <div className="type-small text-text-secondary">{c.itemsSub}</div>
                </div>
                <Chip>{c.count}</Chip>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[720px]" role="table" aria-label={c.itemsTitle}>
                  <div role="row" className="type-eyebrow grid gap-3 bg-canvas px-5 py-2 text-text-muted" style={GRID}>
                    <span role="columnheader">Product</span>
                    <span role="columnheader" className="text-right">Qty</span>
                    <span role="columnheader" className="text-right">Unit price</span>
                    <span role="columnheader" className="text-right">Discount</span>
                    <span role="columnheader" className="text-right">Tax</span>
                    <span role="columnheader" className="text-right">Line total</span>
                  </div>
                  {c.lines.map((l, i) => (
                    <div role="row" key={i} className="type-body grid items-center gap-3 border-t border-border px-5 py-3 text-text" style={GRID}>
                      <span role="cell" className="min-w-0">
                        <span className="block font-semibold">{l.name}</span>
                        <span className="type-caption flex gap-2 text-text-muted">
                          {l.sub}
                          <span className="text-green-700">{l.back}</span>
                        </span>
                      </span>
                      <Cell>{l.qty}</Cell>
                      <Cell muted>{l.price}</Cell>
                      <Cell muted>{l.disc}</Cell>
                      <Cell muted>{l.tax}</Cell>
                      <span role="cell" className="u-num text-right font-semibold">
                        {l.total}
                      </span>
                    </div>
                  ))}
                  <div className="type-label flex justify-between border-t border-border bg-canvas px-5 py-3 text-text">
                    <span>{c.totalLabel}</span>
                    <span className="u-num text-green-700">{c.total}</span>
                  </div>
                </div>
              </div>
            </Panel>
            <Panel className="grid gap-4" flush={false}>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <div>
                  <Eyebrow>{c.infoA}</Eyebrow>
                  <div className="type-title mt-1 text-text">{c.reason}</div>
                </div>
                <div>
                  <Eyebrow>{c.infoB}</Eyebrow>
                  <div className="type-body mt-1 text-text">{c.notes}</div>
                </div>
              </div>
            </Panel>
          </div>
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            <Panel className="flex flex-col gap-3">
              <div>
                <Eyebrow>{c.totalLabel}</Eyebrow>
                <div className="u-num mt-1 text-[32px] font-bold leading-[1.25] text-green-700">{c.total}</div>
                <div className="type-small text-text-secondary">to {c.cust}</div>
              </div>
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <Row label="Subtotal" value={c.subtotal} />
                <Row label="VAT" value={c.vat} />
                <Row label={c.costLabel} value={c.cost} />
              </div>
            </Panel>
            <Panel className="flex flex-col gap-3">
              <h3 className="type-title m-0 text-text">{c.effectsTitle}</h3>
              {c.effects.map((e) => (
                <div key={e.title} className="flex gap-3">
                  <span className="mt-0.5 flex-none text-green-700">
                    <Icon name={e.icon} size={16} />
                  </span>
                  <span>
                    <span className="type-label block text-text">{e.title}</span>
                    <span className="type-small block text-text-secondary">{e.text}</span>
                  </span>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function Cell({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <span role="cell" className={`u-num text-right ${muted ? "text-text-secondary" : ""}`}>
      {children}
    </span>
  );
}
