/**
 * Reference lists for Integrations (feature 015). Nothing is configured in the seed: the business
 * connects its own M-Pesa account.
 */
import type { DarajaAccountType, IntegrationBank, IntegrationEnv, QbAccountField, QbFrequency, QbRecord } from "../types";

export const INTEGRATION_ENVS: readonly { value: IntegrationEnv; label: string }[] = [
  { value: "production", label: "Production (live)" },
  { value: "sandbox", label: "Sandbox (test)" },
];

export const DARAJA_ACCOUNT_TYPES: readonly { value: DarajaAccountType; label: string }[] = [
  { value: "paybill", label: "Paybill" },
  { value: "till", label: "Till (Buy Goods)" },
];

export const INTEGRATION_BANKS: readonly IntegrationBank[] = [
  { id: "ncba", name: "NCBA Bank", paybill: "880100", features: ["STK push", "Payment notifications", "QR code"], envs: ["production"] },
];

/** Where banks send payment notifications (demo address; nothing is sent). */
export const NOTIFY_BASE = "https://pay.uzapro.example";

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
  { value: "daily", label: "Once a day" },
];

/** The connected company's chart of accounts, by what each can be used for (demo list). */
export const QB_ACCOUNTS: Readonly<Record<QbAccountField, readonly string[]>> = {
  incomeAccount: ["Sales of Product Income", "Sales", "Services"],
  depositAccount: ["Undeposited Funds", "M-Pesa Till", "Bank Current Account", "Cash on hand"],
  expenseAccount: ["Operating Expenses", "Cost of Goods Sold", "Office Expenses"],
};

export const QB_ACCOUNT_LABEL: Readonly<Record<QbAccountField, string>> = {
  incomeAccount: "Income account for sales",
  depositAccount: "Deposit account for payments",
  expenseAccount: "Account for expenses",
};

/** The company ID the demo connection reports (nothing is contacted). */
export const QB_DEMO_COMPANY_ID = "9341 4520 1987 1234";
