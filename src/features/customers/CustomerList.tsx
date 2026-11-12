"use client";
/** Customers › Customers: Name, Phone, Email, Address, Status; "New customer" → `?action=new`. */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WALK_IN, toggleCustomerActive, useCustomers, type Customer } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { CustomerForm } from "./CustomerForm";

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

export function NewCustomerAction() {
  const { open } = useParamsNav();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New customer
    </Button>
  );
}

export function CustomerList() {
  const customers = useCustomers();
  const { params, open, close } = useParamsNav();
  const editName = params.get("edit");
  const editing = editName ? customers.find((c) => c.name === editName) : undefined;
  const columns: DataColumn<Customer>[] = [
    { key: "name", title: "Name", render: (r) => <span className="font-medium text-text">{r.name}</span> },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    { key: "address", title: "Address" },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "Edit", onClick: () => open({ edit: r.name }) },
            { label: r.status.label === "Inactive" ? "Mark active" : "Mark inactive", disabled: r.name === WALK_IN, onClick: () => void toggleCustomerActive(r.name) },
          ]}
        />
      ),
    },
  ];
  return (
    <>
      <DataTable columns={columns} rows={customers} rowKey={(r) => r.name} onRowClick={(r) => open({ edit: r.name })} />
      <CustomerForm open={params.get("action") === "new"} onClose={close} />
      <CustomerForm open={!!editing} edit={editing} onClose={close} />
    </>
  );
}
