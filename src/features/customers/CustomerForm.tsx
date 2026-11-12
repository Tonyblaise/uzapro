"use client";
/** New / edit customer (design `isCustNew`): Name, Phone, Email, Address, Save/Cancel. */
import { useState } from "react";
import { createCustomer, updateCustomer, type Customer } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";

const blank = (v: string | undefined) => (v && v !== "—" ? v : "");

export function CustomerForm({
  open,
  edit,
  initialName = "",
  crumb = "Customers",
  onClose,
  onSaved,
}: {
  open: boolean;
  /** The customer being edited, if any. */
  edit?: Customer;
  initialName?: string;
  crumb?: string;
  onClose: () => void;
  onSaved?: (name: string) => void;
}) {
  if (!open) return null;
  return <CustomerFormBody key={edit?.name ?? `new:${initialName}`} edit={edit} initialName={initialName} crumb={crumb} onClose={onClose} onSaved={onSaved} />;
}

function CustomerFormBody({ edit, initialName, crumb, onClose, onSaved }: { edit?: Customer; initialName: string; crumb: string; onClose: () => void; onSaved?: (name: string) => void }) {
  const [name, setName] = useState(edit?.name ?? initialName);
  const [phone, setPhone] = useState(blank(edit?.phone));
  const [email, setEmail] = useState(blank(edit?.email));
  const [address, setAddress] = useState(blank(edit?.address));

  const save = async () => {
    const input = { name, phone, email, address };
    const r = edit ? await updateCustomer(edit.name, input) : await createCustomer(input);
    if (r.ok) {
      onSaved?.(r.value.name);
      onClose();
    }
  };

  return (
    <Drawer open title={edit ? "Edit customer" : "New customer"} subtitle={crumb} onClose={onClose} width={440}>
      <div className="flex flex-col gap-4">
        <Input label="Name" placeholder="Enter a name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Phone number (optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
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
