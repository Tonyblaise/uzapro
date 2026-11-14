/**
 * Reorder points seed (feature 014). These values are NEW: the canvas's low-stock figures are for
 * products that are not in the catalogue (specs/014-bulk-units-reorder/spec.md › Design
 * deviations). Quantities are in base units. Figures: data-model.md › Seed reorder lines.
 */
import type { ReorderRule } from "../types";

export const REORDER_SEED: readonly ReorderRule[] = [
  { product: "Muthokinju Paint", variant: "White", store: "Main Store", min: 24, max: 72, unit: "Crate", supplier: "Eastside Bicycle Supplies" },
  { product: "Racing Wheelset", variant: "700c", store: "Main Store", min: 20, max: 40, unit: "Piece", supplier: "Magaliesburg Wheels" },
  { product: "Groupset", variant: "Standard", store: "Point of Sale", min: 5, max: 10, unit: "Piece", supplier: "" },
  { product: "Bike Pump", variant: "Standard", store: "Main Store", min: 24, max: 60, unit: "Box", supplier: "Eastside Bicycle Supplies" },
  { product: "Helmet", variant: "Medium", store: "Point of Sale", min: 20, max: 60, unit: "Carton", supplier: "Eastside Bicycle Supplies" },
];
