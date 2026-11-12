"use client";

import { useMemo, useState } from "react";
import { addWasteReason, recordWastage, useStoreQuantities, useWasteReasons } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { ItemRow, ItemsGrid, NotesField, StockDrawer, createStore, itemKey, splitKey, useOverlayParams, useStoreNames, useUnitOptions, useVariantLookup } from "./shared";

interface Row {
  key: string;
  qty: string;
  unit: string;
  reason: string;
}

const COLS = "minmax(0,1.3fr) 80px 130px minmax(0,1fr) 54px";

/** Mounts the wastage drawer while `?action=waste` is set. */
export function WastageOverlay() {
  const { action, close } = useOverlayParams();
  return action === "waste" ? <WastageForm onClose={close} /> : null;
}

/** Design `isWasteForm` ("Record stock wastage"). */
export function WastageForm({ onClose }: { onClose: () => void }) {
  const stores = useStoreNames();
  const reasons = useWasteReasons();
  const variants = useVariantLookup();
  const units = useUnitOptions();
  const [loc, setLoc] = useState("Main Store");
  const [reason, setReason] = useState("Damaged");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const here = useStoreQuantities(loc);

  const items = useMemo(() => Array.from(here.entries()).filter(([, q]) => q > 0).flatMap(([p]) => variants.names(p).map((v) => itemKey(p, v))), [here, variants]);
  const avail = (p: string) => here.get(p) ?? 0;
  const used = (p: string) => rows.filter((r) => splitKey(r.key).product === p).reduce((a, r) => a + (Number(r.qty) || 0), 0);
  const setRow = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const blocked = !loc || rows.length === 0 || rows.some((r) => !(Number(r.qty) > 0) || used(splitKey(r.key).product) > avail(splitKey(r.key).product));

  const submit = async () => {
    const res = await recordWastage({ location: loc, notes, items: rows.map((r) => ({ ...splitKey(r.key), qty: Number(r.qty), unit: r.unit, reason: r.reason })) });
    if (res.ok) onClose();
  };

  return (
    <StockDrawer title="Record stock wastage" onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div className="type-body text-text-muted">Declare damaged, expired or lost stock.</div>
        <div className="grid grid-cols-2 gap-4">
          <SearchSelect
            label="Location"
            noun="store"
            options={stores}
            value={loc}
            onChange={(v) => {
              setLoc(v);
              setRows([]);
            }}
            onCreate={createStore}
          />
          <SearchSelect label="Default reason" noun="reason" options={reasons} value={reason} onChange={setReason} onCreate={addWasteReason} />
        </div>
        <NotesField id="w-notes" label="Notes or reference" rows={2} placeholder="Optional notes for this wastage" value={notes} onChange={setNotes} />
        <div role="note" className="type-small flex items-center gap-2 rounded-md bg-warning-soft p-3 text-warning-text">
          <Icon name="circle-alert" size={16} />
          <span>Wastage permanently removes stock. Add the products, then set the quantity and reason for each.</span>
        </div>
        <SearchSelect
          label="Search product"
          noun="product"
          options={items}
          value=""
          onChange={(key) => setRows((rs) => (rs.some((r) => r.key === key) ? rs : [...rs, { key, qty: "1", unit: units.base, reason }]))}
        />
        <ItemsGrid
          columns={COLS}
          head={[{ label: "Product" }, { label: "Quantity" }, { label: "Unit of measure" }, { label: "Reason" }, { label: "Action", right: true }]}
          empty={rows.length === 0 && <div className="type-small px-3 py-8 text-center text-text-muted">Choose a location, then add the products to write off.</div>}
        >
          {rows.map((r) => {
            const p = splitKey(r.key).product;
            const over = used(p) > avail(p);
            return (
              <ItemRow key={r.key} columns={COLS}>
                <span className="min-w-0">
                  <span className="type-label block text-text [overflow-wrap:anywhere]">{r.key}</span>
                  <span className={`type-caption block ${over ? "text-danger-text" : "text-text-muted"}`}>
                    {avail(p)} in {loc}
                  </span>
                </span>
                <Input size="sm" type="number" min={1} aria-label="Quantity" value={r.qty} onChange={(e) => setRow(r.key, { qty: e.target.value })} />
                <SearchSelect noun="unit" options={units.options} value={r.unit} onChange={(v) => setRow(r.key, { unit: v })} onCreate={units.create} />
                <SearchSelect noun="reason" options={reasons} value={r.reason} onChange={(v) => setRow(r.key, { reason: v })} onCreate={addWasteReason} />
                <div className="flex justify-end">
                  <IconButton icon="trash-2" size="sm" label="Remove item" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} />
                </div>
              </ItemRow>
            );
          })}
        </ItemsGrid>
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={blocked} onClick={submit}>
            Record wastage
          </Button>
        </div>
      </div>
    </StockDrawer>
  );
}
