"use client";
/** Point of sale building blocks: the dialog frame, the "U" mark, eyebrow labels and colour helpers. */
import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { useDialog } from "@/components/ui/Overlay";

/** The till's dialog (design: 20px radius, slate scrim, header with title, subtitle and Close). */
export function PosDialog({ title, sub, width = 520, onClose, footer, children, label }: { title: ReactNode; sub?: ReactNode; width?: number; onClose: () => void; footer?: ReactNode; children: ReactNode; label?: string }) {
  const ref = useDialog(true, onClose);
  return (
    <div className="fixed inset-0 z-[270] grid place-items-center bg-[var(--pos-scrim)] p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label ?? (typeof title === "string" ? title : undefined)}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full flex-col overflow-auto rounded-[20px] bg-surface shadow-[var(--shadow-pos-dialog)]"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start gap-3 border-b border-border px-6 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            <h2 className="type-card-title m-0 text-text">{title}</h2>
            {sub && <div className="type-small mt-0.5 text-text-secondary">{sub}</div>}
          </div>
          <IconButton icon="x" size="sm" label="Close" data-close onClick={onClose} />
        </div>
        {children}
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`type-eyebrow text-text-muted ${className}`}>{children}</div>;
}

export function UMark() {
  return (
    <span aria-hidden="true" className="grid size-9 place-items-center rounded-[10px] bg-[linear-gradient(135deg,var(--green-500),var(--green-700))] text-[18px] font-bold text-white">
      U
    </span>
  );
}

export const tint = (i: number) => ({ background: `var(--pos-tint-${i})`, color: `var(--pos-ink-${i})` });
export const avatar = (i: number) => ({ background: `var(--pos-avatar-${(i % 4) + 1})`, color: `var(--pos-avatar-ink-${(i % 4) + 1})` });
