/** Suppliers seed, ported verbatim from design/canvas/erp-data.js (UZ_MODS › vend › Suppliers). */
import { P } from "./_helpers";

/** [Name, Type, Phone, Email, Town or city, Status] */
export const SUPPLIER_ROWS = [
  ["Eastside Bicycle Supplies", "Business", "+254 722 410 233", "sales@eastside.example", "Nairobi", P("Active", "good")],
  ["Magaliesburg Wheels", "Business", "+254 733 901 442", "orders@magaliesburg.example", "Thika", P("Active", "good")],
  ["Road & Travel Tyres", "Business", "+254 711 560 317", "hello@roadtravel.example", "Mombasa", P("Active", "good")],
] as const;

/** UZ_NATIONS — the supplier form's Nationality list (default Kenya). */
export const UZ_NATIONS = ["Kenya", "Uganda", "Tanzania", "Rwanda", "Ethiopia", "South Africa", "China", "India", "United Arab Emirates"];
