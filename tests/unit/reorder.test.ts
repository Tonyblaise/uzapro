import { beforeEach, describe, expect, it } from "vitest";
import { deleteProduct } from "@/data/commands/catalog";
import { receiveGoods } from "@/data/commands/purchases";
import { createReorderDrafts, removeReorderRule, reorderRows, saveReorderRule, setProductReorder } from "@/data/commands/reorder";
import { recordSale } from "@/data/commands/sales";
import { onOrderQty, reorderPosition, reorderStores, validateRule } from "@/data/reorder";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import type { ReorderRule } from "@/data/types";

let store: AppStore;
const s = () => store.getState();
const row = (product: string) => reorderRows(s()).find((r) => r.product === product)!;
const rule = (o: Partial<ReorderRule> = {}): ReorderRule => ({ product: "Carbon Sole Shoes", variant: "Size 42", store: "Main Store", min: 50, max: 80, unit: "Piece", supplier: "", ...o });

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("reorder rules (feature 014)", () => {
  it("suggests enough to reach the order-up-to level, rounded up to whole order units (SC-003)", () => {
    const r = { min: 24, max: 72 };
    expect(reorderPosition(r, 0, 0, 24)).toMatchObject({ units: 3, need: 72, status: { label: "Out of stock" } });
    expect(reorderPosition(r, 10, 0, 24)).toMatchObject({ units: 3, need: 72, status: { label: "Reorder now" } }); // 62 needed → 3 crates
    expect(reorderPosition(r, 24, 0, 1)).toMatchObject({ units: 48, status: { label: "Reorder now" } });
    expect(reorderPosition(r, 25, 0, 24)).toMatchObject({ units: 0, status: { label: "OK" } });
    expect(reorderPosition(r, 5, 48, 24)).toMatchObject({ units: 0, status: { label: "On order" } });
    expect(reorderPosition(r, 5, 10, 24)).toMatchObject({ units: 3, need: 72 }); // 57 needed
    for (const [onHand, onOrder, f] of [[0, 0, 24], [7, 3, 12], [23, 0, 10], [1, 20, 6]] as const) {
      const p = reorderPosition(r, onHand, onOrder, f);
      const after = onHand + onOrder + p.need;
      expect(after).toBeGreaterThanOrEqual(r.max);
      expect(after - r.max).toBeLessThan(f);
    }
  });

  it("counts what is still to come on open purchase orders, in base units (research R4)", () => {
    const products = s().catalog.products;
    const po = (status: string, store: string, lines: { key: string; qty: number; recv: number; unit: string }[]) => ({ store, status: { label: status, tone: "info" as const }, lines: lines.map((l, i) => ({ id: String(i), cost: 0, ...l })) });
    const orders = [
      po("Draft", "Main Store", [{ key: "Bike Pump · Standard", qty: 3, recv: 1, unit: "Box" }, { key: "Helmet · Medium", qty: 9, recv: 0, unit: "Piece" }]),
      po("Approved", "Main Store", [{ key: "Bike Pump · Standard", qty: 5, recv: 0, unit: "Piece" }]),
      po("Cancelled", "Main Store", [{ key: "Bike Pump · Standard", qty: 9, recv: 0, unit: "Box" }]),
      po("Completed", "Main Store", [{ key: "Bike Pump · Standard", qty: 9, recv: 0, unit: "Box" }]),
      po("Approved", "Point of Sale", [{ key: "Bike Pump · Standard", qty: 9, recv: 0, unit: "Box" }]),
      po("Approved", "Main Store", [{ key: "Items on PUR-ORD-0001", qty: 9, recv: 0, unit: "Piece" }]),
    ];
    expect(onOrderQty(orders, products, "Bike Pump", "Main Store")).toBe(2 * 12 + 5);
    expect(onOrderQty(orders, products, "Helmet", "Main Store")).toBe(9);
    expect(onOrderQty(orders, products, "Groupset", "Main Store")).toBe(0);
  });

  it("works out the seed lines (data-model.md)", () => {
    expect(reorderRows(s()).map((r) => [r.product, r.onHand, r.units, r.unit, r.status.label])).toEqual([
      ["Muthokinju Paint", 0, 3, "Crate", "Out of stock"],
      ["Racing Wheelset", 16, 24, "Piece", "Reorder now"],
      ["Groupset", 3, 7, "Piece", "Reorder now"],
      ["Bike Pump", 30, 0, "Box", "OK"],
      ["Helmet", 44, 0, "Carton", "OK"],
    ]);
    expect(row("Muthokinju Paint")).toMatchObject({ need: 72, factor: 24 });
  });

  it("follows stock as it is sold (US2)", async () => {
    await recordSale({ customer: "Walk-in Customer", lines: [{ product: "Helmet", variant: "Medium", unit: "Carton", qty: 3, price: 16390, taxable: true }], payMethod: "Cash" });
    expect(row("Helmet")).toMatchObject({ onHand: 14, units: 5, need: 50, status: { label: "Reorder now" } }); // 46 needed → 5 cartons
  });

  it("validates a line", () => {
    const { reorder } = s().stock;
    const products = s().catalog.products;
    expect(validateRule(rule(), reorder, products)).toBeNull();
    expect(validateRule(rule({ variant: "Nope" }), reorder, products)).toBe("Pick a product, variant and store");
    expect(validateRule(rule({ store: "" }), reorder, products)).toBe("Pick a product, variant and store");
    expect(validateRule(rule({ min: -1 }), reorder, products)).toBe("Enter a reorder point of 0 or more");
    expect(validateRule(rule({ min: NaN }), reorder, products)).toBe("Enter a reorder point of 0 or more");
    expect(validateRule(rule({ max: 50 }), reorder, products)).toBe("Order up to must be above the reorder point");
    const clash = rule({ product: "Bike Pump", variant: "Standard" });
    expect(validateRule(clash, reorder, products)).toBe("Bike Pump already has a reorder point at Main Store. Edit that one.");
    expect(validateRule(clash, reorder, products, { product: "Bike Pump", store: "Main Store" })).toBeNull();
  });
});

