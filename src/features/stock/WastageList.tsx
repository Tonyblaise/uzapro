"use client";

import { deleteWastage, undoWastage, useWastage, type Wastage } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { num } from "@/lib/format";
import { StockDrawer, itemKey, useCanDelete, useOverlayParams } from "./shared";
import { WastageOverlay } from "./WastageForm";

/** Seed rows show the design's item name and bare quantity; new rows show "Product · Variant" and "qty unit". */
const itemText = (w: Wastage) => {
  const i = w.items[0];
  if (!i) return "—";
  return i.variant ? itemKey(i.product, i.variant) : i.product;
};
const qtyText = (w: Wastage) => {
  const i = w.items[0];
  if (!i) return "—";
  return w.session ? `${i.qty} ${i.unit}` : String(i.qty);
};

const COLUMNS: DataColumn<Wastage>[] = [
  { key: "ref", title: "Ref" },
  { key: "item", title: "Item", text: itemText },
  { key: "qty", title: "Qty", numeric: true, text: qtyText },
  { key: "reason", title: "Reason", text: (w) => w.items[0]?.reason ?? "—" },
  { key: "value", title: "Value", numeric: true, text: (w) => num(w.value) },
];

/** Design "Wastage" table with the Undo and (owner) Delete row actions. */
export function WastageList() {
  const list = useWastage();
  const canDelete = useCanDelete();
  const { view, get, open, close } = useOverlayParams();
  const current = view ? list.find((w) => w.ref === view) : undefined;

  const actions = (w: Wastage): MenuItem[] => [
    { label: "Undo", onClick: () => void undoWastage(w.ref) },
    ...(canDelete ? [{ label: "Delete", danger: true, onClick: () => open({ view: w.ref, confirm: "delete" }) }] : []),
  ];

  const columns: DataColumn<Wastage>[] = [...COLUMNS, { key: "actions", title: "", width: 48, render: (w) => <RowActions items={actions(w)} /> }];

  return (
    <>
      <DataTable columns={columns} rows={list} rowKey={(w) => w.ref} onRowClick={(w) => open({ view: w.ref })} />
      {current && get("confirm") === "delete" && (
        <StockDrawer title={`Delete ${current.ref}?`} onClose={close}>
          <div className="flex flex-col gap-4">
            <div className="type-body text-text">This permanently deletes this record.</div>
            <div className="flex gap-2">
              <Button
                variant="danger"
                icon="trash-2"
                onClick={async () => {
                  await deleteWastage(current.ref);
                  close();
                }}
              >
                Delete
              </Button>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
        </StockDrawer>
      )}
      {current && !get("confirm") && (
        <StockDrawer title={current.ref} onClose={close}>
          <div className="flex flex-col gap-5">
            <div>
              <div className="type-card-title mb-2 text-text">Overview</div>
              {COLUMNS.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-4 border-t border-border py-3">
                  <span className="type-eyebrow flex-none text-text-muted">{c.title}</span>
                  <span className="type-label u-num text-right text-text">{c.text ? c.text(current) : current.ref}</span>
                </div>
              ))}
            </div>
            {/* The design's generic record drawer shows these buttons without actions. */}
            <div className="flex flex-wrap gap-2">
              <Button icon="pencil">Edit</Button>
              <Button variant="secondary">Duplicate</Button>
              <Button variant="secondary" icon="printer">
                Print
              </Button>
            </div>
          </div>
        </StockDrawer>
      )}
      <WastageOverlay />
    </>
  );
}
