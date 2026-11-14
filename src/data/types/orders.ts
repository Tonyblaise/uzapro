/** Sales orders and delivery notes (feature 013, specs/013-sales-orders-dispatch/data-model.md). */
import type { CreditApproval } from "./pricing";

export interface OrderLine {
  product: string;
  variant: string;
  unit: string;
  /** Quantity ordered (> 0). */
  qty: number;
  rate: number;
  taxable: boolean;
  /** 0 … qty. */
  dispatched: number;
  /** 0 … dispatched. */
  invoiced: number;
}

export interface SalesOrder {
  /** SO-0001 … */
  number: string;
  customer: string;
  date: string; // ISO
  deliverBy: string; // ISO
  /** The store the goods leave from. */
  store: string;
  lines: OrderLine[];
  notes: string;
  /** Total with VAT, rounded. */
  amount: number;
  by: string;
  /** Only possible while nothing is dispatched. */
  cancelled: boolean;
  creditApproval?: CreditApproval;
  /** Invoice numbers raised from this order. */
  invoices: string[];
}

export interface DeliveryLine {
  product: string;
  variant: string;
  unit: string;
  qty: number;
}

/** Goods that came back from a delivery (feature 019). */
export interface DeliveryReturn {
  /** RTN-0001 … */
  ref: string;
  date: string; // ISO
  by: string;
  reason: string;
  lines: DeliveryLine[];
}

export interface DeliveryNote {
  /** DN-0001 … */
  number: string;
  order: string;
  customer: string;
  store: string;
  date: string; // ISO
  lines: DeliveryLine[];
  driver: string;
  vehicle: string;
  notes: string;
  delivered: boolean;
  /** Proof of delivery: who received the goods, and when ("10 Nov 2026, 14:05"). */
  receivedBy?: string;
  deliveredAt?: string;
  by: string;
  /** Returns recorded against this note, oldest first (feature 019). */
  returns: DeliveryReturn[];
}

/** A stop on a rep's route for the day (feature 021). */
export interface Visit {
  /** VIS-0001 … */
  id: string;
  date: string; // ISO
  customer: string;
  /** The van (a storage location of the type "Van") the rep sells from. */
  van: string;
  rep: string;
  status: "Planned" | "Sold" | "No sale";
  /** The sale made on the visit. */
  sale?: string;
  /** Why nothing was sold. */
  reason?: string;
  /** Time the visit was closed ("14:05"). */
  at?: string;
}

export type NewOrderLine = Pick<OrderLine, "product" | "variant" | "unit" | "qty" | "rate" | "taxable">;

export interface NewOrder {
  customer: string;
  date: string;
  deliverBy: string;
  store: string;
  lines: NewOrderLine[];
  notes: string;
  /** Approval of a credit stop (feature 012). */
  approval?: { reason: string };
  /** The quotation this order is converted from (feature 019). */
  convertedFrom?: string;
}

export interface NewDispatch {
  order: string;
  /** Quantity to send per order line, by line index. */
  qty: number[];
  driver: string;
  vehicle: string;
  notes: string;
}
