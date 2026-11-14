"use client";
/** New stock count (feature 017): pick a store and the products to count there. */
import { useState } from "react";
import { startCount, useCountableProducts } from "@/data";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { num } from "@/lib/format";
import { useStoreNames } from "./shared";

export function CountForm({ open, onClose, onStarted }: { open: boolean; onClose: () => void; onStarted: (ref: string) => void }) {
  if (!open) return null;
  return <Body onClose={onClose} onStarted={onStarted} />;
}

function Body({ onClose, onStarted }: { onClose: () => void; onStarted: (ref: string) => void }) {
  const stores = useStoreNames();
  const [store, setStore] = useState("");
  const here = useCountableProducts(store);
  /** Products left out of the count; everything else at the store is counted. */
  const [skip, setSkip] = useState<string[]>([]);
  const [error, setError] = useState("");
  const picked = here.filter((p) => !skip.includes(p.product));

  const start = async () => {
    const r = await startCount(store, picked.map((p) => p.product));
    if (r.ok) onStarted(r.value.ref);
    else setError(r.message);
  };

  return (
    <Drawer open title="New stock count" subtitle="Stock" width={460} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <SearchSelect
          label="Store"
          noun="store"
          options={stores}
          value={store}
          onChange={(s) => {
            setStore(s);
            setSkip([]);
            setError("");
          }}
        />
        {store && (
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="type-label mb-2 p-0 text-text">Products to count</legend>
            {here.length === 0 ? (
              <p className="type-small m-0 text-text-muted">Nothing is in stock at {store}.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setSkip([])}>
                    Tick all
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setSkip(here.map((p) => p.product))}>
                    Untick all
                  </Button>
                </div>
                {here.map((p) => (
                  <Checkbox
                    key={p.product}
                    checked={!skip.includes(p.product)}
                    onChange={(on) => {
                      setSkip((s) => (on ? s.filter((x) => x !== p.product) : [...s, p.product]));
                      setError("");
                    }}
                    label={p.product}
                    hint={`System: ${num(p.quantity)}`}
                  />
                ))}
                <p className="type-small m-0 text-text-secondary">
                  {picked.length === here.length ? "Full count" : "Partial count"}: {picked.length} of {here.length} products.
                </p>
              </>
            )}
          </fieldset>
        )}
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button disabled={!store || picked.length === 0} onClick={start}>
            Start count
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
