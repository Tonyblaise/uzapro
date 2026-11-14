# Implementation Plan: Breaking bulk and reorder points

**Branch**: `014-bulk-units-reorder` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

- **Bulk units**: `ExtraUnitPrice` gains `contains`. `StockChange` gains an optional `unit`, and
  `findShortfall` / `applyStockChanges` convert to base units in one place
  (`src/data/store/stockOps.ts`). Every caller passes the line's unit. Nothing else about stock
  changes.
- **Reorder**: `stock.reorder` holds the lines. `src/data/reorder.ts` works out on order,
  suggestion and status (pure, unit tested). `src/data/commands/reorder.ts` saves and removes lines
  and creates draft purchase orders through the existing `savePurchaseOrder`.
- **UI**: a "Contains" column in the product form, a line in the product record, and
  `src/features/stock/ReorderList.tsx` + `ReorderForm.tsx` for the new tab.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22. **Dependencies**: unchanged, none added.
**Storage**: none (in memory).

**Testing**: Vitest `tests/unit/units.test.ts` (conversion through every command) and
`tests/unit/reorder.test.ts` (on order, suggestion, status, drafts). Playwright
`tests/smoke/reorder.spec.ts` and a 320px row in `responsive.spec.ts`. Existing tests that sell
or dispatch bulk units are updated for the new stock arithmetic.

**Constraints**: read the relevant Next.js guide in `node_modules/next/dist/docs/` before touching
routing (`AGENTS.md`); components use `@/data` only; tokens only.

## Constitution Check

| Principle | Check | Status |
|---|---|---|
| I. Design fidelity | No canvas screens; added at the user's request; spec › Design deviations (5 rows). | ✅ with recorded deviations |
| II. Data seam | `contains` is derived from the design's own unit multipliers. Reorder seed is new and recorded. | ✅ with recorded deviation |
| III. Ephemeral | In memory, no storage keys. | ✅ |
| IV. Tokens and accessibility | Existing primitives; scanned at 320 and 1440px. | ✅ |
| V. Config-driven modules | One tab added; UI inside `features/stock` and `features/products`. | ✅ |
| VI. Simplicity and types | Conversion in one function; one pure module; no new dependencies. | ✅ |

## Project Structure

```text
src/
├── config/modules.ts                 # + Stock › Reorder
├── data/
│   ├── types/catalog.ts              # ExtraUnitPrice.contains
│   ├── types/stock.ts                # ReorderRule
│   ├── units.ts                      # unitFactor, toBase, unitLabel (new)
│   ├── store/stockOps.ts             # StockChange.unit; conversion
│   ├── store/{state,seed}.ts         # contains from EXTRA_UNITS; stock.reorder
│   ├── fixtures/reorder.ts           # seed lines (new)
│   ├── reorder.ts                    # pure rules (new)
│   ├── commands/reorder.ts           # save, remove, create drafts (new)
│   ├── commands/{sales,orders,purchases,stock,catalog}.ts  # pass the unit; keep rules in step
│   ├── queries-reorder.ts            # hooks (new)
│   └── fixtures/helpcenter.ts        # + article
├── features/
│   ├── products/ProductForm.tsx      # "Contains" column
│   ├── products/ProductRecord.tsx    # what each bulk unit contains
│   └── stock/ReorderList.tsx, ReorderForm.tsx, screens.tsx
tests/unit/{units,reorder}.test.ts, tests/smoke/reorder.spec.ts
```

## Complexity Tracking

No constitution violations to justify.
