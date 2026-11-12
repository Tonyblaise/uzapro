/**
 * Accounts seed, ported verbatim from design/canvas/erp-data.js
 * (UZ_MODS › fin rows, UZ_LEDGER, UZ_ACCDETAIL, UZ_BANKS, UZ_DEPDETAIL, UZ_WDDETAIL, UZ_TRDETAIL).
 */
import { P } from "./_helpers";

/** fin › Bank accounts: [Account, Bank or provider, Account number, Type, Balance] */
export const ACCOUNT_ROWS = [
  ["Equity Bank — Main", "Equity Bank", "0180 2948 3321", "Bank", "4,812,300"],
  ["M-Pesa Till", "Safaricom", "Till 524 118", "Mobile money", "386,450"],
  ["Cash drawer", "—", "—", "Cash", "24,600"],
] as const;

/** fin › Deposits: [Ref, Date, Account, Method, Description, Amount, Status] */
export const DEPOSIT_ROWS = [
  ["DEP-0218", "1 Nov 2026", "Equity Bank — Main", "Bank transfer", "Morningview Bicycles payment", "45,600", P("Cleared", "good")],
  ["DEP-0217", "31 Oct 2026", "M-Pesa Till", "M-Pesa", "Walk-in sales", "18,450", P("Cleared", "good")],
  ["DEP-0216", "30 Oct 2026", "Cash drawer", "Cash", "Walk-in sales", "9,200", P("Cleared", "good")],
] as const;

/** fin › Withdrawals: [Ref, Date, Account, Method, Purpose, Description, Amount, Status] */
export const WITHDRAWAL_ROWS = [
  ["WDL-0104", "1 Nov 2026", "Equity Bank — Main", "Bank transfer", "Operations", "Rent, Kilimani Properties", "185,000", P("Completed", "good")],
  ["WDL-0103", "30 Oct 2026", "M-Pesa Till", "M-Pesa", "Operations", "Electricity, Kenya Power", "42,300", P("Completed", "good")],
  ["WDL-0102", "28 Oct 2026", "Cash drawer", "Cash", "Operations", "Delivery fuel", "18,650", P("Completed", "good")],
] as const;

/** fin › Transfers: [Ref, Date, From, To, Description, Amount, Status] */
export const TRANSFER_ROWS = [
  ["TRN-0031", "31 Oct 2026", "M-Pesa Till", "Equity Bank — Main", "Weekly banking", "250,000", P("Completed", "good")],
  ["TRN-0030", "29 Oct 2026", "Cash drawer", "Equity Bank — Main", "Cash banking", "60,000", P("Completed", "good")],
] as const;

export const UZ_LEDGER = [
  { date: "2026-11-01", account: "Equity Bank — Main", ref: "DEP-0218", desc: "Morningview Bicycles payment", kind: "Deposit", amt: 45600 },
  { date: "2026-11-01", account: "Equity Bank — Main", ref: "WDL-0104", desc: "Rent, Kilimani Properties", kind: "Withdrawal", amt: -185000 },
  { date: "2026-10-31", account: "M-Pesa Till", ref: "TRN-0031", desc: "Transfer to Equity Bank — Main", kind: "Transfer", amt: -250000 },
  { date: "2026-10-31", account: "Equity Bank — Main", ref: "TRN-0031", desc: "Transfer from M-Pesa Till", kind: "Transfer", amt: 250000 },
  { date: "2026-10-31", account: "M-Pesa Till", ref: "DEP-0217", desc: "Walk-in sales", kind: "Deposit", amt: 18450 },
  { date: "2026-10-30", account: "Cash drawer", ref: "DEP-0216", desc: "Walk-in sales", kind: "Deposit", amt: 9200 },
  { date: "2026-10-30", account: "M-Pesa Till", ref: "WDL-0103", desc: "Electricity, Kenya Power", kind: "Withdrawal", amt: -42300 },
  { date: "2026-10-29", account: "Cash drawer", ref: "TRN-0030", desc: "Transfer to Equity Bank — Main", kind: "Transfer", amt: -60000 },
  { date: "2026-10-29", account: "Equity Bank — Main", ref: "TRN-0030", desc: "Transfer from Cash drawer", kind: "Transfer", amt: 60000 },
  { date: "2026-10-28", account: "Cash drawer", ref: "WDL-0102", desc: "Delivery fuel", kind: "Withdrawal", amt: -18650 },
] as const;

export const UZ_ACCDETAIL: Record<string, { branch: string; till: string; opening: number; branchName: string; swift: string; iban: string; active: boolean }> = {
  "Equity Bank — Main": { branch: "Nairobi HQ", till: "All tills", opening: 4500000, branchName: "Westlands", swift: "EQBLKENA", iban: "", active: true },
  "M-Pesa Till": { branch: "Nairobi HQ", till: "Till 1", opening: 200000, branchName: "", swift: "", iban: "", active: true },
  "Cash drawer": { branch: "Nairobi HQ", till: "Till 1", opening: 20000, branchName: "", swift: "", iban: "", active: true },
};

export const UZ_BANKS = ["Equity Bank", "KCB Bank", "Co-operative Bank", "NCBA Bank", "Absa Bank Kenya", "Stanbic Bank", "Standard Chartered", "I&M Bank", "Family Bank", "DTB Bank", "Safaricom M-Pesa", "Airtel Money"];

type MoveDetail = { time: string; fee: number; bankRef: string; notes: string; who: string };

export const UZ_DEPDETAIL: Record<string, MoveDetail> = {
  "DEP-0218": { time: "10:42", fee: 0, bankRef: "FT26305XK81", notes: "Payment for invoice INV-0412.", who: "Tony Blaise" },
  "DEP-0217": { time: "18:05", fee: 0, bankRef: "", notes: "", who: "Mercy Wanjiru" },
  "DEP-0216": { time: "17:30", fee: 0, bankRef: "", notes: "End of day cash.", who: "Mercy Wanjiru" },
};

export const UZ_WDDETAIL: Record<string, MoveDetail> = {
  "WDL-0104": { time: "09:20", fee: 105, bankRef: "FT26305RNT1", notes: "November rent.", who: "Tony Blaise" },
  "WDL-0103": { time: "15:40", fee: 0, bankRef: "SKB2QX81LM", notes: "", who: "Mary Achieng" },
  "WDL-0102": { time: "08:10", fee: 0, bankRef: "", notes: "Fuel for the delivery van.", who: "Grant Jensen" },
};

export const UZ_TRDETAIL: Record<string, MoveDetail> = {
  "TRN-0031": { time: "17:45", fee: 33, bankRef: "SKN8Q2TR31", notes: "Weekly M-Pesa sweep to the bank.", who: "Mary Achieng" },
  "TRN-0030": { time: "16:10", fee: 0, bankRef: "", notes: "", who: "Tony Blaise" },
};

/** Account types offered by the edit form (`aTypes`) and the new-account modal (`fTypes`). */
export const ACCOUNT_TYPES_EDIT = ["Bank", "Mobile money", "Cash", "Petty cash"] as const;
export const ACCOUNT_TYPES_NEW = ["Bank", "Mobile money", "Cash"] as const;
export const ACCOUNT_TILLS = ["All tills", "Till 1", "Till 2", "Till 3"];
