import { describe, expect, it } from "vitest";
import { REPORT_NAMES } from "@/data/fixtures/reports";
import { REPORT_CARDS } from "@/data/fixtures/generic";
import { receivableRows } from "@/data/money";
import { formatCell, periodFromSlug, periodSlug, repFmt, reportCsv, reportFromSlug, reportSlug, runReport, type ReportSource } from "@/data/reports";
import { createSeed } from "@/data/store/seed";
import type { ReportCell, ReportPeriod, ReportResult } from "@/data/types";

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
const run = (name: string, period: ReportPeriod = "This month", over: Partial<ReportSource> = {}) => runReport(name, period, { ...src, ...over });
const kpi = (r: ReportResult, label: string) => r.kpis.find((k) => k.label === label)!;
const n = (c: ReportCell | undefined) => c as number;
const text = (r: ReportResult) => r.rows.map((row) => row.map((c, i) => formatCell(c, r.cols[i])));

describe("Sales summary (design repRun)", () => {
  it("scales the design's sales and orders by period", () => {
    const got = (["This month", "Last month", "This year"] as const).map((p) => {
      const r = run("Sales summary", p);
      return [kpi(r, "Total sales").value, kpi(r, "Total sales").note];
    });
    expect(got).toEqual([
      ["KES 4,820,000", "1,100 orders"],
      ["KES 4,290,000", "979 orders"],
      ["KES 38,600,000", "8,809 orders"],
    ]);
  });

  it("has three channels, a Total row and the design's subtitle", () => {
    const r = run("Sales summary");
    expect(r.sub).toBe("This month · 1 Nov 2026 to 10 Nov 2026");
    expect(text(r).map((row) => row[0])).toEqual(["POS", "Invoice", "Ecommerce"]);
    expect(text(r)[0]).toEqual(["POS", "468", "2,050,000", "4,380", "42.5%"]);
    expect(r.total?.[0]).toBe("Total");
    expect(kpi(r, "Total sales").tone).toBe("green");
    expect(kpi(r, "Refunds").tone).toBe("danger");
  });
});

describe("money reports", () => {
  it("Profit & loss: 58% cost of goods, the design's lines, net = gross − expenses", () => {
    const r = run("Profit & loss");
    expect(text(r).map((row) => row[0]!.trim())).toEqual(["Income", "Sales", "Cost of goods sold", "Gross profit", "Expenses", "Rent", "Total expenses"]);
    expect(formatCell(r.rows[2]![1]!, r.cols[1]!)).toBe("−2,795,600");
    expect(kpi(r, "Gross profit")).toMatchObject({ value: "KES 2,024,400", note: "42.0% margin" });
    expect(n(r.total?.[1])).toBe(4_820_000 - 2_795_600 - 185_000);
    const loss = run("Profit & loss", "This month", { expenses: [{ ...s.expenses.expenses[0]!, date: "2026-11-02", status: "Paid", amount: 9_000_000, fee: 0 }] });
    expect(kpi(loss, "Net profit").tone).toBe("danger");
  });

  it("Trial balance debits equal credits; the balance sheet balances", () => {
    const t = run("Trial balance");
    expect(n(t.total?.[1])).toBeCloseTo(n(t.total?.[2]));
    expect(kpi(t, "Difference")).toMatchObject({ value: "KES 0", note: "Balanced" });
    const b = run("Balance sheet");
    expect(b.asAt).toBe(true);
    expect(b.sub).toBe("As at 10 Nov 2026");
    expect(kpi(b, "Net worth").value).toBe("KES 7,500,368");
    // Point-in-time reports ignore the period.
    expect(run("Balance sheet", "This year").kpis).toEqual(b.kpis);
  });

  it("Customer statements and Aged receivables total the receivable balances", () => {
    const owed = src.receivables.reduce((a, r) => a + r.balance, 0);
    const c = run("Customer statements");
    expect(n(c.total?.[3])).toBe(owed);
    expect(kpi(c, "Total owed").value).toBe("KES 127,026");
    const a = run("Aged receivables");
    expect(n(a.total?.[8])).toBe(owed);
    expect([3, 4, 5, 6, 7].reduce((x, i) => x + n(a.total?.[i]), 0)).toBe(owed);
  });

  it("VAT return names the direction in its total", () => {
    const r = run("VAT return");
    expect(r.total?.[0]).toBe("VAT to pay");
    expect(kpi(r, "VAT to pay KRA").tone).toBe("danger");
    const claim = run("VAT return", "This month", { expenses: [{ ...s.expenses.expenses[0]!, date: "2026-11-02", status: "Paid", tax: 2_000_000 }] });
    expect(claim.total?.[0]).toBe("VAT to carry forward");
  });

  it("Cash flow groups ledger entries in the period", () => {
    const r = run("Cash flow");
    expect(kpi(r, "Net cash flow")).toMatchObject({ value: "KES −139,400", note: "2 transactions", tone: "danger" });
  });
});

describe("empty periods and other reports", () => {
  it("Returns & refunds shows its empty message and no total with no credit notes", () => {
    const r = run("Returns & refunds");
    expect(r.rows).toHaveLength(0);
    expect(r.total).toBeNull();
    expect(r.empty).toBe("No refunds in this period.");
    expect(kpi(run("Returns & refunds", "Last month"), "Share of sales").value).toMatch(/^\d+\.\d\d%$/);
  });

  it("Stock valuation keeps lines in stock; Low stock counts", () => {
    expect(run("Stock valuation").rows.every((r) => Number(r[2]) > 0)).toBe(true);
    const low = run("Low stock");
    expect(kpi(low, "Need restocking").value).toBe("3");
    expect(kpi(low, "Out of stock").value).toBe("2");
  });

  it("formats with the design's repFmt", () => {
    expect(repFmt(-2795600)).toBe("−2,795,600");
    expect(repFmt(45600.4)).toBe("45,600");
  });

  it("runs every report name and marks the rest as coming soon", () => {
    for (const name of REPORT_NAMES) {
      const r = run(name);
      expect(r.missing, name).toBeUndefined();
      expect(r.cols.length, name).toBeGreaterThan(0);
    }
    expect(run("Production yield").missing).toBe(true);
    const popular = REPORT_CARDS["rep/popular"]!;
    expect(popular.find((c) => c.title === "Production yield")).toMatchObject({ runnable: false, desc: "Not available yet" });
    expect(popular.find((c) => c.title === "Sales summary")).toMatchObject({ runnable: true, desc: "Total sales, orders and refunds" });
  });

  it("round-trips slugs and builds CSV with the total row", () => {
    for (const name of REPORT_NAMES) expect(reportFromSlug(reportSlug(name))).toBe(name);
    expect(reportSlug("Returns & refunds")).toBe("returns-refunds");
    expect(reportFromSlug("production-yield")).toBeNull();
    expect(periodFromSlug(periodSlug("Last month"))).toBe("Last month");
    const csv = reportCsv(run("Sales summary")).split("\n");
    expect(csv).toHaveLength(5);
    expect(csv[0]).toBe('"Channel","Orders","Sales (KES)","Average order (KES)","Share"');
    expect(csv[1]).toBe('"POS","468",2050000,4380.34,42.53');
  });
});
