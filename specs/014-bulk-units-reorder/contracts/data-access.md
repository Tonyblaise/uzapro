# Contract: data access (bulk units and reorder)

## `src/data/units.ts`

```ts
export function unitFactor(products: readonly Product[], product: string, variant: string, unit: string | undefined): number;
export function containsLabel(v: Pick<Variant, "unit">, u: ExtraUnitPrice): string;   // "Carton of 10 Piece"
export function defaultContains(basePrice: number, unitPrice: number): number;
```

## `src/data/reorder.ts`

```ts
export function onOrderQty(orders: readonly PurchaseOrder[], products: readonly Product[], product: string, store: string): number;
export function reorderPosition(rule: ReorderRule, onHand: number, onOrder: number, factor: number): ReorderPosition;
export function validateRule(rule: ReorderRule, rules: readonly ReorderRule[], products: readonly Product[], editing?: ReorderRule): string | null;
```

## Hooks (`src/data/queries-reorder.ts`)

`useReorderRows()` → rules with their position; `useReorderCount()` → how many have a suggestion.

## Commands (`src/data/commands/reorder.ts`)

```ts
saveReorderRule(rule: ReorderRule, editing?: { product: string; store: string }): Promise<Result<void>>;  // "Reorder point saved."
removeReorderRule(product: string, store: string): Promise<Result<void>>;                                // "Reorder point removed."
createReorderDrafts(): Promise<Result<string[]>>;   // PO refs; "{n} draft purchase orders created." …
```
