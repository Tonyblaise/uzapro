# Implementation Plan: Van sales

**Branch**: `021-van-sales` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

A van is a store of the type "Van". `sales.visits` holds the route. `recordSale` gains an optional
`store` (and marks such sales "Field sales"); everything else about a sale (prices, credit, bulk
units, batches, shortfall) is reused. `src/data/visits.ts` (pure) builds the day summary.
`src/data/commands/visits.ts` adds a visit, sells on it and records no sale. UI:
`src/features/sales/FieldSales.tsx` and `VisitForm.tsx`.

## Technical Context

TypeScript strict, no new dependencies, in memory only. Tests: Vitest `tests/unit/visits.test.ts`;
Playwright `tests/smoke/fieldsales.spec.ts` (at phone width) and a 320px row in
`responsive.spec.ts`. Read the Next.js guide in `node_modules/next/dist/docs/` before touching
routing.

## Constitution Check

| Principle | Status |
|---|---|
| I. Design fidelity | ✅ with recorded deviations (3 rows) |
| II. Data seam | ✅ new seed recorded; the ported stock lines are not edited (the van load is applied on top) |
| III. Ephemeral | ✅ |
| IV. Tokens and accessibility | ✅ existing primitives; scanned at 320px |
| V. Config-driven modules | ✅ one tab added; UI inside `features/sales` |
| VI. Simplicity and types | ✅ one option on `recordSale`, one pure module |

## Project Structure

```text
src/config/modules.ts                # + Sales › Field sales
src/data/types/orders.ts             # Visit
src/data/types/sales.ts              # NewSale.store
src/data/fixtures/visits.ts          # seed van, van load and route (new)
src/data/visits.ts                   # pure: summary, van stock (new)
src/data/commands/visits.ts          # addVisit, sellOnVisit, noSaleOnVisit (new)
src/data/commands/sales.ts           # recordSale: optional store
src/data/queries-visits.ts           # hooks (new)
src/data/store/{state,seed}.ts       # sales.visits; the van store and its load
src/features/sales/FieldSales.tsx, VisitForm.tsx, screens.tsx
tests/unit/visits.test.ts, tests/smoke/fieldsales.spec.ts
```

## Complexity Tracking

No constitution violations to justify.
