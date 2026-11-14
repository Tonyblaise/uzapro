"use client";
/** Stock › Stock counts (feature 017): counts with their variance. "New count" → `?action=new`; a row opens `?view=CNT-…`. */
import { signedQty, useCountRows, type CountRow } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { date as fmtDate, money } from "@/lib/format";
import { CountForm } from "./CountForm";
import { CountView } from "./CountView";
import { useOverlayParams } from "./shared";

export const signedMoney = (n: number) => (n > 0 ? `+${money(n)}` : n < 0 ? `−${money(-n)}` : money(0));

export function CountActions() {
  const { open } = useOverlayParams();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New count
    </Button>
  );
}

export function CountList() {
  const rows = useCountRows();
  const { action, view, open, close } = useOverlayParams();
  const done = (r: CountRow) => r.totals.counted === r.totals.lines;
  const columns: DataColumn<CountRow>[] = [
    { key: "ref", title: "Count", render: (r) => <span className="font-medium text-text">{r.ref}</span> },
    { key: "store", title: "Store" },
    { key: "date", title: "Date", text: (r) => fmtDate(r.date) },
    { key: "full", title: "Type", text: (r) => (r.full ? "Full" : "Partial") },
    { key: "lines", title: "Lines counted", text: (r) => `${r.totals.counted} of ${r.totals.lines}` },
    { key: "net", title: "Variance", numeric: true, text: (r) => (done(r) ? signedQty(r.totals.net) : "—") },
    { key: "value", title: "Variance value (KES)", numeric: true, text: (r) => (done(r) ? signedMoney(r.totals.value) : "—") },
    { key: "status", title: "Status", text: (r) => r.pill.label, render: (r) => <StatusPill tone={r.pill.tone}>{r.pill.label}</StatusPill> },
  ];
  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} empty="No stock counts yet." noun="count" minWidth={860} />
      <CountForm open={action === "new"} onClose={close} onStarted={(ref) => open({ view: ref })} />
      {view && <CountView key={view} refId={view} onClose={close} />}
    </>
  );
}
