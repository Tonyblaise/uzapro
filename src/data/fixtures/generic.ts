/**
 * Verbatim port of the `UZ_MODS` rows, form fields and card items for the standard list, form and
 * card screens (design/canvas/erp-data.js): Reports (cards), Team and Settings ›
 * Staff logins and Taxes. Keys are "{moduleId}/{tabSlug}".
 * Permissions moved to role cards in feature 011 (canvas rows: Owner / Admin 1 Full, Accountant 2
 * Edit, Cashier 4 Limited, Store / Inventory 3 Edit — see src/data/fixtures/permissions.ts).
 */
import type { GenericField, GenericRow, ReportCard } from "../types";
import { P } from "./_helpers";

import { REPORT_DESCRIPTIONS, REPORT_NAMES, REPORT_NOT_AVAILABLE, type ReportName } from "./reports";

/** Table rows, cells in column order (the columns live in src/config/modules.ts). */
export const GENERIC_ROWS: Readonly<Record<string, readonly GenericRow[]>> = {
  "ppl/team": [
    ["Tony Blaise", "Owner / Admin", "Nairobi HQ", P("Active", "good")],
    ["Grant Jensen", "Store keeper", "Nairobi HQ", P("Active", "good")],
    ["Mary Achieng", "Accountant", "Nairobi HQ", P("Active", "good")],
    ["Jane Smith", "Cashier", "New Jersey", P("Active", "good")],
  ],
  "set/staff-logins": [
    ["Tony Blaise", "Owner / Admin", "Nairobi HQ", P("Active", "good")],
    ["Grant Jensen", "Store keeper", "Nairobi HQ", P("Active", "good")],
    ["Mary Achieng", "Accountant", "Nairobi HQ", P("Active", "good")],
    ["Jane Smith", "Cashier", "New Jersey", P("Active", "good")],
  ],
  "set/taxes": [
    ["VAT", "16%", "Sales + purchase", P("Active", "good")],
    ["Zero-rated", "0%", "Sales", P("Active", "good")],
    ["Exempt", "—", "Sales", P("Active", "good")],
  ],
};

/** Form fields (read-only fixture). Reports › Build a report was removed in the design (v1794778583). */
export const GENERIC_FORMS: Readonly<Record<string, readonly GenericField[]>> = {};

/** A card per title: the design's description and whether a report exists for it (feature 009). */
const C = (titles: readonly string[]): ReportCard[] =>
  titles.map((title) => {
    const runnable = (REPORT_NAMES as readonly string[]).includes(title);
    return { title, desc: runnable ? REPORT_DESCRIPTIONS[title as ReportName] : REPORT_NOT_AVAILABLE, runnable };
  });

/** Report card titles per tab (read-only fixture); each runnable card opens its report. */
export const REPORT_CARDS: Readonly<Record<string, readonly ReportCard[]>> = {
  "rep/popular": C([
    "Sales summary",
    "Profit & loss",
    "Balance sheet",
    "Stock valuation",
    "VAT return",
    "Customer statements",
    "Purchase analysis",
    "Production yield",
  ]),
  "rep/sales": C(["Sales summary", "Sales by product", "Sales by customer", "Sales by channel", "Returns & refunds", "Sales targets"]),
  "rep/money": C(["Profit & loss", "Balance sheet", "Trial balance", "Cash flow", "VAT return", "Aged receivables"]),
  "rep/stock": C(["Stock valuation", "Stock movement", "Low stock", "Wastage", "Reorder forecast"]),
};

/** "New record" drawer Status options (design `create` drawer). */
export const NEW_RECORD_STATUSES = ["Not finished", "Active"] as const;
