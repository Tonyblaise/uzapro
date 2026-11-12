/** Purchases seed, ported verbatim from design/canvas/erp-data.js (UZ_MODS › buy tabs, UZ_BUY). */
import { P } from "./_helpers";

/** "Purchase orders": [Supplier, Ref, Total, Received, Status] */
export const PO_ROWS = [
  ["Eastside Bicycle", "PUR-ORD-0409", "1,368", P("Full", "good"), P("Completed", "good")],
  ["Magaliesburg Wheels", "PUR-ORD-0408", "228", P("Partial", "warn"), P("To receive", "info")],
  ["Croma", "PUR-ORD-0372", "640,000", P("Full", "good"), P("Approved", "good")],
] as const;

/** "Goods receipts": [Ref, PO, Supplier, Location, Lines, Status] */
export const GRN_ROWS = [
  ["GRN-0041", "PUR-ORD-0409", "Eastside Bicycle Supplies", "Finished Goods", "1", P("Saved", "good")],
  ["GRN-0040", "PUR-ORD-0408", "Magaliesburg Wheels", "Stores", "2", P("Partial", "warn")],
] as const;

/** "Purchase returns": [Ref, Supplier, Purchase order, Goods receipt, Reason, Qty, Value (KES), Status] */
export const PRT_ROWS = [
  ["PRT-0005", "Magaliesburg Wheels", "PUR-ORD-0408", "GRN-0040", "Damaged", "3", "684", P("Approved", "good")],
  ["PRT-0004", "Eastside Bicycle", "PUR-ORD-0409", "GRN-0041", "Wrong item", "2", "912", P("Waiting approval", "warn")],
] as const;

/** "Rejected items": [Ref, Goods receipt, Supplier, Item, Qty, Reason, Status] */
export const REJ_ROWS = [
  ["REJ-0003", "GRN-0041", "Eastside Bicycle Supplies", "Carbon Road Frame · 54cm", "1", "Scratched frame", P("Sent back", "info")],
  ["REJ-0002", "GRN-0040", "Magaliesburg Wheels", "Racing Wheelset · 700c", "1", "Wrong size", P("Waiting", "warn")],
] as const;

export const UZ_BUY = {
  leadTime: "6d",
  rejected: 2,
  spendDelta: "▲ 14.6% vs last month",
  orders: { l: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], v: [2, 3, 1, 4, 3, 2], max: 5 },
  spend: { l: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], v: [410, 520, 480, 610, 560, 642], max: 800, step: 200 },
  onTime: { Croma: 96, "Eastside Bicycle": 92, "Magaliesburg Wheels": 74 } as Record<string, number>,
} as const;

/** Highest Payables reference in the design's seed (PYB-0014); receipts name the next bill (FR-018). */
export const PYB_LAST = 14;
