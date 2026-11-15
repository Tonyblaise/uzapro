/**
 * Credit from suppliers (Suppliers › Supplier credits): the limit and terms a supplier gives the
 * business, and how much of it is used by open bills and unpaid purchase orders.
 */
import { balance } from "./money";
import type { Payable, Pill, PurchaseOrder, Supplier, SupplierCreditRow, SupplierTerms } from "./types";

export const SUPPLIER_TERMS: readonly SupplierTerms[] = ["7 days", "14 days", "30 days", "60 days", "90 days"];

/** Share of the limit used at which the line reads "Near limit". */
export const NEAR_LIMIT = 0.8;

const SENT = new Set(["Approved", "To receive", "Accepted"]);

/** What the business still owes the supplier on bills (approved or waiting approval). */
export function supplierOwing(payables: readonly Payable[], supplier: string): number {
  return payables.filter((p) => p.party === supplier && p.approval !== "Rejected").reduce((a, p) => a + balance(p), 0);
}

/** Unpaid purchase orders already sent, for the part not yet received (received goods become bills). */
export function supplierOnOrder(orders: readonly PurchaseOrder[], supplier: string, except?: string): number {
  return Math.round(
    orders
      .filter((o) => o.supplier === supplier && o.ref !== except && !o.paid && SENT.has(o.status.label))
      .reduce((a, o) => a + o.lines.reduce((b, l) => b + Math.max(0, l.qty - l.recv) * l.cost, 0), 0),
  );
}

export function supplierCreditStatus(limit: number, used: number): Pill {
  if (used > limit) return { label: "Over limit", tone: "danger" };
  if (used >= limit * NEAR_LIMIT) return { label: "Near limit", tone: "warning" };
  return { label: "Within limit", tone: "success" };
}

export function supplierCreditRows(suppliers: readonly Supplier[], payables: readonly Payable[], orders: readonly PurchaseOrder[]): SupplierCreditRow[] {
  return suppliers.flatMap((s) => {
    if (!s.credit) return [];
    const owing = supplierOwing(payables, s.name);
    const onOrder = supplierOnOrder(orders, s.name);
    const used = owing + onOrder;
    return [{ supplier: s.name, limit: s.credit.limit, terms: s.credit.terms, owing, onOrder, left: s.credit.limit - used, status: supplierCreditStatus(s.credit.limit, used) }];
  });
}

/**
 * How far an unpaid purchase order of `total` takes the business over this supplier's credit,
 * or 0. Suppliers without credit have no limit to warn about.
 */
export function overSupplierCredit(s: { suppliers: readonly Supplier[]; payables: readonly Payable[]; orders: readonly PurchaseOrder[] }, supplier: string, total: number, except?: string): number {
  const credit = s.suppliers.find((x) => x.name === supplier)?.credit;
  if (!credit) return 0;
  const used = supplierOwing(s.payables, supplier) + supplierOnOrder(s.orders, supplier, except) + total;
  return Math.max(0, Math.round(used - credit.limit));
}

/** Form check, in the order the fields appear. */
export function supplierCreditError(input: { supplier: string; limit: number; terms: string }): string {
  if (!input.supplier) return "Pick the supplier.";
  if (!(input.limit > 0)) return "Enter a credit limit above 0.";
  if (!SUPPLIER_TERMS.includes(input.terms as SupplierTerms)) return "Pick the payment terms.";
  return "";
}
