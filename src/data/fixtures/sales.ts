/** Sales seed, ported verbatim from design/canvas/erp-data.js (UZ_MODS sales tabs, UZ_TARGETS). */
import { P } from "./_helpers";

/** "All sales": [Customer, Type, Channel, Total, Status] */
export const SALE_ROWS = [
  ["Morningview Bicycles", "Tax invoice", "In-store", "45,600", P("Paid", "good")],
  ["Apex Solutions", "Sales order", "Shopify", "158,996", P("Not finished", "info")],
  ["Alpha Systems", "Invoice", "Amazon", "53,976", P("Overdue", "bad")],
  ["Mountain Goats", "Quotation", "POS", "9,576", P("Pending", "warn")],
] as const;

/** The design numbers new sales from SAL-001185 (`_saleNo` starts at 1184). */
export const SALE_NO_START = 1184;

/** "Quotations": [Quotation #, Customer, Date, Status, Amount (KES)] */
export const QUOTATION_ROWS = [
  ["Q-001002", "Atlas Services", "28 Oct 2026", P("Not finished", "mut"), "424"],
  ["Q-001001", "Tech Innovators", "20 Oct 2026", P("Approved", "good"), "48,499"],
] as const;

/** "Invoices": [Invoice #, Customer, Invoice date, Due date, Status, Amount (KES), Balance due {pill, sub}] */
export const INVOICE_ROWS = [
  ["INV-0355", "Blazing Cycle Trails", "1 May 2026", "31 May 2026", P("Overdue", "bad"), "1,026", { pill: "1,026", sub: "Amount paid: 0" }],
  ["INV-0351", "Morningview", "28 Jan 2026", "27 Feb 2026", P("Pending", "warn"), "45,600", { pill: "45,600", sub: "Amount paid: 0" }],
  ["INV-0340", "Stateside Cycle", "1 Jan 2026", "31 Jan 2026", P("Paid", "good"), "21,432", { pill: "0", sub: "Amount paid: 21,432" }],
] as const;

/** "Refunds (credit notes)": [Credit note, Customer, Date, Invoice, Reason, Amount (KES), Status] */
export const CREDIT_NOTE_ROWS = [
  ["CRN-0007", "Morningview", "28 Oct 2026", "INV-0351", "Returned goods", "4,560", P("Approved", "good")],
  ["CRN-0006", "Stateside Cycle", "14 Oct 2026", "INV-0340", "Price adjustment", "1,200", P("Not finished", "mut")],
] as const;

/** "Voided items": [Void ref, Original sale, Customer, Voided on, Reason, Voided by, Amount (KES)] */
export const VOID_ROWS = [["VOID-0001", "INV-0333", "Alpha Systems", "22 Oct 2026", "Entered by mistake", "Tony Ashiuma", "12,400"]] as const;

/** UZ_TARGETS */
export const UZ_TARGETS = [
  { id: 1, name: "November store sales", scope: "Whole business", who: "", start: "2026-11-01", end: "2026-11-30", amount: 5000000, base: 3480000 },
  { id: 2, name: "Jane – November", scope: "Staff member", who: "Jane Smith", start: "2026-11-01", end: "2026-11-30", amount: 600000, base: 452000 },
  { id: 3, name: "Nairobi HQ – Q4", scope: "Branch", who: "Nairobi HQ", start: "2026-10-01", end: "2026-12-31", amount: 12000000, base: 7950000 },
  { id: 4, name: "October store sales", scope: "Whole business", who: "", start: "2026-10-01", end: "2026-10-31", amount: 4500000, base: 4820000 },
] as const;
