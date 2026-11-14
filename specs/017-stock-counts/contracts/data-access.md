# Contract: data access (counts)

```ts
// src/data/commands/counts.ts
startCount(store: string, products: string[]): Promise<Result<StockCount>>;          // "{ref} started."
saveCount(ref: string, counted: Record<string, number | null>): Promise<Result<void>>; // "{ref} saved."
submitCount(ref: string): Promise<Result<void>>;    // "{ref} sent for approval."
approveCount(ref: string): Promise<Result<void>>;   // "{ref} approved. Stock updated."
sendBackCount(ref: string): Promise<Result<void>>;  // "{ref} sent back for a recount."
cancelCount(ref: string): Promise<Result<void>>;    // "{ref} cancelled."

// src/data/queries-counts.ts
useCountRows(): CountRow[];   useCount(ref): CountRow | undefined;   useCountableProducts(store): { product, quantity }[];
```
