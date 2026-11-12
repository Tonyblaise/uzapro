"use client";
/** Accounts and Expenses read hooks (specs/004-accounts-expenses/contracts/data-access.md). */
import { useMemo } from "react";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { UZ_EXPTREND } from "./fixtures/expenses";
import { categorySpent, recEnded, recNext, repeatsLabel } from "./ledger";
import { useAppStore } from "./store/StoreProvider";
import type { Account, CategoryRow, Deposit, Expense, ExpenseCategory, LedgerEntry, MoneyTransfer, RecurringRow, VoidedExpense, Withdrawal } from "./types";

export { ACCOUNT_TILLS, ACCOUNT_TYPES_EDIT, ACCOUNT_TYPES_NEW } from "./fixtures/accounts";
export { CATEGORY_SWATCHES, RECURRING_FREQS, UZ_EXPTREND } from "./fixtures/expenses";
export { recNext, recStep, repeatsLabel } from "./ledger";

// ---- Accounts -------------------------------------------------------------------------------

export function useAccounts(): Account[] {
  return useAppStore((s) => s.accounts.accounts);
}

/** Every account name, in list order (the design's pickers use all of `accRows`). */
export function useAccountNames(): string[] {
  const list = useAccounts();
  return useMemo(() => list.map((a) => a.name), [list]);
}

/** Active accounts only (edge case: an inactive account is not offered in pickers). */
export function useActiveAccountNames(): string[] {
  const list = useAccounts();
  return useMemo(() => list.filter((a) => a.active).map((a) => a.name), [list]);
}

export function useBanks(): string[] {
  return useAppStore((s) => s.accounts.banks);
}

export interface LedgerFilter {
  account?: string;
  from?: string;
  to?: string;
}

/** Transactions, newest first; "All accounts" / empty dates are ignored (design accFilter/accFrom/accTo). */
export function useLedger(filter: LedgerFilter = {}): LedgerEntry[] {
  const list = useAppStore((s) => s.accounts.ledger);
  const { account, from, to } = filter;
  return useMemo(
    () => list.filter((e) => (!account || account === "All accounts" || e.account === account) && (!from || e.date >= from) && (!to || e.date <= to)),
    [list, account, from, to],
  );
}

export function useDeposits(): Deposit[] {
  return useAppStore((s) => s.accounts.deposits);
}

export function useWithdrawals(): Withdrawal[] {
  return useAppStore((s) => s.accounts.withdrawals);
}

export function useMoneyTransfers(): MoneyTransfer[] {
  return useAppStore((s) => s.accounts.transfers);
}

// ---- Expenses -------------------------------------------------------------------------------

export function useExpenses(): Expense[] {
  return useAppStore((s) => s.expenses.expenses);
}

export function useVoidedExpenses(): VoidedExpense[] {
  return useAppStore((s) => s.expenses.voided);
}

/** Refs of unpaid-bill expenses whose payable is partly paid: Void is disabled for these. */
export function useUnvoidableExpenses(): string[] {
  const exps = useExpenses();
  const payables = useAppStore((s) => s.money.payables);
  return useMemo(() => exps.filter((e) => e.status === "Unpaid bill" && payables.some((p) => p.doc === e.ref && p.paid > 0)).map((e) => e.ref), [exps, payables]);
}

/** Recurring rows with the design's derived Repeats, Next date and Ended status. */
export function useRecurring(): RecurringRow[] {
  const list = useAppStore((s) => s.expenses.recurring);
  return useMemo(
    () =>
      list.map((r) => {
        const ended = !r.paused && recEnded(r);
        const status = r.paused ? { label: "Paused", tone: "neutral" as const } : ended ? { label: "Ended", tone: "neutral" as const } : { label: "Active", tone: "success" as const };
        return { ...r, repeats: repeatsLabel(r), nextDate: status.label === "Active" ? recNext(r) : "", status };
      }),
    [list],
  );
}

export function useExpenseCategoryList(): ExpenseCategory[] {
  return useAppStore((s) => s.expenses.categories);
}

