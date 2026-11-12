/**
 * Receivables and Payables seed, ported verbatim from design/canvas/erp-data.js
 * (UZ_MODS › rcv / pay rows, UZ_RCVDETAIL, UZ_PAYDETAIL, UZ_PLANDETAIL, UZ_SCDETAIL).
 */
import { P } from "./_helpers";

/** rcv › Receivables: [Ref, Customer, Type, Document, Due date, Priority, Total, Paid, (balance), (status)] */
export const RCV_ROWS = [
  ["RCV-0012", "Morningview Bicycles", "Invoice", "INV-0351", "27 Feb 2026", "High", "45,600", "0"],
  ["RCV-0011", "Blazing Cycle Trails", "Invoice", "INV-0355", "31 May 2026", "Normal", "1,026", "0"],
  ["RCV-0010", "Mountain Goats", "Sale on credit", "SAL-1184", "19 Nov 2026", "Normal", "68,400", "20,000"],
  ["RCV-0008", "Mountain Goats", "Invoice", "INV-0362", "5 Dec 2026", "Normal", "32,000", "0"],
  ["RCV-0009", "Pedal Point Ltd", "Opening balance", "—", "30 Sep 2026", "Low", "12,500", "12,500"],
  ["RCV-0007", "Mountain Goats", "Invoice", "INV-0344", "10 Oct 2026", "Normal", "30,000", "30,000"],
  ["RCV-0006", "Mountain Goats", "Invoice", "INV-0341", "1 Oct 2026", "Normal", "24,000", "24,000"],
] as const;

export const UZ_RCVDETAIL: Record<string, { raised: string }> = {
  "RCV-0012": { raised: "2026-01-28" },
  "RCV-0011": { raised: "2026-05-01" },
  "RCV-0010": { raised: "2026-10-20" },
  "RCV-0008": { raised: "2026-11-05" },
  "RCV-0009": { raised: "2026-09-01" },
  "RCV-0007": { raised: "2026-09-10" },
  "RCV-0006": { raised: "2026-09-01" },
};

/** rcv › Payments: [Ref, Date, Customer, Receivables, Method, Type, Amount, Verification] */
export const RCV_PAYMENT_ROWS = [
  ["PAY-0021", "8 Nov 2026", "Mountain Goats", "RCV-0010", "M-Pesa", "Single", "20,000", P("Verified", "good")],
  ["PAY-0020", "2 Oct 2026", "Pedal Point Ltd", "RCV-0009", "Bank transfer", "Single", "12,500", P("Verified", "good")],
  ["PAY-0019", "15 Oct 2026", "Mountain Goats", "RCV-0006, RCV-0007", "Bank transfer", "Bulk", "54,000", P("Verified", "good")],
] as const;

export const UZ_PAYDETAIL: Record<string, { account: string; payRef: string; alloc: Record<string, number> }> = {
  "PAY-0021": { account: "M-Pesa Till", payRef: "SKH7Q2M1VD", alloc: { "RCV-0010": 20000 } },
  "PAY-0020": { account: "Equity Bank — Main", payRef: "FT26275PPL", alloc: { "RCV-0009": 12500 } },
  "PAY-0019": { account: "Equity Bank — Main", payRef: "FT26288MGT", alloc: { "RCV-0006": 24000, "RCV-0007": 30000 } },
};

/** rcv › Payment plans: [Ref, Customer, Receivable, Total, (instalments), Each, (next due), Status] */
export const RCV_PLAN_ROWS = [["PLN-0003", "Morningview Bicycles", "RCV-0012", "45,600", "", "15,200", "", P("Active", "good")]] as const;

/** rcv › Customer credits: [Ref, Customer, Reason, Issued, Amount, Used, (left), (status)] */
export const CUSTOMER_CREDIT_ROWS = [
  ["CRD-0004", "Mountain Goats", "Returned faulty inner tubes", "3 Nov 2026", "4,800", "0"],
  ["CRD-0003", "Morningview Bicycles", "Goodwill discount", "12 Sep 2026", "2,000", "2,000"],
] as const;

/** pay › Payables: [Ref, Supplier, Type, Document, Branch, Due date, Priority, Total, Paid, (balance), Approval, (status)] */
export const PAYABLE_ROWS = [
  ["PYB-0014", "Eastside Bicycle Supplies", "Purchase order", "PUR-ORD-0409", "Nairobi HQ", "20 Nov 2026", "Normal", "79,560", "0", P("Approved", "good")],
  ["PYB-0013", "Magaliesburg Wheels", "Purchase order", "PUR-ORD-0408", "Nairobi HQ", "25 Oct 2026", "High", "34,200", "10,000", P("Approved", "good")],
  ["PYB-0012", "Road & Travel Tyres", "Bill", "BILL-2231", "Import", "30 Nov 2026", "Low", "12,800", "0", P("Waiting approval", "warn")],
  ["PYB-0011", "Eastside Bicycle Supplies", "Purchase order", "PUR-ORD-0401", "Nairobi HQ", "15 Oct 2026", "Normal", "45,000", "45,000", P("Approved", "good")],
  ["PYB-0010", "Eastside Bicycle Supplies", "Opening balance", "—", "Nairobi HQ", "30 Sep 2026", "Normal", "8,000", "8,000", P("Approved", "good")],
] as const;

/** pay › Payments: [Ref, Date, Supplier, Payables, Method, Type, Amount, Verification] */
export const PAY_PAYMENT_ROWS = [
  ["VPMT-0008", "6 Nov 2026", "Magaliesburg Wheels", "PYB-0013", "Cash", "Single", "10,000", P("Unverified", "warn")],
  ["VPMT-0007", "20 Oct 2026", "Eastside Bicycle Supplies", "PYB-0010, PYB-0011", "Bank transfer", "Bulk", "53,000", P("Verified", "good")],
] as const;

/** pay › Supplier credits: [Ref, Supplier, Source, Issued, Amount, Used, (left), (status)] */
export const SUPPLIER_CREDIT_ROWS = [["SCR-0002", "Magaliesburg Wheels", "Returned damaged wheels (PRT-0005)", "4 Nov 2026", "684", "0"]] as const;

export const UZ_SCDETAIL: Record<string, { expires: string; notes: string }> = {
  "SCR-0002": { expires: "2027-02-28", notes: "Credit note from supplier for PRT-0005" },
};

/** pay › Payment plans: [Ref, Supplier, Payable, Total, (instalments), Each, (next due), Status] */
export const PAY_PLAN_ROWS = [["PPL-0001", "Eastside Bicycle Supplies", "PYB-0014", "79,560", "", "39,780", "", P("Active", "good")]] as const;

export const UZ_PLANDETAIL: Record<string, { count: number; paid: number; freq: string; start: string }> = {
  "PLN-0003": { count: 3, paid: 0, freq: "Monthly", start: "2026-11-15" },
  "PPL-0001": { count: 2, paid: 0, freq: "Monthly", start: "2026-11-20" },
};

