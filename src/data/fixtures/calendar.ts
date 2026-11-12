/** Verbatim port of the design's `UZ_EVENTS` (design/canvas/erp-data.js) and the event form's types. */

/** [date, time, title, type, notes] — ids are "e{index}" as in the design. */
export const EVENT_ROWS = [
  ["2026-10-31", "", "Road & Travel Tyres bill due", "Accounts", "KES 1,918"],
  ["2026-11-01", "09:00", "Statement reminder email", "Marketing", "Goes to all customers with a balance"],
  ["2026-11-10", "10:00", "Stock count at Point of Sale", "Stock", "CNT-0015"],
  ["2026-11-12", "14:00", "Team meeting", "Work", ""],
  ["2026-11-18", "", "Purchase machinery due", "Work", "Store launch project"],
  ["2026-11-20", "", "VAT return due", "Accounts", "KES 164K to pay for October"],
  ["2026-11-24", "08:00", "Black Friday SMS goes out", "Marketing", "Gold and Silver customers"],
  ["2026-11-25", "", "Plan launch event due", "Work", "Store launch project"],
  ["2026-11-30", "", "Staff pay day", "Accounts", ""],
  ["2026-12-31", "", "Eastside Bicycle bill due", "Accounts", "KES 1,368"],
] as const;

/** Event form "Type" options (design `_calTypes`). */
export const CAL_TYPES = ["Work", "Accounts", "Stock", "Marketing"] as const;
