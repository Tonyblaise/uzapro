/**
 * Integrations commands (feature 015, contracts/data-access.md). Nothing leaves the browser:
 * the connection test and the URL registration are simulated (spec › Design deviations).
 */
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { QB_DEMO_COMPANY_ID } from "../fixtures/integrations";
import { QB_DEFAULT_SETTINGS, bankErrors, bankFor, bankOf, darajaErrors, darajaFor, firstError, generateBankCredentials, quickbooksCounts, quickbooksErrors, syncSummary } from "../integrations";
import { getStore, showToast } from "../store";
import { fail, ok, type BankConfig, type BankId, type BankInput, type DarajaConfig, type DarajaInput, type IntegrationEnv, type IntegrationScope, type QuickbooksConnection, type QuickbooksSettings, type Result } from "../types";

/** How long a simulated request takes. */
export const INTEGRATION_WAIT_MS = 600;

const wait = () => new Promise<void>((done) => setTimeout(done, INTEGRATION_WAIT_MS));

const refuse = <T = never>(message: string): Result<T> => {
  showToast(message);
  return fail(message);
};

const done = <T>(value: T, message: string): Result<T> => {
  showToast(message);
  return ok(value, message);
};

/** Save one scope's Daraja credentials. Typed secrets replace the saved ones; any save needs a fresh test. */
export async function saveDarajaCredentials(input: DarajaInput): Promise<Result<DarajaConfig>> {
  const store = getStore();
  const s = store.getState();
  const terminals = s.settings.terminals.list;
  const saved = darajaFor(s.integrations, input.scope);
  const err = firstError(darajaErrors(input, saved, terminals));
  if (err || input.scope === null) return fail(err ?? "Choose what these credentials apply to");
  const paybill = input.accountType === "paybill";
  const config: DarajaConfig = {
    scope: input.scope,
    env: input.env,
    accountType: input.accountType,
    paybill: paybill ? input.paybill.trim() : "",
    storeNumber: paybill ? "" : input.storeNumber.trim(),
    tillNumber: paybill ? "" : input.tillNumber.trim(),
    accountNumber: paybill ? input.accountNumber.trim() : "",
    terminalAccounts: paybill && input.scope === "all" ? input.terminalAccounts.map((r) => ({ terminalId: r.terminalId, accountNumber: r.accountNumber.trim() })) : [],
    initiatorName: input.initiatorName.trim(),
    secretsSet: {
      consumerKey: !!input.consumerKey.trim() || !!saved?.secretsSet.consumerKey,
      consumerSecret: !!input.consumerSecret.trim() || !!saved?.secretsSet.consumerSecret,
      passkey: !!input.passkey.trim() || !!saved?.secretsSet.passkey,
      initiatorPassword: !!input.initiatorName.trim() && (!!input.initiatorPassword.trim() || !!saved?.secretsSet.initiatorPassword),
    },
    tested: false,
    urlsRegistered: false,
  };
  store.setState((st) => ({ integrations: { ...st.integrations, daraja: [...st.integrations.daraja.filter((c) => c.scope !== config.scope), config] } }));
  return done(config, "M-Pesa credentials saved.");
}

const patchDaraja = (scope: IntegrationScope, patch: Partial<DarajaConfig>) =>
  getStore().setState((st) => ({ integrations: { ...st.integrations, daraja: st.integrations.daraja.map((c) => (c.scope === scope ? { ...c, ...patch } : c)) } }));

export async function testDarajaConnection(scope: IntegrationScope): Promise<Result<void>> {
  if (!darajaFor(getStore().getState().integrations, scope)) return refuse("Save the credentials first.");
  await wait();
  if (!darajaFor(getStore().getState().integrations, scope)) return refuse("Save the credentials first.");
  patchDaraja(scope, { tested: true });
  return done(undefined, "Connection works.");
}

/** Tell M-Pesa where to send payment confirmations. */
export async function registerDarajaUrls(scope: IntegrationScope): Promise<Result<void>> {
  const ready = () => darajaFor(getStore().getState().integrations, scope)?.tested;
  if (!ready()) return refuse("Test the connection first.");
  await wait();
  if (!ready()) return refuse("Test the connection first.");
  patchDaraja(scope, { urlsRegistered: true });
  return done(undefined, "Payment URLs registered.");
}

