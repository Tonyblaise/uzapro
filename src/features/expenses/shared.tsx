"use client";
/** Helpers shared by the Expenses screens: URL-driven overlays, formats and the design's small parts. */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import type { ExpenseStatus, Pill } from "@/data";
import { date as fmtDate, money, num } from "@/lib/format";

/** The design's drawer subtitle is the module name (`drawerCrumb: m.n`). */
export const CRUMB = "Expenses";

/** Overlay state lives in the URL (contracts/routes.md): `?action=new`, `?view=<key>`, `&step=void`. */
export function useExpenseOverlay() {
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

/** List amounts: `x.toLocaleString('en-KE')` ("185,000"). */
export const fmt = (n: number) => num(n);

/** Two decimals ("6,500.00"): `toLocaleString('en-KE', { minimumFractionDigits: 2 })`. */
export const fmt2 = (n: number) => money(Math.round(n * 100) / 100);

/** The design's `docDate`: "5 Nov 2026" from an ISO date. */
export const docDate = (iso: string) => (iso ? fmtDate(iso) : "");

/** The design's `n()`: `Number(x) || 0`. */
export const n = (x: string | number) => Number(x) || 0;

/** Expense status pills (design `expAdd`: Paid success, Waiting approval and Unpaid bill warning). */
export function expensePill(s: ExpenseStatus): Pill {
  return { label: s, tone: s === "Paid" ? "success" : "warning" };
}

/** Category colour dot. The colour is user data from the fixtures (research R5), so it is bound with `style`. */
export function Dot({ color, size = 10 }: { color: string | null; size?: number }) {
  return <span aria-hidden="true" className="flex-none rounded-full" style={{ width: size, height: size, background: color ?? "var(--text-muted)" }} />;
}

/** Page body stack used by every list (`gap: var(--space-3)`). */
export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

/** Labelled textarea as the design draws it. */
export function TextArea({ id, label, rows, placeholder, value, onChange }: { id: string; label: string; rows: number; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="type-label text-text">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="type-body w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2 text-text outline-none focus:border-action focus:shadow-[0_0_0_3px_var(--green-100)]"
      />
    </div>
  );
}

/** Checkbox with a title and a note (the design's `accent-color` checkbox rows). */
export function CheckRow({ checked, onChange, title, note }: { checked: boolean; onChange: (v: boolean) => void; title: string; note?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-[3px] size-4 flex-none accent-[var(--action)]" />
      <span>
        <span className="type-label text-text">{title}</span>
        {note && <span className="type-small block text-text-secondary">{note}</span>}
      </span>
    </label>
  );
}

/** The design's segmented toggle (`segBtn`): green when on, plain text when off. */
export function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-border bg-surface p-0.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`type-caption rounded-[calc(var(--radius-md)-2px)] px-3 py-1 font-semibold ${on ? "bg-green-600 text-white" : "bg-transparent text-text-secondary"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Responsive field grid (`grid-template-columns: repeat(auto-fit, minmax(min, 1fr))`). */
export function Grid({ min, children }: { min: number; children: ReactNode }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,${min}px),1fr))` }}>
      {children}
    </div>
  );
}