describe("reorder commands (feature 014)", () => {
  it("adds, edits and removes a line, and drops it with its product", async () => {
    expect((await saveReorderRule(rule())).message).toBe("Reorder point saved.");
    expect(row("Carbon Sole Shoes")).toMatchObject({ onHand: 40, units: 40, status: { label: "Reorder now" } });
    expect((await saveReorderRule(rule())).ok).toBe(false);
    expect((await saveReorderRule(rule({ max: 60, unit: "Pallet" }), { product: "Carbon Sole Shoes", store: "Main Store" })).ok).toBe(true);
    expect(row("Carbon Sole Shoes")).toMatchObject({ units: 20, unit: "Piece" }); // an unknown unit falls back to the base unit
    expect(s().stock.reorder).toHaveLength(6);
    await removeReorderRule("Carbon Sole Shoes", "Main Store");
    expect(s().stock.reorder).toHaveLength(5);
    await deleteProduct("Helmet");
    expect(s().stock.reorder.some((r) => r.product === "Helmet")).toBe(false);
  });

  it("creates one draft per supplier and store, skips lines with no supplier, and does not repeat itself (US3, SC-004)", async () => {
    const before = s().purchases.orders.length;
    const r = await createReorderDrafts();
    expect(r.message).toBe("2 draft purchase orders created. 1 skipped: no supplier set.");
    const made = s().purchases.orders.slice(0, s().purchases.orders.length - before);
    expect(made.map((o) => [o.supplier, o.store, o.status.label])).toEqual(expect.arrayContaining([["Eastside Bicycle Supplies", "Main Store", "Draft"], ["Magaliesburg Wheels", "Main Store", "Draft"]]));
    const paint = made.find((o) => o.supplier === "Eastside Bicycle Supplies")!;
    expect(paint.lines.map((l) => [l.key, l.qty, l.unit, l.cost])).toEqual([["Muthokinju Paint · White", 3, "Crate", 280 * 24]]);
    expect(paint.total).toBe(3 * 280 * 24);
    const wheels = made.find((o) => o.supplier === "Magaliesburg Wheels")!;
    expect(wheels.lines.map((l) => [l.key, l.qty, l.unit, l.cost])).toEqual([["Racing Wheelset · 700c", 24, "Piece", 8280]]);

    expect(row("Muthokinju Paint")).toMatchObject({ onOrder: 72, units: 0, status: { label: "On order" } });
    expect(row("Racing Wheelset")).toMatchObject({ onOrder: 24, units: 0, status: { label: "On order" } });
    const again = await createReorderDrafts();
    expect(again.message).toBe("No draft purchase orders created. 1 skipped: no supplier set.");
    expect(s().purchases.orders).toHaveLength(before + 2);

    // Receiving the draft in full brings the line back to OK.
    await receiveGoods(paint.ref, { store: "Main Store", date: "2026-11-10", dn: "DN-9", inv: "", notes: "", lines: [{ id: paint.lines[0]!.id, recv: 3, acc: 3 }] });
    expect(row("Muthokinju Paint")).toMatchObject({ onHand: 72, onOrder: 0, units: 0, status: { label: "OK" } });
  });

  it("says so when nothing needs reordering", async () => {
    for (const r of s().stock.reorder.filter((x) => reorderRows(s()).find((y) => y.product === x.product)!.units > 0)) await removeReorderRule(r.product, r.store);
    expect((await createReorderDrafts()).message).toBe("Nothing needs reordering.");
  });
});

