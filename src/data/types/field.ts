/** Field sales and their deliveries (feature 024, design `UZ_FIELD`). */

export interface FieldRep {
  name: string;
  phone: string;
  route: string;
  vehicle: string;
  /** false = off duty. Left out = on route. */
  active?: boolean;
}

export interface FieldLine {
  product: string;
  variant: string;
  qty: number;
  /** Unit price, VAT included. */
  price: number;
}

/**
 * Paid now (the rep collected, or already paid for a delivery), on delivery (the driver collects),
 * on credit (Receivables), or nothing to collect (a standalone delivery: a replacement, a sample…).
 */
export type FieldPayMode = "now" | "delivery" | "credit" | "none";

export interface FieldPay {
  mode: FieldPayMode;
  /** M-Pesa, Cash or Bank transfer when paid now; "" otherwise. */
  method: string;
  ref: string;
}

export type FieldDeliveryStatus = "Pending" | "Out for delivery" | "Delivered" | "Rescheduled" | "Cancelled";

export interface FieldHistory {
  /** "10 Nov 2026, 14:05" */
  when: string;
  what: string;
  who: string;
}

export interface FieldDelivery {
  ref: string; // DLV-####
  date: string; // ISO delivery date
  driver: string;
  status: FieldDeliveryStatus;
  note: string;
  outAt?: string;
  doneAt?: string;
  receivedBy?: string;
  collected?: { method: string; ref: string; amount: number };
  history: FieldHistory[];
}

export interface FieldSale {
  /** "delivery" for a delivery created on its own (Field sales › Deliveries › New delivery); its ref is the DLV- ref and it has no rep. */
  kind?: "delivery";
  /** A delivery's sale or invoice ("SAL-001184"), or "". */
  link?: string;
  ref: string; // FS-#### (or DLV-#### for a standalone delivery)
  date: string; // ISO
  time: string; // "HH:MM"
  rep: string;
  route: string;
  customer: string;
  phone: string;
  location: string;
  /** Store the goods leave at dispatch. */
  store: string;
  lines: FieldLine[];
  pay: FieldPay;
  delivery: FieldDelivery;
}

export interface NewFieldSale {
  customer: string;
  phone: string;
  location: string;
  lines: FieldLine[];
  store: string;
  /** ISO delivery date. */
  date: string;
  driver: string;
  note: string;
  rep: string;
  route: string;
  pay: FieldPayMode;
  method: string;
  ref: string;
}

/** New or edited sales rep (design `fr`). */
export interface NewFieldRep {
  name: string;
  phone: string;
  route: string;
  vehicle: string;
  active: boolean;
}

/** How a standalone delivery is paid (design New delivery). */
export type DeliveryPay = "paid" | "delivery" | "none";

/** "New delivery" on Field sales › Deliveries (design `fs` in delivery mode). */
export interface NewDelivery {
  /** Sale or invoice ref it's for, or "". */
  link: string;
  customer: string;
  phone: string;
  location: string;
  lines: FieldLine[];
  store: string;
  date: string;
  driver: string;
  note: string;
  pay: DeliveryPay;
}
