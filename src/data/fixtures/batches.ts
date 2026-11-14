/**
 * Stock batches seed (feature 016). These values are NEW: the design canvas has no batches or
 * expiry dates (specs/016-batch-expiry/spec.md › Design deviations). The demo's today is
 * 10 Nov 2026, so one batch is expired, one expires soon and one is fine.
 */
import type { StockBatch } from "../types";

export const BATCH_SEED: readonly StockBatch[] = [
  { id: "b-1", product: "Muthokinju Paint", store: "Point of Sale", batch: "MP-2409", expiry: "2026-10-31", qty: 2 },
  { id: "b-2", product: "Muthokinju Paint", store: "Point of Sale", batch: "MP-2411", expiry: "2026-11-28", qty: 4 },
  { id: "b-3", product: "Muthokinju Paint", store: "Point of Sale", batch: "MP-2502", expiry: "2027-04-30", qty: 6 },
];
