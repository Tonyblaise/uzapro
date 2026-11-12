/**
 * Receivables and Payables commands (feature 003). Behaviour and wording from the design's
 * rcvPay/payPay, rcvPlan/payPlan, rcvCredit/payCredit, row actions and statement (research R2–R7).
 * Accounts is out of scope: payments store their account but no balances change (FR-019).
 */
import { DEMO_TODAY } from "@/lib/demo-clock";
import { date as fmtDate, num } from "@/lib/format";
import { nextRef } from "@/lib/refs";
import { balance, creditLeft, creditUsable, planEach } from "../money";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import {
  fail,
  ok,
  type Credit,
  type MoneyPayment,
  type NewCredit,
  type NewPayment,
  type NewPlan,
  type Payable,
  type Plan,
  type Receivable,
  type Result,
  type Side,
  type StatementFilter,
} from "../types";

const CREDIT_METHOD: Record<Side, string> = { rcv: "Customer credit", pay: "Supplier credit" };
const fmt = (n: number) => num(Math.round(n));

function items(s: AppState, side: Side): (Receivable | Payable)[] {
  return side === "rcv" ? s.money.receivables : s.money.payables;
}

function usableCredit(s: AppState, side: Side, party: string): number {
  const list = side === "rcv" ? s.money.customerCredits : s.money.supplierCredits;
  return list.filter((c) => c.party === party && creditUsable(c)).reduce((a, c) => a + creditLeft(c), 0);
}

// ---- Payments ---------------------------------------------------------------------------------

/**
 * Record a customer payment (side "rcv") or supplier payment (side "pay"): the amount is applied to
 * the selected open items oldest due first; paying with credit consumes the oldest credits first.
 */
export async function recordPayment(side: Side, input: NewPayment): Promise<Result<MoneyPayment>> {
  const store = getStore();
  const s = store.getState();
  const isCredit = input.method === CREDIT_METHOD[side];
  const open = items(s, side)
    .filter((x) => input.selected.includes(x.ref) && x.party === input.party && balance(x) > 0)
    .filter((x) => side === "rcv" || (x as Payable).approval === "Approved")
    .filter((x) => side === "pay" || !(x as Receivable).voided)
    .sort((a, b) => a.due.localeCompare(b.due));
  const selTotal = open.reduce((a, x) => a + balance(x), 0);
  const amt = input.amount;
  if (!input.party || open.length === 0 || !(amt > 0) || !input.date) return fail("Pick what is being paid and enter an amount.");
  if (amt > selTotal) return fail(`That is more than the ${fmt(selTotal)} KES selected. Lower the amount or tick more ${side === "rcv" ? "receivables" : "payables"}.`);
  if (isCredit) {
    const credit = usableCredit(s, side, input.party);
    if (amt > credit) return fail(side === "rcv" ? `This customer only has KES ${fmt(credit)} credit to use.` : `This supplier only owes you KES ${fmt(credit)} in credit.`);
  } else if (!input.account) return fail("Choose an account.");

  let left = amt;
  const alloc: Record<string, number> = {};
  for (const x of open) {
    const take = Math.min(left, balance(x));
    if (take > 0) alloc[x.ref] = take;
    left -= take;
  }
  const refs = Object.keys(alloc);
  const list = side === "rcv" ? s.money.rcvPayments : s.money.payPayments;
  const ref = nextRef(list.map((p) => p.ref), side === "rcv" ? "PAY-" : "VPMT-", 4);
  const verified = side === "rcv" ? ["Cash", "Customer credit"].includes(input.method) : input.method === "Supplier credit";
  const payment: MoneyPayment = {
    ref,
    date: input.date,
    party: input.party,
    alloc,
    method: input.method,
    account: isCredit ? "" : input.account,
    payRef: input.payRef.trim(),
    type: refs.length > 1 ? "Bulk" : input.plan ? "Instalment" : "Single",
    amount: amt,
    ...(input.plan ? { plan: input.plan } : {}),
    verification: verified ? { label: "Verified", tone: "success" } : side === "rcv" ? { label: "Pending", tone: "warning" } : { label: "Unverified", tone: "warning" },
  };

  store.setState((st) => {
    const m = st.money;
    const applyPaid = <T extends Receivable | Payable>(rows: T[]): T[] => rows.map((r) => (alloc[r.ref] ? { ...r, paid: r.paid + alloc[r.ref]! } : r));
    let credits = side === "rcv" ? m.customerCredits : m.supplierCredits;
    if (isCredit) {
      let need = amt;
      // The design reverses the newest-first list, so the oldest credits are used first.
      credits = [...credits]
        .reverse()
        .map((c) => {
          if (need <= 0 || c.party !== input.party || !creditUsable(c)) return c;
          const take = Math.min(creditLeft(c), need);
          need -= take;
          return { ...c, used: c.used + take };
        })
        .reverse();
    }
    const bumpPlan = (plans: Plan[]) => (input.plan ? plans.map((p) => (p.ref === input.plan ? { ...p, paid: p.paid + 1 } : p)) : plans);
    // FR-016: payments on an invoice receivable update that invoice in Sales (when it is listed).
    let invoices = st.sales.invoices;
    if (side === "rcv") {
      for (const r of m.receivables) {
        const a = alloc[r.ref];
        if (!a || r.type !== "Invoice") continue;
        invoices = invoices.map((inv) => {
          if (inv.number !== r.doc) return inv;
          const paid = inv.paid + a;
          return { ...inv, paid, status: paid >= inv.amount ? { label: "Paid", tone: "success" } : inv.status };
        });
      }
    }
    return {
      money:
        side === "rcv"
          ? { ...m, receivables: applyPaid(m.receivables), rcvPayments: [payment, ...m.rcvPayments], customerCredits: credits, rcvPlans: bumpPlan(m.rcvPlans) }
          : { ...m, payables: applyPaid(m.payables), payPayments: [payment, ...m.payPayments], supplierCredits: credits, payPlans: bumpPlan(m.payPlans) },
      sales: { ...st.sales, invoices },
    };
  });
  const message = side === "rcv" ? `${ref} saved. KES ${fmt(amt)} applied to ${refs.join(", ")}.` : `${ref} saved. KES ${fmt(amt)} paid to ${input.party}.`;
  showToast(message);
  return ok(payment, message);
}

