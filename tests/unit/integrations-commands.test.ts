import { beforeEach, describe, expect, it } from "vitest";
import {
  connectQuickbooks,
  disconnectQuickbooks,
  registerDarajaUrls,
  saveBankCredentials,
  saveDarajaCredentials,
  saveQuickbooksSettings,
  syncQuickbooks,
  testBankConnection,
  testDarajaConnection,
} from "@/data/commands/integrations";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import type { DarajaInput } from "@/data/types";

let store: AppStore;
const daraja = () => store.getState().integrations.daraja;
const bank = () => store.getState().integrations.bank;

const input = (over: Partial<DarajaInput> = {}): DarajaInput => ({
  scope: "all",
  env: "production",
  accountType: "paybill",
  paybill: " 522522 ",
  storeNumber: "",
  tillNumber: "",
  accountNumber: "",
  terminalAccounts: [],
  consumerKey: "ck-live-123",
  consumerSecret: "cs-live-456",
  passkey: "pk-live-789",
  initiatorName: "",
  initiatorPassword: "",
  ...over,
});
const ncba = { scope: "all" as const, bank: "ncba" as const, env: "production" as const, tillNumber: "000001", qrTillCode: "PAY100D" };

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("M-Pesa (Daraja) commands (feature 015)", () => {
  it("saves a Paybill and never keeps the secrets", async () => {
    const r = await saveDarajaCredentials(input({ initiatorName: "apiuser", initiatorPassword: "init-pw-000" }));
    expect(r).toMatchObject({ ok: true, message: "M-Pesa credentials saved." });
    expect(daraja()).toEqual([
      {
        scope: "all",
        env: "production",
        accountType: "paybill",
        paybill: "522522",
        storeNumber: "",
        tillNumber: "",
        accountNumber: "",
        terminalAccounts: [],
        initiatorName: "apiuser",
        secretsSet: { consumerKey: true, consumerSecret: true, passkey: true, initiatorPassword: true },
        tested: false,
        urlsRegistered: false,
      },
    ]);
    const state = JSON.stringify(store.getState());
    for (const secret of ["ck-live-123", "cs-live-456", "pk-live-789", "init-pw-000"]) expect(state).not.toContain(secret);
    expect(store.getState().ui.toast).toMatchObject({ text: "M-Pesa credentials saved." });
  });

  it("refuses an incomplete form with the first problem and saves nothing", async () => {
    expect(await saveDarajaCredentials(input({ scope: null }))).toMatchObject({ ok: false, message: "Choose what these credentials apply to" });
    expect(await saveDarajaCredentials(input({ paybill: "" }))).toMatchObject({ ok: false, message: "Enter the Paybill number" });
    expect(await saveDarajaCredentials(input({ consumerKey: "" }))).toMatchObject({ ok: false, message: "Enter the consumer key" });
    expect(daraja()).toEqual([]);
  });

  it("keeps only the fields for the chosen account type", async () => {
    await saveDarajaCredentials(input({ accountType: "till", storeNumber: "700100", tillNumber: "524118", accountNumber: "SHOP", terminalAccounts: [{ terminalId: 1, accountNumber: "T1" }] }));
    expect(daraja()[0]).toMatchObject({ accountType: "till", paybill: "", storeNumber: "700100", tillNumber: "524118", accountNumber: "", terminalAccounts: [] });
  });

  it("keeps business-wide and per-terminal credentials apart", async () => {
    await saveDarajaCredentials(input({ terminalAccounts: [{ terminalId: 1, accountNumber: " FRONT " }] }));
    await saveDarajaCredentials(input({ scope: 1, paybill: "400200", terminalAccounts: [{ terminalId: 1, accountNumber: "X" }] }));
    expect(daraja().map((c) => [c.scope, c.paybill, c.terminalAccounts])).toEqual([
      ["all", "522522", [{ terminalId: 1, accountNumber: "FRONT" }]],
      [1, "400200", []],
    ]);
  });

  it("tests only what is saved, and registers URLs only after a test", async () => {
    expect(await testDarajaConnection("all")).toMatchObject({ ok: false, message: "Save the credentials first." });
    await saveDarajaCredentials(input());
    expect(await registerDarajaUrls("all")).toMatchObject({ ok: false, message: "Test the connection first." });
    expect(await testDarajaConnection("all")).toMatchObject({ ok: true, message: "Connection works." });
    expect(daraja()[0]).toMatchObject({ tested: true, urlsRegistered: false });
    expect(await registerDarajaUrls("all")).toMatchObject({ ok: true, message: "Payment URLs registered." });
    expect(daraja()[0]).toMatchObject({ tested: true, urlsRegistered: true });
  });

  it("a later save keeps the saved keys and needs a fresh test", async () => {
    await saveDarajaCredentials(input());
    await testDarajaConnection("all");
    await registerDarajaUrls("all");
    const r = await saveDarajaCredentials(input({ paybill: "600600", consumerKey: "", consumerSecret: "", passkey: "" }));
    expect(r.ok).toBe(true);
    expect(daraja()).toHaveLength(1);
    expect(daraja()[0]).toMatchObject({ paybill: "600600", tested: false, urlsRegistered: false, secretsSet: { consumerKey: true, consumerSecret: true, passkey: true, initiatorPassword: false } });
  });

  it("drops the initiator password with the initiator name", async () => {
    await saveDarajaCredentials(input({ initiatorName: "apiuser", initiatorPassword: "pw" }));
    await saveDarajaCredentials(input({ initiatorName: "" }));
    expect(daraja()[0]!.secretsSet.initiatorPassword).toBe(false);
  });
});

