import { describe, expect, it } from "vitest";
import { reportCharts } from "@/data/reportCharts";
import { receivableRows } from "@/data/money";
import { runReport, type ReportSource } from "@/data/reports";
import { createSeed } from "@/data/store/seed";
import type { ReportPeriod } from "@/data/types";

const s = createSeed();
const src: ReportSource = {
  receivables: receivableRows(s.money.receivables),
  payables: s.money.payables,
  creditNotes: s.sales.creditNotes,
  expenses: s.expenses.expenses,
  accounts: s.accounts.accounts,
  ledger: s.accounts.ledger,
  levels: s.stock.levels,
  movements: s.stock.movements,
  wastage: s.stock.wastage,
  products: s.catalog.products,
  targets: s.sales.targets,
  sales: s.sales.sales,
  stores: s.stock.stores,
};
const charts = (name: string, period: ReportPeriod = "This month") => reportCharts(name, runReport(name, period, src), period);
const texts = (name: string) => charts(name).insights.map((i) => i.text);

describe("report charts and analysis (design repCharts)", () => {
  it("Sales summary: bars, a donut adding up to 100%, the monthly trend and the analysis", () => {
    const c = charts("Sales summary");
    expect(c.bars).toMatchObject({ title: "Top 3 by sales", sub: "This month" });
    expect(c.bars!.bars[0]).toMatchObject({ label: "POS", value: "KES 2,050,000", width: 100, color: "#16a34a" });
    expect(c.donut).toMatchObject({ title: "Share of sales", total: "4,820,000" });
    expect(c.donut!.legend.reduce((a, l) => a + parseFloat(l.pct), 0)).toBeCloseTo(100, 0);
    expect(c.trend!.months.map((m) => m.label)).toEqual(["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]);
    expect(c.trend!.months[6]).toMatchObject({ partial: true, h2: null, tip: "Nov: Sales 2.17M" });
    expect(texts("Sales summary")).toEqual([
      "POS is the largest at KES 2,050,000, 43% of the total.",
      "Invoice is the smallest at KES 1,330,000.",
      "Sales in Oct were up 12% on Sep, and up 55% since May.",
      "Net sales: KES 4,820,000.",
    ]);
  });

  it("warns when the top 3 carry most of the total", () => {
    expect(texts("Sales by customer")[1]).toBe("The top 3 make up 85% of the total. That is a lot riding on a few names, so watch them closely.");
    expect(charts("Stock valuation").bars!.bars).toHaveLength(8);
  });

  it("Profit & loss: line by line without totals, no donut, sales and purchases trend", () => {
    const c = charts("Profit & loss");
    expect(c.bars!.title).toBe("Line by line");
    expect(c.bars!.bars.some((b) => /^(total|gross profit|net )/i.test(b.label))).toBe(false);
    expect(c.donut).toBeNull();
    expect(c.trend!.series.map((s) => s.label)).toEqual(["Sales", "Purchases"]);
    expect(texts("Profit & loss")).toContain("Purchases were 71% of sales in Oct.");
  });

  it("Aged receivables: owed by age from the total row, and how much is late", () => {
    const c = charts("Aged receivables");
    expect(c.bars!.title).toBe("Owed by age");
    expect(c.donut).toBeNull();
    expect(texts("Aged receivables")).toEqual(["KES 46,626 (37%) is more than 30 days late. Follow up on the oldest first."]);
  });

  it("stock, targets and the trial balance get their own sentences", () => {
    expect(texts("Low stock")).toEqual(["3 of 4 items are at or below their reorder level. Out of stock: Knee pads, Laser Printer."]);
    expect(charts("Low stock").donut).toBeNull();
    expect(texts("Sales targets")).toEqual(["Every target is at least halfway there."]);
    expect(texts("Trial balance")).toEqual(["Debits and credits both come to KES 8,000,376, so the books balance."]);
  });

  it("Cash flow flags negative lines and money kept", () => {
    expect(texts("Cash flow")).toEqual([
      "1 item is negative: Withdrawal.",
      "Inflow in Oct was up 11% on Sep, and up 52% since May.",
      "More money came in than went out in each of the last 6 months. In Oct you kept 26% of what came in.",
      "Net cash flow: KES −139,400 (2 transactions).",
    ]);
    expect(charts("Cash flow").bars!.bars.find((b) => b.label === "Withdrawal")!.color).toBe("#dc2626");
  });

  it("a report with no rows shows no charts", () => {
    const c = reportCharts("Stock movement", runReport("Stock movement", "This month", { ...src, movements: [] }), "This month");
    expect(c).toEqual({ bars: null, donut: null, trend: null, insights: [] });
  });
});
