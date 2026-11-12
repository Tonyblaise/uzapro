"use client";
/**
 * Settings › Location groups (design `set` table rows): Parent group ("Top level"), Group (code
 * below), Branches, Sub-groups. Row actions Edit and Delete (not while it has branches or sub-groups).
 */
import { deleteGroup, useGroups, type GroupRow } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { SettingsDialog } from "./SettingsDialog";
import { StructHelp } from "./StructHelp";
import { MainNote, Stack, useSettingsOverlay } from "./shared";

const COLUMNS: DataColumn<GroupRow>[] = [
  { key: "parent", title: "Parent group", text: (g) => g.parent || "Top level" },
  { key: "name", title: "Group", text: (g) => g.name, render: (g) => <MainNote main={g.name} note={g.code} /> },
  { key: "branches", title: "Branches", numeric: true, text: (g) => String(g.branches) },
  { key: "subGroups", title: "Sub-groups", numeric: true, text: (g) => String(g.subGroups) },
];

export function GroupList() {
  const rows = useGroups();
  const { params, open, close } = useSettingsOverlay();
  const columns: DataColumn<GroupRow>[] = [
    ...COLUMNS,
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (g) => (
        <RowActions
          items={[
            { label: "Edit", onClick: () => open({ view: g.name }) },
            { label: "Delete", danger: true, disabled: !g.canDelete, onClick: () => void deleteGroup(g.name) },
          ]}
        />
      ),
    },
  ];
  const view = params.get("view");
  return (
    <Stack>
      <StructHelp active="location-groups" />
      <DataTable columns={columns} rows={rows} rowKey={(g) => g.name} onRowClick={(g) => open({ view: g.name })} minWidth={640} />
      {params.get("action") === "new" && <SettingsDialog kind="group" onClose={close} />}
      {view && <SettingsDialog kind="group" edit={view} onClose={close} />}
    </Stack>
  );
}
