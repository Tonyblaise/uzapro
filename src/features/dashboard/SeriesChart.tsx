import { Legend } from "@/components/charts/Charts";

export interface Series {
  readonly l: readonly string[];
  readonly a: readonly number[];
  readonly b: readonly number[];
  readonly max: number;
  readonly aName: string;
  readonly bName: string;
}

export type ChartMode = "Bars" | "Lines" | "Area";

/** Y ticks from max down to 0: "KES 5M" … "0" (canvas `series()`). */
function ticks(max: number): string[] {
  const out: string[] = [];
  for (let n = max; n >= 0; n--) out.push(n ? `KES ${n}M` : "0");
  return out;
}

/**
 * The home dashboard's two-series chart, as the canvas draws it: a 200px plot with KES ticks on
 * the left, grouped bars (Bars) or an SVG polyline pair (Lines; Area adds a fill under series A),
 * month labels below and a centred legend.
 */
export function SeriesChart({ data, mode = "Bars", label }: { data: Series; mode?: ChartMode; label: string }) {
  const t = ticks(data.max);
  const pts = (arr: readonly number[]) => arr.map((x, i) => `${(i / (arr.length - 1)) * 100},${100 - (x / data.max) * 100}`).join(" ");
  const lineA = pts(data.a);
  return (
    <>
      <div className="flex gap-3 pt-2">
        <div aria-hidden="true" className="type-caption -my-2 flex h-[216px] flex-col justify-between whitespace-nowrap text-right text-text-muted">
          {t.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-[200px] border-b border-border">
            <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between">
              {t.map((x) => (
                <span key={x} className="h-px bg-border" />
              ))}
            </div>
            {mode === "Bars" ? (
              <div role="img" aria-label={label} className="absolute inset-0 flex gap-4">
                {data.l.map((m, i) => {
                  const a = data.a[i] ?? 0;
                  const b = data.b[i] ?? 0;
                  return (
                    <div key={m} className="flex min-w-0 flex-1 items-end justify-center gap-[3px]">
                      <div title={`${m} ${data.aName}: KES ${a}M`} className="max-w-[22px] flex-1 rounded-t-[3px] bg-green-500" style={{ height: `${(a / data.max) * 100}%` }} />
                      <div title={`${m} ${data.bName}: KES ${b}M`} className="max-w-[22px] flex-1 rounded-t-[3px] bg-green-200" style={{ height: `${(b / data.max) * 100}%` }} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={label} className="absolute inset-0 block size-full overflow-visible">
                <polygon points={`0,100 ${lineA} 100,100`} fill={mode === "Area" ? "var(--green-50)" : "none"} />
                <polyline points={pts(data.b)} fill="none" stroke="var(--green-200)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
                <polyline points={lineA} fill="none" stroke="var(--green-500)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
              </svg>
            )}
          </div>
          {mode === "Bars" ? (
            <div className="mt-2 flex gap-4">
              {data.l.map((m) => (
                <span key={m} className="type-caption min-w-0 flex-1 text-center text-text-muted">
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <div className="type-caption mt-2 flex justify-between text-text-muted">
              {data.l.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <Legend
          items={[
            { name: data.aName, color: "var(--green-500)" },
            { name: data.bName, color: "var(--green-200)" },
          ]}
        />
      </div>
    </>
  );
}
