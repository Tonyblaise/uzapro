/**
 * Date helpers for the date pickers: ISO "YYYY-MM-DD" strings in the data layer, local-midnight
 * `Date`s in the calendar (no time-zone shifts), and forgiving parsing of typed dates.
 */
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function isoToDate(iso: string | null | undefined): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export const dateToIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function valid(y: number, m: number, d: number): string | null {
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return null;
  const dt = new Date(y, m - 1, d);
  return dt.getMonth() === m - 1 && dt.getDate() === d
    ? `${y}-${pad(m)}-${pad(d)}`
    : null;
}

/**
 * A typed date as ISO, or null. Accepts "2026-11-12", "12/11/2026" or "12-11-2026" (day first, as
 * in Kenya), and "12 Nov 2026" / "12 November 2026".
 */
export function parseTypedDate(text: string): string | null {
  const t = text.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (m) return valid(Number(m[1]), Number(m[2]), Number(m[3]));
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t);
  if (m) return valid(Number(m[3]), Number(m[2]), Number(m[1]));
  m = /^(\d{1,2})\s+([a-z]+)\.?,?\s+(\d{4})$/i.exec(t);
  if (m) {
    const mi = MONTHS.indexOf(m[2]!.slice(0, 3).toLowerCase());
    return mi < 0 ? null : valid(Number(m[3]), mi + 1, Number(m[1]));
  }
  return null;
}
