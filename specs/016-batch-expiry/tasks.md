# Tasks: Batch and expiry tracking

- [X] T001 Add `StockBatch` and `NewBatch` to `src/data/types/stock.ts`, and `batchId?` to `StockItem`.
- [X] T002 [P] Create `src/data/fixtures/batches.ts`; add `batches` to `StockState` in `src/data/store/state.ts` and seed it in `src/data/store/seed.ts`.
- [X] T003 [P] Create `src/data/batches.ts` (pure rules).
- [X] T004 [US3] Use it in `src/data/store/stockOps.ts`: in-date shortfall for sales; consume batches on outgoing changes.
- [X] T005 [US2] Create `src/data/commands/batches.ts` (`recordBatch`, `removeBatch`) and `src/data/queries-batches.ts`; export from `src/data/index.ts`; follow product rename and delete in `src/data/commands/catalog.ts`.
- [X] T006 [US4] Add `writeOffBatch`; pass `batchId` through `recordWastage` in `src/data/commands/stock.ts`.
- [X] T007 [US1] Add the "Expiry" tab in `src/config/modules.ts`; create `src/features/stock/ExpiryList.tsx` and `BatchForm.tsx`; register in `src/features/stock/screens.tsx`.
- [X] T008 [P] Write `tests/unit/batches.test.ts`.
- [X] T009 [P] Write `tests/smoke/expiry.spec.ts`; add the Expiry screens at 320px to `tests/smoke/responsive.spec.ts`.
- [X] T010 [P] Add the Help Center article; update counts in existing tests.
- [X] T011 Run the gates and fix what fails.
- [ ] T012 Walk through quickstart.md in the browser at 1440px and 375px. (Partly done: the Expiry screen was checked from a screenshot at 1440px and the 320px layout is covered by `responsive.spec.ts`.)
