import { beforeEach, describe, expect, it } from "vitest";
import { createProduct, updateProduct } from "@/data/commands/catalog";
import { savePurchaseOrder, receiveGoods } from "@/data/commands/purchases";
import { createInvoice, recordSale, voidSale } from "@/data/commands/sales";
import { addStock, createTransfer, recordWastage } from "@/data/commands/stock";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import { containsLabel, defaultContains, unitFactor } from "@/data/units";

let store: AppStore;
const s = () => store.getState();
const qty = (product: string, at: string) => s().stock.levels.find((l) => l.product === product && l.store === at)?.quantity ?? 0;
const helmets = (n: number, unit = "Carton", price = 16390) => recordSale({ customer: "Walk-in Customer", lines: [{ product: "Helmet", variant: "Medium", unit, qty: n, price, taxable: true }], payMethod: "Cash" });

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("bulk units (feature 014)", () => {
  it("knows what each seed unit contains (FR-008)", () => {
    const p = s().catalog.products;
    expect(unitFactor(p, "Helmet", "Medium", "Carton")).toBe(10);
    expect(unitFactor(p, "Bike Pump", "Standard", "Box")).toBe(12);
    expect(unitFactor(p, "Muthokinju Paint", "White", "Tray")).toBe(6);
    expect(unitFactor(p, "Muthokinju Paint", "White", "Crate")).toBe(24);
    // Base unit, an undefined unit, no unit, an unknown product: all 1 (FR-004).
    expect(unitFactor(p, "Helmet", "Medium", "Piece")).toBe(1);
    expect(unitFactor(p, "Helmet", "Medium", "Pallet")).toBe(1);
    expect(unitFactor(p, "Helmet", "Medium", undefined)).toBe(1);
    expect(unitFactor(p, "Nope", "X", "Carton")).toBe(1);
    // An unknown variant name falls back to a variant that has the unit.
    expect(unitFactor(p, "Helmet", "", "Carton")).toBe(10);
    const v = p.find((x) => x.name === "Helmet")!.variants[0]!;
    expect(containsLabel(v, v.extraUnits[0]!)).toBe("Carton of 10 Piece");
    for (const prod of p) for (const variant of prod.variants) for (const u of variant.extraUnits) expect(u.price, `${prod.name} ${u.unit}`).toBe(variant.price * u.contains);
    expect(defaultContains(100, 1150)).toBe(12);
    expect(defaultContains(0, 50)).toBe(1);
  });

  it("a bulk sale takes its pieces, a piece sale takes one, and a shortage is in pieces (US1)", async () => {
    expect(qty("Helmet", "Point of Sale")).toBe(44);
    expect((await helmets(2)).ok).toBe(true);
    expect(qty("Helmet", "Point of Sale")).toBe(24);
    expect(s().stock.movements[0]).toMatchObject({ product: "Helmet", change: -20, left: 24 });
    expect((await helmets(3, "Piece", 1639)).ok).toBe(true);
    expect(qty("Helmet", "Point of Sale")).toBe(21);
    expect((await helmets(3)).message).toBe("Only 21 Helmet left at Point of Sale.");
    expect(qty("Helmet", "Point of Sale")).toBe(21);
    // A unit the product does not define moves by the line quantity (FR-004).
    expect((await helmets(2, "Pallet")).ok).toBe(true);
    expect(qty("Helmet", "Point of Sale")).toBe(19);
  });

  it("voiding a bulk sale puts the same pieces back", async () => {
    const r = await helmets(2);
    await voidSale(r.ok ? r.value.ref : "", "Entered by mistake");
    expect(qty("Helmet", "Point of Sale")).toBe(44);
  });

  it("an invoice in boxes takes its pieces", async () => {
    const r = await createInvoice({
      kind: "invoice",
      customer: "Mountain Goats",
      date: "2026-11-10",
      due: "2026-12-10",
      store: "Main Store",
      lines: [{ description: "Bike Pump · Standard", qty: 2, unit: "Box", rate: 100, taxable: false }],
      discount: { value: 0, type: "KES" },
      notes: "",
      terms: "",
    });
    expect(r.ok).toBe(true);
    expect(qty("Bike Pump", "Main Store")).toBe(6);
  });

  it("stock in, transfers and wastage convert too", async () => {
    await addStock({ store: "Main Store", items: [{ product: "Bike Pump", variant: "Standard", qty: 2, unit: "Box" }] });
    expect(qty("Bike Pump", "Main Store")).toBe(54);
    await createTransfer({ from: "Main Store", to: "Point of Sale", date: "2026-11-10", notes: "", items: [{ product: "Bike Pump", variant: "Standard", qty: 1, unit: "Box" }] }, "shipAndReceive");
    expect(qty("Bike Pump", "Main Store")).toBe(42);
    expect(qty("Bike Pump", "Point of Sale")).toBe(40);
    await recordWastage({ location: "Point of Sale", notes: "", items: [{ product: "Bike Pump", variant: "Standard", qty: 1, unit: "Box", reason: "Damaged" }] });
    expect(qty("Bike Pump", "Point of Sale")).toBe(28);
  });

  it("receiving a purchase order in crates adds its pieces", async () => {
    const po = await savePurchaseOrder(
      { supplier: "Eastside Bicycle Supplies", store: "Main Store", date: "2026-11-10", expected: "", notes: "", term: "", method: "", account: "", paid: false, lines: [{ key: "Muthokinju Paint · White", qty: 3, unit: "Crate", cost: 6720 }] },
      { approve: true },
    );
    const order = po.ok ? po.value : undefined;
    const r = await receiveGoods(order!.ref, { store: "Main Store", date: "2026-11-10", dn: "DN-1", inv: "", notes: "", lines: [{ id: order!.lines[0]!.id, recv: 3, acc: 2 }] });
    expect(r.ok).toBe(true);
    expect(qty("Muthokinju Paint", "Main Store")).toBe(48); // 2 accepted crates × 24
  });

  it("the product commands keep or default what a unit contains (FR-006)", async () => {
    const base = { category: "Parts", taxable: true };
    const made = await createProduct({ ...base, name: "Chain", variants: [{ name: "Standard", price: 500, cost: 300, unit: "Piece", extraUnits: [{ unit: "Box", price: 5500, cost: 3300, contains: 0 }, { unit: "Carton", price: 20000, cost: 0, contains: 48 }] }] });
    expect(made.ok && made.value.variants[0]!.extraUnits.map((u) => u.contains)).toEqual([11, 48]);
    await addStock({ store: "Main Store", items: [{ product: "Chain", variant: "Standard", qty: 1, unit: "Carton" }] });
    expect(qty("Chain", "Main Store")).toBe(48);
    const edited = await updateProduct("Chain", { ...base, name: "Chain", variants: [{ name: "Standard", price: 500, cost: 300, unit: "Piece", extraUnits: [{ unit: "Box", price: 5500, cost: 3300, contains: 12.4 }] }] });
    expect(edited.ok && edited.value.variants[0]!.extraUnits[0]!.contains).toBe(12);
  });
});
