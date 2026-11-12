"use client";
/** Sales › Quotations, Invoices, Refunds (credit notes) and Voided items, with their overlays. */
import { useCallback, useState } from "react";
import {
  approveCreditNote,
  approveDocument,
  deleteDocument,
  downloadPdf,
  useCreditNotes,
  useInvoices,
  useQuotations,
  useRole,
  useVoids,
  type CreditNote,
  type Invoice,
  type Quotation,
  type VoidRecord,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { DocumentForm, type DocKind } from "./DocumentForm";
import { RecordView } from "./RecordView";
import { VoidForm } from "./VoidForm";
import { Lead, amount, docDate, useOverlay, useStatusFilter } from "./shared";

const pillCol = <R,>(get: (r: R) => { label: string; tone: string }): DataColumn<R> => ({
  key: "status",
  title: "Status",
  render: (r) => <StatusPill tone={get(r).tone}>{get(r).label}</StatusPill>,
  text: (r) => get(r).label,
});

function actionsCol<R>(items: (r: R) => MenuItem[], iconOnly = false): DataColumn<R> {
  const ICON: Record<string, string> = { View: "eye", Edit: "pencil", Approve: "circle-check", "Download PDF": "download", Delete: "trash-2", "Void sale": "circle-alert" };
  return {
    key: "_act",
    title: "",
    numeric: true,
    text: () => "",
    render: (r) =>
      iconOnly ? (
        <span className="inline-flex gap-0.5" onClick={(e) => e.stopPropagation()}>
          {items(r).map((it) => (
            <IconButton key={it.label} icon={ICON[it.label] ?? "ellipsis"} label={it.label} size="sm" disabled={it.disabled} onClick={it.onClick} />
          ))}
        </span>
      ) : (
        <RowActions items={items(r)} />
      ),
  };
}

/** Header buttons (design `headerActions` for each Sales tab). */
function HeaderButton({ label, action }: { label: string; action: string }) {
  const { open } = useOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action })}>
      {label}
    </Button>
  );
}
export const NewQuotationAction = () => <HeaderButton label="New quotation" action="quote" />;
export const NewInvoiceAction = () => <HeaderButton label="New invoice" action="invoice" />;
export const NewCreditNoteAction = () => <HeaderButton label="New credit note" action="credit" />;

/** Delete confirmation (design `rowConfirm`). */
function useDelete(kind: "quote" | "invoice" | "credit") {
  const [target, setTarget] = useState<string | null>(null);
  const dialog = (
    <ConfirmDialog
      open={target !== null}
      title={`Delete ${target ?? ""}?`}
      message="This permanently deletes this record."
      confirmLabel="Delete"
      onClose={() => setTarget(null)}
      onConfirm={() => {
        if (target) void deleteDocument(kind, target);
        setTarget(null);
      }}
    />
  );
  return { ask: setTarget, dialog };
}

/** Overlays shared by Quotations and Invoices: new, view, edit, convert, void. */
function DocOverlays({ kind, docs }: { kind: "quote" | "invoice"; docs: Quotation[] }) {
  const { params, open, close } = useOverlay();
  const action = params.get("action");
  const view = params.get("view");
  const edit = params.get("edit");
  const convert = params.get("convert");
  const step = params.get("step");
  const editing = edit ? docs.find((d) => d.number === edit) : undefined;
  const converting = convert ? docs.find((d) => d.number === convert) : undefined;
  return (
    <>
      {action === kind && <DocumentForm kind={kind} onClose={close} />}
      {editing && <DocumentForm key={editing.number} kind={kind} edit={editing} onClose={close} />}
      {converting && <DocumentForm key={`c-${converting.number}`} kind="invoice" from={converting} convertFrom={converting.number} onClose={close} />}
      {view && !step && (
        <RecordView
          kind={kind}
          refId={view}
          onClose={close}
          onEdit={(d) => open({ edit: d.number })}
          onConvert={(d) => open({ convert: d.number })}
          onVoid={(d) => open({ view: d.number, step: "void" })}
        />
      )}
      {view && step === "void" && (
        <VoidForm
          refId={view}
          label={`${view} to ${docs.find((d) => d.number === view)?.customer ?? ""}`}
          amount={amount(docs.find((d) => d.number === view)?.amount ?? 0)}
          onClose={close}
          onDone={close}
        />
      )}
    </>
  );
}

function docActions(kind: "quote" | "invoice" | "credit", canVoid: boolean, owner: boolean, open: (p: Record<string, string>) => void, del: (n: string) => void) {
  return (d: { number: string; customer: string; amount: number; status: { label: string } }): MenuItem[] => {
    const quote = kind === "quote";
    const locked = quote && d.status.label === "Approved";
    const list: MenuItem[] = [{ label: "View", onClick: () => open({ view: d.number }) }];
    if (kind !== "credit") list.push({ label: "Edit", disabled: locked, onClick: () => open({ edit: d.number }) });
    if (!["Approved", "Paid"].includes(d.status.label))
      list.push({ label: "Approve", onClick: () => void (kind === "credit" ? approveCreditNote(d.number) : approveDocument(kind, d.number)) });
    list.push({ label: "Download PDF", onClick: () => void downloadPdf(d.number) });
    if (kind === "invoice" && canVoid) list.push({ label: "Void sale", danger: true, onClick: () => open({ view: d.number, step: "void" }) });
    if (owner && d.status.label !== "Paid") list.push({ label: "Delete", danger: true, disabled: locked, onClick: () => del(d.number) });
    return list;
  };
}

