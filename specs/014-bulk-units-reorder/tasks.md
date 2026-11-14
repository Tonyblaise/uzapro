# Tasks: Breaking bulk and reorder points

**Input**: `specs/014-bulk-units-reorder/`. **Tests**: included.

## Phase 1: Setup

- [X] T001 Add `contains` to `ExtraUnitPrice` in `src/data/types/catalog.ts` and `ReorderRule` to `src/data/types/stock.ts`.

## Phase 2: Foundational

- [X] T002 Create `src/data/units.ts` (`unitFactor`, `containsLabel`, `defaultContains`).
- [X] T003 Seed `contains` from `EXTRA_UNITS` in `src/data/store/seed.ts`, and default it in `cleanVariants` in `src/data/commands/catalog.ts`.

## Phase 3: User Story 1 - Bulk units draw on the same stock (P1) 🎯 MVP

- [X] T004 [US1] Add `unit?` to `StockChange` and convert to base units in `findShortfall` and `applyStockChanges` in `src/data/store/stockOps.ts`.
- [X] T005 [US1] Pass the line's unit on every stock change in `src/data/commands/sales.ts`, `orders.ts`, `purchases.ts` and `stock.ts`.
- [X] T006 [US1] Add the "Contains" column to `src/features/products/ProductForm.tsx` and the bulk-unit lines to `src/features/products/ProductRecord.tsx`.
- [X] T007 [US1] Write `tests/unit/units.test.ts` and update existing unit and smoke tests whose stock arithmetic changes.

## Phase 4: User Story 2 - See what needs reordering (P1)

- [X] T008 [P] [US2] Create `src/data/fixtures/reorder.ts`, add `reorder` to `StockState` and seed it.
- [X] T009 [P] [US2] Create `src/data/reorder.ts` (pure rules).
- [X] T010 [US2] Create `src/data/commands/reorder.ts` (`saveReorderRule`, `removeReorderRule`) and `src/data/queries-reorder.ts`; export from `src/data/index.ts`; keep rules in step with product rename and delete in `src/data/commands/catalog.ts`.
- [X] T011 [US2] Add the "Reorder" tab in `src/config/modules.ts`; create `src/features/stock/ReorderList.tsx` and `ReorderForm.tsx`; register in `src/features/stock/screens.tsx`.

## Phase 5: User Story 3 - Draft purchase orders (P2)

- [X] T012 [US3] Add `createReorderDrafts` to `src/data/commands/reorder.ts` and the button to `ReorderList.tsx`.

## Phase 6: Tests and polish

- [X] T013 [P] Write `tests/unit/reorder.test.ts`.
- [X] T014 [P] Write `tests/smoke/reorder.spec.ts` and add the Reorder screens at 320px to `tests/smoke/responsive.spec.ts`.
- [X] T015 [P] Add the Help Center article and update counts in existing tests.
- [X] T016 Run the gates and fix what fails.
- [ ] T017 Walk through quickstart.md in the browser at 1440px and 375px. (Partly done: the Reorder screen was checked from a screenshot at 1440px and the 320px layout is covered by `responsive.spec.ts`; a hands-on walk-through is still open.)
