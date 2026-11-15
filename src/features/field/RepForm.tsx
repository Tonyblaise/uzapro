"use client";
/** New sales rep / Edit sales rep (design `fr`): name, phone, route, vehicle and On route. */
import { useState } from "react";
import { saveFieldRep, type FieldRep } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";

export function RepForm({ edit, onClose }: { edit?: FieldRep; onClose: () => void }) {
  const [name, setName] = useState(edit?.name ?? "");
  const [phone, setPhone] = useState(edit?.phone ?? "");
  const [route, setRoute] = useState(edit?.route ?? "");
  const [vehicle, setVehicle] = useState(edit && edit.vehicle !== "—" ? edit.vehicle : "");
  const [active, setActive] = useState(edit?.active !== false);
  const [err, setErr] = useState("");
  const u = <T,>(set: (v: T) => void) => (v: T) => (set(v), setErr(""));

  const save = async () => {
    const r = await saveFieldRep({ name, phone, route, vehicle, active }, edit?.name);
    if (r.ok) onClose();
    else setErr(r.message);
  };

  return (
    <Modal
      open
      title={edit ? "Edit sales rep" : "New sales rep"}
      subtitle="Reps take orders on the road. They can also drive deliveries."
      onClose={onClose}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" onClick={() => void save()}>
            {edit ? "Save" : "Add rep"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Full name" placeholder="For example, Brian Mutua" value={name} onChange={(e) => u(setName)(e.target.value)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Phone number" placeholder="07XX XXX XXX" value={phone} onChange={(e) => u(setPhone)(e.target.value)} />
          <Input label="Route or area" placeholder="For example, Thika Road" value={route} onChange={(e) => u(setRoute)(e.target.value)} />
        </div>
        <Input label="Vehicle (optional)" placeholder="For example, KDA 412M · van" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3.5 py-3">
          <span className="flex-1">
            <span className="type-label block text-text">On route</span>
            <span className="type-small block text-text-secondary">Turn off when the rep is away. They stay in the list.</span>
          </span>
          <input type="checkbox" role="switch" aria-checked={active} aria-label="On route" checked={active} onChange={() => setActive((a) => !a)} className="uz-switch" />
        </label>
        {err && (
          <div role="alert" className="type-small text-danger-text">
            {err}
          </div>
        )}
      </div>
    </Modal>
  );
}
