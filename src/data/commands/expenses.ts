/**
 * Expenses commands (feature 004, US3–US4). Behaviour and wording from the design's `expAdd`,
 * `expPost`, expense form save, row actions (Approve / Void / Record now / Pause / Delete),
 * `recSave` and the category form (research R3–R6).
 */
import { ROLES } from "@/config/roles";
import { DEMO_TODAY, addDays } from "@/lib/demo-clock";
import { nextRef } from "@/lib/refs";
import { expenseEntries, postAll, recNext, recStep, repeatsLabel } from "../ledger";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import { fail, ok, type Expense, type ExpenseCategory, type NewExpenseRow, type NewRecurring, type RecurringExpense, type Result } from "../types";
import { addPayable } from "./money";

const who = () => ROLES[getStore().getState().session.role].name;

interface AddInput {
  category: string;
  account: string;
  amount: number;
  tax: number;
  fee?: number;
  method?: string;
  date: string;
  payee?: string;
  payRef?: string;
  reason?: string;
  branch?: string;
  later?: boolean;
  due?: string;
  /** Recurring auto-record: paid immediately, skipping approval (FR-010a). */
  auto?: boolean;
}

/** The design's `expAdd`, pure: adds the expense, a Bill payable when "later", and posts when paid. */
export function addExpense(s: AppState, o: AddInput): { state: AppState; expense: Expense } {
  const ref = nextRef([...s.expenses.expenses, ...s.expenses.voided].map((e) => e.ref), "EXP-", 4);
  const cat = s.expenses.categories.find((c) => c.name === o.category);
  const needsApproval = !!cat?.approval;
  const paid = !o.later && (o.auto !== undefined ? o.auto || !needsApproval : !needsApproval);
  const expense: Expense = {
    ref,
    date: o.date,
    category: o.category,
    payee: o.payee?.trim() || "—",
    account: o.later ? "Not paid yet" : o.account,
    reason: o.reason?.trim() || "—",
    tax: Math.round(Number(o.tax) || 0),
    amount: Math.round(Number(o.amount) || 0),
    status: o.later ? "Unpaid bill" : paid ? "Paid" : "Waiting approval",
    branch: o.branch ?? "",
    method: o.method || "Cash",
    payRef: o.payRef?.trim() ?? "",
    fee: Math.round(Number(o.fee) || 0),
  };
  let next: AppState = { ...s, expenses: { ...s.expenses, expenses: [expense, ...s.expenses.expenses] } };
  if (o.later) {
    next = {
      ...next,
      money: addPayable(next, {
        party: expense.payee,
        type: "Bill",
        doc: ref,
        branch: o.branch || "Nairobi HQ",
        due: o.due || addDays(o.date, 30),
        total: expense.amount,
        approval: needsApproval ? "Waiting approval" : "Approved",
      }).money,
    };
  }
  if (paid) next = postAll(next, expenseEntries(expense));
  return { state: next, expense };
}

function okRow(r: NewExpenseRow): boolean {
  const base = !!r.category && (!!r.account || (r.kind === "one" && r.later)) && r.amount > 0 && !!r.date;
  if (!base || r.tax > r.amount) return false;
  return r.kind === "one" ? !r.later || (!!r.payee.trim() && r.due >= r.date) : !!r.name.trim() && r.interval >= 1;
}

/** "Record expenses": one-off rows become expenses, recurring rows become schedules. */
export async function recordExpenses(rows: NewExpenseRow[]): Promise<Result<Expense[]>> {
  if (!rows.length || !rows.every(okRow)) return fail("Fill in every expense before saving.");
  const store = getStore();
  let paid = 0;
  let wait = 0;
  let bills = 0;
  let sched = 0;
  const made: Expense[] = [];
  store.setState((s0) => {
    let s = s0;
    for (const r of rows) {
      if (r.kind === "rec") {
        s = upsertRecurring(s, {
          name: r.name,
          category: r.category,
          account: r.account,
          amount: r.amount,
          tax: r.tax,
          method: r.method,
          payee: r.payee,
          payRef: r.payRef,
          reason: r.reason,
          notes: "",
          freq: r.freq,
          interval: r.interval,
          day: r.freq === "Monthly" ? String(Number(r.date.slice(8, 10))) : "",
          start: r.date,
          end: r.end,
          max: "",
          auto: r.auto,
          active: true,
        }).state;
        sched++;
      } else {
        const res = addExpense(s, { ...r, branch: r.branch });
        s = res.state;
        made.push(res.expense);
        if (res.expense.status === "Paid") paid++;
        else if (res.expense.status === "Unpaid bill") bills++;
        else wait++;
      }
    }
    return s;
  });
  const message = [paid ? `${paid} paid` : "", wait ? `${wait} waiting approval` : "", bills ? `${bills} added to Payables` : "", sched ? `${sched} recurring set up` : ""].filter(Boolean).join(", ") + ".";
  showToast(message);
  return ok(made, message);
}

