"use client";
/**
 * Suppliers › Suppliers: Name, Type, Phone, Email, Town or city, Status. Row click and "Edit" open
 * the supplier form (design `supOpen`); "Delete" for the owner; header action "New supplier".
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { deleteSupplier, useSupplierList, type Supplier, useCan } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { SupplierForm } from "./SupplierForm";

function useParamsNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return {
    params,
    open: (p: Record<string, string>) => router.replace(`${pathname}?${new URLSearchParams(p).toString()}`, { scroll: false }),
    close: () => router.replace(pathname, { scroll: false }),
  };
}

export function NewSupplierAction() {
  const { open } = useParamsNav();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New supplier
    </Button>
  );
}

export function SupplierList() {
  const suppliers = useSupplierList();
  const canDelete = useCan("delete");
  const { params, open, close } = useParamsNav();
  const [confirm, setConfirm] = useState<string | null>(null);
  const viewName = params.get("view");
  const editing = viewName ? suppliers.find((s) => s.name === viewName) : undefined;

  const columns: DataColumn<Supplier>[] = [
    { key: "name", title: "Name", render: (r) => <span className="font-medium text-text">{r.name}</span> },
    { key: "type", title: "Type" },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    { key: "town", title: "Town or city" },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[{ label: "Edit", onClick: () => open({ view: r.name }) }, ...(canDelete ? [{ label: "Delete", danger: true, onClick: () => setConfirm(r.name) }] : [])]}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} rows={suppliers} rowKey={(r) => r.name} onRowClick={(r) => open({ view: r.name })} />
      <SupplierForm open={params.get("action") === "new"} onClose={close} />
      <SupplierForm open={!!editing} edit={editing} onClose={close} />
      <ConfirmDialog
        open={!!confirm}
        title={`Delete ${confirm ?? ""}?`}
        message="This permanently deletes this record."
        confirmLabel="Delete"
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) void deleteSupplier(confirm);
          setConfirm(null);
        }}
      />
    </>
  );
}