describe("bank integration commands (feature 015)", () => {
  it("creates the bank credentials on the first save and keeps them afterwards", async () => {
    const first = await saveBankCredentials(ncba);
    expect(first).toMatchObject({ ok: true, message: "NCBA Bank credentials saved." });
    const made = bank()[0]!.generated;
    expect(made.apiUsername).toBe("uzapro-ncba-business");
    await testBankConnection("ncba", "all");
    expect(bank()[0]!.tested).toBe(true);
    await saveBankCredentials({ ...ncba, tillNumber: "000002" });
    expect(bank()).toHaveLength(1);
    expect(bank()[0]).toMatchObject({ tillNumber: "000002", qrTillCode: "PAY100D", tested: false, generated: made });
  });

  it("gives a terminal its own credentials", async () => {
    await saveBankCredentials(ncba);
    await saveBankCredentials({ ...ncba, scope: 1 });
    expect(bank().map((c) => c.generated.apiUsername)).toEqual(["uzapro-ncba-business", "uzapro-ncba-bbl-trm-001"]);
  });

  it("refuses a missing till number, a test environment the bank lacks, and a test before saving", async () => {
    expect(await saveBankCredentials({ ...ncba, tillNumber: "" })).toMatchObject({ ok: false, message: "Enter your NCBA till number" });
    expect(await saveBankCredentials({ ...ncba, env: "sandbox" })).toMatchObject({ ok: false, message: "NCBA Bank has no test environment" });
    expect(await testBankConnection("ncba", "all")).toMatchObject({ ok: false, message: "Save the credentials first." });
    expect(bank()).toEqual([]);
  });
});

describe("QuickBooks commands (feature 015)", () => {
  const qb = () => store.getState().integrations.quickbooks;

  it("needs a connection before settings or a sync", async () => {
    expect(await syncQuickbooks()).toMatchObject({ ok: false, message: "Connect QuickBooks first." });
    expect(await disconnectQuickbooks()).toMatchObject({ ok: false, message: "QuickBooks is not connected." });
    expect(qb()).toBeNull();
  });

  it("connects once, to the business's company, with the starting settings", async () => {
    const name = store.getState().settings.biz.name;
    expect(await connectQuickbooks("sandbox")).toMatchObject({ ok: true, message: `Connected to ${name} in QuickBooks.` });
    expect(qb()).toMatchObject({ env: "sandbox", companyName: name, lastSync: null, settings: { frequency: "manual", send: { invoices: true, products: false } } });
    expect(await connectQuickbooks("production")).toMatchObject({ ok: false, message: "QuickBooks is already connected." });
    expect(qb()!.env).toBe("sandbox");
  });

  it("saves valid settings and refuses invalid ones", async () => {
    await connectQuickbooks("production");
    const settings = qb()!.settings;
    expect(await saveQuickbooksSettings({ ...settings, send: { ...settings.send, expenses: true } })).toMatchObject({ ok: false, message: "Choose the account for expenses" });
    expect(qb()!.settings.send.expenses).toBe(false);
    expect(await saveQuickbooksSettings({ ...settings, send: { ...settings.send, expenses: true }, expenseAccount: "Operating Expenses", frequency: "daily" })).toMatchObject({ ok: true, message: "QuickBooks settings saved." });
    expect(qb()!.settings).toMatchObject({ frequency: "daily", expenseAccount: "Operating Expenses", send: { expenses: true } });
  });

  it("a sync records when it ran and what it sent; disconnecting forgets the connection", async () => {
    await connectQuickbooks("production");
    const s = store.getState();
    const r = await syncQuickbooks();
    expect(r.ok).toBe(true);
    expect(r.message).toBe(`Sent to QuickBooks: ${s.sales.invoices.length} invoices, ${s.money.rcvPayments.length} payments received, ${s.customers.length - 1} customers.`);
    expect(qb()!.lastSync).toMatchObject({ counts: { invoices: s.sales.invoices.length, payments: s.money.rcvPayments.length, customers: s.customers.length - 1 } });
    expect(qb()!.lastSync!.at).toMatch(/^10 Nov 2026, \d\d:\d\d$/);
    expect(await disconnectQuickbooks()).toMatchObject({ ok: true, message: "QuickBooks disconnected." });
    expect(qb()).toBeNull();
  });
});
