import { describe, expect, it } from "vitest";
import { ROLES } from "@/config/roles";
import { receivableRows } from "@/data/money";
import { createSeed } from "@/data/store/seed";
import {
  answer,
  browseIdeas,
  chatAge,
  chatGroups,
  clipSubject,
  ideaVotes,
  lowStockRows,
  myIdeas,
  nextTicketRef,
  roadmap,
  similarIdeas,
  viewingLabel,
  type AnswerContext,
} from "@/data/uzaai";
import type { Receivable } from "@/data/types";

const seed = createSeed();
const ctx = (over: Partial<AnswerContext> = {}): AnswerContext => ({
  role: ROLES.owner,
  first: "Tony",
  awaiting: false,
  receivables: receivableRows(seed.money.receivables),
  lowStock: lowStockRows(),
  expenses: seed.expenses.expenses,
  ...over,
});
const reply = (q: string, over?: Partial<AnswerContext>) => {
  const a = answer(q, ctx(over));
  if (a.kind !== "reply") throw new Error(`expected a reply for "${q}", got ${a.kind}`);
  return a;
};

describe("Uza AI answers (design aiAnswer)", () => {
  it("lists overdue invoices largest first with totals and an Open Receivables action", () => {
    const a = reply("Overdue invoices");
    expect(a.text).toBe(
      "2 invoices are overdue, worth KES 46,626:\n• Morningview Bicycles, KES 45,600 (due 27 Feb 2026)\n• Blazing Cycle Trails, KES 1,026 (due 31 May 2026)\n\nIn total customers owe you KES 127,026.",
    );
    expect(a.act).toEqual({ kind: "screen", label: "Open Receivables", module: "rcv", tab: "Receivables" });
  });

  it("uses the singular, caps the list at 4, and says when nothing is late", () => {
    const base: Receivable = { ref: "R", party: "P", type: "Invoice", doc: "INV", due: "2026-01-01", priority: "Normal", total: 100, paid: 0, raised: "2026-01-01", voided: false };
    const one = receivableRows([base, { ...base, ref: "R2", due: "2026-12-31" }]);
    expect(reply("who owes me", { receivables: one }).text).toMatch(/^1 invoice is overdue, worth KES 100:/);
    const six = receivableRows(Array.from({ length: 6 }, (_, i) => ({ ...base, ref: `R${i}`, party: `P${i}`, total: 100 + i })));
    expect(reply("unpaid", { receivables: six }).text.match(/^• /gm)).toHaveLength(4);
    const none = receivableRows([{ ...base, due: "2026-12-31" }]);
    expect(reply("debt", { receivables: none }).text).toBe("No invoices are overdue. Customers owe you KES 100 in total, none of it late.");
  });

  it("lists low stock that is not Healthy", () => {
    expect(reply("What stock is running low?").text).toBe(
      "3 items need restocking:\n• Skateboard at Stores: 35 left (reorder at 50)\n• Knee pads at Stores: 0 left (reorder at 10)\n• Laser Printer at Office: 0 left (reorder at 5)",
    );
  });

  it("sums paid expenses this month and counts those waiting approval", () => {
    expect(reply("Spending this month").text).toBe("You have spent KES 185,000 on 1 paid expenses this month. 1 expense is waiting for approval.");
    const paidOnly = seed.expenses.expenses.filter((e) => e.status === "Paid");
    expect(reply("spent", { expenses: paidOnly }).text).not.toMatch(/waiting/);
  });

  it("answers how-to and sales questions with the design's wording", () => {
    expect(reply("How do I give a refund?").act?.label).toBe("Open Refunds");
    expect(reply("invoice").text).toMatch(/^To bill a customer, go to Sales › Invoices/);
    expect(reply("sales today").text).toBe("Sales so far: KES 184K today, KES 1.12M this week and KES 4.82M this month.");
    expect(reply("supplier").act).toMatchObject({ module: "buy", tab: "Purchase orders" });
  });

  it("greets, falls back, and asks for problem details first", () => {
    expect(reply("hello there").text).toBe("Hi Tony. What can I help you with? You can ask about sales, stock, money owed, expenses, or report a problem.");
    expect(reply("what's the weather").text).toMatch(/^I can help with money customers owe you/);
    expect(answer("my refund screen is broken", ctx())).toMatchObject({ kind: "askDetails" });
    expect(answer("anything", ctx({ awaiting: true }))).toEqual({ kind: "logTicket" });
  });

  it("refuses answers whose screen the role cannot see (Clarification Q1)", () => {
    const cashier = { role: ROLES.cashier };
    for (const [q, area] of [["Overdue invoices", "Receivables"], ["Low stock", "Stock"], ["spending", "Expenses"], ["invoice", "Invoices"], ["purchase order", "Purchases"]] as const) {
      const a = reply(q, cashier);
      expect(a.text).toBe(`You don't have access to ${area}. Ask the business owner.`);
      expect(a.act).toBeUndefined();
    }
    expect(reply("refund", cashier).act?.label).toBe("Open Refunds");
    expect(reply("sales", cashier).act?.label).toBe("Open Sales");
  });
});

