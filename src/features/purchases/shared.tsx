"use client";
/** Helpers shared by the Purchases screens: URL-driven overlays, the design's drawer, panels and formats. */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { UZ_UNITS, addStoreQuick, useStores, useSupplierList, useUnits, type Pill } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { Drawer } from "@/components/ui/Overlay";
import { date as fmtDate, kes } from "@/lib/format";

/** The design's drawer subtitle is the module name (`drawerCrumb: m.n`). */
export const CRUMB = "Purchases";

/** Overlay state lives in the URL (contracts/routes.md): `?action=`, `?edit=`, `?view=`, `&step=receive`. */
export function usePurchaseOverlay() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback((next: Record<string, string>) => router.replace(`${pathname}?${new URLSearchParams(next).toString()}`, { scroll: false }), [router, pathname]);
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { params, open, close, router };
}

/** The design's `this.money()`: "KES 1,234.00". */
export const money = (n: number) => kes(Math.round((Number(n) || 0) * 100) / 100);

/** The design's `docDate`: "1 Nov 2026" from an ISO date. */
export const docDate = (iso: string) => (iso ? fmtDate(iso) : "");

/** List amounts as the design writes them (`Math.round(x).toLocaleString('en-KE')`). */
export const amount = (n: number) => Math.round(n).toLocaleString("en-US");

/** Approved orders read "Sent" in the order view and receive drawer (design `st === 'Approved' ? 'Sent' : st`). */
export const orderStatus = (p: Pill) => (p.label === "Approved" ? "Sent" : p.label);

/** Initials chip text (design `sup.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()`). */
export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** "Product · Variant" keys. */
export function splitKey(key: string): { name: string; variant: string } {
  const cut = key.indexOf(" · ");
  return cut < 0 ? { name: key, variant: "" } : { name: key.slice(0, cut), variant: key.slice(cut + 3) };
}

/**
 * The supplier record behind a name, matched as the design does (the order lists use short names
 * such as "Eastside Bicycle"), with its contact lines (phone, email, town) when set.
 */
export function useSupplierInfo(name: string) {
  const list = useSupplierList();
  return useMemo(() => {
    const s = list.find((r) => r.name === name || r.name.startsWith(name) || name.startsWith(r.name));
    const ok = (x: string | undefined) => !!x && x !== "—";
    const contact = s
      ? ([
          ["phone", s.phone],
          ["mail", s.email],
          ["map-pin", s.town],
        ] as const)
          .filter((x) => ok(x[1]))
          .map(([icon, text]) => ({ icon, text }))
      : [];
    return { type: s && ok(s.type) ? s.type : "Supplier", contact };
  }, [list, name]);
}

/** Store names for the store pickers (design `stockStores`) and "New store" (design `newStore`). */
export function useStoreOptions() {
  const stores = useStores();
  return { names: useMemo(() => stores.map((s) => s.name), [stores]), create: (n: string) => addStoreQuick(n) };
}

/** Unit options (design `stUnits`) plus units created from a picker in this form. */
export function useUnitOptions() {
  const extra = useUnits();
  const [local, setLocal] = useState<string[]>([]);
  const options = useMemo(() => Array.from(new Set<string>([...UZ_UNITS, ...extra, ...local])), [extra, local]);
  const create = (name: string) => {
    setLocal((l) => [...l, name]);
    return name;
  };
  return { options, create, base: UZ_UNITS[0] };
}

/** The design's full-width drawer for purchases screens (`drawerWidth` 9999). */
export function PurchaseDrawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Drawer open title={title} subtitle={CRUMB} onClose={onClose} width={9999}>
      {children}
    </Drawer>
  );
}

/** White bordered block (`border:1px solid var(--border);border-radius:var(--radius-lg)`). */
export function Panel({ children, className = "", flush }: { children: ReactNode; className?: string; flush?: boolean }) {
  return <section className={`min-w-0 rounded-lg border border-border bg-surface ${flush ? "overflow-hidden" : "p-5"} ${className}`}>{children}</section>;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`type-eyebrow text-text-muted ${className}`}>{children}</div>;
}

/** Count chip in panel headers ("2 lines"). */
export function Chip({ children }: { children: ReactNode }) {
  return <span className="type-caption rounded-sm bg-canvas px-2 py-0.5 text-text-secondary">{children}</span>;
}

/** Summary row: label left, value right. */
export function Row({ label, value, color = "text-text" }: { label: ReactNode; value: ReactNode; color?: string }) {
  return (
    <div className="type-body flex justify-between gap-3 text-text-secondary">
      <span>{label}</span>
      <span className={`u-num text-right ${color}`}>{value}</span>
    </div>
  );
}

/** Notes textarea as the design draws it (label + plain textarea). */
export function NotesField({ id, label, rows, placeholder, value, onChange }: { id: string; label: string; rows: number; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
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

/** Numbered step heading of the purchase return form. */
export function StepTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="type-title flex items-center gap-2 text-text">
      <span className="type-caption grid size-6 place-items-center rounded-full bg-green-600 font-semibold text-white">{n}</span>
      {children}
    </div>
  );
}

/** Eyebrow + value fact used in the order and receipt views. */
export function Fact({ label, value, sub, color = "text-text" }: { label: string; value: ReactNode; sub?: string; color?: string }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className={`type-label mt-0.5 [overflow-wrap:anywhere] ${color}`}>{value}</div>
      {sub && <div className="type-caption text-text-muted">{sub}</div>}
    </div>
  );
}

/** Supplier block of the order and receipt views: initials, name, type and contact lines. */
export function SupplierBlock({ name, showType }: { name: string; showType?: boolean }) {
  const info = useSupplierInfo(name);
  return (
    <div className="border-border p-5 [border-right-width:1px]">
      <Eyebrow>Supplier</Eyebrow>
      <div className="mt-3 flex items-center gap-3">
        <span className="type-label grid size-10 place-items-center rounded-md bg-green-50 text-green-700">{initials(name)}</span>
        <div>
          <div className="type-title text-text">{name}</div>
          {showType && <div className="type-caption text-text-muted">{info.type}</div>}
        </div>
      </div>
      <div className="type-body mt-4 flex flex-col gap-2 text-text">
        {info.contact.map((c) => (
          <span key={c.icon} className="flex items-center gap-2">
            <span className="inline-flex text-text-muted">
              <Icon name={c.icon} size={16} />
            </span>
            {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}
