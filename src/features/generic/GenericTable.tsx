"use client";
/**
 * The design's generic table (`isTable`, design lines 761–824) for Reports › Sent automatically,
 * Team, Permissions, the Messages lists and Settings › Staff logins, Taxes and Connected apps.
 * Columns come from the module registry; pills render as status pills. Row click and "View" open
 * the record drawer (`?view=<first cell>`); "Delete" is the Owner's only (design `canDelete`) and
 * asks first in a drawer ("Delete {name}?", `rowConfirm`).
 */
import { findTab, getModule } from "@/config/modules";
import { canDeleteGeneric, cellText, deleteGenericRow, useGenericRows, useRole, type GenericRow, type ModuleId } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { NewRecordDrawer } from "./NewRecordDrawer";
import { RecordDrawer } from "./RecordDrawer";
import { GenericDrawer, useGenericOverlay } from "./shared";

export function GenericTable({ moduleId, tab }: { moduleId: ModuleId; tab: string }) {
  const rows = useGenericRows(moduleId, tab);
  const role = useRole();
  const canDelete = canDeleteGeneric(role.id);
  const { params, open, close } = useGenericOverlay();
  const cols = findTab(getModule(moduleId), tab)?.columns ?? [];

  const view = params.get("view");
  const current = view ? rows.find((r) => cellText(r[0]) === view) : undefined;
  const confirming = !!current && canDelete && params.get("confirm") === "delete";

  const columns: DataColumn<GenericRow>[] = [
    ...cols.map(
      (c, i): DataColumn<GenericRow> => ({
        key: `c${i}`,
        title: c.title,
        numeric: c.numeric,
        text: (r) => cellText(r[i]),
        render: (r) => {
          const v = r[i];
          if (v && typeof v === "object") return <StatusPill tone={v.tone}>{v.label}</StatusPill>;
          return i === 0 ? <span className="font-medium text-text">{v}</span> : v;
        },
      }),
    ),
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => {
        const name = cellText(r[0]);
        return (
          <RowActions
            items={[
              { label: "View", onClick: () => open({ view: name }) },
              ...(canDelete ? [{ label: "Delete", danger: true, onClick: () => open({ view: name, confirm: "delete" }) }] : []),
            ]}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(r, i) => `${cellText(r[0])}-${i}`} onRowClick={(r) => open({ view: cellText(r[0]) })} />
      {current && confirming && (
        <GenericDrawer moduleId={moduleId} title={`Delete ${cellText(current[0])}?`} onClose={close}>
          <div className="flex flex-col gap-4">
            <div className="type-body text-text">This permanently deletes this record.</div>
            <div className="flex gap-2">
              <Button
                variant="danger"
                icon="trash-2"
                onClick={() => {
                  close();
                  void deleteGenericRow(moduleId, tab, cellText(current[0]));
                }}
              >
                Delete
              </Button>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
        </GenericDrawer>
      )}
      {current && !confirming && <RecordDrawer key={view} moduleId={moduleId} columns={cols} row={current} onClose={close} />}
      <NewRecordDrawer moduleId={moduleId} />
    </>
  );
}
