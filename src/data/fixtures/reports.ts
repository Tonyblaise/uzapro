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

/** Preset ranges (design `repRange` P), ending on the demo day 10 Nov 2026. */
export const REPORT_PERIODS: Record<Exclude<ReportPeriod, "Custom range">, [start: string, end: string]> = {
  Today: ["2026-11-10", "2026-11-10"],
  Yesterday: ["2026-11-09", "2026-11-09"],
  "This week": ["2026-11-09", "2026-11-10"],
  "Last 7 days": ["2026-11-04", "2026-11-10"],
  "Last week": ["2026-11-02", "2026-11-08"],
  "This month": ["2026-11-01", "2026-11-10"],
  "Last month": ["2026-10-01", "2026-10-31"],
  "Last 30 days": ["2026-10-12", "2026-11-10"],
  "This quarter": ["2026-10-01", "2026-11-10"],
  "Last quarter": ["2026-07-01", "2026-09-30"],
  "Last 6 months": ["2026-05-11", "2026-11-10"],
  "This year": ["2026-01-01", "2026-11-10"],
};

/** The design's period list, in order. */
export const REPORT_PERIOD_NAMES: readonly ReportPeriod[] = [
  "Today",
  "Yesterday",
  "This week",
  "Last week",
  "Last 7 days",
  "This month",
  "Last month",
  "Last 30 days",
  "This quarter",
  "Last quarter",
  "Last 6 months",
  "This year",
  "Custom range",
];

/** Periods whose sales scale the design fixes (`fixed`); others add up the daily rate below. */
export const REPORT_FIXED_SCALE: Partial<Record<ReportPeriod, number>> = { "This month": 1, "Last month": 4.29 / 4.82, "This year": 38.6 / 4.82 };

/** Sales per day, KES millions, by month (design `daily`); months before May use 2.6M a month. */
export const REPORT_DAILY: Record<string, number> = {
  "2026-11": 0.482,
  "2026-10": 4.29 / 31,
  "2026-09": 4.1 / 30,
  "2026-08": 3.9 / 31,
  "2026-07": 3.4 / 31,
  "2026-06": 3.1 / 30,
  "2026-05": 2.9 / 31,
};
export const REPORT_DAILY_OTHER = 2.6 / 30;

/**
 * Extra sample figures used only by Reports so every chart has something to show (design
 * `UZ_REPDEMO`). Dates are ISO here; the design stores display dates.
 */
