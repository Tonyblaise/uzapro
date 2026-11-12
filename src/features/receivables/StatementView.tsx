"use client";
/**
 * Receivables › Receivables statement (design `hasRcvStmt` with `rs`) and the shared aged table
 * used by Payables › Supplier ageing: per party, Open, Not yet due, 1–30, 31–60, 61–90,
 * Over 90 days and the total, as of 10 Nov 2026.
 */
import { useMemo, useState } from "react";
import { generateStatement, useAgeing, useReceivables, useStatementFilter, type AgeingRow, type Side } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { MoneyTable, Stack, col, docDate, fmt, useMoneyOverlay, type MoneyCol } from "./shared";

const dash = (n: number) => (n ? fmt(n) : "—");

/** The aged table (design: sorted by total, empty buckets show "—"). */
export function AgeingTable({ side }: { side: Side }) {
  const rows = useAgeing(side);
  const { open } = useMoneyOverlay();
  const sorted = useMemo(() => [...rows].sort((a, b) => b.total - a.total), [rows]);
  const rcv = side === "rcv";
  const columns: MoneyCol<AgeingRow>[] = [
    col("party", rcv ? "Customer" : "Supplier", (r) => r.party),
    col("open", "Open", (r) => String(r.open), { numeric: true }),
    col("notDue", "Not yet due", (r) => dash(r.notDue), { numeric: true }),
    col("d30", "1–30 days", (r) => dash(r.d30), { numeric: true }),
    col("d60", "31–60 days", (r) => dash(r.d60), { numeric: true }),
    col("d90", "61–90 days", (r) => dash(r.d90), { numeric: true }),
    col("over90", "Over 90 days", (r) => dash(r.over90), { numeric: true }),
    col("total", rcv ? "Total due (KES)" : "Total owed (KES)", (r) => fmt(r.total), { numeric: true }),
  ];
  return (
    <MoneyTable side={side} columns={columns} rows={sorted} rowKey={(r) => r.party} minWidth={900} actions={(r) => [{ label: "View", onClick: () => open({ view: r.party }) }]} />
  );
}

export function StatementView() {
  const applied = useStatementFilter();
  const receivables = useReceivables();
  const [draft, setDraft] = useState(applied);
  const customers = useMemo(() => ["All customers", ...Array.from(new Set(receivables.map((r) => r.party)))], [receivables]);
  const set = (k: keyof typeof draft) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const note = `Showing receivables raised ${applied.from ? `from ${docDate(applied.from)} ` : ""}${applied.to ? `to ${docDate(applied.to)}` : ""}${
    applied.customer !== "All customers" ? ` for ${applied.customer}` : ""
  }. Empty means nothing is outstanding for this period.`;
  return (
    <Stack>
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-5 py-4">
        <div>
          <h2 className="type-title m-0 text-text">Receivables statement</h2>
          <div className="type-small text-text-secondary">Unpaid balances by customer, aged as of today (10 Nov 2026).</div>
        </div>
        <div className="grid items-end gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
          <Input label="From" type="date" value={draft.from} onChange={(e) => set("from")(e.target.value)} />
          <Input label="To" type="date" value={draft.to} onChange={(e) => set("to")(e.target.value)} />
          <SearchSelect label="Customers" options={customers} value={draft.customer} onChange={set("customer")} />
          <Button icon="file-text" onClick={() => void generateStatement(draft)}>
            Generate statement
          </Button>
        </div>
        <div className="type-small text-text-muted">{note}</div>
      </section>
      <AgeingTable side="rcv" />
    </Stack>
  );
}
