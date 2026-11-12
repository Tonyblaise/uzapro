"use client";
/**
 * Helpers shared by the Receivables and Payables screens (exported for Payables through the
 * Receivables index): URL-driven overlays, the design's list cells, the `hasRcvFilters` panel,
 * the `hasExpKpis` tiles and the generic `record` drawer.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { Pill, Priority, Side } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { date as fmtDate, num } from "@/lib/format";

/** Module names, used as the drawer subtitle (design `drawerCrumb: m.n`). */
export const CRUMB: Record<Side, string> = { rcv: "Receivables", pay: "Payables" };

/** The design's list amounts: `Math.round(x).toLocaleString('en-KE')`. */
export const fmt = (n: number) => num(n);

/** The design's `docDate`: "27 Feb 2026" from an ISO date. */
export const docDate = (iso: string) => (iso ? fmtDate(iso) : "");

/** Overlay state lives in the URL (contracts/routes.md): `?action=pay|bulk|plan|credit`, `?view=<ref>`. */
export function useMoneyOverlay() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback(
    (next: Record<string, string | undefined>) => {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) if (v !== undefined && v !== "") q.set(k, v);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { params, open, close };
}

/** Priority pill (design: High danger, Low neutral, otherwise Normal info). */
export function priorityPill(p: Priority): Pill {
  return p === "High" ? { label: "High", tone: "danger" } : p === "Low" ? { label: "Low", tone: "neutral" } : { label: "Normal", tone: "info" };
}

/** `{ main, note }` cell. */
export function MainNote({ main, note }: { main: ReactNode; note?: ReactNode }) {
  return (
    <span className="inline-flex flex-col">
      <span className="text-text">{main}</span>
      {note ? <span className="type-caption text-text-muted">{note}</span> : null}
    </span>
  );
}

/**
 * A list column. `text` is the plain value (search, CSV, filters: the design's `plain`), `pill`
 * marks a status cell, `note` adds the `{ main, note }` caption and `record` is the record drawer
 * text (design: "main (note)").
 */
export interface MoneyCol<R> {
  key: string;
  title: string;
  numeric?: boolean;
  text: (r: R) => string;
  pill?: (r: R) => Pill;
  note?: (r: R) => string;
}

export interface MoneyFilter<R> {
  label: string;
  all: string;
  value: (r: R) => string;
}

export function col<R>(key: string, title: string, text: (r: R) => string, extra: Partial<MoneyCol<R>> = {}): MoneyCol<R> {
  return { key, title, text, ...extra };
}

export function pillCol<R>(key: string, title: string, pill: (r: R) => Pill): MoneyCol<R> {
  return { key, title, text: (r) => pill(r).label, pill };
}

function recordText<R>(c: MoneyCol<R>, r: R): string {
  const main = c.text(r);
  const note = c.note?.(r);
  return note ? `${main} (${note})` : main || "—";
}

