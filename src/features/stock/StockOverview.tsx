"use client";

import { stockOverviewData, useMovements } from "@/data";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { BarChart } from "@/components/charts/Charts";
import { date } from "@/lib/format";
import { signed } from "./shared";
import { StockInOverlay } from "./StockInForm";

const RING = ["var(--green-700)", "var(--green-500)", "var(--green-200)", "var(--green-100)"];

/** Design `isStockBoard` (Stock › Overview). Fixed figures plus the live movement list. */
export function StockOverview() {
  const sd = stockOverviewData();
  const moves = useMovements();
  const kpis = [...sd.kpis.map(([label, value, caption]) => ({ label, value, caption })), { label: "Recent stock movements", value: String(moves.length), caption: "Last 30 days" }];
  const low = sd.low.filter((r) => r[4].tone !== "success");
  const ring = `conic-gradient(${sd.categories
    .map(([, share], i) => {
      const at = sd.categories.slice(0, i).reduce((a, c) => a + c[1], 0);
      return `${RING[i % 4]} ${at}% ${at + share}%`;
    })
    .join(", ")})`;
  const w = sd.week;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(var(--grid-kpi-min), 1fr))" }}>
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} caption={k.caption} />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="min-w-0 flex-[2_1_480px]">
          <Card title="Stock movements" subtitle="Last 7 days" className="h-full">
            <BarChart labels={w.l} a={w.inn} b={w.out} max={w.max} step={w.step} aName="Stock in" bName="Stock out" label="Stock in and stock out over the last 7 days" />
          </Card>
        </div>
        <div className="min-w-0 flex-[1_1_280px]">
          <Card title="Stock by category" subtitle="Share of stock value" className="h-full">
            <div className="flex flex-col items-center gap-4 pt-2">
              <div role="img" aria-label={sd.categories.map(([n, s]) => `${n} ${s}%`).join(", ")} className="grid size-[150px] place-items-center rounded-full" style={{ background: ring }}>
                <span className="size-[92px] rounded-full bg-surface" />
              </div>
              <div className="flex w-full flex-col gap-2">
                {sd.categories.map(([name, share], i) => (
                  <div key={name} className="type-small flex items-center gap-2 text-text">
                    <span aria-hidden="true" className="size-2.5 flex-none rounded-[2px]" style={{ background: RING[i % 4] }} />
                    <span className="min-w-0 flex-1">{name}</span>
                    <span className="u-num text-text-muted">{share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(var(--grid-panel-min), 100%), 1fr))" }}>
        <Card title="Recent stock movement">
          {moves.length === 0 && <div className="type-small py-6 text-center text-text-muted">No recent movements found.</div>}
          {moves.slice(0, 5).map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-t border-border py-3">
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text">
                  {m.product} · {m.variant}
                </span>
                <span className="type-small block text-text-muted">
                  {date(m.date)}, {m.store}
                </span>
              </span>
              <StatusPill tone={m.kind.tone}>{m.kind.label}</StatusPill>
              <span className="type-label u-num whitespace-nowrap text-text">{signed(m.change)}</span>
            </div>
          ))}
        </Card>
        <Card title="Low stock alerts">
          {low.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-success-text">
              <Icon name="circle-check" size={18} />
              <span className="type-label text-text">All stock levels are healthy.</span>
            </div>
          )}
          {low.map((r) => (
            <div key={r[0]} className="flex items-center gap-3 border-t border-border py-3">
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text">{r[0]}</span>
                <span className="type-small block text-text-muted">
                  {r[2]} left, buy more at {r[3]}
                </span>
              </span>
              <StatusPill tone={r[4].tone}>{r[4].label}</StatusPill>
            </div>
          ))}
        </Card>
      </div>
      <StockInOverlay />
    </div>
  );
}
