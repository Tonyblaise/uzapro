/** Payment integrations (feature 015, specs/015-integrations/data-model.md). */

/** Business-wide, or one terminal's id. */
export type IntegrationScope = "all" | number;

export type IntegrationEnv = "production" | "sandbox";

export type DarajaAccountType = "paybill" | "till";

/** A terminal's own Paybill account number. */
export interface TerminalAccount {
  terminalId: number;
  accountNumber: string;
}

/** Which secrets have been saved. The values themselves are never kept. */
export interface DarajaSecretsSet {
  consumerKey: boolean;
  consumerSecret: boolean;
  passkey: boolean;
  initiatorPassword: boolean;
}

export interface DarajaConfig {
  scope: IntegrationScope;
  env: IntegrationEnv;
  accountType: DarajaAccountType;
  /** Paybill only. */
  paybill: string;
  /** Till only: the head office store number STK requests use. */
  storeNumber: string;
  /** Till only. */
  tillNumber: string;
  /** Paybill only; "" means each sale's number. */
  accountNumber: string;
  /** Paybill, business-wide only. */
  terminalAccounts: TerminalAccount[];
  initiatorName: string;
  secretsSet: DarajaSecretsSet;
  tested: boolean;
  urlsRegistered: boolean;
}

/** What the M-Pesa (Daraja) form sends. Blank secrets keep the saved ones. */
export interface DarajaInput {
  scope: IntegrationScope | null;
  env: IntegrationEnv;
  accountType: DarajaAccountType;
  paybill: string;
  storeNumber: string;
  tillNumber: string;
  accountNumber: string;
  terminalAccounts: TerminalAccount[];
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  initiatorName: string;
  initiatorPassword: string;
}

export type DarajaField = "scope" | "paybill" | "storeNumber" | "tillNumber" | "accountNumber" | "terminalAccounts" | "consumerKey" | "consumerSecret" | "passkey" | "initiatorPassword";

/** A payment that reached the business's M-Pesa account (design `UZ_INTEG.mpesa.tx`). */
export interface MpesaPayment {
  date: string; // ISO
  time: string; // "HH:MM"
  /** M-Pesa transaction code. */
  code: string;
  name: string;
  /** Masked, e.g. "0722 *** 410". */
  phone: string;
  /** "Paid to Till" or "Payment request (POS)". */
  via: string;
  amount: number;
  /** "INV-0351 · Morningview Bicycles", or "" until matched. */
  match: string;
}

/** How payments to a bank's Paybill reach UzaPro. */
export type BankFeed = "Bank API (instant)" | "Daily statement upload";

/** A bank account linked so M-Pesa payments to the bank's Paybill are recorded (design `UZ_INTEG.bank`). */
export interface BankLink {
  bank: string;
  paybill: string;
  /** Bank account number. */
  account: string;
  /** Account name, as shown by the bank. */
  name: string;
  /** UzaPro account the payments are recorded in. */
  deposit: string;
  feed: BankFeed;
  status: "Active" | "Waiting for bank";
}

export interface NewBankLink {
  bank: string;
  account: string;
  name: string;
  deposit: string;
  feed: BankFeed;
}

/** Record kinds UzaPro can send to QuickBooks. */
export type QbRecord = "invoices" | "payments" | "customers" | "products" | "expenses";

export type QbFrequency = "manual" | "hourly" | "daily";

/** Which QuickBooks account a kind of money lands in. */
export type QbAccountField = "incomeAccount" | "depositAccount" | "expenseAccount";

export interface QuickbooksSettings {
  send: Record<QbRecord, boolean>;
  /** Needed when invoices are sent. */
  incomeAccount: string;
  /** Needed when payments are sent. */
  depositAccount: string;
  /** Needed when expenses are sent. */
  expenseAccount: string;
  frequency: QbFrequency;
}

export type QuickbooksField = "send" | QbAccountField;

export interface QuickbooksSync {
  /** Display date and time, e.g. "10 Nov 2026, 14:05". */
  at: string;
  /** How many of each chosen record kind were sent. */
  counts: Partial<Record<QbRecord, number>>;
}

/** One line of the QuickBooks sync history (design `UZ_INTEG.qb.log`). */
export interface QuickbooksLog {
  /** "10 Nov 2026, 14:05" */
  when: string;
  title: string;
  detail: string;
  /** A record QuickBooks refused; Retry sends it again. */
  failed?: boolean;
}

export interface QuickbooksConnection {
  env: IntegrationEnv;
  companyName: string;
  companyId: string;
  settings: QuickbooksSettings;
  lastSync: QuickbooksSync | null;
  /** Newest first. */
  log: QuickbooksLog[];
}

export interface IntegrationsState {
  daraja: DarajaConfig[];
  /** Payments received on the business-wide M-Pesa account, newest first. */
  mpesaPayments: MpesaPayment[];
  bank: BankLink[];
  /** null until the business connects its QuickBooks company. */
  quickbooks: QuickbooksConnection | null;
}

export interface ScopeOption {
  value: string;
  label: string;
}

/** Where a till's M-Pesa request goes (feature 022). `to` reads "Paybill 522522, account FRONT". */
export type MpesaRoute = { ready: true; via: "daraja"; to: string } | { ready: false; reason: "none" | "untested" };
