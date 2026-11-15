/**
 * Integrations commands (feature 015, contracts/data-access.md). Nothing leaves the browser:
 * the connection test and the URL registration are simulated (spec › Design deviations).
 */
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { WALK_IN } from "../fixtures/customers";
import { QB_COMPANIES, QB_RECORDS } from "../fixtures/integrations";
import { QB_DEFAULT_SETTINGS, bankLinkError, darajaErrors, darajaFor, firstError, paybillOf, quickbooksCounts, quickbooksErrors } from "../integrations";
import { balance } from "../money";
import { getStore, showToast } from "../store";
import { fail, ok, type BankLink, type DarajaConfig, type DarajaInput, type IntegrationEnv, type IntegrationScope, type NewBankLink, type QuickbooksConnection, type QuickbooksSettings, type Result } from "../types";
import { recordPayment } from "./money";

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
  const who = config.scope === "all" ? "the whole business" : (terminals.find((t) => t.id === config.scope)?.name ?? "this terminal");
  return done(config, `M-Pesa credentials saved for ${who}.`);
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

/** Record an M-Pesa payment that came in without a sale against an open invoice (design "Match payment"). */
export async function matchMpesaPayment(code: string, receivableRef: string): Promise<Result<void>> {
  const s = getStore().getState();
  const tx = s.integrations.mpesaPayments.find((p) => p.code === code);
  if (!tx) return fail("That payment is not in the list.");
  if (tx.match) return fail(`${code} is already matched.`);
  const r = s.money.receivables.find((x) => x.ref === receivableRef && !x.voided && balance(x) > 0);
  if (!r) return fail("Pick the invoice this payment is for.");
  const paid = await recordPayment("rcv", { party: r.party, selected: [r.ref], amount: Math.min(tx.amount, balance(r)), method: "M-Pesa", account: "M-Pesa Till", date: tx.date, payRef: code });
  if (!paid.ok) return paid as Result<never>;
  const match = `${r.doc && r.doc !== "—" ? r.doc : r.ref} · ${r.party}`;
  getStore().setState((st) => ({ integrations: { ...st.integrations, mpesaPayments: st.integrations.mpesaPayments.map((p) => (p.code === code ? { ...p, match } : p)) } }));
  return done(undefined, `Payment recorded against ${match}.`);
}

/** "Add bank integration" (design messages). A Bank API link waits for the bank to turn on alerts. */
export async function addBankLink(input: NewBankLink): Promise<Result<BankLink>> {
  const st = getStore();
  const err = bankLinkError(input, st.getState().integrations.bank);
  if (err) return fail(err);
  const link: BankLink = { bank: input.bank, paybill: paybillOf(input.bank), account: input.account, name: input.name.trim(), deposit: input.deposit, feed: input.feed, status: input.feed === "Bank API (instant)" ? "Waiting for bank" : "Active" };
  st.setState((x) => ({ integrations: { ...x.integrations, bank: [...x.integrations.bank, link] } }));
  return done(link, `${link.bank} linked.${link.status === "Waiting for bank" ? " We'll mark it active once the bank turns on alerts." : ""}`);
}

export async function removeBankLink(bank: string, account: string): Promise<Result<void>> {
  getStore().setState((x) => ({ integrations: { ...x.integrations, bank: x.integrations.bank.filter((b) => !(b.bank === bank && b.account === account)) } }));
  return done(undefined, `${bank} integration removed.`);
}

const quickbooks = () => getStore().getState().integrations.quickbooks;
const setQuickbooks = (next: QuickbooksConnection | null) => getStore().setState((st) => ({ integrations: { ...st.integrations, quickbooks: next } }));

/**
 * Connect the company picked after signing in to Intuit (design "Choose your company"). Simulated:
 * no sign-in happens and nothing is contacted.
 */
export async function connectQuickbooks(env: IntegrationEnv): Promise<Result<QuickbooksConnection>> {
  if (quickbooks()) return refuse("QuickBooks is already connected.");
  const company = QB_COMPANIES[env];
  const connection: QuickbooksConnection = {
    env,
    companyName: company.name,
    companyId: company.id,
    settings: { ...QB_DEFAULT_SETTINGS, send: { ...QB_DEFAULT_SETTINGS.send } },
    lastSync: null,
    log: [],
  };
  setQuickbooks(connection);
  return done(connection, `Connected to ${connection.companyName}.`);
}

export async function saveQuickbooksSettings(settings: QuickbooksSettings): Promise<Result<void>> {
  const cur = quickbooks();
  if (!cur) return refuse("Connect QuickBooks first.");
  const err = firstError(quickbooksErrors(settings));
  if (err) return fail(err);
  setQuickbooks({ ...cur, settings: { ...settings, send: { ...settings.send } } });
  return done(undefined, "QuickBooks settings saved.");
}

const WALK_IN_QB = `${WALK_IN} (UzaPro)`;

/**
 * Send the chosen records now (design "Sync now"). Simulated: counts what would be sent and logs it.
 * As in the design, the first sync with customers can't send the walk-in customer: QuickBooks needs
 * a unique display name. Retry sends it under a new name.
 */
export async function syncQuickbooks(): Promise<Result<void>> {
  if (!quickbooks()) return refuse("Connect QuickBooks first.");
  await wait();
  const cur = quickbooks();
  if (!cur) return refuse("Connect QuickBooks first.");
  const at = `${fmtDate(DEMO_TODAY)}, ${demoTime()}`;
  const counts = quickbooksCounts(getStore().getState(), cur.settings.send);
  const sent = Object.values(counts).reduce((a, n) => a + (n ?? 0), 0);
  const kinds = QB_RECORDS.filter((r) => counts[r.id] !== undefined).map((r) => r.label.toLowerCase());
  const detail = kinds.join(", ").replace(/^./, (c) => c.toUpperCase());
  const log = [{ when: at, title: `Sent ${sent} records`, detail }, ...cur.log];
  if (cur.settings.send.customers && !cur.log.some((l) => l.failed !== undefined))
    log.unshift({ when: at, title: `Couldn't send customer "${WALK_IN}"`, detail: `QuickBooks needs a unique display name. Retry to send it as "${WALK_IN_QB}".`, failed: true } as (typeof log)[number]);
  setQuickbooks({ ...cur, lastSync: { at, counts }, log });
  return done(undefined, "QuickBooks sync finished.");
}

/** Send a record QuickBooks refused again, fixed (design "Retry"). */
export async function retryQuickbooks(index: number): Promise<Result<void>> {
  const cur = quickbooks();
  const entry = cur?.log[index];
  if (!cur || !entry?.failed) return fail("Nothing to retry.");
  setQuickbooks({ ...cur, log: cur.log.map((l, i) => (i === index ? { ...l, title: `Sent customer "${WALK_IN_QB}"`, detail: "Fixed and sent on retry.", failed: false } : l)) });
  return done(undefined, "Sent to QuickBooks.");
}

/** Stop sending and forget the connection. What was already sent stays in QuickBooks. */
export async function disconnectQuickbooks(): Promise<Result<void>> {
  if (!quickbooks()) return fail("QuickBooks is not connected.");
  setQuickbooks(null);
  return done(undefined, "QuickBooks disconnected. Nothing was deleted in QuickBooks.");
}