/** Categories with "Spent this month" and whether anything uses them (Delete is disabled then). */
export function useExpenseCategories(): CategoryRow[] {
  const cats = useAppStore((s) => s.expenses.categories);
  const exps = useExpenses();
  const recs = useAppStore((s) => s.expenses.recurring);
  return useMemo(
    () =>
      cats.map((c) => ({
        ...c,
        spent: categorySpent(exps, c.name),
        inUse: exps.some((e) => e.category === c.name) || recs.some((r) => r.category === c.name) || cats.some((x) => x.parent === c.name),
      })),
    [cats, exps, recs],
  );
}

export interface ExpensesOverview {
  /** Paid expenses dated this month (plus their fees in totals). */
  month: Expense[];
  monthTotal: number;
  previous: number;
  /** % change vs the previous month (rounded). */
  diff: number;
  average: number;
  trend: { label: string; total: number }[];
  waiting: Expense[];
  waitingTotal: number;
  fees: number;
  byCategory: { name: string; amount: number; pct: number; color: string | null }[];
  budgets: { name: string; spent: number; budget: number; pct: number }[];
  byAccount: { name: string; amount: number }[];
  top: Expense[];
  upcoming: { ref: string; name: string; category: string; repeats: string; amount: number; next: string }[];
}

/** The design's `eo` block (Expenses › Overview), computed from live data. */
export function useExpensesOverview(): ExpensesOverview {
  const exps = useExpenses();
  const cats = useExpenseCategoryList();
  const recs = useRecurring();
  return useMemo(() => {
    const monthKey = DEMO_TODAY.slice(0, 7);
    const month = exps.filter((e) => e.status === "Paid" && e.date.startsWith(monthKey));
    const monthTotal = month.reduce((a, e) => a + e.amount + e.fee, 0);
    const trend = [...UZ_EXPTREND.map(([label, total]) => ({ label, total })), { label: "Nov", total: monthTotal }];
    const previous = trend[trend.length - 2]?.total ?? 0;
    const diff = previous ? Math.round(((monthTotal - previous) / previous) * 100) : 0;
    const byCat: Record<string, number> = {};
    month.forEach((e) => (byCat[e.category] = (byCat[e.category] ?? 0) + e.amount));
    const catList = Object.keys(byCat).sort((a, b) => byCat[b]! - byCat[a]!);
    const sum = monthTotal || 1;
    const byAcc: Record<string, number> = {};
    month.forEach((e) => (byAcc[e.account] = (byAcc[e.account] ?? 0) + e.amount + e.fee));
    const waiting = exps.filter((e) => e.status === "Waiting approval");
    return {
      month,
      monthTotal,
      previous,
      diff,
      average: Math.round(trend.reduce((a, t) => a + t.total, 0) / trend.length),
      trend,
      waiting,
      waitingTotal: waiting.reduce((a, e) => a + e.amount, 0),
      fees: month.reduce((a, e) => a + e.fee, 0),
      byCategory: catList.map((name) => ({ name, amount: byCat[name]!, pct: Math.round((byCat[name]! / sum) * 100), color: cats.find((c) => c.name === name)?.color ?? null })),
      budgets: cats
        .filter((c) => c.budget && c.active)
        .map((c) => ({ name: c.name, spent: byCat[c.name] ?? 0, budget: c.budget, pct: ((byCat[c.name] ?? 0) / c.budget) * 100 }))
        .sort((a, b) => Math.min(100, b.pct) - Math.min(100, a.pct)),
      byAccount: Object.keys(byAcc)
        .sort((a, b) => byAcc[b]! - byAcc[a]!)
        .map((name) => ({ name, amount: byAcc[name]! })),
      top: [...month].sort((a, b) => b.amount - a.amount).slice(0, 5),
      upcoming: recs
        .filter((r) => r.status.label === "Active")
        .map((r) => ({ ref: r.ref, name: r.name, category: r.category, repeats: r.repeats, amount: r.amount, next: recNext(r) }))
        .sort((a, b) => a.next.localeCompare(b.next))
        .slice(0, 4),
    };
  }, [exps, cats, recs]);
}
