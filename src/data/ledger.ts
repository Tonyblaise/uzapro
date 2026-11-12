/**
 * Pure money helpers for Accounts and Expenses (research R1–R4).
 * `post()` is the only place an account balance changes: it adds a newest-first ledger line and
 * adjusts that account's balance (the design's `add` / `expPost` / `cnMoney` writes).
 */
import { DEMO_TODAY } from "@/lib/demo-clock";
import type { Expense, LedgerEntry, RecurringExpense } from "./types";
import type { AppState } from "./store/state";

export function post(s: AppState, entry: LedgerEntry): AppState {
  const amt = Math.round(entry.amt);
  return {
    ...s,
    accounts: {
      ...s.accounts,
      ledger: [{ ...entry, amt }, ...s.accounts.ledger],
      accounts: s.accounts.accounts.map((a) => (a.name === entry.account ? { ...a, balance: a.balance + amt } : a)),
    },
  };
}

/** Post several entries in order (each one ends up newest first, as the design's repeated unshift). */
export function postAll(s: AppState, entries: LedgerEntry[]): AppState {
  return entries.reduce(post, s);
}

/** The design's `expPost`: Expense (and Fee) lines for a paid expense, or their reversal on void. */
export function expenseEntries(e: Pick<Expense, "ref" | "account" | "reason" | "category" | "amount" | "fee">, back = false): LedgerEntry[] {
  const v = back ? "Voided: " : "";
  const out: LedgerEntry[] = [
    { date: DEMO_TODAY, account: e.account, ref: e.ref, desc: v + (e.reason && e.reason !== "—" ? e.reason : e.category), kind: back ? "Expense voided" : "Expense", amt: back ? e.amount : -e.amount },
  ];
  if (e.fee) out.push({ date: DEMO_TODAY, account: e.account, ref: e.ref, desc: v + "Transaction cost", kind: back ? "Fee voided" : "Fee", amt: back ? e.fee : -e.fee });
  return out;
}

// ---- Recurring schedules (design recStep / recNext / recRepeats / recEnded) -----------------

const iso = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
const parse = (v: string) => {
  const [y, m, d] = v.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
};
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

type Sched = Pick<RecurringExpense, "freq" | "interval" | "day">;

export function recStep(r: Sched, from: string): string {
  const n = Math.max(1, Number(r.interval) || 1);
  const y = parse(from);
  if (r.freq === "Daily") y.setUTCDate(y.getUTCDate() + n);
  else if (r.freq === "Weekly") y.setUTCDate(y.getUTCDate() + 7 * n);
  else if (r.freq === "Yearly") y.setUTCFullYear(y.getUTCFullYear() + n);
  else {
    const want = Number(r.day) || parse(from).getUTCDate();
    y.setUTCDate(1);
    y.setUTCMonth(y.getUTCMonth() + n);
    y.setUTCDate(Math.min(want, lastDay(y.getUTCFullYear(), y.getUTCMonth())));
  }
  return iso(y);
}

/** Next date on or after today (the cached `next` wins, as in the design). */
export function recNext(r: Sched & Pick<RecurringExpense, "start"> & { next?: string }, today = DEMO_TODAY): string {
  if (r.next) return r.next;
  let d = r.start || today;
  if (r.freq === "Monthly" && Number(r.day)) {
    const x = parse(d);
    const want = Math.min(Number(r.day), lastDay(x.getUTCFullYear(), x.getUTCMonth()));
    if (want < x.getUTCDate()) d = recStep(r, d);
    else {
      x.setUTCDate(want);
      d = iso(x);
    }
  }
  let guard = 0;
  while (d < today && guard++ < 3000) d = recStep(r, d);
  return d;
}

export function repeatsLabel(r: Pick<RecurringExpense, "freq" | "interval">): string {
  const n = Math.max(1, Number(r.interval) || 1);
  const one = { Daily: "day", Weekly: "week", Monthly: "month", Yearly: "year" }[r.freq] ?? "month";
  return n === 1 ? `Every ${one}` : `Every ${n} ${one}s`;
}

export function recEnded(r: RecurringExpense, today = DEMO_TODAY): boolean {
  return (!!r.end && recNext(r, today) > r.end) || (Number(r.max) > 0 && r.made >= Number(r.max));
}

// ---- Categories ---------------------------------------------------------------------------

/** "Spent this month": paid expenses in the category dated in the demo month (design: /Nov 2026$/). */
export function categorySpent(expenses: readonly Expense[], name: string, month = DEMO_TODAY.slice(0, 7)): number {
  return expenses.filter((e) => e.category === name && e.status === "Paid" && e.date.startsWith(month)).reduce((a, e) => a + e.amount, 0);
}
