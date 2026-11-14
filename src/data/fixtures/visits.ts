/**
 * Van sales seed (feature 021). These values are NEW: the design canvas has no van, route or
 * visits (specs/021-van-sales/spec.md › Design deviations). The van's load is moved out of the
 * Main Store, so each product's total on hand stays as the canvas has it.
 */
import type { Store, Visit } from "../types";

export const VAN_TYPE = "Van";
export const VAN_STORE: Store = { name: "Van KDG 412X", branch: "Nairobi HQ", type: VAN_TYPE };

/** [product, quantity] moved from `VAN_LOAD_FROM` to the van. */
export const VAN_LOAD_FROM = "Main Store";
export const VAN_LOAD: readonly [string, number][] = [
  ["Aluminium Frame", 20],
  ["Carbon Road Frame", 10],
];

export const VISIT_SEED: readonly Visit[] = [
  { id: "VIS-0001", date: "2026-11-10", customer: "Mountain Goats", van: VAN_STORE.name, rep: "Tony Blaise", status: "Planned" },
  { id: "VIS-0002", date: "2026-11-10", customer: "Morningview Bicycles", van: VAN_STORE.name, rep: "Tony Blaise", status: "Planned" },
];
