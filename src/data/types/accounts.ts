/** Accounts and Expenses types (specs/004-accounts-expenses/data-model.md). */
import type { Pill } from "./common";

export type AccountType = "Bank" | "Mobile money" | "Cash" | "Petty cash";

export interface Account {
  name: string;
  /** Bank or provider; "—" when none. */
  provider: string;
  /** Account number; "—" when none. */
  number: string;
  type: AccountType;
  /** Live balance. Changes only through `post()` (src/data/ledger.ts). */
  balance: number;
  branch: string;
  till: string;
  opening: number;
  bankBranch: string;
  swift: string;
  iban: string;
  active: boolean;
}

export type LedgerKind =
  | "Deposit"
  | "Withdrawal"
  | "Transfer"
  | "Fee"
  | "Fee voided"
  | "Opening balance"
  | "Customer payment"
  | "Supplier payment"
  | "Expense"
  | "Expense voided"
  | "Refund"
  | "Reversal";

export interface LedgerEntry {
  date: string; // ISO
  account: string;
  ref: string;
  desc: string;
  kind: LedgerKind;
  /** Signed amount: + money in, − money out. */
  amt: number;
}

interface MoveBase {
  ref: string;
  date: string; // ISO
  description: string;
  amount: number;
  status: Pill;
  time: string;
  fee: number;
  bankRef: string;
  notes: string;
  who: string;
  /** Set by Reverse in the record view (design `doReverse`). */
  reversed?: { when: string; who: string };
}

export interface Deposit extends MoveBase {
  account: string;
  method: string;
}

export interface Withdrawal extends MoveBase {
  account: string;
  method: string;
  purpose: string;
}

export interface MoneyTransfer extends MoveBase {
  from: string;
  to: string;
}

export interface NewAccount {
  name: string;
  type: AccountType;
  provider: string;
  number: string;
  branch: string;
  till: string;
  opening: number;
  bankBranch: string;
  swift: string;
  iban: string;
  active: boolean;
}

export interface NewMoneyMove {
  account: string;
  /** Transfers only. */
  to?: string;
  method?: string;
  /** Withdrawals only. */
  purpose?: string;
  description: string;
  amount: number;
  fee: number;
  bankRef: string;
  notes: string;
}

export type ExpenseStatus = "Paid" | "Waiting approval" | "Unpaid bill";

export interface Expense {
  ref: string;
  date: string; // ISO
  category: string;
  payee: string; // "—" when none
  /** Source account, or "Not paid yet" for a bill. */
  account: string;
  reason: string; // "—" when none
  tax: number;
  /** The design's amount column (gross; includes tax). */
  amount: number;
  status: ExpenseStatus;
  branch: string;
  method: string;
  payRef: string;
  fee: number;
}

export interface VoidedExpense {
  ref: string;
  date: string; // ISO
  category: string;
  payee: string;
  amount: number;
  voidedOn: string; // ISO
  voidedBy: string;
  reason: string;
  /** Account the money went back to, or "—". */
  voidAccount: string;
  /** Kept from the expense (design keeps `UZ_EXPDETAIL` after a void). */
  branch: string;
  method: string;
  payRef: string;
  fee: number;
}

export type RecurringFreq = "Daily" | "Weekly" | "Monthly" | "Yearly";

export interface RecurringExpense {
  ref: string;
  name: string;
  category: string;
  account: string;
  amount: number;
  freq: RecurringFreq;
  interval: number;
  /** Day of month for monthly schedules ("" = the start date's day). */
  day: string;
  start: string; // ISO
  end: string; // ISO or ""
  max: string; // "" or a count
  auto: boolean;
  made: number;
  payee: string;
  method: string;
  tax: number;
  reason: string;
  notes: string;
  payRef: string;
  /** Cached next date (ISO); "" = compute from start. */
  next: string;
  paused: boolean;
}

export interface RecurringRow extends RecurringExpense {
  repeats: string;
  /** ISO next date, "" when not Active. */
  nextDate: string;
  status: Pill;
}

export interface ExpenseCategory {
  name: string;
  /** User data (fixture colour), rendered through a style binding. */
  color: string;
  parent: string;
  desc: string;
  budget: number;
  approval: boolean;
  active: boolean;
}

export interface CategoryRow extends ExpenseCategory {
  spent: number;
  inUse: boolean;
}

export interface NewExpenseRow {
  kind: "one" | "rec";
  later: boolean;
  due: string;
  fee: number;
  name: string;
  category: string;
  account: string;
  branch: string;
  amount: number;
  tax: number;
  method: string;
  date: string;
  freq: RecurringFreq;
  interval: number;
  end: string;
  auto: boolean;
  payee: string;
  payRef: string;
  reason: string;
}

export interface NewRecurring {
  name: string;
  category: string;
  account: string;
  amount: number;
  tax: number;
  method: string;
  payee: string;
  payRef: string;
  reason: string;
  notes: string;
  freq: RecurringFreq;
  interval: number;
  day: string;
  start: string;
  end: string;
  max: string;
  auto: boolean;
  active: boolean;
}
