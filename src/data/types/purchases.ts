/** Purchases and Suppliers types (specs/002-purchases-suppliers/data-model.md). */
import type { Pill } from "./common";

export type SupplierType = "Individual" | "Business";

export interface Supplier {
  name: string;
  type: SupplierType;
  phone: string; // "—" when empty
  email: string;
  town: string;
  nation: string;
  address: string;
  county: string;
  postal: string;
  status: Pill; // Active / Inactive
}

export interface NewSupplier {
  name: string;
  type: SupplierType;
  phone: string;
  email: string;
  town: string;
  nation: string;
  address: string;
  county: string;
  postal: string;
  active: boolean;
}

export type PoStatus = "Draft" | "Approved" | "To receive" | "Accepted" | "Completed" | "Cancelled";
export type PoReceived = "None" | "Partial" | "Full";

export interface PoLine {
  id: string;
  /** "Product · Variant", or the design's seed placeholder "Items on {ref}". */
  key: string;
  qty: number;
  unit: string;
  cost: number;
  /** Quantity received so far (all receipts). */
  recv: number;
}

export interface PurchaseOrder {
  ref: string;
  supplier: string;
  store: string;
  date: string; // ISO
  expected: string; // ISO or ""
  notes: string;
  term: string;
  method: string;
  account: string;
  paid: boolean;
  lines: PoLine[];
  total: number;
  received: Pill; // None / Partial / Full
  status: Pill;
  /** [title, detail] — "Order created", "Sent to supplier", "Accepted", "Goods received"… */
  activity: [string, string][];
  grns: string[];
}

export interface NewPurchaseOrder {
  supplier: string;
  store: string;
  date: string;
  expected: string;
  notes: string;
  term: string;
  method: string;
  account: string;
  paid: boolean;
  /** `id`/`recv` carry an edited order's existing lines over (design `poOpen` copies them). */
  lines: { key: string; qty: number; unit: string; cost: number; id?: string; recv?: number }[];
}

export interface GrnLine {
  key: string;
  unit: string;
  ordered: number;
  recv: number;
  acc: number;
  rej: number;
  cost: number;
}

export interface GoodsReceipt {
  ref: string;
  /** Purchase order ref, or "—" for receipts sent from Stock in. */
  po: string;
  supplier: string;
  store: string;
  date: string; // ISO
  dn: string; // delivery note no.
  inv: string; // supplier invoice no.
  notes: string;
  who: string;
  lines: GrnLine[];
  lineCount: number;
  status: Pill; // Saved / Partial / Waiting
  /** Returned quantity per line key (purchase returns). */
  returned: Record<string, number>;
  /** True for receipts saved in this session (the design's `doc.grns[ref]`); seed receipts have none. */
  session?: boolean;
}

export interface NewReceipt {
  store: string;
  date: string;
  dn: string;
  inv: string;
  notes: string;
  /** Per PO line id: quantities received and accepted in this receipt (rejected = recv − acc). */
  lines: { id: string; recv: number; acc: number }[];
}

export interface ReturnLine {
  key: string;
  unit: string;
  qty: number;
  cost: number;
}

export interface PurchaseReturn {
  ref: string;
  supplier: string;
  po: string;
  grn: string;
  reason: string;
  notes: string;
  lines: ReturnLine[];
  qty: number;
  value: number;
  status: Pill; // Waiting approval / Approved
  store: string;
  date: string; // display "10 Nov 2026, 14:05"
  /** Display "10 Nov 2026, 14:05" once approved (design `doc.approvedAt`). */
  approvedAt?: string;
}

export interface NewPurchaseReturn {
  grn: string;
  reason: string;
  notes: string;
  lines: { key: string; qty: number }[];
}

export type RejectedOutcome = "Sent back" | "Replaced" | "Written off";

export interface RejectedItem {
  ref: string;
  grn: string;
  supplier: string;
  item: string;
  qty: number;
  reason: string;
  status: Pill; // Waiting / Sent back / Replaced / Written off
}
