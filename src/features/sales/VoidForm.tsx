"use client";
/** Void sale (design `isVoidForm`): reason from `UZ_VOID`, "Void sale" / Cancel. */
import { useState } from "react";
import { UZ_VOID, voidSale } from "@/data";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";

let extraReasons: string[] = [];

export function VoidForm({ refId, label, amount, onClose, onDone }: { refId: string; label: string; amount: string; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [reasons, setReasons] = useState(() => [...UZ_VOID, ...extraReasons]);
  const save = async () => {
    const r = await voidSale(refId, reason);
    if (r.ok) onDone();
  };
  return (
    <Drawer open title="Void sale" subtitle="Sales" onClose={onClose} width={440}>
      <div className="flex flex-col gap-4">
        <div className="type-body text-text-secondary">
          This cancels {label} for KES {amount} and moves it to Voided items. It stays on record.
        </div>
        <SearchSelect
          label="Reason"
          noun="reason"
          options={reasons}
          value={reason}
          onChange={setReason}
          onCreate={(name) => {
            extraReasons = [...extraReasons, name];
            setReasons((r) => [...r, name]);
            return name;
          }}
        />
        <div className="flex gap-2">
          <Button variant="danger" disabled={!reason} onClick={save}>
            Void sale
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
