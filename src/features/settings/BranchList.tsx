"use client";
/**
 * Settings › Branches (design `set` table rows): Group, Branch (code below), City, Phone, Storage
 * locations, Status (Headquarters / Branch). Row actions Edit, Set as headquarters (not for the
 * headquarters) and Delete (not for the headquarters or a branch with storage locations).
 */
import { deleteBranch, setHeadquarters, useBranches, type BranchRow } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { SettingsDialog } from "./SettingsDialog";
import { StructHelp } from "./StructHelp";
import { MainNote, Stack, useSettingsOverlay } from "./shared";

const COLUMNS: DataColumn<BranchRow>[] = [
  { key: "group", title: "Group", text: (b) => b.group || "—" },
  { key: "name", title: "Branch", text: (b) => b.name, render: (b) => <MainNote main={b.name} note={b.code} /> },
  { key: "city", title: "City", text: (b) => b.city || "—" },
  { key: "phone", title: "Phone", text: (b) => b.phone || "—" },
  { key: "stores", title: "Storage locations", numeric: true, text: (b) => String(b.stores) },
  {
    key: "status",
    title: "Status",
    text: (b) => (b.hq ? "Headquarters" : "Branch"),
    render: (b) => <StatusPill tone={b.hq ? "success" : "neutral"}>{b.hq ? "Headquarters" : "Branch"}</StatusPill>,
  },
];

export function BranchList() {
  const rows = useBranches();
  const { params, open, close } = useSettingsOverlay();
  const columns: DataColumn<BranchRow>[] = [
    ...COLUMNS,
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (b) => (
        <RowActions
          items={[
            { label: "Edit", onClick: () => open({ view: b.name }) },
            { label: "Set as headquarters", disabled: b.hq, onClick: () => void setHeadquarters(b.name) },
            { label: "Delete", danger: true, disabled: !b.canDelete, onClick: () => void deleteBranch(b.name) },
          ]}
        />
      ),
    },
  ];
  const view = params.get("view");
  return (
    <Stack>
      <StructHelp active="branches" />
      <DataTable columns={columns} rows={rows} rowKey={(b) => b.name} onRowClick={(b) => open({ view: b.name })} minWidth={820} />
      {params.get("action") === "new" && <SettingsDialog kind="branch" onClose={close} />}
      {view && <SettingsDialog kind="branch" edit={view} onClose={close} />}
    </Stack>
  );
}
