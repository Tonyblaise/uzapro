/** Stock seed, ported verbatim from design/canvas/erp-data.js (UZ_MODS inv tabs, UZ_STOCK). */
import { P } from "./_helpers";

/** UZ_MODS › inv › "Warehouses": [Warehouse, Branch, Type, Items] */
export const WAREHOUSE_ROWS = [
  ["Main Store", "Nairobi HQ", "Store", "0"],
  ["Finished Goods", "Nairobi HQ", "Manufacturing", "0"],
  ["Stores", "Nairobi HQ", "Manufacturing", "0"],
  ["Point of Sale", "Nairobi HQ", "Retail", "0"],
  ["Goods in Transit", "Import", "Transfer", "0"],
] as const;

/** UZ_STOCK.lines: [product, store, quantity] */
export const STOCK_LINES: [string, string, number][] = [
  ["Carbon Road Frame", "Finished Goods", 100],
  ["Carbon Road Frame", "Main Store", 35],
  ["Aluminium Frame", "Main Store", 165],
  ["Carbon Sole Shoes", "Main Store", 40],
  ["Carbon Sole Shoes", "Point of Sale", 28],
  ["Racing Wheelset", "Main Store", 16],
  ["Muthokinju Paint", "Main Store", 0],
  ["Bike Pump", "Main Store", 30],
  ["Bike Pump", "Point of Sale", 28],
  ["Helmet", "Point of Sale", 44],
  // Feature 010: the design added Point of Sale stock for the till.
  ["Carbon Road Frame", "Point of Sale", 6],
  ["Aluminium Frame", "Point of Sale", 5],
  ["Racing Wheelset", "Point of Sale", 4],
  ["Muthokinju Paint", "Point of Sale", 12],
  ["Groupset", "Point of Sale", 3],
  ["Groupset", "Stores", 27],
];

/** UZ_STOCK.moves: [date, product, variant, kind, store, change, left, by, ref] */
export const STOCK_MOVES = [
  ["9 Nov 2026", "Carbon Road Frame", "56cm", P("Sold", "info"), "Main Store", "−2", "15", "Jane Smith", "SAL-001182"],
  ["6 Nov 2026", "Carbon Road Frame", "54cm", P("Sold", "info"), "Main Store", "−1", "18", "Tony Blaise", "INV-0362"],
  ["2 Nov 2026", "Carbon Road Frame", "54cm", P("Sold", "info"), "Finished Goods", "−3", "127", "Jane Smith", "SAL-001171"],
  ["31 Oct 2026", "Bike Pump", "Standard", P("Sold", "info"), "Point of Sale", "−2", "58", "Jane Smith", "SAL-001168"],
  ["31 Oct 2026", "Carbon Road Frame", "54cm", P("Moved out", "mut"), "Finished Goods", "−8", "135", "Grant Jensen", "TRF-0032"],
  ["30 Oct 2026", "Helmet", "Medium", P("Sold", "info"), "Point of Sale", "−1", "44", "Jane Smith", "SAL-001163"],
  ["29 Oct 2026", "Carbon Road Frame", "54cm", P("Received", "good"), "Finished Goods", "+50", "143", "Grant Jensen", "GRN-0041"],
  ["28 Oct 2026", "Groupset", "Standard", P("Counted", "warn"), "Stores", "−3", "27", "Grant Jensen", "CNT-0014"],
  ["28 Oct 2026", "Muthokinju Paint", "White", P("Damaged or lost", "bad"), "Stores", "−4", "0", "Grant Jensen", "WST-0008"],
  ["27 Oct 2026", "Carbon Sole Shoes", "Size 42", P("Damaged or lost", "bad"), "Stores", "−1", "68", "Grant Jensen", "WST-0007"],
  ["26 Oct 2026", "Aluminium Frame", "56cm", P("Moved in", "mut"), "Finished Goods", "+20", "165", "Grant Jensen", "TRF-0031"],
] as const;

/** UZ_MODS › inv › "Transfer stock": [Ref, From, To, Items, Status] */
export const TRANSFER_ROWS = [
  ["TRF-0032", "Finished Goods", "Point of Sale", "8", P("In transit", "info")],
  ["TRF-0031", "Stores", "Finished Goods", "20", P("Received", "good")],
  ["TRF-0030", "Main Store", "Stores", "5", P("Not finished", "mut")],
] as const;

/** UZ_STOCK.transfers: details per transfer ref. Item key is "Product · Variant". */
export const TRANSFER_DETAILS: Record<string, { date: string; notes: string; rows: { key: string; qty: string; unit: string }[] }> = {
  "TRF-0032": { date: "2026-10-31", notes: "", rows: [{ key: "Carbon Road Frame · 54cm", qty: "8", unit: "Piece" }] },
  "TRF-0031": { date: "2026-10-26", notes: "", rows: [{ key: "Aluminium Frame · 56cm", qty: "20", unit: "Piece" }] },
  "TRF-0030": { date: "2026-10-24", notes: "Weekly resupply", rows: [{ key: "Bike Pump · Standard", qty: "5", unit: "Piece" }] },
};

/** UZ_MODS › inv › "Wastage": [Ref, Item, Qty, Reason, Value] */
export const WASTAGE_ROWS = [
  ["WST-0008", "Acrylic Paint", "4", "Expired", "1,868"],
  ["WST-0007", "Sole Shoes", "1", "Damaged", "2,219"],
  ["WST-0006", "Jersey", "2", "QC reject", "3,100"],
] as const;
