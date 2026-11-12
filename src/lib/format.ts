/** Number and date formats from the Uzapoint design system (FR-028). */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "45,600" — integer grouping, used in tables where the currency is in the column header. */
export function num(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** "45,600.00" — two decimals with grouping. */
export function money(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** "KES 45,600.00" */
export function kes(n: number): string {
  return `KES ${money(n)}`;
}

/** "KES 4.82M", "KES 184K", "KES 4,380" — compact KPI money. */
export function kesCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `KES ${trim(n / 1_000_000)}M`;
  if (abs >= 100_000) return `KES ${trim(n / 1_000)}K`;
  return `KES ${num(n)}`;
}

function trim(v: number): string {
  return Number(v.toFixed(2)).toString();
}

/** "12 Nov 2026" from an ISO date (YYYY-MM-DD or full ISO). */
export function date(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "12.4%" */
export function pct(n: number, digits = 1): string {
  return `${Number(n.toFixed(digits))}%`;
}

/** Parse a design figure such as "45,600" or "From 12,900" into a number. */
export function parseAmount(v: string | number): number {
  if (typeof v === "number") return v;
  const n = Number(v.replace(/[^0-9.\-−]/g, "").replace("−", "-"));
  return Number.isFinite(n) ? n : 0;
}
