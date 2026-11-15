import { beforeEach, describe, expect, it } from "vitest";
import { approveCount, cancelCount, countLines, saveCount, sendBackCount, setCountNote, setCounted, startCount, submitCount, toggleBlind } from "@/data/commands/counts";
import { recordSale } from "@/data/commands/sales";
import { countStatus, countTotals, hidesSystem, signed, signedKes, validCounted, variance } from "@/data/counts";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import type { CountLine } from "@/data/types";

let store: AppStore;
const s = () => store.getState();
const qty = (product: string, at: string) => s().stock.levels.find((l) => l.product === product && l.store === at)?.quantity ?? 0;
const count = (ref: string) => s().stock.counts.find((c) => c.ref === ref)!;
const line = (product: string, system: number, counted: number | null): CountLine => ({ product, category: "Parts", variants: ["Standard"], system, counted, note: "" });
/** Count every line at its system figure, except the given ones. */
async function countAll(ref: string, except: Record<string, number> = {}) {
  for (const l of count(ref).lines) await setCounted(ref, l.product, except[l.product] ?? l.system);
}
const apparel = () => startCount({ store: "Main Store", scope: "cat", category: "Apparel", by: "Grant Jensen", blind: true });

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("count rules (feature 025)", () => {
  it("works out differences, totals and status", () => {
    expect([variance({ system: 30, counted: 33 }), variance({ system: 16, counted: 14 }), variance({ system: 5, counted: null })]).toEqual([3, -2, null]);
    expect([signed(3), signed(-2), signed(0), signed(null)]).toEqual(["+3", "−2", "0", "—"]);
    expect([signedKes(1200), signedKes(-980), signedKes(0)]).toEqual(["+KES 1,200", "−KES 980", "KES 0"]);
    const lines = [line("A", 30, 33), line("B", 16, 14), line("C", 5, 5), line("D", 5, null)];
    expect(countTotals({ lines }, (p) => (p === "A" ? 100 : 1000))).toEqual({ lines: 4, counted: 3, diffs: 2, shortLines: 1, overLines: 1, shortValue: -2000, overValue: 300, value: -1700 });
    expect((["Counting", "Waiting approval", "Approved", "Cancelled"] as const).map((st) => countStatus({ status: st }).tone)).toEqual(["info", "warning", "success", "danger"]);
    expect([hidesSystem({ blind: true, status: "Counting" }), hidesSystem({ blind: true, status: "Waiting approval" }), hidesSystem({ blind: false, status: "Counting" })]).toEqual([true, false, false]);
    expect([validCounted(0), validCounted(null), validCounted(-1), validCounted(1.5)]).toEqual([true, true, false, false]);
  });

  it("seeds the design's three counts, a line per product", () => {
    expect(s().stock.counts.map((c) => [c.ref, c.status, c.scope])).toEqual([
      ["SC-0015", "Counting", "Parts"],
      ["SC-0014", "Waiting approval", "Everything"],
      ["SC-0013", "Approved", "Everything"],
    ]);
    expect(count("SC-0015").lines[0]).toEqual({ product: "Racing Wheelset", category: "Parts", variants: ["700c", "650b"], system: 16, counted: 15, note: "650b: One box damaged" });
  });
});

