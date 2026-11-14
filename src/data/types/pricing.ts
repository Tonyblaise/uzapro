/** Wholesale pricing and customer credit (feature 012, specs/012-wholesale-pricing-credit/data-model.md). */

export interface CustomerGroup {
  /** `g-retail`, `g-wholesale`, `g-distributor`, then `g-{n}`. */
  id: string;
  name: string;
  /** Retail only: standard prices, no rename, no delete. */
  builtIn: boolean;
}

export interface PriceBreak {
  /** Quantity this price starts at (whole number, 1 or more). */
  from: number;
  price: number;
}

/** One group's price for a product variant and unit. Unique on group + product + variant + unit. */
export interface PriceEntry {
  group: string;
  product: string;
  variant: string;
  unit: string;
  /** Sorted by `from`, ascending. */
  breaks: PriceBreak[];
}

export type PayTerms = "Cash" | "7 days" | "14 days" | "30 days";

export type CreditStopReason = "cash" | "overdue" | "limit";

/** Recorded on a sale or invoice that was approved over a credit stop. */
export interface CreditApproval {
  by: string;
  /** "10 Nov 2026, 14:05" */
  at: string;
  reason: string;
  why: CreditStopReason;
  /** The amount over the limit, the overdue amount, or the credit amount for cash terms. */
  amount: number;
}

/** A customer's credit, worked out from their receivables (not stored). */
export interface CreditPosition {
  customer: string;
  /** null = no limit. */
  limit: number | null;
  owed: number;
  /** Open sales orders not yet invoiced (feature 013). */
  onOrder: number;
  /** Limit less what is owed and on order. null when there is no limit; never below zero. */
  available: number | null;
  overdue: number;
  /** The earliest overdue receivable. */
  oldest: { ref: string; doc: string; due: string } | null;
  terms: PayTerms;
}

export interface CreditStop {
  why: CreditStopReason;
  position: CreditPosition;
  /** The part of this sale put on credit. */
  amount: number;
  /** Amount over the limit, overdue amount, or the credit amount for cash terms. */
  over: number;
}

export interface LinePrice {
  price: number;
  source: "list" | "std";
  /** Group id, set when the group has an entry for this variant and unit. */
  group?: string;
  /** Set when the quantity is below the entry's first break. */
  hint?: { from: number; unit: string };
}

export interface PricingState {
  groups: CustomerGroup[];
  prices: PriceEntry[];
  /** Counter for new group ids. */
  groupNo: number;
}
