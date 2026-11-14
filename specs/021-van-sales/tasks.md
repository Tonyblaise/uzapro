# Tasks

- [X] T001 Add `Visit` to `src/data/types/orders.ts` and `store?` to `NewSale` in `src/data/types/sales.ts`.
- [X] T002 Create `src/data/fixtures/visits.ts`; add `visits` to `SalesState`; seed the van store, its load and the route in `src/data/store/seed.ts`.
- [X] T003 [P] Create `src/data/visits.ts` (pure).
- [X] T004 Give `recordSale` in `src/data/commands/sales.ts` the optional store.
- [X] T005 Create `src/data/commands/visits.ts` and `src/data/queries-visits.ts`; export from `src/data/index.ts`; rename follows in `src/data/commands/customers.ts`.
- [X] T006 Add the "Field sales" tab in `src/config/modules.ts`; create `src/features/sales/FieldSales.tsx` and `VisitForm.tsx`; register in `src/features/sales/screens.tsx`.
- [X] T007 [P] Write `tests/unit/visits.test.ts`; update existing tests whose figures change with the van load.
- [X] T008 [P] Write `tests/smoke/fieldsales.spec.ts`; add the screen at 320px to `tests/smoke/responsive.spec.ts`.
- [X] T009 [P] Add the Help Center article; update counts in existing tests.
- [X] T010 Run the gates and fix what fails.
- [ ] T011 Walk through quickstart.md on a phone-width browser. (Partly done: the route and a visit were checked from screenshots at 390px; the flows are covered by `fieldsales.spec.ts`. Not tried on a real phone.)
