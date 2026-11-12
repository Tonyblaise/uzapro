"use client";
/**
 * Deposits, Withdrawals and Transfers tabs: the design's tables (columns from `UZ_MODS › fin`),
 * live rows, the row action "View" and row click opening the record view (`?view=<ref>`).
 */
import { useDeposits, useMoneyTransfers, useWithdrawals, type Deposit, type MoneyTransfer, type Pill, type Withdrawal } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { FinOverlays } from "./FinOverlays";
import { Stack, docDate, fmt, useFinOverlay } from "./shared";

interface Ref {
  ref: string;
}

function col<R>(key: string, title: string, text: (r: R) => string, numeric = false): DataColumn<R> {
  return { key, title, text, numeric };
}

function pill<R>(key: string, title: string, get: (r: R) => Pill): DataColumn<R> {
  return {
    key,
    title,
    text: (r) => get(r).label,
    render: (r) => {
      const p = get(r);
      return <StatusPill tone={p.tone}>{p.label}</StatusPill>;
    },
  };
}

function MoveTable<R extends Ref>({ columns, rows, minWidth }: { columns: DataColumn<R>[]; rows: R[]; minWidth?: number }) {
  const { open } = useFinOverlay();
  const cols: DataColumn<R>[] = [
    ...columns,
    { key: "_act", title: "", numeric: true, width: 48, text: () => "", render: (r) => <RowActions items={[{ label: "View", onClick: () => open({ view: r.ref }) }]} /> },
  ];
  return (
    <Stack>
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} minWidth={minWidth} />
      <FinOverlays />
    </Stack>
  );
}

export function DepositList() {
  const rows = useDeposits();
  return (
    <MoveTable
      rows={rows}
      minWidth={860}
      columns={[
        col<Deposit>("ref", "Ref", (d) => d.ref),
        col<Deposit>("date", "Date", (d) => docDate(d.date)),
        col<Deposit>("account", "Account", (d) => d.account),
        col<Deposit>("method", "Method", (d) => d.method),
        col<Deposit>("description", "Description", (d) => d.description),
        col<Deposit>("amount", "Amount (KES)", (d) => fmt(d.amount), true),
        pill<Deposit>("status", "Status", (d) => d.status),
      ]}
    />
  );
}

export function WithdrawalList() {
  const rows = useWithdrawals();
  return (
    <MoveTable
      rows={rows}
      minWidth={960}
      columns={[
        col<Withdrawal>("ref", "Ref", (w) => w.ref),
        col<Withdrawal>("date", "Date", (w) => docDate(w.date)),
        col<Withdrawal>("account", "Account", (w) => w.account),
        col<Withdrawal>("method", "Method", (w) => w.method),
        col<Withdrawal>("purpose", "Purpose", (w) => w.purpose),
        col<Withdrawal>("description", "Description", (w) => w.description),
        col<Withdrawal>("amount", "Amount (KES)", (w) => fmt(w.amount), true),
        pill<Withdrawal>("status", "Status", (w) => w.status),
      ]}
    />
  );
}

export function TransferList() {
  const rows = useMoneyTransfers();
  return (
    <MoveTable
      rows={rows}
      minWidth={860}
      columns={[
        col<MoneyTransfer>("ref", "Ref", (t) => t.ref),
        col<MoneyTransfer>("date", "Date", (t) => docDate(t.date)),
        col<MoneyTransfer>("from", "From", (t) => t.from),
        col<MoneyTransfer>("to", "To", (t) => t.to),
        col<MoneyTransfer>("description", "Description", (t) => t.description),
        col<MoneyTransfer>("amount", "Amount (KES)", (t) => fmt(t.amount), true),
        pill<MoneyTransfer>("status", "Status", (t) => t.status),
      ]}
    />
  );
}
