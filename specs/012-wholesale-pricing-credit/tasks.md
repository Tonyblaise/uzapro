# Tasks: Wholesale pricing and customer credit

**Input**: Design documents in `specs/012-wholesale-pricing-credit/`: plan.md, spec.md, research.md,
data-model.md, contracts/data-access.md, contracts/ui.md and quickstart.md.

**Tests**: included. The plan names `tests/unit/pricing.test.ts`, `tests/unit/credit.test.ts` and
`tests/smoke/pricing-credit.spec.ts`. Every earlier feature shipped with unit and smoke coverage.

**Organization**: tasks are grouped by user story (spec US1–US4), so each story can be built and
tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: US1 is group prices on sales, US2 the credit check, US3 the customer record and US4
  managing price lists and groups.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: types that every story uses.

- [X] T001 Create `src/data/types/pricing.ts` with `CustomerGroup`, `PriceBreak`, `PriceEntry`, `PayTerms`, `CreditApproval`, `CreditPosition`, `CreditStop`, `LinePrice` and `PricingState` (data-model.md), and re-export it from `src/data/types/index.ts`.
- [X] T002 Extend `src/data/types/sales.ts`: `Customer` gains `group`, `creditLimit` and `terms`; `NewCustomer` gains them as optional; `Sale` and `Quotation`-based `Invoice` gain optional `creditApproval`; `NewSale` and `NewDocument` gain `approval?: { reason: string }`; `PosCheckout` gains `approval: string`. Add optional `stop?: CreditStop` to the failure side of `Result` in `src/data/types/common.ts` (or wherever `fail` is defined).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: seed data, the store slice and the two pure rule modules. Every story reads these.

**⚠️ CRITICAL**: no story work can start until this phase is complete.

- [X] T003 [P] Create `src/data/fixtures/pricing.ts` with the seed groups and the 12 seed price entries (data-model.md › Seed), and add the seed group, limit and terms per customer to `src/data/fixtures/customers.ts` with a comment that these values are new (spec › Design deviations).
- [X] T004 Add `pricing: PricingState` to `AppState` in `src/data/store/state.ts` and `seedPricing()` plus the new customer fields to `src/data/store/seed.ts`.
- [X] T005 [P] Create `src/data/pricing.ts` with `RETAIL_GROUP`, `unitsOf`, `standardPrice`, `findEntry`, `breakFor`, `priceFor`, `validateEntry` and `validateGroupName` (contracts/data-access.md, research R3).
- [X] T006 [P] Create `src/data/credit.ts` with `PAY_TERMS`, `termDays`, `creditPosition`, `creditStop` and `creditFlag`, reusing `balance` and `daysLate` from `src/data/money.ts` (research R7, R8).
- [X] T007 [P] Write `tests/unit/pricing.test.ts`: break selection, below-first-break hint, fallback per unit, validation messages, and every seed entry's Standard figure and "below standard" ordering against the catalogue seed (SC-002).
- [X] T008 [P] Write `tests/unit/credit.test.ts`: owed, overdue, available, the three stop reasons in order, no-limit and zero-credit cases, and the seed positions (Morningview overdue KES 45,600; Mountain Goats KES 19,600 available).
- [X] T009 Create `src/data/queries-pricing.ts` with `useCustomerGroups`, `usePriceEntries`, `useGroupOf`, `usePricer`, `useCreditPosition`, `useCreditPositions` and `useCanApproveCredit`; export it, the pure helpers the UI needs and `PAY_TERMS` from `src/data/index.ts`.

**Checkpoint**: `npm run typecheck` and `npm run test:unit` pass; no screen has changed yet.

---

## Phase 3: User Story 1 - The right price fills in for each customer (Priority: P1) 🎯 MVP

**Goal**: sale, quotation, invoice and till lines take the customer's group price.

**Independent Test**: quickstart scenarios 1–4 and the till half of 8.

- [X] T010 [US1] In `src/features/sales/NewSaleForm.tsx`, price the entry row with `usePricer(cust)` for the chosen variant, unit and quantity; track `"std" | "list" | "hand"` on the entry and on each added line; reprice non-hand lines when the customer changes; show the "{Group} price" note, the "from {n} {unit}" hint and the "Use {Group} price" / "Use standard price" button (research R4, contracts/ui.md).
- [X] T011 [US1] In `src/features/sales/DocumentForm.tsx` (quote and invoice kinds only), add the same source tracking to `QLine`; reprice on customer, quantity and unit changes under the R4 rules; show the note under the item description and the restore button after a hand-typed rate.
- [X] T012 [US1] In `src/data/commands/pos.ts`, reprice cart lines for the attached customer at unit "Piece" in `addLine`, `changeLine`, `pickCustomer`, `saveNewCustomer` and `resumeHeld`; add `group?: string` to `PosCartLine` in `src/data/types/sales.ts` for the note (research R5).
- [X] T013 [US1] In `src/features/pos/Cart.tsx`, show "{Group} price" under a cart line that carries a group.
- [X] T014 [US1] Add the US1 cases to `tests/smoke/pricing-credit.spec.ts`: group price and break change on a new sale, walk-in fallback, hand-typed price kept and restored, invoice rate on unit change, till line price.

**Checkpoint**: US1 works alone; existing sales, invoice and till smoke tests still pass.

---

## Phase 4: User Story 2 - Credit is checked before the sale goes through (Priority: P1)

**Goal**: credit sales, invoices and till Pay later are stopped by cash terms, overdue or the
limit, with approval for roles that have Write on Receivables.

**Independent Test**: quickstart scenarios 5–8.