export async function approveExpense(ref: string): Promise<Result<void>> {
  const store = getStore();
  const e = store.getState().expenses.expenses.find((x) => x.ref === ref);
  if (!e || e.status !== "Waiting approval") return fail("Only expenses waiting approval can be approved.");
  const paid: Expense = { ...e, status: "Paid" };
  store.setState((s) => postAll({ ...s, expenses: { ...s.expenses, expenses: s.expenses.expenses.map((x) => (x.ref === ref ? paid : x)) } }, expenseEntries(paid)));
  const message = `${ref} approved and paid from ${e.account}.`;
  showToast(message);
  return ok(undefined, message);
}

/** Void is blocked for an unpaid bill whose payable has been partly paid (design row action). */
function canVoidExpense(s: AppState, e: Expense): boolean {
  return !(e.status === "Unpaid bill" && s.money.payables.some((p) => p.doc === e.ref && p.paid > 0));
}

export async function voidExpense(ref: string, reason: string): Promise<Result<void>> {
  const store = getStore();
  const s0 = store.getState();
  const e = s0.expenses.expenses.find((x) => x.ref === ref);
  if (!e) return fail("That expense is not in the list.");
  if (!reason.trim()) return fail("Give a reason for voiding.");
  if (!canVoidExpense(s0, e)) return fail("Part of this bill has been paid, so it can't be voided.");
  const paid = e.status === "Paid";
  store.setState((s) => {
    let n: AppState = paid ? postAll(s, expenseEntries(e, true)) : s;
    if (e.status === "Unpaid bill") n = { ...n, money: { ...n.money, payables: n.money.payables.filter((p) => p.doc !== ref) } };
    return {
      ...n,
      expenses: {
        ...n.expenses,
        expenses: n.expenses.expenses.filter((x) => x.ref !== ref),
        voided: [
          { ref, date: e.date, category: e.category, payee: e.payee, amount: e.amount, voidedOn: DEMO_TODAY, voidedBy: who(), reason: reason.trim(), voidAccount: paid ? e.account : "—", branch: e.branch, method: e.method, payRef: e.payRef, fee: e.fee },
          ...n.expenses.voided,
        ],
      },
    };
  });
  const message = `${ref} voided.${paid ? ` Money returned to ${e.account}.` : ""}`;
  showToast(message);
  return ok(undefined, message);
}

// ---- Recurring ----------------------------------------------------------------------------

/** The design's `recSave`, pure. */
function upsertRecurring(s: AppState, f: NewRecurring, edit = ""): { state: AppState; ref: string } {
  const list = s.expenses.recurring;
  const ref = edit || nextRef(list.map((r) => r.ref), "REC-", 4);
  const prev = list.find((r) => r.ref === ref);
  const rec: RecurringExpense = {
    ref,
    name: f.name.trim(),
    category: f.category,
    account: f.account,
    amount: Math.round(Number(f.amount) || 0),
    freq: f.freq,
    interval: Math.max(1, Number(f.interval) || 1),
    day: f.freq === "Monthly" ? f.day : "",
    start: f.start,
    end: f.end,
    max: f.max,
    auto: f.auto,
    made: prev?.made ?? 0,
    payee: f.payee.trim(),
    method: f.method,
    tax: Math.round(Number(f.tax) || 0),
    reason: f.reason.trim(),
    notes: f.notes.trim(),
    payRef: f.payRef.trim(),
    next: "",
    paused: !f.active,
  };
  const recurring = prev ? list.map((r) => (r.ref === ref ? rec : r)) : [rec, ...list];
  return { state: { ...s, expenses: { ...s.expenses, recurring } }, ref };
}

export function recurringBlocked(f: NewRecurring): boolean {
  const day = Number(f.day);
  return !f.name.trim() || !f.category || !f.account || !(f.amount > 0) || !(f.interval >= 1) || !f.start || (!!f.end && f.end < f.start) || (f.freq === "Monthly" && !!f.day && (day < 1 || day > 31));
}

/** The recurring form's schedule summary line. */
export function recurringSummary(f: Pick<NewRecurring, "amount" | "freq" | "interval" | "day" | "start" | "end" | "max">): string {
  if (!(f.amount > 0) || !f.start) return "Fill in the amount and start date to see the schedule.";
  const fmtD = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const first = recNext({ freq: f.freq, interval: f.interval, day: f.day, start: f.start });
  return (
    `KES ${Math.round(f.amount).toLocaleString("en-KE")} ${repeatsLabel(f).toLowerCase()}` +
    (f.freq === "Monthly" && Number(f.day) ? ` on day ${Number(f.day)}` : "") +
    `, first on ${fmtD(first)}` +
    (f.end ? `, until ${fmtD(f.end)}` : "") +
    (Number(f.max) ? `, ${Number(f.max)} times at most` : "") +
    "."
  );
}

