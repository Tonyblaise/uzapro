/**
 * Pure sales-order rules (feature 013, contracts/data-access.md): what is left to dispatch and to
 * invoice, the order and delivery status, and dispatch validation.
 */
import { docTotals } from "@/lib/totals";
import type { DeliveryNote, OrderLine, Pill, SalesOrder } from "./types";

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
