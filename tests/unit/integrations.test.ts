import { describe, expect, it } from "vitest";
import { QB_DEFAULT_SETTINGS, bankErrors, darajaErrors, generateBankCredentials, quickbooksCounts, quickbooksErrors, scopeFrom, scopeOptions, scopeValue, seedIntegrations, syncSummary } from "@/data/integrations";
import { createSeed } from "@/data/store/seed";
import type { DarajaConfig, DarajaInput, Terminal } from "@/data/types";

const terminals: Terminal[] = createSeed().settings.terminals.list;
const T1 = terminals[0]!;

const paybill = (over: Partial<DarajaInput> = {}): DarajaInput => ({
  scope: "all",
  env: "production",
  accountType: "paybill",
  paybill: "522522",
  storeNumber: "",
  tillNumber: "",
  accountNumber: "",
  terminalAccounts: [],
  consumerKey: "key",
  consumerSecret: "secret",
  passkey: "passkey",
  initiatorName: "",
  initiatorPassword: "",
  ...over,
});

const saved: DarajaConfig = {
  scope: "all",
  env: "production",
  accountType: "paybill",
  paybill: "522522",
  storeNumber: "",
  tillNumber: "",
  accountNumber: "",
  terminalAccounts: [],
  initiatorName: "",
  secretsSet: { consumerKey: true, consumerSecret: true, passkey: true, initiatorPassword: false },
  tested: false,
  urlsRegistered: false,
};