export function QuotationList() {
  const rows = useQuotations();
  const role = useRole();
  const { open } = useOverlay();
  const del = useDelete("quote");
  const pill = useCallback((r: Quotation) => r.status.label, []);
  const filter = useStatusFilter(rows, pill);
  const items = docActions("quote", false, !role.tabs, open, del.ask);
  const columns: DataColumn<Quotation>[] = [
    { key: "number", title: "Quotation #", render: (r) => <Lead>{r.number}</Lead> },
    { key: "customer", title: "Customer" },
    { key: "date", title: "Date", text: (r) => docDate(r.date) },
    pillCol((r) => r.status),
    { key: "amount", title: "Amount (KES)", numeric: true, text: (r) => amount(r.amount) },
    actionsCol(items, true),
  ];
  return (
    <>
      <DataTable columns={columns} rows={filter.shown} rowKey={(r) => r.number} onRowClick={(r) => open({ view: r.number })} filters={filter.control} />
      <DocOverlays kind="quote" docs={rows} />
      {del.dialog}
    </>
  );
}

export function InvoiceList() {
  const rows = useInvoices();
  const role = useRole();
  const { open } = useOverlay();
  const del = useDelete("invoice");
  const pill = useCallback((r: Invoice) => r.status.label, []);
  const filter = useStatusFilter(rows, pill);
  const items = docActions("invoice", !role.tabs || !!role.figures, !role.tabs, open, del.ask);
  const balance = (r: Invoice) => Math.max(0, r.amount - r.paid);
  const columns: DataColumn<Invoice>[] = [
    { key: "number", title: "Invoice #", render: (r) => <Lead>{r.number}</Lead> },
    { key: "customer", title: "Customer" },
    { key: "date", title: "Invoice date", text: (r) => docDate(r.date) },
    { key: "due", title: "Due date", text: (r) => docDate(r.due) },
    pillCol((r) => r.status),
    { key: "amount", title: "Amount (KES)", numeric: true, text: (r) => amount(r.amount) },
    {
      key: "balance",
      title: "Balance due (KES)",
      numeric: true,
      text: (r) => amount(balance(r)),
      render: (r) => (
        <span className="inline-flex flex-col items-end">
          <span className={`font-semibold ${balance(r) === 0 ? "text-success-text" : "text-warning-text"}`}>{amount(balance(r))}</span>
          <span className="type-caption text-text-muted">Amount paid: {amount(r.paid)}</span>
        </span>
      ),
    },
    actionsCol(items),
  ];
  return (
    <>
      <DataTable columns={columns} rows={filter.shown} rowKey={(r) => r.number} onRowClick={(r) => open({ view: r.number })} filters={filter.control} />
      <DocOverlays kind="invoice" docs={rows} />
      {del.dialog}
    </>
  );
}

export function CreditNoteList() {
  const rows = useCreditNotes();
  const role = useRole();
  const { params, open, close } = useOverlay();
  const del = useDelete("credit");
  const pill = useCallback((r: CreditNote) => r.status.label, []);
  const filter = useStatusFilter(rows, pill);
  const items = docActions("credit", false, !role.tabs, open, del.ask);
  const columns: DataColumn<CreditNote>[] = [
    { key: "number", title: "Credit note", render: (r) => <Lead>{r.number}</Lead> },
    { key: "customer", title: "Customer" },
    { key: "date", title: "Date", text: (r) => docDate(r.date) },
    { key: "source", title: "Invoice" },
    { key: "reason", title: "Reason" },
    { key: "amount", title: "Amount (KES)", numeric: true, text: (r) => amount(r.amount) },
    pillCol((r) => r.status),
    actionsCol(items),
  ];
  const view = params.get("view");
  return (
    <>
      <DataTable columns={columns} rows={filter.shown} rowKey={(r) => r.number} onRowClick={(r) => open({ view: r.number })} filters={filter.control} />
      {params.get("action") === "credit" && <DocumentForm kind={"credit" as DocKind} onClose={close} />}
      {view && <RecordView kind="credit" refId={view} onClose={close} />}
      {del.dialog}
    </>
  );
}

export function VoidList() {
  const rows = useVoids();
  const { params, open, close } = useOverlay();
  const columns: DataColumn<VoidRecord>[] = [
    { key: "ref", title: "Void ref", render: (r) => <Lead>{r.ref}</Lead> },
    { key: "original", title: "Original sale" },
    { key: "customer", title: "Customer" },
    { key: "date", title: "Voided on", text: (r) => docDate(r.date) },
    { key: "reason", title: "Reason" },
    { key: "by", title: "Voided by" },
    { key: "amount", title: "Amount (KES)", numeric: true, text: (r) => amount(r.amount) },
    actionsCol((r) => [{ label: "View", onClick: () => open({ view: r.ref }) }]),
  ];
  const view = params.get("view");
  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} />
      {view && <RecordView kind="void" refId={view} onClose={close} />}
    </>
  );
}
