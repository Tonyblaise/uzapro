/**
 * Report charts and analysis — a one-for-one port of the canvas `repCharts(name, R, per)`
 * (`Uzapoint ERP.dc.html` v1794780681-ee67): a bar chart of the biggest lines, a donut of shares,
 * a monthly trend for the sales, purchase and cash reports, and up to five plain-language points.
 * Pure: reads only the report result and the dashboard's monthly series.
 */
import { UZ_HOME } from "./fixtures/overviews";
import { repFmt } from "./reports";
import type { ReportCell, ReportCharts, ReportPeriod, ReportResult } from "./types";

const P = ["#16a34a", "#2563eb", "#f59e0b", "#8b5cf6", "#0891b2", "#94a3b8"];
const NEG = "#dc2626";
const AGE = ["#16a34a", "#f59e0b", "#f97316", "#ef4444", "#dc2626"];
const NONE: ReportCharts = { bars: null, donut: null, trend: null, insights: [] };

/** The design's `plain` + `expNum`: a cell's text, as a number (0 when it isn't one). */
const plain = (c: ReportCell | undefined): string => (c === undefined ? "" : typeof c === "object" ? c.text : String(c));
const num = (c: ReportCell | undefined): number => (typeof c === "number" ? c : Number(plain(c).replace("−", "-").replace("+", "").replace(/,/g, "")) || 0);
const K = (n: number) => `KES ${repFmt(n)}`;

/** Value column picked by name (the first column whose title starts with it). */
const PICK: Record<string, string> = {
  "Sales targets": "Progress",
  "Low stock": "On hand",
  "Stock movement": "Change",
  "Customer statements": "Balance",
  "Aged receivables": "Balance",
  "Trial balance": "Debit",
  "Cash flow": "Net",
  "Stock valuation": "Value at cost",
};
const LABEL_COL: Record<string, number> = { "Stock movement": 1, "Returns & refunds": 4, Wastage: 1 };
const STATEMENTS = ["Profit & loss", "Balance sheet", "Trial balance", "VAT return"];

type Series = { l: readonly string[]; a: readonly number[]; b: readonly number[]; aName: string; bName: string };
const TRENDS: Record<string, [Series, ("a" | "b")[], string]> = {
  "Sales summary": [UZ_HOME.compare, ["a"], "Sales by month"],
  "Sales by channel": [UZ_HOME.compare, ["a"], "Sales by month"],
  "Sales by product": [UZ_HOME.compare, ["a"], "Sales by month"],
  "Sales by customer": [UZ_HOME.compare, ["a"], "Sales by month"],
  "Profit & loss": [UZ_HOME.compare, ["a", "b"], "Sales and purchases by month"],
  "Purchase analysis": [UZ_HOME.compare, ["b"], "Purchases by month"],
  "Cash flow": [UZ_HOME.cash, ["a", "b"], "Money in and out by month"],
  "VAT return": [UZ_HOME.compare, ["a", "b"], "Sales and purchases by month"],
};

export function reportCharts(name: string, R: ReportResult, per: ReportPeriod): ReportCharts {
  try {
    return build(name, R, per);
  } catch {
    return NONE;
  }
}