describe("integrations rules (feature 015)", () => {
  it("starts with nothing configured", () => {
    expect(seedIntegrations()).toEqual({ daraja: [], bank: [], quickbooks: null });
    expect(createSeed().integrations).toEqual({ daraja: [], bank: [], quickbooks: null });
  });

  it("lists business-wide first, then each terminal with whether it has its own credentials", () => {
    expect(scopeOptions(terminals, [])).toEqual([
      { value: "all", label: "All terminals (business-wide)" },
      { value: String(T1.id), label: `${T1.name} · no credentials yet` },
    ]);
    expect(scopeOptions(terminals, [{ scope: T1.id }])[1]!.label).toBe(`${T1.name} · own credentials`);
  });

  it("keeps a switched-off terminal only while it has credentials", () => {
    const off = [{ ...T1, active: false }];
    expect(scopeOptions(off, [])).toHaveLength(1);
    expect(scopeOptions(off, [{ scope: T1.id }])).toHaveLength(2);
  });

  it("round-trips a scope through the select value", () => {
    expect(scopeFrom(scopeValue(null))).toBeNull();
    expect(scopeFrom(scopeValue("all"))).toBe("all");
    expect(scopeFrom(scopeValue(3))).toBe(3);
  });

  it("accepts a complete Paybill and a complete Till", () => {
    expect(darajaErrors(paybill(), undefined, terminals)).toEqual({});
    expect(darajaErrors(paybill({ accountType: "till", paybill: "", storeNumber: "700100", tillNumber: "524118" }), undefined, terminals)).toEqual({});
  });

  it("asks for the scope, the numbers for the account type, and the three keys", () => {
    expect(darajaErrors(paybill({ scope: null, paybill: "", consumerKey: "", consumerSecret: " ", passkey: "" }), undefined, terminals)).toEqual({
      scope: "Choose what these credentials apply to",
      paybill: "Enter the Paybill number",
      consumerKey: "Enter the consumer key",
      consumerSecret: "Enter the consumer secret",
      passkey: "Enter the passkey",
    });
    expect(darajaErrors(paybill({ accountType: "till", paybill: "522522" }), undefined, terminals)).toEqual({ storeNumber: "Enter the store number", tillNumber: "Enter the till number" });
    expect(darajaErrors(paybill({ paybill: "52 25" }), undefined, terminals)).toEqual({ paybill: "Use digits only" });
    expect(darajaErrors(paybill({ scope: 999 }), undefined, terminals)).toEqual({ scope: "That terminal is not in the list" });
  });

  it("lets saved keys stay blank, and asks for an initiator password only with a name", () => {
    expect(darajaErrors(paybill({ consumerKey: "", consumerSecret: "", passkey: "" }), saved, terminals)).toEqual({});
    expect(darajaErrors(paybill({ initiatorName: "apiuser" }), saved, terminals)).toEqual({ initiatorPassword: "Enter the initiator password" });
    expect(darajaErrors(paybill({ initiatorName: "apiuser", initiatorPassword: "pw" }), saved, terminals)).toEqual({});
  });

  it("checks per-terminal account numbers", () => {
    const rows = (...r: [number, string][]) => paybill({ terminalAccounts: r.map(([terminalId, accountNumber]) => ({ terminalId, accountNumber })) });
    expect(darajaErrors(rows([T1.id, "SHOP1"]), undefined, terminals)).toEqual({});
    expect(darajaErrors(rows([0, "SHOP1"]), undefined, terminals)).toEqual({ terminalAccounts: "Choose a terminal for each row" });
    expect(darajaErrors(rows([T1.id, " "]), undefined, terminals)).toEqual({ terminalAccounts: `Enter the account number for ${T1.name}` });
    expect(darajaErrors(rows([T1.id, "A"], [T1.id, "B"]), undefined, terminals)).toEqual({ terminalAccounts: `${T1.name} is listed twice` });
  });

  it("checks a bank form", () => {
    const input = { scope: "all" as const, bank: "ncba" as const, env: "production" as const, tillNumber: "000001", qrTillCode: "" };
    expect(bankErrors(input, terminals)).toEqual({});
    expect(bankErrors({ ...input, scope: null, tillNumber: "" }, terminals)).toEqual({ scope: "Choose what these credentials apply to", tillNumber: "Enter your NCBA till number" });
    expect(bankErrors({ ...input, tillNumber: "TILL1" }, terminals)).toEqual({ tillNumber: "Use digits only" });
  });

  it("creates the same bank credentials for the same owner, and different ones for another", () => {
    const a = generateBankCredentials("ncba", "business");
    expect(generateBankCredentials("ncba", "business")).toEqual(a);
    expect(a.apiUsername).toBe("uzapro-ncba-business");
    expect(a.apiSecret).toHaveLength(32);
    expect(a.notifyUrl).toMatch(/^https:\/\/pay\.uzapro\.example\/ncba\/notify\/[a-z0-9]{12}$/);
    const b = generateBankCredentials("ncba", "BBL-TRM-001");
    expect(b.apiUsername).toBe("uzapro-ncba-bbl-trm-001");
    expect(b.apiSecret).not.toBe(a.apiSecret);
    expect(new Set([a.apiSecret, a.notifyPassword, a.notifySecret]).size).toBe(3);
  });
});

describe("QuickBooks rules (feature 015)", () => {
  const none = { invoices: false, payments: false, customers: false, products: false, expenses: false };

  it("accepts the starting settings", () => {
    expect(quickbooksErrors(QB_DEFAULT_SETTINGS)).toEqual({});
  });

  it("needs something to send, and an account only for what is sent", () => {
    expect(quickbooksErrors({ ...QB_DEFAULT_SETTINGS, send: none })).toEqual({ send: "Choose at least one thing to send" });
    expect(quickbooksErrors({ ...QB_DEFAULT_SETTINGS, send: { ...none, customers: true }, incomeAccount: "", depositAccount: "" })).toEqual({});
    expect(quickbooksErrors({ ...QB_DEFAULT_SETTINGS, send: { ...none, invoices: true, expenses: true }, incomeAccount: "" })).toEqual({
      incomeAccount: "Choose the income account for sales",
      expenseAccount: "Choose the account for expenses",
    });
  });

  it("counts only the chosen records, leaving out the walk-in customer", () => {
    const s = createSeed();
    const counts = quickbooksCounts(s, { ...none, invoices: true, customers: true });
    expect(counts).toEqual({ invoices: s.sales.invoices.length, customers: s.customers.length - 1 });
    expect(syncSummary({ customers: 4, invoices: 12 })).toBe("12 invoices, 4 customers");
  });
});
