"use client";

import { useMemo, useRef, useState } from "react";
import { addStock, sendStockToPurchases, useProducts, useSuppliers } from "@/data";
import { SupplierForm } from "@/features/suppliers";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { ItemRow, ItemsGrid, NotesField, StockDrawer, createStore, itemKey, splitKey, useOverlayParams, useStoreNames, useUnitOptions, useVariantLookup } from "./shared";

interface Row {
  key: string;
  qty: string;
  unit: string;
}

const COLS = "minmax(0,1.4fr) 100px minmax(0,1fr) 54px";

/** Mounts the Stock in drawer while `?action=stock` is set. */
export function StockInOverlay() {
  const { action, close } = useOverlayParams();
  return action === "stock" ? <StockInForm onClose={close} /> : null;
}

/** Design `isStockForm` ("Stock in"). */
export function StockInForm({ onClose }: { onClose: () => void }) {
  const suppliers = useSuppliers();
  /** Name typed into "New supplier" while the shared supplier form is open (null = closed). */
  const [newSupplier, setNewSupplier] = useState<string | null>(null);
  const stores = useStoreNames();
  const products = useProducts();
  const variants = useVariantLookup();
  const units = useUnitOptions();
  const [supplier, setSupplier] = useState("");
  const [store, setStore] = useState("Main Store");
  const [defQty, setDefQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [docs, setDocs] = useState<{ id: number; name: string }[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [direct, setDirect] = useState(false);
  const photo = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);

  const items = useMemo(() => products.flatMap((p) => variants.names(p.name).map((v) => itemKey(p.name, v))), [products, variants]);

  const pick = (key: string) => {
    const q = Number(defQty) > 0 ? Number(defQty) : 1;
    setRows((rs) => (rs.some((r) => r.key === key) ? rs.map((r) => (r.key === key ? { ...r, qty: String(Number(r.qty) + q) } : r)) : [...rs, { key, qty: String(q), unit: units.base }]));
  };
  const setRow = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addDocs = (list: FileList | null) => {
    const add = Array.from(list ?? []).map((f, i) => ({ id: Date.now() + i, name: f.name }));
    if (add.length) setDocs((d) => [...d, ...add]);
  };

  const blocked = !supplier || !store || rows.length === 0 || rows.some((r) => !(Number(r.qty) > 0));

  const submit = async () => {
    const input = { store, supplier, notes, items: rows.map((r) => ({ ...splitKey(r.key), qty: Number(r.qty), unit: r.unit })) };
    const res = direct ? await addStock(input) : await sendStockToPurchases(input);
    if (res.ok) onClose();
  };

  return (
    <>
    <StockDrawer title="Stock in" onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div className="type-title text-text">Storage details</div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) 130px" }}>
          <SearchSelect
            label="Supplier"
            noun="supplier"
            options={suppliers}
            value={supplier}
            onChange={setSupplier}
            onNew={(typed) => setNewSupplier(typed)}
          />
          <SearchSelect label="Destination store" noun="store" options={stores} value={store} onChange={setStore} onCreate={createStore} />
          <Input label="Default quantity" type="number" min={1} value={defQty} onChange={(e) => setDefQty(e.target.value)} />
        </div>
        <NotesField id="st-notes" label="Reference or notes" rows={2} placeholder="Enter a reference" value={notes} onChange={setNotes} />
        <div className="flex flex-col gap-2">
          <span className="type-label text-text">Documents (optional)</span>
          <span className="type-small text-text-muted">Add the delivery note or supplier invoice. It is saved to File Manager, in the Purchase folder.</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon="camera" onClick={() => photo.current?.click()}>
              Take a photo
            </Button>
            <Button variant="secondary" icon="upload" onClick={() => file.current?.click()}>
              Upload a file
            </Button>
            <input
              ref={photo}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => {
                addDocs(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              ref={file}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              multiple
              hidden
              onChange={(e) => {
                addDocs(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
              <span className="inline-flex text-text-muted">
                <Icon name="file-text" size={16} />
              </span>
              <span className="type-small min-w-0 flex-1 truncate text-text">{d.name}</span>
              <IconButton icon="trash-2" size="sm" label="Remove document" onClick={() => setDocs((ds) => ds.filter((x) => x.id !== d.id))} />
            </div>
          ))}
        </div>
        <div className="h-px bg-border" />
        <div>
          <div className="type-title text-text">Items to receive</div>
          <div className="type-small mt-0.5 text-text-muted">Search and add stock below.</div>
        </div>
        <SearchSelect label="Search items" noun="product" options={items} value="" onChange={pick} />
        <ItemsGrid
          columns={COLS}
          head={[{ label: "Product" }, { label: "Quantity" }, { label: "Unit of measure" }, { label: "Action", right: true }]}
          empty={
            rows.length === 0 && (
              <div className="type-small flex flex-col items-center gap-2 px-3 py-8 text-text-muted">
                <Icon name="package" size={18} />
                <span>No items added</span>
              </div>
            )
          }
        >
          {rows.map((r) => (
            <ItemRow key={r.key} columns={COLS}>
              <span className="type-label min-w-0 text-text [overflow-wrap:anywhere]">{r.key}</span>
              <Input size="sm" type="number" min={1} aria-label="Quantity" value={r.qty} onChange={(e) => setRow(r.key, { qty: e.target.value })} />
              <SearchSelect noun="unit" options={units.options} value={r.unit} onChange={(v) => setRow(r.key, { unit: v })} onCreate={units.create} />
              <div className="flex justify-end">
                <IconButton icon="trash-2" size="sm" label="Remove item" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} />
              </div>
            </ItemRow>
          ))}
        </ItemsGrid>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <Checkbox checked={direct} onChange={setDirect} label="Skip Purchases and add to stock now" />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={blocked} onClick={submit}>
              {direct ? "Add to stock" : "Send to Purchases"}
            </Button>
          </div>
        </div>
      </div>
    </StockDrawer>
    <SupplierForm
      open={newSupplier !== null}
      initialName={newSupplier ?? ""}
      crumb="Stock in"
      onClose={() => setNewSupplier(null)}
      onSaved={(name) => setSupplier(name)}
    />
    </>
  );
}
