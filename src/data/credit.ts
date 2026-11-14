/**
 * Pure credit rules (feature 012, contracts/data-access.md): a customer's credit position from
 * their receivables, and whether a credit amount must be stopped (research R7, R8).
 */
import { DEMO_TODAY } from "@/lib/demo-clock";
import { balance, daysLate } from "./money";
import { uninvoicedValue } from "./orders";
import type { CreditPosition, CreditStop, Customer, PayTerms, Receivable, SalesOrder } from "./types";

export const PAY_TERMS: readonly PayTerms[] = ["Cash", "7 days", "14 days", "30 days"];

export function termDays(t: PayTerms): number {
  return t === "Cash" ? 0 : Number.parseInt(t, 10);
}

/** `orders`: the sales orders; a customer's open orders count against their limit until they are invoiced. */
export function creditPosition(
  c: Pick<Customer, "name" | "creditLimit" | "terms">,
  receivables: readonly Receivable[],
  orders: readonly Pick<SalesOrder, "customer" | "lines" | "cancelled">[] = [],
  today = DEMO_TODAY,
): CreditPosition {
  let owed = 0;
  let overdue = 0;
  let oldest: CreditPosition["oldest"] = null;
  for (const r of receivables) {
    if (r.party !== c.name) continue;
    const b = balance(r);
    if (b <= 0) continue;
    owed += b;
    if (daysLate(r.due, today) > 0) {
      overdue += b;
      if (!oldest || r.due < oldest.due) oldest = { ref: r.ref, doc: r.doc, due: r.due };
    }
  }
  const onOrder = orders.reduce((a, o) => (o.customer === c.name ? a + uninvoicedValue(o) : a), 0);
  return { customer: c.name, limit: c.creditLimit, owed, onOrder, available: c.creditLimit === null ? null : Math.max(0, c.creditLimit - owed - onOrder), overdue, oldest, terms: c.terms };
}

/** Cash terms, then overdue, then over the limit. null = the credit can go ahead. */
export function creditStop(position: CreditPosition, creditAmount: number): CreditStop | null {
  if (!(creditAmount > 0)) return null;
  if (position.terms === "Cash") return { why: "cash", position, amount: creditAmount, over: creditAmount };
  if (position.overdue > 0) return { why: "overdue", position, amount: creditAmount, over: position.overdue };
  if (position.available !== null && creditAmount > position.available + 0.001) return { why: "limit", position, amount: creditAmount, over: creditAmount - position.available };
  return null;
}

/** The warning shown on the customer row and record. */
export function creditFlag(position: CreditPosition): "Over limit" | "Overdue" | null {
  if (position.overdue > 0) return "Overdue";
  if (position.limit !== null && position.owed + position.onOrder > position.limit) return "Over limit";
  return null;
}

/** A reason of at least 5 characters is needed to approve a stop. */
export const APPROVAL_MIN = 5;
export const approvalReasonOk = (reason: string | undefined) => (reason ?? "").trim().length >= APPROVAL_MIN;
