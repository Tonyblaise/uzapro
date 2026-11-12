/** Receivables and Payables types (specs/003-receivables-payables/data-model.md). */
import type { Pill } from "./common";

export type Side = "rcv" | "pay";
export type Priority = "High" | "Normal" | "Low";

interface OwedBase {
  ref: string;
  /** Customer (receivables) or supplier (payables). */
  party: string;
  type: string;
  doc: string;
  due: string; // ISO
  priority: Priority;
  total: number;
  paid: number;
}

export interface Receivable extends OwedBase {
  raised: string; // ISO
  /** FR-016b: closed because its sale/invoice was voided. */
  voided: boolean;
}

export interface Payable extends OwedBase {
  branch: string;
  approval: "Waiting approval" | "Approved" | "Rejected";
}

export interface ReceivableRow extends Receivable {
  balance: number;
  status: Pill;
}

export interface PayableRow extends Payable {
  balance: number;
  status: Pill;
}

export type PaymentType = "Single" | "Bulk" | "Instalment";

export interface MoneyPayment {
  ref: string; // PAY-#### / VPMT-####
  date: string; // ISO
  party: string;
  alloc: Record<string, number>;
  method: string;
  account: string;
  payRef: string;
  type: PaymentType;
  amount: number;
  plan?: string;
  verification: Pill; // Verified / Pending / Unverified
}

export interface NewPayment {
  party: string;
  /** Selected open items (receivable/payable refs); the amount is applied to them oldest first. */
  selected: string[];
  amount: number;
  method: string;
  account: string;
  date: string;
  payRef: string;
  plan?: string;
  bulk?: boolean;
}

export interface Plan {
  ref: string; // PLN-#### / PPL-####
  party: string;
  target: string;
  total: number;
  each: number;
  count: number;
  paid: number;
  freq: string;
  start: string; // ISO
  status: Pill; // Active / Completed / Cancelled
}

export interface PlanRow extends Plan {
  progress: string; // "1 of 3 paid"
  nextDue: string; // display date or "—"
}

export interface NewPlan {
  target: string;
  count: number;
  freq: string;
  start: string;
}

export interface Credit {
  ref: string; // CRD-#### / SCR-####
  party: string;
  reason: string;
  issued: string; // display "10 Nov 2026"
  amount: number;
  used: number;
  currency: string;
  expires: string; // ISO or ""
  notes: string;
  payRef: string;
  voided: boolean;
}

export interface CreditRow extends Credit {
  left: number;
  status: Pill; // Available / Part used / Used up / Expired / Voided
}

export interface NewCredit {
  party: string;
  /** Customer: reason (source type) + why; supplier: source. */
  reason: string;
  why?: string;
  amount: number;
  currency?: string;
  expires?: string;
  notes?: string;
  payRef?: string;
}

export interface AgeingRow {
  party: string;
  open: number;
  notDue: number;
  d30: number;
  d60: number;
  d90: number;
  over90: number;
  total: number;
}

export interface StatementFilter {
  from: string;
  to: string;
  customer: string; // "All customers" or a name
}
