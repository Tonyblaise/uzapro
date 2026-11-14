/** Pure rules for Integrations (feature 015, contracts/data-access.md). */
import { WALK_IN } from "./fixtures/customers";
import { INTEGRATION_BANKS, NOTIFY_BASE, QB_ACCOUNT_LABEL, QB_RECORDS } from "./fixtures/integrations";
import type { AppState } from "./store/state";
import type {
  BankConfig,
  BankField,
  BankGenerated,
  BankId,
  BankInput,
  DarajaConfig,
  DarajaField,
  DarajaInput,
  IntegrationBank,
  IntegrationScope,
  IntegrationsState,
  QbRecord,
  QuickbooksField,
  QuickbooksSettings,
  QuickbooksSync,
  ScopeOption,
  Terminal,
} from "./types";

export const ALL_TERMINALS = "All terminals (business-wide)";

export function seedIntegrations(): IntegrationsState {
  return { daraja: [], bank: [], quickbooks: null };
}

export function bankOf(id: BankId): IntegrationBank {
  return INTEGRATION_BANKS.find((b) => b.id === id) ?? INTEGRATION_BANKS[0]!;
}

/** The select value for a scope, and back ("" = nothing picked). */
export const scopeValue = (scope: IntegrationScope | null): string => (scope === null ? "" : String(scope));
export const scopeFrom = (value: string): IntegrationScope | null => (value === "" ? null : value === "all" ? "all" : Number(value));

/** "Applies to" choices: business-wide first, then each active terminal with whether it has its own credentials. */
export function scopeOptions(terminals: readonly Terminal[], configs: readonly { scope: IntegrationScope }[]): ScopeOption[] {
  const has = (scope: IntegrationScope) => configs.some((c) => c.scope === scope);
  return [
    { value: "all", label: ALL_TERMINALS },
    ...terminals.filter((t) => t.active || has(t.id)).map((t) => ({ value: String(t.id), label: `${t.name} · ${has(t.id) ? "own credentials" : "no credentials yet"}` })),
  ];
}

const DIGITS = /^\d+$/;
const digits = (v: string, empty: string): string | undefined => (!v.trim() ? empty : DIGITS.test(v.trim()) ? undefined : "Use digits only");

function scopeError(scope: IntegrationScope | null, terminals: readonly Terminal[]): string | undefined {
  if (scope === null) return "Choose what these credentials apply to";
  if (scope !== "all" && !terminals.some((t) => t.id === scope)) return "That terminal is not in the list";
  return undefined;
}

/** Field errors for the M-Pesa (Daraja) form; empty when it can be saved. `saved` is the scope's current config. */
export function darajaErrors(input: DarajaInput, saved: DarajaConfig | undefined, terminals: readonly Terminal[]): Partial<Record<DarajaField, string>> {
  const e: Partial<Record<DarajaField, string>> = {};
  const set = (k: DarajaField, msg: string | undefined) => {
    if (msg) e[k] = msg;
  };
  set("scope", scopeError(input.scope, terminals));
  if (input.accountType === "paybill") {
    set("paybill", digits(input.paybill, "Enter the Paybill number"));
    if (input.accountNumber.trim().length > 20) set("accountNumber", "Use 20 characters or fewer");
    if (input.scope === "all") {
      const seen = new Set<number>();
      for (const row of input.terminalAccounts) {
        const t = terminals.find((x) => x.id === row.terminalId);
        if (!t) set("terminalAccounts", "Choose a terminal for each row");
        else if (seen.has(row.terminalId)) set("terminalAccounts", `${t.name} is listed twice`);
        else if (!row.accountNumber.trim()) set("terminalAccounts", `Enter the account number for ${t.name}`);
        if (e.terminalAccounts) break;
        seen.add(row.terminalId);
      }
    }
  } else {
    set("storeNumber", digits(input.storeNumber, "Enter the store number"));
    set("tillNumber", digits(input.tillNumber, "Enter the till number"));
  }
  const need = (k: "consumerKey" | "consumerSecret" | "passkey", msg: string) => {
    if (!input[k].trim() && !saved?.secretsSet[k]) e[k] = msg;
  };
  need("consumerKey", "Enter the consumer key");
  need("consumerSecret", "Enter the consumer secret");
  need("passkey", "Enter the passkey");
  if (input.initiatorName.trim() && !input.initiatorPassword.trim() && !saved?.secretsSet.initiatorPassword) e.initiatorPassword = "Enter the initiator password";
  return e;
}

