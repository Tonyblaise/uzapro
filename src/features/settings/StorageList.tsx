"use client";
/**
 * Settings › Storage locations: the Stock › Warehouses records (design `set` table rows): Branch,
 * Storage location ("BBL-STG-00n" below), Type, Sales (POS enabled / Storage only). Row actions
 * Edit, Allow sales (POS) / Make storage only, and Delete (not while it holds stock or a terminal).
 */
import { deleteStorageLocation, setPos, toast, useStorageLocations, type StorageLocationRow } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { SettingsDialog } from "./SettingsDialog";
import { StructHelp } from "./StructHelp";
import { MainNote, Stack, useSettingsOverlay } from "./shared";

const COLUMNS: DataColumn<StorageLocationRow>[] = [
  { key: "branch", title: "Branch", text: (r) => r.branch },
  { key: "name", title: "Storage location", text: (r) => r.name, render: (r) => <MainNote main={r.name} note={r.code} /> },
  { key: "type", title: "Type", text: (r) => r.type },
  {
    key: "pos",
    title: "Sales",
    text: (r) => (r.pos ? "POS enabled" : "Storage only"),
    render: (r) => <StatusPill tone={r.pos ? "success" : "neutral"}>{r.pos ? "POS enabled" : "Storage only"}</StatusPill>,
  },
];

async function remove(name: string) {
  const res = await deleteStorageLocation(name);
  if (!res.ok) toast(res.message);
}

export function StorageList() {
  const rows = useStorageLocations();
  const { params, open, close } = useSettingsOverlay();
  const columns: DataColumn<StorageLocationRow>[] = [
    ...COLUMNS,
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "Edit", onClick: () => open({ view: r.name }) },
            { label: r.pos ? "Make storage only" : "Allow sales (POS)", onClick: () => void setPos(r.name, !r.pos) },
            { label: "Delete", danger: true, disabled: !r.canDelete, onClick: () => void remove(r.name) },
          ]}
        />
      ),
    },
  ];
  const view = params.get("view");
  return (
    <Stack>
      <StructHelp active="storage-locations" />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.name} onRowClick={(r) => open({ view: r.name })} minWidth={640} />
      {params.get("action") === "new" && <SettingsDialog kind="store" onClose={close} />}
      {view && <SettingsDialog kind="store" edit={view} onClose={close} />}
    </Stack>
  );
}
