"use client";
/**
 * Suppliers › Supplier credits: the credit each supplier gives the business (buy now, pay within
 * the terms). Columns Supplier, Credit limit, Terms, Owing, On order, Left, Status. Header action
 * "Add supplier credit"; row actions Edit and Remove. Credit notes from suppliers are the separate
 * Supplier credit notes tab.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SUPPLIER_TERMS, removeSupplierCredit, saveSupplierCredit, useCan, useSupplierCredits, useSupplierList, type SupplierCreditRow, type SupplierTerms } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Field";
import { RowActions } from "@/components/ui/Menu";
import { ConfirmDialog, Modal } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";

const fmt = (n: number) => n.toLocaleString("en-US");

function useCreditNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return {
    params,
    open: (p: Record<string, string>) => router.replace(`${pathname}?${new URLSearchParams(p).toString()}`, { scroll: false }),
    close: () => router.replace(pathname, { scroll: false }),
  };
}

export function AddSupplierCreditAction() {
  const { open } = useCreditNav();
  if (!useCan("write")) return null;
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      Add supplier credit
    </Button>
  );
}

export function SupplierCreditList() {
  const rows = useSupplierCredits();
  const canWrite = useCan("write");
  const canDelete = useCan("delete");
  const { params, open, close } = useCreditNav();
  const [removing, setRemoving] = useState<string | null>(null);
  const editing = rows.find((r) => r.supplier === params.get("view"));

  const columns: DataColumn<SupplierCreditRow>[] = [
    { key: "supplier", title: "Supplier", render: (r) => <span className="font-medium text-text">{r.supplier}</span> },
    { key: "limit", title: "Credit limit (KES)", numeric: true, text: (r) => fmt(r.limit) },
    { key: "terms", title: "Terms" },
    { key: "owing", title: "Owing (KES)", numeric: true, text: (r) => fmt(r.owing) },
    { key: "onOrder", title: "On order (KES)", numeric: true, text: (r) => fmt(r.onOrder) },
    {
      key: "left",
      title: "Left (KES)",
      numeric: true,
      text: (r) => (r.left < 0 ? `−${fmt(-r.left)}` : fmt(r.left)),
      render: (r) => <span className={r.left < 0 ? "text-danger-text" : undefined}>{r.left < 0 ? `−${fmt(-r.left)}` : fmt(r.left)}</span>,
    },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            ...(canWrite ? [{ label: "Edit", onClick: () => open({ view: r.supplier }) }] : []),
            ...(canDelete ? [{ label: "Remove", danger: true, onClick: () => setRemoving(r.supplier) }] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <p className="type-small m-0 mb-3 text-text-muted">
        Credit your suppliers give you: buy now and pay within the terms. Owing is unpaid bills; On order is unpaid purchase orders not yet received.
      </p>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.supplier}
        onRowClick={canWrite ? (r) => open({ view: r.supplier }) : undefined}
        minWidth={820}
        empty="No supplier gives you credit yet."
      />
      {params.get("action") === "new" && <CreditForm onClose={close} />}
      {editing && <CreditForm key={editing.supplier} edit={editing} onClose={close} />}
      <ConfirmDialog
        open={!!removing}
        title={`Remove credit from ${removing ?? ""}?`}
        message="Purchase orders to this supplier will no longer be checked against a limit. Bills and orders are not changed."
        confirmLabel="Remove"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) void removeSupplierCredit(removing);
          setRemoving(null);
        }}
      />
    </>
  );
}

function CreditForm({ edit, onClose }: { edit?: SupplierCreditRow; onClose: () => void }) {
  const suppliers = useSupplierList();
  const options = suppliers.filter((s) => !s.credit).map((s) => s.name);
  const [supplier, setSupplier] = useState(edit?.supplier ?? "");
  const [limit, setLimit] = useState(edit ? String(edit.limit) : "");
  const [terms, setTerms] = useState<SupplierTerms>(edit?.terms ?? "30 days");
  const [error, setError] = useState("");
  const clear = () => setError("");

  const save = async () => {
    const r = await saveSupplierCredit(supplier, { limit: Number(limit.replace(/,/g, "")), terms }, !!edit);
    if (r.ok) onClose();
    else setError(r.message);
  };

  return (
    <Modal
      open
      title={edit ? `Credit from ${edit.supplier}` : "Add supplier credit"}
      subtitle="The most you can owe this supplier, and how long you have to pay"
      onClose={onClose}
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" onClick={() => void save()}>
            Save credit
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {edit ? (
          <Input label="Supplier" value={edit.supplier} disabled readOnly />
        ) : (
          <SearchSelect label="Supplier" noun="supplier" options={options} value={supplier} onChange={(v) => (setSupplier(v), clear())} />
        )}
        <Input label="Credit limit (KES)" inputMode="numeric" placeholder="For example, 250000" value={limit} onChange={(e) => (setLimit(e.target.value.replace(/[^\d,]/g, "")), clear())} />
        <SearchSelect label="Payment terms" noun="terms" options={[...SUPPLIER_TERMS]} value={terms} onChange={(v) => (setTerms(v as SupplierTerms), clear())} />
        <div className="type-small rounded-md bg-canvas p-3 text-text-secondary">
          You pay {supplier || "this supplier"} within {terms} of each bill. Purchase orders that take you over the limit still save, with a warning.
        </div>
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
