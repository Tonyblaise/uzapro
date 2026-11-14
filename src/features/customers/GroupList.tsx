"use client";
/**
 * Customers › Customer groups (feature 012): each group and its price list. "New group" →
 * `?action=new`; Rename → `?edit=<id>`. Retail is built in: standard prices, no rename or delete.
 */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GROUP_NAME_MAX, addCustomerGroup, deleteCustomerGroup, renameCustomerGroup, type CustomerGroupRow, useCan, useCustomerGroups } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Field";
import { RowActions } from "@/components/ui/Menu";
import { ConfirmDialog, Drawer } from "@/components/ui/Overlay";

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

export function NewGroupAction() {
  const { open } = useParamsNav();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New group
    </Button>
  );
}

export function GroupList() {
  const groups = useCustomerGroups();
  const { params, open, close } = useParamsNav();
  const canDelete = useCan("delete");
  const [confirm, setConfirm] = useState<CustomerGroupRow | null>(null);
  const editing = groups.find((g) => g.id === params.get("edit") && !g.builtIn);
  const columns: DataColumn<CustomerGroupRow>[] = [
    { key: "name", title: "Group", render: (r) => <span className="font-medium text-text">{r.name}</span> },
    { key: "prices", title: "Price list", text: (r) => (r.builtIn ? "Standard prices" : `${r.prices} ${r.prices === 1 ? "price" : "prices"}`) },
    { key: "customers", title: "Customers", numeric: true, text: (r) => String(r.customers) },
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) =>
        r.builtIn ? null : (
          <RowActions
            items={[
              { label: "Rename", onClick: () => open({ edit: r.id }) },
              ...(canDelete ? [{ label: "Delete", danger: true, onClick: () => setConfirm(r) }] : []),
            ]}
          />
        ),
    },
  ];
  return (
    <>
      <DataTable columns={columns} rows={groups} rowKey={(r) => r.id} noun="group" />
      <GroupForm open={params.get("action") === "new"} onClose={close} />
      <GroupForm open={!!editing} edit={editing} onClose={close} />
      <ConfirmDialog
        open={!!confirm}
        title={`Delete ${confirm?.name ?? ""}?`}
        message="This also deletes the group's price list."
        confirmLabel="Delete"
        danger
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) void deleteCustomerGroup(confirm.id);
          setConfirm(null);
        }}
      />
    </>
  );
}

function GroupForm({ open, edit, onClose }: { open: boolean; edit?: CustomerGroupRow; onClose: () => void }) {
  if (!open) return null;
  return <GroupFormBody key={edit?.id ?? "new"} edit={edit} onClose={onClose} />;
}

function GroupFormBody({ edit, onClose }: { edit?: CustomerGroupRow; onClose: () => void }) {
  const [name, setName] = useState(edit?.name ?? "");
  const [error, setError] = useState("");
  const save = async () => {
    const r = edit ? await renameCustomerGroup(edit.id, name) : await addCustomerGroup(name);
    if (r.ok) onClose();
    else setError(r.message);
  };
  return (
    <Drawer open title={edit ? "Rename group" : "New group"} subtitle="Customers" width={440} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Group name"
          placeholder="For example, Schools"
          maxLength={GROUP_NAME_MAX}
          value={name}
          error={error || undefined}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />
        <div className="flex gap-2">
          <Button disabled={!name.trim()} onClick={save}>
            Save
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
