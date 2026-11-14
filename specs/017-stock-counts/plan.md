# Implementation Plan: Stock counts

**Branch**: `016-batch-expiry` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

`stock.counts` holds counts. `src/data/counts.ts` (pure) works out variance, totals, type and
status. `src/data/commands/counts.ts` starts, saves, submits, approves, sends back and cancels;
approval applies each variance through the existing `applyStockChanges` with a "Counted" kind.
UI in `src/features/stock/`: `CountList.tsx`, `CountForm.tsx`, `CountView.tsx`.

## Technical Context

TypeScript strict, no new dependencies, in memory only. Tests: Vitest `tests/unit/counts.test.ts`;
Playwright `tests/smoke/counts.spec.ts` and a 320px row in `responsive.spec.ts`. Read the Next.js
guide in `node_modules/next/dist/docs/` before touching routing (`AGENTS.md`).

## Constitution Check

| Principle | Status |
|---|---|
| I. Design fidelity | ✅ with recorded deviations (2 rows) |
| II. Data seam | ✅ new seed recorded; components use `@/data` |
| III. Ephemeral | ✅ |
| IV. Tokens and accessibility | ✅ existing primitives; scanned at 320px |
| V. Config-driven modules | ✅ one tab added; UI inside `features/stock` |
| VI. Simplicity and types | ✅ one pure module, one command file |

## Project Structure

```text
src/config/modules.ts                 # + Stock › Stock counts
src/data/types/stock.ts               # StockCount, CountLine
src/data/fixtures/counts.ts           # seed (new)
src/data/counts.ts                    # pure rules (new)
src/data/commands/counts.ts           # commands (new)
src/data/queries-counts.ts            # hooks (new)
src/data/store/{state,seed,stockOps}.ts  # stock.counts; KIND.counted
src/features/stock/CountList.tsx, CountForm.tsx, CountView.tsx, screens.tsx
tests/unit/counts.test.ts, tests/smoke/counts.spec.ts
```

## Complexity Tracking

No constitution violations to justify.
