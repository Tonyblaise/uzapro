import { beforeEach, describe, expect, it } from "vitest";
import { batchStatus, clampBatches, consume, daysLeft, daysLeftLabel, expiredQty, unbatchedQty, validateBatch } from "@/data/batches";
import { recordBatch, removeBatch, writeOffBatch } from "@/data/commands/batches";
import { deleteProduct } from "@/data/commands/catalog";
import { addVariantToCart, changeLine, charge, chooseVariant, completePosSale, launchTill, pressPin, tapProduct } from "@/data/commands/pos";
import { recordSale } from "@/data/commands/sales";
import { createTransfer } from "@/data/commands/stock";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import type { StockBatch } from "@/data/types";

let store: AppStore;
const s = () => store.getState();
const qty = (product: string, at: string) => s().stock.levels.find((l) => l.product === product && l.store === at)?.quantity ?? 0;
const paint = () => Object.fromEntries(s().stock.batches.filter((b) => b.product === "Muthokinju Paint").map((b) => [b.batch, b.qty]));
const sell = (n: number) => recordSale({ customer: "Walk-in Customer", lines: [{ product: "Muthokinju Paint", variant: "White", unit: "Piece", qty: n, price: 467, taxable: true }], payMethod: "Cash" });
const b = (id: string, expiry: string, q: number, o: Partial<StockBatch> = {}): StockBatch => ({ id, product: "P", store: "S", batch: id, expiry, qty: q, ...o });

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("batch rules (feature 016)", () => {
  it("works out days left and status against 10 Nov 2026", () => {
    expect([daysLeft("2026-10-31"), daysLeft("2026-11-10"), daysLeft("2026-11-28"), daysLeft("2027-04-30")]).toEqual([-10, 0, 18, 171]);
    expect(["2026-11-09", "2026-11-10", "2026-12-10", "2026-12-11"].map((d) => batchStatus({ expiry: d }).label)).toEqual(["Expired", "Expires soon", "Expires soon", "OK"]);
    expect(["2026-10-31", "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-28"].map((d) => daysLeftLabel(d))).toEqual(["Expired 10 days ago", "Expired 1 day ago", "Today", "1 day", "18 days"]);
  });

  it("sales use the earliest in-date batch first and never an expired one (SC-001, SC-003)", () => {
    const list = [b("late", "2027-01-01", 6), b("old", "2026-10-01", 2), b("soon", "2026-11-20", 4), b("other", "2026-11-01", 9, { store: "T" })];
    const after = (n: number, sold: boolean, batchId?: string) => Object.fromEntries(consume(list, "P", "S", n, { sold, ...(batchId ? { batchId } : {}) }).filter((x) => x.store === "S").map((x) => [x.id, x.qty]));
    expect(after(3, true)).toEqual({ late: 6, old: 2, soon: 1 });
    expect(after(5, true)).toEqual({ late: 5, old: 2 });
    expect(after(99, true)).toEqual({ old: 2 }); // the rest comes from stock not in a batch
    // Anything else clears the oldest first; a named batch goes before that.
    expect(after(3, false)).toEqual({ late: 6, soon: 3 });
    expect(after(5, false, "late")).toEqual({ late: 1, old: 2, soon: 4 });
    expect(consume(list, "P", "S", 3, { sold: true }).find((x) => x.id === "other")!.qty).toBe(9);
    expect(consume(list, "P", "S", 0, { sold: true })).toEqual(list);
  });

  it("counts expired and unbatched stock, and keeps batches within stock on hand (SC-002)", () => {
    const list = [b("old", "2026-10-01", 2), b("soon", "2026-11-20", 4)];
    expect(expiredQty(list, "P", "S")).toBe(2);
    expect(unbatchedQty(10, list, "P", "S")).toBe(4);
    expect(unbatchedQty(3, list, "P", "S")).toBe(0);
    expect(clampBatches(list, "P", "S", 3).map((x) => [x.id, x.qty])).toEqual([["soon", 3]]);
    expect(clampBatches(list, "P", "S", 6)).toEqual(list);
  });

  it("validates a batch", () => {
    const list = [b("A1", "2026-12-01", 4)];
    const input = { product: "P", store: "S", batch: "B2", expiry: "2026-12-31", qty: 6 };
    expect(validateBatch(input, list, 10)).toBeNull();
    expect(validateBatch({ ...input, qty: 7 }, list, 10)).toBe("Only 6 P at S is not in a batch yet.");
    expect(validateBatch({ ...input, batch: "a1" }, list, 10)).toBe("P already has a batch a1 at S.");
    expect(validateBatch({ ...input, batch: " " }, list, 10)).toBe("Enter a batch number");
    expect(validateBatch({ ...input, expiry: "" }, list, 10)).toBe("Pick the expiry date");
    expect(validateBatch({ ...input, qty: 1.5 }, list, 10)).toBe("Enter a quantity of 1 or more");
    expect(validateBatch({ ...input, qty: NaN }, list, 10)).toBe("Enter a quantity of 1 or more");
    expect(validateBatch(input, list, undefined)).toBe("Pick a product and store");
  });
});