describe("chat list", () => {
  it("ages chats relative to 10 Nov 2026", () => {
    expect(["2026-11-10", "2026-11-07", "2026-10-29", "2026-10-14", "2026-08-01"].map(chatAge)).toEqual(["Today", "3d", "2w", "4w", "3mo"]);
  });

  it("groups seeded chats and filters to the last 7 days", () => {
    const all = chatGroups(seed.ai.chats, "all");
    expect(all.map((g) => [g.label, g.chats.map((c) => c.id)])).toEqual([
      ["Last 7 days", ["c3"]],
      ["Older", ["c2", "c1"]],
    ]);
    expect(chatGroups(seed.ai.chats, "week").map((g) => g.label)).toEqual(["Last 7 days"]);
    expect(chatGroups([], "all")).toEqual([]);
  });
});

describe("tickets", () => {
  it("numbers from the highest ref with a 1042 floor", () => {
    expect(nextTicketRef(seed.ai.tickets)).toBe("TKT-1043");
    expect(nextTicketRef([])).toBe("TKT-1043");
    expect(nextTicketRef([{ ref: "TKT-1050" }])).toBe("TKT-1051");
  });

  it("clips long subjects to 57 characters plus an ellipsis", () => {
    expect(clipSubject("x".repeat(60))).toBe("x".repeat(60));
    expect(clipSubject("x".repeat(61))).toBe(`${"x".repeat(57)}…`);
  });
});

describe("feature ideas", () => {
  const { ideas, votes, mine } = seed.ai;

  it("counts the user's vote and builds the roadmap", () => {
    expect(ideaVotes(ideas.find((i) => i.id === "i6")!, votes)).toBe(159);
    expect(roadmap(ideas).map((g) => [g.status, g.ideas.length])).toEqual([
      ["Planned", 3],
      ["In progress", 1],
      ["Done", 1],
    ]);
  });

  it("browses by vote count and search, and lists my ideas", () => {
    expect(browseIdeas(ideas, votes, "")[0]!.id).toBe("i1");
    expect(browseIdeas(ideas, votes, "MPESA").map((i) => i.id)).toEqual(["i1"]);
    expect(myIdeas(ideas, votes, mine).map((i) => i.id)).toEqual(["i6"]);
  });

  it("finds similar ideas", () => {
    expect(similarIdeas(ideas, "WhatsApp receipts", "So customers get them fast")[0]!.id).toBe("i6");
    expect(similarIdeas(ideas, "Dark mode", "Easier on the eyes at night")).toEqual([]);
  });
});

describe("viewing label", () => {
  it("names the screen as the design does", () => {
    expect(viewingLabel("/dashboard")).toBe("Dashboard");
    expect(viewingLabel("/sales/invoices")).toBe("Sales › Invoices");
    expect(viewingLabel("/stock/overview")).toBe("Stock");
    expect(viewingLabel("/customers/customers")).toBe("Customers");
  });
});
