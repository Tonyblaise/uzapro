/**
 * Verbatim port of the `UZ_MODS` rows, form fields and card items for the standard list, form and
 * card screens (design/canvas/erp-data.js): Reports, Team, Permissions, Messages and Settings ›
 * Staff logins, Taxes, Connected apps, Import and export. Keys are "{moduleId}/{tabSlug}".
 */
import type { GenericField, GenericRow, ReportCard } from "../types";
import { P } from "./_helpers";

/** Table rows, cells in column order (the columns live in src/config/modules.ts). */
export const GENERIC_ROWS: Readonly<Record<string, readonly GenericRow[]>> = {
  "sup/how-to-guides": [
    ["Setting up a POS terminal", "Getting started", "1,240", P("Published", "good")],
    ["How to give a refund", "Sales", "860", P("Published", "good")],
    ["Reconciling a bank feed", "Finance", "540", P("Not finished", "mut")],
  ],
  "sup/help-requests": [
    ["TKT-1042", "POS printer not connecting", P("High", "bad"), P("Open", "info")],
    ["TKT-1041", "Stock count mismatch", P("Medium", "warn"), P("In progress", "info")],
    ["TKT-1038", "Invoice email not sending", P("Low", "mut"), P("Resolved", "good")],
  ],
  "sup/response-times": [
    ["High", "1 hour", "4 hours", "88%"],
    ["Medium", "4 hours", "1 day", "94%"],
    ["Low", "1 day", "3 days", "97%"],
  ],
  "rep/sent-automatically": [
    ["Daily sales", "Daily 6pm", "Owner", P("Active", "good")],
    ["Weekly P&L", "Mon 8am", "Finance", P("Active", "good")],
  ],
  "ppl/team": [
    ["Tony Ashiuma", "Owner / Admin", "Nairobi HQ", P("Active", "good")],
    ["Grant Jensen", "Store keeper", "Nairobi HQ", P("Active", "good")],
    ["Mary Achieng", "Accountant", "Nairobi HQ", P("Active", "good")],
    ["Jane Smith", "Cashier", "New Jersey", P("Active", "good")],
  ],
  "perm/permissions": [
    ["Owner / Admin", "1", "All", P("Full", "good")],
    ["Accountant", "2", "Finance + reports", P("Edit", "info")],
    ["Cashier", "4", "Sales (POS) + customers", P("Limited", "warn")],
    ["Store / Inventory", "3", "Inventory + products", P("Edit", "info")],
  ],
  "comm/saved-messages": [
    ["Order ready", "SMS", "name, ref", P("Active", "good")],
    ["Invoice due", "Email", "name, amount, due", P("Active", "good")],
    ["Welcome", "WhatsApp", "name", P("Not finished", "mut")],
  ],
  "comm/sent-messages": [
    ["31 Oct 09:12", "SMS", "248", "242", P("Delivered", "good")],
    ["30 Oct 16:40", "Email", "1,204", "1,180", P("Delivered", "good")],
  ],
  "comm/campaigns": [
    ["Back to school", "All customers", "4,200", "312", P("Done", "good")],
    ["Black Friday", "Gold + Silver", "—", "—", P("Scheduled", "info")],
  ],
  "comm/scheduled": [
    ["24 Nov 08:00", "SMS", "Black Friday", P("Queued", "warn")],
    ["01 Nov 09:00", "Email", "Statement reminder", P("Queued", "warn")],
  ],
  "set/staff-logins": [
    ["Tony Ashiuma", "Owner / Admin", "Nairobi HQ", P("Active", "good")],
    ["Grant Jensen", "Store keeper", "Nairobi HQ", P("Active", "good")],
    ["Mary Achieng", "Accountant", "Nairobi HQ", P("Active", "good")],
    ["Jane Smith", "Cashier", "New Jersey", P("Active", "good")],
  ],
  "set/taxes": [
    ["VAT", "16%", "Sales + purchase", P("Active", "good")],
    ["Zero-rated", "0%", "Sales", P("Active", "good")],
    ["Exempt", "—", "Sales", P("Active", "good")],
  ],
  "set/connected-apps": [
    ["M-Pesa", "Payments", P("Connected", "good")],
    ["Shopify", "Sales channel", P("Connected", "good")],
    ["SMS gateway", "Messaging", P("Connected", "good")],
    ["Amazon", "Sales channel", P("Connected", "good")],
  ],
};

/** `[label, value, 'ph'?, full?]` as in the design; 'ph' means the value is a placeholder. */
type FieldDef = readonly [label: string, value: string, ph?: "ph" | "", full?: 1];
const F = (defs: readonly FieldDef[]): GenericField[] =>
  defs.map(([label, value, ph, full]) => ({ label, value, placeholder: ph === "ph", full: full === 1 }));

/** Form fields (read-only fixture). */
export const GENERIC_FORMS: Readonly<Record<string, readonly GenericField[]>> = {
  "rep/build-a-report": F([
    ["Report name", "Weekly sales by rep", "ph"],
    ["Data source", "Sales"],
    ["Columns", "Rep, Net sales, Orders, Margin", "ph", 1],
    ["Group by", "Sales rep"],
    ["Date range", "This month"],
    ["Schedule", "Every Monday 8am"],
  ]),
  "comm/send-message": F([
    ["Channel", "SMS"],
    ["Audience", "Customers · 248 recipients"],
    ["Template", "Order ready"],
    ["Send", "Now"],
    ["Message", "Hi {{name}}, your order {{ref}} is ready for pickup.", "ph", 1],
  ]),
  "set/import-and-export": F([
    ["Action", "Import"],
    ["Record type", "Products"],
    ["File", "products.csv", "ph"],
    ["Mapping", "Auto-detected"],
    ["Mode", "Create & update"],
    ["Notes", "Dry run first", "ph", 1],
  ]),
};

const RUN = "Run, schedule or export";
const C = (titles: readonly string[]): ReportCard[] => titles.map((title) => ({ title, desc: RUN }));

/** Report card titles per tab (read-only fixture). Clicking a card does nothing in the design. */
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
