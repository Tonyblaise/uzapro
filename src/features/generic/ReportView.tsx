"use client";
/**
 * The design's report view (`isRepView`, v1794780681-ee67): a full-screen dialog over the cards
 * with Close, title and dates, a date range picker (shadcn; picking dates makes a custom range), Export
 * CSV, KPI tiles, charts and the Analysis panel (design `repCharts`), the table with a bold total row, an empty state and a note.
 */
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  REPORT_DEFAULT_EMPTY,
  REPORT_DEFAULT_NOTE,
  copyText,
  formatCell,
  periodSlug,
  reportCharts,
  reportCsv,
  reportRange,
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
import { DateRangePicker } from "@/components/ui/DatePicker";
import { IconButton } from "@/components/ui/IconButton";
import { useDialog } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { ReportCharts } from "./ReportCharts";

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

function cellView(
  cell: ReportCell | undefined,
  col: ReportColumn,
  total: boolean,
) {
  if (cell === undefined) return null;
  if (typeof cell === "object" && cell.tone)
    return <StatusPill tone={cell.tone}>{cell.text}</StatusPill>;
  const bold = total || (typeof cell === "object" && cell.bold);
  const text = formatCell(cell, col);
  return (
    <span className={bold ? "font-semibold text-text" : undefined}>{text}</span>
  );
}

/** Report URL: `?report=…&period=…`, plus `from`/`to` for a custom range. */
export function reportQuery(
  name: string,
  period: ReportPeriod,
  from?: string,
  to?: string,
): string {
  const q: Record<string, string> = {
    report: reportSlug(name),
    period: periodSlug(period),
  };
  if (period === "Custom range" && from && to) Object.assign(q, { from, to });
  return new URLSearchParams(q).toString();
}

export function ReportView({
  name,
  period,
  from,
  to,
}: {
  name: string;
  period: ReportPeriod;
  from?: string;
  to?: string;
}) {
  const r = useReport(name, period, from, to);
  const charts = useMemo(
    () => reportCharts(name, r, period),
    [name, r, period],
  );
  const router = useRouter();
  const pathname = usePathname();
  const close = () => router.replace(pathname, { scroll: false });
  const panel = useDialog(true, close);
  const range = reportRange(period, from, to);

  const columns: DataColumn<Row>[] = r.cols.map((c, i) => ({
    key: String(i),
    title: c.t,
    numeric: !!(c.num || c.pct),
    render: (row) => cellView(row.cells[i], c, row.total),
  }));
  const rows: Row[] = [
    ...r.rows.map((cells) => ({ cells, total: false })),
    ...(r.total ? [{ cells: r.total, total: true }] : []),
  ];

  /** Picking dates makes it a custom range (design `onFrom` / `onTo`). */
  const setDates = (a: string, b: string) => {
    if (!a || !b) return;
    setReportPeriod("Custom range", a, b);
    router.replace(`${pathname}?${reportQuery(name, "Custom range", a, b)}`, {
      scroll: false,
    });
  };
  const exportCsv = () => {
    void copyText(reportCsv(r), `Copied ${r.title} as CSV.`);
  };

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={r.title}
      className="fixed inset-0 z-[var(--z-drawer)] flex flex-col bg-canvas"
      data-report-view
    >
      <div className="flex flex-none flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
        <IconButton
          icon="x"
          size="sm"
          label="Close report"
          onClick={close}
          data-close
        />
        <div className="min-w-[200px] flex-1">
          <h2 className="type-title m-0 text-[18px] text-text">{r.title}</h2>
          <div className="type-small text-text-muted">{r.sub}</div>
        </div>
        {!r.asAt && (
          <DateRangePicker
            label="Report dates"
            from={range.start}
            to={range.end}
            onChange={setDates}
          />
        )}
        <Button variant="secondary" icon="download" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4">
          {r.kpis.length > 0 && (
            <ul
              aria-label="Key figures"
              className="m-0 grid list-none gap-3 p-0"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(190px, 100%), 1fr))",
              }}
            >
              {r.kpis.map((k) => (
                <li
                  key={k.label}
                  className="rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <div className="type-eyebrow text-text-muted">{k.label}</div>
                  <div
                    className={`type-title u-num mt-1 text-[20px] ${k.tone ? TONE[k.tone] : "text-text"}`}
                  >
                    {k.value}
                  </div>
                  {k.note && (
                    <div className="type-small mt-0.5 text-text-secondary">
                      {k.note}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <ReportCharts ch={charts} />

          {r.rows.length > 0 ? (
            <Card flush>
              <Table
                columns={columns}
                rows={rows}
                rowKey={(_, i) => String(i)}
                minWidth={Math.max(480, 140 * r.cols.length)}
                scrollLabel={`${r.title} table`}
              />
            </Card>
          ) : (
            <div className="type-body rounded-lg border-[1.5px] border-dashed border-border-strong p-6 text-center text-text-secondary">
              {r.empty ?? REPORT_DEFAULT_EMPTY}
            </div>
          )}

          <div className="type-small text-text-muted">
            {r.note ?? REPORT_DEFAULT_NOTE}
          </div>
        </div>
      </div>
    </div>
  );
}
