/**
 * Pure Receivables/Payables helpers — ports of the design's rcvBal/rcvStatus, payBal/payStatus,
 * ageing buckets, plan instalments and credit status (research R1–R5). Today = 10 Nov 2026.
 */
import { DEMO_TODAY, addDays } from "@/lib/demo-clock";
import type { AgeingRow, Credit, Payable, Pill, Plan, Receivable } from "./types";

const DAY = 86_400_000;
const t = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);

export function balance(x: { total: number; paid: number; voided?: boolean }): number {
  return x.voided ? 0 : Math.max(0, x.total - x.paid);
}

function owedStatus(x: { total: number; paid: number; due: string; voided?: boolean }): Pill {
  if (x.voided) return { label: "Voided", tone: "neutral" };
  if (!balance(x)) return { label: "Paid", tone: "success" };
  if (t(x.due) < t(DEMO_TODAY)) return { label: "Overdue", tone: "danger" };
  if (x.paid > 0) return { label: "Part paid", tone: "warning" };
  return { label: "Unpaid", tone: "neutral" };
}

export const rcvStatus = (r: Receivable): Pill => owedStatus(r);
export const payStatus = (p: Payable): Pill => owedStatus(p);

/** Whole days past due as of today (≤ 0 = not yet due). */
export function daysLate(due: string, today = DEMO_TODAY): number {
  return Math.floor((t(today) - t(due)) / DAY);
}

export type Bucket = "notDue" | "d30" | "d60" | "d90" | "over90";

export function ageBucket(due: string, today = DEMO_TODAY): Bucket {
  const late = daysLate(due, today);
  if (late <= 0) return "notDue";
  if (late <= 30) return "d30";
  if (late <= 60) return "d60";
  if (late <= 90) return "d90";
  return "over90";
}

/** Group open items by party into the design's age buckets. */
export function ageing(items: { party: string; due: string; balance: number }[]): AgeingRow[] {
  const by = new Map<string, AgeingRow>();
  for (const it of items) {
    if (it.balance <= 0) continue;
    const row = by.get(it.party) ?? { party: it.party, open: 0, notDue: 0, d30: 0, d60: 0, d90: 0, over90: 0, total: 0 };
    row.open += 1;
    row[ageBucket(it.due)] += it.balance;
    row.total += it.balance;
    by.set(it.party, row);
  }
  return [...by.values()];
}

/** Instalment amount: ceil(balance / count), count ≥ 2 (design `rcvPlan`). */
export function planEach(total: number, count: number): number {
  return count >= 2 ? Math.ceil(total / count) : 0;
}

/** Plan frequencies offered by the design's plan form. */
export const PLAN_FREQS = ["Weekly", "Monthly"] as const;

/** Step a date by the plan frequency n times (design `recStep`: monthly keeps the day, clamped). */
export function planStep(iso: string, freq: string, n = 1): string {
  if (freq === "Weekly") return addDays(iso, 7 * n);
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

export function planNextDue(p: Pick<Plan, "start" | "freq" | "paid" | "count">): string {
  return p.paid >= p.count ? "" : planStep(p.start, p.freq, p.paid);
}

export function creditLeft(c: Credit): number {
  return Math.max(0, c.amount - c.used);
}

export function creditExpired(c: Credit, today = DEMO_TODAY): boolean {
  return !!c.expires && c.expires < today;
}

/** Usable = not voided, not expired, something left. */
export function creditUsable(c: Credit): boolean {
  return !c.voided && !creditExpired(c) && creditLeft(c) > 0;
}

export function creditStatus(c: Credit): Pill {
  if (c.voided) return { label: "Voided", tone: "danger" };
  const left = creditLeft(c);
  if (left && creditExpired(c)) return { label: "Expired", tone: "neutral" };
  if (left) return c.used ? { label: "Part used", tone: "warning" } : { label: "Available", tone: "success" };
  return { label: "Used up", tone: "neutral" };
}
