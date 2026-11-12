# Contract: Data-access layer (`@/data`)

This is the only module UI code may import data from (Principle II). Signatures are written
in TypeScript notation, and types are defined in `data-model.md`. Command bodies are
in-memory now and will be replaced by API calls later **without changing these
signatures**.

## Reads

```ts
// Session & config
useSession(): { authed: boolean; role: Role; remember: boolean }
useVisibleModules(): Module[]                       // role-filtered registry
useVisibleTabs(moduleId: ModuleId): Tab[]

// Fixed overviews (frozen figures, research R9)
getDashboard(): Promise<DashboardData>
getSalesOverview(): Promise<SalesOverview>
getProductsOverview(): Promise<ProductsOverview>
getStockOverview(): Promise<StockOverviewFixed>

// Live lists (selector hooks; re-render on change)
useProducts(): ProductRow[]                         // name, category, displayPrice, onHand, status
useProduct(name: string): ProductDetail | undefined // incl. variants + movement history
useCategories(): Category[]
useUnits(): string[]
useStores(): Store[]
useStockLevels(f: { store: string | 'All stores'; level: 'all' | 'low' | 'out' }): StockLevelRow[]
useMovements(f?: { product?: string; limit?: number }): StockMovement[]
useTransfers(): Transfer[]
useWastage(): Wastage[]
useCustomers(): Customer[]
useSales(): Sale[]
useQuotations(): Quotation[]
useInvoices(): Invoice[]
useCreditNotes(): CreditNote[]
useVoids(): VoidRecord[]
useTargets(): SalesTarget[]
useRecentActivity(kind: 'Sale' | 'Purchase'): ActivityRow[]   // dashboard recent tabs
```

## Commands

All commands return `Promise<Result<T>>`, never throw for validation failures, and put the
design's exact wording in `message`. The caller shows `message` as a toast on success, or
inline or as a toast on failure, as the design does.

```ts
// Session
login(input: { id: string; password: string; remember: boolean }): Promise<Result<Role>>
requestPasswordReset(id: string): Promise<Result<void>>
switchRole(role: RoleId): Promise<Result<Role>>
signOut(): Promise<Result<void>>

// Catalogue
createProduct(input: NewProduct): Promise<Result<Product>>
createCategory(input: NewCategory): Promise<Result<Category>>
updateCategory(name: string, patch: Partial<NewCategory>): Promise<Result<Category>>
deleteCategory(name: string): Promise<Result<void>>
createUnit(name: string): Promise<Result<string>>

// Stock
addStock(input: { store: string; supplier?: string; notes?: string; items: Item[] }): Promise<Result<void>>
createTransfer(input: NewTransfer, mode: 'confirm' | 'ship' | 'shipAndReceive'): Promise<Result<Transfer>>
receiveTransfer(ref: string): Promise<Result<Transfer>>
cancelTransfer(ref: string): Promise<Result<Transfer>>
recordWastage(input: NewWastage): Promise<Result<Wastage>>

// Sales & customers
createCustomer(input: NewCustomer): Promise<Result<Customer>>
recordSale(input: NewSale): Promise<Result<Sale>>          // also decrements stock (FR-018)
voidSale(ref: string, reason: string): Promise<Result<VoidRecord>>
createQuotation(input: NewDocument): Promise<Result<Quotation>>
createInvoice(input: NewDocument): Promise<Result<Invoice>>
createCreditNote(input: NewCreditNote): Promise<Result<CreditNote>>
approveCreditNote(number: string): Promise<Result<CreditNote>>
deleteTarget(id: number): Promise<Result<void>>

// Simulated document actions (toast only)
printDocument(ref: string): Promise<Result<void>>          // "Opening print for …"
downloadPdf(ref: string): Promise<Result<void>>            // "Downloading …"
```

## Invariants every command enforces

- Stock never goes below 0 at any store.
- Names (product, category, unit, customer) are unique, compared case-insensitively.
- New references follow the `nextRef` rule (research R12).
- `by` / `addedBy` fields use the current role's `name`.
- Commands only touch the in-memory store. Nothing is written to storage except the session
  keys listed in research R8.
