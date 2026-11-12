/** Sales commands (FR-017–FR-023). Messages copied from the design's script (`showToast` calls). */
import { currentUserName } from "../profile";
import { DEMO_TODAY, addDays, demoTime } from "@/lib/demo-clock";
import { date as fmtDate, kes } from "@/lib/format";
import { nextRef } from "@/lib/refs";
import { docTotals } from "@/lib/totals";
import { WALK_IN } from "../fixtures/customers";
import { PAY_LATER } from "../fixtures/reference";
import {
  fail,
  ok,
  type CreditNote,
  type DocLine,
  type Invoice,
  type NewCreditDocument,
  type NewCreditNote,
  type NewDocument,
  type NewSale,
  type NewTarget,
  type Pill,
  type Quotation,
  type Result,
  type Sale,
  type SalesTarget,
  type VoidRecord,
} from "../types";
import { getStore, showToast } from "../store";
import { post } from "../ledger";
import { addCustomerCredit, addReceivable, closeReceivableFor } from "./money";
import { KIND, applyStockChanges, findShortfall, type StockChange } from "../store/stockOps";

const who = () => currentUserName(getStore().getState());

/** "10 Nov 2026, 14:05" — the design's stamp for approvals and raised credit notes. */
const stamp = () => `${fmtDate(DEMO_TODAY)}, ${demoTime()}`;

/** The design's credit-note restock movement (`creditRestock`): pill "Returned", info tone. */
const RETURNED: Pill = { label: "Returned", tone: "info" };
const APPROVED: Pill = { label: "Approved", tone: "success" };


/** Split a document line key "Product · Variant" (the design's `l.key`). */
export function splitKey(key: string): { product: string; variant: string } | null {
  const cut = key.indexOf(" · ");
  if (cut < 0) return null;
  return { product: key.slice(0, cut), variant: key.slice(cut + 3) };
}

function docLineTotals(lines: readonly DocLine[], discount: NewDocument["discount"]) {
  return docTotals(
    lines.map((l) => ({ qty: l.qty, price: l.rate, taxable: l.taxable })),
    discount,
  );
}

export async function recordSale(input: NewSale): Promise<Result<Sale>> {
  const store = getStore();
  const state = store.getState();
  const credit = input.payMethod === PAY_LATER;
  if (credit && (!input.customer || input.customer === WALK_IN)) {
    const m = "Pick the customer first. Walk-in customers can't buy on credit.";
    showToast(m);
    return fail(m);
  }
  if (!input.customer) return fail("Pick the customer first.");
  if (input.lines.length === 0) return fail("No items in this sale.");
  const saleStore = "Point of Sale";
  const by = who();
  const saleNo = state.sales.saleNo + 1;
  const ref = `SAL-${String(saleNo).padStart(6, "0")}`;
  const changes: StockChange[] = input.lines.map((l) => ({ product: l.product, variant: l.variant, store: saleStore, change: -l.qty, kind: KIND.sold, ref, by }));
  const short = findShortfall(state, changes);
  if (short) {
    const m = `Only ${short.available} ${short.product} left at ${short.store}.`;
    showToast(m);
    return fail(m);
  }
  const t = docTotals(input.lines.map((l) => ({ qty: l.qty, price: l.price, taxable: l.taxable })));
  const hm = demoTime();
  const sale: Sale = {
    ref,
    customer: input.customer,
    type: "Sale",
    channel: "In-store",
    store: saleStore,
    date: DEMO_TODAY,
    time: hm,
    lines: input.lines,
    payments: credit ? [] : [{ method: input.payMethod, ref: input.payRef?.trim() || "—", date: `${fmtDate(DEMO_TODAY)}, ${hm}`, amount: t.total }],
    subtotal: t.subtotal,
    vat: t.vat,
    total: t.total,
    status: credit ? { label: "Unpaid", tone: "warning" } : { label: "Paid", tone: "success" },
    by,
    session: true,
  };
  store.setState((s) => ({ ...applyStockChanges(s, changes), sales: { ...s.sales, sales: [sale, ...s.sales.sales], saleNo } }));
  let rcvRef = "";
  if (credit) {
    // FR-013: a credit sale creates a real "Sale on credit" receivable, due in 30 days.
    const r = addReceivable(store.getState(), { party: input.customer, type: "Sale on credit", doc: ref, due: addDays(DEMO_TODAY, 30), total: t.total });
    rcvRef = r.ref;
    store.setState({ money: r.money });
  }
  const message = credit ? `Credit sale recorded. ${kes(t.total)} added to Receivables as ${rcvRef}, due in 30 days.` : `Sale recorded. ${kes(t.total)} paid by ${input.payMethod}.`;
  showToast(message);
  return ok(sale, message);
}

