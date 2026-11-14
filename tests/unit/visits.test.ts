import { beforeEach, describe, expect, it } from "vitest";
import { recordSale } from "@/data/commands/sales";
import { addVisit, noSaleOnVisit, sellOnVisit } from "@/data/commands/visits";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import { daySummary } from "@/data/visits";

let store: AppStore;
const s = () => store.getState();
const VAN = "Van KDG 412X";
const qty = (product: string, at: string) => s().stock.levels.find((l) => l.product === product && l.store === at)?.quantity ?? 0;
const visit = (id: string) => s().sales.visits.find((v) => v.id === id)!;
const frames = (n: number, payMethod = "Cash") => ({ lines: [{ product: "Aluminium Frame", variant: "54cm", unit: "Piece", qty: n, price: 31050, taxable: true }], payMethod });
const summary = () => daySummary(s().sales.visits, s().sales.sales, VAN, "2026-11-10");

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("van sales (feature 021)", () => {
  it("seeds a van with stock moved from the Main Store and two planned visits", () => {
    expect(s().stock.stores.find((x) => x.name === VAN)).toEqual({ name: VAN, branch: "Nairobi HQ", type: "Van" });
    expect([qty("Aluminium Frame", VAN), qty("Aluminium Frame", "Main Store"), qty("Carbon Road Frame", VAN), qty("Carbon Road Frame", "Main Store")]).toEqual([20, 145, 10, 25]);
    expect(s().sales.visits.map((v) => [v.id, v.customer, v.status])).toEqual([["VIS-0001", "Mountain Goats", "Planned"], ["VIS-0002", "Morningview Bicycles", "Planned"]]);
    expect(summary()).toEqual({ done: 0, total: 2, sold: 0, cash: 0, mpesa: 0, credit: 0 });
  });

  it("sells from the van and nowhere else, and marks the visit sold (SC-002)", async () => {
    const before = JSON.stringify(s().stock.levels.filter((l) => l.store !== VAN));
    const r = await sellOnVisit("VIS-0001", frames(2));
    expect(r.ok && r.value).toMatchObject({ customer: "Mountain Goats", store: VAN, channel: "Field sales", total: 72036 });
    expect(qty("Aluminium Frame", VAN)).toBe(18);
    expect(JSON.stringify(s().stock.levels.filter((l) => l.store !== VAN))).toBe(before);
    expect(visit("VIS-0001")).toMatchObject({ status: "Sold", sale: r.ok ? r.value.ref : "" });
    expect((await sellOnVisit("VIS-0001", frames(1))).message).toBe("The visit to Mountain Goats is already closed.");
    expect(qty("Aluminium Frame", VAN)).toBe(18);
  });

  it("refuses more than the van holds and a credit sale over the limit", async () => {
    expect((await sellOnVisit("VIS-0001", frames(21))).message).toBe(`Only 20 Aluminium Frame left at ${VAN}.`);
    expect(await sellOnVisit("VIS-0001", frames(1, "Pay later (credit)"))).toMatchObject({ ok: false, stop: { why: "limit" } }); // 36,018 against 19,600
    expect(visit("VIS-0001").status).toBe("Planned");
    expect(await sellOnVisit("VIS-0002", frames(1, "Pay later (credit)"))).toMatchObject({ ok: false, stop: { why: "overdue" } });
    const ok = await sellOnVisit("VIS-0001", { ...frames(1, "Pay later (credit)"), approval: { reason: "Agreed with the owner" } });
    expect(ok.ok).toBe(true);
  });

  it("splits the day's sales by how they were paid; cash to hand in is cash only (SC-003)", async () => {
    await sellOnVisit("VIS-0001", frames(1, "Cash"));
    await addVisit("Mountain Goats", VAN); // refused: already on the route
    await noSaleOnVisit("VIS-0002", "Shop closed");
    expect(summary()).toEqual({ done: 2, total: 2, sold: 36018, cash: 36018, mpesa: 0, credit: 0 });
    expect(visit("VIS-0002")).toMatchObject({ status: "No sale", reason: "Shop closed" });
    // A counter sale is not on the van's summary and still leaves Point of Sale (FR-010).
    const counter = await recordSale({ customer: "Walk-in Customer", lines: [{ product: "Bike Pump", variant: "Standard", unit: "Piece", qty: 1, price: 345, taxable: false }], payMethod: "Cash" });
    expect(counter.ok && counter.value).toMatchObject({ store: "Point of Sale", channel: "In-store" });
    expect(summary().sold).toBe(36018);
  });

  it("adds a visit for a named customer once per day, and needs a reason for no sale", async () => {
    expect((await addVisit("Mountain Goats", VAN)).message).toBe("Mountain Goats is already on today's route.");
    expect((await addVisit("Walk-in Customer", VAN)).message).toBe("Pick a customer");
    expect((await addVisit("Nobody", VAN)).ok).toBe(false);
    expect((await noSaleOnVisit("VIS-0001", "")).message).toBe("Pick a reason");
    expect((await noSaleOnVisit("VIS-0001", "Owner not in")).message).toBe("No sale recorded for Mountain Goats.");
    expect((await noSaleOnVisit("VIS-0001", "Other")).ok).toBe(false);
  });

  it("counts M-Pesa and credit separately", async () => {
    await sellOnVisit("VIS-0001", frames(1, "M-Pesa"));
    await sellOnVisit("VIS-0002", { ...frames(1, "Pay later (credit)"), approval: { reason: "Agreed with the owner" } });
    expect(summary()).toEqual({ done: 2, total: 2, sold: 72036, cash: 0, mpesa: 36018, credit: 36018 });
  });
});
