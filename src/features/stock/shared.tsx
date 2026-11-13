"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { UZ_UNITS, addStoreQuick, useCan, useProducts, useStores, useUnits, variantNames, type Pill, type TransferStatus } from "@/data";
import { Drawer } from "@/components/ui/Overlay";

/** The design's drawer subtitle is the module name (`drawerCrumb: m.n`). */
export const DRAWER_CRUMB = "Stock";

/** The design's default transfer date (`trDate: '2026-11-01'`). */
export const DEFAULT_TRANSFER_DATE = "2026-11-01";

/** Overlay state lives in the URL (contracts/routes.md): `?action=…` and `?view=…`. */
export function useOverlayParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback(
    (next: Record<string, string>) => {
      router.replace(`${pathname}?${new URLSearchParams(next).toString()}`, { scroll: false });
    },
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { action: params.get("action"), view: params.get("view"), get: (k: string) => params.get(k), open, close };
}

/** Delete row actions need Delete on the module (feature 011; the design showed them to the owner only). */
export function useCanDelete(): boolean {
  return useCan("delete");
}

/** Store names for the store pickers (design `stockStores`). */
export function useStoreNames(): string[] {
  const stores = useStores();
  return useMemo(() => stores.map((s) => s.name), [stores]);
}

/** "New store" from a store picker (design `newStore`). */
export const createStore = (name: string) => addStoreQuick(name);

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

/** "Product · Variant" keys (the design's item keys) and helpers. */
export const itemKey = (product: string, variant: string) => `${product} · ${variant}`;
export function splitKey(key: string): { product: string; variant: string } {
  const cut = key.indexOf(" · ");
  return cut < 0 ? { product: key, variant: "" } : { product: key.slice(0, cut), variant: key.slice(cut + 3) };
}

/** Variant names and count per product (design `variantsOf`). */
export function useVariantLookup() {
  const products = useProducts();
  return useMemo(() => ({ names: (p: string) => variantNames(products, p) }), [products]);
}

/** Signed movement change as the design prints it ("−2", "+50"). */
export function signed(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : `+${n}`;
}

/** Design form drawer: title, crumb and the design's widths (800 for item forms, 440 otherwise). */
export function StockDrawer({ title, onClose, wide, width, children }: { title: string; onClose: () => void; wide?: boolean; width?: number; children: ReactNode }) {
  return (
    <Drawer open title={title} subtitle={DRAWER_CRUMB} onClose={onClose} width={width ?? (wide ? 800 : 440)}>
      {children}
    </Drawer>
  );
}

/** The bordered items grid used by the stock in, transfer and wastage forms. */
export function ItemsGrid({ columns, head, empty, children }: { columns: string; head: { label: string; right?: boolean }[]; empty?: ReactNode; children?: ReactNode }) {
  return (
    // On narrow phones the line table keeps a readable minimum width and scrolls inside its box.
    <div className="overflow-x-auto rounded-md border border-border">
      <div className="min-w-[520px]">
        <div className="type-table-head grid items-center gap-3 bg-canvas p-3 text-text-muted" style={{ gridTemplateColumns: columns }}>
          {head.map((h) => (
            <span key={h.label} className={h.right ? "text-right" : ""}>
              {h.label}
            </span>
          ))}
        </div>
        {empty}
        {children}
      </div>
    </div>
  );
}

export function ItemRow({ columns, children }: { columns: string; children: ReactNode }) {
  return (
    <div className="grid items-center gap-3 border-t border-border px-3 py-2" style={{ gridTemplateColumns: columns }}>
      {children}
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

/** Status pills as the design colours them (seed `P()` tones and `trFinish`). */
const PILLS: Record<TransferStatus, Pill> = {
  "Not finished": { label: "Not finished", tone: "neutral" },
  Confirmed: { label: "Confirmed", tone: "info" },
  "In transit": { label: "In transit", tone: "info" },
  Received: { label: "Received", tone: "success" },
  Cancelled: { label: "Cancelled", tone: "neutral" },
};
export const transferPill = (s: TransferStatus): Pill => PILLS[s];
