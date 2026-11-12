/**
 * Run reports — a pure, one-for-one port of the canvas `repRun()` and `repFmt()`
 * (`Uzapoint ERP.dc.html` v1794508919; specs/009-run-reports/research.md R1–R5).
 * Design-fixed figures scale with the period; everything else reads the live store snapshot.
 */
import { date, num, parseAmount } from "@/lib/format";
import { UZ_HOME, UZ_SALES, UZ_STOCK_FIXED } from "./fixtures/overviews";
import { REPORT_FIXED, REPORT_NAMES, REPORT_PERIODS, type ReportName } from "./fixtures/reports";
import { balance } from "./money";
import { targetAchieved } from "./targets";
import type {
  Account,
  CreditNote,
  Expense,
  LedgerEntry,
  Payable,
  Product,
  ReceivableRow,
  ReportCell,
  ReportColumn,
  ReportKpi,
  ReportPeriod,
  ReportResult,
  ReportTone,
  Sale,
  SalesTarget,
  StockLevel,
  StockMovement,
  Store,
  Wastage,
} from "./types";

/** The store data a report reads (research R2). */
export interface ReportSource {
  receivables: readonly ReceivableRow[];
  payables: readonly Payable[];
  creditNotes: readonly CreditNote[];
  expenses: readonly Expense[];
  accounts: readonly Account[];
  ledger: readonly LedgerEntry[];
  levels: readonly StockLevel[];
  movements: readonly StockMovement[];
  wastage: readonly Wastage[];
  products: readonly Product[];
  targets: readonly SalesTarget[];
  sales: readonly Sale[];
  stores: readonly Store[];
}

/** The design's `repFmt`: whole numbers, en-KE grouping, "−" for negatives. */
export function repFmt(n: number): string {
  return (n < 0 ? "−" : "") + num(Math.abs(Math.round(n)));
}

/** Display text for a cell in a column (numbers by `repFmt`, percentages with one decimal). */
export function formatCell(cell: ReportCell, col?: ReportColumn): string {
  if (typeof cell === "number") return col?.pct ? `${cell.toFixed(1)}%` : repFmt(cell);
  if (typeof cell === "string") return cell;
  return cell.text;
}

// ── Slugs (research R5) ────────────────────────────────────────────────────

export const reportSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The runnable report for a URL slug, or null. */
export function reportFromSlug(slug: string | null | undefined): ReportName | null {
  if (!slug) return null;
  return REPORT_NAMES.find((n) => reportSlug(n) === slug) ?? null;
}

export const periodSlug = (p: ReportPeriod) => reportSlug(p);

export function periodFromSlug(slug: string | null | undefined): ReportPeriod | null {
  return (Object.keys(REPORT_PERIODS) as ReportPeriod[]).find((p) => periodSlug(p) === slug) ?? null;
}

export const isRunnable = (name: string) => (REPORT_NAMES as readonly string[]).includes(name);

// ── The reports ────────────────────────────────────────────────────────────

const C = (t: string, n?: boolean, pct?: boolean): ReportColumn => ({ t, ...(n ? { num: true } : {}), ...(pct ? { pct: true } : {}) });
const kpi = (label: string, value: string, note?: string, tone?: ReportTone): ReportKpi => ({ label, value, ...(note ? { note } : {}), ...(tone ? { tone } : {}) });
const B = (text: string): ReportCell => ({ text, bold: true });
const BR = (n: number): ReportCell => ({ text: repFmt(n), bold: true, right: true });
const K = (n: number) => `KES ${repFmt(n)}`;
const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
const en = (n: number) => num(n);
const AS_AT = `As at ${date(REPORT_FIXED.asAt)}`;
/** Reports with no period picker (design `asAt`). Their VAT inputs use "This month" so a hidden period can't change them. */
export const POINT_IN_TIME: readonly string[] = ["Customer statements", "Sales targets", "Balance sheet", "Trial balance", "Aged receivables", "Stock valuation", "Low stock"];
const day = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);

