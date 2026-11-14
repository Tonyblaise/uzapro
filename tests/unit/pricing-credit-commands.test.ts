import { beforeEach, describe, expect, it } from "vitest";
import { createCustomer, updateCustomer } from "@/data/commands/customers";
import { deleteProduct } from "@/data/commands/catalog";
import { changeLine, charge, completePosSale, launchTill, pickCustomer, pressPin, setCreditApproval, setPayMethod, tapProduct, tillCreditStop } from "@/data/commands/pos";
import { addCustomerGroup, deleteCustomerGroup, removePrice, renameCustomerGroup, savePrice } from "@/data/commands/pricing";
import { createInvoice, createQuotation, recordSale } from "@/data/commands/sales";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import type { NewDocument, NewSale } from "@/data/types";

let store: AppStore;
const as = (role: "owner" | "accountant" | "cashier" | "store") => store.setState((s) => ({ session: { ...s.session, role } }));
const helmets = (qty: number, price = 14900): NewSale["lines"] => [{ product: "Helmet", variant: "Medium", unit: "Carton", qty, price, taxable: true }];
const creditSale = (customer: string, qty: number, approval?: { reason: string }) => recordSale({ customer, lines: helmets(qty), payMethod: "Pay later (credit)", ...(approval ? { approval } : {}) });
const doc = (kind: "quote" | "invoice", customer: string, rate: number, approval?: { reason: string }): NewDocument => ({
  kind,
  customer,
  date: "2026-11-10",
  due: "2026-12-10",
  store: "Main Store",
  lines: [{ description: "Bike Pump · Standard", qty: 1, unit: "Piece", rate, taxable: false }],
  discount: { value: 0, type: "KES" },
  notes: "",
  terms: "",
  ...(approval ? { approval } : {}),
});

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("credit gate in the sale commands (feature 012, SC-003)", () => {
  it("lets a credit sale within the limit through, due after the customer's terms", async () => {
    const r = await creditSale("Mountain Goats", 1); // 14,900 + VAT = 17,284 ≤ 19,600
    expect(r.ok).toBe(true);
    expect(r.message).toBe("Credit sale recorded. KES 17,284.00 added to Receivables as RCV-0013, due in 30 days.");
    await updateCustomer("Mountain Goats", { name: "Mountain Goats", phone: "", email: "", address: "", terms: "7 days", creditLimit: 500000 });
    const next = await creditSale("Mountain Goats", 1);
    expect(next.message).toContain("due in 7 days.");
    expect(store.getState().money.receivables[0]!.due).toBe("2026-11-17");
  });

  it("stops a sale over the limit, and only an approver with a reason gets it through", async () => {
    const before = store.getState().sales.sales.length;
    const stopped = await creditSale("Mountain Goats", 2); // 34,568 > 19,600
    expect(stopped).toMatchObject({ ok: false, message: "Mountain Goats is over their credit limit.", stop: { why: "limit", over: 14968 } });
    expect((await creditSale("Mountain Goats", 2, { reason: "ok" })).ok).toBe(false);
    as("cashier");
    expect((await creditSale("Mountain Goats", 2, { reason: "Manager said yes" })).ok).toBe(false);
    expect(store.getState().sales.sales).toHaveLength(before);
    as("accountant");
    const done = await creditSale("Mountain Goats", 2, { reason: "  Paying on Friday  " });
    expect(done.ok).toBe(true);
    expect(store.getState().sales.sales[0]!.creditApproval).toMatchObject({ by: "Mary Achieng", reason: "Paying on Friday", why: "limit", amount: 14968 });
  });

  it("stops an overdue customer and a cash-terms customer", async () => {
    expect(await creditSale("Morningview Bicycles", 1)).toMatchObject({ ok: false, message: "Morningview Bicycles has KES 45,600.00 overdue.", stop: { why: "overdue" } });
    await updateCustomer("Mountain Goats", { name: "Mountain Goats", phone: "", email: "", address: "", terms: "Cash" });
    expect(await creditSale("Mountain Goats", 1)).toMatchObject({ ok: false, message: "Mountain Goats is on cash terms.", stop: { why: "cash" } });
  });

  it("does not check paid sales, quotations or the walk-in customer's refusal", async () => {
    expect((await recordSale({ customer: "Morningview Bicycles", lines: helmets(3), payMethod: "Cash" })).ok).toBe(true);
    expect((await createQuotation(doc("quote", "Morningview Bicycles", 900000))).ok).toBe(true);
    const walkIn = await recordSale({ customer: "Walk-in Customer", lines: helmets(1), payMethod: "Pay later (credit)" });
    expect(walkIn).toMatchObject({ ok: false, message: "Pick the customer first. Walk-in customers can't buy on credit." });
    expect(walkIn.ok === false && walkIn.stop).toBeFalsy();
  });

  it("checks a new invoice like a credit sale", async () => {
    expect((await createInvoice(doc("invoice", "Mountain Goats", 19600))).ok).toBe(true);
    expect(await createInvoice(doc("invoice", "Mountain Goats", 1))).toMatchObject({ ok: false, stop: { why: "limit", over: 1 } });
    expect(await createInvoice(doc("invoice", "Morningview Bicycles", 100))).toMatchObject({ ok: false, stop: { why: "overdue" } });
    const ok = await createInvoice(doc("invoice", "Morningview Bicycles", 100, { reason: "Agreed with the owner" }));
    expect(ok.ok && ok.value.creditApproval).toMatchObject({ why: "overdue", amount: 45600, reason: "Agreed with the owner" });
  });
});

