import { describe, expect, it } from "vitest";
import { ageBucket, ageing, balance, creditStatus, planEach, planNextDue, planStep, rcvStatus } from "@/data/money";

const r = (o: Partial<Parameters<typeof rcvStatus>[0]>) => ({ ref: "", party: "", type: "", doc: "", due: "2026-11-30", priority: "Normal" as const, total: 0, paid: 0, raised: "", voided: false, ...o });

describe("money helpers (feature 003 research R1–R5)", () => {
  it("computes receivable statuses like the design (quickstart 1)", () => {
    expect(rcvStatus(r({ total: 45600, paid: 0, due: "2026-02-27" })).label).toBe("Overdue");
    expect(rcvStatus(r({ total: 68400, paid: 20000, due: "2026-11-19" })).label).toBe("Part paid");
    expect(rcvStatus(r({ total: 32000, paid: 0, due: "2026-12-05" })).label).toBe("Unpaid");
    expect(rcvStatus(r({ total: 12500, paid: 12500, due: "2026-09-30" })).label).toBe("Paid");
    expect(rcvStatus(r({ total: 500, paid: 0, voided: true })).label).toBe("Voided");
    expect(balance({ total: 68400, paid: 20000 })).toBe(48400);
    expect(balance({ total: 500, paid: 0, voided: true })).toBe(0);
  });
  it("puts PYB-0013 (due 25 Oct) in 1–30 days and future dues in not yet due", () => {
    expect(ageBucket("2026-10-25")).toBe("d30");
    expect(ageBucket("2026-11-20")).toBe("notDue");
    expect(ageBucket("2026-02-27")).toBe("over90");
    const rows = ageing([
      { party: "Magaliesburg Wheels", due: "2026-10-25", balance: 24200 },
      { party: "Eastside Bicycle Supplies", due: "2026-11-20", balance: 79560 },
      { party: "Eastside Bicycle Supplies", due: "2026-09-30", balance: 0 },
    ]);
    expect(rows.find((x) => x.party === "Magaliesburg Wheels")).toMatchObject({ d30: 24200, total: 24200, open: 1 });
    expect(rows.find((x) => x.party === "Eastside Bicycle Supplies")).toMatchObject({ notDue: 79560, open: 1 });
  });
  it("splits plans with ceil and steps monthly/weekly", () => {
    expect(planEach(32000, 3)).toBe(10667);
    expect(planEach(45600, 3)).toBe(15200);
    expect(planStep("2026-01-31", "Monthly")).toBe("2026-02-28");
    expect(planStep("2026-11-17", "Weekly", 2)).toBe("2026-12-01");
    expect(planNextDue({ start: "2026-11-15", freq: "Monthly", paid: 1, count: 3 })).toBe("2026-12-15");
    expect(planNextDue({ start: "2026-11-15", freq: "Monthly", paid: 3, count: 3 })).toBe("");
  });
  it("derives credit status", () => {
    const c = { ref: "", party: "", reason: "", issued: "", currency: "KES", notes: "", payRef: "", voided: false, expires: "" };
    expect(creditStatus({ ...c, amount: 4800, used: 0 }).label).toBe("Available");
    expect(creditStatus({ ...c, amount: 2000, used: 2000 }).label).toBe("Used up");
    expect(creditStatus({ ...c, amount: 2000, used: 500 }).label).toBe("Part used");
    expect(creditStatus({ ...c, amount: 2000, used: 0, expires: "2026-11-01" }).label).toBe("Expired");
    expect(creditStatus({ ...c, amount: 2000, used: 0, voided: true }).label).toBe("Voided");
  });
});
