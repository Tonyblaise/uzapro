# Contract: data access

```ts
// src/data/orders.ts
export const DELIVERY_RETURN_REASONS: readonly string[];
export function orderLinesFromQuote(q: Quotation, products: readonly Product[]): { lines: NewOrderLine[]; skipped: number };
export function returnedQty(note: DeliveryNote, line: DeliveryLine): number;
export function returnable(note: DeliveryNote, order: SalesOrder | undefined, line: DeliveryLine): number;
export function checkReturn(note, order, qty: readonly number[], reason: string): string | null;

// src/data/commands/orders.ts
returnDelivery(input: { note: string; qty: number[]; reason: string }): Promise<Result<DeliveryReturn>>;
// "{RTN} recorded. {n} items back at {store}."
```
