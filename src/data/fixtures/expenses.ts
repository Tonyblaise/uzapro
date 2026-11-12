/**
 * Expenses seed, ported verbatim from design/canvas/erp-data.js
 * (UZ_MODS › exp rows, UZ_EXPCAT, UZ_EXPDETAIL, UZ_RECDETAIL, UZ_EXPTREND).
 */
import { P } from "./_helpers";

/** exp › Expenses: [Ref, Date, Category, Payee, Source account, Reason, Tax, Amount, Status] */
export const EXPENSE_ROWS = [
  ["EXP-0043", "5 Nov 2026", "Internet and phone", "Safaricom Home Fibre", "M-Pesa Till", "Office internet", "897", "6,500", P("Waiting approval", "warn")],
  ["EXP-0042", "1 Nov 2026", "Rent", "Kilimani Properties", "Equity Bank — Main", "Shop and office rent", "0", "185,000", P("Paid", "good")],
  ["EXP-0041", "30 Oct 2026", "Utilities", "Kenya Power", "M-Pesa Till", "Electricity", "5,834", "42,300", P("Paid", "good")],
  ["EXP-0040", "28 Oct 2026", "Transport", "TotalEnergies Westlands", "Cash drawer", "Delivery fuel", "2,572", "18,650", P("Paid", "good")],
] as const;

/** exp › Recurring: [Ref, Name, Category, Paid from, Amount, Repeats, Next date, Status] */
export const RECURRING_ROWS = [
  ["REC-0003", "Monthly shop rent", "Rent", "Equity Bank — Main", "185,000", "Every month", "1 Dec 2026", P("Active", "good")],
  ["REC-0002", "Office internet", "Internet and phone", "M-Pesa Till", "6,500", "Every month", "5 Dec 2026", P("Active", "good")],
  ["REC-0001", "Night security", "Security", "Cash drawer", "12,000", "Every 2 weeks", "—", P("Paused", "mut")],
] as const;

/** exp › Voided: [Ref, Date, Category, Payee, Amount, Voided on, Voided by, Reason] */
export const VOIDED_ROWS = [["EXP-0039", "25 Oct 2026", "Office supplies", "Text Book Centre", "3,200", "26 Oct 2026", "Tony Ashiuma", "Recorded twice"]] as const;

export const UZ_EXPCAT: Record<string, { color: string; parent: string; desc: string; budget: number; approval: boolean; active: boolean }> = {
  Rent: { color: "#2563EB", parent: "", desc: "Shop, office and store rent", budget: 200000, approval: false, active: true },
  Utilities: { color: "#D97706", parent: "", desc: "Electricity and water", budget: 60000, approval: false, active: true },
  Transport: { color: "#059669", parent: "", desc: "Fuel, deliveries and fares", budget: 40000, approval: false, active: true },
  "Internet and phone": { color: "#7C3AED", parent: "Utilities", desc: "Fibre, airtime and data", budget: 10000, approval: true, active: true },
  "Salaries and wages": { color: "#DC2626", parent: "", desc: "Staff pay and casual labour", budget: 0, approval: true, active: true },
  "Office supplies": { color: "#0891B2", parent: "", desc: "Stationery and cleaning items", budget: 8000, approval: false, active: true },
  Security: { color: "#4B5563", parent: "", desc: "Guards and alarm services", budget: 30000, approval: false, active: true },
  "Repairs and maintenance": { color: "#DB2777", parent: "", desc: "Fixing equipment and premises", budget: 0, approval: true, active: true },
};

export const UZ_EXPDETAIL: Record<string, { branch: string; method: string; payRef: string }> = {
  "EXP-0043": { branch: "Nairobi HQ", method: "M-Pesa", payRef: "SKD4H2LQ9P" },
  "EXP-0042": { branch: "Nairobi HQ", method: "Bank transfer", payRef: "FT26305RENT" },
  "EXP-0041": { branch: "Nairobi HQ", method: "M-Pesa", payRef: "SKA81JQ2ZX" },
  "EXP-0040": { branch: "Nairobi HQ", method: "Cash", payRef: "" },
};

export const UZ_RECDETAIL: Record<
  string,
  { freq: "Daily" | "Weekly" | "Monthly" | "Yearly"; interval: number; day: string; start: string; end: string; max: string; auto: boolean; made: number; payee: string; method: string; tax: number; reason: string }
> = {
  "REC-0003": { freq: "Monthly", interval: 1, day: "1", start: "2026-01-01", end: "", max: "", auto: true, made: 10, payee: "Kilimani Properties", method: "Bank transfer", tax: 0, reason: "Shop and office rent" },
  "REC-0002": { freq: "Monthly", interval: 1, day: "5", start: "2026-03-05", end: "", max: "", auto: false, made: 8, payee: "Safaricom Home Fibre", method: "M-Pesa", tax: 897, reason: "Office internet" },
  "REC-0001": { freq: "Weekly", interval: 2, day: "", start: "2026-06-01", end: "", max: "", auto: true, made: 11, payee: "Shield Guards Ltd", method: "Cash", tax: 0, reason: "Night guard" },
};

export const UZ_EXPTREND: readonly (readonly [string, number])[] = [
  ["Jun", 268000],
  ["Jul", 301500],
  ["Aug", 284200],
  ["Sep", 312800],
  ["Oct", 296400],
];

/** Swatches offered by the category form (`ec.swatches`). */
export const CATEGORY_SWATCHES = ["#059669", "#2563EB", "#7C3AED", "#DB2777", "#DC2626", "#D97706", "#0891B2", "#4B5563"];
export const RECURRING_FREQS = ["Daily", "Weekly", "Monthly", "Yearly"] as const;
