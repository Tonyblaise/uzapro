/**
 * Accounts commands (feature 004, US1–US2). Behaviour and wording from the design's `accEdit`
 * save and the `isFinModal` deposit / withdrawal / transfer save (research R1–R2).
 */
import { ROLES } from "@/config/roles";
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { nextRef } from "@/lib/refs";
import { postAll } from "../ledger";
import { getStore, showToast } from "../store";
import { fail, ok, type Account, type Deposit, type LedgerEntry, type MoneyTransfer, type NewAccount, type NewMoneyMove, type Result, type Withdrawal } from "../types";

/** The design's money-movement modal dates new deposits, withdrawals and transfers 1 Nov 2026. */
export const FIN_TODAY = "2026-11-01";

const who = () => ROLES[getStore().getState().session.role].name;

/** Add or edit an account (the shared `accEdit` drawer). */
export async function saveAccount(input: NewAccount, edit = ""): Promise<Result<Account>> {
  const store = getStore();
  const s = store.getState();
  const name = input.name.trim();
  const dup = s.accounts.accounts.some((a) => a.name.toLowerCase() === name.toLowerCase() && a.name !== edit);
  if (!name || !input.branch) return fail("Enter the account name and branch.");
  if (dup) return fail(`${name} is already in the list.`);
  const old = edit ? s.accounts.accounts.find((a) => a.name === edit) : undefined;
  const opening = Number(input.opening) || 0;
  const account: Account = {
    name,
    provider: input.provider.trim() || "—",
    number: input.number.trim() || "—",
    type: input.type,
    balance: Math.round(old ? old.balance + opening - old.opening : opening),
    branch: input.branch,
    till: input.till,
    opening,
    bankBranch: input.bankBranch,
    swift: input.swift,
    iban: input.iban,
    active: input.active,
  };
  store.setState((st) => {
    const a = st.accounts;
    const rename = (v: string) => (old && v === edit ? name : v);
    const renamed = !!old && edit !== name;
    return {
      accounts: {
        ...a,
        accounts: old ? a.accounts.map((x) => (x.name === edit ? account : x)) : [...a.accounts, account],
        ...(renamed
          ? {
              ledger: a.ledger.map((e) => ({ ...e, account: rename(e.account) })),
              deposits: a.deposits.map((d) => ({ ...d, account: rename(d.account) })),
              withdrawals: a.withdrawals.map((w) => ({ ...w, account: rename(w.account) })),
              transfers: a.transfers.map((t) => ({ ...t, from: rename(t.from), to: rename(t.to) })),
            }
          : {}),
        banks: input.provider.trim() && !a.banks.includes(input.provider.trim()) ? [...a.banks, input.provider.trim()] : a.banks,
      },
    };
  });
  const message = edit ? "Changes saved." : `${name} added.`;
  showToast(message);
  return ok(account, message);
}

type MoveKind = "deposit" | "withdrawal" | "transfer";

function check(kind: MoveKind, input: NewMoneyMove): string {
  if (!input.account || !(input.amount > 0) || !input.description.trim()) return "Fill in the account, amount and description.";
  if (kind === "transfer" && (!input.to || input.to === input.account)) return "Choose two different accounts.";
  return "";
}

/** The design's withdrawal and transfer soft warning (`fShortText`); saving is still allowed. */
export function shortWarning(kind: MoveKind, input: Pick<NewMoneyMove, "account" | "amount" | "fee">, balance: number): string {
  if (kind === "deposit" || !input.account) return "";
  return (input.amount || 0) + (input.fee || 0) > balance ? `This is more than the ${Math.round(balance).toLocaleString("en-KE")} KES in ${input.account}. You can still save it.` : "";
}

export async function recordDeposit(input: NewMoneyMove): Promise<Result<Deposit>> {
  const err = check("deposit", input);
  if (err) return fail(err);
  const store = getStore();
  const ref = nextRef(store.getState().accounts.deposits.map((d) => d.ref), "DEP-", 4);
  const desc = input.description.trim();
  const fee = Number(input.fee) || 0;
  const dep: Deposit = { ref, date: FIN_TODAY, account: input.account, method: input.method || "Cash", description: desc, amount: input.amount, status: { label: "Cleared", tone: "success" }, ...detail(fee, input) };
  const lines: LedgerEntry[] = [{ date: FIN_TODAY, account: input.account, ref, desc, kind: "Deposit", amt: input.amount }];
  if (fee) lines.push({ date: FIN_TODAY, account: input.account, ref, desc: "Bank fee", kind: "Fee", amt: -fee });
  store.setState((s) => {
    const n = postAll(s, lines);
    return { accounts: { ...n.accounts, deposits: [dep, ...n.accounts.deposits] } };
  });
  showToast("Deposit saved.");
  return ok(dep, "Deposit saved.");
}

