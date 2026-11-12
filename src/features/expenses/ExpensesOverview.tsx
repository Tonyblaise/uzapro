"use client";
/**
 * Expenses › Overview (design `v.isExpBoard` with `eo`): the four KPIs, "Spending by month" (the
 * `UZ_EXPTREND` months plus this month, last bar in the danger colour), "By category" (ring and
 * legend), "Budget vs spent", "Paid from", "Biggest expenses" and "Coming up", all computed from
 * live data as the design does (research R7).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { useExpensesOverview } from "@/data";
import { ExpenseOverlays } from "./ExpenseOverlays";
import { Dot, docDate, fmt } from "./shared";

/** The design's `k()`: "1.2M", "296K", "800". */
const k = (x: number) => (x >= 1_000_000 ? `${(x / 1_000_000).toFixed(1)}M` : x >= 1000 ? `${Math.round(x / 1000)}K` : String(Math.round(x)));

/** Fallback ring colours for categories without one (design `palette`, token colours only). */
const PALETTE = ["var(--green-600)", "var(--info-text)", "var(--warning-text)", "var(--danger-text)", "var(--text-muted)"];

const PANEL = "flex min-w-0 flex-col rounded-lg border border-border bg-surface p-5";

function Heading({ title, sub, link }: { title: string; sub: string; link?: string }) {
  const head = (
    <div>
      <div className="type-title text-text">{title}</div>
      <div className="type-small text-text-secondary">{sub}</div>
    </div>
  );
  if (!link) return head;
  return (
    <div className="flex items-center justify-between gap-3">
      {head}
      <Link
        href={link}
        className="type-label inline-flex h-[var(--control-height-sm)] items-center rounded-sm px-2.5 text-[13px] text-text hover:bg-grey-100"
      >
        View all
      </Link>
    </div>
  );
}

function Bar({ w, color }: { w: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-pill bg-canvas">
      <div className="h-full rounded-pill" style={{ width: `${w}%`, background: color }} />
    </div>
  );
}

function Item({ lead, name, sub, amount, amountClass }: { lead: ReactNode; name: string; sub: string; amount: string; amountClass: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-canvas px-3 py-2">
      {lead}
      <span className="min-w-0 flex-1">
        <span className="type-label block text-text">{name}</span>
        <span className="type-caption block text-text-muted">{sub}</span>
      </span>
      <span className={`type-label u-num ${amountClass}`}>{amount}</span>
    </div>
  );
}

