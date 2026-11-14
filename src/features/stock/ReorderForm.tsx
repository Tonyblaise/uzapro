"use client";
/** Set / edit a reorder point (feature 014, contracts/ui.md › Stock › Reorder). */
import { useState } from "react";
import { saveReorderRule, unitFactor, unitsOf, useProducts, useSuppliers, type ReorderRule } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { useStoreNames } from "./shared";

const NO_SUPPLIER = "No supplier";

export function ReorderForm({ open, edit, onClose }: { open: boolean; edit?: ReorderRule; onClose: () => void }) {
  if (!open) return null;
  return <Body key={edit ? `${edit.product}|${edit.store}` : "new"} edit={edit} onClose={onClose} />;
}

function Body({ edit, onClose }: { edit?: ReorderRule; onClose: () => void }) {
  const products = useProducts();
  const stores = useStoreNames();
  const suppliers = useSuppliers();
  const [product, setProduct] = useState(edit?.product ?? "");
  const [variant, setVariant] = useState(edit?.variant ?? "");
  const [store, setStore] = useState(edit?.store ?? "");
  const [min, setMin] = useState(edit ? String(edit.min) : "");
  const [max, setMax] = useState(edit ? String(edit.max) : "");
  const [unit, setUnit] = useState(edit?.unit ?? "");
  const [supplier, setSupplier] = useState(edit?.supplier || NO_SUPPLIER);
  const [error, setError] = useState("");

  const p = products.find((x) => x.name === product);
  const v = p?.variants.find((x) => x.name === variant);
  const units = v ? unitsOf(v) : [];
  const base = units[0] ?? "Piece";
  const factor = v && unit ? unitFactor(products, product, variant, unit) : 1;

  const pickProduct = (name: string) => {
    const next = products.find((x) => x.name === name);
    const first = next?.variants[0];
    setProduct(name);
    setVariant(first?.name ?? "");
    setUnit(first ? unitsOf(first)[0]! : "");
    setError("");
  };
  const pickVariant = (name: string) => {
    const next = p?.variants.find((x) => x.name === name);
    setVariant(name);
    setUnit(next ? unitsOf(next)[0]! : "");
    setError("");
  };
  const typed = (set: (v: string) => void) => (e: { target: { value: string } }) => {
    set(e.target.value);
    setError("");
  };

  const save = async () => {
    const rule: ReorderRule = { product, variant, store, min: min === "" ? NaN : Number(min), max: max === "" ? NaN : Number(max), unit, supplier: supplier === NO_SUPPLIER ? "" : supplier };
    const r = await saveReorderRule(rule, edit ? { product: edit.product, store: edit.store } : undefined);
    if (r.ok) onClose();
    else setError(r.message);
  };

  return (
    <Drawer open title={edit ? "Edit reorder point" : "Set reorder point"} subtitle="Stock" width={480} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <SearchSelect label="Product" noun="product" options={products.map((x) => x.name)} value={product} onChange={pickProduct} />
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <SearchSelect label="Variant to order" noun="variant" options={(p?.variants ?? []).map((x) => x.name)} value={variant} onChange={pickVariant} />
          <SearchSelect
            label="Store"
            noun="store"
            options={stores}
            value={store}
            onChange={(s) => {
              setStore(s);
              setError("");
            }}
          />
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <Input label="Reorder at" type="number" min="0" step="1" hint={`In ${base}. Reorder when stock is at or below this.`} value={min} onChange={typed(setMin)} />
          <Input label="Order up to" type="number" min="1" step="1" hint={`In ${base}. Order enough to reach this.`} value={max} onChange={typed(setMax)} />
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <div className="flex flex-col gap-1">
            <SearchSelect
              label="Order unit"
              noun="unit"
              options={units}
              value={unit}
              onChange={(u) => {
                setUnit(u);
                setError("");
              }}
            />
            {factor > 1 && (
              <span className="type-caption text-text-muted">
                1 {unit} is {factor} {base}. Orders are rounded up to whole {unit}.
              </span>
            )}
          </div>
          <SearchSelect label="Supplier (optional)" noun="supplier" options={[NO_SUPPLIER, ...suppliers]} value={supplier} onChange={setSupplier} />
        </div>
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button disabled={!product || !variant || !store} onClick={save}>
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
