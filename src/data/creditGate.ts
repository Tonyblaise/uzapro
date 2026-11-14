/**
 * State-level credit gate (feature 012, research R6): the one place commands and hooks ask
 * "may this credit go ahead?". Pure over `AppState`.
 */
import { date as fmtDate, kes } from "@/lib/format";
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { approvalReasonOk, creditPosition, creditStop, termDays } from "./credit";
import { WALK_IN } from "./fixtures/customers";
import { myApprovals } from "./approvals";
import { currentUserName } from "./profile";
import type { AppState } from "./store/state";
import type { CreditApproval, CreditPosition, CreditStop, Customer, Receivable, SalesOrder } from "./types";

type GateState = Pick<AppState, "customers" | "money" | "sales" | "permissions" | "session" | "profiles">;

/** A role may approve a credit stop when it has the "Approve credit over the limit" right (feature 018, replacing Write on Receivables). */
export function canApproveCredit(s: Pick<AppState, "permissions" | "session">): boolean {
  return myApprovals(s).credit;
}

/** null for the walk-in customer and for names that are not customers. */
export function positionOf(customers: readonly Customer[], receivables: readonly Receivable[], orders: readonly SalesOrder[], customer: string): CreditPosition | null {
  if (!customer || customer === WALK_IN) return null;
  const c = customers.find((x) => x.name === customer);
  return c ? creditPosition(c, receivables, orders) : null;
}

export function stopFor(customers: readonly Customer[], receivables: readonly Receivable[], orders: readonly SalesOrder[], customer: string, creditAmount: number): CreditStop | null {
  const p = positionOf(customers, receivables, orders, customer);
  return p ? creditStop(p, creditAmount) : null;
}

/** The refusal toast (contracts/ui.md › Toasts). */
export function stopMessage(stop: CreditStop): string {
  const who = stop.position.customer;
  if (stop.why === "cash") return `${who} is on cash terms.`;
  if (stop.why === "overdue") return `${who} has ${kes(stop.position.overdue)} overdue.`;
  return `${who} is over their credit limit.`;
}

export type GateResult = { ok: true; approval?: CreditApproval; days: number } | { ok: false; message: string; stop: CreditStop };

/**
 * Check a credit amount for a customer. A stop passes only with a reason of 5 or more characters
 * from a role that may approve; the approval to record comes back with it. `days` is the
 * customer's terms (30 when unknown, as before this feature).
 */
export function creditGate(s: GateState, customer: string, creditAmount: number, approval?: { reason: string }): GateResult {
  const position = positionOf(s.customers, s.money.receivables, s.sales.orders, customer);
  const days = position && position.terms !== "Cash" ? termDays(position.terms) : 30;
  const stop = position ? creditStop(position, creditAmount) : null;
  if (!stop) return { ok: true, days };
  if (!approval || !approvalReasonOk(approval.reason) || !canApproveCredit(s)) return { ok: false, message: stopMessage(stop), stop };
  return { ok: true, days, approval: { by: currentUserName(s), at: `${fmtDate(DEMO_TODAY)}, ${demoTime()}`, reason: approval.reason.trim(), why: stop.why, amount: stop.over } };
}