describe("reorder points set from the product form", () => {
  const shoes = () => s().stock.reorder.filter((r) => r.product === "Carbon Sole Shoes");
  const STORES = ["Main Store", "Finished Goods", "Stores", "Point of Sale"];

  it("applies to every store stock is bought into, not transit or vans", () => {
    expect(reorderStores(s().stock.stores).map((x) => x.name)).toEqual(STORES);
  });

  it("creates the same rule at every store, ordering that variant in its base unit", async () => {
    expect(shoes()).toHaveLength(0);
    const r = await setProductReorder("Carbon Sole Shoes", { variant: "Size 43", min: 10, max: 30 });
    expect(r.ok).toBe(true);
    expect(shoes().map((x) => x.store).sort()).toEqual([...STORES].sort());
    for (const x of shoes()) expect(x).toMatchObject({ variant: "Size 43", min: 10, max: 30, unit: "Piece", supplier: "" });
  });

  it("keeps a store's order unit and supplier, and replaces its levels", async () => {
    await saveReorderRule(rule({ supplier: "Eastside Bicycle Supplies" }));
    await setProductReorder("Carbon Sole Shoes", { variant: "Size 42", min: 5, max: 20 });
    expect(shoes()).toHaveLength(STORES.length);
    expect(shoes().find((x) => x.store === "Main Store")).toMatchObject({ min: 5, max: 20, supplier: "Eastside Bicycle Supplies" });
  });

  it("refuses bad levels and removes every store's rule with null", async () => {
    expect((await setProductReorder("Carbon Sole Shoes", { variant: "Size 42", min: 50, max: 40 })).message).toBe("Order up to must be above the reorder point");
    expect((await setProductReorder("Carbon Sole Shoes", { variant: "Size 99", min: 1, max: 2 })).ok).toBe(false);
    expect(shoes()).toHaveLength(0);
    await setProductReorder("Carbon Sole Shoes", { variant: "Size 42", min: 1, max: 2 });
    await setProductReorder("Carbon Sole Shoes", null);
    expect(shoes()).toHaveLength(0);
  });
});
