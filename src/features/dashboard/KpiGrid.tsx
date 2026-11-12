import { dashboardData } from "@/data";
import { Icon } from "@/components/ui/Icon";

const ICONS = ["banknote", "receipt", "chart-column", "file-text", "users", "truck", "boxes", "circle-alert"];

/** The canvas `kpi()` split of "▲ 12.4% vs last 30 days" into "↗ 12.4%" and "vs last 30 days". */
function split(caption: string): { up: string; caption: string } {
  const m = caption.match(/^[▲▼]\s*([\d.]+)%\s*(.*)$/);
  return m ? { up: `↗ ${Math.abs(parseFloat(m[1] ?? "0"))}%`, caption: m[2] ?? "" } : { up: "", caption };
}

/** Eight KPI tiles (canvas `v.hKpis`): first three, then "Pending invoices", then the rest. */
export function KpiGrid() {
  const d = dashboardData();
  const tiles = [
    ...d.kpis.slice(0, 3).map(([label, value, cap]) => ({ label, value, ...split(cap) })),
    { label: "Pending invoices", value: String(d.pendingInvoices), up: "", caption: "awaiting payment" },
    ...d.kpis.slice(3).map(([label, value, cap]) => ({ label, value, ...split(cap) })),
  ];
  return (
    <div className="uz-kpi8">
      {tiles.map((k, i) => (
        <div key={k.label} className="min-w-0 rounded-md border border-border bg-surface p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="type-eyebrow min-w-0 text-text-muted">{k.label}</span>
            <span className={`grid size-[30px] flex-none place-items-center rounded-sm ${i === 7 ? "bg-warning-soft text-warning-text" : "bg-green-50 text-green-700"}`}>
              <Icon name={ICONS[i] ?? "circle-help"} size={16} />
            </span>
          </div>
          <div className="type-title u-num text-text">{k.value}</div>
          <div className="type-caption mt-2 text-text-muted">
            <span className="font-semibold text-green-700">{k.up}</span> {k.caption}
          </div>
        </div>
      ))}
    </div>
  );
}
