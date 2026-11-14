# Implementation Plan: Batch and expiry tracking

**Branch**: `016-batch-expiry` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

`stock.batches` holds batches. A pure module, `src/data/batches.ts`, works out status, in-date
stock and which batches a movement uses. The two stock functions every movement already goes
through (`findShortfall`, `applyStockChanges` in `src/data/store/stockOps.ts`) call it, so sales
skip expired stock and all outgoing stock reduces batches without any caller changing. Commands in
`src/data/commands/batches.ts` record, remove and write off. UI: `src/features/stock/ExpiryList.tsx`
and `BatchForm.tsx`.

## Technical Context

TypeScript strict, no new dependencies, in memory only. Tests: Vitest `tests/unit/batches.test.ts`;
Playwright `tests/smoke/expiry.spec.ts` and a 320px row in `responsive.spec.ts`. Read the Next.js
guide in `node_modules/next/dist/docs/` before touching routing (`AGENTS.md`).

## Constitution Check

| Principle | Status |
|---|---|
| I. Design fidelity | ✅ with recorded deviations (3 rows) |
| II. Data seam | ✅ new seed recorded; components use `@/data` |
| III. Ephemeral | ✅ |
| IV. Tokens and accessibility | ✅ existing primitives; scanned at 320px |
| V. Config-driven modules | ✅ one tab added; UI inside `features/stock` |
| VI. Simplicity and types | ✅ one pure module; the rule lives in two existing functions |

## Project Structure

```text
src/config/modules.ts                 # + Stock › Expiry
src/data/types/stock.ts               # StockBatch; StockItem.batchId
src/data/fixtures/batches.ts          # seed (new)
src/data/batches.ts                   # pure rules (new)
src/data/store/stockOps.ts            # in-date shortfall; consume batches
src/data/store/{state,seed}.ts        # stock.batches
src/data/commands/batches.ts          # record, remove, write off (new)
src/data/commands/{stock,catalog}.ts  # wastage passes a batch; rename and delete follow
src/data/queries-batches.ts           # hooks (new)
src/features/stock/ExpiryList.tsx, BatchForm.tsx, screens.tsx
tests/unit/batches.test.ts, tests/smoke/expiry.spec.ts
```

## Complexity Tracking

No constitution violations to justify.
