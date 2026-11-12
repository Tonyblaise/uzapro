/**
 * Point of sale pure helpers — ports of the canvas `posVals` maths (totals, quick cash, product codes,
 * X-report, close difference, Today stats). Feature 010, data-model.md › Derived values.
 */
import type { PosCartLine, PosSaleDoc, PosShift, Product } from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** "KES 1,984.00" (design `K`). */
export const posK = (n: number) => `KES ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
/** "KES 1,984" (design `K0`). */
export const posK0 = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
/** "1,984.00" for receipt lines. */
export const posMoney = (n: number) => n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Prices include VAT: total = gross − discount; VAT = total × 16/116 (design cart maths). */
export function posTotals(cart: readonly PosCartLine[], discVal: string, discType: "KES" | "%") {
  const gross = cart.reduce((a, l) => a + l.price * l.qty, 0);
  const dv = Number(discVal) || 0;
  const disc = Math.min(gross, Math.max(0, discType === "%" ? (gross * dv) / 100 : dv));
  const total = round2(gross - disc);
  const vat = round2((total * 16) / 116);
  return { gross, disc, total, vat, sub: round2(total - vat), count: cart.reduce((a, l) => a + l.qty, 0) };
}

/** Quick cash amounts: Exact, then the amount rounded up to 50/100/500/1000 (unique, up to 5). */
export function quickCash(remaining: number): { label: string; value: number }[] {
  const out = [remaining];
  for (const n of [50, 100, 500, 1000]) {
    const v = Math.ceil(remaining / n) * n;
    if (v > remaining && !out.includes(v)) out.push(v);
  }
  return out.slice(0, 5).map((v) => ({ label: v === remaining ? "Exact" : v.toLocaleString("en-KE"), value: v }));
}

/** A product the till sells: variants with prices, the price range and stock at the till's store. */
export interface PosProduct {
  name: string;
  cat: string;
  vs: [string, number][];
  min: number;
  max: number;
  stock: number;
  image?: string;
}

/** The design's barcode: first three letters of each word, "-", the variant without spaces. */
export const productCode = (name: string, variant: string) => `${name.split(" ").map((w) => w.slice(0, 3)).join("")}-${variant.replace(/\s/g, "")}`.toLowerCase();

/** Barcode box lookup (design `scanKey`): exact code or "name variant", else a partial name match. */
export function matchCode(code: string, products: readonly PosProduct[]): { product: PosProduct; variant: [string, number] | null } | null {
  const c = code.trim().toLowerCase();
  if (!c) return null;
  for (const p of products) for (const v of p.vs) if (productCode(p.name, v[0]) === c || `${p.name} ${v[0]}`.toLowerCase() === c) return { product: p, variant: v };
  const p = products.find((x) => x.name.toLowerCase().includes(c));
  if (!p) return null;
  return { product: p, variant: p.vs.length === 1 ? p.vs[0]! : null };
}

/** Products on the till (design `products`): active ones, variant prices, stock at the store. */
export function posProducts(products: readonly Product[], stockAt: (product: string) => number): PosProduct[] {
  return products
    .filter((p) => p.status.label !== "Inactive")
    .map((p) => {
      const base = Number(p.priceLabel.replace(/^From /, "").replace(/[^0-9.]/g, "")) || 0;
      const vs: [string, number][] = p.variants.length ? p.variants.map((v) => [v.name, v.price || base]) : [["Standard", base]];
      const prices = vs.map((v) => v[1]);
      return { name: p.name, cat: p.category, vs, min: Math.min(...prices), max: Math.max(...prices), stock: stockAt(p.name), ...(p.image ? { image: p.image.url } : {}) };
    });
}

/** X-report collections by method; sales with no payments count as on credit. */
export function shiftCollections(docs: readonly PosSaleDoc[]) {
  const c = { Cash: 0, "M-Pesa": 0, Card: 0, Credit: 0 };
  for (const d of docs) {
    for (const p of d.pays) c[p.method] += p.amount;
    if (!d.pays.length) c.Credit += d.total;
  }
  return { ...c, total: docs.reduce((a, d) => a + d.total, 0) };
}

/** Opening float plus cash taken (design `expected`). */
export function expectedCash(shift: Pick<PosShift, "float">, docs: readonly PosSaleDoc[]): number {
  return (shift.float || 0) + docs.reduce((a, d) => a + d.pays.filter((p) => p.method === "Cash").reduce((b, p) => b + p.amount, 0), 0);
}

/** Close-shift difference (design `cl`). */
export function closeDiff(count: string, expected: number): { has: boolean; diff: number; label: "Drawer balances" | "Over by" | "Short by" } {
  const has = count !== "" && !Number.isNaN(Number(count));
  const diff = has ? Number(count) - expected : 0;
  return { has, diff, label: Math.abs(diff) < 0.01 ? "Drawer balances" : diff > 0 ? "Over by" : "Short by" };
}

/** Today view (design `d`): KPIs, top products, sales by hour 8–19. */
export function todayStats(docs: readonly PosSaleDoc[]) {
  const total = docs.reduce((a, d) => a + d.total, 0);
  const by = new Map<string, [number, number]>();
  let units = 0;
  for (const d of docs)
    for (const l of d.lines) {
      const b = by.get(l.product) ?? [0, 0];
      b[0] += l.qty;
      b[1] += l.qty * l.price;
      by.set(l.product, b);
      units += l.qty;
    }
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  const hv = hours.map((h) => docs.filter((d) => Number(d.time.slice(0, 2)) === h).reduce((a, d) => a + d.total, 0));
  const mx = Math.max(1000, ...hv);
  const step = Math.ceil(mx / 4 / 1000) * 1000;
  const top = step * 4;
  const best = Math.max(...hv);
  const pk = hv.indexOf(best);
  return {
    kpis: [
      { label: "Sales this shift", value: posK0(total), icon: "banknote", hi: true },
      { label: "Paid orders", value: String(docs.filter((d) => d.pays.length).length), icon: "receipt", hi: false },
      { label: "Average sale", value: posK0(docs.length ? total / docs.length : 0), icon: "chart-column", hi: false },
      { label: "Items sold", value: String(units), icon: "package", hi: false },
    ],
    top: [...by.entries()]
      .sort((a, b) => b[1][1] - a[1][1])
      .slice(0, 5)
      .map(([name, [u, amt]]) => ({ name, units: u, amount: posK0(amt) })),
    peak: best > 0 ? `Busiest: ${hours[pk]}:00 – ${hours[pk]! + 1}:00` : "No sales yet",
    ticks: [4, 3, 2, 1, 0].map((i) => (i ? (step * i >= 1000 ? `${(step * i) / 1000}K` : String(step * i)) : "0")),
    bars: hours.map((h, i) => ({ label: String(h), pct: (hv[i]! / top) * 100, peak: i === pk && hv[i]! > 0, tip: `${h}:00 · ${posK0(hv[i]!)}` })),
  };
}

/** "3h 12m" on shift. */
export function onShiftLabel(start: number | undefined, now: number): string {
  const mins = Math.max(0, Math.round((now - (start ?? now)) / 60000));
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** The six category colours (`--pos-tint-n` / `--pos-ink-n`) by category position. */
export const tintIndex = (cats: readonly string[], cat: string) => ((cats.indexOf(cat) < 0 ? 0 : cats.indexOf(cat)) % 6) + 1;

/** Safaricom numbers (design M-Pesa request check). */
export const isSafaricom = (phone: string) => /^(\+?254|0)?7\d{8}$|^(\+?254|0)?1\d{8}$/.test(phone.replace(/\s/g, ""));

/** Checkout figures (design `co`): what is paid, still due, change and whether it can complete. */
export function checkoutFigures(co: { pays: readonly { amount: number }[]; method: string; amt: string | null }, total: number, walkIn: boolean) {
  const paidSoFar = co.pays.reduce((a, p) => a + p.amount, 0);
  const remaining = Math.max(0, round2(total - paidSoFar));
  const amtStr = co.amt ?? String(remaining);
  const amt = Number(amtStr) || 0;
  const isCredit = co.method === "Credit";
  const isCash = co.method === "Cash";
  const entryAmt = isCredit ? remaining : isCash ? Math.min(amt, remaining) : amt;
  const totalPaid = paidSoFar + (isCredit ? 0 : entryAmt);
  const creditPart = isCredit ? remaining : 0;
  const change = isCash && amt > remaining ? amt - remaining : 0;
  const covered = isCredit ? !walkIn : totalPaid >= total - 0.001;
  const due = Math.max(0, total - totalPaid - creditPart);
  return { paidSoFar, remaining, amtStr, amt, isCredit, isCash, entryAmt, totalPaid, creditPart, change, covered, due, canSplit: !isCredit && amt > 0 && amt < remaining - 0.001 };
}
