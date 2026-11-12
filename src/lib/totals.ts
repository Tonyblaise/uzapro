/** Document maths shared by sales, quotations, invoices and credit notes (VAT 16%). */

export const VAT_RATE = 0.16;

export interface TotalsLine {
  qty: number;
  price: number;
  taxable: boolean;
}

export interface Discount {
  value: number;
  type: "KES" | "%";
}

export interface DocTotals {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function lineTotal(line: Pick<TotalsLine, "qty" | "price">): number {
  return round2(line.qty * line.price);
}

/**
 * Subtotal of all lines, minus the discount (spread pro rata over lines), plus VAT on the
 * discounted value of taxable lines only.
 */
export function docTotals(lines: readonly TotalsLine[], discount: Discount = { value: 0, type: "KES" }, vatRate = VAT_RATE): DocTotals {
  const subtotal = round2(lines.reduce((s, l) => s + lineTotal(l), 0));
  const rawDiscount = discount.type === "%" ? (subtotal * discount.value) / 100 : discount.value;
  const disc = round2(Math.min(Math.max(rawDiscount, 0), subtotal));
  const factor = subtotal > 0 ? (subtotal - disc) / subtotal : 0;
  const taxableBase = lines.filter((l) => l.taxable).reduce((s, l) => s + lineTotal(l), 0) * factor;
  const vat = round2(taxableBase * vatRate);
  return { subtotal, discount: disc, vat, total: round2(subtotal - disc + vat) };
}
