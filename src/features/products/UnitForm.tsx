"use client";

import { useState } from "react";
import { createUnit, toast, updateUnit } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { CRUMB } from "./shared";

/** Design `isUnitForm` (drawer 440): "Unit name", Save, Cancel. Title "New unit" / "Edit unit". */
export function UnitForm({ open, edit, onClose }: { open: boolean; edit?: string; onClose: () => void }) {
  if (!open) return null;
  return <UnitFormBody key={edit ?? "new"} edit={edit} onClose={onClose} />;
}

function UnitFormBody({ edit, onClose }: { edit?: string; onClose: () => void }) {
  const [name, setName] = useState(edit ?? "");
  const save = async () => {
    const res = edit ? await updateUnit(edit, name) : await createUnit(name);
    if (!res.ok) {
      toast(res.message);
      return;
    }
    onClose();
  };
  return (
    <Drawer open title={edit ? "Edit unit" : "New unit"} subtitle={CRUMB} width={440} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input label="Unit name" placeholder="For example, Bottle" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <Button disabled={!name.trim()} onClick={save}>
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