describe("the till (feature 012, research R5)", () => {
  const openTill = () => {
    launchTill(1);
    for (const k of ["1", "2", "3", "4"]) pressPin(k);
  };

  it("prices the cart for the attached customer and reprices on quantity and customer changes", () => {
    openTill();
    tapProduct("Bike Pump");
    const line = () => store.getState().pos.ui.cart[0]!;
    expect(line()).toMatchObject({ price: 345, qty: 1 });
    pickCustomer("Mountain Goats");
    expect(line().price).toBe(345); // below the first break of 6
    changeLine(0, 5);
    expect(line()).toMatchObject({ qty: 6, price: 310, group: "g-distributor" });
    pickCustomer("Morningview Bicycles");
    expect(line()).toMatchObject({ price: 320, group: "g-wholesale" });
    pickCustomer("Walk-in Customer");
    expect(line().price).toBe(345);
    expect(line().group).toBeUndefined();
  });

  it("stops Pay later over the limit until it is approved", () => {
    openTill();
    tapProduct("Bike Pump");
    changeLine(0, 79); // 80 × 310 = 24,800 > 19,600
    pickCustomer("Mountain Goats");
    charge();
    setPayMethod("Credit");
    expect(tillCreditStop(store.getState())).toMatchObject({ why: "limit", amount: 24800, over: 5200 });
    expect(completePosSale()).toBeNull();
    expect(store.getState().pos.ui.co.err).toBe("Mountain Goats is over their credit limit.");
    as("cashier");
    setCreditApproval("Regular customer");
    expect(completePosSale()).toBeNull();
    as("owner");
    setCreditApproval("Regular customer");
    expect(completePosSale()).not.toBeNull();
    const s = store.getState();
    expect(s.sales.sales[0]!.creditApproval).toMatchObject({ why: "limit", amount: 5200 });
    expect(s.pos.ui.co.approval).toBe("");
  });
});

describe("customers, groups and price lists (feature 012)", () => {
  const input = { name: "Pedal Hub", phone: "", email: "", address: "" };

  it("defaults a new customer to Retail, no limit and 30 days, and validates the limit", async () => {
    const r = await createCustomer(input);
    expect(r.ok && r.value).toMatchObject({ group: "g-retail", creditLimit: null, terms: "30 days" });
    expect(await createCustomer({ ...input, name: "Other", creditLimit: -1 })).toMatchObject({ ok: false, message: "Enter an amount of 0 or more" });
    const u = await updateCustomer("Pedal Hub", { ...input, group: "g-wholesale", creditLimit: 25000, terms: "14 days" });
    expect(u.ok && u.value).toMatchObject({ group: "g-wholesale", creditLimit: 25000, terms: "14 days" });
    const keep = await updateCustomer("Pedal Hub", input);
    expect(keep.ok && keep.value).toMatchObject({ group: "g-wholesale", creditLimit: 25000, terms: "14 days" });
  });

  it("keeps the walk-in customer on Retail with no limit", async () => {
    const r = await updateCustomer("Walk-in Customer", { name: "Walk-in Customer", phone: "", email: "", address: "", group: "g-wholesale", creditLimit: 5, terms: "Cash" });
    expect(r.ok && r.value).toMatchObject({ group: "g-retail", creditLimit: null, terms: "30 days" });
  });

  it("adds, renames and deletes groups under the rules", async () => {
    const g = await addCustomerGroup(" Schools ");
    expect(g.ok && g.value).toMatchObject({ id: "g-1", name: "Schools", builtIn: false });
    expect((await addCustomerGroup("schools")).ok).toBe(false);
    expect((await renameCustomerGroup("g-retail", "Shops")).ok).toBe(false);
    expect((await renameCustomerGroup("g-1", "Colleges")).ok).toBe(true);
    expect(await deleteCustomerGroup("g-wholesale")).toMatchObject({ ok: false, message: "Move 1 customer to another group first." });
    expect((await deleteCustomerGroup("g-retail")).ok).toBe(false);
    expect((await deleteCustomerGroup("g-1")).ok).toBe(true);
    await updateCustomer("Morningview Bicycles", { name: "Morningview Bicycles", phone: "", email: "", address: "", group: "g-retail" });
    expect((await deleteCustomerGroup("g-wholesale")).ok).toBe(true);
    expect(store.getState().pricing.prices.some((e) => e.group === "g-wholesale")).toBe(false);
  });

  it("saves, edits and removes prices, and drops them with the product", async () => {
    const e = { group: "g-wholesale", product: "Bike Pump", variant: "Standard", unit: "Box", breaks: [{ from: 10, price: 3400 }, { from: 1, price: 3600 }] };
    expect((await savePrice(e)).ok).toBe(true);
    expect(store.getState().pricing.prices.at(-1)!.breaks.map((b) => b.from)).toEqual([1, 10]);
    expect(await savePrice(e)).toMatchObject({ ok: false, message: "This list already has a price for Bike Pump (Standard, Box). Edit that one." });
    expect((await savePrice({ ...e, breaks: [{ from: 1, price: 3500 }] }, e)).ok).toBe(true);
    expect((await savePrice({ ...e, group: "g-retail" })).ok).toBe(false);
    expect((await savePrice({ ...e, unit: "Pallet", variant: "Nope" })).ok).toBe(false);
    const n = store.getState().pricing.prices.length;
    await removePrice(e);
    expect(store.getState().pricing.prices).toHaveLength(n - 1);
    await deleteProduct("Helmet");
    expect(store.getState().pricing.prices.some((x) => x.product === "Helmet")).toBe(false);
  });
});