/** Field errors for a bank integration form; empty when it can be saved. */
export function bankErrors(input: BankInput, terminals: readonly Terminal[]): Partial<Record<BankField, string>> {
  const e: Partial<Record<BankField, string>> = {};
  const scope = scopeError(input.scope, terminals);
  if (scope) e.scope = scope;
  const till = digits(input.tillNumber, `Enter your ${bankOf(input.bank).name.replace(/ Bank$/, "")} till number`);
  if (till) e.tillNumber = till;
  if (input.qrTillCode.trim().length > 20) e.qrTillCode = "Use 20 characters or fewer";
  return e;
}

export const firstError = (errors: Partial<Record<string, string>>): string | undefined => Object.values(errors).find(Boolean);

/** A repeatable token for demo credentials: same seed, same value. */
function token(seed: string, length: number): string {
  let h = 2166136261;
  let out = "";
  for (let i = 0; out.length < length; i++) {
    for (const ch of `${seed}:${i}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    out += h.toString(36);
  }
  return out.slice(0, length);
}

/** `owner` names who the credentials are for: "business" or a terminal code. */
export function generateBankCredentials(bank: BankId, owner: string): BankGenerated {
  const slug = owner.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const seed = `${bank}/${slug}`;
  return {
    apiUsername: `uzapro-${bank}-${slug}`,
    apiSecret: token(`${seed}/api`, 32),
    notifyUrl: `${NOTIFY_BASE}/${bank}/notify/${token(`${seed}/url`, 12)}`,
    notifyUsername: `uzapro-notify-${slug}`,
    notifyPassword: token(`${seed}/pass`, 24),
    notifySecret: token(`${seed}/secret`, 32),
  };
}

export const darajaFor = (s: IntegrationsState, scope: IntegrationScope | null): DarajaConfig | undefined => s.daraja.find((c) => c.scope === scope);
export const bankFor = (s: IntegrationsState, bank: BankId, scope: IntegrationScope | null): BankConfig | undefined => s.bank.find((c) => c.bank === bank && c.scope === scope);

/** What a new QuickBooks connection starts with: sales and customers, sent only on request. */
export const QB_DEFAULT_SETTINGS: QuickbooksSettings = {
  send: { invoices: true, payments: true, customers: true, products: false, expenses: false },
  incomeAccount: "Sales of Product Income",
  depositAccount: "Undeposited Funds",
  expenseAccount: "",
  frequency: "manual",
};

/** Field errors for the QuickBooks settings; empty when they can be saved. An account is needed only for what is sent. */
export function quickbooksErrors(settings: QuickbooksSettings): Partial<Record<QuickbooksField, string>> {
  const e: Partial<Record<QuickbooksField, string>> = {};
  if (!QB_RECORDS.some((r) => settings.send[r.id])) e.send = "Choose at least one thing to send";
  for (const r of QB_RECORDS) if (r.account && settings.send[r.id] && !settings[r.account]) e[r.account] = `Choose the ${QB_ACCOUNT_LABEL[r.account].toLowerCase()}`;
  return e;
}

/** How many records of each chosen kind a sync sends. */
export function quickbooksCounts(s: AppState, send: Record<QbRecord, boolean>): QuickbooksSync["counts"] {
  const all: Record<QbRecord, number> = {
    invoices: s.sales.invoices.length,
    payments: s.money.rcvPayments.length,
    customers: s.customers.filter((c) => c.name !== WALK_IN).length,
    products: s.catalog.products.length,
    expenses: s.expenses.expenses.length,
  };
  return Object.fromEntries(QB_RECORDS.filter((r) => send[r.id]).map((r) => [r.id, all[r.id]]));
}

/** "12 invoices, 8 customers" for a finished sync. */
export function syncSummary(counts: QuickbooksSync["counts"]): string {
  const parts = QB_RECORDS.filter((r) => counts[r.id] !== undefined).map((r) => `${counts[r.id]} ${r.label.toLowerCase()}`);
  return parts.join(", ");
}
