"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

/**
 * Port of the design's `window.UzForms.SearchSelect` (design/canvas/erp-data.js):
 * a searchable picker with an optional "New {noun}" footer that creates an option.
 */
export interface SearchSelectProps {
  label?: string;
  options: readonly (string | { value: string; label: string })[];
  value: string;
  onChange: (value: string) => void;
  /** Create a new option from a typed name; return the value to select. */
  onCreate?: (name: string) => string | void;
  /** Open a full "new" form instead of inline create. */
  onNew?: (typed: string) => void;
  noun?: string;
  placeholder?: string;
}

export function SearchSelect({ label, options, value, onChange, onCreate, onNew, noun = "item", placeholder = "Choose" }: SearchSelectProps) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const labelId = useId();

  const close = () => {
    setOpen(false);
    setQ("");
    setAdding(false);
    setName("");
    setActive(0);
  };
  const pick = (v: string) => {
    onChange(v);
    close();
    btn.current?.focus();
  };
  const create = (n: string) => {
    const t = n.trim();
    if (!t || !onCreate) return;
    const v = onCreate(t);
    pick(typeof v === "string" ? v : t);
  };

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const down = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  const needle = q.trim().toLowerCase();
  const shown = opts.filter((o) => !needle || o.label.toLowerCase().includes(needle));
  const sel = opts.find((o) => o.value === value);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = shown[active];
      if (o) pick(o.value);
    }
  };

  return (
    <div ref={root} className="relative flex min-w-0 flex-col gap-1.5">
      {label && (
        <span id={labelId} className="type-label text-text">
          {label}
        </span>
      )}
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : noun}
        onClick={() => (open ? close() : setOpen(true))}
        className={`type-body flex h-[var(--control-height)] w-full items-center justify-between gap-2 rounded-md border bg-surface pl-3 pr-2.5 text-left text-text ${open ? "border-action shadow-[0_0_0_3px_var(--green-100)]" : "border-border-strong"}`}
      >
        <span className={`truncate ${sel ? "" : "text-text-muted"}`}>{sel ? sel.label : placeholder}</span>
        <span className="text-text-muted">
          <Icon name="chevron-down" size={16} />
        </span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-[150] mt-1 overflow-hidden rounded-md bg-surface shadow-lg">
          <div className="border-b border-border p-2">
            <input
              ref={search}
              value={q}
              placeholder="Search"
              aria-label={`Search ${label || "options"}`}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
              className="type-body h-[var(--control-height-sm)] w-full rounded-sm border border-border-strong bg-surface px-2 text-text outline-none"
            />
          </div>
          <div role="listbox" className="max-h-[216px] overflow-y-auto p-1">
            {shown.length ? (
              shown.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o.value)}
                  className={`type-body flex w-full items-center justify-between gap-2 rounded-sm p-2 text-left text-text ${i === active ? "bg-surface-hover" : ""}`}
                >
                  <span className="truncate">{o.label}</span>
                  {o.value === value && (
                    <span className="text-action">
                      <Icon name="check" size={16} />
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="type-small p-2 text-text-muted">No matches.</div>
            )}
          </div>
          {(onCreate || onNew) &&
            (adding ? (
              <div className="flex gap-2 border-t border-border p-2">
                <input
                  autoFocus
                  value={name}
                  placeholder={`Name of new ${noun}`}
                  aria-label={`Name of new ${noun}`}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      create(name);
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      setAdding(false);
                    }
                  }}
                  className="type-body h-[var(--control-height-sm)] min-w-0 flex-1 rounded-sm border border-border-strong bg-surface px-2 text-text outline-none"
                />
                <Button size="sm" disabled={!name.trim()} onClick={() => create(name)}>
                  Add
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const t = q.trim();
                  if (onNew) {
                    close();
                    onNew(t);
                  } else if (t) create(t);
                  else setAdding(true);
                }}
                className="type-label flex w-full items-center gap-2 border-t border-border p-3 text-left text-link"
              >
                <Icon name="plus" size={16} />
                <span className="truncate">{q.trim() ? `New ${noun}: ${q.trim()}` : `New ${noun}`}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