function build(name: string, R: ReportResult, per: ReportPeriod): ReportCharts {
  const cols = R.cols;
  const rows = R.rows;
  const pick = PICK[name];
  let vi = -1;
  let best = -1;
  cols.forEach((c, i) => {
    if (i === 0 || !c.num) return;
    if (pick && c.t.indexOf(pick) === 0) {
      vi = i;
      best = Infinity;
      return;
    }
    if (c.pct && best !== Infinity) return;
    const sum = rows.reduce((a, r) => a + Math.abs(num(r[i])), 0);
    if (sum > best) {
      best = sum;
      vi = i;
    }
  });
  if (vi < 0) cols.forEach((c, i) => {
    if (vi < 0 && i > 0 && c.num) vi = i;
  });
  const isPct = vi >= 0 && !!cols[vi]!.pct;
  const fv = (n: number) => (isPct ? `${n.toFixed(1)}%` : /qty|on hand|in stock|change|orders|units/i.test(cols[vi]?.t ?? "") ? repFmt(n) : K(n));
  const li = LABEL_COL[name] ?? 0;
  const stmt = STATEMENTS.includes(name);

  const agg = new Map<string, number>();
  rows.forEach((r) => {
    const l = plain(r[li]);
    if (stmt && /^(total|gross profit|net )/i.test(l)) return;
    if (!l || vi < 0) return;
    agg.set(l, (agg.get(l) ?? 0) + num(r[vi]));
  });
  let items = [...agg].map(([l, v]) => ({ l, v })).filter((x) => x.v !== 0).sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
  if (name === "Aged receivables" && R.total) {
    const total = R.total;
    const bk = cols.map((c, i) => ({ l: c.t, v: num(total[i]), i })).filter((x) => x.i > 0 && cols[x.i]!.num && !/balance|total/i.test(x.l));
    if (bk.length) items = bk;
  }
  const sumAll = items.reduce((a, x) => a + x.v, 0);
  const vt = cols[vi] ? cols[vi]!.t.replace(/\s*\(KES\)/i, "").toLowerCase() : "value";
  const out: ReportCharts = { bars: null, donut: null, trend: null, insights: [] };

  if (items.length) {
    const top = items.slice(0, 8);
    const mx = Math.max(...top.map((x) => Math.abs(x.v))) || 1;
    out.bars = {
      title: name === "Aged receivables" ? "Owed by age" : li ? `${vt.charAt(0).toUpperCase()}${vt.slice(1)} by ${cols[li]!.t.toLowerCase()}` : stmt ? "Line by line" : `Top ${top.length} by ${vt}`,
      sub: items.length > 8 ? `Showing 8 of ${items.length}` : R.asAt ? R.sub : ((R.sub || per).split(" · ").pop() ?? per),
      bars: top.map((x, i) => ({
        label: x.l,
        value: fv(x.v),
        width: x.v ? Math.max(2, (Math.abs(x.v) / mx) * 100) : 0,
        color: x.v < 0 ? NEG : name === "Aged receivables" ? (AGE[i] ?? NEG) : i === 0 ? P[0]! : "#4ade80",
        tip: `${x.l}: ${fv(x.v)}`,
      })),
      aria: `Bar chart of ${vt} for ${top.map((x) => `${x.l} ${fv(x.v)}`).join(", ")}`,
    };
  }

  const pos = items.filter((x) => x.v > 0);
  if (!isPct && pos.length >= 2 && pos.length === items.length && !stmt && !["Sales targets", "Low stock", "Stock movement"].includes(name)) {
    const tot = pos.reduce((a, x) => a + x.v, 0);
    const sl = pos.slice(0, 5);
    if (pos.length > 5) sl.push({ l: "Everything else", v: pos.slice(5).reduce((a, x) => a + x.v, 0) });
    let at = 0;
    const stops = sl.map((x, i) => {
      const a = at;
      at += (x.v / tot) * 100;
      return `${P[i]} ${a.toFixed(2)}% ${at.toFixed(2)}%`;
    });
    out.donut = {
      title: `Share of ${vt}`,
      sub: "Each slice is a share of the total",
      background: `conic-gradient(${stops.join(", ")})`,
      label: "Total",
      total: fv(tot).replace("KES ", ""),
      legend: sl.map((x, i) => ({ label: x.l, color: P[i]!, pct: `${((x.v / tot) * 100).toFixed(1)}%` })),
      aria: `Donut chart: ${sl.map((x) => `${x.l} ${((x.v / tot) * 100).toFixed(0)}%`).join(", ")}`,
    };
  }

  // Profit & loss: where the expenses went (design donut "Where expenses went").
  let pe: { l: string; v: number }[] | null = null;
  if (name === "Profit & loss") {
    const ex: { l: string; v: number }[] = [];
    let inE = false;
    rows.forEach((r) => {
      const l = plain(r[0]).trim();
      if (l === "Expenses") {
        inE = true;
        return;
      }
      if (/^Total expenses/.test(l)) inE = false;
      else if (inE && num(r[1])) ex.push({ l, v: -num(r[1]) });
    });
    ex.sort((a, b) => b.v - a.v);
    if (ex.length >= 2) {
      const tot = ex.reduce((a, x) => a + x.v, 0);
      const sl = ex.slice(0, 5);
      if (ex.length > 5) sl.push({ l: "Everything else", v: ex.slice(5).reduce((a, x) => a + x.v, 0) });
      let at = 0;
      const stops = sl.map((x, i) => {
        const a = at;
        at += (x.v / tot) * 100;
        return `${P[i]} ${a.toFixed(2)}% ${at.toFixed(2)}%`;
      });
      out.donut = {
        title: "Where expenses went",
        sub: "Share of total expenses",
        background: `conic-gradient(${stops.join(", ")})`,
        label: "Expenses",
        total: repFmt(tot),
        legend: sl.map((x, i) => ({ label: x.l, color: P[i]!, pct: `${((x.v / tot) * 100).toFixed(1)}%` })),
        aria: `Donut chart of expenses: ${sl.map((x) => `${x.l} ${((x.v / tot) * 100).toFixed(0)}%`).join(", ")}`,
      };
      pe = ex;
    }
  }

  let growth: { last: number; prev: number; first: number; nm: string; m: string; pm: string; f: string; b?: readonly number[] } | null = null;
  const tr = TRENDS[name];
  if (tr) {
    const [T, ks, title] = tr;
    const L = [...T.l, "Nov"];
    const get = (k: "a" | "b") => [...T[k], +(T[k][T[k].length - 1]! * 0.45).toFixed(2)];
    const A = get(ks[0]!);
    const B = ks[1] ? get(ks[1]) : null;
    const mx = Math.max(...A, ...(B ?? [0])) * 1.1;
    const nm = (k: "a" | "b") => (k === "a" ? T.aName : T.bName);
    out.trend = {
      title,
      sub: "Last 7 months, KES millions · November is month to date",
      series: ks.map((k, i) => ({ label: nm(k), color: i ? P[1]! : P[0]! })),
      months: L.map((l, i) => ({
        label: l,
        h1: (A[i]! / mx) * 100,
        h2: B ? (B[i]! / mx) * 100 : null,
        partial: i === L.length - 1,
        tip: `${l}: ${nm(ks[0]!)} ${A[i]}M${B ? `, ${nm(ks[1]!)} ${B[i]}M` : ""}`,
      })),
      colors: [P[0]!, P[1]!],
      aria: `${title}: ${L.map((l, i) => `${l} ${A[i]}M`).join(", ")}`,
    };
    const s0 = T[ks[0]!];
    const n = s0.length;
    growth = { last: s0[n - 1]!, prev: s0[n - 2]!, first: s0[0]!, nm: nm(ks[0]!).toLowerCase(), m: T.l[n - 1]!, pm: T.l[n - 2]!, f: T.l[0]! };
    if (ks[1]) growth.b = T[ks[1]];
  }

  const ins = out.insights;
  const add = (text: string, color: string = P[0]!) => ins.push({ text, color });
  if (items.length >= 2 && !isPct && !stmt && !["Aged receivables", "Low stock", "Stock movement"].includes(name) && items[0]!.v > 0) {
    const t1 = items[0]!;
    const absTot = items.reduce((a, x) => a + Math.abs(x.v), 0);
    const sh = (Math.abs(t1.v) / (absTot || 1)) * 100;
    add(`${t1.l} is the largest at ${fv(t1.v)}${sumAll > 0 && items.every((x) => x.v >= 0) ? `, ${sh.toFixed(0)}% of the total.` : "."}`);
    if (items.length >= 4 && !li && items.every((x) => x.v >= 0)) {
      const t3 = (items.slice(0, 3).reduce((a, x) => a + x.v, 0) / sumAll) * 100;
      add(
        `The top 3 make up ${t3.toFixed(0)}% of the total${t3 > 70 ? ". That is a lot riding on a few names, so watch them closely." : ", so the spread is fairly healthy."}`,
        t3 > 70 ? "#f59e0b" : P[0],
      );
    }
    const low = items[items.length - 1]!;
    if (items.length >= 3 && low.v > 0) add(`${low.l} is the smallest at ${fv(low.v)}.`, "#94a3b8");
  }
  const negs = items.filter((x) => x.v < 0);
  if (negs.length && !["Profit & loss", "Stock movement"].includes(name))
    add(`${negs.length} item${negs.length > 1 ? "s are" : " is"} negative: ${negs.slice(0, 3).map((x) => x.l).join(", ")}${negs.length > 3 ? ` and ${negs.length - 3} more.` : "."}`, NEG);
  if (growth) {
    const mo = ((growth.last - growth.prev) / growth.prev) * 100;
    const six = ((growth.last - growth.first) / growth.first) * 100;
    const nmC = growth.nm.charAt(0).toUpperCase() + growth.nm.slice(1);
    add(
      `${nmC} in ${growth.m}${/s$/.test(growth.nm) ? " were " : " was "}${mo >= 0 ? "up " : "down "}${Math.abs(mo).toFixed(0)}% on ${growth.pm}, and ${six >= 0 ? "up " : "down "}${Math.abs(six).toFixed(0)}% since ${growth.f}.`,
      mo >= 0 ? P[0] : NEG,
    );
    if (growth.b) {
      const a = name !== "Cash flow" ? UZ_HOME.compare.a : UZ_HOME.cash.a;
      const b = growth.b;
      const m = ((a[a.length - 1]! - b[b.length - 1]!) / a[a.length - 1]!) * 100;
      add(
        name === "Cash flow"
          ? `More money came in than went out in each of the last 6 months. In ${growth.m} you kept ${m.toFixed(0)}% of what came in.`
          : `Purchases were ${(100 - m).toFixed(0)}% of sales in ${growth.m}.`,
        P[1],
      );
    }
  }
  if (name === "Aged receivables" && items.length) {
    const late = items.filter((x) => !/current|not due|0.?30/i.test(x.l)).reduce((a, x) => a + x.v, 0);
    const tot = items.reduce((a, x) => a + x.v, 0);
    if (tot) add(`${K(late)} (${((late / tot) * 100).toFixed(0)}%) is more than 30 days late. Follow up on the oldest first.`, late / tot > 0.3 ? NEG : "#f59e0b");
  }
  if (name === "Sales targets" && items.length) {
    const behind = items.filter((x) => x.v < 50);
    add(
      behind.length ? `${behind.length} target${behind.length > 1 ? "s are" : " is"} under halfway: ${behind.map((x) => x.l).join(", ")}.` : "Every target is at least halfway there.",
      behind.length ? "#f59e0b" : P[0],
    );
  }
  if (name === "Low stock" && rows.length) {
    const need = rows.filter((r) => plain(r[4]) !== "Healthy");
    const outOf = rows.filter((r) => num(r[2]) <= 0).map((r) => plain(r[0]));
    add(`${need.length} of ${rows.length} items are at or below their reorder level.${outOf.length ? ` Out of stock: ${outOf.join(", ")}.` : ""}`, need.length ? "#f59e0b" : P[0]);
  }
  if (name === "Trial balance" && R.total) {
    const d = num(R.total[1]);
    const c = num(R.total[2]);
    add(Math.abs(d - c) < 1 ? `Debits and credits both come to ${K(d)}, so the books balance.` : `Debits and credits are ${K(Math.abs(d - c))} apart. Check recent entries.`, Math.abs(d - c) < 1 ? P[0] : NEG);
  }
  if (pe) {
    const t = pe.reduce((a, x) => a + x.v, 0);
    add(`${pe[0]!.l} is the biggest expense at ${K(pe[0]!.v)}, ${((pe[0]!.v / t) * 100).toFixed(0)}% of all expenses.`, "#f59e0b");
  }
  if (name === "Stock movement" && rows.length) {
    const ins_ = rows.reduce((a, r) => a + Math.max(0, num(r[5])), 0);
    const outs = rows.reduce((a, r) => a - Math.min(0, num(r[5])), 0);
    const byT = new Map<string, number>();
    rows.forEach((r) => byT.set(plain(r[3]), (byT.get(plain(r[3])) ?? 0) + 1));
    add(`${ins_} units came in and ${outs} went out${outs > ins_ ? ", so stock is running down." : ", so stock is building up."}`, outs > ins_ ? "#f59e0b" : P[0]);
    add(`Movements by type: ${[...byT].map(([k, n]) => `${k.toLowerCase()} ${n}`).join(", ")}.`, P[1]);
    if (items.length) add(`${items[0]!.l} changed the most (${items[0]!.v > 0 ? "+" : ""}${items[0]!.v} units).`, "#94a3b8");
  }
  if (name === "Returns & refunds" && rows.length)
    add(`${rows.length} credit notes in this period. Look at the top reason first, it often points to a supplier or packing problem.`, "#94a3b8");
  R.kpis
    .filter((k) => /margin|profit|net/i.test(k.label))
    .slice(0, 1)
    .forEach((k) => add(`${k.label}: ${k.value}${k.note ? ` (${k.note})` : ""}.`, k.tone === "danger" ? NEG : P[0]));
  out.insights = ins.slice(0, 5);
  return out;
}
