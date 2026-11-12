"use client";

import { useState } from "react";
import { UZ_LOC, deleteStore, saveStore, useStores, useWarehouseRows, type Store } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Field";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { num } from "@/lib/format";
import { StockDrawer, useCanDelete, useOverlayParams } from "./shared";

type Row = Store & { items: number };

/** Design "Warehouses" table: Warehouse, Branch, Type, Items (total quantity held). */
export function WarehouseList() {
  const rows = useWarehouseRows();
  const canDelete = useCanDelete();
  const { open } = useOverlayParams();
  const edit = (r: Row) => open({ view: r.name });

  const actions = (r: Row): MenuItem[] => [
    { label: "Edit", onClick: () => edit(r) },
    ...(canDelete ? [{ label: "Delete", danger: true, disabled: r.items > 0, onClick: () => void deleteStore(r.name) }] : []),
  ];

  const columns: DataColumn<Row>[] = [
    { key: "name", title: "Warehouse" },
    { key: "branch", title: "Branch" },
    { key: "type", title: "Type" },
    { key: "items", title: "Items", numeric: true, text: (r) => num(r.items) },
    { key: "actions", title: "", width: 48, render: (r) => <RowActions items={actions(r)} /> },
  ];

  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.name} onRowClick={edit} />
      <WarehouseOverlay />
    </>
  );
}

/** `?action=warehouse` (New warehouse) or `?view={name}` (Edit warehouse). */
function WarehouseOverlay() {
  const { action, view, close } = useOverlayParams();
  const stores = useStores();
  const current = view ? stores.find((s) => s.name === view) : undefined;
  if (action === "warehouse") return <WarehouseForm key="new" onClose={close} />;
  if (current) return <WarehouseForm key={current.name} edit={current} onClose={close} />;
  return null;
}

/** Design `isLocForm`. */
function WarehouseForm({ edit, onClose }: { edit?: Store; onClose: () => void }) {
  const [name, setName] = useState(edit?.name ?? "");
  const [branch, setBranch] = useState(edit?.branch ?? "");
  const [type, setType] = useState(edit?.type ?? "");
  const [branches, setBranches] = useState<string[]>(UZ_LOC.branches);
  const [types, setTypes] = useState<string[]>(UZ_LOC.types);
  const blocked = !name.trim() || !branch || !type;

  return (
    <StockDrawer title={edit ? "Edit warehouse" : "New warehouse"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input label="Warehouse name" placeholder="For example, Mombasa Store" value={name} onChange={(e) => setName(e.target.value)} />
        <SearchSelect
          label="Branch"
          noun="branch"
          options={branches}
          value={branch}
          onChange={setBranch}
          onCreate={(n) => {
            setBranches((b) => [...b, n]);
            return n;
          }}
        />
        <SearchSelect
          label="Type"
          noun="type"
          options={types}
          value={type}
          onChange={setType}
          onCreate={(n) => {
            setTypes((t) => [...t, n]);
            return n;
          }}
        />
        <div className="flex gap-2">
          <Button
            disabled={blocked}
            onClick={async () => {
              const res = await saveStore({ name, branch, type }, edit?.name);
              if (res.ok) onClose();
            }}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </StockDrawer>
  );
}