export const REPORT_DEMO = {
  /** [credit note, customer, date, invoice, reason, amount] */
  refunds: [
    ["CRN-0015", "Mountain Goats", "2026-11-09", "INV-0364", "Returned goods", 12400],
    ["CRN-0014", "Walk-in customer", "2026-11-08", "SAL-1179", "Faulty item", 3800],
    ["CRN-0013", "Blazing Cycle Trails", "2026-11-06", "INV-0360", "Damaged on delivery", 8650],
    ["CRN-0012", "Stateside Cycle", "2026-11-04", "INV-0357", "Wrong item sent", 5200],
    ["CRN-0011", "Walk-in customer", "2026-11-03", "SAL-1161", "Returned goods", 2900],
    ["CRN-0010", "Morningview", "2026-11-02", "INV-0356", "Price adjustment", 1500],
    ["CRN-0009", "Mountain Goats", "2026-10-22", "INV-0349", "Faulty item", 9700],
    ["CRN-0008", "Walk-in customer", "2026-10-17", "SAL-1102", "Returned goods", 4100],
    ["CRN-0005", "Blazing Cycle Trails", "2026-09-19", "INV-0331", "Damaged on delivery", 15200],
    ["CRN-0004", "Stateside Cycle", "2026-08-02", "INV-0318", "Wrong item sent", 6300],
    ["CRN-0003", "Walk-in customer", "2026-06-11", "SAL-0870", "Returned goods", 3400],
    ["CRN-0002", "Morningview", "2026-04-20", "INV-0290", "Faulty item", 11800],
    ["CRN-0001", "Mountain Goats", "2026-02-09", "INV-0261", "Price adjustment", 2500],
  ] as const,
  /** [date, product, variant, type, store, change, balance, by, reference] */
  moves: [
    ["2026-11-10", "Helmet", "M", "Sold", "Point of Sale", -6, 38, "Grant Mwangi", "SAL-1188"],
    ["2026-11-09", "Bike Pump", "—", "Received", "Main Store", 40, 70, "Mary Wanjiku", "GRN-0144"],
    ["2026-11-08", "Racing Wheelset", "—", "Sold", "Main Store", -3, 13, "Jane Smith", "INV-0365"],
    ["2026-11-07", "Aluminium Frame", "L", "Received", "Main Store", 25, 165, "Mary Wanjiku", "GRN-0143"],
    ["2026-11-07", "Groupset", "—", "Transferred", "Stores", -8, 27, "Mary Wanjiku", "TRF-0052"],
    ["2026-11-06", "Carbon Sole Shoes", "42", "Sold", "Point of Sale", -5, 28, "Grant Mwangi", "SAL-1176"],
    ["2026-11-05", "Muthokinju Paint", "—", "Wasted", "Point of Sale", -4, 12, "Mary Wanjiku", "WST-0008"],
    ["2026-11-04", "Helmet", "L", "Received", "Point of Sale", 30, 44, "Mary Wanjiku", "GRN-0141"],
    ["2026-11-03", "Aluminium Frame", "M", "Sold", "Point of Sale", -7, 5, "Grant Mwangi", "SAL-1160"],
    ["2026-10-28", "Carbon Road Frame", "56cm", "Received", "Finished Goods", 60, 100, "Mary Wanjiku", "GRN-0138"],
    ["2026-10-24", "Bike Pump", "—", "Sold", "Point of Sale", -12, 28, "Grant Mwangi", "SAL-1121"],
    ["2026-10-19", "Helmet", "M", "Sold", "Point of Sale", -9, 14, "Grant Mwangi", "SAL-1109"],
    ["2026-10-12", "Racing Wheelset", "—", "Received", "Main Store", 10, 16, "Mary Wanjiku", "GRN-0133"],
    ["2026-10-05", "Groupset", "—", "Sold", "Stores", -6, 35, "Jane Smith", "INV-0341"],
  ] as const,
  /** Ledger lines added to Cash flow: { date, kind, amt } */
  ledger: [
    { date: "2026-11-10", kind: "Customer payments", amt: 184500 },
    { date: "2026-11-09", kind: "Customer payments", amt: 96200 },
    { date: "2026-11-08", kind: "M-Pesa sales", amt: 212800 },
    { date: "2026-11-07", kind: "Supplier payments", amt: -148000 },
    { date: "2026-11-06", kind: "M-Pesa sales", amt: 176400 },
    { date: "2026-11-05", kind: "Salaries", amt: -96000 },
    { date: "2026-11-05", kind: "Customer payments", amt: 62000 },
    { date: "2026-11-04", kind: "Expenses", amt: -23400 },
    { date: "2026-11-03", kind: "M-Pesa sales", amt: 158300 },
    { date: "2026-11-02", kind: "Supplier payments", amt: -87500 },
    { date: "2026-11-02", kind: "Loan repayment", amt: -45000 },
    { date: "2026-10-30", kind: "Salaries", amt: -312000 },
    { date: "2026-10-28", kind: "M-Pesa sales", amt: 1240000 },
    { date: "2026-10-25", kind: "Customer payments", amt: 860000 },
    { date: "2026-10-20", kind: "Supplier payments", amt: -920000 },
    { date: "2026-10-15", kind: "Expenses", amt: -118000 },
    { date: "2026-10-10", kind: "Loan repayment", amt: -45000 },
    { date: "2026-10-05", kind: "Deposit", amt: 150000 },
    { date: "2026-09-28", kind: "M-Pesa sales", amt: 4900000 },
    { date: "2026-07-15", kind: "Customer payments", amt: 8600000 },
    { date: "2026-06-20", kind: "Supplier payments", amt: -7800000 },
    { date: "2026-05-30", kind: "Salaries", amt: -2400000 },
    { date: "2026-04-15", kind: "Expenses", amt: -940000 },
    { date: "2026-03-10", kind: "Loan repayment", amt: -360000 },
  ] as const,
  /** Monthly expenses added to Profit & loss, scaled by days / 30. */
  expMonth: { Salaries: 312000, Electricity: 28500, "Transport & fuel": 41200, "Internet & phone": 9800, Marketing: 36000, "Repairs & maintenance": 17400 } as Record<string, number>,
  /** [ref, item, qty, reason, value] — added to Wastage whatever the period, as in the design. */
  wastage: [
    ["WST-0005", "Helmet", "3", "Damaged", 2949],
    ["WST-0004", "Bike Pump", "6", "Faulty", 1242],
    ["WST-0003", "Acrylic Paint", "9", "Expired", 4203],
    ["WST-0002", "Inner Tube", "14", "Damaged", 3220],
    ["WST-0001", "Jersey", "1", "Lost", 1550],
  ] as const,
};

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
