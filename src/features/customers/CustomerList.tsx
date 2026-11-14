"use client";
/**
 * Customers › Customers: Name, Phone, Email, Address, Status; "New customer" → `?action=new`.
 * Feature 012 adds Group, Credit limit and Balance owed, and an "Over limit" / "Overdue" pill.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WALK_IN, creditFlag, groupName, toggleCustomerActive, useCreditPositions, useCustomerGroups, useCustomers, type Customer } from "@/data";
import { money } from "@/lib/format";
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
  const groups = useCustomerGroups();
  const credit = useCreditPositions();
  const editName = params.get("edit");
  const editing = editName ? customers.find((c) => c.name === editName) : undefined;
  const columns: DataColumn<Customer>[] = [
    { key: "name", title: "Name", render: (r) => <span className="font-medium text-text">{r.name}</span> },
    { key: "phone", title: "Phone", render: (r) => <span className="whitespace-nowrap">{r.phone}</span> },
    { key: "email", title: "Email" },
    { key: "address", title: "Address" },
    { key: "group", title: "Group", text: (r) => groupName(groups, r.group) },
    {
      key: "creditLimit",
      title: "Credit limit (KES)",
      numeric: true,
      text: (r) => (r.name === WALK_IN ? "—" : r.creditLimit === null ? "No limit" : money(r.creditLimit)),
    },
    { key: "owed", title: "Balance owed (KES)", numeric: true, text: (r) => (credit[r.name]?.owed ? money(credit[r.name]!.owed) : "—") },
    {
      key: "status",
      title: "Status",
      text: (r) => r.status.label,
      render: (r) => {
        const p = credit[r.name];
        const flag = p ? creditFlag(p) : null;
        return (
          <span className="inline-flex flex-wrap items-center gap-1">
            <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill>
            {flag && <StatusPill tone={flag === "Overdue" ? "danger" : "warning"}>{flag}</StatusPill>}
          </span>
        );
      },
    },
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
      <DataTable columns={columns} rows={customers} rowKey={(r) => r.name} onRowClick={(r) => open({ edit: r.name })} minWidth={980} />
      <CustomerForm open={params.get("action") === "new"} onClose={close} />
      <CustomerForm open={!!editing} edit={editing} onClose={close} />
    </>
  );
}
