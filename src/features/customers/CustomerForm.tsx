"use client";
/**
 * New / edit customer (design `isCustNew`): Name, Phone, Email, Address, Save/Cancel.
 * Feature 012 adds Customer group, Credit limit and Payment terms, and a Credit panel when editing.
 */
import { useState } from "react";
import Link from "next/link";
import { PAY_TERMS, RETAIL_GROUP, WALK_IN, createCustomer, creditFlag, updateCustomer, useCreditPosition, useCustomerGroups, type Customer, type PayTerms } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { kes } from "@/lib/format";

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
  const groups = useCustomerGroups();
  const [name, setName] = useState(edit?.name ?? initialName);
  const [phone, setPhone] = useState(blank(edit?.phone));
  const [email, setEmail] = useState(blank(edit?.email));
  const [address, setAddress] = useState(blank(edit?.address));
  const [group, setGroup] = useState(edit?.group ?? RETAIL_GROUP);
  const [limit, setLimit] = useState(edit?.creditLimit == null ? "" : String(edit.creditLimit));
  const [terms, setTerms] = useState<PayTerms>(edit?.terms ?? "30 days");
  const [limitErr, setLimitErr] = useState("");
  const walkIn = edit?.name === WALK_IN;

  const save = async () => {
    const creditLimit = limit.trim() === "" ? null : Number(limit);
    if (!walkIn && creditLimit !== null && !(Number.isFinite(creditLimit) && creditLimit >= 0)) {
      setLimitErr("Enter an amount of 0 or more");
      return;
    }
    const input = { name, phone, email, address, ...(walkIn ? {} : { group, creditLimit, terms }) };
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
        {walkIn ? (
          <Input label="Customer group" value="Retail" disabled readOnly hint="Walk-in customers always pay standard prices." />
        ) : (
          <>
            {edit && <CreditPanel customer={edit.name} />}
            <SearchSelect label="Customer group" noun="group" options={groups.map((g) => ({ value: g.id, label: g.name }))} value={group} onChange={setGroup} />
            <Input
              label="Credit limit (KES) (optional)"
              type="number"
              min="0"
              inputMode="decimal"
              hint="Leave blank for no limit"
              error={limitErr || undefined}
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value);
                setLimitErr("");
              }}
            />
            <SearchSelect label="Payment terms" noun="terms" options={PAY_TERMS} value={terms} onChange={(v) => setTerms(v as PayTerms)} />
          </>
        )}
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

/** Limit, balance owed, available credit, terms and overdue, from the customer's receivables. */
function CreditPanel({ customer }: { customer: string }) {
  const p = useCreditPosition(customer);
  if (!p) return null;
  const flag = creditFlag(p);
  const rows: [string, string][] = [
    ["Credit limit", p.limit === null ? "No limit" : kes(p.limit)],
    ["Balance owed", kes(p.owed)],
    ["On order, not yet invoiced", kes(p.onOrder)],
    ["Available credit", p.available === null ? "No limit" : kes(p.available)],
    ["Payment terms", p.terms],
    ["Overdue", p.overdue ? kes(p.overdue) : "None"],
  ];
  return (
    <section aria-label="Credit" className="flex flex-col rounded-md bg-canvas p-4">
      <div className="flex items-center justify-between gap-2 pb-1">
        <h3 className="type-card-title m-0 text-text">Credit</h3>
        {flag && <StatusPill tone={flag === "Overdue" ? "danger" : "warning"}>{flag}</StatusPill>}
      </div>
      <dl className="m-0 flex flex-col">
        {rows.map(([k, v]) => (
          <div key={k} className="type-small flex justify-between gap-4 border-b border-border py-2">
            <dt className="text-text-secondary">{k}</dt>
            <dd className="u-num m-0 text-right text-text">{v}</dd>
          </div>
        ))}
      </dl>
      <Link href="/receivables/receivables" className="type-small pt-2 text-green-700 underline">
        See what {customer} owes
      </Link>
    </section>
  );
}
