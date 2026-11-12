"use client";
/**
 * Helpers shared by the Settings structure screens (feature 005, US3): the URL-driven overlay
 * (contracts/routes.md: `?action=new`, `?view=<name|id|section>`) and the design's `setModal`
 * field parts (`isHead`, `isCheck`, `isNote`, `isChoice`).
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { CITIES } from "@/data";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";

/** Overlay state lives in the URL: `?action=new` or `?view=<key>`. */
export function useSettingsOverlay() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback(
    (next: Record<string, string | undefined>) => {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) if (v !== undefined && v !== "") q.set(k, v);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { params, open, close };
}

/** Page body stack (`gap: var(--space-3)`). */
export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

/** `{ main, note }` cell. */
export function MainNote({ main, note }: { main: string; note: string }) {
  return (
    <span className="inline-flex flex-col">
      <span className="text-text">{main}</span>
      <span className="type-caption text-text-muted">{note}</span>
    </span>
  );
}

/**
 * Towns added from a "City or town" picker during the session (design `this._setCities`, shared by
 * every Settings dialog). Only changed from event handlers.
 */
const addedCities: string[] = [];
export const cityOptions = () => [...CITIES, ...addedCities];
export function addCity(name: string): string {
  if (!cityOptions().includes(name)) addedCities.push(name);
  return name;
}

/** Options plus the current value when it was typed as new (`onCreate: x => x` keeps it out of the list). */
export const withValue = (options: readonly string[], value: string) => (value && !options.includes(value) ? [...options, value] : [...options]);

/** The design's grid cell: full width (`1 / -1`) or half. */
export function Cell({ half, children }: { half?: boolean; children: ReactNode }) {
  return <div className={half ? "min-w-0" : "col-span-2 min-w-0"}>{children}</div>;
}

/** `isHead`: a section heading inside the dialog. */
export function Head({ children }: { children: ReactNode }) {
  return (
    <Cell>
      <div className="type-title border-t border-border pt-2 text-text">{children}</div>
    </Cell>
  );
}

/** `isNote`: a label and a line of text, in the given colour or box. */
export function Note({ label, sub, className }: { label: string; sub: string; className: string }) {
  return (
    <Cell>
      <div className={className}>
        <div className="type-label">{label}</div>
        <div className="type-small mt-0.5">{sub}</div>
      </div>
    </Cell>
  );
}

/** The duplicate-name note under Name. */
export const DupeNote = ({ sub }: { sub: string }) => <Note label="Name already used" sub={sub} className="text-danger-text" />;

/** `isCheck`: a native checkbox with a title and a note (muted title while disabled). */
export function Check({ label, sub, checked, disabled, onChange }: { label: string; sub: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <Cell>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-[3px] size-4 flex-none accent-[var(--action)]"
        />
        <span>
          <span className={`type-label ${disabled ? "text-text-muted" : "text-text"}`}>{label}</span>
          <span className="type-small block text-text-secondary">{sub}</span>
        </span>
      </label>
    </Cell>
  );
}

/** `isChoice`: two radio cards. */
export function Choices({ label, items }: { label: string; items: { title: string; text: string; price: string; on: boolean; pick: () => void }[] }) {
  return (
    <Cell>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-3">
        {items.map((o) => (
          <button
            key={o.title}
            type="button"
            role="radio"
            aria-checked={o.on}
            onClick={o.pick}
            className={`cursor-pointer rounded-lg p-4 text-left ${o.on ? "border-2 border-green-600 bg-green-50" : "border border-border bg-surface"}`}
          >
            <span className="type-label block text-text">{o.title}</span>
            <span className="type-small mt-1 block text-text-secondary">{o.text}</span>
            <span className="type-label mt-2 block text-text">{o.price}</span>
          </button>
        ))}
      </div>
    </Cell>
  );
}

/** The design's `setModal`: title and subtitle, a two-column field grid, Cancel and the save button. */
export function SetModal({
  title,
  sub,
  width,
  btn,
  blocked,
  onSave,
  onClose,
  children,
}: {
  title: string;
  sub: string;
  width: number;
  btn: string;
  blocked: boolean;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      open
      title={title}
      subtitle={sub}
      width={width}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" disabled={blocked} onClick={onSave}>
            {btn}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 pt-1">{children}</div>
    </Modal>
  );
}