/** Run a report (design `repRun(name, period)`). Point-in-time reports use "This month" for their period-scaled inputs. */
export function runReport(name: string, period: ReportPeriod, src: ReportSource): ReportResult {
  const per: ReportPeriod = POINT_IN_TIME.includes(name) ? "This month" : period;
  const { start, end, scale: sc } = REPORT_PERIODS[per];
  const inR = (iso: string) => iso.slice(0, 10) >= start && iso.slice(0, 10) <= end;
  const sub = `${per} · ${date(start)} to ${date(end)}`;
  const salesTotal = REPORT_FIXED.salesMonth * sc;
  const orders = Math.round(REPORT_FIXED.ordersMonth * sc);
  const exps = src.expenses.filter((e) => e.status === "Paid" && inR(e.date));
  const cns = src.creditNotes.filter((c) => inR(c.date) && c.status.label !== "Voided");
  const rcv = src.receivables;
  const bal = (r: ReceivableRow) => r.balance;
  const outVat = salesTotal * REPORT_FIXED.vatRate;
  const inVat = sum(exps.map((e) => e.tax)) + REPORT_FIXED.purchasesMonth * sc * REPORT_FIXED.costRate * REPORT_FIXED.vatRate;
  const board = (t: string) => (UZ_SALES.boards.find((b) => b.t === t)?.rows ?? []) as readonly (readonly [string, number, number])[];
  const base = { title: name, sub, asAt: false, total: null } as const;

  switch (name) {
    case "Sales summary":
    case "Sales by channel": {
      const ch = UZ_SALES.channels;
      const tot = sum(ch.map((c) => c[1]));
      const refunds = sum(cns.map((c) => c.amount));
      const rows: ReportCell[][] = ch.map(([label, v]) => {
        const amt = (v / tot) * salesTotal;
        const o = Math.round((v / tot) * orders);
        return [label, String(o), amt, amt / Math.max(1, o), (v / tot) * 100];
      });
      return {
        ...base,
        kpis: [
          kpi("Total sales", K(salesTotal), `${en(orders)} orders`, "green"),
          kpi("Average order", K(salesTotal / orders)),
          kpi("Refunds", K(refunds), `${cns.length} credit notes`, "danger"),
          kpi("Net sales", K(salesTotal - refunds)),
        ],
        cols: [C("Channel"), C("Orders", true), C("Sales (KES)", true), C("Average order (KES)", true), C("Share", true, true)],
        rows,
        total: ["Total", en(orders), salesTotal, salesTotal / orders, 100],
      };
    }
    case "Sales by product": {
      const rows: ReportCell[][] = board("Top products").map((r) => [r[0], String(Math.round(r[1] * sc)), r[2] * sc, r[2] / r[1]]);
      const tot = sum(rows.map((r) => r[2] as number));
      const first = rows[0];
      return {
        ...base,
        kpis: [kpi("Best seller", first ? String(first[0]) : "—", first ? K(first[2] as number) : "", "green"), kpi("Products shown", String(rows.length)), kpi("Their sales", K(tot))],
        cols: [C("Product"), C("Units sold", true), C("Sales (KES)", true), C("Average price (KES)", true)],
        rows,
        total: ["Total", String(sum(rows.map((r) => Number(r[1])))), tot, ""],
      };
    }
    case "Customer statements": {
      const by = new Map<string, [number, number, number, number]>();
      for (const r of rcv) {
        const b = by.get(r.party) ?? [0, 0, 0, 0];
        b[0] += r.total;
        b[1] += r.paid;
        b[2] += bal(r);
        if (r.status.label === "Overdue") b[3] += bal(r);
        by.set(r.party, b);
      }
      const rows: [string, number, number, number, number][] = [...by.entries()].sort((a, b) => b[1][2] - a[1][2]).map(([c, b]) => [c, ...b]);
      const col = (i: 1 | 2 | 3 | 4) => sum(rows.map((r) => r[i]));
      return {
        ...base,
        sub: AS_AT,
        asAt: true,
        kpis: [kpi("Customers with a balance", String(rows.filter((r) => r[3] > 0).length)), kpi("Total owed", K(col(3)), "", "info"), kpi("Overdue", K(col(4)), "", "danger")],
        cols: [C("Customer"), C("Invoiced (KES)", true), C("Paid (KES)", true), C("Balance (KES)", true), C("Overdue (KES)", true)],
        rows,
        total: ["Total", col(1), col(2), col(3), col(4)],
      };
    }
    case "Sales by customer": {
      const owed = (c: string) => sum(rcv.filter((r) => r.party === c).map(bal));
      const rows: ReportCell[][] = board("Top customers").map((r) => [r[0], String(Math.round(r[1] * sc)), r[2] * sc, owed(r[0])]);
      const first = rows[0];
      return {
        ...base,
        kpis: [
          kpi("Top customer", first ? String(first[0]) : "—", first ? K(first[2] as number) : "", "green"),
          kpi("Customers shown", String(rows.length)),
          kpi("They still owe", K(sum(rows.map((r) => r[3] as number))), "", "info"),
        ],
        cols: [C("Customer"), C("Orders", true), C("Sales (KES)", true), C("Owes you now (KES)", true)],
        rows,
        total: ["Total", String(sum(rows.map((r) => Number(r[1])))), sum(rows.map((r) => r[2] as number)), sum(rows.map((r) => r[3] as number))],
      };
    }
    case "Returns & refunds": {
      const rows: ReportCell[][] = cns.map((c) => [c.number, c.customer, date(c.date), c.source, c.reason, c.amount]);
      const refunded = sum(cns.map((c) => c.amount));
      return {
        ...base,
        kpis: [kpi("Credit notes", String(rows.length)), kpi("Refunded", K(refunded), "", "danger"), kpi("Share of sales", `${((refunded / salesTotal) * 100).toFixed(2)}%`)],
        cols: [C("Credit note"), C("Customer"), C("Date"), C("Invoice"), C("Reason"), C("Amount (KES)", true)],
        rows,
        total: rows.length ? ["Total", "", "", "", "", refunded] : null,
        empty: "No refunds in this period.",
      };
    }
    case "Sales targets": {
      const rows: ReportCell[][] = src.targets.map((t) => {
        const got = targetAchieved(t, src.sales, src.stores);
        return [t.name, t.who || t.scope, `${date(t.start)} – ${date(t.end)}`, t.amount, got, (got / t.amount) * 100];
      });
      return {
        ...base,
        sub: "All targets",
        asAt: true,
        kpis: [kpi("Targets", String(rows.length)), kpi("On track", String(rows.filter((r) => (r[5] as number) >= REPORT_FIXED.onTrack).length), "75% or more reached", "green")],
        cols: [C("Target"), C("For"), C("Dates"), C("Target (KES)", true), C("Reached (KES)", true), C("Progress", true, true)],
        rows,
      };
    }
    case "Profit & loss": {
      const cogs = salesTotal * REPORT_FIXED.cogsRate;
      const by = new Map<string, number>();
      for (const e of exps) by.set(e.category, (by.get(e.category) ?? 0) + e.amount + (e.fee || 0));
      const opex = sum([...by.values()]);
      const gross = salesTotal - cogs;
      const net = gross - opex;
      const rows: ReportCell[][] = [
        [B("Income"), ""],
        ["Sales", salesTotal],
        ["Cost of goods sold", -cogs],
        [B("Gross profit"), BR(gross)],
        [B("Expenses"), ""],
        ...[...by.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]): ReportCell[] => [`   ${k}`, -v]),
        [B("Total expenses"), BR(-opex)],
      ];
      return {
        ...base,
        kpis: [
          kpi("Sales", K(salesTotal), "", "green"),
          kpi("Gross profit", K(gross), `${((gross / salesTotal) * 100).toFixed(1)}% margin`),
          kpi("Expenses", K(opex), `${exps.length} paid expenses`, "danger"),
          kpi("Net profit", K(net), "", net >= 0 ? "green" : "danger"),
        ],
        cols: [C("Line"), C("Amount (KES)", true)],
        rows,
        total: ["Net profit", net],
        note: "Sales and cost of goods come from the sales figures. Expenses are the paid expenses recorded in this period.",
      };
    }
    case "Balance sheet":
    case "Trial balance": {
      const bank = src.accounts.map((a): [string, number] => [a.name, a.balance]);
      const recv = sum(rcv.map(bal));
      const owe = sum(src.payables.map((p) => balance(p)));
      const vat = Math.max(0, outVat - inVat);
      const stock = REPORT_FIXED.stockValue;
      const assets = sum(bank.map((b) => b[1])) + recv + stock;
      const liab = owe + vat;
      const eq = assets - liab;
      if (name === "Trial balance") {
        const rows: ReportCell[][] = [
          ...bank.map(([n, v]): ReportCell[] => [n, v, 0]),
          ["Customers owe you (receivables)", recv, 0],
          ["Stock", stock, 0],
          ["Suppliers you owe (payables)", 0, owe],
          ["VAT owed to KRA", 0, vat],
          ["Owner's equity", 0, eq],
        ];
        return {
          ...base,
          sub: AS_AT,
          asAt: true,
          kpis: [kpi("Debits", K(assets)), kpi("Credits", K(liab + eq)), kpi("Difference", "KES 0", "Balanced", "green")],
          cols: [C("Account"), C("Debit (KES)", true), C("Credit (KES)", true)],
          rows,
          total: ["Total", assets, liab + eq],
        };
      }
      const rows: ReportCell[][] = [
        [B("What the business owns"), ""],
        ...bank.map(([n, v]): ReportCell[] => [`   ${n}`, v]),
        ["   Customers owe you", recv],
        ["   Stock", stock],
        [B("Total assets"), BR(assets)],
        [B("What the business owes"), ""],
        ["   Suppliers", owe],
        ["   VAT owed to KRA", vat],
        [B("Total liabilities"), BR(liab)],
      ];
      return {
        ...base,
        sub: AS_AT,
        asAt: true,
        kpis: [kpi("Assets", K(assets), "", "green"), kpi("Liabilities", K(liab), "", "danger"), kpi("Net worth", K(eq))],
        cols: [C("Item"), C("Amount (KES)", true)],
        rows,
        total: ["Owner's equity (net worth)", eq],
      };
    }
    case "Cash flow": {
      const led = src.ledger.filter((e) => inR(e.date));
      const by = new Map<string, [number, number, number]>();
      for (const e of led) {
        const b = by.get(e.kind) ?? [0, 0, 0];
        if (e.amt >= 0) b[0] += e.amt;
        else b[1] -= e.amt;
        b[2]++;
        by.set(e.kind, b);
      }
      const rows = [...by.entries()].sort((a, b) => b[1][0] + b[1][1] - (a[1][0] + a[1][1])).map(([k, b]): ReportCell[] => [k, String(b[2]), b[0], b[1], b[0] - b[1]]);
      const i = sum(rows.map((r) => r[2] as number));
      const o = sum(rows.map((r) => r[3] as number));
      return {
        ...base,
        kpis: [kpi("Money in", K(i), "", "green"), kpi("Money out", K(o), "", "danger"), kpi("Net cash flow", K(i - o), `${led.length} transactions`, i - o >= 0 ? "green" : "danger")],
        cols: [C("Type"), C("Transactions", true), C("Money in (KES)", true), C("Money out (KES)", true), C("Net (KES)", true)],
        rows,
        total: rows.length ? ["Total", String(led.length), i, o, i - o] : null,
        empty: "No money moved in this period.",
        note: "From the transactions recorded in your bank, M-Pesa and cash accounts.",
      };
    }
    case "VAT return": {
      const pay = outVat >= inVat;
      return {
        ...base,
        kpis: [
          kpi("VAT on sales", K(outVat)),
          kpi("VAT you can claim", K(inVat)),
          kpi(pay ? "VAT to pay KRA" : "VAT to carry forward", K(Math.abs(outVat - inVat)), "Due by the 20th of next month", pay ? "danger" : "green"),
        ],
        cols: [C("Line"), C("Amount (KES)", true)],
        rows: [
          ["Sales including VAT", salesTotal],
          ["VAT on sales (output VAT)", outVat],
          ["VAT on purchases and expenses (input VAT)", inVat],
        ],
        total: [pay ? "VAT to pay" : "VAT to carry forward", Math.abs(outVat - inVat)],
        note: "Standard rate of 16%. Check the figures before filing on iTax.",
      };
    }
    case "Aged receivables": {
      const today = day(REPORT_FIXED.asAt);
      const rows: ReportCell[][] = rcv
        .filter((r) => bal(r) > 0)
        .map((r) => {
          const d = Math.floor((today - day(r.due)) / 864e5);
          const b = bal(r);
          const z = [0, 0, 0, 0, 0];
          z[d <= 0 ? 0 : d <= 30 ? 1 : d <= 60 ? 2 : d <= 90 ? 3 : 4] = b;
          return [r.party, r.doc && r.doc !== "—" ? r.doc : r.ref, date(r.due), ...z, b];
        });
      const s = (i: number) => sum(rows.map((r) => r[i] as number));
      return {
        ...base,
        sub: AS_AT,
        asAt: true,
        kpis: [kpi("Total owed", K(s(8)), `${rows.length} open balances`, "info"), kpi("Not yet due", K(s(3))), kpi("Over 90 days", K(s(7)), "", "danger")],
        cols: [C("Customer"), C("Document"), C("Due date"), C("Not due", true), C("1–30 days", true), C("31–60 days", true), C("61–90 days", true), C("Over 90 days", true), C("Total (KES)", true)],
        rows,
        total: ["Total", "", "", s(3), s(4), s(5), s(6), s(7), s(8)],
      };
    }
    case "Purchase analysis": {
      const base0 = UZ_HOME.suppliers.map((r): [string, string, number, number] => [r[0], String(Math.max(1, Math.round(r[1] * sc))), r[2] * sc, r[2] / r[1]]);
      const tot = sum(base0.map((r) => r[2]));
      const ordersN = sum(base0.map((r) => Number(r[1])));
      return {
        ...base,
        kpis: [kpi("Spent with suppliers", K(tot), "", "danger"), kpi("Biggest supplier", base0[0]?.[0] ?? "—"), kpi("Purchase orders", String(ordersN))],
        cols: [C("Supplier"), C("Orders", true), C("Spent (KES)", true), C("Average order (KES)", true), C("Share", true, true)],
        rows: base0.map((r) => [...r, (r[2] / tot) * 100]),
        total: ["Total", String(ordersN), tot, "", 100],
      };
    }
    case "Stock valuation": {
      const prices = new Map(src.products.map((p) => [p.name, parseAmount(p.priceLabel.replace(/^From /, ""))]));
      const rows = src.levels
        .map((l): [string, string, string, number, number, number] => {
          const p = prices.get(l.product) ?? 0;
          const cost = p * REPORT_FIXED.costRate;
          return [l.product, l.store, String(l.quantity), cost, cost * l.quantity, p * l.quantity];
        })
        .filter((r) => Number(r[2]) > 0);
      const atCost = sum(rows.map((r) => r[4]));
      const atPrice = sum(rows.map((r) => r[5]));
      return {
        ...base,
        sub: AS_AT,
        asAt: true,
        kpis: [kpi("Value at cost", K(atCost), "", "green"), kpi("Value at selling price", K(atPrice)), kpi("Lines in stock", String(rows.length))],
        cols: [C("Product"), C("Store"), C("Quantity", true), C("Unit cost (KES)", true), C("Value at cost (KES)", true), C("Value at price (KES)", true)],
        rows,
        total: ["Total", "", String(sum(rows.map((r) => Number(r[2])))), "", atCost, atPrice],
        note: "Unit cost is estimated at 60% of the selling price where no buying price is recorded.",
      };
    }
    case "Stock movement": {
      const mv = src.movements.filter((m) => inR(m.date));
      const rows: ReportCell[][] = mv.map((m) => [date(m.date), m.product, m.variant, m.kind.label, m.store, m.change < 0 ? `−${Math.abs(m.change)}` : `+${m.change}`, String(m.left), m.by, m.ref]);
      return {
        ...base,
        kpis: [
          kpi("Movements", String(rows.length)),
          kpi("Units in", String(sum(mv.map((m) => Math.max(0, m.change))))),
          kpi("Units out", String(sum(mv.map((m) => Math.max(0, -m.change))))),
        ],
        cols: [C("Date"), C("Product"), C("Variant"), C("Type"), C("Store"), C("Change", true), C("Balance", true), C("By"), C("Reference")],
        rows,
        empty: "No stock moved in this period.",
      };
    }
    case "Low stock": {
      const low = UZ_STOCK_FIXED.low;
      const rows: ReportCell[][] = low.map((r) => [r[0], r[1], r[2], r[3], { text: r[4].label, tone: r[4].tone }]);
      return {
        ...base,
        sub: AS_AT,
        asAt: true,
        kpis: [
          kpi("Need restocking", String(low.filter((r) => r[4].label !== "Healthy").length), "", "warning"),
          kpi("Out of stock", String(low.filter((r) => Number(r[2]) === 0).length), "", "danger"),
        ],
        cols: [C("Product"), C("Store"), C("In stock", true), C("Reorder at", true), C("Status")],
        rows,
      };
    }
    case "Wastage": {
      const rows: ReportCell[][] = src.wastage.map((w) => {
        const i = w.items[0];
        return [w.ref, i ? (w.session && i.variant ? `${i.product} · ${i.variant}` : i.product) : "—", String(i?.qty ?? 0), i?.reason ?? "—", w.value];
      });
      const value = sum(src.wastage.map((w) => w.value));
      return {
        ...base,
        kpis: [kpi("Records", String(rows.length)), kpi("Value lost", K(value), "", "danger")],
        cols: [C("Ref"), C("Item"), C("Qty", true), C("Reason"), C("Value (KES)", true)],
        rows,
        total: rows.length ? ["Total", "", String(sum(src.wastage.map((w) => w.items[0]?.qty ?? 0))), "", value] : null,
      };
    }
    default:
      return { ...base, missing: true, kpis: [], cols: [C("Item")], rows: [], empty: "This report isn't in the sample yet." };
  }
}

/** The report as CSV, as the design's report `csv()` builds it: every value JSON-quoted, numbers rounded to 2 decimals (research R8). */
export function reportCsv(r: ReportResult): string {
  const plain = (c: ReportCell): string | number => (typeof c === "number" ? Math.round(c * 100) / 100 : typeof c === "string" ? c : c.text);
  return [r.cols.map((c) => c.t), ...r.rows.map((row) => row.map(plain)), ...(r.total ? [r.total.map(plain)] : [])].map((row) => row.map((c) => JSON.stringify(c)).join(",")).join("\n");
}

/** Whether the canvas defines a report for a card title. */
export const reportExists = (name: string): name is ReportName => isRunnable(name);
