"use client";

import { useState } from "react";
import { deleteUnit, useUnitList, useCan } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { UnitForm } from "./UnitForm";
import { RowConfirm, useOverlayParams } from "./shared";

interface UnitRow {
  unit: string;
}

/** Units of measure tab: the design lists every `UZ_UNITS` entry; a row opens "Edit unit". */
export function UnitList() {
  const units = useUnitList();
  const { action, view, open, close } = useOverlayParams();
  const [confirm, setConfirm] = useState<string | null>(null);
  const canDelete = useCan("delete");

  const columns: DataColumn<UnitRow>[] = [
    { key: "unit", title: "Unit", render: (r) => <span className="font-medium text-text">{r.unit}</span> },
    {
      key: "actions",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "View", onClick: () => open({ view: r.unit }) },
            ...(canDelete ? [{ label: "Delete", danger: true, onClick: () => setConfirm(r.unit) }] : []),
          ]}
        />
      ),
    },
  ];

  const editing = view && units.includes(view) ? view : undefined;

  return (
    <>
      <DataTable columns={columns} rows={units.map((unit) => ({ unit }))} rowKey={(r) => r.unit} onRowClick={(r) => open({ view: r.unit })} noun="record" />
      <UnitForm open={action === "new" || !!editing} edit={editing} onClose={close} />
      <RowConfirm
        name={confirm}
        onClose={() => setConfirm(null)}
        onDelete={() => {
          if (confirm) void deleteUnit(confirm);
          setConfirm(null);
        }}
      />
    </>
  );
}

export function UnitActions() {
  const { open } = useOverlayParams();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New unit
    </Button>
  );
}
