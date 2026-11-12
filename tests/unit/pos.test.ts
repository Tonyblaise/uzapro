import { beforeEach, describe, expect, it } from "vitest";
import {
  addPartPayment,
  charge,
  completePosSale,
  launchTill,
  pickCustomer,
  pressPin,
  setPayAmount,
  setPayMethod,
  tapProduct,
  addVariantToCart,
  chooseVariant,
} from "@/data/commands/pos";
import { checkoutFigures, closeDiff, expectedCash, matchCode, onShiftLabel, posTotals, productCode, quickCash, shiftCollections, todayStats, type PosProduct } from "@/data/pos";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import { createSeed } from "@/data/store/seed";

const seed = createSeed();
const seedDocs = seed.pos.shifts[1]!.refs.map((r) => seed.pos.docs[r]!);

describe("cart maths (design posVals)", () => {
  const cart = [
    { key: "a", product: "Bike Pump", variant: "Standard", price: 345, qty: 1 },
    { key: "b", product: "Helmet", variant: "Medium", price: 1639, qty: 1 },
  ];
  it("prices include VAT at 16/116", () => {
    expect(posTotals(cart, "", "KES")).toEqual({ gross: 1984, disc: 0, total: 1984, vat: 273.66, sub: 1710.34, count: 2 });
  });
  it("discounts in KES or %, capped at the cart value", () => {
    expect(posTotals(cart, "10", "%").disc).toBeCloseTo(198.4);
    expect(posTotals(cart, "84", "KES").total).toBe(1900);
    expect(posTotals(cart, "99999", "KES").total).toBe(0);
  });
  it("quick cash: Exact then rounded-up amounts", () => {
    expect(quickCash(1984).map((q) => q.label)).toEqual(["Exact", "2,000"]);
    expect(quickCash(1234).map((q) => q.label)).toEqual(["Exact", "1,250", "1,300", "1,500", "2,000"]);
  });
  it("checkout figures: change, cover, split and credit", () => {
    expect(checkoutFigures({ pays: [], method: "Cash", amt: "3000" }, 1984, true)).toMatchObject({ change: 1016, covered: true });
    expect(checkoutFigures({ pays: [], method: "M-Pesa", amt: "1000" }, 1984, true)).toMatchObject({ covered: false, canSplit: true });
    expect(checkoutFigures({ pays: [], method: "Credit", amt: null }, 1984, true).covered).toBe(false);
    expect(checkoutFigures({ pays: [], method: "Credit", amt: null }, 1984, false)).toMatchObject({ covered: true, creditPart: 1984 });
  });
});

describe("barcodes", () => {
  const products: PosProduct[] = [
    { name: "Bike Pump", cat: "Parts", vs: [["Standard", 345]], min: 345, max: 345, stock: 28 },
    { name: "Helmet", cat: "Apparel", vs: [["Small", 1639], ["Medium", 1639], ["Large", 1739]], min: 1639, max: 1739, stock: 44 },
  ];
  it("matches the design's codes, names and partial names", () => {
    expect(productCode("Bike Pump", "Standard")).toBe("bikpum-standard");
    expect(matchCode("BikPum-Standard", products)?.variant?.[0]).toBe("Standard");
    expect(matchCode("helmet large", products)?.variant?.[0]).toBe("Large");
    expect(matchCode("pump", products)?.variant?.[0]).toBe("Standard");
    expect(matchCode("helm", products)).toMatchObject({ variant: null });
    expect(matchCode("zzz", products)).toBeNull();
  });
});

