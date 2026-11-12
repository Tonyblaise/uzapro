/**
 * Run reports — constants ported verbatim from the canvas `repRun()` and the report-card wiring
 * (`Uzapoint ERP.dc.html` v1794508919). Feature 009, data-model.md.
 */
import type { ReportPeriod } from "../types";

/** The 18 runnable reports, in the design's `case` order. */
export const REPORT_NAMES = [
  "Sales summary",
  "Sales by channel",
  "Sales by product",
  "Sales by customer",
  "Customer statements",
  "Returns & refunds",
  "Sales targets",
  "Profit & loss",
  "Balance sheet",
  "Trial balance",
  "Cash flow",
  "VAT return",
  "Aged receivables",
  "Purchase analysis",
  "Stock valuation",
  "Stock movement",
  "Low stock",
  "Wastage",
] as const;

export type ReportName = (typeof REPORT_NAMES)[number];

/** Card descriptions (design `desc` map); other cards read "Not available yet". */
export const REPORT_DESCRIPTIONS: Record<ReportName, string> = {
  "Sales summary": "Total sales, orders and refunds",
  "Sales by product": "Which products bring in the most",
  "Sales by customer": "Your biggest customers and what they owe",
  "Sales by channel": "POS, invoices and online compared",
  "Returns & refunds": "Credit notes issued in the period",
  "Sales targets": "Progress against each target",
  "Profit & loss": "Sales, costs, expenses and profit",
  "Balance sheet": "What the business owns and owes",
  "Trial balance": "Debits and credits by account",
  "Cash flow": "Money in and out of your accounts",
  "VAT return": "VAT on sales, VAT to claim, VAT to pay",
  "Aged receivables": "Money owed, by how late it is",
  "Customer statements": "Invoiced, paid and balance per customer",
  "Purchase analysis": "Spending with each supplier",
  "Stock valuation": "What your stock is worth",
  "Stock movement": "Stock in, out and transferred",
  "Low stock": "Items to reorder now",
  Wastage: "Damaged, expired and lost stock",
};

export const REPORT_NOT_AVAILABLE = "Not available yet";

/** Periods: date range and the scale applied to design-fixed figures (`range` and `sc`). */
export const REPORT_PERIODS: Record<ReportPeriod, { start: string; end: string; scale: number }> = {
  "This month": { start: "2026-11-01", end: "2026-11-10", scale: 1 },
  "Last month": { start: "2026-10-01", end: "2026-10-31", scale: 4.29 / 4.82 },
  "This year": { start: "2026-01-01", end: "2026-11-10", scale: 38.6 / 4.82 },
};

export const REPORT_PERIOD_NAMES = Object.keys(REPORT_PERIODS) as ReportPeriod[];

/** Figures the design fixes in `repRun`. */
export const REPORT_FIXED = {
  salesMonth: 4_820_000,
  ordersMonth: 1_100,
  stockValue: 2_650_000,
  purchasesMonth: 3_400_000,
  cogsRate: 0.58,
  costRate: 0.6,
  vatRate: 16 / 116,
  asAt: "2026-11-10",
  onTrack: 75,
} as const;

export const REPORT_DEFAULT_NOTE = "Built from the sample data in UzaPro. Figures update as you record sales, expenses and payments.";
export const REPORT_DEFAULT_EMPTY = "Nothing to show for this period.";
