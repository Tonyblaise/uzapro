import { describe, expect, it } from "vitest";
import { approvalReasonOk, creditFlag, creditPosition, creditStop, termDays } from "@/data/credit";
import { createSeed } from "@/data/store/seed";
import type { Receivable } from "@/data/types";

const seed = createSeed();
const cust = (name: string) => seed.customers.find((c) => c.name === name)!;
const pos = (name: string) => creditPosition(cust(name), seed.money.receivables);
const rcv = (o: Partial<Receivable>): Receivable => ({ ref: "RCV-1", party: "A", type: "Invoice", doc: "INV-1", due: "2026-12-01", priority: "Normal", total: 0, paid: 0, raised: "", voided: false, ...o });
const c = (o: Partial<{ creditLimit: number | null; terms: "Cash" | "7 days" | "14 days" | "30 days" }> = {}) => ({ name: "A", creditLimit: 1000 as number | null, terms: "30 days" as const, ...o });

describe("credit rules (feature 012)", () => {
  it("reads terms as days", () => {
    expect(["Cash", "7 days", "14 days", "30 days"].map((t) => termDays(t as "Cash"))).toEqual([0, 7, 14, 30]);
  });

  it("works out the seed positions (research R10)", () => {
    expect(pos("Mountain Goats")).toMatchObject({ limit: 100000, owed: 80400, available: 19600, overdue: 0, oldest: null, terms: "30 days" });
    expect(pos("Morningview Bicycles")).toMatchObject({ limit: 50000, owed: 45600, available: 4400, overdue: 45600, oldest: { ref: "RCV-0012", doc: "INV-0351", due: "2026-02-27" } });
    expect(pos("Walk-in Customer")).toMatchObject({ limit: null, owed: 0, available: null, overdue: 0 });
    expect(cust("Walk-in Customer").group).toBe("g-retail");
    expect(cust("Mountain Goats").group).toBe("g-distributor");
  });

  it("ignores paid and voided receivables and other parties", () => {
    const p = creditPosition(c(), [rcv({ total: 500, paid: 500 }), rcv({ total: 400, voided: true }), rcv({ total: 300, party: "B" }), rcv({ total: 200, paid: 50 })]);
    expect(p).toMatchObject({ owed: 150, available: 850, overdue: 0 });
  });

  it("picks the earliest overdue receivable and never shows negative credit", () => {
    const p = creditPosition(c({ creditLimit: 100 }), [rcv({ ref: "R2", due: "2026-10-01", total: 90 }), rcv({ ref: "R1", due: "2026-09-01", total: 60 }), rcv({ ref: "R3", due: "2026-11-10", total: 10 })]);
    expect(p).toMatchObject({ owed: 160, available: 0, overdue: 150, oldest: { ref: "R1" } });
    expect(creditFlag(p)).toBe("Overdue");
    expect(creditFlag(creditPosition(c({ creditLimit: 100 }), [rcv({ total: 160 })]))).toBe("Over limit");
    expect(creditFlag(creditPosition(c(), []))).toBeNull();
  });

  it("takes open orders off the available credit (feature 013)", () => {
    const line = { product: "P", variant: "V", unit: "Box", qty: 4, rate: 100, taxable: false, dispatched: 2, invoiced: 1 };
    const orders = [
      { customer: "A", cancelled: false, lines: [line] },
      { customer: "A", cancelled: true, lines: [line] },
      { customer: "B", cancelled: false, lines: [line] },
    ];
    const p = creditPosition(c(), [rcv({ total: 200 })], orders);
    expect(p).toMatchObject({ owed: 200, onOrder: 300, available: 500 });
    expect(creditStop(p, 501)?.why).toBe("limit");
    expect(creditFlag(creditPosition(c({ creditLimit: 400 }), [rcv({ total: 200 })], orders))).toBe("Over limit");
  });

  it("stops over the limit and lets the exact amount through", () => {
    const p = pos("Mountain Goats");
    expect(creditStop(p, 19600)).toBeNull();
    expect(creditStop(p, 30000)).toMatchObject({ why: "limit", amount: 30000, over: 10400 });
    expect(creditStop(p, 0)).toBeNull();
  });

  it("stops an overdue customer whatever the amount", () => {
    expect(creditStop(pos("Morningview Bicycles"), 100)).toMatchObject({ why: "overdue", over: 45600 });
  });

  it("checks cash terms first, then overdue, then the limit (research R8)", () => {
    const overdue = [rcv({ due: "2026-01-01", total: 5000 })];
    expect(creditStop(creditPosition(c({ terms: "Cash" }), overdue), 10)?.why).toBe("cash");
    expect(creditStop(creditPosition(c(), overdue), 10)?.why).toBe("overdue");
    expect(creditStop(creditPosition(c(), []), 1001)?.why).toBe("limit");
  });

  it("skips the limit check with no limit but still checks overdue", () => {
    expect(creditStop(creditPosition(c({ creditLimit: null }), []), 9_000_000)).toBeNull();
    expect(creditStop(creditPosition(c({ creditLimit: null }), [rcv({ due: "2026-01-01", total: 1 })]), 5)?.why).toBe("overdue");
  });

  it("needs an approval reason of at least 5 characters", () => {
    expect(approvalReasonOk("ok")).toBe(false);
    expect(approvalReasonOk("    ")).toBe(false);
    expect(approvalReasonOk(undefined)).toBe(false);
    expect(approvalReasonOk("Owner agreed")).toBe(true);
  });
});