export async function verifyPayment(side: Side, ref: string): Promise<Result<void>> {
  getStore().setState((st) => {
    const fix = (list: MoneyPayment[]) => list.map((p) => (p.ref === ref ? { ...p, verification: { label: "Verified", tone: "success" as const } } : p));
    return { money: side === "rcv" ? { ...st.money, rcvPayments: fix(st.money.rcvPayments) } : { ...st.money, payPayments: fix(st.money.payPayments) } };
  });
  const message = `${ref} verified.`;
  showToast(message);
  return ok(undefined, message);
}

/** Row action "Mark high priority" / "Mark normal priority" (no toast in the design). */
export async function toggleReceivablePriority(ref: string): Promise<Result<void>> {
  getStore().setState((st) => ({
    money: { ...st.money, receivables: st.money.receivables.map((r) => (r.ref === ref ? { ...r, priority: r.priority === "High" ? "Normal" : "High" } : r)) },
  }));
  return ok(undefined);
}

/** Payables row action "Mark high priority" / "Mark normal priority" (no toast in the design). */
export async function togglePayablePriority(ref: string): Promise<Result<void>> {
  getStore().setState((st) => ({
    money: { ...st.money, payables: st.money.payables.map((p) => (p.ref === ref ? { ...p, priority: p.priority === "High" ? "Normal" : "High" } : p)) },
  }));
  return ok(undefined);
}

// ---- Payables approval -------------------------------------------------------------------------

function setApproval(ref: string, approval: Payable["approval"]) {
  getStore().setState((st) => ({ money: { ...st.money, payables: st.money.payables.map((p) => (p.ref === ref ? { ...p, approval } : p)) } }));
}

export async function approvePayable(ref: string): Promise<Result<void>> {
  setApproval(ref, "Approved");
  const message = `${ref} approved for payment.`;
  showToast(message);
  return ok(undefined, message);
}

export async function rejectPayable(ref: string): Promise<Result<void>> {
  setApproval(ref, "Rejected");
  const message = `${ref} rejected.`;
  showToast(message);
  return ok(undefined, message);
}

// ---- Plans ------------------------------------------------------------------------------------

export async function createPlan(side: Side, input: NewPlan): Promise<Result<Plan>> {
  const store = getStore();
  const s = store.getState();
  const target = items(s, side).find((x) => x.ref === input.target);
  const plans = side === "rcv" ? s.money.rcvPlans : s.money.payPlans;
  if (!target || balance(target) <= 0) return fail("Pick something that is still owed.");
  if (plans.some((p) => p.target === target.ref && p.status.label === "Active")) return fail(`${target.ref} already has an active plan.`);
  if (!(input.count >= 2) || !input.start) return fail("Enter at least 2 instalments and a first due date.");
  const ref = nextRef(plans.map((p) => p.ref), side === "rcv" ? "PLN-" : "PPL-", 4);
  const total = balance(target);
  const plan: Plan = { ref, party: target.party, target: target.ref, total, each: planEach(total, input.count), count: Math.round(input.count), paid: 0, freq: input.freq, start: input.start, status: { label: "Active", tone: "success" } };
  store.setState((st) => ({ money: side === "rcv" ? { ...st.money, rcvPlans: [plan, ...st.money.rcvPlans] } : { ...st.money, payPlans: [plan, ...st.money.payPlans] } }));
  const message = `${ref} created for ${target.party}.`;
  showToast(message);
  return ok(plan, message);
}

export async function cancelPlan(side: Side, ref: string): Promise<Result<void>> {
  getStore().setState((st) => {
    const fix = (list: Plan[]) => list.map((p) => (p.ref === ref ? { ...p, status: { label: "Cancelled", tone: "neutral" as const } } : p));
    return { money: side === "rcv" ? { ...st.money, rcvPlans: fix(st.money.rcvPlans) } : { ...st.money, payPlans: fix(st.money.payPlans) } };
  });
  const message = `${ref} cancelled.`;
  showToast(message);
  return ok(undefined, message);
}

