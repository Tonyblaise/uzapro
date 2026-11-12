"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

/** The gradient sparkles badge (canvas: green-500 → green-800, 3px green-50 ring). */
export function AiBadge({ size }: { size: 28 | 44 | 58 | 72 }) {
  const glyph = { 28: 14, 44: 22, 58: 26, 72: 34 }[size];
  return (
    <span
      aria-hidden="true"
      className="grid flex-none place-items-center rounded-full bg-[linear-gradient(135deg,var(--green-500),var(--green-800))] text-white shadow-[0_0_0_3px_var(--green-50)]"
      style={{ width: size, height: size }}
    >
      <Icon name="sparkles" size={glyph} />
    </span>
  );
}

/** A square grey icon tile (Support and Features headers, chat rows). */
export function IconTile({ icon, size = 44, glyph = 20 }: { icon: IconName; size?: number; glyph?: number }) {
  return (
    <span aria-hidden="true" className="grid flex-none place-items-center rounded-md bg-canvas text-text-secondary" style={{ width: size, height: size }}>
      <Icon name={icon} size={glyph} />
    </span>
  );
}

/** The canvas panel section header: tile/badge, title, subtitle and an optional action. */
export function PanelHead({ lead, title, sub, action }: { lead: ReactNode; title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="flex flex-none items-center gap-3 border-b border-border px-5 py-4">
      {lead}
      <div className="min-w-0 flex-1">
        <div className="type-title text-text">{title}</div>
        <div className="type-small text-text-secondary">{sub}</div>
      </div>
      {action}
    </div>
  );
}

/** A chat or ticket bubble. `me` = the user (green, right); otherwise grey on the left. */
export function Bubble({ me, radius = 16, children }: { me: boolean; radius?: 14 | 16; children: ReactNode }) {
  const r = radius;
  return (
    <div
      className={`type-body whitespace-pre-line px-3.5 py-2.5 leading-[1.5] [overflow-wrap:anywhere] ${me ? "bg-green-700 text-white" : "bg-canvas text-text"}`}
      style={{ borderRadius: me ? `${r}px ${r}px 4px ${r}px` : `${r}px ${r}px ${r}px 4px` }}
    >
      {children}
    </div>
  );
}

/** Paperclip chip with a file name. */
export function FileChip({ name, onRemove }: { name: string; onRemove?: () => void }) {
  return (
    <span className={`type-small inline-flex max-w-full items-center gap-1.5 self-start rounded-pill bg-canvas py-1 text-text-secondary ${onRemove ? "pl-2.5 pr-1.5" : "px-2.5"}`}>
      <Icon name="paperclip" size={13} />
      <span className="min-w-0 truncate">{name}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove file" className="grid place-items-center rounded-sm p-0.5 text-text-muted hover:text-text">
          <Icon name="x" size={13} />
        </button>
      )}
    </span>
  );
}