describe("shift (seed)", () => {
  it("has six sales and the design's collections", () => {
    expect(seedDocs).toHaveLength(6);
    const c = shiftCollections(seedDocs);
    expect(c.Cash).toBe(1639 + 2329);
    expect(c.Card).toBe(4140);
    expect(c["M-Pesa"]).toBe(4858 + 4485 + 467);
    expect(expectedCash(seed.pos.shifts[1]!, seedDocs)).toBe(8968);
  });
  it("labels the close difference", () => {
    expect(closeDiff("8968", 8968).label).toBe("Drawer balances");
    expect(closeDiff("9000", 8968)).toMatchObject({ label: "Over by", diff: 32 });
    expect(closeDiff("8000", 8968).label).toBe("Short by");
    expect(closeDiff("", 8968).has).toBe(false);
  });
  it("Today stats find the busiest hour and best sellers", () => {
    const t = todayStats(seedDocs);
    expect(t.peak).toBe("Busiest: 10:00 – 11:00"); // 10h: 4,485 + 2,329; 11h: 1,639 + 4,858
    expect(t.top[0]!.name).toBe("Carbon Sole Shoes");
    expect(t.kpis.map((k) => k.label)).toEqual(["Sales this shift", "Paid orders", "Average sale", "Items sold"]);
  });
  it("on-shift label", () => {
    expect(onShiftLabel(0, (3 * 60 + 12) * 60000)).toBe("3h 12m");
  });
});

describe("completing a sale (design posApplySale)", () => {
  let store: AppStore;
  beforeEach(() => {
    store = createAppStore();
    registerStore(store);
    launchTill(1);
    for (const k of "1234") pressPin(k);
  });

  it("records a cash sale across Sales, stock and the cash drawer", () => {
    const s0 = store.getState();
    const cash0 = s0.accounts.accounts.find((a) => a.name === "Cash drawer")!.balance;
    const pumps0 = s0.stock.levels.find((l) => l.product === "Bike Pump" && l.store === "Point of Sale")!.quantity;
    tapProduct("Bike Pump");
    tapProduct("Helmet");
    chooseVariant("Medium");
    addVariantToCart();
    charge();
    setPayAmount("3000");
    const ref = completePosSale();
    expect(ref).toBe("SAL-001185");
    const s = store.getState();
    expect(s.sales.sales[0]).toMatchObject({ ref: "SAL-001185", channel: "POS", total: 1984, status: { label: "Paid" } });
    expect(s.stock.levels.find((l) => l.product === "Bike Pump" && l.store === "Point of Sale")!.quantity).toBe(pumps0 - 1);
    expect(s.accounts.accounts.find((a) => a.name === "Cash drawer")!.balance).toBe(cash0 + 1984);
    expect(s.accounts.ledger[0]).toMatchObject({ kind: "Sale", ref: "SAL-001185", amt: 1984 });
    expect(s.pos.docs["SAL-001185"]).toMatchObject({ change: 1016, tendered: 3000 });
    expect(s.pos.shifts[1]!.refs[0]).toBe("SAL-001185");
    expect(s.pos.ui).toMatchObject({ modal: "receipt", fresh: true, cart: [] });
  });

  it("splits M-Pesa and cash, and refuses credit for a walk-in", () => {
    tapProduct("Groupset");
    charge();
    setPayMethod("M-Pesa");
    setPayAmount("5000");
    addPartPayment();
    expect(store.getState().pos.ui.co).toMatchObject({ method: "Cash", pays: [{ method: "M-Pesa", amount: 5000 }] });
    setPayMethod("Credit");
    expect(completePosSale()).toBeNull();
    expect(store.getState().pos.ui.co.err).toBe("Pick a named customer to sell on credit.");
    setPayMethod("Cash");
    expect(completePosSale()).toBe("SAL-001185");
    expect(store.getState().sales.sales[0]!.payments.map((p) => p.method)).toEqual(["M-Pesa", "Cash"]);
  });

  it("pay later for a named customer adds a receivable", () => {
    tapProduct("Bike Pump");
    pickCustomer("Morningview Bicycles");
    charge();
    setPayMethod("Credit");
    completePosSale();
    const s = store.getState();
    expect(s.sales.sales[0]!.status.label).toBe("Unpaid");
    expect(s.money.receivables[0]).toMatchObject({ party: "Morningview Bicycles", type: "Sale on credit", doc: "SAL-001185", total: 345 });
  });

  it("blocks over-payment by card and uncovered sales", () => {
    tapProduct("Bike Pump");
    charge();
    setPayMethod("Card");
    setPayAmount("500");
    completePosSale();
    expect(store.getState().pos.ui.co.err).toBe("Card payment can't be more than what is due.");
    setPayAmount("100");
    completePosSale();
    expect(store.getState().pos.ui.co.err).toBe("KES 245.00 is still due. Add another payment or pay the full amount.");
  });
});
