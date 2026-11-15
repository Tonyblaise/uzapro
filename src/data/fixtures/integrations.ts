/**
 * Reference lists and seed for Integrations (feature 015, redesigned in feature 026 from the design's
 * `UZ_INTEG`): M-Pesa is set up on a Till, with today's payments; no bank linked (only NCBA can be);
 * QuickBooks not connected.
 */
import type { BankLink, DarajaAccountType, DarajaConfig, IntegrationEnv, MpesaPayment, QbAccountField, QbFrequency, QbRecord } from "../types";

export const INTEGRATION_ENVS: readonly { value: IntegrationEnv; label: string }[] = [
  { value: "production", label: "Production (live)" },
  { value: "sandbox", label: "Sandbox" },
];

export const DARAJA_ACCOUNT_TYPES: readonly { value: DarajaAccountType; label: string }[] = [
  { value: "paybill", label: "Paybill" },
  { value: "till", label: "Till (Buy Goods)" },
];

/**
 * Banks whose Paybill takes M-Pesa payments into a business account. The design lists six; only
 * NCBA can be added for now (user decision, specs/026 › Design deviations).
 */
export const BANK_PAYBILLS: readonly { bank: string; paybill: string }[] = [{ bank: "NCBA", paybill: "880100" }];

export const BANK_FEEDS = ["Bank API (instant)", "Daily statement upload"] as const;

/** Design `UZ_INTEG.mpesa.creds['Whole business']`: a live Till, tested, payment URLs registered. */
export const DARAJA_SEED: DarajaConfig = {
  scope: "all",
  env: "production",
  accountType: "till",
  paybill: "",
  // The design asks only for the Till; STK requests on a Till use the head office store number.
  storeNumber: "524118",
  tillNumber: "524118",
  accountNumber: "",
  terminalAccounts: [],
  initiatorName: "",
  secretsSet: { consumerKey: true, consumerSecret: true, passkey: true, initiatorPassword: false },
  tested: true,
  urlsRegistered: true,
};

/** Design `UZ_INTEG.mpesa.tx`, newest first. */
export const MPESA_PAYMENT_SEED: MpesaPayment[] = [
  { date: "2026-11-10", time: "12:41", code: "SKM4R8TQ1Z", name: "GRACE WANJIRU", phone: "0722 *** 410", via: "Paid to Till", amount: 68400, match: "" },
  { date: "2026-11-10", time: "11:52", code: "SKB7Q2LM0P", name: "JOHN KARIUKI", phone: "0712 *** 118", via: "Payment request (POS)", amount: 4858, match: "SAL-POS-0005 · Morningview Bicycles" },
  { date: "2026-11-10", time: "10:58", code: "SKC3H8TT2R", name: "PAUL OMONDI", phone: "0703 *** 552", via: "Payment request (POS)", amount: 4485, match: "SAL-POS-0003 · Walk-in Customer" },
  { date: "2026-11-10", time: "09:32", code: "SKA1B2C3D4", name: "MERCY ATIENO", phone: "0790 *** 231", via: "Payment request (POS)", amount: 467, match: "SAL-POS-0001 · Walk-in Customer" },
  { date: "2026-11-10", time: "08:30", code: "SKJ8T2PL0Q", name: "SAMUEL KIMANI", phone: "0723 *** 902", via: "Paid to Till", amount: 13800, match: "FS-0110 · Walk-in Customer" },
  { date: "2026-11-09", time: "16:05", code: "SKH6D1VW8E", name: "ALPHA SYSTEMS LTD", phone: "0701 *** 210", via: "Paid to Till", amount: 1026, match: "" },
];

/** No bank is linked at the start: the design's Equity Bank link isn't a bank that can be added. */
export const BANK_LINK_SEED: BankLink[] = [];

/** The QuickBooks company the demo sign-in offers, by environment (nothing is contacted). */
export const QB_COMPANIES: Readonly<Record<IntegrationEnv, { name: string; sub: string; id: string }>> = {
  production: { name: "Build by Blaise", sub: "QuickBooks Online Plus · KES", id: "9341 4520 1987 1234" },
  sandbox: { name: "Sandbox Company_KE", sub: "QuickBooks test company · KES", id: "9130 3577 4410 0001" },
};

/** QuickBooks: what can be sent, in the order the form lists it. */
export const QB_RECORDS: readonly { id: QbRecord; label: string; hint: string; account?: QbAccountField }[] = [
  { id: "invoices", label: "Invoices", hint: "Each invoice, with its lines and VAT.", account: "incomeAccount" },
  { id: "payments", label: "Payments received", hint: "Customer payments, matched to their invoices.", account: "depositAccount" },
  { id: "customers", label: "Customers", hint: "Names and contact details." },
  { id: "products", label: "Products", hint: "Names and selling prices, as items." },
  { id: "expenses", label: "Expenses", hint: "Recorded expenses, by category.", account: "expenseAccount" },
];

export const QB_FREQUENCIES: readonly { value: QbFrequency; label: string }[] = [
  { value: "manual", label: "Only when I choose Sync now" },
  { value: "hourly", label: "Every hour" },
  { value: "daily", label: "Every day at 6pm" },
];

/** The connected company's chart of accounts, by what each can be used for (demo list). */
export const QB_ACCOUNTS: Readonly<Record<QbAccountField, readonly string[]>> = {
  incomeAccount: ["Sales of Product Income", "Services", "Other Income"],
  depositAccount: ["Undeposited Funds", "M-Pesa", "Equity Bank", "Cash on hand"],
  expenseAccount: ["Operating Expenses", "Cost of Goods Sold", "Office Expenses"],
};

export const QB_ACCOUNT_LABEL: Readonly<Record<QbAccountField, string>> = {
  incomeAccount: "Income account for sales",
  depositAccount: "Deposit account for payments",
  expenseAccount: "Account for expenses",
};

