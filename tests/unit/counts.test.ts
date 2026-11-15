import { beforeEach, describe, expect, it } from "vitest";
import { approveCount, cancelCount, saveCount, sendBackCount, startCount, submitCount } from "@/data/commands/counts";
import { recordSale } from "@/data/commands/sales";
import { countStatus, countTotals, signed, validCounted, variance } from "@/data/counts";
import { createAppStore, registerStore, type AppStore } from "@/data/store";

let store: AppStore;
const s = () => store.getState();
const qty = (product: string, at: string) => s().stock.levels.find((l) => l.product === product && l.store === at)?.quantity ?? 0;
const count = (ref: string) => s().stock.counts.find((c) => c.ref === ref)!;
const snapshot = () => JSON.stringify(s().stock.levels);
const atMain = () => s().stock.levels.filter((l) => l.store === "Main Store").map((l) => l.product);

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("count rules (feature 017)", () => {
  it("works out variance, totals and status", () => {
    expect([variance({ system: 30, counted: 33 }), variance({ system: 16, counted: 14 }), variance({ system: 5, counted: 5 }), variance({ system: 5, counted: null })]).toEqual([3, -2, 0, null]);
    expect([signed(3), signed(-2), signed(0), signed(null), signed(1200)]).toEqual(["+3", "−2", "0", "—", "+1,200"]);
    const lines = [{ product: "A", system: 30, counted: 33 }, { product: "B", system: 16, counted: 14 }, { product: "C", system: 5, counted: null }];
    expect(countTotals({ lines }, (p) => (p === "A" ? 100 : 1000))).toEqual({ lines: 3, counted: 2, over: 3, short: 2, net: 1, value: 300 - 2000 });
    expect(["In progress", "Waiting approval", "Approved", "Cancelled"].map((st) => countStatus({ status: st as "Approved" }).tone)).toEqual(["info", "warning", "success", "neutral"]);
    expect([validCounted(0), validCounted(7), validCounted(null), validCounted(-1), validCounted(1.5), validCounted(NaN)]).toEqual([true, true, true, false, false, false]);
  });

  it("seeds one approved partial count", () => {
    const c = count("CNT-0001");
    expect(c).toMatchObject({ store: "Point of Sale", status: "Approved", full: false, approvedBy: "Tony Blaise" });
    expect(countTotals(c, () => 1)).toMatchObject({ lines: 3, counted: 3, over: 1, short: 2, net: -1 });
  });
});

describe("count commands (feature 017)", () => {
  it("starts a full or partial count with the system quantities, one open count per store (US1)", async () => {
    const r = await startCount("Main Store", atMain());
    expect(r).toMatchObject({ ok: true, message: "CNT-0002 started.", value: { ref: "CNT-0002", status: "In progress", full: true, by: "Tony Blaise" } });
    expect(count("CNT-0002").lines.find((l) => l.product === "Bike Pump")).toEqual({ product: "Bike Pump", system: 30, counted: null });
    expect((await startCount("Main Store", ["Bike Pump"])).message).toBe("Main Store already has a count open: CNT-0002.");
    const partial = await startCount("Point of Sale", ["Helmet", "Nope"]);
    expect(partial.ok && partial.value).toMatchObject({ ref: "CNT-0003", full: false, lines: [{ product: "Helmet", system: 44, counted: null }] });
    expect((await startCount("Stores", [])).message).toBe("Tick at least one product");
    expect((await startCount("", ["Helmet"])).ok).toBe(false);
  });

  it("only approval changes stock, by exactly each variance (SC-001, SC-002)", async () => {
    await startCount("Main Store", atMain());
    const before = snapshot();
    expect((await saveCount("CNT-0002", { "Bike Pump": 33, "Racing Wheelset": 14 })).message).toBe("CNT-0002 saved.");
    expect((await saveCount("CNT-0002", { "Bike Pump": -1 })).message).toBe("Enter whole numbers of 0 or more");
    const left = count("CNT-0002").lines.filter((l) => l.counted === null).length;
    expect((await submitCount("CNT-0002")).message).toBe(`Count every line first. ${left} left.`);
    await saveCount("CNT-0002", Object.fromEntries(count("CNT-0002").lines.filter((l) => l.counted === null).map((l) => [l.product, l.system])));
    expect((await submitCount("CNT-0002")).message).toBe("CNT-0002 sent for approval.");
    expect((await saveCount("CNT-0002", { "Bike Pump": 1 })).ok).toBe(false);
    expect((await sendBackCount("CNT-0002")).message).toBe("CNT-0002 sent back for a recount.");
    expect(count("CNT-0002")).toMatchObject({ status: "In progress" });
    expect(count("CNT-0002").lines.find((l) => l.product === "Bike Pump")!.counted).toBe(33);
    await submitCount("CNT-0002");
    expect(snapshot()).toBe(before);

    expect((await approveCount("CNT-0002")).message).toBe("CNT-0002 approved. Stock updated.");
    expect(qty("Bike Pump", "Main Store")).toBe(33);
    expect(qty("Racing Wheelset", "Main Store")).toBe(14);
    expect(qty("Aluminium Frame", "Main Store")).toBe(145); // 165 less the 20 on the van (feature 021)
    expect(qty("Bike Pump", "Point of Sale")).toBe(28);
    const moves = s().stock.movements.filter((m) => m.ref === "CNT-0002");
    expect(moves.map((m) => [m.product, m.kind.label, m.change]).sort()).toEqual([["Bike Pump", "Counted", 3], ["Racing Wheelset", "Counted", -2]]);
    expect(count("CNT-0002")).toMatchObject({ status: "Approved", approvedBy: "Tony Blaise" });
    expect((await approveCount("CNT-0002")).ok).toBe(false);
    expect((await cancelCount("CNT-0002")).ok).toBe(false);
  });

  it("applies the variance to the current stock when stock moved during the count (research R1)", async () => {
    await startCount("Point of Sale", ["Helmet"]);
    await recordSale({ customer: "Walk-in Customer", lines: [{ product: "Helmet", variant: "Medium", unit: "Piece", qty: 4, price: 1639, taxable: true }], payMethod: "Cash" });
    await saveCount("CNT-0002", { Helmet: 41 }); // 3 short of the 44 the count started with
    await submitCount("CNT-0002");
    await approveCount("CNT-0002");
    expect(qty("Helmet", "Point of Sale")).toBe(37); // 40 after the sale, less the 3
  });

  it("cancels an open count without changing stock", async () => {
    await startCount("Main Store", ["Bike Pump"]);
    const before = snapshot();
    expect((await cancelCount("CNT-0002")).message).toBe("CNT-0002 cancelled.");
    expect(count("CNT-0002").status).toBe("Cancelled");
    expect(snapshot()).toBe(before);
    expect((await startCount("Main Store", ["Bike Pump"])).ok).toBe(true);
  });
});
