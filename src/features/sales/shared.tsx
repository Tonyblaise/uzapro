"use client";
/** Helpers shared by the Sales screens: URL-driven overlays, panels and the design's sale document. */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useCreditNotes, useProducts, useSales, useStockLevels, useVoids, type Sale } from "@/data";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { kes, date as fmtDate } from "@/lib/format";

/** Overlays open from `?action=` / `?view=` (contracts/routes.md); closing replaces the URL. */
export function useOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const open = useCallback(
    (next: Record<string, string>, path = pathname) => router.replace(`${path}?${new URLSearchParams(next).toString()}`, { scroll: false }),
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { params, open, close, pathname, router };
}

/** The design's `this.money()` with the same rounding: "KES 1,234.00". */
export const money = (n: number) => kes(Math.round((Number(n) || 0) * 100) / 100);

/** List amounts as the design writes them (`toLocaleString('en-KE')`): "45,600", "2,701.24". */
export const amount = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 });

/** Display date for an ISO date, or the value itself when it is already a display string. */
export const docDate = (iso: string) => (iso ? fmtDate(iso) : "");

/** White bordered block used throughout the record views (`border:1px solid var(--border);border-radius:var(--radius-lg)`). */
export function Panel({ children, className = "", flush }: { children: ReactNode; className?: string; flush?: boolean }) {
  return <section className={`min-w-0 rounded-lg border border-border bg-surface ${flush ? "overflow-hidden" : "p-5"} ${className}`}>{children}</section>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="type-eyebrow text-text-muted">{children}</div>;
}

export function Row({ label, value, className = "" }: { label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={`type-body flex justify-between gap-3 text-text-secondary ${className}`}>
      <span>{label}</span>
      <span className="u-num text-text">{value}</span>
    </div>
  );
}

/** Count chip in panel headers ("2 items"). */
export function Chip({ children }: { children: ReactNode }) {
  return <span className="type-caption rounded-sm bg-canvas px-2 py-0.5 font-semibold text-text-secondary">{children}</span>;
}

/** The design's radio cards (`role="radio"` buttons with a green border when chosen). */
export function Choice({ on, title, text, onPick }: { on: boolean; title: string; text: string; onPick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onPick}
      className={`w-full cursor-pointer rounded-md px-4 py-3 text-left ${on ? "border-2 border-green-600 bg-green-50" : "border border-border bg-surface"}`}
    >
      <span className="type-label block text-text">{title}</span>
      <span className="type-small mt-0.5 block text-text-secondary">{text}</span>
    </button>
  );
}

// ---- Sale documents (design `posDoc` / `UZ_SALEDOCS`) ------------------------------------------

export interface DocLineView {
  product: string;
  variant: string;
  unit: string;
  qty: number;
  price: number;
  taxable: boolean;
}

export interface SaleDoc {
  ref: string;
  date: string;
  time: string;
  cust: string;
  type: string;
  channel: string;
  store: string;
  lines: DocLineView[];
  subtotal: number;
  vat: number;
  total: number;
  pays: { method: string; ref: string; date: string; amount: number }[];
  who: string;
  closedAt: string;
  status: Sale["status"];
}

type ProductLite = { name: string; price: number; variant: string; unit: string };

/**
 * Seed sales have no lines in the design. Its `posDoc` makes one up: the dearest product that is
 * stocked somewhere and costs no more than the pre-VAT total, in a quantity that fits.
 */
