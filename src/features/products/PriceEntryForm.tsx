"use client";
/** Add / edit a price in a group's price list (feature 012, contracts/ui.md › Price lists). */
import { useState } from "react";
import { savePrice, standardPrice, unitsOf, useProducts, type CustomerGroup, type PriceEntry } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { kes } from "@/lib/format";
import { CRUMB } from "./shared";

interface BreakRow {
  id: number;
  from: string;
  price: string;
}

let rowId = 0;

export function PriceEntryForm({ open, group, edit, onClose }: { open: boolean; group: CustomerGroup; edit?: PriceEntry; onClose: () => void }) {
  if (!open) return null;
  return <Body key={edit ? `${edit.product}|${edit.variant}|${edit.unit}` : `new:${group.id}`} group={group} edit={edit} onClose={onClose} />;
}

function Body({ group, edit, onClose }: { group: CustomerGroup; edit?: PriceEntry; onClose: () => void }) {
  const products = useProducts();
  const [product, setProduct] = useState(edit?.product ?? "");
  const [variant, setVariant] = useState(edit?.variant ?? "");
  const [unit, setUnit] = useState(edit?.unit ?? "");
  const [rows, setRows] = useState<BreakRow[]>(() =>
    edit ? edit.breaks.map((b) => ({ id: ++rowId, from: String(b.from), price: String(b.price) })) : [{ id: ++rowId, from: "1", price: "" }],
  );
  const [error, setError] = useState("");

  const p = products.find((x) => x.name === product);
  const v = p?.variants.find((x) => x.name === variant);
  const units = v ? unitsOf(v) : [];
  const std = v && unit ? standardPrice(v, unit) : 0;

  const pickProduct = (name: string) => {
    const next = products.find((x) => x.name === name);
    const only = next && next.variants.length === 1 ? next.variants[0] : undefined;
    setProduct(name);
    setVariant(only?.name ?? "");
    setUnit(only ? unitsOf(only)[0]! : "");
    setError("");
  };
  const pickVariant = (name: string) => {
    const next = p?.variants.find((x) => x.name === name);
    setVariant(name);
    setUnit(next ? unitsOf(next)[0]! : "");
    setError("");
  };
  const setRow = (id: number, patch: Partial<BreakRow>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setError("");
  };

  const save = async () => {
    const entry: PriceEntry = { group: group.id, product, variant, unit, breaks: rows.map((r) => ({ from: Number(r.from), price: Number(r.price) })) };
    const r = await savePrice(entry, edit);
    if (r.ok) onClose();
    else setError(r.message);
  };
  const higher = std > 0 && rows.some((r) => Number(r.price) > std);

  return (
    <Drawer open title={edit ? "Edit price" : "Add price"} subtitle={`${CRUMB} · ${group.name} price list`} width={480} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <SearchSelect label="Product" noun="product" options={products.map((x) => x.name)} value={product} onChange={pickProduct} />
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <SearchSelect label="Product variant" noun="variant" options={(p?.variants ?? []).map((x) => x.name)} value={variant} onChange={pickVariant} />
          <SearchSelect
            label="Unit of measure"
            noun="unit"
            options={units}
            value={unit}
            onChange={(u) => {
              setUnit(u);
              setError("");
            }}
          />
        </div>
        {std > 0 && <div className="type-small text-text-secondary">Standard price: {kes(std)}</div>}
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="type-label mb-2 p-0 text-text">Prices by quantity</legend>
          {rows.map((r, i) => (
            <div key={r.id} className="grid items-end gap-2" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) 34px" }}>
              <Input label={i === 0 ? "From quantity" : undefined} aria-label="From quantity" type="number" min="1" step="1" value={r.from} onChange={(e) => setRow(r.id, { from: e.target.value })} />
              <Input label={i === 0 ? "Price (KES)" : undefined} aria-label="Price (KES)" type="number" min="0" value={r.price} onChange={(e) => setRow(r.id, { price: e.target.value })} />
              {rows.length > 1 ? <IconButton icon="trash-2" size="sm" label="Remove quantity break" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} /> : <span />}
            </div>
          ))}
          <div>
            <Button variant="secondary" size="sm" icon="plus" onClick={() => setRows((rs) => [...rs, { id: ++rowId, from: "", price: "" }])}>
              Add a quantity break
            </Button>
          </div>
        </fieldset>
        {higher && <div className="type-small text-warning-text">Higher than the standard price</div>}
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button disabled={!product || !variant || !unit} onClick={save}>
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
