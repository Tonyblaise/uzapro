"use client";
/** Sales › Overview (design `salesdash`). Headline figures are frozen (FR-005); recent sales are live. */
import Link from "next/link";
import { salesOverviewData, useSales } from "@/data";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { num } from "@/lib/format";
import { amount } from "./shared";

const RING = ["var(--green-700)", "var(--green-500)", "var(--green-200)"];
const DOT = ["bg-green-700", "bg-green-500", "bg-green-200"];

/** The design's conic ring for "Sales by channel" (stops as cumulative shares). */
function channelRing(values: readonly number[]): string {
  const sum = values.reduce((a, v) => a + v, 0);
  const stops = values.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + (v / sum) * 100], []);
  return `conic-gradient(${values.map((_, i) => `${RING[i % 3]} ${stops[i - 1] ?? 0}% ${stops[i]}%`).join(", ")})`;
}

/** The design's `kes` for overview panels: "4.82M" above a million, grouped otherwise. */
const short = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n.toLocaleString("en-US"));

export function SalesOverview() {
  const sd = salesOverviewData();
  const sales = useSales();
  const tr = sd.trend;
  const last = Math.max(1, tr.v.length - 1);
  const pts = tr.v.map((x, i) => [(i / last) * 100, 100 - (x / tr.max) * 100] as const);
  const line = pts.map((p) => `${p[0]},${p[1]}`).join(" ");
  const ring = channelRing(sd.channels.map((c) => c[1]));
  const top = sd.boards.find((b) => b.t === "Top products")?.rows ?? [];
  const topMax = Math.max(...top.map((r) => r[2]));
  const ticks = [5, 4, 3, 2, 1, 0].map((n) => (n ? `KES ${n}M` : "0"));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(var(--grid-kpi-min),1fr))" }}>
        {sd.kpis.map((k) => (
          <KpiCard key={k[0]} label={k[0]} value={k[1]} caption={k[2]} />
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="min-w-0 flex-[2_1_480px]">
          <Card title="Revenue trends" subtitle="Your sales over the last 6 months" className="h-full">
            <div className="flex gap-3 pt-2">
              <div className="type-caption u-num -my-2 flex h-64 flex-col justify-between whitespace-nowrap text-right text-text-muted">
                {ticks.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="relative h-60 border-b border-border">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {ticks.map((t) => (
                      <span key={t} className="h-px bg-border" />
                    ))}
                  </div>
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label={`Monthly sales rising from KES ${tr.v[0]}M in ${tr.l[0]} to KES ${tr.v[last]}M in ${tr.l[last]}`}
                    className="absolute inset-0 block size-full overflow-visible"
                  >
                    <polygon points={`0,100 ${line} 100,100`} fill="var(--green-50)" />
                    <polyline points={line} fill="none" stroke="var(--green-500)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                  {pts.map((p, i) => (
                    <span
                      key={tr.l[i]}
                      title={`${tr.l[i]}: KES ${tr.v[i]}M`}
                      className="absolute -ml-1 -mt-1 size-2 rounded-full bg-green-500"
                      style={{ left: `${p[0]}%`, top: `${p[1]}%` }}
                    />
                  ))}
                </div>
                <div className="type-caption mt-2 flex justify-between text-text-muted">
                  {tr.l.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="min-w-0 flex-[1_1_280px]">
          <Card title="Sales by channel" subtitle="Distribution across channels" className="h-full">
            <div className="flex flex-col items-center gap-4 pt-2">
              <div role="img" aria-label={sd.channels.map((c) => `${c[0]} KES ${short(c[1])}`).join(", ")} className="grid size-[150px] place-items-center rounded-full" style={{ background: ring }}>
                <span className="size-[92px] rounded-full bg-surface" />
              </div>
              <div className="flex w-full flex-col gap-2">
                {sd.channels.map((c, i) => (
                  <div key={c[0]} className="type-small flex items-center gap-2 rounded-sm bg-canvas px-3 py-2 text-text">
                    <span className={`size-2 flex-none rounded-full ${DOT[i % 3]}`} />
                    <span className="min-w-0 flex-1">{c[0]}</span>
                    <span className="u-num font-semibold">KES {short(c[1])}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="min-w-0 flex-[2_1_480px]">
          <Card title="Top performing products" subtitle="Best sellers in your catalogue" className="h-full">
            {top.slice(0, 5).map((r) => (
              <div key={r[0]} className="type-body u-num grid items-center gap-x-3 py-1 text-text" style={{ gridTemplateColumns: "minmax(0,1fr) 64px 112px" }}>
                <span className="relative min-w-0 px-2 py-1">
                  <span className="absolute inset-y-0 left-0 rounded-sm bg-green-50" style={{ width: `${(r[2] / topMax) * 100}%` }} />
                  <span className="relative block truncate">{r[0]}</span>
                </span>
                <span className="text-right text-text-muted">{num(r[1])}</span>
                <span className="text-right">{num(r[2])}</span>
              </div>
            ))}
          </Card>
        </div>
        <div className="min-w-0 flex-[1_1_280px]">
          <Card title="Categories" subtitle="Sales breakdown" className="h-full">
            <div className="flex flex-col gap-2">
              {sd.categories.map((c) => (
                <div key={c[0]} className="type-small flex justify-between gap-3 text-text">
                  <span>{c[0]}</span>
                  <span className="u-num text-text-muted">KES {short(c[1])}</span>
                </div>
              ))}
              <div className="my-1 h-px bg-border" />
              <div className="type-small flex justify-between rounded-sm bg-canvas px-3 py-2 text-text">
                <span>Total orders</span>
                <span className="font-semibold">{sd.orders.total}</span>
              </div>
              <div className="type-small flex justify-between rounded-sm bg-canvas px-3 py-2 text-text">
                <span>Returns</span>
                <span className="font-semibold">{sd.orders.returns}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="min-w-0 flex-[2_1_480px]">
          <Card className="h-full">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h2 className="type-card-title m-0 text-text">Recent transactions</h2>
                <div className="type-small text-text-muted">Latest sales activity</div>
              </div>
              <Link
                href="/sales/all-sales"
                className="type-label inline-flex h-[var(--control-height-sm)] items-center rounded-sm border border-border-strong bg-surface px-[10px] text-[13px] text-text hover:bg-surface-hover"
              >
                View all
              </Link>
            </div>
            {sales.slice(0, 4).map((r) => (
              <div key={r.ref} className="flex items-center gap-3 border-t border-border py-3">
                <span className="min-w-0 flex-1">
                  <span className="type-label block text-text">{r.customer}</span>
                  <span className="type-small block text-text-muted">
                    {r.type}, {r.channel}
                  </span>
                </span>
                <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill>
                <span className="type-label u-num whitespace-nowrap text-text">KES {amount(r.total)}</span>
              </div>
            ))}
          </Card>
        </div>
        <div className="min-w-0 flex-[1_1_280px]">
          <Card title="Order statistics" subtitle="Orders, returns and voids" className="h-full">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Total sales", sd.orders.total],
                  ["Returns", sd.orders.returns],
                  ["Voids", sd.orders.voids],
                  ["Free items", sd.orders.free],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-md bg-canvas p-3 text-center">
                  <div className="type-small text-text-muted">{label}</div>
                  <div className="type-kpi mt-1 text-text">{value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
