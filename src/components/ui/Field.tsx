"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

/** Label + control + hint/error (DS Field). */
export function Field({ label, hint, error, htmlFor, children }: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="type-label text-text">
          {label}
        </label>
      )}
      {children}
      {(error || hint) && <div className={`type-caption ${error ? "text-danger-text" : "text-text-muted"}`}>{error || hint}</div>}
    </div>
  );
}

const CONTROL =
  "w-full min-w-0 rounded-md border border-border-strong bg-surface text-text type-body outline-none transition-shadow duration-[120ms] focus-within:border-action focus-within:shadow-[0_0_0_3px_var(--green-100)]";

const HEIGHT = { sm: "h-[var(--control-height-sm)]", md: "h-[var(--control-height)]", lg: "h-[var(--control-height-lg)]" };

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  icon?: IconName;
  suffix?: ReactNode;
  size?: "sm" | "md" | "lg";
  boxClassName?: string;
}

export function Input({ label, hint, error, icon, suffix, size = "md", id, boxClassName = "", disabled, ...rest }: InputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const box = (
    <div className={`${CONTROL} ${HEIGHT[size]} flex items-center gap-2 px-3 text-text-muted ${error ? "border-danger" : ""} ${disabled ? "bg-grey-50" : ""} ${boxClassName}`}>
      {icon && <Icon name={icon} size={16} />}
      <input id={inputId} disabled={disabled} aria-invalid={error ? true : undefined} className="type-body h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-text outline-none" {...rest} />
      {suffix && <span className="type-small text-text-muted">{suffix}</span>}
    </div>
  );
  if (!label && !hint && !error) return box;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId}>
      {box}
    </Field>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function Textarea({ label, hint, error, id, rows = 3, ...rest }: TextareaProps) {
  const auto = useId();
  const tid = id ?? auto;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={tid}>
      <textarea id={tid} rows={rows} className={`${CONTROL} px-3 py-2 ${error ? "border-danger" : ""}`} {...rest} />
    </Field>
  );
}

export type Option = string | { value: string; label: string };

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: readonly Option[];
  size?: "sm" | "md" | "lg";
}

export function Select({ label, hint, error, options, size = "md", id, className = "", ...rest }: SelectProps) {
  const auto = useId();
  const sid = id ?? auto;
  const box = (
    <div className={`relative ${className}`}>
      <select id={sid} className={`${CONTROL} ${HEIGHT[size]} appearance-none pl-3 pr-9 ${error ? "border-danger" : ""}`} {...rest}>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
        <Icon name="chevron-down" size={16} />
      </span>
    </div>
  );
  if (!label && !hint && !error) return box;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={sid}>
      {box}
    </Field>
  );
}

/** DS Checkbox: real input (visually hidden) + custom box. */
export function Checkbox({ checked, onChange, label, disabled, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; disabled?: boolean; hint?: ReactNode }) {
  return (
    <label className={`inline-flex items-start gap-2 ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden="true"
        className={`mt-0.5 grid size-4 flex-none place-items-center rounded border text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)] ${checked ? "border-action bg-action" : "border-border-strong bg-surface"}`}
      >
        {checked && <Icon name="check" size={12} stroke={2} />}
      </span>
      <span className="flex flex-col">
        <span className="type-body text-text">{label}</span>
        {hint && <span className="type-caption text-text-muted">{hint}</span>}
      </span>
    </label>
  );
}
