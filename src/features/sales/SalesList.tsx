"use client";
/** Sales › All sales: the list, plus New sale, sale view, void and credit note overlays. */
import { useRouter } from "next/navigation";
import { useRole, useSales, type Sale } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { CreditNoteForm } from "./CreditNoteForm";
import { NewSaleForm } from "./NewSaleForm";
import { RecordView } from "./RecordView";
import { SaleView } from "./SaleView";
import { VoidForm } from "./VoidForm";
import { Lead, amount, useOverlay } from "./shared";

/** Header action on Overview and All sales (design `headerActions` → "New sale"). */
export function NewSaleAction() {
  const router = useRouter();
  return (
    <Button icon="plus" onClick={() => router.push("/sales/all-sales?action=new")}>
      New sale
    </Button>
  );
}

export function SalesList() {
  const sales = useSales();
  const role = useRole();
  const { params, open, close } = useOverlay();
  const canVoid = !role.tabs || !!role.figures;
  const action = params.get("action");
  const view = params.get("view");
  const step = params.get("step");
  const voidLabel = params.get("label") ?? "";
  const voidAmount = params.get("amount") ?? "";

  const askVoid = (s: Sale, label: string) => open({ view: s.ref, step: "void", label, amount: amount(s.total) });

  const columns: DataColumn<Sale>[] = [
    { key: "customer", title: "Customer", render: (r) => <Lead>{r.customer}</Lead> },
    { key: "type", title: "Type" },
    { key: "channel", title: "Channel" },
    { key: "total", title: "Total", numeric: true, text: (r) => amount(r.total) },
    { key: "status", title: "Status", render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill>, text: (r) => r.status.label },
    {
      key: "_act",
      title: "",
      numeric: true,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[{ label: "View", onClick: () => open({ view: r.ref }) }, ...(canVoid ? [{ label: "Void sale", danger: true, onClick: () => askVoid(r, `this sale to ${r.customer}`) }] : [])]}
        />
      ),
    },
  ];

  const viewing = view ? sales.find((s) => s.ref === view) : undefined;
  const isInvoice = !!view && /^INV-/.test(view);

  return (
    <>
      <DataTable columns={columns} rows={sales} rowKey={(r) => r.ref} onRowClick={(r) => open({ view: r.ref })} />
      {action === "new" && <NewSaleForm onClose={close} />}
      {view && !step && !isInvoice && (
        <SaleView
          refId={view}
          onClose={close}
          onCredit={() => open({ view, step: "credit" })}
          onVoid={() => viewing && askVoid(viewing, `${viewing.ref} to ${viewing.customer}`)}
        />
      )}
      {view && !step && isInvoice && (
        <RecordView kind="invoice" refId={view} onClose={close} onVoid={(d) => open({ view: d.number, step: "void", label: `${d.number} to ${d.customer}`, amount: amount(d.amount) })} />
      )}
      {view && step === "void" && <VoidForm refId={view} label={voidLabel} amount={voidAmount} onClose={close} onDone={close} />}
      {view && step === "credit" && <CreditNoteForm saleRef={view} onClose={() => open({ view })} onDone={() => open({ view })} />}
    </>
  );
}
