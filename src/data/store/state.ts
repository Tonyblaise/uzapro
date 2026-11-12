import type {
  GoodsReceipt,
  PurchaseOrder,
  PurchaseReturn,
  RejectedItem,
  Supplier,
  Category,
  CreditNote,
  Customer,
  Invoice,
  Product,
  Quotation,
  RoleId,
  Sale,
  SalesTarget,
  StockLevel,
  StockMovement,
  Store,
  Transfer,
  VoidRecord,
  Wastage,
} from "../types";

export interface SessionState {
  authed: boolean;
  role: RoleId;
  remember: boolean;
  /** False until browser-only settings (uzAuth, uzNavClosed) have been read after mount. */
  hydrated: boolean;
  navClosed: Record<string, boolean>;
}

export interface CatalogState {
  products: Product[];
  categories: Category[];
  /** Units of measure, seeded from UZ_UNITS (the Units tab lists and edits them in place). */
  units: string[];
  /** Extra wastage reasons created in the form during the session. */
  extraWasteReasons: string[];
}

export interface StockState {
  stores: Store[];
  levels: StockLevel[];
  movements: StockMovement[];
  transfers: Transfer[];
  wastage: Wastage[];
}

export interface SalesState {
  sales: Sale[];
  saleNo: number;
  quotations: Quotation[];
  invoices: Invoice[];
  creditNotes: CreditNote[];
  voids: VoidRecord[];
  targets: SalesTarget[];
}

export interface UiState {
  toast: { id: number; text: string } | null;
  /** Header search text; filters the current tab's table (FR-026a, T086). */
  search: string;
}

export interface PurchasesState {
  orders: PurchaseOrder[];
  receipts: GoodsReceipt[];
  returns: PurchaseReturn[];
  rejected: RejectedItem[];
  /** Nationality options for the supplier form (UZ_NATIONS, can grow). */
  nations: string[];
  /** Last Payables number used in receipt messages (no Payables records; FR-018). */
  pybNo: number;
}

export interface AppState {
  session: SessionState;
  catalog: CatalogState;
  stock: StockState;
  sales: SalesState;
  customers: Customer[];
  suppliers: Supplier[];
  purchases: PurchasesState;
  ui: UiState;
}
