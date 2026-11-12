import type { Pill } from "./common";
import type { Discount } from "@/lib/totals";

export interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
  status: Pill;
}

export interface NewCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface SaleLine {
  product: string;
  variant: string;
  unit: string;
  qty: number;
  price: number;
  taxable: boolean;
}

export interface Payment {
  method: string;
  ref: string;
  date: string; // display string, as in the design ("10 Nov 2026, 14:05")
  amount: number;
}

export interface Sale {
  /** Seed rows from the design have no reference; they get SAL-0011xx refs in seed order. */
  ref: string;
  customer: string;
  type: string; // Tax invoice, Sales order, Invoice, Quotation, Sale
  channel: string; // In-store, Shopify, Amazon, POS
  store: string;
  date: string; // ISO
  time: string;
  lines: SaleLine[];
  payments: Payment[];
  subtotal: number;
  vat: number;
  total: number;
  status: Pill;
  by: string;
  /** True for sales recorded during this session (their stock returns on void). */
  session: boolean;
}

export interface NewSale {
  customer: string;
  lines: SaleLine[];
  payMethod: string; // one of UZ_PAYMETHODS or "Pay later (credit)"
  payRef?: string;
}

export interface DocLine {
  description: string;
  qty: number;
  unit: string;
  rate: number;
  taxable: boolean;
}

export interface Quotation {
  number: string;
  customer: string;
  date: string; // ISO
  due: string;
  store: string;
  lines: DocLine[];
  discount: Discount;
  notes: string;
  terms: string;
  status: Pill;
  amount: number;
  /** Set when "Save and approve" or Approve is used ("10 Nov 2026, 14:05"). */
  approvedAt?: string;
  /** Payment method text ("Bank name and account number, or M-Pesa paybill"). */
  pay?: string;
  /** Quotations: the invoice it was converted to. */
  convertedTo?: string;
}

export interface Invoice extends Omit<Quotation, "number"> {
  number: string;
  paid: number;
}

export interface NewDocument {
  kind: "quote" | "invoice";
  customer: string;
  date: string;
  due: string;
  store: string;
  lines: DocLine[];
  discount: Discount;
  notes: string;
  terms: string;
  /** Payment method text box ("Bank name and account number, or M-Pesa paybill"). */
  pay?: string;
  /** "Save and approve". */
  approve?: boolean;
  /** Quotation number this invoice is converted from. */
  convertedFrom?: string;
}

/** The design's credit-note variant of the document form (`qKind === 'credit'`). */
export interface NewCreditDocument {
  customer: string;
  date: string;
  store: string;
  lines: DocLine[];
  discount: Discount;
  notes: string;
  refInv: string;
  reason: string;
  refundMethod: string;
  returnToStock: boolean;
  approve: boolean;
}

export interface CreditItem {
  product: string;
  variant: string;
  sold: number;
  credited: number;
  qty: number;
  unitPrice: number; // VAT-inclusive, from the sale's line
  /** Line price before VAT, from the sale. */
  price?: number;
  unit?: string;
}

export interface CreditNote {
  number: string;
  customer: string;
  date: string; // ISO
  source: string; // invoice or sale ref
  items: CreditItem[];
  reason: string;
  notes: string;
  returnToStock: boolean;
  refundMethod: string;
  amount: number;
  status: Pill;
  /** Raised from a sale: Full or Partial. */
  scope?: string;
  /** "10 Nov 2026, 14:05" */
  raisedAt?: string;
  approvedAt?: string;
  /** How the money goes back: cash, credit (customer credit) or original method. */
  moneyBack?: "cash" | "credit" | "original";
  /** Store the goods return to. */
  store?: string;
  /** Lines when raised from the document form. */
  lines?: DocLine[];
  discount?: Discount;
}

export interface NewCreditNote {
  source: string;
  customer: string;
  items: CreditItem[];
  reason: string;
  notes: string;
  returnToStock: boolean;
  refundMethod: string;
  moneyBack?: "cash" | "credit" | "original";
  scope?: string;
  store?: string;
}

export interface VoidRecord {
  ref: string;
  original: string;
  customer: string;
  date: string; // ISO
  reason: string;
  by: string;
  amount: number;
  /** The sale as it was when voided (sale view after voiding). */
  sale?: Sale;
}

export interface SalesTarget {
  id: number;
  name: string;
  scope: "Whole business" | "Branch" | "Staff member";
  who: string;
  start: string;
  end: string;
  amount: number;
  base: number;
}

export interface NewTarget {
  name: string;
  scope: SalesTarget["scope"];
  who: string;
  start: string;
  end: string;
  amount: number;
}
