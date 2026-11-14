/**
 * Customer groups and price lists (feature 012). These values are NEW: the design canvas has no
 * price lists, groups, credit limits or terms (specs/012-wholesale-pricing-credit/spec.md ›
 * Design deviations). Figures: data-model.md › Seed.
 */
export const RETAIL_GROUP = "g-retail";

/** [id, name] */
export const GROUP_ROWS = [
  [RETAIL_GROUP, "Retail"],
  ["g-wholesale", "Wholesale"],
  ["g-distributor", "Distributor"],
] as const;

/** [group id, product, variant, unit, [from, price][]] */
export const PRICE_ROWS: readonly [string, string, string, string, readonly (readonly [number, number])[]][] = [
  ["g-wholesale", "Helmet", "Small", "Carton", [[1, 15500], [5, 15000]]],
  ["g-wholesale", "Helmet", "Medium", "Carton", [[1, 15500], [5, 15000]]],
  ["g-wholesale", "Helmet", "Large", "Carton", [[1, 16400], [5, 15900]]],
  ["g-wholesale", "Muthokinju Paint", "White", "Crate", [[1, 10600], [4, 10200]]],
  ["g-wholesale", "Muthokinju Paint", "White", "Tray", [[2, 2700]]],
  ["g-wholesale", "Bike Pump", "Standard", "Piece", [[6, 320]]],
  ["g-distributor", "Helmet", "Small", "Carton", [[1, 14900], [5, 14400], [20, 13900]]],
  ["g-distributor", "Helmet", "Medium", "Carton", [[1, 14900], [5, 14400], [20, 13900]]],
  ["g-distributor", "Helmet", "Large", "Carton", [[1, 15800], [5, 15300]]],
  ["g-distributor", "Muthokinju Paint", "White", "Crate", [[1, 10100], [4, 9700]]],
  ["g-distributor", "Bike Pump", "Standard", "Box", [[1, 3800], [10, 3600]]],
  ["g-distributor", "Bike Pump", "Standard", "Piece", [[6, 310]]],
];

/** Customer → [group id, credit limit (KES) or null, terms]. Customers not listed are Retail, no limit, 30 days. */
export const CUSTOMER_CREDIT: Record<string, readonly [string, number | null, "Cash" | "7 days" | "14 days" | "30 days"]> = {
  "Morningview Bicycles": ["g-wholesale", 50000, "30 days"],
  "Mountain Goats": ["g-distributor", 100000, "30 days"],
};
