---

description: "Task list for feature 003: Receivables and Payables"
---

# Tasks: Receivables and Payables

**Input**: Design documents from `specs/003-receivables-payables/`

**Prerequisites**: plan.md, spec.md (with Clarifications and Design deviations), research.md,
data-model.md, contracts/routes.md, contracts/data-access.md, quickstart.md. Builds on features
001 and 002.

**Tests**: the constitution requires Playwright smoke tests, so each story ends with one. Vitest
covers the new pure money helpers. The existing role × route test covers the 12 new tabs once they
are in scope.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 from spec.md

## How to read the design

Use the same method as feature 001 (`specs/001-dashboard-sales-stock/tasks.md` › "How to read
the design"). Relevant names in the logic script of `design/canvas/Uzapoint ERP.dc.html`:
- **Balances and status**: `rcvBal`, `rcvStatus`, `payBal`, `payStatus`.
- **Drawers**: `d.mode === 'rcvPay'` and `'payPay'` (payment form), `'rcvPlan'` and `'payPlan'`,
  `'rcvCredit'` and `'payCredit'`. Markup flags: `isRcvPay`, `isRcvPlan`, `isRcvCredit`,
  `hasRcvStmt`, `hasRcvFilters`.
- **Row actions**: search `m.id === 'rcv' && activeTab ?` and `m.id === 'pay' && activeTab ?`.
- **Header actions**: `m.id === 'rcv' ? (activeTab` and `m.id === 'pay' ? (activeTab`.
- **Lists**: Bulk payments (`activeTab.t === 'Bulk payments'`), Supplier ageing, the statement
  `rs`.
- **Record creation and credits**: `rcvAdd`, `payAdd`, credit-note `moneyDone`.

Data is in `design/canvas/erp-data.js` (`UZ_MODS` › rcv/pay rows, `UZ_RCVDETAIL`, `UZ_PAYDETAIL`,
`UZ_PLANDETAIL`, `UZ_SCDETAIL`). Copy all strings exactly.

---

## Phase 1: Setup

- [X] T001 Create branch `003-receivables-payables` from `002-purchases-suppliers` (`git checkout -b`) and confirm `npm run typecheck && npm run lint && npm run test:unit` pass

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: complete this phase before any user story.

- [X] T002 [P] Create `src/data/types/money.ts` (Receivable, Payable, Payment, Plan, Credit, NewPayment, NewPlan, NewCredit, ReceivableRow, PayableRow, CreditRow, AgeingRow, `Side = "rcv" | "pay"`) and export it from `src/data/types/index.ts`
- [X] T003 [P] Create `src/data/fixtures/money.ts`: a verbatim port of the `UZ_MODS` rcv rows (Receivables, Payments, Payment plans, Customer credits) and pay rows (Payables, Payments, Supplier credits, Payment plans), plus `UZ_RCVDETAIL`, `UZ_PAYDETAIL`, `UZ_PLANDETAIL` and `UZ_SCDETAIL`
- [X] T004 [P] Create `src/data/money.ts` with the pure helpers `balance`, `rcvStatus`, `payStatus` (research R1, plus Voided), `daysLate`, `ageBucket`, `planEach` (ceil) and `creditLeft`/`creditStatus` against DEMO_TODAY 2026-11-10. Add `tests/unit/money.test.ts` covering the seed statuses from quickstart 1, PYB-0013 in the 1–30 bucket, and 32,000 / 3 = 10,667
- [X] T005 Add a `money` slice (receivables, payables, rcvPayments, payPayments, rcvPlans, payPlans, customerCredits, supplierCredits, statement filter) to `src/data/store/state.ts` and seed it in `src/data/store/seed.ts`. Remove `purchases.pybNo` from the state and the seed
- [X] T006 Set `inScope: true` for `rcv` and `pay` in `src/config/modules.ts` with their column definitions. Create `src/features/receivables/screens.tsx` and `src/features/payables/screens.tsx` (empty) and register them in `src/features/screens.ts`
- [X] T007 Create `src/data/queries-money.ts` with the read hooks in contracts/data-access.md (rows with derived balance and status, `useOpenItems`, `useUsableCredit`, `useAgeing`, `useBulkPayments`) and export it from `src/data/index.ts`

**Checkpoint**: `/receivables/*` and `/payables/*` render headers and tabs, and the feature 001/002 smoke suites still pass.

---

## Phase 3: User Story 1 - See and collect what customers owe (Priority: P1) 🎯 MVP

**Independent Test**: quickstart 1–3.

- [X] T008 [US1] Create `src/data/commands/money.ts` with `recordPayment(side, input)` (allocation to ticked items oldest first, the overpay and credit blocks, type Single/Bulk/Instalment, verification Verified for Cash or credit and Pending otherwise, consuming credit oldest first, the design toast), `verifyPayment` and `toggleReceivablePriority`. Export them from `src/data/index.ts`
- [X] T009 [US1] Create `src/features/receivables/PaymentForm.tsx`, a side-aware port of `isRcvPay`: party picker, the "Open receivables for {party} (oldest first)" checklist with balance and applied amount, the amount field and "Pay full balance", the method list (UZ_PAYMETHODS plus "Customer credit"/"Supplier credit"), "Paid into"/"Paid from" account (Equity Bank — Main, M-Pesa Till, Cash drawer), date, reference, the warning text, and "Save payment". Its titles and subtitles cover single, bulk and instalment payments. Export it from `src/features/receivables/index.ts`
- [X] T010 [P] [US1] Create `src/features/receivables/ReceivableList.tsx` (design columns, priority pill, computed balance and status, filters `hasRcvFilters`, the row actions Record payment / Mark high or normal priority / View, header "Record payment") and `CustomerPaymentList.tsx` (Payments tab: Verify and View)
- [X] T011 [US1] Create `src/features/receivables/RecordView.tsx` for receivable and payment views (`?view=`). Register the `receivables` and `payments` tabs in `src/features/receivables/screens.tsx`, wiring `?action=pay` to PaymentForm with pre-fill params
- [X] T012 [US1] Write `tests/smoke/receivables.spec.ts` covering quickstart 1–3 (seed statuses, paying RCV-0011 → PAY-0022, Verify, the overpay block)

---

## Phase 4: User Story 2 - See and pay what the business owes suppliers (Priority: P1)

**Independent Test**: quickstart 4.

- [X] T013 [US2] Add `approvePayable` ("{ref} approved for payment.") and `rejectPayable` ("{ref} rejected.") to `src/data/commands/money.ts`. Make sure `recordPayment("pay", …)` offers only Approved payables and uses the design's `payPay` toast and wording
- [X] T014 [P] [US2] Create `src/features/payables/PayableList.tsx` (design columns: Type with the document as a note, Branch, priority, balance, Approval pill, Status, and the row actions Approve / Reject / Pay supplier / View) and `SupplierPaymentList.tsx` (Verify, View). Both use `PaymentForm` from `@/features/receivables` with `side="pay"`
- [X] T015 [US2] Register the `payables` and `payments` tabs in `src/features/payables/screens.tsx`, with the header "Record payment", and write `tests/smoke/payables.spec.ts` covering quickstart 4 (approve PYB-0012, pay it → VPMT-0009, Paid)

---

## Phase 5: User Story 3 - Sales and purchases create real records (Priority: P1)

**Independent Test**: quickstart 5–7.

- [X] T016 [US3] Add the internal helpers `addReceivable`, `closeReceivableFor`, `addPayable` and `addCustomerCredit` to `src/data/commands/money.ts` (pure state → state + ref, using `nextRef` on the lists)
- [X] T017 [US3] Change `src/data/commands/sales.ts`:
  - remove the `rcvNo` counter
  - `recordSale` with credit → `addReceivable` ("Sale on credit", due +30 days)
  - `createInvoice` → `addReceivable` ("Invoice", the invoice's due date)
  - `voidSale` → `closeReceivableFor(sale/invoice ref)`
  - `approveCreditNote` with money back "credit" → `addCustomerCredit` ("Credit note {ref}")
  - messages keep naming the same refs
- [X] T018 [US3] Change `src/data/commands/purchases.ts`: in `receiveGoods`, an unpaid order with value > 0 calls `addPayable` ("Goods received", Approved, due per the term's days, branch from the store's warehouse) in place of the `pybNo` counter, and the message names that ref
- [X] T019 [US3] In `recordPayment`, allocations to an "Invoice" receivable add to that invoice's `paid` in `sales.invoices` and set it to Paid when settled (FR-016). Add the design's "Record payment" action (hidden when Paid) to the Sales invoice view in `src/features/sales/` (the file that renders invoice views), opening `PaymentForm` from `@/features/receivables` pre-filled with the customer and the receivable (FR-016a)
- [X] T020 [US3] Extend `tests/smoke/receivables.spec.ts` with quickstart 5–7 (credit sale → RCV-0013 listed; invoice → RCV-0014; receipt → PYB-0015; paying INV-0355 from Sales → Paid; void → Voided)

---

## Phase 6: User Story 4 - Payment plans, bulk payments and credits (Priority: P2)

**Independent Test**: quickstart 8–9.

- [X] T021 [US4] Add `createPlan` ("{ref} created for {party}."), `cancelPlan` ("{ref} cancelled."), `issueCredit` ("{ref}: KES {n} credit for/from {party}.") and `voidCredit` ("{ref} voided.") to `src/data/commands/money.ts`. Plan progress (paid instalments, next due, Completed) is derived from Instalment payments carrying the plan ref
- [X] T022 [US4] Create `src/features/receivables/PlanForm.tsx` (side-aware `isRcvPlan`: open item picker excluding items with an active plan, number of instalments, how often, first instalment due, the computed each and schedule, "Create plan") and `CreditForm.tsx` (side-aware `isRcvCredit`: party, reason/why or source, amount, currency, expiry toggle, notes, "Issue credit"), and export both from `src/features/receivables/index.ts`
- [X] T023 [P] [US4] Create the plan, credit and bulk lists: `src/features/receivables/{PlanList,CreditList,BulkPaymentList}.tsx` and `src/features/payables/{PlanList,CreditList,BulkPaymentList}.tsx`, with the row actions Record or Pay instalment, Cancel plan, Use to pay and Void credit, the header actions New payment plan or Create plan, Issue credit and New bulk payment, and their tab registrations
- [X] T024 [US4] Extend the smoke tests with quickstart 8–9 (PLN-0004 each 10,667 and an instalment; CRD-0005 issued and used; CRD-0004 voided) in `tests/smoke/receivables.spec.ts`

---

## Phase 7: User Story 5 - See what is owed by age (Priority: P2)

**Independent Test**: quickstart 10.

- [X] T025 [US5] Create `src/features/receivables/StatementView.tsx` (design `hasRcvStmt`: "Receivables statement", "Unpaid balances by customer, aged as of today (10 Nov 2026).", From / To / Customers, "Generate statement" → "Statement updated.", and the aged table) and `src/features/payables/AgeingView.tsx` (Supplier ageing table). Register both tabs
- [X] T026 [US5] Extend `tests/smoke/payables.spec.ts` with quickstart 10 (Magaliesburg Wheels 24,200 in 1–30 days; Eastside Bicycle Supplies 79,560 not yet due; "Statement updated.")

---

## Phase 8: Polish & Cross-Cutting

- [X] T027 [P] Add `/receivables/receivables`, `/receivables/payments`, `/payables/payables` and `/payables/supplier-ageing` to `tests/smoke/responsive.spec.ts`, and run the accessibility scan over the new drawers (payment, plan, credit, record views)
- [X] T028 Do a visual fidelity review against the canvas for every new tab and drawer, logging accepted differences in plan.md and spec › Design deviations
- [X] T029 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`), walk through quickstart 1–11, and commit on `003-receivables-payables`

---

## Dependencies & Execution Order

- Setup → Foundational (T002–T007) → stories.
- **US1** first: it builds the shared `PaymentForm` and `recordPayment`. **US2** depends on US1.
  **US3** depends on US1 (T019 uses PaymentForm and `recordPayment`).
- **US4** depends on US1 (instalments use PaymentForm). **US5** depends only on Foundational and
  can run in parallel with US1–US4.
- T017 and T018 edit feature 001/002 commands, so run them after T016 and re-run those modules'
  smoke tests.

### Parallel opportunities

- T002, T003 and T004. T010 alongside T009 once T008 is done. T014 alongside US3 work. T023 lists in
  parallel. All of US5 alongside US2–US4.
- Two developers: A takes US1 → US3 → US4, while B takes US2 (after T009) → US5 → polish.

## Implementation Strategy

1. **MVP**: Phases 1–3 (collect from customers with the shared payment form).
2. Add US2 (pay suppliers), then US3 (real records from sales and purchases), which is the key demo
   moment.
3. Add US4 and US5, then polish, run every gate and commit.

## Notes

- Copy all wording and figures from the design.
- Payments never change account balances (FR-019).
- Payables and Sales import forms only from `@/features/receivables` (its index), never from its
  internals.
