"use client";

import { useMemo, type ReactNode } from "react";
import { copyCsv, setSearch, useSearch } from "@/data";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Field";

export interface DataColumn<R> {
  key: string;
  title: string;
  numeric?: boolean;
  /** Cell renderer; defaults to `String(row[key])`. */
  render?: (row: R) => ReactNode;
  /** Plain text for search and CSV; defaults to `String(row[key])`. */
  text?: (row: R) => string;
  width?: number | string;
}

function plain<R>(c: DataColumn<R>, r: R): string {
  if (c.text) return c.text(r);
  const v = (r as Record<string, unknown>)[c.key];
  if (v && typeof v === "object" && "label" in (v as object)) return String((v as { label: unknown }).label);
  return v === undefined || v === null ? "" : String(v);
}

/** The bare table (DS DataTable): canvas-coloured sticky header, row hover, numeric columns right-aligned. */
export function Table<R>({ columns, rows, rowKey, onRowClick, empty = "Nothing to show.", minWidth = 560 }: { columns: DataColumn<R>[]; rows: R[]; rowKey: (r: R, i: number) => string; onRowClick?: (r: R) => void; empty?: string; minWidth?: number }) {
  return (
    <div className="max-h-[var(--uz-h,60vh)] overflow-auto">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={{ width: c.width }}
                className={`type-table-head sticky top-0 z-[1] whitespace-nowrap border-b border-border bg-canvas px-4 py-2.5 text-text-muted ${c.numeric ? "text-right" : "text-left"}`}
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="type-body border-b border-border p-8 text-center text-text-muted">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr
              key={rowKey(r, i)}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              onKeyDown={onRowClick ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onRowClick(r)) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={onRowClick ? "cursor-pointer hover:bg-surface-hover focus-visible:bg-surface-hover" : ""}
            >
              {columns.map((c) => (
                <td key={c.key} className={`type-body u-num border-b border-border px-4 py-3 align-middle text-text-secondary ${c.numeric ? "text-right" : "text-left"}`}>
                  {c.render ? c.render(r) : plain(c, r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A list screen as the canvas renders it: toolbar ("Search this list", optional filters,
 * Export CSV), the table in a flush card, then the count line and "Select a row to open it".
 */
export function DataTable<R>({
  columns,
  rows,
  rowKey,
  onRowClick,
  filters,
  empty = "No records match that search.",
  minWidth,
}: {
  columns: DataColumn<R>[];
  rows: R[];
  rowKey: (r: R, i: number) => string;
  onRowClick?: (r: R) => void;
  /** Extra filter controls shown after the search box (store/level/status filters). */
  filters?: ReactNode;
  empty?: string;
  /** @deprecated The count line is "Showing {shown} of {total}" (design `countText`). */
  noun?: string;
  minWidth?: number;
}) {
  const q = useSearch();
  const needle = q.trim().toLowerCase();
  const shown = useMemo(
    () => (needle ? rows.filter((r) => columns.some((c) => plain(c, r).toLowerCase().includes(needle))) : rows),
    [rows, columns, needle],
  );
  const textCols = columns.filter((c) => c.title);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="max-w-[320px] flex-[1_1_220px]">
          <Input icon="search" placeholder="Search this list" aria-label="Search this list" value={q} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filters}
        <div className="flex-1" />
        <Button
          variant="secondary"
          icon="download"
          onClick={() => copyCsv(textCols.map((c) => c.title), shown.map((r) => textCols.map((c) => plain(c, r))))}
        >
          Export CSV
        </Button>
      </div>
      <Card flush>
        <Table columns={columns} rows={shown} rowKey={rowKey} onRowClick={onRowClick} empty={empty} minWidth={minWidth} />
      </Card>
      <div className="type-caption flex flex-wrap justify-between gap-2 text-text-muted">
        <span>
          Showing {shown.length} of {rows.length}
        </span>
        {onRowClick && <span>Select a row to open it</span>}
      </div>
    </div>
  );
}
