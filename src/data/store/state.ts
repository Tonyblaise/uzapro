import type {
  AiChat,
  FeatureIdea,
  SupportTicket,
  TicketPriority,
  BusinessProfile,
  Branch,
  CalEvent,
  DocFile,
  Folder,
  GenericRow,
  Group,
  Profile,
  TerminalsState,
  Account,
  Deposit,
  Expense,
  ExpenseCategory,
  LedgerEntry,
  MoneyTransfer,
  RecurringExpense,
  VoidedExpense,
  Withdrawal,
  Credit,
  Payable,
  MoneyPayment,
  Plan,
  Receivable,
  StatementFilter,
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
}

export interface MoneyState {
  receivables: Receivable[];
  payables: Payable[];
  rcvPayments: MoneyPayment[];
  payPayments: MoneyPayment[];
  rcvPlans: Plan[];
  payPlans: Plan[];
  customerCredits: Credit[];
  supplierCredits: Credit[];
  /** Applied Receivables statement filter (design `rcvStmt`). */
  statement: StatementFilter;
}

export interface AccountsState {
  accounts: Account[];
  /** Newest first. */
  ledger: LedgerEntry[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  transfers: MoneyTransfer[];
  /** Bank or provider options (UZ_BANKS, can grow from the account form). */
  banks: string[];
}

export interface ExpensesState {
  expenses: Expense[];
  voided: VoidedExpense[];
  recurring: RecurringExpense[];
  categories: ExpenseCategory[];
}

export interface CalendarState {
  events: CalEvent[];
  /** The four seed types plus any added from the form. */
  types: string[];
}

export interface DocsState {
  folders: Folder[];
  files: DocFile[];
  /** Ids of starred files and folders. */
  starred: string[];
}

export interface SettingsState {
  biz: BusinessProfile;
  groups: Group[];
  branches: Branch[];
  /** POS sales on/off per storage location (`stock.stores` name). Missing = storage only. */
  pos: Record<string, boolean>;
  terminals: TerminalsState;
  /** Storage location types (`UZ_LOC.types`, can grow from the dialogs). */
  locTypes: string[];
}

export interface AppState {
  session: SessionState;
  catalog: CatalogState;
  stock: StockState;
  sales: SalesState;
  customers: Customer[];
  suppliers: Supplier[];
  purchases: PurchasesState;
  money: MoneyState;
  accounts: AccountsState;
  expenses: ExpensesState;
  calendar: CalendarState;
  docs: DocsState;
  settings: SettingsState;
  /** Per-role profile (design `_profiles`); the session role's profile is the current user. */
  profiles: Record<RoleId, Profile>;
  /** Generic table rows keyed "{moduleId}/{tabSlug}". */
  generic: Record<string, GenericRow[]>;
  ui: UiState;
  /** Uza AI panel: chats, support tickets, feature ideas and where the panel is (feature 008). */
  ai: AiState;
}

export type AiTab = "chat" | "support" | "features";
export type FeaturesTabName = "Roadmap" | "My ideas" | "Browse" | "New";

export interface AiState {
  chats: AiChat[];
  tickets: SupportTicket[];
  ideas: FeatureIdea[];
  votes: Record<string, boolean>;
  mine: Record<string, boolean>;
  seq: number;
  open: boolean;
  tab: AiTab;
  view: "list" | "chat";
  /** null = a new, empty chat. */
  chatId: string | null;
  draft: string;
  file: string | null;
  typing: boolean;
  filter: "all" | "week";
  support: {
    view: "list" | "new" | "ticket";
    ref: string | null;
    form: { subject: string; priority: TicketPriority; body: string };
    error: string;
    reply: string;
  };
  features: {
    tab: FeaturesTabName;
    q: string;
    form: { title: string; outcome: string; tags: string };
    checked: boolean;
    error: string;
  };
}