/** Save one scope's bank details. The first save creates the credentials to give the bank; later saves keep them. */
export async function saveBankCredentials(input: BankInput): Promise<Result<BankConfig>> {
  const store = getStore();
  const s = store.getState();
  const terminals = s.settings.terminals.list;
  const err = firstError(bankErrors(input, terminals));
  if (err || input.scope === null) return fail(err ?? "Choose what these credentials apply to");
  const scope = input.scope;
  if (!bankOf(input.bank).envs.includes(input.env)) return fail(`${bankOf(input.bank).name} has no test environment`);
  const saved = bankFor(s.integrations, input.bank, scope);
  const owner = scope === "all" ? "business" : (terminals.find((t) => t.id === scope)?.code ?? `terminal-${scope}`);
  const config: BankConfig = {
    scope,
    bank: input.bank,
    env: input.env,
    tillNumber: input.tillNumber.trim(),
    qrTillCode: input.qrTillCode.trim(),
    generated: saved?.generated ?? generateBankCredentials(input.bank, owner),
    tested: false,
  };
  store.setState((st) => ({ integrations: { ...st.integrations, bank: [...st.integrations.bank.filter((c) => !(c.bank === config.bank && c.scope === scope)), config] } }));
  return done(config, `${bankOf(input.bank).name} credentials saved.`);
}

export async function testBankConnection(bank: BankId, scope: IntegrationScope): Promise<Result<void>> {
  const saved = () => bankFor(getStore().getState().integrations, bank, scope);
  if (!saved()) return refuse("Save the credentials first.");
  await wait();
  if (!saved()) return refuse("Save the credentials first.");
  getStore().setState((st) => ({ integrations: { ...st.integrations, bank: st.integrations.bank.map((c) => (c.bank === bank && c.scope === scope ? { ...c, tested: true } : c)) } }));
  return done(undefined, "Connection works.");
}

const quickbooks = () => getStore().getState().integrations.quickbooks;
const setQuickbooks = (next: QuickbooksConnection | null) => getStore().setState((st) => ({ integrations: { ...st.integrations, quickbooks: next } }));

/** Connect the business's QuickBooks company. Simulated: no sign-in happens and nothing is contacted. */
export async function connectQuickbooks(env: IntegrationEnv): Promise<Result<QuickbooksConnection>> {
  if (quickbooks()) return refuse("QuickBooks is already connected.");
  await wait();
  if (quickbooks()) return refuse("QuickBooks is already connected.");
  const { biz } = getStore().getState().settings;
  const connection: QuickbooksConnection = {
    env,
    companyName: biz.name,
    companyId: QB_DEMO_COMPANY_ID,
    settings: { ...QB_DEFAULT_SETTINGS, send: { ...QB_DEFAULT_SETTINGS.send } },
    lastSync: null,
  };
  setQuickbooks(connection);
  return done(connection, `Connected to ${connection.companyName} in QuickBooks.`);
}

export async function saveQuickbooksSettings(settings: QuickbooksSettings): Promise<Result<void>> {
  const cur = quickbooks();
  if (!cur) return refuse("Connect QuickBooks first.");
  const err = firstError(quickbooksErrors(settings));
  if (err) return fail(err);
  setQuickbooks({ ...cur, settings: { ...settings, send: { ...settings.send } } });
  return done(undefined, "QuickBooks settings saved.");
}

/** Send the chosen records now. Simulated: counts what would be sent and records the time. */
export async function syncQuickbooks(): Promise<Result<void>> {
  if (!quickbooks()) return refuse("Connect QuickBooks first.");
  await wait();
  const cur = quickbooks();
  if (!cur) return refuse("Connect QuickBooks first.");
  const counts = quickbooksCounts(getStore().getState(), cur.settings.send);
  setQuickbooks({ ...cur, lastSync: { at: `${fmtDate(DEMO_TODAY)}, ${demoTime()}`, counts } });
  return done(undefined, `Sent to QuickBooks: ${syncSummary(counts)}.`);
}

/** Stop sending and forget the connection. What was already sent stays in QuickBooks. */
export async function disconnectQuickbooks(): Promise<Result<void>> {
  if (!quickbooks()) return fail("QuickBooks is not connected.");
  setQuickbooks(null);
  return done(undefined, "QuickBooks disconnected.");
}
