"use client";
/** Building blocks shared by the Integrations screens (feature 015, contracts/ui.md). */
import { useId, useState, type ReactNode } from "react";
import { copyText, type ScopeOption } from "@/data";
import { Field, Input, Select, type InputProps } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { StatusPill } from "@/components/ui/StatusPill";

export const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2";

export interface Step {
  label: string;
  done: boolean;
}

/** A tab's own heading: what it connects, and how far set-up has got. */
export function SectionHead({ title, children, steps }: { title: string; children: ReactNode; steps: Step[] }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="type-title m-0 text-text">{title}</h2>
        <p className="type-body m-0 mt-1 text-text-muted">{children}</p>
      </div>
      <ul aria-label="Set-up status" className="m-0 flex list-none flex-wrap gap-2 p-0">
        {steps.map((s) => (
          <li key={s.label}>
            <StatusPill tone={s.done ? "success" : "neutral"}>
              {s.label}
              <span className="sr-only">{s.done ? ": done" : ": not yet"}</span>
            </StatusPill>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScopeSelect({ value, options, error, onChange }: { value: string; options: ScopeOption[]; error?: string; onChange: (value: string) => void }) {
  return (
    <div className="max-w-[360px]">
      <Select
        label="Applies to"
        required
        value={value}
        error={error}
        hint="Terminals without their own credentials use the business-wide ones."
        options={[{ value: "", label: "Choose what this applies to" }, ...options]}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** A secret the business types in. Once saved it is never shown again; typing replaces it. */
export function SecretInput({ label, saved, ...rest }: Omit<InputProps, "type" | "suffix"> & { label: string; saved: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <Input
      label={label}
      type={show ? "text" : "password"}
      autoComplete="off"
      placeholder={saved ? "Saved. Type a new one to replace it" : label}
      suffix={
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={`${show ? "Hide" : "Show"} ${label}`} className="type-label bg-transparent p-0 text-action">
          {show ? "Hide" : "Show"}
        </button>
      }
      {...rest}
    />
  );
}

/** A value UzaPro created for the business, with a copy button. Secret values stay hidden but still copy. */
export function CopyField({ label, value, secret, hint }: { label: string; value?: string; secret?: boolean; hint?: ReactNode }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="flex items-center gap-2">
        <Input id={id} readOnly value={value ? (secret ? "••••••••••••" : value) : ""} placeholder="Created when you save" boxClassName="bg-grey-50" />
        <IconButton icon="copy" variant="secondary" label={`Copy ${label}`} disabled={!value} className="flex-none disabled:opacity-45" onClick={() => value && void copyText(value, `${label} copied.`)} />
      </div>
    </Field>
  );
}

export function FormError({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div role="alert" className="type-small text-danger-text">
      {text}
    </div>
  );
}