export function ExpensesOverview() {
  const eo = useExpensesOverview();
  const kes = (x: number) => `KES ${fmt(x)}`;

  const kpis = [
    {
      label: "Spent this month",
      value: kes(eo.monthTotal),
      note: `${eo.diff >= 0 ? "▲ " : "▼ "}${Math.abs(eo.diff)}% vs October`,
      color: "text-danger-text",
      noteColor: eo.diff > 0 ? "text-danger-text" : "text-green-700",
    },
    { label: "Average month", value: kes(eo.average), note: "Last 6 months", color: "text-info-text", noteColor: "text-text-muted" },
    {
      label: "Waiting approval",
      value: String(eo.waiting.length),
      note: eo.waiting.length ? `KES ${fmt(eo.waitingTotal)} to approve` : "Nothing to approve",
      color: "text-warning-text",
      noteColor: "text-text-muted",
    },
    { label: "Transaction costs", value: kes(eo.fees), note: "Fees paid this month", color: "text-text-secondary", noteColor: "text-text-muted" },
  ];

  const mx = Math.max(...eo.trend.map((t) => t.total)) || 1;
  const top = Math.ceil(mx / 100000) * 100000;
  const yTicks = [top, top * 0.75, top / 2, top / 4, 0].map(k);
  const trendLabel = `Monthly spending: ${eo.trend.map((t) => `${t.label} KES ${fmt(t.total)}`).join(", ")}`;

  const colorOf = (c: { color: string | null }, i: number) => c.color ?? PALETTE[i % PALETTE.length]!;
  const sum = eo.monthTotal || 1;
  let at = 0;
  const parts = eo.byCategory.map((c, i) => {
    const e = at + (c.amount / sum) * 100;
    const part = `${colorOf(c, i)} ${at}% ${e}%`;
    at = e;
    return part;
  });
  const ring = eo.byCategory.length ? `conic-gradient(${parts.join(", ")}${at < 100 ? `, var(--border) ${at}% 100%` : ""})` : "var(--border)";
  const ringLabel = eo.byCategory.map((c) => `${c.name} KES ${fmt(c.amount)}`).join(", ");
  const catColor = (name: string) => {
    const i = eo.byCategory.findIndex((c) => c.name === name);
    return i < 0 ? PALETTE[0]! : colorOf(eo.byCategory[i]!, i);
  };
  const accMax = Math.max(1, ...eo.byAccount.map((a) => a.amount));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        {kpis.map((x) => (
          <div key={x.label} className="rounded-lg border border-border bg-surface px-5 py-4">
            <div className={`type-eyebrow ${x.color}`}>{x.label}</div>
            <div className="type-h1 u-num mt-1 font-bold text-text">{x.value}</div>
            <div className={`type-caption ${x.noteColor}`}>{x.note}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className={`${PANEL} flex-[2_1_520px] gap-4`}>
          <Heading title="Spending by month" sub="Paid expenses, last 6 months" />
          <div role="img" aria-label={trendLabel} className="grid h-[250px] grid-cols-[56px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-x-2">
            <div className="type-caption -my-[7px] flex flex-col justify-between text-right text-text-muted">
              {yTicks.map((y, i) => (
                <span key={i}>{y}</span>
              ))}
            </div>
            <div className="relative flex items-end gap-3 border-b border-l border-border px-3">
              {eo.trend.map((t, i) => (
                <div key={t.label} title={`${t.label}: KES ${fmt(t.total)}`} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    className={`relative w-full max-w-[56px] rounded-t-[6px] ${i === eo.trend.length - 1 ? "bg-danger-text" : "bg-green-200"}`}
                    style={{ height: `${Math.max(2, (t.total / top) * 100)}%` }}
                  >
                    <span className="type-caption u-num absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap pb-0.5 text-text-secondary">{k(t.total)}</span>
                  </div>
                </div>
              ))}
            </div>
            <span />
            <div className="flex gap-3 px-3 pt-1">
              {eo.trend.map((t) => (
                <span key={t.label} className="type-caption flex-1 text-center text-text-muted">
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={`${PANEL} flex-[1_1_300px] gap-4`}>
          <Heading title="By category" sub="Paid this month" />
          <div className="grid place-items-center">
            <div role="img" aria-label={ringLabel} className="grid size-[170px] place-items-center rounded-full" style={{ background: ring }}>
              <div className="grid size-[112px] place-items-center rounded-full bg-surface text-center">
                <span>
                  <span className="type-title block text-text">KES {k(eo.monthTotal)}</span>
                  <span className="type-caption text-text-muted">this month</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {eo.byCategory.map((c, i) => (
              <div key={c.name} className="type-small flex items-center gap-2 text-text">
                <Dot color={colorOf(c, i)} />
                <span className="flex-1">{c.name}</span>
                <span className="u-num text-text-secondary">KES {fmt(c.amount)}</span>
                <span className="w-10 text-right text-text-muted">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className={`${PANEL} flex-[1_1_420px] gap-3`}>
          <Heading title="Budget vs spent" sub="Categories with a monthly budget" />
          {eo.budgets.map((b) => (
            <div key={b.name} className="flex flex-col gap-1">
              <div className="type-small flex justify-between text-text">
                <span>{b.name}</span>
                <span className={`u-num ${b.pct > 100 ? "text-danger-text" : "text-text-secondary"}`}>
                  KES {fmt(b.spent)} of {fmt(b.budget)}
                </span>
              </div>
              <Bar w={Math.min(100, b.pct)} color={b.pct > 100 ? "var(--danger-text)" : b.pct > 80 ? "var(--warning-text)" : "var(--green-600)"} />
            </div>
          ))}
        </div>
        <div className={`${PANEL} flex-[1_1_320px] gap-3`}>
          <Heading title="Paid from" sub="Which accounts the money left this month" />
          {eo.byAccount.map((a) => (
            <div key={a.name} className="flex flex-col gap-1">
              <div className="type-small flex justify-between text-text">
                <span>{a.name}</span>
                <span className="u-num text-text-secondary">KES {fmt(a.amount)}</span>
              </div>
              <Bar w={(a.amount / accMax) * 100} color="var(--info-text)" />
            </div>
          ))}
          {!eo.byAccount.length && <div className="type-small text-text-muted">Nothing paid yet this month.</div>}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className={`${PANEL} flex-[1_1_420px] gap-3`}>
          <Heading title="Biggest expenses" sub="This month" link="/expenses/expenses" />
          {eo.top.map((e) => (
            <Item
              key={e.ref}
              lead={<Dot color={catColor(e.category)} />}
              name={e.reason !== "—" ? e.reason : e.category}
              sub={`${e.ref} · ${e.category} · ${docDate(e.date)}`}
              amount={`KES ${fmt(e.amount)}`}
              amountClass="text-danger-text"
            />
          ))}
        </div>
        <div className={`${PANEL} flex-[1_1_320px] gap-3`}>
          <Heading title="Coming up" sub="Repeat bills due next" link="/expenses/recurring" />
          {eo.upcoming.map((u) => {
            const [day, mon] = docDate(u.next).split(" ");
            return (
              <Item
                key={u.ref}
                lead={
                  <span className="w-11 flex-none text-center">
                    <span className="type-title block text-text">{day}</span>
                    <span className="type-caption block text-text-muted">{mon}</span>
                  </span>
                }
                name={u.name}
                sub={`${u.category} · ${u.repeats}`}
                amount={`KES ${fmt(u.amount)}`}
                amountClass="text-text"
              />
            );
          })}
          {!eo.upcoming.length && <div className="type-small text-text-muted">No active repeat bills.</div>}
        </div>
      </div>
      <ExpenseOverlays create="expense" />
    </div>
  );
}
