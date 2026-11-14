# Contract: data access (batches)

```ts
// src/data/batches.ts
export const SOON_DAYS = 30;
export function daysLeft(expiry: string, today?: string): number;
export function batchStatus(b: Pick<StockBatch, "expiry">, today?: string): Pill;
export function daysLeftLabel(expiry: string, today?: string): string;
export function expiredQty(batches, product, store, today?): number;
export function unbatchedQty(level: number, batches, product, store): number;
export function consume(batches, product, store, qty, opts: { sold: boolean; batchId?: string; today?: string }): StockBatch[];
export function validateBatch(input, batches, level): string | null;

// src/data/commands/batches.ts
recordBatch(input: NewBatch): Promise<Result<StockBatch>>;   // "Batch {no} recorded."
removeBatch(id: string): Promise<Result<void>>;              // "Batch {no} removed."
writeOffBatch(id: string): Promise<Result<void>>;            // "Batch {no} written off."

// src/data/queries-batches.ts
useBatchRows(): (StockBatch & { days: number; daysLabel: string; status: Pill })[];
```
