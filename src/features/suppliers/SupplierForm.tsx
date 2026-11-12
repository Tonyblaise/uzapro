"use client";
/**
 * New / edit supplier (design `isSupForm`): Essential details (Supplier type, name, phone, email,
 * Nationality, "Supplier is active"), Address info, Cancel / "Create supplier" | "Save changes".
 * Reused by the purchase order form and Stock in via `@/features/suppliers` ("New supplier").
 */
import { useState } from "react";
import { addNation, saveSupplier, useNations, type Supplier, type SupplierType } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";

const blank = (v: string | undefined) => (v && v !== "—" ? v : "");

export function SupplierForm({
  open,
  edit,
  initialName = "",
  crumb = "Suppliers",
  onClose,
  onSaved,
}: {
  open: boolean;
  edit?: Supplier;
  initialName?: string;
  crumb?: string;
  onClose: () => void;
  /** Called with the saved name (the calling form selects it, as the design's `d.prev` return does). */
  onSaved?: (name: string) => void;
}) {
  if (!open) return null;
  return <Body key={edit?.name ?? `new:${initialName}`} edit={edit} initialName={initialName} crumb={crumb} onClose={onClose} onSaved={onSaved} />;
}

function Body({ edit, initialName, crumb, onClose, onSaved }: { edit?: Supplier; initialName: string; crumb: string; onClose: () => void; onSaved?: (name: string) => void }) {
  const nations = useNations();
  const [type, setType] = useState<SupplierType>(edit?.type ?? "Business");
  const [name, setName] = useState(edit?.name ?? initialName);
  const [phone, setPhone] = useState(blank(edit?.phone));
  const [email, setEmail] = useState(blank(edit?.email));
  const [nation, setNation] = useState(edit?.nation ?? "Kenya");
  const [active, setActive] = useState(edit ? edit.status.label === "Active" : true);
  const [address, setAddress] = useState(edit?.address ?? "");
  const [town, setTown] = useState(blank(edit?.town));
  const [county, setCounty] = useState(edit?.county ?? "");
  const [postal, setPostal] = useState(edit?.postal ?? "");

  const save = async () => {
    const r = await saveSupplier({ name, type, phone, email, town, nation, address, county, postal, active }, edit?.name);
    if (r.ok) {
      onSaved?.(r.value.name);
      onClose();
    }
  };

  return (
    <Drawer open title={edit ? "Edit supplier" : "New supplier"} subtitle={crumb} onClose={onClose} width={760}>
      <div className="flex flex-col gap-4">
        <div className="type-title text-text">Essential details</div>
        <div role="radiogroup" aria-label="Supplier type" className="flex flex-col gap-2 rounded-md bg-canvas px-4 py-3">
          <span className="type-label text-text">Supplier type</span>
          <div className="type-body flex flex-wrap gap-5 text-text">
            {(
              [
                ["Individual", "Individual person"],
                ["Business", "Registered business"],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className="inline-flex cursor-pointer items-center gap-2">
                <input type="radio" name="sup-type" checked={type === v} onChange={() => setType(v)} className="accent-[var(--action)]" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <Input label={type === "Individual" ? "Full name" : "Registered business name"} placeholder="Enter a name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Primary phone (optional)" type="tel" placeholder="+254 712 123456" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Primary email (optional)" type="email" placeholder="supplier@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <SearchSelect label="Nationality" noun="nationality" options={nations} value={nation} onChange={setNation} onCreate={addNation} />
          <label className="type-body inline-flex cursor-pointer items-center gap-2 self-end pb-2 text-text">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[var(--action)]" />
            <span>Supplier is active</span>
          </label>
        </div>
        <div className="h-px bg-border" />
        <div className="type-title text-text">Address info</div>
        <Input label="Street or building (optional)" placeholder="For example, Mombasa Road, Unit 4" value={address} onChange={(e) => setAddress(e.target.value)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Town or city (optional)" value={town} onChange={(e) => setTown(e.target.value)} />
          <Input label="County (optional)" value={county} onChange={(e) => setCounty(e.target.value)} />
          <Input label="Postal address (optional)" value={postal} onChange={(e) => setPostal(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!name.trim()} onClick={save}>
            {edit ? "Save changes" : "Create supplier"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
