/** Catalogue seed, ported verbatim from design/canvas/erp-data.js (UZ_MODS prod tabs, UZ_VARIANTS, UZ_PRODADDED). */
import { P } from "./_helpers";

/** UZ_MODS › prod › "All products": [Product, Category, Price, On hand, Status] */
export const PRODUCT_ROWS = [
  ["Carbon Road Frame", "Frames", "34,500", "141", P("Active", "good")],
  ["Aluminium Frame", "Frames", "31,050", "170", P("Active", "good")],
  ["Carbon Sole Shoes", "Apparel", "4,140", "68", P("Low stock", "warn")],
  ["Racing Wheelset", "Parts", "From 12,900", "20", P("Low stock", "warn")],
  ["Muthokinju Paint", "Acrylic Paints", "From 467", "12", P("Low stock", "warn")],
  ["Bike Pump", "Parts", "345", "58", P("Active", "good")],
  ["Helmet", "Apparel", "From 1,639", "44", P("Active", "good")],
  ["Groupset", "Parts", "8,452", "30", P("Active", "good")],
] as const;

/** UZ_MODS › prod › "Categories": [Category, Description, image, parent] */
export const CATEGORY_ROWS = [
  ["Parts", "Frames, wheels and components", "", ""],
  ["Frames", "Road and mountain bike frames", "", "Parts"],
  ["Wheels", "Wheelsets, tyres and tubes", "", "Parts"],
  ["Apparel", "Shoes, jerseys and helmets", "", ""],
  ["Acrylic Paints", "Paints sold in store", "", ""],
  ["Services", "Repairs and fitting", "", ""],
] as const;

/** UZ_VARIANTS: product → [name, price, cost] */
export const UZ_VARIANTS: Record<string, [string, number, number][]> = {
  "Carbon Road Frame": [["54cm", 34500, 19642], ["56cm", 34500, 19642]],
  "Aluminium Frame": [["54cm", 31050, 17700], ["56cm", 31050, 17700]],
  "Bike Pump": [["Standard", 345, 210]],
  "Carbon Sole Shoes": [["Size 42", 4140, 2219], ["Size 43", 4140, 2219]],
  "Racing Wheelset": [["700c", 13800, 8280], ["650b", 12900, 7740]],
  Helmet: [["Small", 1639, 980], ["Medium", 1639, 980], ["Large", 1739, 1040]],
  Groupset: [["Standard", 8452, 5300]],
  "Muthokinju Paint": [["White", 467, 280], ["Red", 489, 295], ["Blue", 489, 295]],
};

/** Extra unit prices added by the design's post-processing: [product, [unit, multiplier][]]; base unit "Piece". */
export const EXTRA_UNITS: [string, [string, number][]][] = [
  ["Muthokinju Paint", [["Tray", 6], ["Crate", 24]]],
  ["Bike Pump", [["Box", 12]]],
  ["Helmet", [["Carton", 10]]],
];

/** UZ_PRODADDED: product → [display, by, iso] */
export const UZ_PRODADDED: Record<string, [string, string, string]> = {
  Groupset: ["31 Oct 2026, 13:43", "Tony Blaise", "2026-10-31T13:43"],
  Helmet: ["24 Oct 2026, 10:12", "Grant Jensen", "2026-10-24T10:12"],
  "Bike Pump": ["18 Oct 2026, 16:05", "Grant Jensen", "2026-10-18T16:05"],
  "Muthokinju Paint": ["12 Oct 2026, 09:30", "Tony Blaise", "2026-10-12T09:30"],
  "Racing Wheelset": ["2 Oct 2026, 11:20", "Grant Jensen", "2026-10-02T11:20"],
  "Carbon Sole Shoes": ["21 Sep 2026, 15:02", "Grant Jensen", "2026-09-21T15:02"],
  "Aluminium Frame": ["8 Sep 2026, 10:40", "Tony Blaise", "2026-09-08T10:40"],
  "Carbon Road Frame": ["1 Sep 2026, 09:05", "Tony Blaise", "2026-09-01T09:05"],
};
