/** Pure rules for Integrations (feature 015, contracts/data-access.md). */
import { WALK_IN } from "./fixtures/customers";
import { BANK_LINK_SEED, BANK_PAYBILLS, DARAJA_SEED, MPESA_PAYMENT_SEED, QB_ACCOUNT_LABEL, QB_RECORDS } from "./fixtures/integrations";
import type { AppState } from "./store/state";
import type {
  BankLink,
  DarajaConfig,
  DarajaField,
  DarajaInput,
  IntegrationScope,
  IntegrationsState,
  MpesaRoute,
  NewBankLink,
  QbRecord,
  QuickbooksField,
  QuickbooksSettings,
  QuickbooksSync,
  ScopeOption,
  Terminal,
} from "./types";

export const ALL_TERMINALS = "All terminals (business-wide)";

export function seedIntegrations(): IntegrationsState {
  return {
    daraja: [{ ...DARAJA_SEED, terminalAccounts: [], secretsSet: { ...DARAJA_SEED.secretsSet } }],
    mpesaPayments: MPESA_PAYMENT_SEED.map((p) => ({ ...p })),
    bank: BANK_LINK_SEED.map((b) => ({ ...b })),
    quickbooks: null,
  };
}

/** A bank's M-Pesa Paybill, "" when unknown. */
export const paybillOf = (bank: string) => BANK_PAYBILLS.find((b) => b.bank === bank)?.paybill ?? "";

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

/** Why a bank link can't be added (design messages), or undefined. */
export function bankLinkError(input: NewBankLink, links: readonly BankLink[]): string | undefined {
  if (!/^\d{6,16}$/.test(input.account)) return "Enter the bank account number (digits only).";
  if (!input.name.trim()) return "Add the account name.";
  if (links.some((b) => b.bank === input.bank && b.account === input.account)) return "This account is already linked.";
  return undefined;
}

export const firstError = (errors: Partial<Record<string, string>>): string | undefined => Object.values(errors).find(Boolean);

export const darajaFor = (s: IntegrationsState, scope: IntegrationScope | null): DarajaConfig | undefined => s.daraja.find((c) => c.scope === scope);

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

/** Paybill account for a terminal: its own number, then the shared one, then each sale's number. */
function paybillAccount(c: DarajaConfig, termId: number): string {
  const own = c.terminalAccounts.find((a) => a.terminalId === termId)?.accountNumber;
  return own || c.accountNumber || "the sale number";
}

/**
 * Where a terminal's M-Pesa request goes (feature 022). A terminal's own set-up comes before the
 * business-wide one. Only a tested connection can take requests. (Bank Paybill links take
 * payments customers make themselves; they send no requests.)
 */
export function mpesaRoute(s: IntegrationsState, termId: number): MpesaRoute {
  let saved = false;
  for (const scope of [termId, "all"] as const) {
    const d = darajaFor(s, scope);
    if (d?.tested) return { ready: true, via: "daraja", to: d.accountType === "paybill" ? `Paybill ${d.paybill}, account ${paybillAccount(d, termId)}` : `Till ${d.tillNumber}` };
    saved ||= !!d;
  }
  return { ready: false, reason: saved ? "untested" : "none" };
}

const TYPE_THE_CODE = "Type the M-Pesa code from the customer's message.";

/** What the till says about M-Pesa requests on this terminal. */
export function mpesaRouteNote(route: MpesaRoute): string {
  if (route.ready) return `Send a payment request to the customer's phone, or type the M-Pesa code yourself. Payments go to ${route.to}.`;
  if (route.reason === "untested") return `M-Pesa is saved under Integrations, but its connection has not been tested, so requests can't be sent yet. ${TYPE_THE_CODE}`;
  return `M-Pesa requests are not set up for this terminal. ${TYPE_THE_CODE} An owner can set requests up under Integrations.`;
}