export async function saveRecurring(input: NewRecurring, edit = ""): Promise<Result<string>> {
  if (recurringBlocked(input)) return fail("Fill in the schedule before saving.");
  let ref = "";
  getStore().setState((s) => {
    const res = upsertRecurring(s, input, edit);
    ref = res.ref;
    return res.state;
  });
  const message = `${edit ? "Saved" : "Set up"} ${input.name.trim()} (${ref}).`;
  showToast(message);
  return ok(ref, message);
}

/** "Record now": the next expense from a schedule, then the next date moves one step. */
export async function recordRecurringNow(ref: string): Promise<Result<Expense>> {
  const store = getStore();
  const r = store.getState().expenses.recurring.find((x) => x.ref === ref);
  if (!r || r.paused) return fail("Only active schedules can be recorded.");
  let made: Expense | undefined;
  store.setState((s) => {
    const res = addExpense(s, { category: r.category, account: r.account, amount: r.amount, tax: r.tax, method: r.method, date: DEMO_TODAY, payee: r.payee, payRef: r.payRef, reason: r.reason || r.name, auto: r.auto });
    made = res.expense;
    const next = recStep(r, recNext(r));
    return { ...res.state, expenses: { ...res.state.expenses, recurring: res.state.expenses.recurring.map((x) => (x.ref === ref ? { ...x, made: x.made + 1, next } : x)) } };
  });
  const message = `${made!.ref} recorded from ${r.name}.`;
  showToast(message);
  return ok(made!, message);
}

export async function setRecurringActive(ref: string, active: boolean): Promise<Result<void>> {
  const store = getStore();
  const r = store.getState().expenses.recurring.find((x) => x.ref === ref);
  if (!r) return fail("That schedule is not in the list.");
  store.setState((s) => ({ expenses: { ...s.expenses, recurring: s.expenses.recurring.map((x) => (x.ref === ref ? { ...x, paused: !active } : x)) } }));
  const message = `${r.name} ${active ? "resumed" : "paused"}.`;
  showToast(message);
  return ok(undefined, message);
}

export async function deleteRecurring(ref: string): Promise<Result<void>> {
  const store = getStore();
  const r = store.getState().expenses.recurring.find((x) => x.ref === ref);
  if (!r) return fail("That schedule is not in the list.");
  store.setState((s) => ({ expenses: { ...s.expenses, recurring: s.expenses.recurring.filter((x) => x.ref !== ref) } }));
  const message = `${r.name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

// ---- Categories ---------------------------------------------------------------------------

export async function saveExpenseCategory(input: ExpenseCategory, edit = ""): Promise<Result<ExpenseCategory>> {
  const store = getStore();
  const name = input.name.trim();
  const taken = !!name && name !== edit && store.getState().expenses.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!name || taken || input.budget < 0) return fail(taken ? `${name} is already in the list.` : "Enter a category name.");
  const parent = input.parent && input.parent !== "None (top level)" ? input.parent : "";
  const item: ExpenseCategory = { ...input, name, parent, desc: input.desc.trim(), budget: Number(input.budget) || 0 };
  store.setState((s) => {
    const x = s.expenses;
    const rename = (v: string) => (edit && edit !== name && v === edit ? name : v);
    const exists = x.categories.some((c) => c.name === edit);
    const categories = (edit && exists ? x.categories.map((c) => (c.name === edit ? item : c)) : [...x.categories, item]).map((c) => ({ ...c, parent: rename(c.parent) }));
    return {
      expenses: {
        expenses: x.expenses.map((e) => ({ ...e, category: rename(e.category) })),
        recurring: x.recurring.map((r) => ({ ...r, category: rename(r.category) })),
        voided: x.voided.map((v) => ({ ...v, category: rename(v.category) })),
        categories,
      },
    };
  });
  const message = `${name} ${edit ? "saved" : "created"}.`;
  showToast(message);
  return ok(item, message);
}

/** Quick-add from the expense form (`quickCat`): a plain active category with no budget. */
export async function quickAddCategory(name: string): Promise<Result<string>> {
  const n = name.trim();
  if (!n) return fail("Enter a category name.");
  getStore().setState((s) =>
    s.expenses.categories.some((c) => c.name === n)
      ? s
      : { expenses: { ...s.expenses, categories: [...s.expenses.categories, { name: n, color: "#059669", parent: "", desc: "", budget: 0, approval: false, active: true }] } },
  );
  return ok(n);
}

export async function deleteExpenseCategory(name: string): Promise<Result<void>> {
  const store = getStore();
  const x = store.getState().expenses;
  const used = x.expenses.some((e) => e.category === name) || x.recurring.some((r) => r.category === name) || x.categories.some((c) => c.parent === name);
  if (used) return fail(`${name} is in use, so it can't be deleted.`);
  store.setState((s) => ({ expenses: { ...s.expenses, categories: s.expenses.categories.filter((c) => c.name !== name) } }));
  const message = `${name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}
