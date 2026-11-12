"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "./IconButton";

/** Focus trap + Escape + focus restore shared by Drawer and Modal (Principle IV). */
export function useDialog(open: boolean, onClose: () => void) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    const first = focusables().find((el) => !el.hasAttribute("data-close")) ?? focusables()[0];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        const list = focusables();
        if (list.length === 0) return;
        const a = list[0]!;
        const z = list[list.length - 1]!;
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return panel;
}

interface OverlayProps {
  open: boolean;
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  width?: number;
  children: ReactNode;
}

/** Right-hand drawer (DS Drawer): 40% overlay, slide-in panel, header, scrolling body, footer. */
export function Drawer({ open, title, subtitle, onClose, footer, width = 560, children }: OverlayProps) {
  const panel = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-surface shadow-lg"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start gap-3 border-b border-border px-6 py-5">
          <div className="min-w-0 flex-1">
            <h2 className="type-h2 m-0">{title}</h2>
            {subtitle && <div className="type-small mt-0.5 text-text-muted">{subtitle}</div>}
          </div>
          <IconButton icon="x" label="Close" size="sm" onClick={onClose} data-close />
        </div>
        <div className="flex-1 overflow-auto p-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Centred modal (DS Modal). */
export function Modal({ open, title, subtitle, onClose, footer, width = 480, children }: OverlayProps) {
  const panel = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-overlay p-4" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full flex-col rounded-lg bg-surface shadow-lg"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start gap-3 px-6 pb-4 pt-6">
          <div className="flex-1">
            <h2 className="type-h2 m-0">{title}</h2>
            {subtitle && <div className="type-small mt-1 text-text-muted">{subtitle}</div>}
          </div>
          <IconButton icon="x" label="Close" size="sm" onClick={onClose} data-close />
        </div>
        <div className="overflow-auto px-6 pb-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Confirm dialog for destructive or irreversible actions. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="type-label h-[var(--control-height)] rounded-sm border border-border-strong bg-surface px-3.5 text-text hover:bg-surface-hover">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`type-label h-[var(--control-height)] rounded-sm px-3.5 text-white ${danger ? "bg-danger-text hover:brightness-90" : "bg-action hover:bg-action-hover"}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="type-body text-text-secondary">{message}</div>
    </Modal>
  );
}
