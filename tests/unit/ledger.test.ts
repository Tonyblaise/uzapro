import { describe, expect, it } from "vitest";
import { categorySpent, expenseEntries, post, postAll, recNext, recStep, repeatsLabel } from "@/data/ledger";
import { createSeed } from "@/data/store/seed";

const bal = (s: ReturnType<typeof createSeed>, name: string) => s.accounts.accounts.find((a) => a.name === name)!.balance;

describe("post", () => {
  it("adds a newest-first line and moves only that balance", () => {
    const s0 = createSeed();
    const s1 = post(s0, { date: "2026-11-01", account: "Cash drawer", ref: "DEP-0219", desc: "Float", kind: "Deposit", amt: 10000 });
    expect(bal(s1, "Cash drawer")).toBe(34600);
    expect(bal(s1, "M-Pesa Till")).toBe(386450);
    expect(s1.accounts.ledger[0]!.ref).toBe("DEP-0219");
    expect(s1.accounts.ledger).toHaveLength(s0.accounts.ledger.length + 1);
  });

  it("posts a transfer as two lines", () => {
    const s = postAll(createSeed(), [
      { date: "2026-11-01", account: "M-Pesa Till", ref: "TRN-0032", desc: "Transfer to Equity Bank — Main", kind: "Transfer", amt: -50000 },
      { date: "2026-11-01", account: "Equity Bank — Main", ref: "TRN-0032", desc: "Transfer from M-Pesa Till", kind: "Transfer", amt: 50000 },
    ]);
    expect(bal(s, "M-Pesa Till")).toBe(336450);
    expect(bal(s, "Equity Bank — Main")).toBe(4862300);
    expect(s.accounts.ledger.filter((e) => e.ref === "TRN-0032")).toHaveLength(2);
  });

  it("reverses an expense with its fee on void", () => {
    const e = { ref: "EXP-0040", account: "Cash drawer", reason: "Delivery fuel", category: "Transport", amount: 18650, fee: 30 };
    expect(expenseEntries(e).map((x) => x.amt)).toEqual([-18650, -30]);
    expect(expenseEntries(e, true).map((x) => [x.desc, x.amt])).toEqual([["Voided: Delivery fuel", 18650], ["Voided: Transaction cost", 30]]);
  });
});

describe("recurring schedule", () => {
  it("steps monthly on a fixed day and clamps short months", () => {
    expect(recStep({ freq: "Monthly", interval: 1, day: "31" }, "2026-01-31")).toBe("2026-02-28");
    expect(recNext({ freq: "Monthly", interval: 1, day: "5", start: "2026-03-05" })).toBe("2026-12-05");
    expect(recNext({ freq: "Monthly", interval: 1, day: "1", start: "2026-01-01" })).toBe("2026-12-01");
  });

  it("steps every 2 weeks", () => {
    expect(recStep({ freq: "Weekly", interval: 2, day: "" }, "2026-06-01")).toBe("2026-06-15");
    expect(repeatsLabel({ freq: "Weekly", interval: 2 })).toBe("Every 2 weeks");
    expect(repeatsLabel({ freq: "Monthly", interval: 1 })).toBe("Every month");
  });
});

describe("categorySpent", () => {
  it("counts paid November expenses only", () => {
    const s = createSeed();
    expect(categorySpent(s.expenses.expenses, "Rent")).toBe(185000);
    expect(categorySpent(s.expenses.expenses, "Internet and phone")).toBe(0);
    expect(categorySpent(s.expenses.expenses, "Utilities")).toBe(0);
  });
});
