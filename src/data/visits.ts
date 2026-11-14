/** Pure van-sales rules (feature 021): the day's summary for a van. */
import type { Sale, Visit } from "./types";

export { VAN_TYPE } from "./fixtures/visits";

export const NO_SALE_REASONS: readonly string[] = ["Shop closed", "Has enough stock", "No money today", "Owner not in", "Other"];
export const VISIT_PAY_METHODS: readonly string[] = ["Cash", "M-Pesa"];

export interface DaySummary {
  /** Visits closed (Sold or No sale). */
  done: number;
  total: number;
  /** Total of the sales made on visits. */
  sold: number;
  cash: number;
  mpesa: number;
  /** Sold on credit: not paid on the visit. */
  credit: number;
}

/** A van's visits for a day, with what was sold and how it was paid (research R4). */
export function daySummary(visits: readonly Visit[], sales: readonly Pick<Sale, "ref" | "total" | "payments">[], van: string, date: string): DaySummary {
  const mine = visits.filter((v) => v.van === van && v.date === date);
  const sum: DaySummary = { done: mine.filter((v) => v.status !== "Planned").length, total: mine.length, sold: 0, cash: 0, mpesa: 0, credit: 0 };
  for (const v of mine) {
    const sale = v.sale ? sales.find((s) => s.ref === v.sale) : undefined;
    if (!sale) continue;
    sum.sold += sale.total;
    let paid = 0;
    for (const p of sale.payments) {
      paid += p.amount;
      if (p.method === "Cash") sum.cash += p.amount;
      else if (p.method === "M-Pesa") sum.mpesa += p.amount;
    }
    sum.credit += Math.max(0, sale.total - paid);
  }
  return sum;
}
