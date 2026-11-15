import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/**
 * Parse the design's KPI caption ("▲ 12.4% vs last 30 days") into a delta and caption,
 * as the canvas `kpi()` helper does.
 */
export function parseKpiCaption(caption: string): { delta?: number; text: string } {
  const m = caption.match(/^([▲▼])\s*([\d.]+)%\s*(.*)$/);
  if (!m) return { text: caption };
  return { delta: (m[1] === "▼" ? -1 : 1) * Number(m[2]), text: m[3] ?? "" };
}

/** Delta: arrow + value; colour says whether the change is good for the business. */
export function Delta({ value, good = "up" }: { value: number; good?: "up" | "down" }) {
  const up = value >= 0;
  const positive = (up && good === "up") || (!up && good === "down");
  const color = value === 0 ? "text-text-muted" : positive ? "text-success-text" : "text-danger-text";
  return (
    <span className={`type-caption u-num whitespace-nowrap font-semibold ${color}`}>
      {value === 0 ? "→" : up ? "↗" : "↘"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function KpiCard({
  label,
  value,
  caption,
  icon,
  chip = "bg-green-50 text-green-700",
}: {
  label: string;
  value: ReactNode;
  caption?: string;
  icon?: IconName;
  chip?: string;
}) {
  const parsed = caption ? parseKpiCaption(caption) : null;
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-md bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="type-eyebrow text-text-muted">{label}</span>
        {icon && (
          <span className={`grid size-7 place-items-center rounded-sm ${chip}`}>
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      <div className="type-kpi text-text">{value}</div>
      {parsed && (
        <div className="flex items-center gap-1.5">
          {parsed.delta !== undefined && <Delta value={parsed.delta} />}
          <span className="type-caption text-text-muted">{parsed.text}</span>
        </div>
      )}
    </div>
  );
}
