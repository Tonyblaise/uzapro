"use client";
/**
 * New stock count (design `sc.newOpen`): the store, everything or one category, who is counting,
 * and whether it is a blind count. "Start counting" opens the count.
 */
import { useState } from "react";
import { startCount, useCountSetup, useCurrentUserName } from "@/data";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";

const SCOPES: ["all" | "cat", string, string][] = [
  ["all", "Everything", "Every product in this store"],
  ["cat", "One category", "A quick cycle count"],
];

export function CountForm({ open, onClose, onStarted }: { open: boolean; onClose: () => void; onStarted: (ref: string) => void }) {
  if (!open) return null;
  return <Body onClose={onClose} onStarted={onStarted} />;
}

function Body({ onClose, onStarted }: { onClose: () => void; onStarted: (ref: string) => void }) {
  const me = useCurrentUserName();
  const [store, setStore] = useState("Main Store");
  const [scope, setScope] = useState<"all" | "cat">("all");
  const [category, setCategory] = useState("");
  const [by, setBy] = useState(me);
  const [blind, setBlind] = useState(true);
  const [error, setError] = useState("");
  const setup = useCountSetup(scope === "cat" ? category : null);
  const clear = () => setError("");

  const start = async () => {
    const r = await startCount({ store, scope, category, by, blind });
    if (r.ok) onStarted(r.value.ref);
    else setError(r.message);
  };

  return (
    <Modal
      open
      title="New stock count"
      subtitle="Count what is on the shelves and compare it with the system"
      onClose={onClose}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="clipboard-list" onClick={() => void start()}>
            Start counting
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SearchSelect label="Store to count" noun="store" options={setup.stores} value={store} onChange={(v) => (setStore(v), clear())} />
        <div className="flex flex-col gap-2">
          <span className="type-label text-text">What to count</span>
          <div role="group" aria-label="What to count" className="grid grid-cols-2 gap-2">
            {SCOPES.map(([k, label, sub]) => (
              <button
                key={k}
                type="button"
                aria-pressed={scope === k}
                onClick={() => (setScope(k), clear())}
                className={`flex flex-col items-start gap-0.5 rounded-md border-2 p-3 text-left ${scope === k ? "border-green-600 bg-green-50" : "border-border bg-surface"}`}
              >
                <span className="type-label text-text">{label}</span>
                <span className="type-small text-text-muted">{sub}</span>
              </button>
            ))}
          </div>
        </div>
        {scope === "cat" && <SearchSelect label="Category" noun="category" options={setup.categories} value={category} onChange={(v) => (setCategory(v), clear())} />}
        <SearchSelect label="Counted by" noun="person" options={setup.staff} value={by} onChange={(v) => (setBy(v), clear())} />
        <label className="flex items-start gap-3">
          <input type="checkbox" role="switch" aria-checked={blind} checked={blind} onChange={() => setBlind((b) => !b)} className="uz-switch" />
          <span>
            <span className="type-label block text-text">Blind count</span>
            <span className="type-small block text-text-muted">Hide the system quantity while counting, so people count what they see.</span>
          </span>
        </label>
        <div className="type-small rounded-md bg-canvas p-3 text-text-secondary">
          {scope === "cat" && !category ? 0 : setup.lines} lines to count in {store || "the store"}. Stock movements in this store still work while you count.{" "}
          {blind ? "Counters won't see the system quantity." : "Counters will see the system quantity."}
        </div>
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
