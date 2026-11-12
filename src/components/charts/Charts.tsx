/**
 * Hand-written SVG charts (research R10). Token colours only; every chart is role="img" with a label.
 * Series A = green-500 (brand), series B = green-200 (pale), as in the canvas charts.
 */
import type { ReactNode } from "react";

export interface SeriesChartProps {
  labels: readonly string[];
  a: readonly number[];
  b?: readonly number[];
  max: number;
  aName: string;
  bName?: string;
  /** Tick formatter for the y axis, e.g. v => `KES ${v}M`. */
  tick?: (v: number) => string;
  step?: number;
  height?: number;
  label: string;
}

const W = 640;
const PAD = { l: 64, r: 12, t: 12, b: 28 };

function Axes({ labels, max, step, tick, height, children }: { labels: readonly string[]; max: number; step: number; tick: (v: number) => string; height: number; children: ReactNode }) {
  const ticks: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(Number(v.toFixed(6)));
  const y = (v: number) => height - PAD.b - (v / max) * (height - PAD.t - PAD.b);
  const band = (W - PAD.l - PAD.r) / labels.length;
  return (
    <>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth={1} />
          <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" fill="var(--text-muted)" fontSize={11}>
            {tick(v)}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={l} x={PAD.l + band * i + band / 2} y={height - 8} textAnchor="middle" fill="var(--text-muted)" fontSize={11}>
          {l}
        </text>
      ))}
      {children}
    </>
  );
}

export function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className="type-caption flex flex-wrap justify-center gap-4 text-text-secondary">
      {items.map((it) => (
        <span key={it.name} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-[2px]" style={{ background: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  );
}

export function BarChart({ labels, a, b, max, aName, bName, tick = (v) => String(v), step = 1, height = 220, label }: SeriesChartProps) {
  const band = (W - PAD.l - PAD.r) / labels.length;
  const bw = Math.min(22, band / 4);
  const y = (v: number) => height - PAD.b - (v / max) * (height - PAD.t - PAD.b);
  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label} className="h-auto w-full">
        <Axes labels={labels} max={max} step={step} tick={tick} height={height}>
          {labels.map((l, i) => {
            const cx = PAD.l + band * i + band / 2;
            const av = a[i] ?? 0;
            const bv = b?.[i] ?? 0;
            return (
              <g key={l}>
                <rect x={b ? cx - bw - 2 : cx - bw / 2} y={y(av)} width={bw} height={Math.max(0, y(0) - y(av))} rx={3} fill="var(--green-500)" />
                {b && <rect x={cx + 2} y={y(bv)} width={bw} height={Math.max(0, y(0) - y(bv))} rx={3} fill="var(--green-200)" />}
              </g>
            );
          })}
        </Axes>
      </svg>
      <Legend items={[{ name: aName, color: "var(--green-500)" }, ...(b && bName ? [{ name: bName, color: "var(--green-200)" }] : [])]} />
    </div>
  );
}

function points(values: readonly number[], labels: readonly string[], max: number, height: number) {
  const band = (W - PAD.l - PAD.r) / labels.length;
  return values.map((v, i) => [PAD.l + band * i + band / 2, height - PAD.b - (v / max) * (height - PAD.t - PAD.b)] as const);
}

export function LineChart({ labels, a, b, max, aName, bName, tick = (v) => String(v), step = 1, height = 220, label, area = false }: SeriesChartProps & { area?: boolean }) {
  const pa = points(a, labels, max, height);
  const pb = b ? points(b, labels, max, height) : [];
  const path = (pts: readonly (readonly [number, number])[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const base = height - PAD.b;
  const fill = (pts: readonly (readonly [number, number])[]) => (pts.length ? `${path(pts)} L${pts[pts.length - 1]![0]},${base} L${pts[0]![0]},${base} Z` : "");
  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label} className="h-auto w-full">
        <Axes labels={labels} max={max} step={step} tick={tick} height={height}>
          {area && <path d={fill(pa)} fill="var(--green-50)" />}
          {area && b && <path d={fill(pb)} fill="var(--green-100)" opacity={0.6} />}
          <path d={path(pa)} fill="none" stroke="var(--green-500)" strokeWidth={2.5} strokeLinejoin="round" />
          {b && <path d={path(pb)} fill="none" stroke="var(--green-200)" strokeWidth={2.5} strokeLinejoin="round" />}
          {pa.map((p, i) => (
            <circle key={`a${i}`} cx={p[0]} cy={p[1]} r={3.5} fill="var(--surface)" stroke="var(--green-500)" strokeWidth={2} />
          ))}
          {pb.map((p, i) => (
            <circle key={`b${i}`} cx={p[0]} cy={p[1]} r={3.5} fill="var(--surface)" stroke="var(--green-200)" strokeWidth={2} />
          ))}
        </Axes>
      </svg>
      <Legend items={[{ name: aName, color: "var(--green-500)" }, ...(b && bName ? [{ name: bName, color: "var(--green-200)" }] : [])]} />
    </div>
  );
}

export function AreaChart(props: SeriesChartProps) {
  return <LineChart {...props} area />;
}

/** Labelled horizontal bars ("Top selling products"): pale green bar behind the label, value on the right. */
export function HBarList({ rows, format, label }: { rows: readonly (readonly [string, number])[]; format: (v: number) => string; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <ul aria-label={label} className="m-0 flex list-none flex-col gap-2 p-0">
      {rows.map(([name, v]) => (
        <li key={name} className="flex items-center gap-3">
          <div className="relative h-7 min-w-0 flex-1">
            <div className="absolute inset-y-0 left-0 rounded-sm bg-green-50" style={{ width: `${(v / max) * 100}%` }} />
            <span className="type-body relative flex h-full items-center truncate px-2 text-text">{name}</span>
          </div>
          <span className="type-body u-num whitespace-nowrap text-text">{format(v)}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProgressBar({ value, tone = "action", label }: { value: number; tone?: "action" | "warning" | "danger" | "success"; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = { action: "bg-action", warning: "bg-warning", danger: "bg-danger", success: "bg-success" }[tone];
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} className="h-2 w-full overflow-hidden rounded-pill bg-grey-100">
      <div className={`h-full rounded-pill ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
