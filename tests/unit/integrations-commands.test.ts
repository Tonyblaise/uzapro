import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addBankLink,
  connectQuickbooks,
  disconnectQuickbooks,
  matchMpesaPayment,
  registerDarajaUrls,
  removeBankLink,
  retryQuickbooks,
  saveDarajaCredentials,
  saveQuickbooksSettings,
  syncQuickbooks,
  testDarajaConnection,
} from "@/data/commands/integrations";
import { requestMpesa, setPayPhone } from "@/data/commands/pos";
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

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});
/** Start from nothing set up (the seed has the design's tested Till, feature 026). */
const clearDaraja = () => store.setState((s) => ({ integrations: { ...s.integrations, daraja: [] } }));

describe("M-Pesa (Daraja) commands (feature 015)", () => {
  beforeEach(clearDaraja);

  it("saves a Paybill and never keeps the secrets", async () => {
    const r = await saveDarajaCredentials(input({ initiatorName: "apiuser", initiatorPassword: "init-pw-000" }));
    expect(r).toMatchObject({ ok: true, message: "M-Pesa credentials saved for the whole business." });
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
    expect(store.getState().ui.toast).toMatchObject({ text: "M-Pesa credentials saved for the whole business." });
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

describe("seed and bank links (feature 026, design UZ_INTEG)", () => {
  it("seeds the design's tested Till and its payments, and no bank link", () => {
    expect(daraja()).toEqual([expect.objectContaining({ scope: "all", accountType: "till", tillNumber: "524118", tested: true, urlsRegistered: true })]);
    const pays = store.getState().integrations.mpesaPayments;
    expect(pays.map((p) => p.code)).toHaveLength(6);
    expect(pays.filter((p) => !p.match).map((p) => p.code)).toEqual(["SKM4R8TQ1Z", "SKH6D1VW8E"]);
    expect(bank()).toEqual([]);
  });

  it("adds and removes a bank link with the design's messages", async () => {
    const link = { bank: "NCBA", account: "1234 567", name: "Build by Blaise", deposit: "Equity Bank — Main", feed: "Bank API (instant)" as const };
    expect(await addBankLink(link)).toMatchObject({ ok: false, message: "Enter the bank account number (digits only)." });
    expect(await addBankLink({ ...link, account: "1234567", name: " " })).toMatchObject({ ok: false, message: "Add the account name." });
    expect(await addBankLink({ ...link, account: "1234567" })).toMatchObject({ ok: true, message: "NCBA linked. We'll mark it active once the bank turns on alerts." });
    expect(bank()[0]).toMatchObject({ bank: "NCBA", paybill: "880100", status: "Waiting for bank" });
    expect(await addBankLink({ ...link, account: "1234567" })).toMatchObject({ ok: false, message: "This account is already linked." });
    expect(await addBankLink({ ...link, account: "7654321", feed: "Daily statement upload" })).toMatchObject({ ok: true, message: "NCBA linked." });
    expect(bank()[1]).toMatchObject({ status: "Active" });
    expect(await removeBankLink("NCBA", "1234567")).toMatchObject({ ok: true, message: "NCBA integration removed." });
    expect(bank().map((b) => b.account)).toEqual(["7654321"]);
  });

  it("matches an M-Pesa payment to an open invoice and records the payment", async () => {
    const open = store.getState().money.receivables.find((r) => !r.voided && r.total > r.paid)!;
    const before = open.paid;
    const r = await matchMpesaPayment("SKH6D1VW8E", open.ref);
    expect(r.ok).toBe(true);
    const after = store.getState().money.receivables.find((x) => x.ref === open.ref)!;
    expect(after.paid).toBe(before + Math.min(1026, open.total - before));
    expect(store.getState().integrations.mpesaPayments.find((p) => p.code === "SKH6D1VW8E")!.match).toContain(open.party);
    expect((await matchMpesaPayment("SKH6D1VW8E", open.ref)).message).toBe("SKH6D1VW8E is already matched.");
    expect((await matchMpesaPayment("SKM4R8TQ1Z", "")).message).toBe("Pick the invoice this payment is for.");
  });
});

describe("QuickBooks commands (feature 015)", () => {
  const qb = () => store.getState().integrations.quickbooks;

  it("needs a connection before settings or a sync", async () => {
    expect(await syncQuickbooks()).toMatchObject({ ok: false, message: "Connect QuickBooks first." });
    expect(await disconnectQuickbooks()).toMatchObject({ ok: false, message: "QuickBooks is not connected." });
    expect(qb()).toBeNull();
  });

  it("connects once, to the company picked for the environment, with the starting settings", async () => {
    expect(await connectQuickbooks("sandbox")).toMatchObject({ ok: true, message: "Connected to Sandbox Company_KE." });
    expect(qb()).toMatchObject({ env: "sandbox", companyName: "Sandbox Company_KE", lastSync: null, log: [], settings: { frequency: "manual", send: { invoices: true, products: false } } });
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
    expect(r).toMatchObject({ ok: true, message: "QuickBooks sync finished." });
    const sent = s.sales.invoices.length + s.money.rcvPayments.length + s.customers.length - 1;
    expect(qb()!.lastSync).toMatchObject({ counts: { invoices: s.sales.invoices.length, payments: s.money.rcvPayments.length, customers: s.customers.length - 1 } });
    expect(qb()!.lastSync!.at).toMatch(/^10 Nov 2026, \d\d:\d\d$/);
    // As in the design, the walk-in customer is refused once; Retry sends it under a new name.
    expect(qb()!.log.map((l) => [l.title, !!l.failed])).toEqual([
      ['Couldn\'t send customer "Walk-in Customer"', true],
      [`Sent ${sent} records`, false],
    ]);
    expect(qb()!.log[1]!.detail).toBe("Invoices, payments received, customers");
    expect(await retryQuickbooks(0)).toMatchObject({ ok: true, message: "Sent to QuickBooks." });
    expect(qb()!.log[0]).toMatchObject({ title: 'Sent customer "Walk-in Customer (UzaPro)"', failed: false });
    await syncQuickbooks();
    expect(qb()!.log.filter((l) => l.failed)).toEqual([]);
    expect(await disconnectQuickbooks()).toMatchObject({ ok: true, message: "QuickBooks disconnected. Nothing was deleted in QuickBooks." });
    expect(qb()).toBeNull();
  });
});

describe("the till's M-Pesa request (feature 022)", () => {
  const co = () => store.getState().pos.ui.co;
  beforeEach(clearDaraja);

  it("is refused until M-Pesa is saved and tested, then fills in a code", async () => {
    setPayPhone("0712 345 678");
    requestMpesa();
    expect(co()).toMatchObject({ mpesa: "", err: expect.stringContaining("M-Pesa requests are not set up for this terminal.") });

    await saveDarajaCredentials(input());
    requestMpesa();
    expect(co()).toMatchObject({ mpesa: "", err: expect.stringContaining("its connection has not been tested") });

    await testDarajaConnection("all");
    vi.useFakeTimers();
    try {
      requestMpesa();
      expect(co()).toMatchObject({ mpesa: "waiting", err: "" });
      vi.advanceTimersByTime(1800);
      expect(co()).toMatchObject({ mpesa: "paid", ref: expect.stringMatching(/^S[A-Z0-9]{9}$/) });
    } finally {
      vi.useRealTimers();
    }
  });

  it("still asks for a Safaricom number once M-Pesa is ready", async () => {
    await saveDarajaCredentials(input());
    await testDarajaConnection("all");
    setPayPhone("12345");
    requestMpesa();
    expect(co()).toMatchObject({ mpesa: "", err: "Enter the customer's Safaricom number, for example 0712 345 678." });
  });
});
