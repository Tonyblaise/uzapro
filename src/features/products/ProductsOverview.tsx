"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { List } from "lucide-react";
import { getModule, hrefFor } from "@/config/modules";
import { productsOverviewData, useCategories, useProducts } from "@/data";
import { num } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProductOverlays } from "./ProductList";
import { useOverlayParams } from "./shared";

/**
 * The design's ring palette. Its last three entries were raw hex (pink, violet, muted); they map
 * to the nearest tokens here (Principle IV).
 */
const PALETTE = ["var(--green-600)", "var(--info-text)", "var(--warning-text)", "var(--danger-text)", "var(--status-neutral-text)", "var(--text-muted)"];

const panel = "flex min-w-0 flex-col rounded-lg border border-border bg-surface p-5";

/** Design `prodboard` (Products › Overview), derived like the design's `pd` object. */
export function ProductsOverview() {
  const router = useRouter();
  const products = useProducts();
  const categories = useCategories();
  const { action, open, close } = useOverlayParams();

  const pd = useMemo(() => {
    const data = productsOverviewData();
    const tops = categories.filter((c) => !c.parent).map((c) => c.name);
    const subCount = categories.length - tops.length;
    const topOf = (c: string) => categories.find((x) => x.name === c)?.parent || c;
    const variants = products.reduce((a, p) => a + p.variants.length, 0);
    const lowRows = products.filter((p) => p.status.tone !== "success");

    const kpis = [
      { label: "Total products", value: products.length, note: "Active in your catalogue", icon: "boxes", bg: "var(--green-50)", color: "var(--green-700)", href: hrefFor("prod", "All products") },
      { label: "Categories", value: tops.length, note: subCount ? `Plus ${subCount} sub-categories` : "Groups of products", icon: "list", bg: "var(--info-soft)", color: "var(--info-text)", href: hrefFor("prod", "Categories") },
      { label: "Variants", value: variants, note: "Sizes, colours and units", icon: "sliders-horizontal", bg: "var(--danger-soft)", color: "var(--danger-text)", href: hrefFor("prod", "All products") },
      { label: "Low stock", value: lowRows.length, note: lowRows.length ? "Need restocking" : "All good", icon: "circle-alert", bg: "var(--warning-soft)", color: "var(--warning-text)", href: hrefFor("inv", "Stock management") },
    ];

    const tr = data.trend;
    const mx = Math.ceil(Math.max(...tr.map((x) => x[1])) / 200) * 200 || 200;
    const last = Math.max(1, tr.length - 1);
    const pts = tr.map((x, i) => [(i / last) * 100, 100 - (x[1] / mx) * 100] as const);
    let line = pts.length ? `M${pts[0]![0]},${pts[0]![1]}` : "";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      const cx = (a[0] + b[0]) / 2;
      line += ` C${cx},${a[1]} ${cx},${b[1]} ${b[0]},${b[1]}`;
    }
    const first = tr[0];
    const lastPt = tr[last];

    const byCat = tops.map((c) => [c, products.filter((p) => topOf(p.category) === c).length] as const).filter((c) => c[1] > 0);
    const tot = byCat.reduce((a, c) => a + c[1], 0) || 1;
    const ringParts: string[] = [];
    for (let i = 0, at = 0; i < byCat.length; i++) {
      const e = at + (byCat[i]![1] / tot) * 100;
      ringParts.push(`${PALETTE[i % PALETTE.length]} ${at}% ${e}%`);
      at = e;
    }
    const ring = `conic-gradient(${ringParts.join(", ") || "var(--border) 0 100%"})`;

    const soldRows = data.bars.find((b) => b.t === "Units sold by product")?.rows ?? [];
    const sold = new Map<string, number>(soldRows.map((r) => [r[0], r[1]]));
    const top = products
      .filter((p) => sold.get(p.name))
      .sort((a, b) => (sold.get(b.name) ?? 0) - (sold.get(a.name) ?? 0))
      .slice(0, 5)
      .map((p, i) => ({
        rank: String(i + 1),
        name: p.name,
        price: p.priceLabel.startsWith("From ") ? `from KES ${p.priceLabel.slice(5)}` : `KES ${p.priceLabel}`,
        sold: num(sold.get(p.name) ?? 0),
      }));

    return {
      kpis,
      yTicks: [mx, mx * 0.75, mx / 2, mx / 4, 0].map((n) => String(Math.round(n))),
      months: tr.map((x) => x[0]),
      line,
      area: `${line} L100,100 L0,100 Z`,
      dots: pts.map((p, i) => ({ x: `${p[0]}%`, y: `${p[1]}%`, title: `${tr[i]![0]}: ${tr[i]![1]} units` })),
      trendLabel: first && lastPt ? `Units sold per month, from ${first[1]} in ${first[0]} to ${lastPt[1]} in ${lastPt[0]}` : "",
      ring,
      total: String(products.length),
      ringLabel: byCat.map((c) => `${c[0]} ${c[1]}`).join(", "),
      cats: byCat.map((c, i) => ({ name: c[0], count: String(c[1]), pct: `${Math.round((c[1] / tot) * 100)}%`, color: PALETTE[i % PALETTE.length]! })),
      top,
      low: lowRows.slice(0, 5).map((p) => ({ name: p.name, sub: `${p.onHand} in stock · ${p.category}`, pill: p.status.label, tone: p.status.tone })),
    };
  }, [products, categories]);

  const reports = getModule("rep");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--grid-kpi-min),1fr))] gap-4">
        {pd.kpis.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => router.push(k.href)}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-5 py-4 text-left"
          >
            <span>
              <span className="type-eyebrow block text-text-muted">{k.label}</span>
              <span className="mt-1 block text-[28px] font-bold text-text">{k.value}</span>
              <span className="type-caption block text-text-muted">{k.note}</span>
            </span>
            <span className="grid size-11 flex-none place-items-center rounded-md" style={{ background: k.bg, color: k.color }}>
              {/* "list" is not in the shared Icon map yet. */}
              {k.icon === "list" ? <List size={20} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" focusable="false" /> : <Icon name={k.icon} size={20} />}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <section className={`${panel} flex-[2_1_520px] gap-3`}>
          <div>
            <h2 className="type-title m-0 text-text">Product sales</h2>
            <div className="type-small text-text-secondary">Units sold each month</div>
          </div>
          <div className="grid h-[240px] grid-cols-[40px_minmax(0,1fr)] gap-2">
            <div className="type-caption flex flex-col justify-between pb-5 text-right text-text-muted" aria-hidden="true">
              {pd.yTicks.map((y, i) => (
                <span key={i}>{y}</span>
              ))}
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="relative flex-1 border-b border-l border-border">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={pd.trendLabel} className="absolute inset-0 size-full overflow-visible">
                  <path d={pd.area} fill="var(--green-100)" opacity={0.7} />
                  <path d={pd.line} fill="none" stroke="var(--green-600)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
                </svg>
                {pd.dots.map((dt) => (
                  <span
                    key={dt.title}
                    title={dt.title}
                    className="absolute -ml-[4.5px] -mt-[4.5px] size-[9px] rounded-full border-2 border-green-600 bg-surface"
                    style={{ left: dt.x, top: dt.y }}
                  />
                ))}
              </div>
              <div className="type-caption flex justify-between pt-1.5 text-text-muted">
                {pd.months.map((mo) => (
                  <span key={mo}>{mo}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`${panel} flex-[1_1_300px] gap-4`}>
          <h2 className="type-title m-0 text-text">Products by category</h2>
          <div className="grid place-items-center">
            <div role="img" aria-label={pd.ringLabel} className="grid size-[180px] place-items-center rounded-full" style={{ background: pd.ring }}>
              <div className="grid size-[120px] place-items-center rounded-full bg-surface text-center">
                <span>
                  <span className="block text-[24px] font-bold text-text">{pd.total}</span>
                  <span className="type-caption text-text-muted">products</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {pd.cats.map((c) => (
              <div key={c.name} className="type-small flex items-center gap-2 text-text">
                <span className="size-2.5 flex-none rounded-full" style={{ background: c.color }} />
                <span className="flex-1">{c.name}</span>
                <span className="text-text-secondary">{c.count}</span>
                <span className="w-11 text-right text-text-muted">{c.pct}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4">
        <section className={`${panel} gap-3`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="type-title m-0 text-text">Top selling products</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(hrefFor("rep", reports.tabs[0]?.title))}>
              View all
            </Button>
          </div>
          {pd.top.map((t) => (
            <div key={t.name} className="flex items-center gap-3 rounded-md bg-canvas px-3 py-2">
              <span className="type-caption grid size-8 flex-none place-items-center rounded-md bg-green-100 font-bold text-green-700">{t.rank}</span>
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text">{t.name}</span>
                <span className="type-caption block text-text-muted">Price: {t.price}</span>
              </span>
              <span className="type-caption rounded-pill bg-green-50 px-2 py-0.5 font-semibold text-green-700">{t.sold} sold</span>
            </div>
          ))}
        </section>

        <section className={`${panel} gap-3`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="type-title m-0 text-text">Low stock products</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(hrefFor("inv", "Stock management"))}>
              View all
            </Button>
          </div>
          {pd.low.length === 0 && (
            <div className="py-8 text-center">
              <div className="type-label text-text">Stock levels look good</div>
              <div className="type-small text-text-secondary">Nothing is running low.</div>
            </div>
          )}
          {pd.low.map((l) => (
            <div key={l.name} className="flex items-center gap-3 rounded-md bg-canvas px-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text">{l.name}</span>
                <span className="type-caption block text-text-muted">{l.sub}</span>
              </span>
              <StatusPill tone={l.tone}>{l.pill}</StatusPill>
            </div>
          ))}
        </section>
      </div>

      <ProductOverlays action={action} view={null} open={open} close={close} />
    </div>
  );
}

/** Overview header actions (design `headerActions`): "Manage categories" and "Add product". */
export function OverviewActions() {
  const router = useRouter();
  const { open } = useOverlayParams();
  return (
    <>
      <Button variant="secondary" icon="sliders-horizontal" onClick={() => router.push(hrefFor("prod", "Categories"))}>
        Manage categories
      </Button>
      <Button icon="plus" onClick={() => open({ action: "new" })}>
        Add product
      </Button>
    </>
  );
}
