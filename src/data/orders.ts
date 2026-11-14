/**
 * Pure sales-order rules (feature 013, contracts/data-access.md): what is left to dispatch and to
 * invoice, the order and delivery status, and dispatch validation.
 */
import { docTotals } from "@/lib/totals";
import type { DeliveryLine, DeliveryNote, NewOrderLine, OrderLine, Pill, Product, Quotation, SalesOrder } from "./types";

export const leftToDispatch = (l: Pick<OrderLine, "qty" | "dispatched">) => Math.max(0, l.qty - l.dispatched);
export const toInvoice = (l: Pick<OrderLine, "dispatched" | "invoiced">) => Math.max(0, l.dispatched - l.invoiced);

export const itemName = (l: { product: string; variant: string }) => `${l.product} · ${l.variant}`;

/** Order total with VAT, rounded like an invoice amount. */
export function orderTotals(lines: readonly Pick<OrderLine, "qty" | "rate" | "taxable">[]) {
  const t = docTotals(lines.map((l) => ({ qty: l.qty, price: l.rate, taxable: l.taxable })));
  return { subtotal: t.subtotal, vat: t.vat, total: Math.round(t.total) };
}

/**
 * What an order still commits the customer to: everything not yet invoiced, with VAT. It counts
 * against their credit limit until it is invoiced (then it is a receivable) or the order is cancelled.
 */
export function uninvoicedValue(o: Pick<SalesOrder, "lines" | "cancelled">): number {
  if (o.cancelled) return 0;
  return orderTotals(o.lines.map((l) => ({ qty: Math.max(0, l.qty - l.invoiced), rate: l.rate, taxable: l.taxable }))).total;
}

export function orderStatus(o: Pick<SalesOrder, "lines" | "cancelled">): Pill {
  if (o.cancelled) return { label: "Cancelled", tone: "neutral" };
  const sent = o.lines.reduce((a, l) => a + l.dispatched, 0);
  if (sent === 0) return { label: "Open", tone: "info" };
  if (o.lines.some((l) => leftToDispatch(l) > 0)) return { label: "Part dispatched", tone: "warning" };
  if (o.lines.every((l) => toInvoice(l) === 0)) return { label: "Invoiced", tone: "success" };
  return { label: "Dispatched", tone: "success" };
}

export function deliveryStatus(d: Pick<DeliveryNote, "delivered">): Pill {
  return d.delivered ? { label: "Delivered", tone: "success" } : { label: "Out for delivery", tone: "warning" };
}

/** Editable and cancellable only while nothing has been dispatched. */
export const canEditOrder = (o: Pick<SalesOrder, "lines" | "cancelled">) => !o.cancelled && o.lines.every((l) => l.dispatched === 0);
export const canDispatch = (o: Pick<SalesOrder, "lines" | "cancelled">) => !o.cancelled && o.lines.some((l) => leftToDispatch(l) > 0);
export const canInvoice = (o: Pick<SalesOrder, "lines" | "cancelled">) => !o.cancelled && o.lines.some((l) => toInvoice(l) > 0);

/** The first problem with a dispatch, or null (contracts/ui.md › Dispatch form). */
export function checkDispatch(o: Pick<SalesOrder, "lines" | "cancelled">, qty: readonly number[], driver: string, vehicle: string): string | null {
  if (!canDispatch(o)) return "There is nothing left to dispatch on this order.";
  for (let i = 0; i < o.lines.length; i++) {
    const l = o.lines[i]!;
    const q = qty[i] ?? 0;
    if (!Number.isFinite(q) || q < 0) return "Send at least one item";
    if (q > leftToDispatch(l)) return `You can send at most ${leftToDispatch(l)} ${l.unit} of ${itemName(l)}`;
  }
  if (!o.lines.some((_, i) => (qty[i] ?? 0) > 0)) return "Send at least one item";
  if (!driver.trim()) return "Enter the driver's name";
  if (!vehicle.trim()) return "Enter the vehicle registration";
  return null;
}

// ── Feature 019: quotation to order, and returns against a delivery ─────────────────────────────

export const DELIVERY_RETURN_REASONS: readonly string[] = ["Damaged in transit", "Wrong item", "Customer refused", "Not ordered", "Short dated"];

/**
 * A quotation's product lines as order lines at the quoted rates, with the quotation's discount
 * spread pro rata (orders have no discount field). Lines that are not a product are skipped.
 */
export function orderLinesFromQuote(q: Pick<Quotation, "lines" | "discount">, products: readonly Product[]): { lines: NewOrderLine[]; skipped: number } {
  const subtotal = q.lines.reduce((a, l) => a + l.qty * l.rate, 0);
  const off = q.discount.type === "%" ? (subtotal * q.discount.value) / 100 : q.discount.value;
  const factor = subtotal > 0 ? Math.max(0, 1 - Math.min(off, subtotal) / subtotal) : 1;
  const lines: NewOrderLine[] = [];
  let skipped = 0;
  for (const l of q.lines) {
    const cut = l.description.indexOf(" · ");
    const product = cut < 0 ? undefined : products.find((p) => p.name === l.description.slice(0, cut));
    const variant = product?.variants.find((v) => v.name === l.description.slice(cut + 3));
    if (!product || !variant || !(l.qty > 0)) {
      skipped += 1;
      continue;
    }
    lines.push({ product: product.name, variant: variant.name, unit: l.unit, qty: l.qty, rate: Math.round(l.rate * factor * 100) / 100, taxable: l.taxable });
  }
  return { lines, skipped };
}

const sameItem = (a: { product: string; variant: string; unit: string }, b: { product: string; variant: string; unit: string }) => a.product === b.product && a.variant === b.variant && a.unit === b.unit;

/** How much of a delivery line has already come back. */
export function returnedQty(note: Pick<DeliveryNote, "returns">, line: DeliveryLine): number {
  return note.returns.reduce((a, r) => a + r.lines.reduce((b, l) => (sameItem(l, line) ? b + l.qty : b), 0), 0);
}

/**
 * How much of a delivery line can still be returned here: what was delivered and not yet
 * returned, and never more than the order line has dispatched but not invoiced (invoiced goods
 * go back through a credit note).
 */
export function returnable(note: Pick<DeliveryNote, "returns">, order: Pick<SalesOrder, "lines"> | undefined, line: DeliveryLine): number {
  const left = Math.max(0, line.qty - returnedQty(note, line));
  const ol = order?.lines.find((l) => sameItem(l, line));
  return ol ? Math.min(left, toInvoice(ol)) : 0;
}

/** The first problem with a return, or null (contracts/ui.md). */
export function checkReturn(note: Pick<DeliveryNote, "lines" | "returns">, order: Pick<SalesOrder, "lines"> | undefined, qty: readonly number[], reason: string): string | null {
  for (let i = 0; i < note.lines.length; i++) {
    const l = note.lines[i]!;
    const q = qty[i] ?? 0;
    if (!Number.isFinite(q) || q < 0) return "Return at least one item";
    const left = Math.max(0, l.qty - returnedQty(note, l));
    if (q > left) return `You can return at most ${left} ${l.unit} of ${itemName(l)}`;
    const can = returnable(note, order, l);
    if (q > can) return `${can} ${itemName(l)} can be returned here. The rest is invoiced: raise a credit note from the invoice.`;
  }
  if (!note.lines.some((_, i) => (qty[i] ?? 0) > 0)) return "Return at least one item";
  if (!reason) return "Pick a reason";
  return null;
}