/**
 * Void a sale (`SAL-…`) or an invoice (`INV-…`). The design removes the row from All sales (and
 * Invoices) and adds a VOID record. Sales recorded in this session give their stock back (FR-022).
 */
export async function voidSale(ref: string, reason: string): Promise<Result<VoidRecord>> {
  const store = getStore();
  const state = store.getState();
  const sale = state.sales.sales.find((s) => s.ref === ref);
  const invoice = state.sales.invoices.find((i) => i.number === ref);
  if (!sale && !invoice) return fail("That sale is not in the list.");
  if (!reason) return fail("Pick a reason.");
  const by = who();
  const voidRef = nextRef(state.sales.voids.map((v) => v.ref), "VOID-", 4);
  const record: VoidRecord = {
    ref: voidRef,
    original: ref,
    customer: sale?.customer ?? invoice!.customer,
    date: DEMO_TODAY,
    reason,
    by,
    amount: invoice ? invoice.amount : sale!.total,
    sale,
  };
  const back: StockChange[] =
    sale && sale.session ? sale.lines.map((l) => ({ product: l.product, variant: l.variant, store: sale.store, change: l.qty, kind: RETURNED, ref: voidRef, by })) : [];
  store.setState((s) => ({
    ...(back.length ? applyStockChanges(s, back) : {}),
    sales: {
      ...s.sales,
      sales: s.sales.sales.filter((x) => x.ref !== ref),
      invoices: s.sales.invoices.filter((x) => x.number !== ref),
      voids: [record, ...s.sales.voids],
    },
    // FR-016b: the receivable raised from this sale/invoice stays listed but is closed.
    money: closeReceivableFor(s, ref),
  }));
  showToast("Sale voided.");
  return ok(record, "Sale voided.");
}

function checkDocument(input: Pick<NewDocument, "customer" | "date" | "lines">): string | null {
  if (!input.customer) return "Pick the customer first.";
  if (input.lines.length === 0) return "No items added yet.";
  if (input.lines.some((l) => !(l.qty > 0))) return "No items added yet.";
  return null;
}

function quotationOf(number: string, input: NewDocument, status: Pill): Quotation {
  return {
    number,
    customer: input.customer,
    date: input.date,
    due: input.due,
    store: input.store,
    lines: input.lines,
    discount: input.discount,
    notes: input.notes,
    terms: input.terms,
    pay: input.pay,
    status,
    amount: Math.round(docLineTotals(input.lines, input.discount).total),
    ...(input.approve ? { approvedAt: stamp() } : {}),
  };
}

export async function createQuotation(input: NewDocument): Promise<Result<Quotation>> {
  const err = checkDocument(input);
  if (err) return fail(err);
  const store = getStore();
  const number = nextRef(store.getState().sales.quotations.map((q) => q.number), "Q-", 6, 1000);
  const q = quotationOf(number, input, input.approve ? APPROVED : { label: "Not finished", tone: "neutral" });
  store.setState((s) => ({ sales: { ...s.sales, quotations: [q, ...s.sales.quotations] } }));
  const message = `${number} saved.`;
  showToast(message);
  return ok(q, message);
}