describe("count commands (feature 025)", () => {
  it("refuses an incomplete start with the design's messages, and overlapping counts", async () => {
    expect((await startCount({ store: "", scope: "all", category: "", by: "Grant Jensen", blind: true })).message).toBe("Pick the store to count.");
    expect((await startCount({ store: "Main Store", scope: "cat", category: "", by: "Grant Jensen", blind: true })).message).toBe("Pick the category.");
    expect((await startCount({ store: "Main Store", scope: "all", category: "", by: "", blind: true })).message).toBe("Pick who is counting.");
    // SC-0015 is counting Parts at Main Store; SC-0014 counts everything at Point of Sale.
    expect((await startCount({ store: "Main Store", scope: "cat", category: "Parts", by: "Grant Jensen", blind: true })).message).toBe("Main Store already has a count open that covers this: SC-0015.");
    expect((await startCount({ store: "Point of Sale", scope: "cat", category: "Apparel", by: "Jane Smith", blind: true })).ok).toBe(false);
  });

  it("starts a category count with every product in it and the store's stock now", async () => {
    const r = await apparel();
    expect(r.ok && r.value.ref).toBe("SC-0016");
    const c = count("SC-0016");
    expect(c).toMatchObject({ store: "Main Store", scope: "Apparel", blind: true, by: "Grant Jensen", status: "Counting" });
    expect(c.lines.map((l) => l.product)).toEqual(countLines(s(), "Main Store", "Apparel").map((l) => l.product));
    expect(c.lines.every((l) => l.category === "Apparel" && l.counted === null)).toBe(true);
    expect(c.history[0]!.what).toBe("Count started");
  });

  it("saves counts and notes as you go; submit needs every line", async () => {
    await apparel();
    const first = count("SC-0016").lines[0]!.product;
    await setCounted("SC-0016", first, 3);
    await setCountNote("SC-0016", first, "Back shelf");
    await toggleBlind("SC-0016");
    expect(count("SC-0016")).toMatchObject({ blind: false, lines: expect.arrayContaining([expect.objectContaining({ product: first, counted: 3, note: "Back shelf" })]) });
    expect((await saveCount("SC-0016")).message).toBe("SC-0016 saved. Carry on any time.");
    const left = count("SC-0016").lines.length - 1;
    expect((await submitCount("SC-0016")).message).toBe(`${left} ${left === 1 ? "line is" : "lines are"} not counted yet. Count them, even if the answer is 0.`);
  });

  it("send back clears only the lines with differences; approve moves stock by each difference", async () => {
    await apparel();
    const shoes = qty("Carbon Sole Shoes", "Main Store");
    await countAll("SC-0016", { "Carbon Sole Shoes": shoes - 2 });
    expect((await submitCount("SC-0016")).message).toBe("SC-0016 sent for approval.");
    expect(count("SC-0016").history.at(-1)!.what).toMatch(/^Submitted for approval\. 1 differences, −KES /);

    expect((await sendBackCount("SC-0016")).message).toBe("Lines with differences cleared for recount.");
    const c = count("SC-0016");
    expect(c.status).toBe("Counting");
    expect(c.lines.filter((l) => l.counted === null).map((l) => l.product)).toEqual(["Carbon Sole Shoes"]);

    // Sold meanwhile: the difference applies to the stock as it is now.
    await setCounted("SC-0016", "Carbon Sole Shoes", shoes - 1);
    await submitCount("SC-0016");
    expect((await approveCount("SC-0016")).message).toBe("SC-0016 approved. Stock updated.");
    expect(qty("Carbon Sole Shoes", "Main Store")).toBe(shoes - 1);
    const move = s().stock.movements.find((m) => m.ref === "SC-0016")!;
    expect(move).toMatchObject({ product: "Carbon Sole Shoes", change: -1, kind: { label: "Count", tone: "warning" } });
    expect(count("SC-0016")).toMatchObject({ status: "Approved", approvedBy: "Tony Blaise" });
  });

  it("cancels an open count without changing stock", async () => {
    const before = JSON.stringify(s().stock.levels);
    expect((await cancelCount("SC-0015")).message).toBe("SC-0015 cancelled.");
    expect(count("SC-0015").history.at(-1)!.what).toBe("Count cancelled. Stock not changed");
    expect(JSON.stringify(s().stock.levels)).toBe(before);
    expect((await cancelCount("SC-0013")).message).toBe("SC-0013 can no longer be changed.");
  });

  it("approving applies to stock now, after a sale while counting", async () => {
    const helmets = qty("Helmet", "Point of Sale");
    await recordSale({ customer: "Walk-in Customer", lines: [{ product: "Helmet", variant: "Medium", unit: "Piece", qty: 1, price: 1639, taxable: true }], payMethod: "Cash" });
    await approveCount("SC-0014"); // Helmet counted 43 of 44: −1
    expect(qty("Helmet", "Point of Sale")).toBe(helmets - 2);
  });
});
