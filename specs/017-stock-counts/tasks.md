# Tasks: Stock counts

- [X] T001 Add `StockCount` and `CountLine` to `src/data/types/stock.ts`.
- [X] T002 [P] Create `src/data/fixtures/counts.ts`; add `counts` to `StockState` and seed it; add `KIND.counted` in `src/data/store/stockOps.ts`.
- [X] T003 [P] Create `src/data/counts.ts` (pure rules).
- [X] T004 [US1] Create `src/data/commands/counts.ts` (`startCount`, `saveCount`) and `src/data/queries-counts.ts`; export from `src/data/index.ts`.
- [X] T005 [US2] Add `submitCount`.
- [X] T006 [US3] Add `approveCount`, `sendBackCount`, `cancelCount`.
- [X] T007 Add the "Stock counts" tab in `src/config/modules.ts`; create `src/features/stock/CountList.tsx`, `CountForm.tsx`, `CountView.tsx`; register in `src/features/stock/screens.tsx`.
- [X] T008 [P] Write `tests/unit/counts.test.ts`.
- [X] T009 [P] Write `tests/smoke/counts.spec.ts`; add the count screens at 320px to `tests/smoke/responsive.spec.ts`.
- [X] T010 [P] Add the Help Center article; update counts in existing tests.
- [X] T011 Run the gates and fix what fails.
- [ ] T012 Walk through quickstart.md in the browser at 1440px and 375px. (Not done by hand; the flows are covered by `counts.spec.ts` and the 320px layout by `responsive.spec.ts`.)