export async function createInvoice(input: NewDocument): Promise<Result<Invoice>> {
  const err = checkDocument(input);
  if (err) return fail(err);
  const store = getStore();
  const state = store.getState();
  const number = nextRef(state.sales.invoices.map((q) => q.number), "INV-", 4);
  const status: Pill = input.approve ? APPROVED : { label: "Pending", tone: "warning" };
  const t = docLineTotals(input.lines, input.discount);
  const inv: Invoice = { ...quotationOf(number, input, status), paid: 0 };
  const by = who();
  // Invoices take their items out of the chosen sales store (design `qFinish`).
  const changes: StockChange[] = input.lines.flatMap((l) => {
    const k = splitKey(l.description);
    return k && l.qty > 0 ? [{ product: k.product, variant: k.variant, store: input.store, change: -l.qty, kind: KIND.sold, ref: number, by }] : [];
  });
  const sale: Sale = {
    ref: number,
    customer: input.customer,
    type: "Invoice",
    channel: "In-store",
    store: input.store,
    date: input.date,
    time: demoTime(),
    lines: input.lines.flatMap((l) => {
      const k = splitKey(l.description);
      return k ? [{ product: k.product, variant: k.variant, unit: l.unit, qty: l.qty, price: l.rate, taxable: l.taxable }] : [];
    }),
    payments: [],
    subtotal: t.subtotal - t.discount,
    vat: t.vat,
    total: inv.amount,
    status,
    by,
    session: true,
  };
  store.setState((s) => ({
    ...(changes.length ? applyStockChanges(s, changes) : {}),
    sales: {
      ...s.sales,
      invoices: [inv, ...s.sales.invoices],
      sales: [sale, ...s.sales.sales],
      quotations: input.convertedFrom ? s.sales.quotations.map((q) => (q.number === input.convertedFrom ? { ...q, convertedTo: number } : q)) : s.sales.quotations,
    },
  }));
  // FR-014: the invoice creates a real "Invoice" receivable.
  const r = addReceivable(store.getState(), { party: input.customer, type: "Invoice", doc: number, due: input.due || input.date, total: inv.amount, raised: input.date });
  store.setState({ money: r.money });
  const message = `${number} saved. ${r.ref} added to Receivables.`;
  showToast(message);
  return ok(inv, message);
}

/** Save an edited quotation or invoice (design `saleEdit` → `qFinish` with `edit`). */
export async function updateDocument(kind: "quote" | "invoice", number: string, input: NewDocument): Promise<Result<void>> {
  const err = checkDocument(input);
  if (err) return fail(err);
  const store = getStore();
  const amount = Math.round(docLineTotals(input.lines, input.discount).total);
  const patch = (d: Quotation): Quotation => ({
    ...d,
    customer: input.customer,
    date: input.date,
    due: input.due,
    store: input.store,
    lines: input.lines,
    discount: input.discount,
    notes: input.notes,
    terms: input.terms,
    pay: input.pay,
    amount,
    status: input.approve ? APPROVED : d.status,
    ...(input.approve ? { approvedAt: stamp() } : {}),
  });
  store.setState((s) => ({
    sales: {
      ...s.sales,
      quotations: kind === "quote" ? s.sales.quotations.map((q) => (q.number === number ? patch(q) : q)) : s.sales.quotations,
      invoices: kind === "invoice" ? s.sales.invoices.map((q) => (q.number === number ? { ...(patch(q) as Invoice), paid: q.paid } : q)) : s.sales.invoices,
    },
  }));
  const message = `${number} saved.`;
  showToast(message);
  return ok(undefined, message);
}

/** Row action / view "Approve" for quotations and invoices. */
export async function approveDocument(kind: "quote" | "invoice", number: string): Promise<Result<void>> {
  const at = stamp();
  getStore().setState((s) => ({
    sales: {
      ...s.sales,
      quotations: kind === "quote" ? s.sales.quotations.map((q) => (q.number === number ? { ...q, status: APPROVED, approvedAt: at } : q)) : s.sales.quotations,
      invoices: kind === "invoice" ? s.sales.invoices.map((q) => (q.number === number ? { ...q, status: APPROVED, approvedAt: at } : q)) : s.sales.invoices,
    },
  }));
  const message = `${number} approved.`;
  showToast(message);
  return ok(undefined, message);
}

