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

/** Paid now (the rep collected), on delivery (the driver collects) or on credit (Receivables). */
export type FieldPayMode = "now" | "delivery" | "credit";

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
  ref: string; // FS-####
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
