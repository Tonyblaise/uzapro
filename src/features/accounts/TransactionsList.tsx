"use client";
/**
 * Transactions tab: every ledger line, newest first (Date, Account, Reference, Description with
 * the kind as a note, signed Amount), with the design's `hasAccFilter` account picker and From/To
 * dates. A row opens the matching deposit, withdrawal or transfer record (design `openRaw`);
 * expense, invoice, credit note and payment lines open their record in the owning module by URL;
 * any other line opens the generic record drawer.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccountNames, useDeposits, useLedger, useMoneyTransfers, useWithdrawals, type LedgerEntry } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Field";
import { RowActions } from "@/components/ui/Menu";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { FinOverlays } from "./FinOverlays";
import { MainNote, RecordDrawer, SignedAmount, Stack, docDate, signed, useFinOverlay } from "./shared";

interface Row {
  i: number;
  e: LedgerEntry;
}

export function TransactionsList() {
  const [account, setAccount] = useState("All accounts");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const names = useAccountNames();
  const all = useLedger();
  const shown = useLedger({ account, from, to });
  const deposits = useDeposits();
  const withdrawals = useWithdrawals();
  const transfers = useMoneyTransfers();
  const { params, open, close } = useFinOverlay();
  const router = useRouter();

  const rows: Row[] = shown.map((e) => ({ i: all.indexOf(e), e }));

  const openRow = ({ i, e }: Row) => {
    const ref = e.ref;
    const has = (/^DEP-/.test(ref) && deposits.some((d) => d.ref === ref)) || (/^WDL-/.test(ref) && withdrawals.some((w) => w.ref === ref)) || (/^TRN-/.test(ref) && transfers.some((t) => t.ref === ref));
    if (has) return open({ view: ref });
    const q = `?view=${encodeURIComponent(ref)}`;
    const elsewhere = /^EXP-/.test(ref)
      ? `/expenses/expenses${q}`
      : /^INV-/.test(ref)
        ? `/sales/invoices${q}`
        : /^CRN-/.test(ref)
          ? `/sales/refunds-credit-notes${q}`
          : e.kind === "Customer payment"
            ? `/receivables/payments${q}`
            : e.kind === "Supplier payment"
              ? `/payables/payments${q}`
              : "";
    if (elsewhere) router.push(elsewhere);
    else open({ record: String(i) });
  };

  const columns: DataColumn<Row>[] = [
    { key: "date", title: "Date", text: (r) => docDate(r.e.date) },
    { key: "account", title: "Account", text: (r) => r.e.account },
    { key: "ref", title: "Reference", text: (r) => r.e.ref },
    { key: "desc", title: "Description", text: (r) => `${r.e.desc} ${r.e.kind}`, render: (r) => <MainNote main={r.e.desc} note={r.e.kind} /> },
    { key: "amt", title: "Amount (KES)", numeric: true, text: (r) => signed(r.e.amt), render: (r) => <SignedAmount amt={r.e.amt} /> },
    { key: "_act", title: "", numeric: true, width: 48, text: () => "", render: (r) => <RowActions items={[{ label: "View", onClick: () => openRow(r) }]} /> },
  ];

  const recIdx = params.get("record");
  const rec = recIdx !== null ? all[Number(recIdx)] : undefined;

  return (
    <Stack>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => String(r.i)}
        onRowClick={openRow}
        minWidth={760}
        filters={
          <>
            <div className="min-w-[170px] flex-[0_1_220px]">
              <SearchSelect noun="Account" options={["All accounts", ...names]} value={account} onChange={setAccount} />
            </div>
            <div className="flex-[0_1_150px]">
              <Input type="date" aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex-[0_1_150px]">
              <Input type="date" aria-label="To date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </>
        }
      />
      {rec && (
        <RecordDrawer
          title={docDate(rec.date)}
          onClose={close}
          fields={[
            { label: "Date", text: docDate(rec.date) },
            { label: "Account", text: rec.account },
            { label: "Reference", text: rec.ref },
            { label: "Description", text: rec.desc },
            { label: "Type", text: rec.kind || "—" },
            { label: "Amount", text: signed(rec.amt) },
          ]}
        />
      )}
      <FinOverlays />
    </Stack>
  );
}
