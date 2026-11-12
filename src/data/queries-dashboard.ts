"use client";
/** Extra read hooks for the dashboard feature (owned by that story phase). */
import { STOCK_LINES } from "./fixtures/stock";

/**
 * Seed on-hand units across all stock lines, as the design's home "Stock performance" panel
 * computes from `UZ_STOCK.lines`. Read once from the seed, so the panel stays fixed (FR-005).
 */
const SEED_UNITS = STOCK_LINES.reduce((a, l) => a + l[2], 0);

export function dashboardStockUnits(): number {
  return SEED_UNITS;
}