// ---- Credits ----------------------------------------------------------------------------------

export async function issueCredit(side: Side, input: NewCredit): Promise<Result<Credit>> {
  if (!input.party || !(input.amount > 0) || !input.reason) return fail("Pick who the credit is for, a reason and an amount.");
  if (side === "rcv" && !(input.why ?? "").trim()) return fail("Say why the credit is given.");
  if (input.expires && input.expires < DEMO_TODAY) return fail("The expiry date cannot be in the past.");
  const store = getStore();
  const list = side === "rcv" ? store.getState().money.customerCredits : store.getState().money.supplierCredits;
  const ref = nextRef(list.map((c) => c.ref), side === "rcv" ? "CRD-" : "SCR-", 4);
  const currency = input.currency || "KES";
  const credit: Credit = {
    ref,
    party: input.party,
    reason: side === "rcv" ? `${input.reason}: ${(input.why ?? "").trim()}` : input.reason,
    issued: fmtDate(DEMO_TODAY),
    amount: input.amount,
    used: 0,
    currency,
    expires: input.expires ?? "",
    notes: (input.notes ?? "").trim(),
    payRef: (input.payRef ?? "").trim(),
    voided: false,
  };
  store.setState((st) => ({ money: side === "rcv" ? { ...st.money, customerCredits: [credit, ...st.money.customerCredits] } : { ...st.money, supplierCredits: [credit, ...st.money.supplierCredits] } }));
  const message = side === "rcv" ? `${ref}: ${currency} ${fmt(input.amount)} credit for ${input.party}.` : `${ref}: KES ${fmt(input.amount)} credit from ${input.party}.`;
  showToast(message);
  return ok(credit, message);
}

export async function voidCredit(side: Side, ref: string): Promise<Result<void>> {
  getStore().setState((st) => {
    // The design voids a credit by using it up (Used = Amount) and marking it Voided.
    const fix = (list: Credit[]) => list.map((c) => (c.ref === ref ? { ...c, voided: true, used: c.amount } : c));
    return { money: side === "rcv" ? { ...st.money, customerCredits: fix(st.money.customerCredits) } : { ...st.money, supplierCredits: fix(st.money.supplierCredits) } };
  });
  const message = `${ref} voided.`;
  showToast(message);
  return ok(undefined, message);
}

// ---- Statement --------------------------------------------------------------------------------

export async function generateStatement(filter: StatementFilter): Promise<Result<void>> {
  getStore().setState((st) => ({ money: { ...st.money, statement: { ...filter } } }));
  showToast("Statement updated.");
  return ok(undefined, "Statement updated.");
}

// ---- Internal hooks for features 001 / 002 (US3) ---------------------------------------------

/** Add a receivable (credit sale, invoice). Pure: returns the new state slice and the ref. */
export function addReceivable(s: AppState, r: Omit<Receivable, "ref" | "voided" | "priority" | "paid" | "raised"> & { raised?: string }): { money: AppState["money"]; ref: string } {
  const ref = nextRef(s.money.receivables.map((x) => x.ref), "RCV-", 4);
  const rec: Receivable = { ...r, ref, priority: "Normal", paid: 0, raised: r.raised ?? DEMO_TODAY, voided: false };
  return { money: { ...s.money, receivables: [rec, ...s.money.receivables] }, ref };
}

/** FR-016b: close the receivable raised from a voided sale/invoice (by document ref). */
export function closeReceivableFor(s: AppState, doc: string): AppState["money"] {
  return { ...s.money, receivables: s.money.receivables.map((r) => (r.doc === doc && !r.voided ? { ...r, voided: true } : r)) };
}

/** Add a payable (goods received on an unpaid order). */
export function addPayable(s: AppState, p: Omit<Payable, "ref" | "priority" | "paid">): { money: AppState["money"]; ref: string } {
  const ref = nextRef(s.money.payables.map((x) => x.ref), "PYB-", 4);
  const pay: Payable = { ...p, ref, priority: "Normal", paid: 0 };
  return { money: { ...s.money, payables: [pay, ...s.money.payables] }, ref };
}

/** FR-016c: customer credit from an approved credit note refunded as store credit. */
export function addCustomerCredit(s: AppState, party: string, cnRef: string, amount: number): { money: AppState["money"]; ref: string } {
  const ref = nextRef(s.money.customerCredits.map((c) => c.ref), "CRD-", 4);
  const credit: Credit = { ref, party, reason: `Credit note ${cnRef}`, issued: fmtDate(DEMO_TODAY), amount: Math.round(amount), used: 0, currency: "KES", expires: "", notes: "", payRef: "", voided: false };
  return { money: { ...s.money, customerCredits: [credit, ...s.money.customerCredits] }, ref };
}

/** Next RCV-/PYB- reference without creating a record (for message previews). */
export function peekRef(s: AppState, side: Side): string {
  return side === "rcv" ? nextRef(s.money.receivables.map((x) => x.ref), "RCV-", 4) : nextRef(s.money.payables.map((x) => x.ref), "PYB-", 4);
}
