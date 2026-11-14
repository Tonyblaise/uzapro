# Implementation Plan: Quotation to order, and returns against a delivery

**Branch**: `019-quote-to-order-returns` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

- **Quotation to order**: `orderLinesFromQuote()` (pure, in `src/data/orders.ts`) turns a
  quotation's product lines into order lines with the discount spread. `OrderForm` takes a `from`
  quotation; `createOrder` takes `convertedFrom` and stamps the quotation. `RecordView` gains a
  "Convert to order" action.
- **Returns**: `DeliveryNote.returns` and `checkReturn()` (pure). `returnDelivery` in
  `src/data/commands/orders.ts` puts stock back through `applyStockChanges` and lowers the order
  line's `dispatched`. `DeliveryView` gains "Record return" and a returns list.

## Technical Context

TypeScript strict, no new dependencies, in memory only. Tests: additions to
`tests/unit/orders.test.ts` and `tests/smoke/orders.spec.ts`. Read the Next.js guide in
`node_modules/next/dist/docs/` before touching routing.

## Constitution Check

| Principle | Status |
|---|---|
| I. Design fidelity | ✅ with recorded deviations (2 rows) |
| II. Data seam | ✅ no new seed; components use `@/data` |
| III. Ephemeral | ✅ |
| IV. Tokens and accessibility | ✅ existing primitives |
| V. Config-driven modules | ✅ no new tabs; UI inside `features/sales` |
| VI. Simplicity and types | ✅ two pure functions, one command, one option |

## Project Structure

```text
src/data/types/orders.ts          # DeliveryReturn; DeliveryNote.returns; NewOrder.convertedFrom
src/data/orders.ts                # orderLinesFromQuote, returnable, checkReturn, DELIVERY_RETURN_REASONS
src/data/commands/orders.ts       # createOrder(convertedFrom); returnDelivery
src/data/fixtures/orders.ts       # returns: [] on the seed note
src/features/sales/OrderForm.tsx, RecordView.tsx, DocumentLists.tsx, DeliveryView.tsx
src/data/fixtures/helpcenter.ts   # extend the sales orders article
tests/unit/orders.test.ts, tests/smoke/orders.spec.ts
```

## Complexity Tracking

No constitution violations to justify.