export async function recordWithdrawal(input: NewMoneyMove): Promise<Result<Withdrawal>> {
  const err = check("withdrawal", input);
  if (err) return fail(err);
  const store = getStore();
  const ref = nextRef(store.getState().accounts.withdrawals.map((d) => d.ref), "WDL-", 4);
  const desc = input.description.trim();
  const fee = Number(input.fee) || 0;
  const wd: Withdrawal = {
    ref,
    date: FIN_TODAY,
    account: input.account,
    method: input.method || "Cash",
    purpose: (input.purpose ?? "").trim() || "—",
    description: desc,
    amount: input.amount,
    status: { label: "Completed", tone: "success" },
    ...detail(fee, input),
  };
  const lines: LedgerEntry[] = [{ date: FIN_TODAY, account: input.account, ref, desc, kind: "Withdrawal", amt: -input.amount }];
  if (fee) lines.push({ date: FIN_TODAY, account: input.account, ref, desc: "Bank fee", kind: "Fee", amt: -fee });
  store.setState((s) => {
    const n = postAll(s, lines);
    return { accounts: { ...n.accounts, withdrawals: [wd, ...n.accounts.withdrawals] } };
  });
  showToast("Withdrawal saved.");
  return ok(wd, "Withdrawal saved.");
}

export async function recordTransfer(input: NewMoneyMove): Promise<Result<MoneyTransfer>> {
  const err = check("transfer", input);
  if (err) return fail(err);
  const store = getStore();
  const ref = nextRef(store.getState().accounts.transfers.map((d) => d.ref), "TRN-", 4);
  const to = input.to!;
  const fee = Number(input.fee) || 0;
  const tr: MoneyTransfer = { ref, date: FIN_TODAY, from: input.account, to, description: input.description.trim(), amount: input.amount, status: { label: "Completed", tone: "success" }, ...detail(fee, input) };
  const lines: LedgerEntry[] = [
    { date: FIN_TODAY, account: input.account, ref, desc: `Transfer to ${to}`, kind: "Transfer", amt: -input.amount },
    { date: FIN_TODAY, account: to, ref, desc: `Transfer from ${input.account}`, kind: "Transfer", amt: input.amount },
  ];
  if (fee) lines.push({ date: FIN_TODAY, account: input.account, ref, desc: "Transfer fee", kind: "Fee", amt: -fee });
  store.setState((s) => {
    const n = postAll(s, lines);
    return { accounts: { ...n.accounts, transfers: [tr, ...n.accounts.transfers] } };
  });
  showToast("Transfer saved.");
  return ok(tr, "Transfer saved.");
}

function detail(fee: number, input: NewMoneyMove) {
  return { time: demoTime(), fee, bankRef: input.bankRef.trim(), notes: input.notes.trim(), who: who() };
}

/**
 * Reverse a deposit, withdrawal or transfer from its record view (design `doReverse`):
 * a deposit takes back the amount less its fee, a withdrawal returns the amount plus its fee, and a
 * transfer moves the amount back and returns its fee. Lines are kind "Reversal" dated 10 Nov 2026.
 */
export async function reverseMove(kind: MoveKind, ref: string): Promise<Result<void>> {
  const store = getStore();
  const a = store.getState().accounts;
  const list: (Deposit | Withdrawal | MoneyTransfer)[] = kind === "deposit" ? a.deposits : kind === "withdrawal" ? a.withdrawals : a.transfers;
  const m = list.find((x) => x.ref === ref);
  if (!m) return fail("That record is not in the list.");
  if (m.reversed) return fail(`${ref} is already reversed.`);
  const line = (account: string, amt: number): LedgerEntry => ({ date: DEMO_TODAY, account, ref, desc: `Reversal of ${ref}`, kind: "Reversal", amt });
  let lines: LedgerEntry[];
  let message: string;
  if (kind === "transfer") {
    const t = m as MoneyTransfer;
    lines = [line(t.to, -t.amount), line(t.from, t.amount + t.fee)];
    message = `${ref} reversed. Both balances updated.`;
  } else {
    const acc = (m as Deposit | Withdrawal).account;
    lines = [line(acc, kind === "deposit" ? -(m.amount - m.fee) : m.amount + m.fee)];
    message = `${ref} reversed. ${acc} balance updated.`;
  }
  const mark = <T extends Deposit | Withdrawal | MoneyTransfer>(rows: T[]): T[] =>
    rows.map((x) => (x.ref === ref ? { ...x, status: { label: "Reversed", tone: "danger" as const }, reversed: { when: fmtDate(DEMO_TODAY), who: who() } } : x));
  store.setState((s) => {
    const n = postAll(s, lines);
    const k = n.accounts;
    return { accounts: { ...k, deposits: kind === "deposit" ? mark(k.deposits) : k.deposits, withdrawals: kind === "withdrawal" ? mark(k.withdrawals) : k.withdrawals, transfers: kind === "transfer" ? mark(k.transfers) : k.transfers } };
  });
  showToast(message);
  return ok(undefined, message);
}
