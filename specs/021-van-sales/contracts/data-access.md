# Contract: data access

```ts
// src/data/visits.ts
export const VAN_TYPE = "Van";  export const NO_SALE_REASONS: readonly string[];
export function daySummary(visits, sales, van, date): { done, total, sold, cash, mpesa, credit };

// src/data/commands/visits.ts
addVisit(customer: string, van: string): Promise<Result<Visit>>;                       // "{customer} added to the route."
sellOnVisit(id: string, sale: Omit<NewSale, "customer" | "store">): Promise<Result<Sale>>;
noSaleOnVisit(id: string, reason: string): Promise<Result<void>>;                      // "No sale recorded for {customer}."

// src/data/queries-visits.ts
useVans(): string[];  useVisits(van, date?): Visit[];  useVanStock(van): { product, quantity }[];  useDaySummary(van, date?)
```
