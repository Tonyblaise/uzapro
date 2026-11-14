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

export type BankId = "ncba";

export interface IntegrationBank {
  id: BankId;
  name: string;
  /** The bank's shared paybill; the till number is sent as the account number. */
  paybill: string;
  features: readonly string[];
  envs: readonly IntegrationEnv[];
}

/** Credentials created for the business to give the bank in its instruction letter. */
export interface BankGenerated {
  apiUsername: string;
  apiSecret: string;
  notifyUrl: string;
  notifyUsername: string;
  notifyPassword: string;
  notifySecret: string;
}

export interface BankConfig {
  scope: IntegrationScope;
  bank: BankId;
  env: IntegrationEnv;
  tillNumber: string;
  qrTillCode: string;
  generated: BankGenerated;
  tested: boolean;
}

export interface BankInput {
  scope: IntegrationScope | null;
  bank: BankId;
  env: IntegrationEnv;
  tillNumber: string;
  qrTillCode: string;
}

export type BankField = "scope" | "tillNumber" | "qrTillCode";

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

export interface QuickbooksConnection {
  env: IntegrationEnv;
  companyName: string;
  companyId: string;
  settings: QuickbooksSettings;
  lastSync: QuickbooksSync | null;
}

export interface IntegrationsState {
  daraja: DarajaConfig[];
  bank: BankConfig[];
  /** null until the business connects its QuickBooks company. */
  quickbooks: QuickbooksConnection | null;
}

export interface ScopeOption {
  value: string;
  label: string;
}
