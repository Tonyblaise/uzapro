import type { Pill } from "./common";

export interface Store {
  name: string;
  branch: string;
  /** Seed types are Store, Manufacturing, Retail and Transfer; the warehouse form can create more (design `newLocType`). */
  type: string;
}

/** On-hand quantity of a product in a store (research R11: product + store granularity). */
export interface StockLevel {
  product: string;
  store: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  date: string; // ISO date
  product: string;
  variant: string;
  kind: Pill; // Sold, Moved out, Moved in, Received, Counted, Damaged or lost
  store: string;
  change: number;
  left: number;
  by: string;
  ref: string;
}

export interface StockItem {
  product: string;
  variant: string;
  qty: number;
  unit: string;
}

/** "Confirmed" is what the design's "Confirm transfer" button sets (trFinish); the seed uses "Not finished". */
export type TransferStatus = "Not finished" | "Confirmed" | "In transit" | "Received" | "Cancelled";

export interface Transfer {
  ref: string;
  from: string;
  to: string;
  date: string; // ISO
  notes: string;
  items: StockItem[];
  status: TransferStatus;
}

export interface WastageItem extends StockItem {
  reason: string;
}

export interface Wastage {
  ref: string;
  location: string;
  date: string;
  notes: string;
  items: WastageItem[];
  /** Total value at cost, KES. */
  value: number;
  /** Recorded in this session: "Undo" returns its stock (design `_wasteInfo`). Seed rows are only removed. */
  session?: boolean;
}

export interface NewTransfer {
  from: string;
  to: string;
  date: string;
  notes: string;
  items: StockItem[];
}

export interface NewWastage {
  location: string;
  notes: string;
  items: WastageItem[];
}

export interface NewStockIn {
  store: string;
  supplier?: string;
  notes?: string;
  items: StockItem[];
}

/** A reorder point for a product at a store (feature 014). Quantities are in base units. */
export interface ReorderRule {
  product: string;
  /** The variant to order (stock is counted per product and store). */
  variant: string;
  store: string;
  /** Reorder at or below this. */
  min: number;
  /** Order up to this. */
  max: number;
  /** Order unit: the base unit or one of the variant's bulk units. */
  unit: string;
  /** "" = not set. */
  supplier: string;
}

export interface NewStore {
  name: string;
  branch: string;
  type: string;
}
