/** Reference lists ported verbatim from design/canvas/erp-data.js. */

export const UZ_UNITS = [
  "Piece", "Bag", "Bale", "Bottle", "Box", "Bundle", "Can / Tin", "Carton", "Case", "Centilitre", "Centimetre", "Crate", "Day",
  "Dozen", "Each", "Foot", "Gram", "Gross", "Half Dozen", "Hectare", "Hour", "Jar", "Kilogram", "Kilolitre", "Kilometre", "Litre",
  "Metre", "Milligram", "Millilitre", "Millimetre", "Minute", "Month", "Pack", "Packet", "Pair", "Pallet", "Punnet", "Ream", "Roll",
  "Sachet", "Sack", "Session", "Square Centimetre", "Square Metre", "Tonne", "Tray", "Tube",
] as const;

/** Products sold without VAT. */
export const UZ_NONTAX = ["Bike Pump"];

export const UZ_PAYMETHODS = ["Cash", "M-Pesa", "Bank transfer", "Cheque", "Card"];

/** The new-sale form's extra payment option (design `salePay`). */
export const PAY_LATER = "Pay later (credit)";

export const UZ_REFUND = {
  reasons: ["Returned goods", "Damaged goods", "Wrong item", "Price adjustment", "Overcharged"],
  methods: ["Cash", "M-Pesa", "Bank transfer", "Store credit"],
};

export const UZ_VOID = ["Customer cancelled", "Entered by mistake", "Wrong amount", "Duplicate sale"];

export const UZ_LOC = { branches: ["Nairobi HQ", "Import"], types: ["Store", "Manufacturing", "Retail", "Transfer"] };

export const UZ_BIZ = {
  name: "Build by Blaise",
  type: "Retail",
  industry: "Bicycles & Accessories",
  email: "info@buildbyblaise.co.ke",
  phone: "+254 722 410 233",
  location: "Nairobi HQ",
  address: "Nairo Court, Mirema Drive",
  city: "Nairobi",
};

/** Wastage reasons (design `wReasons`). Default "Damaged". New reasons can be created in the form. */
export const WASTE_REASONS = ["Damaged", "Expired", "Lost", "Stolen", "Quality reject"];

/**
 * The demo's only login: the Owner (admin). Checked in the browser; this is a demo gate, not real
 * security (constitution › Technology Constraints, Auth). Other roles via the account menu's "View as".
 */
export const DEMO_LOGIN = { email: "demo@uzapro.com", password: "demo@123" } as const;
