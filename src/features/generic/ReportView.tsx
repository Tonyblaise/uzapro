"use client";
/**
 * The design's report view (`isRepView`, design lines 870–892): back, title and dates, period
 * picker, Export CSV, KPI tiles, the table with a bold total row, an empty state and a note.
 */
import { usePathname, useRouter } from "next/navigation";
import {
  REPORT_DEFAULT_EMPTY,
  REPORT_DEFAULT_NOTE,
  REPORT_PERIOD_NAMES,
  copyText,
  formatCell,
  periodSlug,
  reportCsv,
  reportSlug,
  setReportPeriod,
  useReport,
  type ReportCell,
  type ReportColumn,
  type ReportPeriod,
  type ReportTone,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, type DataColumn } from "@/components/ui/DataTable";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";

const TONE: Record<ReportTone, string> = {
  green: "text-green-700",
  danger: "text-danger-text",
  info: "text-info-text",
  warning: "text-warning-text",
};

interface Row {
  cells: ReportCell[];
  total: boolean;
}

function cellView(cell: ReportCell | undefined, col: ReportColumn, total: boolean) {
  if (cell === undefined) return null;
  if (typeof cell === "object" && cell.tone) return <StatusPill tone={cell.tone}>{cell.text}</StatusPill>;
  const bold = total || (typeof cell === "object" && cell.bold);
  const text = formatCell(cell, col);
  return <span className={bold ? "font-semibold text-text" : undefined}>{text}</span>;
}

export function ReportView({ name, period }: { name: string; period: ReportPeriod }) {
  const r = useReport(name, period);
  const router = useRouter();
  const pathname = usePathname();

  const columns: DataColumn<Row>[] = r.cols.map((c, i) => ({
    key: String(i),
    title: c.t,
    numeric: !!(c.num || c.pct),
    render: (row) => cellView(row.cells[i], c, row.total),
  }));
  const rows: Row[] = [...r.rows.map((cells) => ({ cells, total: false })), ...(r.total ? [{ cells: r.total, total: true }] : [])];

  const changePeriod = (p: string) => {
    setReportPeriod(p as ReportPeriod);
    router.replace(`${pathname}?${new URLSearchParams({ report: reportSlug(name), period: periodSlug(p as ReportPeriod) })}`, { scroll: false });
  };
  const exportCsv = () => {
    void copyText(reportCsv(r), `Copied ${r.title} as CSV.`);
  };

  return (
    <div className="flex flex-col gap-4" data-report-view>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" icon="chevron-left" onClick={() => router.replace(pathname, { scroll: false })}>
          All reports
        </Button>
        <div className="min-w-[200px] flex-1">
          <h2 className="type-card-title m-0 text-text">{r.title}</h2>
          <div className="type-small text-text-muted">{r.sub}</div>
        </div>
        {!r.asAt && (
          <div className="min-w-[160px] flex-[0_1_200px]">
            <SearchSelect ariaLabel="Period" options={REPORT_PERIOD_NAMES} value={period} onChange={changePeriod} />
          </div>
        )}
        <Button variant="secondary" icon="download" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {r.kpis.length > 0 && (
        <ul aria-label="Key figures" className="m-0 grid list-none gap-3 p-0" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(190px, 100%), 1fr))" }}>
          {r.kpis.map((k) => (
            <li key={k.label} className="rounded-lg border border-border bg-surface px-4 py-3">
              <div className="type-eyebrow text-text-muted">{k.label}</div>
              <div className={`type-title u-num mt-1 text-[20px] ${k.tone ? TONE[k.tone] : "text-text"}`}>{k.value}</div>
              {k.note && <div className="type-small mt-0.5 text-text-secondary">{k.note}</div>}
            </li>
          ))}
        </ul>
      )}

      {r.rows.length > 0 ? (
        <Card flush>
          <Table columns={columns} rows={rows} rowKey={(_, i) => String(i)} minWidth={Math.max(480, 140 * r.cols.length)} scrollLabel={`${r.title} table`} />
        </Card>
      ) : (
        <div className="type-body rounded-lg border-[1.5px] border-dashed border-border-strong p-6 text-center text-text-secondary">{r.empty ?? REPORT_DEFAULT_EMPTY}</div>
      )}

      <div className="type-small text-text-muted">{r.note ?? REPORT_DEFAULT_NOTE}</div>
    </div>
  );
}
