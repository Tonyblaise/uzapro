# Contract: Data-access additions (`@/data`)

This extends `specs/001-dashboard-sales-stock/contracts/data-access.md`. The same rules apply:
UI imports only `@/data`; commands return `Promise<Result<T>>` with the design's message.

## Reads

```ts
useSupplierList(): Supplier[]                 // all, in list order
useSuppliers(): readonly string[]             // active names (existing hook, now slice-backed)
usePurchaseOrders(): PurchaseOrder[]
usePurchaseOrder(ref: string | null): PurchaseOrder | undefined
useGoodsReceipts(): GoodsReceipt[]
useGoodsReceipt(ref: string | null): GoodsReceipt | undefined
usePurchaseReturns(): PurchaseReturn[]
useRejectedItems(): RejectedItem[]
canReturn(grn: GoodsReceipt): Record<string, number>   // per line key: accepted − returned
purchasesOverviewData(): PurchasesOverviewData          // frozen KPIs + UZ_BUY charts
```

## Commands

```ts
// Suppliers
saveSupplier(input: NewSupplier, edit?: string): Promise<Result<Supplier>>   // "{name} added." | "Changes saved."
setSupplierActive(name: string, active: boolean): Promise<Result<void>>
addNation(name: string): string

// Purchase orders
savePurchaseOrder(input: NewPurchaseOrder, opts: { approve: boolean; edit?: string }): Promise<Result<PurchaseOrder>>
acceptPurchaseOrder(ref: string): Promise<Result<PurchaseOrder>>
receiveGoods(ref: string, input: NewReceipt): Promise<Result<GoodsReceipt>>  // "{GRN} saved. {n} accepted into {store}.[ {PYB} added to Payables.]"

// Returns & rejected items
createPurchaseReturn(input: NewPurchaseReturn, approve: boolean): Promise<Result<PurchaseReturn>>
approvePurchaseReturn(ref: string): Promise<Result<PurchaseReturn>>
markRejected(ref: string, outcome: "Sent back" | "Replaced" | "Written off"): Promise<Result<RejectedItem>>

// Changed from feature 001
sendStockToPurchases(input: NewStockIn): Promise<Result<GoodsReceipt>>      // adds a Waiting GRN, "Sent to Purchases."
```

## Invariants

- Accepted ≤ received ≤ outstanding per PO line, and a return ≤ "Can return" per GRN line.
- Only accepted quantities change stock. Approved returns reduce stock, never below 0.
- References follow `nextRef` per list: `PUR-ORD-`, `GRN-`, `PRT-`, `REJ-`.
- No Payables or Accounts records are created (FR-018).
