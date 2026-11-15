"use client";
/**
 * Stock › Stock counts (design `UZ_MODS` inv › Stock counts): each count's store and scope, who is
 * counting, progress, differences and net value. "New stock count" → `?action=new`; a row opens
 * `?view=SC-…`. Values stay hidden while a blind count is being counted.
 */
import { hidesSystem, useCountRows, type CountRow } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { date as fmtDate } from "@/lib/format";
import { CountForm } from "./CountForm";
import { CountView } from "./CountView";
import { useOverlayParams } from "./shared";

/** "+1,200", "−980", "0" (design list value). */
const signed0 = (n: number) => `${n < 0 ? "−" : n > 0 ? "+" : ""}${Math.abs(Math.round(n)).toLocaleString("en-KE")}`;

export function CountActions() {
  const { open } = useOverlayParams();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New stock count
    </Button>
  );
}

function Progress({ r }: { r: CountRow }) {
  const pct = r.totals.lines ? (r.totals.counted / r.totals.lines) * 100 : 0;
  const done = r.totals.counted === r.totals.lines;
  return (
    <span className="inline-flex min-w-[120px] items-center gap-2">
      <span
        role="progressbar"
        aria-label={`${r.ref} counted`}
        aria-valuemin={0}
        aria-valuemax={r.totals.lines}
        aria-valuenow={r.totals.counted}
        className="h-1.5 flex-1 overflow-hidden rounded-pill bg-grey-100"
      >
        <span className={`block h-full rounded-pill ${done ? "bg-green-600" : "bg-warning"}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="type-small u-num text-text-muted">
        {r.totals.counted}/{r.totals.lines}
      </span>
    </span>
  );
}

export function CountList() {
  const rows = useCountRows();
  const { action, view, open, close } = useOverlayParams();
  const columns: DataColumn<CountRow>[] = [
    {
      key: "ref",
      title: "Count",
      text: (r) => r.ref,
      render: (r) => (
        <span className="inline-flex flex-col">
          <span className="whitespace-nowrap font-semibold text-text">{r.ref}</span>
          <span className="type-small text-text-muted">{fmtDate(r.date)}</span>
        </span>
      ),
    },
    {
      key: "store",
      title: "Store and scope",
      text: (r) => `${r.store} ${r.scope}`,
      render: (r) => (
        <span className="inline-flex flex-col">
          <span className="text-text">{r.store}</span>
          <span className="type-small text-text-muted">{r.scope}</span>
        </span>
      ),
    },
    { key: "by", title: "Counted by" },
    { key: "progress", title: "Progress", text: (r) => `${r.totals.counted} of ${r.totals.lines}`, render: (r) => <Progress r={r} /> },
    { key: "diffs", title: "Differences", numeric: true, text: (r) => (hidesSystem(r) ? "—" : String(r.totals.diffs)) },
    {
      key: "value",
      title: "Net value (KES)",
      numeric: true,
      text: (r) => (hidesSystem(r) ? "Hidden" : signed0(r.totals.value)),
      render: (r) =>
        hidesSystem(r) ? (
          <span className="text-text-muted">Hidden</span>
        ) : (
          <span className={r.totals.value < 0 ? "text-danger-text" : r.totals.value > 0 ? "text-info-text" : "text-text"}>{signed0(r.totals.value)}</span>
        ),
    },
    { key: "status", title: "Status", text: (r) => r.pill.label, render: (r) => <StatusPill tone={r.pill.tone}>{r.pill.label}</StatusPill> },
    { key: "_act", title: "", numeric: true, width: 48, text: () => "", render: (r) => <RowActions items={[{ label: "Open count", need: "read", onClick: () => open({ view: r.ref }) }]} /> },
  ];
  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} empty="No stock counts yet." noun="count" minWidth={900} />
      <CountForm open={action === "new"} onClose={close} onStarted={(ref) => open({ view: ref })} />
      {view && <CountView key={view} refId={view} onClose={close} />}
    </>
  );
}
