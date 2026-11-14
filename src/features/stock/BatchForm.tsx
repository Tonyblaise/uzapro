"use client";
/** Record a batch (feature 016, contracts/ui.md): put stock on hand into a batch with an expiry date. */
import { useState } from "react";
import { recordBatch, useProducts, useUnbatched } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { useStoreNames } from "./shared";

export function BatchForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <Body onClose={onClose} />;
}

function Body({ onClose }: { onClose: () => void }) {
  const products = useProducts();
  const stores = useStoreNames();
  const [product, setProduct] = useState("");
  const [store, setStore] = useState("");
  const [batch, setBatch] = useState("");
  const [expiry, setExpiry] = useState("");
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const free = useUnbatched(product, store);
  const clear = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setError("");
  };

  const save = async () => {
    const r = await recordBatch({ product, store, batch, expiry, qty: qty === "" ? NaN : Number(qty) });
    if (r.ok) onClose();
    else setError(r.message);
  };

  return (
    <Drawer open title="Record batch" subtitle="Stock" width={460} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <SearchSelect label="Product" noun="product" options={products.map((p) => p.name)} value={product} onChange={clear(setProduct)} />
        <SearchSelect label="Store" noun="store" options={stores} value={store} onChange={clear(setStore)} />
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <Input label="Batch number" placeholder="For example, MP-2411" value={batch} onChange={(e) => clear(setBatch)(e.target.value)} />
          <Input label="Expiry date" type="date" value={expiry} onChange={(e) => clear(setExpiry)(e.target.value)} />
        </div>
        <Input
          label="Quantity"
          type="number"
          min="1"
          step="1"
          hint={product && store ? `${free} not in a batch yet, in the base unit` : "In the base unit"}
          value={qty}
          onChange={(e) => clear(setQty)(e.target.value)}
        />
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button disabled={!product || !store} onClick={save}>
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
