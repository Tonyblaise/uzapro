# Tasks: Sales orders and dispatch

**Input**: `specs/013-sales-orders-dispatch/` (plan, spec, research, data-model, contracts, quickstart).

**Tests**: included, as for every earlier feature.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Create `src/data/types/orders.ts` (`OrderLine`, `SalesOrder`, `DeliveryLine`, `DeliveryNote`, `NewOrder`, `NewDispatch`) and re-export it from `src/data/types/index.ts`.

## Phase 2: Foundational

- [X] T002 [P] Create `src/data/fixtures/orders.ts` with SO-0001 and DN-0001 (data-model.md › Seed).
- [X] T003 Add `orders` and `deliveries` to `SalesState` in `src/data/store/state.ts` and seed them in `src/data/store/seed.ts`.
- [X] T004 [P] Create `src/data/orders.ts` with the pure helpers in contracts/data-access.md.
- [X] T005 Create `src/data/queries-orders.ts` and export it and the helpers from `src/data/index.ts`.
- [X] T006 Add the "Sales orders" and "Deliveries" tabs to Sales in `src/config/modules.ts`, add both to the Accountant's Sales tab list in `src/config/roles.ts`, and add `dispatch`, `deliver` and `invoice` (write) to `STEP_NEED` in `src/components/shell/ModuleScreen.tsx`.

## Phase 3: User Story 1 - Take a sales order (P1) 🎯 MVP

- [X] T007 [US1] Create `src/data/commands/orders.ts` with `createOrder`, `updateOrder` and `cancelOrder` (credit gate on create), and make `updateCustomer` in `src/data/commands/customers.ts` rename the customer on orders and delivery notes.
- [X] T008 [US1] Create `src/features/sales/OrderForm.tsx` (pricing via `usePricer`, credit stop via `CreditStop`).
- [X] T009 [US1] Create `src/features/sales/OrderLists.tsx` (`OrderList`, `NewOrderAction`) and `src/features/sales/OrderView.tsx`, and register `sales-orders` in `src/features/sales/screens.tsx`.

## Phase 4: User Story 2 - Dispatch with a delivery note (P1)

- [X] T010 [US2] Add `dispatchOrder` to `src/data/commands/orders.ts` (validation, shortfall, stock, delivery note).
- [X] T011 [US2] Create `src/features/sales/DispatchForm.tsx` and wire it into `OrderView` and the order row menu.
- [X] T012 [US2] Add `DeliveryList` to `src/features/sales/OrderLists.tsx`, create `src/features/sales/DeliveryView.tsx`, and register `deliveries` in `src/features/sales/screens.tsx`.

## Phase 5: User Story 3 - Confirm delivery (P2)

- [X] T013 [US3] Add `markDelivered` to `src/data/commands/orders.ts` and the "Mark delivered" step to `src/features/sales/DeliveryView.tsx`.

## Phase 6: User Story 4 - Invoice what was dispatched (P2)

- [X] T014 [US4] Give `createInvoice` in `src/data/commands/sales.ts` the internal `fromOrder` option (research R3) and add `invoiceOrder` to `src/data/commands/orders.ts`.
- [X] T015 [US4] Add "Create invoice" to `src/features/sales/OrderView.tsx` and the order row menu, and list the order's invoices.

## Phase 7: Tests and polish

- [X] T016 [P] Write `tests/unit/orders.test.ts` (pure helpers and commands: SC-003, SC-004, credit stop, cancel and edit rules).
- [X] T017 [P] Write `tests/smoke/orders.spec.ts` (quickstart 1–9 and a read-only role) and add the new screens at 320px to `tests/smoke/responsive.spec.ts`.
- [X] T018 [P] Add the Help Center article to `src/data/fixtures/helpcenter.ts` and update the article and tab counts in existing unit tests.
- [X] T019 Run the gates (`typecheck`, `lint`, `test:unit`, `build`, `test:smoke`) and fix what fails.
- [ ] T020 Walk through quickstart.md in the browser at 1440px and 375px. (Partly done: three screens were checked from screenshots at 1440px and the 320px layout is covered by `responsive.spec.ts`; a hands-on walk-through is still open.)

## Dependencies

Phase 1 → 2 → US1 → US2 → (US3, US4) → Phase 7. US3 and US4 both need US2 and are independent of each other.

## Implementation Strategy

MVP is Phases 1–4: orders and dispatch. US3 and US4 are small additions on top.
