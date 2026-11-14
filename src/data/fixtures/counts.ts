/**
 * Stock counts seed (feature 017). These values are NEW: the design canvas has no stock counts
 * (specs/017-stock-counts/spec.md › Design deviations). The seed count has no stock movement
 * behind it, like other seed documents.
 */
import type { StockCount } from "../types";

export const COUNT_SEED: readonly StockCount[] = [
  {
    ref: "CNT-0001",
    store: "Point of Sale",
    date: "2026-11-03",
    by: "Grant Jensen",
    status: "Approved",
    full: false,
    lines: [
      { product: "Helmet", system: 46, counted: 44 },
      { product: "Bike Pump", system: 28, counted: 28 },
      { product: "Groupset", system: 2, counted: 3 },
    ],
    approvedBy: "Tony Blaise",
    approvedAt: "3 Nov 2026, 16:40",
  },
];