/** The design's `hasRcvFilters` panel: one picker per filter and "Reset". */
function FilterPanel<R>({ defs, rows, values, onChange, onReset }: { defs: MoneyFilter<R>[]; rows: R[]; values: Record<string, string>; onChange: (label: string, v: string) => void; onReset: () => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4">
      {defs.map((f) => {
        const options = [f.all, ...Array.from(new Set(rows.map(f.value)))];
        return (
          <div key={f.label} className="min-w-0 flex-[1_1_200px]">
            <SearchSelect label={f.label} options={options} value={values[f.label] || f.all} onChange={(v) => onChange(f.label, v === f.all ? "" : v)} />
          </div>
        );
      })}
      <Button variant="ghost" icon="refresh-cw" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}

/**
 * A Receivables/Payables list as the design draws it: optional filter panel, the toolbar and
 * table, row actions, and the generic record drawer for `?view=<key>` (design `openRaw` → `record`).
 */
export function MoneyTable<R>({
  side,
  columns,
  rows,
  rowKey,
  actions,
  filters = [],
  minWidth,
}: {
  side: Side;
  columns: MoneyCol<R>[];
  rows: R[];
  rowKey: (r: R) => string;
  actions?: (r: R) => MenuItem[];
  filters?: MoneyFilter<R>[];
  minWidth?: number;
}) {
  const { params, open, close } = useMoneyOverlay();
  const [values, setValues] = useState<Record<string, string>>({});
  const shown = useMemo(() => rows.filter((r) => filters.every((f) => !values[f.label] || f.value(r) === values[f.label])), [rows, filters, values]);

  const dataCols: DataColumn<R>[] = columns.map((c) => ({
    key: c.key,
    title: c.title,
    numeric: c.numeric,
    text: c.text,
    render: c.pill
      ? (r: R) => {
          const p = c.pill!(r);
          return <StatusPill tone={p.tone}>{p.label}</StatusPill>;
        }
      : c.note
        ? (r: R) => <MainNote main={c.text(r)} note={c.note!(r)} />
        : undefined,
  }));
  if (actions) dataCols.push({ key: "_act", title: "", numeric: true, width: 48, text: () => "", render: (r) => <RowActions items={actions(r)} /> });

  const view = params.get("view");
  const current = view ? rows.find((r) => rowKey(r) === view) : undefined;

  return (
    <>
      {filters.length > 0 && (
        <FilterPanel defs={filters} rows={rows} values={values} onChange={(label, v) => setValues((s) => ({ ...s, [label]: v }))} onReset={() => setValues({})} />
      )}
      <DataTable columns={dataCols} rows={shown} rowKey={(r) => rowKey(r)} onRowClick={(r) => open({ view: rowKey(r) })} minWidth={minWidth} />
      {current && <RecordDrawer side={side} columns={columns} row={current} onClose={close} />}
    </>
  );
}

/**
 * The design's generic record drawer (`isRecord`): the first status pill in the row, "Overview"
 * with one line per column, and the Edit / Duplicate / Print buttons (no actions in the design).
 */
export function RecordDrawer<R>({ side, columns, row, onClose }: { side: Side; columns: MoneyCol<R>[]; row: R; onClose: () => void }) {
  const first = columns[0];
  const status = columns.find((c) => c.pill)?.pill?.(row);
  return (
    <Drawer open title={first ? first.text(row) : ""} subtitle={CRUMB[side]} onClose={onClose} width={440}>
      <div className="flex flex-col gap-5">
        {status && (
          <div>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>
        )}
        <div>
          <div className="type-card-title mb-2 text-text">Overview</div>
          {columns.map((c) => {
            const p = c.pill?.(row);
            return (
              <div key={c.key} className="flex items-center justify-between gap-4 border-t border-border py-3">
                <span className="type-eyebrow flex-none text-text-muted">{c.title}</span>
                {p ? <StatusPill tone={p.tone}>{p.label}</StatusPill> : <span className="type-label u-num text-right text-text">{recordText(c, row)}</span>}
              </div>
            );
          })}
        </div>
        {/* The design's generic record drawer shows these buttons without actions. */}
        <div className="flex flex-wrap gap-2">
          <Button icon="pencil">Edit</Button>
          <Button variant="secondary">Duplicate</Button>
          <Button variant="secondary" icon="printer">
            Print
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export interface Kpi {
  label: string;
  value: string;
  note: string;
  color: string;
}

/** The design's `hasExpKpis` tiles: coloured eyebrow, value, caption. */
export function KpiStrip({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
      {kpis.map((k) => (
        <div key={k.label} className="rounded-lg border border-border bg-surface px-4 py-3">
          <div className={`type-eyebrow ${k.color}`}>{k.label}</div>
          <div className="type-title u-num mt-0.5 text-text">{k.value}</div>
          <div className="type-caption text-text-muted">{k.note}</div>
        </div>
      ))}
    </div>
  );
}

/** Page body stack used by every list (`gap: var(--space-3)`). */
export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

/** Notes / reason textarea as the design draws it (label + plain textarea). */
export function TextArea({ id, label, rows, placeholder, value, onChange }: { id: string; label: string; rows: number; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="type-label text-text">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="type-body w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2 text-text outline-none focus:border-action focus:shadow-[0_0_0_3px_var(--green-100)]"
      />
    </div>
  );
}
