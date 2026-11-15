import { beforeEach, describe, expect, it } from "vitest";
import { savePurchaseOrder } from "@/data/commands/purchases";
import { removeSupplierCredit, saveSupplier, saveSupplierCredit } from "@/data/commands/suppliers";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import { supplierCreditRows, supplierCreditStatus } from "@/data/supplierCredit";

let store: AppStore;
const s = () => store.getState();
const rows = () => supplierCreditRows(s().suppliers, s().money.payables, s().purchases.orders);
const row = (name: string) => rows().find((r) => r.supplier === name);

const po = (supplier: string, cost: number, paid = false) =>
  savePurchaseOrder(
    { supplier, store: "Main Store", date: "2026-11-10", expected: "", notes: "", term: "30 days", method: "Bank transfer", account: "", paid, lines: [{ key: "Bike Pump · Standard", qty: 1, unit: "Piece", cost }] },
    { approve: true },
  );

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("credit from suppliers (Suppliers › Supplier credits)", () => {
  it("seeds two suppliers that give credit, with owing and on order", () => {
    expect(rows().map((r) => r.supplier)).toEqual(["Eastside Bicycle Supplies", "Magaliesburg Wheels"]);
    expect(row("Eastside Bicycle Supplies")).toMatchObject({ limit: 250000, terms: "30 days", owing: 79560, onOrder: 0, left: 170440, status: { label: "Within limit" } });
    expect(row("Magaliesburg Wheels")).toMatchObject({ limit: 60000, owing: 24200, onOrder: 228, left: 35572 });
  });

  it("reads Near limit from 80% and Over limit above the limit", () => {
    expect(supplierCreditStatus(100, 79).label).toBe("Within limit");
    expect(supplierCreditStatus(100, 80).label).toBe("Near limit");
    expect(supplierCreditStatus(100, 101).label).toBe("Over limit");
  });

  it("adds, refuses duplicates, edits and removes", async () => {
    expect((await saveSupplierCredit("", { limit: 1000, terms: "7 days" })).message).toBe("Pick the supplier.");
    expect((await saveSupplierCredit("Road & Travel Tyres", { limit: 0, terms: "7 days" })).message).toBe("Enter a credit limit above 0.");
    expect((await saveSupplierCredit("Road & Travel Tyres", { limit: 40000, terms: "14 days" })).message).toBe("Credit from Road & Travel Tyres saved: KES 40,000, 14 days.");
    expect((await saveSupplierCredit("Road & Travel Tyres", { limit: 5000, terms: "7 days" })).message).toBe("Road & Travel Tyres already gives you credit. Edit it instead.");
    await saveSupplierCredit("Road & Travel Tyres", { limit: 5000, terms: "60 days" }, true);
    expect(row("Road & Travel Tyres")).toMatchObject({ limit: 5000, terms: "60 days", owing: 12800, status: { label: "Over limit" } });
    expect((await removeSupplierCredit("Road & Travel Tyres")).message).toBe("Credit from Road & Travel Tyres removed.");
    expect(row("Road & Travel Tyres")).toBeUndefined();
  });

  it("editing the supplier keeps its credit", async () => {
    const x = s().suppliers.find((v) => v.name === "Magaliesburg Wheels")!;
    await saveSupplier({ ...x, active: true, name: "Magaliesburg Wheels Ltd" }, x.name);
    expect(row("Magaliesburg Wheels Ltd")).toMatchObject({ limit: 60000 });
  });

  it("an unpaid order over the limit saves with a warning and counts as on order", async () => {
    expect((await po("Eastside Bicycle Supplies", 200000)).message).toBe("PUR-ORD-0410 saved. It is KES 29,560 over the credit Eastside Bicycle Supplies gives you.");
    expect(row("Eastside Bicycle Supplies")).toMatchObject({ onOrder: 200000, left: -29560, status: { label: "Over limit" } });
    expect((await po("Eastside Bicycle Supplies", 200000, true)).message).toBe("PUR-ORD-0411 saved.");
    expect((await po("Road & Travel Tyres", 900000)).message).toBe("PUR-ORD-0412 saved.");
  });
});