function deriveDoc(sale: Sale, catalogue: ProductLite[], stocked: Set<string>): SaleDoc {
  const total = sale.total;
  const sub = Math.round((total / 1.16) * 100) / 100;
  const paid = sale.status.label === "Paid";
  const pick = catalogue.filter((p) => p.price > 0 && p.price <= sub && stocked.has(p.name)).sort((a, b) => b.price - a.price)[0];
  const lines: DocLineView[] = pick
    ? (() => {
        const qty = Math.max(1, Math.round(sub / pick.price));
        return [{ product: pick.name, variant: pick.variant, unit: pick.unit || "Piece", qty, price: Math.round((sub / qty) * 100) / 100, taxable: true }];
      })()
    : [{ product: `Items on this ${sale.type.toLowerCase()}`, variant: "", unit: "Piece", qty: 1, price: sub, taxable: true }];
  return {
    ref: sale.ref,
    date: "2026-11-01",
    time: "10:15",
    cust: sale.customer,
    type: sale.type,
    channel: sale.channel,
    store: "Point of Sale",
    lines,
    subtotal: sub,
    vat: Math.round((total - sub) * 100) / 100,
    total,
    pays: paid ? [{ method: "M-Pesa", ref: "—", date: "1 Nov 2026, 10:16", amount: total }] : [],
    who: "Tony Blaise",
    closedAt: paid ? "1 Nov 2026, 10:16" : "",
    status: sale.status,
  };
}

function docOf(sale: Sale): SaleDoc {
  return {
    ref: sale.ref,
    date: sale.date,
    time: sale.time,
    cust: sale.customer,
    type: sale.type,
    channel: sale.channel,
    store: sale.store,
    lines: sale.lines.map((l) => ({ ...l, unit: l.unit || "Piece" })),
    subtotal: sale.subtotal,
    vat: sale.vat,
    total: sale.total,
    pays: sale.payments,
    who: sale.by,
    closedAt: sale.payments.length ? sale.payments[0]!.date : "",
    status: sale.status,
  };
}

/** The sale document for `ref`, live or voided. */
export function useSaleDoc(ref: string | null): { doc: SaleDoc; voided: boolean } | null {
  const sales = useSales();
  const voids = useVoids();
  const products = useProducts();
  const levels = useStockLevels();
  return useMemo(() => {
    if (!ref) return null;
    const live = sales.find((s) => s.ref === ref);
    const sale = live ?? voids.find((v) => v.original === ref)?.sale;
    if (!sale) return null;
    if (sale.session || sale.lines.length) return { doc: docOf(sale), voided: !live };
    const catalogue: ProductLite[] = products.map((p) => {
      const v = p.variants[0];
      return { name: p.name, price: Math.min(...p.variants.map((x) => x.price).filter((x) => x > 0), Infinity), variant: v?.name ?? "Standard", unit: v?.unit ?? "Piece" };
    });
    const stocked = new Set(levels.map((l) => l.product));
    return { doc: deriveDoc(sale, catalogue, stocked), voided: !live };
  }, [ref, sales, voids, products, levels]);
}

/** Quantity already credited per sale line (`doc.credited`), from the credit notes on that sale. */
export function useCredited(ref: string | null): (product: string, variant: string) => number {
  const notes = useCreditNotes();
  return useCallback(
    (product: string, variant: string) =>
      notes.filter((n) => n.source === ref).reduce((s, n) => s + n.items.filter((i) => i.product === product && i.variant === variant).reduce((a, i) => a + i.qty, 0), 0),
    [notes, ref],
  );
}

/** The design's SKU text for a product (`sku()` in the sale view). */
export const sku = (n: string) =>
  n
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);

// ---- List helpers -----------------------------------------------------------------------------

/** First column text, as the design's `table()` renders column 0 (text colour, weight 500). */
export function Lead({ children }: { children: ReactNode }) {
  return <span className="font-medium text-text">{children}</span>;
}

/** The design's status filter on Quotations, Invoices and Refunds (`hasQuoteFilter`). */
export function useStatusFilter<R>(rows: R[], pill: (r: R) => string) {
  const [value, setValue] = useState("All statuses");
  const options = useMemo(() => ["All statuses", ...Array.from(new Set(rows.map(pill)))], [rows, pill]);
  const shown = useMemo(() => (value === "All statuses" ? rows : rows.filter((r) => pill(r) === value)), [rows, pill, value]);
  const control = (
    <div className="min-w-[150px] flex-[0_1_180px]">
      <SearchSelect noun="status" options={options} value={value} onChange={setValue} />
    </div>
  );
  return { shown, control };
}
