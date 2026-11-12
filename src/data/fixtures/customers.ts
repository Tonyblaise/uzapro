/** Customers seed, ported verbatim from design/canvas/erp-data.js (UZ_MODS cust › Customers). */
import { P } from "./_helpers";

/** [Name, Phone, Email, Address, Status] */
export const CUSTOMER_ROWS = [
  ["Morningview Bicycles", "+254 712 340 118", "orders@morningview.example", "Westlands, Nairobi", P("Active", "good")],
  ["Mountain Goats", "+254 733 208 561", "hello@mountaingoats.example", "Nyali, Mombasa", P("Active", "good")],
  ["Walk-in Customer", "—", "—", "—", P("Active", "good")],
] as const;

export const WALK_IN = "Walk-in Customer";