- [X] T015 [US2] In `src/data/commands/sales.ts`, make `recordSale` and `createInvoice` run `creditStop` on the credit amount; fail with the stop and its toast unless `approval` is valid and the role may approve; store `creditApproval`; use the customer's terms for the receivable due date and the toast's "due in {N} days" (research R6, contracts/data-access.md).
- [X] T016 [US2] In `src/data/commands/pos.ts`, apply the same check to the credit part in `completePosSale`, reading the reason from `co.approval`; add `setCreditApproval(reason)`; use the customer's terms for the due date.
- [X] T017 [P] [US2] Create `src/features/customers/CreditStop.tsx` (Modal: title and lead by reason, figures, reason field and "Approve anyway" only with approval rights) and export it from `src/features/customers/index.ts` (contracts/ui.md).
- [X] T018 [US2] Wire `CreditStop` into `src/features/sales/NewSaleForm.tsx` (on Record sale with Pay later) and `src/features/sales/DocumentForm.tsx` (on Save and Save and approve for a new invoice); default the invoice Due date to the date plus the customer's terms when the customer or date changes on a new invoice.
- [X] T019 [US2] Wire `CreditStop` into the till checkout in `src/features/pos/Dialogs.tsx` for the Pay later method.
- [X] T020 [P] [US2] Show "Credit approved by {name}: {reason}" in `src/features/sales/SaleView.tsx` and the invoice view in `src/features/sales/RecordView.tsx` when `creditApproval` is set.
- [X] T021 [US2] Add the US2 cases to `tests/smoke/pricing-credit.spec.ts`: over-limit stop as Owner with approval and its record line, the same as Cashier with no approve action, the overdue stop, an invoice stop, and the till Pay later stop.

**Checkpoint**: US1 and US2 both work; no credit path completes without approval rights (SC-003).

---

## Phase 5: User Story 3 - See and set a customer's group, limit and terms (Priority: P2)

**Goal**: the Customers table and form show and edit group, limit and terms.

**Independent Test**: quickstart scenarios 9 and 10.

- [X] T022 [US3] Extend `createCustomer` and `updateCustomer` in `src/data/commands/customers.ts` to validate and store `group`, `creditLimit` and `terms` (walk-in stays Retail with no limit).
- [X] T023 [US3] Add the Group, Credit limit (KES) and Balance owed (KES) columns and the "Over limit" / "Overdue" pill to `src/features/customers/CustomerList.tsx`, and the same columns to the Customers tab in `src/config/modules.ts`.
- [X] T024 [US3] Add Customer group, Credit limit and Payment terms fields, the inline error and the Credit panel (edit only) to `src/features/customers/CustomerForm.tsx`.
- [X] T025 [US3] Add the US3 cases to `tests/smoke/pricing-credit.spec.ts` and update the column expectations in `tests/smoke/customers.spec.ts`.

---

## Phase 6: User Story 4 - Manage price lists and customer groups (Priority: P3)

**Goal**: owners add, edit and remove prices and groups.

**Independent Test**: quickstart scenarios 11–13.

- [X] T026 [US4] Create `src/data/commands/pricing.ts` with `addCustomerGroup`, `renameCustomerGroup`, `deleteCustomerGroup`, `savePrice` and `removePrice`, export it from `src/data/index.ts`, and make product and variant removal or rename in `src/data/commands/catalog.ts` drop or rename matching entries.
- [X] T027 [US4] Add the "Price lists" tab to Products and the "Customer groups" tab to Customers in `src/config/modules.ts`.
- [X] T028 [P] [US4] Create `src/features/products/PriceLists.tsx` and `src/features/products/PriceEntryForm.tsx` (group picker, table, Add price, Edit, Remove, break rows) and register `price-lists` in `src/features/products/screens.tsx`.
- [X] T029 [P] [US4] Create `src/features/customers/GroupList.tsx` (table, New group, Rename, Delete, name form) and register `customer-groups` in `src/features/customers/screens.tsx`.
- [X] T030 [P] [US4] Add the "Group prices" block to `src/features/products/ProductRecord.tsx`.
- [X] T031 [US4] Add the US4 cases to `tests/smoke/pricing-credit.spec.ts`: add a price and see it on a sale, duplicate refusal, add a group, delete refusal, and read-only for a role with Read on Products.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T032 [P] Set idea `i3` to Done in `src/data/fixtures/uzaai.ts` and add the Help Center article on price lists and credit limits to `src/data/fixtures/helpcenter.ts` (FR-028); update any unit test that counts ideas or articles.
- [X] T033 [P] Add the two new tabs and the stop dialog at 320px to `tests/smoke/responsive.spec.ts`.
- [X] T034 Run the gates: `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:smoke`. Fix what fails.
- [ ] T035 Walk through `specs/012-wholesale-pricing-credit/quickstart.md` in the browser at 1440px and 375px. (Partly done: five screens were checked from screenshots at 1440px and the 320px layout is covered by `responsive.spec.ts`; a hands-on walk-through against the design system is still open.)

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → stories. Phase 7 last.
- US1 and US2 are independent of each other after Phase 2; both touch `NewSaleForm.tsx`,
  `DocumentForm.tsx` and `commands/pos.ts`, so do them in order.
- US3 needs only Phase 2. US4 needs only Phase 2.
- T014, T021, T025 and T031 all add to one smoke file, so they are not parallel.

## Parallel Example: Phase 2

```text
T003 fixtures      T005 pricing.ts     T006 credit.ts
T007 pricing tests T008 credit tests   (after T005 / T006 exist)
```

## Implementation Strategy

- **MVP**: Phases 1–3 (US1). A wholesaler sees their own prices fill in from seed lists.
- **Then** US2 (credit control), US3 (customer record), US4 (editing lists and groups), each
  shippable on its own.
