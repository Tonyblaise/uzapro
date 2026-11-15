"use client";
/**
 * Charts and the Analysis panel above a report's table (design `v.rp.ch`, feature 009 design
 * update): a bar chart and a donut side by side, a monthly trend below, then the green Analysis
 * box. Drawn with plain elements as in the design; each chart is one labelled image.
 */
import type { ReactNode } from "react";
import type { ReportCharts as Charts } from "@/data";
import { Icon } from "@/components/ui/Icon";

function ChartCard({ title, sub, grow = true, children, extra }: { title: string; sub: string; grow?: boolean; children: ReactNode; extra?: ReactNode }) {
  return (
    <section aria-label={title} className={`flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-surface px-5 py-4 ${grow ? "flex-[1_1_340px]" : ""}`}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-[200px] flex-1">
          <div className="type-title text-text">{title}</div>
          <div className="type-small text-text-muted">{sub}</div>
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function ReportCharts({ ch }: { ch: Charts }) {
  const { bars, donut, trend, insights } = ch;
  return (
    <>
      {(bars || donut || trend) && (
        <div className="flex flex-col gap-3">
          {(bars || donut) && (
            <div className="flex flex-wrap gap-3">
              {bars && (
                <ChartCard title={bars.title} sub={bars.sub}>
                  <div role="img" aria-label={bars.aria} className="flex flex-col gap-2.5">
                    {bars.bars.map((b) => (
                      <div key={b.label} title={b.tip}>
                        <div className="type-small mb-1 flex justify-between gap-2">
                          <span className="truncate text-text">{b.label}</span>
                          <span className="u-num whitespace-nowrap text-text-secondary">{b.value}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                          <div className="h-full rounded-full" style={{ width: `${b.width.toFixed(1)}%`, background: b.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}
              {donut && (
                <ChartCard title={donut.title} sub={donut.sub}>
                  <div className="flex flex-wrap items-center gap-5">
                    <div role="img" aria-label={donut.aria} className="grid size-[150px] flex-none place-items-center rounded-full" style={{ background: donut.background }}>
                      <div className="grid size-24 place-items-center rounded-full bg-surface text-center">
                        <div>
                          <div className="type-small text-text-muted">{donut.label}</div>
                          <div className="type-label u-num text-text">{donut.total}</div>
                        </div>
                      </div>
                    </div>
                    <ul className="m-0 flex min-w-[160px] flex-1 list-none flex-col gap-2 p-0">
                      {donut.legend.map((l) => (
                        <li key={l.label} className="type-small flex items-center gap-2">
                          <span aria-hidden="true" className="size-2.5 flex-none rounded-[3px]" style={{ background: l.color }} />
                          <span className="min-w-0 flex-1 truncate text-text">{l.label}</span>
                          <span className="u-num text-text-secondary">{l.pct}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ChartCard>
              )}
            </div>
          )}
          {trend && (
            <ChartCard
              title={trend.title}
              sub={trend.sub}
              grow={false}
              extra={
                <div className="flex flex-wrap gap-3.5">
                  {trend.series.map((s) => (
                    <span key={s.label} className="type-small inline-flex items-center gap-1.5 text-text-secondary">
                      <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: s.color }} />
                      {s.label}
                    </span>
                  ))}
                </div>
              }
            >
              <div role="img" aria-label={trend.aria} className="flex h-[180px] items-end border-b border-border pt-2" style={{ gap: "clamp(6px,2vw,22px)" }}>
                {trend.months.map((m) => (
                  <div key={m.label} title={m.tip} className="flex h-full min-w-0 flex-1 items-end justify-center gap-[3px]" style={{ opacity: m.partial ? 0.55 : 1 }}>
                    <div className="max-w-7 flex-1 rounded-t" style={{ height: `${m.h1.toFixed(1)}%`, background: trend.colors[0] }} />
                    {m.h2 !== null && <div className="max-w-7 flex-1 rounded-t" style={{ height: `${m.h2.toFixed(1)}%`, background: trend.colors[1] }} />}
                  </div>
                ))}
              </div>
              <div aria-hidden="true" className="-mt-1 flex" style={{ gap: "clamp(6px,2vw,22px)" }}>
                {trend.months.map((m) => (
                  <div key={m.label} className="type-small min-w-0 flex-1 text-center text-text-muted">
                    {m.label}
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </div>
      )}
      {insights.length > 0 && (
        <section aria-label="Analysis" className="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
          <div className="type-title flex items-center gap-2 text-green-800">
            <Icon name="lightbulb" size={18} />
            Analysis
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {insights.map((i) => (
              <li key={i.text} className="type-body flex items-start gap-2.5 text-text">
                <span aria-hidden="true" className="mt-2 size-1.5 flex-none rounded-full" style={{ background: i.color }} />
                <span>{i.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