describe("batches through the stock commands (feature 016)", () => {
  it("seeds three paint batches inside the 12 on hand", () => {
    expect(paint()).toEqual({ "MP-2409": 2, "MP-2411": 4, "MP-2502": 6 });
    expect(qty("Muthokinju Paint", "Point of Sale")).toBe(12);
  });

  it("a sale empties the earliest in-date batch first and leaves the expired one (US3)", async () => {
    expect((await sell(5)).ok).toBe(true);
    expect(paint()).toEqual({ "MP-2409": 2, "MP-2502": 5 });
    expect(qty("Muthokinju Paint", "Point of Sale")).toBe(7);
    // 5 in date + 2 expired: a sale of 6 is refused, 5 goes through.
    expect((await sell(6)).message).toBe("Only 5 Muthokinju Paint left at Point of Sale.");
    expect((await sell(5)).ok).toBe(true);
    expect(paint()).toEqual({ "MP-2409": 2 });
    expect(qty("Muthokinju Paint", "Point of Sale")).toBe(2);
  });

  it("the till never sells expired stock either", () => {
    launchTill(1);
    for (const k of "1234") pressPin(k);
    tapProduct("Muthokinju Paint"); // several variants: opens the chooser
    chooseVariant("White");
    addVariantToCart();
    expect(s().pos.ui.cart).toHaveLength(1);
    changeLine(0, 10); // 11 in the cart, 10 in date
    charge();
    expect(completePosSale()).toBeNull();
    expect(s().pos.ui.co.err).toBe("Only 10 Muthokinju Paint in date at Point of Sale. The rest has expired.");
    expect(qty("Muthokinju Paint", "Point of Sale")).toBe(12);
    changeLine(0, -1); // 10: exactly the in-date stock
    expect(completePosSale()).not.toBeNull();
    expect(paint()).toEqual({ "MP-2409": 2 });
  });

  it("a transfer clears the oldest batch first, expired included", async () => {
    await createTransfer({ from: "Point of Sale", to: "Main Store", date: "2026-11-10", notes: "", items: [{ product: "Muthokinju Paint", variant: "White", qty: 3, unit: "Piece" }] }, "shipAndReceive");
    expect(paint()).toEqual({ "MP-2411": 3, "MP-2502": 6 });
    expect(qty("Muthokinju Paint", "Main Store")).toBe(3);
  });

  it("writes off exactly the expired batch as wastage (US4)", async () => {
    const id = s().stock.batches.find((x) => x.batch === "MP-2409")!.id;
    expect((await writeOffBatch(s().stock.batches.find((x) => x.batch === "MP-2502")!.id)).message).toBe("Batch MP-2502 has not expired.");
    expect((await writeOffBatch(id)).message).toBe("Batch MP-2409 written off.");
    expect(paint()).toEqual({ "MP-2411": 4, "MP-2502": 6 });
    expect(qty("Muthokinju Paint", "Point of Sale")).toBe(10);
    expect(s().stock.wastage[0]).toMatchObject({ location: "Point of Sale", items: [{ product: "Muthokinju Paint", qty: 2, reason: "Expired" }] });
  });

  it("records a batch from stock that is not in one, and removes it without changing stock (US2)", async () => {
    const input = { product: "Bike Pump", store: "Main Store", batch: "BP-01", expiry: "2027-06-30", qty: 10 };
    const r = await recordBatch(input);
    expect(r).toMatchObject({ ok: true, message: "Batch BP-01 recorded.", value: { id: "b-4", qty: 10 } });
    expect((await recordBatch({ ...input, batch: "BP-02", qty: 25 })).message).toBe("Only 20 Bike Pump at Main Store is not in a batch yet.");
    expect((await recordBatch({ ...input, product: "Helmet" })).message).toBe("Pick a product and store");
    expect((await removeBatch("b-4")).message).toBe("Batch BP-01 removed.");
    expect(qty("Bike Pump", "Main Store")).toBe(30);
    expect(s().stock.batches).toHaveLength(3);
    await deleteProduct("Muthokinju Paint");
    expect(s().stock.batches).toHaveLength(0);
  });
});
