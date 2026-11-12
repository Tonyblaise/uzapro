"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: IconName;
  danger?: boolean;
  disabled?: boolean;
}

/** Icons the design's RowActions uses for known labels. */
const ROW_ICONS: Record<string, IconName> = {
  View: "eye",
  Edit: "pencil",
  Approve: "circle-check",
  "Download PDF": "download",
  Delete: "trash-2",
  "Cancel transfer": "trash-2",
  "Mark as received": "circle-check",
  Undo: "refresh-cw",
  "Void sale": "circle-alert",
};

export function MenuList({ items, onPick }: { items: MenuItem[]; onPick?: () => void }) {
  return (
    <div role="menu" className="min-w-[180px] rounded-md border border-border bg-surface p-1 shadow-lg">
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          role="menuitem"
          disabled={it.disabled}
          onClick={() => {
            onPick?.();
            it.onClick();
          }}
          className={`type-body flex h-[34px] w-full items-center gap-2 rounded-sm px-2.5 text-left disabled:opacity-45 ${it.danger ? "text-danger-text hover:bg-danger-soft" : "text-text hover:bg-grey-100"}`}
        >
          {(it.icon ?? ROW_ICONS[it.label]) && <Icon name={(it.icon ?? ROW_ICONS[it.label])!} size={16} />}
          <span className="flex-1">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Dropdown menu anchored to a trigger. Closes on outside click and Escape. */
export function Menu({ trigger, items, align = "right", label }: { trigger: (props: { open: boolean; toggle: () => void }) => ReactNode; items: MenuItem[]; align?: "left" | "right"; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", esc);
    ref.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus();
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative inline-block" aria-label={label}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={`absolute top-[calc(100%+4px)] z-20 ${align === "right" ? "right-0" : "left-0"}`}>
          <MenuList items={items} onPick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

/** The design's row "…" actions (window.UzForms.RowActions). */
export function RowActions({ items, label = "Actions" }: { items: MenuItem[]; label?: string }) {
  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Menu
        items={items}
        trigger={({ open, toggle }) => (
          <button
            type="button"
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={toggle}
            className="inline-grid size-[30px] place-items-center rounded-sm text-text-muted hover:bg-grey-100"
          >
            <Icon name="ellipsis" size={16} />
          </button>
        )}
      />
    </span>
  );
}
