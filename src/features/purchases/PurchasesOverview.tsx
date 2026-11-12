"use client";
/**
 * Purchases › Overview (design `v.isBuyBoard`): the 8 KPIs (`bKpis`), "Purchase orders by month"
 * (`bReq`), "Purchase order status" (`bStatus` ring), "Supplier performance" (`bPerf`), "Spending
 * trend (6 months)" (`bSpend`), "Recent orders" (live list, "View all") and "Top suppliers" (`bTop`).
 * KPI, ring and top-supplier figures are computed once from the seed and frozen (FR-011).
 */
import Link from "next/link";
import { purchasesOverviewData, usePurchaseOrders } from "@/data";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { parseKpiCaption } from "@/components/ui/KpiCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { PurchaseOverlays } from "./PurchaseOverlays";
import { amount } from "./shared";

/** The design's `trend()` chart: y ticks from max to 0, gridlines, and an area + line in a 100×100 box. */
function Trend({ series, fmt, label }: { series: { l: readonly string[]; v: readonly number[]; max: number; step?: number }; fmt: (n: number) => string; label: string }) {
  const step = series.step ?? 1;
  const ticks: string[] = [];
  for (let n = series.max; n >= 0; n -= step) ticks.push(fmt(n));
  const pts = series.v.map((x, i) => `${(i / (series.v.length - 1)) * 100},${100 - (x / series.max) * 100}`).join(" ");
  return (
    <div className="flex gap-2 pt-2">
      <div className="type-caption -my-2 flex h-[186px] flex-col justify-between whitespace-nowrap text-right text-text-muted" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-[170px] border-b border-border">
          <div className="absolute inset-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <span key={t} className="h-px bg-border" />
            ))}
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={label} className="absolute inset-0 block size-full overflow-visible">
            <polygon points={`0,100 ${pts} 100,100`} fill="var(--green-50)" />
            <polyline points={pts} fill="none" stroke="var(--green-500)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="type-caption mt-2 flex justify-between text-text-muted">
          {series.l.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PurchasesOverview() {
  const bd = purchasesOverviewData();
  const orders = usePurchaseOrders();
  const shown = bd.status.filter((x) => x.count);
  const share = (x: { count: number }) => (x.count / (bd.totalOrders || 1)) * 100;
  const ring = `conic-gradient(${shown
    .map((x, i) => {
      const from = shown.slice(0, i).reduce((a, y) => a + share(y), 0);
      return `${x.color} ${from}% ${from + share(x)}%`;
    })
    .join(",")})`;
  const ringLabel = `Purchase orders by status: ${bd.status.map((x) => `${x.name} ${x.count}`).join(", ")}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="uz-kpi8">
        {bd.kpis.map((k) => {
          const c = parseKpiCaption(k.caption);
          return (
            <div key={k.label} className="min-w-0 rounded-md border border-border bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="type-eyebrow min-w-0 text-text-muted">{k.label}</span>
                <span className="grid size-[30px] flex-none place-items-center rounded-sm bg-green-50 text-green-700">
                  <Icon name={k.icon} size={16} />
                </span>
              </div>
              <div className="type-title u-num text-text">{k.value}</div>
              <div className="type-caption mt-2 text-text-muted">
                {c.delta !== undefined && <span className="font-semibold text-green-700">↗ {Math.abs(c.delta)}%</span>} {c.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="uz-c4">
        <Card title="Purchase orders by month">
          <Trend series={bd.orders} fmt={(n) => String(n)} label="Purchase orders by month" />
        </Card>
        <Card title="Purchase order status">
          <div className="flex flex-col items-center gap-3 pt-2">
            <div role="img" aria-label={ringLabel} className="grid size-[140px] place-items-center rounded-full" style={{ background: ring }}>
              <span className="size-[86px] rounded-full bg-surface" />
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              {bd.status.map((s) => (
                <span key={s.name} className="type-caption inline-flex items-center gap-1.5 text-text-secondary">
                  <span aria-hidden="true" className="size-2.5 rounded-[2px]" style={{ background: s.color }} />
                  {s.name} {s.count}
                </span>
              ))}
            </div>
          </div>
        </Card>
        <Card title="Supplier performance">
          <div className="flex flex-col gap-3 pt-2">
            <span className="type-small text-text-muted">Delivered on time</span>
            {Object.entries(bd.onTime).map(([name, pct]) => (
              <div key={name}>
                <div className="type-small flex justify-between gap-2 text-text">
                  <span>{name}</span>
                  <span className="u-num">{pct}%</span>
                </div>
                <div className="mt-1 h-2 rounded bg-canvas">
                  <div className="h-2 rounded bg-green-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="col-span-full">
          <Card title="Spending trend (6 months)">
            <Trend series={bd.spend} fmt={(n) => (n ? `KES ${n}K` : "0")} label="Spending by month" />
          </Card>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(var(--grid-panel-min),100%),1fr))" }}>
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="type-card-title text-text">Recent orders</span>
            <Link href="/purchases/purchase-orders" className="type-small font-medium text-link">
              View all
            </Link>
          </div>
          {orders.slice(0, 4).map((o) => (
            <div key={o.ref} className="flex items-center gap-3 border-t border-border py-3">
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text">{o.ref}</span>
                <span className="type-small block text-text-muted">{o.supplier}</span>
              </span>
              <StatusPill tone={o.status.tone}>{o.status.label}</StatusPill>
              <span className="type-label u-num whitespace-nowrap text-text">KES {amount(o.total)}</span>
            </div>
          ))}
        </Card>
        <Card title="Top suppliers">
          <div className="flex flex-col gap-4 pt-2">
            {bd.top.map((t) => (
              <div key={t.name}>
                <div className="type-label u-num flex justify-between gap-3 text-text">
                  <span>{t.name}</span>
                  <span>{t.total}</span>
                </div>
                <div className="mt-1 h-2 rounded bg-canvas">
                  <div className="h-2 rounded bg-green-500" style={{ width: `${t.share}%` }} />
                </div>
                <div className="type-caption mt-1 flex justify-between gap-3 text-text-muted">
                  <span>{t.orders}</span>
                  <span>On time: {t.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <PurchaseOverlays create="order" />
    </div>
  );
}