/** Owner-only row "Delete" on Quotations, Invoices and Refunds (design `removeRow`). */
export async function deleteDocument(kind: "quote" | "invoice" | "credit", number: string): Promise<Result<void>> {
  getStore().setState((s) => ({
    sales: {
      ...s.sales,
      quotations: kind === "quote" ? s.sales.quotations.filter((q) => q.number !== number) : s.sales.quotations,
      invoices: kind === "invoice" ? s.sales.invoices.filter((q) => q.number !== number) : s.sales.invoices,
      creditNotes: kind === "credit" ? s.sales.creditNotes.filter((q) => q.number !== number) : s.sales.creditNotes,
    },
  }));
  const message = `${number} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

/** Raise a credit note against a sale (design `cnForm` → `cn.save`). */
export async function createCreditNote(input: NewCreditNote): Promise<Result<CreditNote>> {
  const items = input.items.filter((i) => i.qty > 0);
  if (items.length === 0) return fail("Nothing left to credit on this sale.");
  if (items.some((i) => i.qty > i.sold - i.credited)) return fail("A credit quantity is more than what is still open.");
  if (!input.reason) return fail("Pick a reason.");
  const store = getStore();
  const number = nextRef(store.getState().sales.creditNotes.map((c) => c.number), "CRN-", 4);
  const sub = items.reduce((s, i) => s + i.qty * (i.price ?? i.unitPrice / 1.16), 0);
  const total = sub + Math.round(sub * 0.16 * 100) / 100;
  const cn: CreditNote = {
    number,
    customer: input.customer,
    date: DEMO_TODAY,
    source: input.source,
    items,
    reason: input.reason,
    notes: input.notes.trim(),
    returnToStock: input.returnToStock,
    refundMethod: input.refundMethod,
    amount: Math.round(total),
    status: { label: "Waiting approval", tone: "warning" },
    scope: input.scope,
    raisedAt: stamp(),
    moneyBack: input.moneyBack ?? "cash",
    store: input.store,
  };
  store.setState((s) => ({ sales: { ...s.sales, creditNotes: [cn, ...s.sales.creditNotes] } }));
  const message = `${number} raised for ${kes(Math.round(total * 100) / 100)}. It is waiting for approval.`;
  showToast(message);
  return ok(cn, message);
}

function restock(cn: CreditNote, by: string): StockChange[] {
  if (!cn.returnToStock) return [];
  const store = cn.store ?? "Main Store";
  if (cn.items.length) return cn.items.filter((i) => i.qty > 0).map((i) => ({ product: i.product, variant: i.variant, store, change: i.qty, kind: RETURNED, ref: cn.number, by }));
  return (cn.lines ?? []).flatMap((l) => {
    const k = splitKey(l.description);
    return k && l.qty > 0 ? [{ product: k.product, variant: k.variant, store, change: l.qty, kind: RETURNED, ref: cn.number, by }] : [];
  });
}

/** "New credit note" from the document form (design `quoteOpen('credit')` → `qFinish`). */
export async function createCreditDocument(input: NewCreditDocument): Promise<Result<CreditNote>> {
  if (!input.reason) return fail("Pick a reason.");
  const err = checkDocument({ customer: input.customer, date: input.date, lines: input.lines });
  if (err) return fail(err);
  const store = getStore();
  const number = nextRef(store.getState().sales.creditNotes.map((c) => c.number), "CRN-", 4);
  const cn: CreditNote = {
    number,
    customer: input.customer,
    date: input.date,
    source: input.refInv || "—",
    items: [],
    lines: input.lines,
    discount: input.discount,
    reason: input.reason,
    notes: input.notes.trim(),
    returnToStock: input.returnToStock,
    refundMethod: input.refundMethod,
    amount: Math.round(docLineTotals(input.lines, input.discount).total),
    status: input.approve ? APPROVED : { label: "Not finished", tone: "neutral" },
    store: input.store,
    ...(input.approve ? { approvedAt: stamp() } : {}),
  };
  const back = input.approve ? restock(cn, who()) : [];
  store.setState((s) => ({ ...(back.length ? applyStockChanges(s, back) : {}), sales: { ...s.sales, creditNotes: [cn, ...s.sales.creditNotes] } }));
  const message = `${number} saved.`;
  showToast(message);
  return ok(cn, message);
}

export async function approveCreditNote(number: string): Promise<Result<CreditNote>> {
  const store = getStore();
  const state = store.getState();
  const cn = state.sales.creditNotes.find((c) => c.number === number);
  if (!cn) return fail("That credit note is not in the list.");
  const back = restock(cn, who());
  const updated: CreditNote = { ...cn, status: APPROVED, approvedAt: stamp() };
  store.setState((s) => ({
    ...(back.length ? applyStockChanges(s, back) : {}),
    sales: { ...s.sales, creditNotes: s.sales.creditNotes.map((c) => (c.number === number ? updated : c)) },
  }));
  // FR-016c: money back as store credit (credit notes raised from a sale) becomes a customer credit.
  if (cn.moneyBack === "credit" && cn.source.startsWith("SAL-") && cn.status.label !== "Approved") {
    store.setState((s) => ({ money: addCustomerCredit(s, cn.customer, number, cn.amount).money }));
  }
  // FR-013a (design `cnMoney`): a cash or original-method refund on a sale's credit note leaves the refund account.
  if (cn.moneyBack !== "credit" && cn.source.startsWith("SAL-") && cn.status.label !== "Approved") {
    const original = cn.moneyBack === "original";
    const account = original && /M-Pesa/i.test(cn.refundMethod) ? "M-Pesa Till" : original && /Card|Bank/i.test(cn.refundMethod) ? "Equity Bank — Main" : "Cash drawer";
    store.setState((s) => post(s, { date: DEMO_TODAY, account, ref: number, desc: `Refund to ${cn.customer}`, kind: "Refund", amt: -cn.amount }));
  }
  const message = `${number} approved.`;
  showToast(message);
  return ok(updated, message);
}

export async function deleteTarget(id: number): Promise<Result<void>> {
  getStore().setState((s) => ({ sales: { ...s.sales, targets: s.sales.targets.filter((t) => t.id !== id) } }));
  showToast("Target deleted.");
  return ok(undefined, "Target deleted.");
}

/** "New sales target" / "Edit sales target" (design `setOpen('target')` → `sm.save`). */
export async function saveTarget(input: NewTarget, editId?: number): Promise<Result<SalesTarget>> {
  const name = input.name.trim();
  if (!name || !(input.amount > 0) || !input.start || !input.end || input.end < input.start) return fail("Fill in the target.");
  if (input.scope !== "Whole business" && !input.who) return fail("Fill in the target.");
  const store = getStore();
  const list = store.getState().sales.targets;
  const item = { name, scope: input.scope, who: input.scope === "Whole business" ? "" : input.who, start: input.start, end: input.end, amount: input.amount };
  let saved: SalesTarget;
  if (editId !== undefined) {
    const cur = list.find((t) => t.id === editId);
    if (!cur) return fail("That target is not in the list.");
    saved = { ...cur, ...item };
    store.setState((s) => ({ sales: { ...s.sales, targets: s.sales.targets.map((t) => (t.id === editId ? saved : t)) } }));
  } else {
    saved = { ...item, id: Math.max(0, ...list.map((t) => t.id)) + 1, base: 0 };
    store.setState((s) => ({ sales: { ...s.sales, targets: [saved, ...s.sales.targets] } }));
  }
  const message = name + (editId !== undefined ? " saved." : " created.");
  showToast(message);
  return ok(saved, message);
}

/** Print (simulated): sales say "Receipt for … sent to the printer.", documents "… sent to the printer." */
export async function printDocument(ref: string, receipt = false): Promise<Result<void>> {
  const message = receipt ? `Receipt for ${ref} sent to the printer.` : `${ref} sent to the printer.`;
  showToast(message);
  return ok(undefined, message);
}

export async function downloadPdf(ref: string): Promise<Result<void>> {
  const message = `Downloading ${ref}.pdf.`;
  showToast(message);
  return ok(undefined, message);
}
