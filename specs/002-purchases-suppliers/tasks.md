---

description: "Task list for feature 002: Purchases and Suppliers"
---

# Tasks: Purchases and Suppliers

**Input**: Design documents from `specs/002-purchases-suppliers/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routes.md,
contracts/data-access.md, quickstart.md. This feature builds on feature 001, so its shell, store,
stock operations, UI primitives and smoke fixtures already exist.

**Tests**: the constitution's quality gates require Playwright smoke tests, so each story phase
ends with one. The feature 001 role × route test (`tests/smoke/navigation.spec.ts`) covers the
new routes once `buy`/`vend` are in scope.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 from spec.md

## How to read the design

Use the same method as feature 001 (`specs/001-dashboard-sales-stock/tasks.md` › "How to read
the design"):
- Markup is in `<sc-if value="{{ flag }}">` blocks of `design/canvas/Uzapoint ERP.dc.html`.
- Logic is in its `class Component extends DCLogic` script.
- Data is in `design/canvas/erp-data.js`.
- Copy all strings exactly.

Relevant names for this feature:
- **Order form, view and receive**: `isPoForm`, `poOpen`, `poFinish`, `isPoView`, `poAccept`,
  `isPoRecv` and its `rv`/`save`.
- **Goods receipts and returns**: `isGrnView`, `grnInfo`, `isPrtForm` and its `finish`,
  `prtStock`.
- **Rejected items**: the rejected-item view ("Mark sent back").
- **Suppliers**: `isSupForm`, `supSave`.
- **Overview and lists**: `v.isBuyBoard` (`bKpis`, `bReq`, `bSpend`, `bStatus`), the row actions
  for `m.id === 'buy'`, and `headerActions` for `buy`/`vend`.
- **Stock in**: `stSubmit`.

---

## Phase 1: Setup

- [X] T001 Create the branch `002-purchases-suppliers` from `001-dashboard-sales-stock` (git checkout -b), and confirm `npm run typecheck && npm run lint && npm run test:unit` pass before starting

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: complete this phase before any user story.

- [X] T002 [P] Create `src/data/types/purchases.ts` with every type in data-model.md (Supplier, NewSupplier, PurchaseOrder, PoLine, NewPurchaseOrder, GoodsReceipt, GrnLine, NewReceipt, PurchaseReturn, NewPurchaseReturn, RejectedItem, status unions), and export it from `src/data/types/index.ts`
- [X] T003 [P] Create `src/data/fixtures/purchases.ts`: a verbatim port of the `UZ_MODS` buy rows (Purchase orders, Goods receipts, Purchase returns, Rejected items, using `P(...)` pills) and `UZ_BUY`. Add `UZ_NATIONS` to `src/data/fixtures/suppliers.ts`, along with the Suppliers column order comment
- [X] T004 Add `suppliers: Supplier[]` and `purchases: { orders, receipts, returns, rejected, nations }` slices to `src/data/store/state.ts`. Seed them in `src/data/store/seed.ts`, porting the design's `poDoc` (placeholder line "Items on {ref}", Main Store, 2026-10-28, Cash on delivery, Bank transfer, activity) and `grnInfo` derivations as pure functions
- [X] T005 Set `inScope: true` for `buy` and `vend` in `src/config/modules.ts`, adding their column definitions from `UZ_MODS`. Create `src/features/purchases/screens.tsx` and `src/features/suppliers/screens.tsx` (empty `ScreenMap`s) and register them in `src/features/screens.ts`
- [X] T006 Create `src/data/queries-purchases.ts` with the read hooks from contracts/data-access.md (`useSupplierList`, `usePurchaseOrders`, `usePurchaseOrder`, `useGoodsReceipts`, `useGoodsReceipt`, `usePurchaseReturns`, `useRejectedItems`, `canReturn`). Change `useSuppliers()` in `src/data/queries-stock.ts` to return the active supplier names from the slice. Export everything from `src/data/index.ts`

**Checkpoint**: `/purchases/*` and `/suppliers/suppliers` render the page header and tabs (bodies are temporary placeholders), and the whole feature 001 smoke suite still passes.

---

## Phase 3: User Story 1 - Order stock from a supplier (Priority: P1) 🎯 MVP

**Goal**: list, create, edit, view and accept purchase orders.

**Independent Test**: quickstart scenario 2.

- [X] T007 [US1] Create `src/data/commands/purchases.ts` with `savePurchaseOrder(input, { approve, edit })` (Draft or Approved, Received None, `PUR-ORD-` nextRef, rounded total, the activity rules from research R1) and `acceptPurchaseOrder(ref)`, using the design's toasts. Export them from `src/data/index.ts`
- [X] T008 [P] [US1] Create `src/features/purchases/PurchaseOrderList.tsx`: columns Supplier/Ref/Total/Received/Status; row actions View, Edit, Accept (disabled when Accepted or Completed), Accept and receive goods (disabled when Completed), Download PDF ("Downloading {ref}.pdf."); and the header action "New purchase order" → `?action=new`
- [X] T009 [US1] Create `src/features/purchases/PurchaseOrderForm.tsx` (design `isPoForm`): "Choose a supplier and add the items you need."; General information (Supplier SearchSelect of active suppliers with "New supplier", Destination store, Order date, Expected delivery); Internal notes; Payment (Payment term, Payment method, Pay from account, Already paid); Line items (Default quantity, Search products, editable qty/cost rows, "No items added yet. Search for a product above."); totals; and the Save / Save and approve buttons. It opens with `?action=new` or `?edit=<ref>`
- [X] T010 [US1] Create `src/features/purchases/PurchaseOrderView.tsx` (design `isPoView`): "Purchase order {ref}", status pill, Download PDF, Edit, the Supplier and Deliver to blocks, "Items" / "What was ordered from the supplier" table, totals, activity, and the Accept / receive actions. It opens with `?view=<ref>`
- [X] T011 [US1] Register the `purchase-orders` tab in `src/features/purchases/screens.tsx` and write `tests/smoke/purchases.spec.ts` › "create and approve a purchase order" (quickstart 2) plus the empty-order block

**Checkpoint**: orders can be created, viewed and accepted.

---

## Phase 4: User Story 2 - Receive goods into stock (Priority: P1)

**Goal**: receive orders into stock, with goods receipts and rejected lines.

**Independent Test**: quickstart scenario 3.

- [X] T012 [US2] Add `receiveGoods(ref, input)` to `src/data/commands/purchases.ts`. It creates a `GRN-` with status Saved, adds accepted quantities to stock with Received movements (via `src/data/store/stockOps.ts`), creates `REJ-` items ("Rejected on delivery", Waiting), updates the order's received, status and activity, and toasts "{GRN} saved. {n} accepted into {store}." plus " {PYB} added to Payables." when the order is unpaid (a `PYB-` number only, no record; FR-018). Block quantities above what is outstanding
- [X] T013 [US2] Create `src/features/purchases/ReceiveForm.tsx` (design `isPoRecv`): "Receive {ref}", "Receive all as ordered", Delivery details (Receiving by, Destination store, Received on, Delivery note no., Supplier invoice no., notes), Items to receive (Ordered/Received/Accepted/Rejected), and "Accept all received". It opens with `?view=<ref>&step=receive` and from the row action
- [X] T014 [P] [US2] Create `src/features/purchases/GoodsReceiptList.tsx` (columns Ref/PO/Supplier/Location/Lines/Status) and `GoodsReceiptView.tsx` (design `isGrnView`: "Goods receipt {ref}", "Stock updated", Supplier, Received into, "Items received" / "Only accepted quantities go into stock", Print/PDF toasts)
- [X] T015 [US2] Register the `goods-receipts` tab, then extend `tests/smoke/purchases.spec.ts` with "receive an order into stock" (quickstart 3: Bike Pump 30 → 39 in Main Store, REJ-0004 Waiting, Full · Completed)

**Checkpoint**: receipts change stock; Stock › Stock management reflects them with no reload.

---

## Phase 5: User Story 3 - Return items and handle rejected items (Priority: P2)

**Goal**: purchase returns with approval and stock reduction, plus rejected-item outcomes.

**Independent Test**: quickstart scenarios 4–5.

- [X] T016 [US3] Add `createPurchaseReturn(input, approve)`, `approvePurchaseReturn(ref)` and `markRejected(ref, outcome)` to `src/data/commands/purchases.ts`. Approving reduces stock at the receipt's store (≥ 0) with the design's movement kind (check `prtStock`). Toasts: "{ref} approved. Stock reduced." / "{ref} submitted for approval." / "{ref} approved." / "{ref} marked as sent back." / "… marked as replaced." / "… written off."
- [X] T017 [US3] Create `src/features/purchases/PurchaseReturnForm.tsx` (design `isPrtForm`, three numbered steps, "Can return" limits, "↓ Stock goes down when this return is approved.", Cancel / Submit only / Submit and approve), plus `PurchaseReturnList.tsx` (design columns, Approve row action on Waiting approval) and a view
- [X] T018 [P] [US3] Create `src/features/purchases/RejectedItemList.tsx` and `RejectedItemView.tsx` (the design's view: "Delivered by {supplier} but not accepted into stock.", Mark sent back / Mark replaced / Write off, no actions once done)
- [X] T019 [US3] Register the `purchase-returns` and `rejected-items` tabs, then extend `tests/smoke/purchases.spec.ts` (quickstart 4–5: Helmet 5 → 3, REJ-0004 Sent back)

---

## Phase 6: User Story 4 - See purchasing at a glance (Priority: P2)

**Goal**: the Purchases overview.

**Independent Test**: quickstart scenario 1.

- [X] T020 [US4] Add `purchasesOverviewData()` to `src/data/queries-purchases.ts`: KPIs computed once from the seed (research R7) and frozen, plus `UZ_BUY` charts and on-time list
- [X] T021 [US4] Create `src/features/purchases/PurchasesOverview.tsx` (design `v.isBuyBoard`): the 8 KPIs, orders and spend trend charts, the status-stage bar (token colours), "Delivered on time", and "Recent orders" (live list) with "View all" → `/purchases/purchase-orders`. Register the `overview` tab
- [X] T022 [US4] Extend `tests/smoke/purchases.spec.ts` with the overview values (Total orders 3, Total spend KES 641,596, Returns 5) and "View all"

---

## Phase 7: User Story 5 - Manage suppliers (Priority: P2)

**Goal**: list, add, edit and deactivate suppliers; pickers show active suppliers only.

**Independent Test**: quickstart scenario 6.

- [X] T023 [US5] Create `src/data/commands/suppliers.ts` with `saveSupplier(input, edit?)` ("{name} added." / "Changes saved." / "{name} is already in the list.", append, "—" for empty fields), `setSupplierActive` and `addNation`. Export them from `src/data/index.ts`
- [X] T024 [US5] Create `src/features/suppliers/SupplierForm.tsx` (design `isSupForm`: Essential details, Supplier type toggle "Individual person" / "Registered business" with name label "Full name" / "Registered business name", Primary phone, Primary email, Nationality SearchSelect with create, "Supplier is active", Address info, Create supplier / Save changes). Export it from `src/features/suppliers/index.ts` so the PO form and Stock in can open it ("New supplier") and get the new name back
- [X] T025 [US5] Create `src/features/suppliers/SupplierList.tsx` (columns Name/Type/Phone/Email/Town or city/Status, row actions as in the design, header "New supplier"). Register it in `src/features/suppliers/screens.tsx`, and write `tests/smoke/suppliers.spec.ts` (quickstart 6)

---

## Phase 8: Polish & Cross-Cutting

- [X] T026 Change `sendStockToPurchases` in `src/data/commands/stock.ts` to add a Waiting goods receipt (research R8, FR-015) and add a smoke test for quickstart 7 in `tests/smoke/purchases.spec.ts`
- [X] T027 [P] Wire "New supplier" in the Stock in form (`src/features/stock/StockInForm.tsx`) to the shared SupplierForm (replacing the local name-only add from feature 001)
- [X] T028 Add the Purchases and Suppliers pages to the phone-width checks in `tests/smoke/responsive.spec.ts`, and run an accessibility scan of the new drawers (no unlabelled controls)
- [X] T029 Do a visual fidelity review against the canvas for every new screen and drawer, logging any accepted differences in plan.md › Design deviations
- [X] T030 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`) and walk through quickstart scenarios 1–9

---

## Dependencies & Execution Order

- Setup → Foundational (T002–T006) → stories.
- **US1** (orders) → **US2** (receive needs orders) → **US3** (returns need receipts).
- **US4** (overview) and **US5** (suppliers) depend only on Foundational and can run in parallel
  with US1–US3.
- T027 depends on T024. T026 depends on T004 (receipt slice).
- Within a story, do the commands, then the list and view [P], then the forms, then registration,
  then the smoke test.

### Parallel opportunities

- T002 and T003. T008 alongside T009/T010 once T007 is done. T014 alongside T013. T018 alongside
  T017.
- Two developers: A takes US1 → US2 → US3, while B takes US5 → US4 → T027.

## Implementation Strategy

1. **MVP**: Phases 1–3 (orders), then Phase 4 (receiving into stock is the key demo moment).
2. Add US5 (suppliers), US3 (returns) and US4 (overview).
3. Polish and run every gate. Commit on `002-purchases-suppliers`.

## Notes

- All strings, figures and statuses come from the design files; never invent copy.
- Stock changes go only through `src/data/store/stockOps.ts` (shared with feature 001).
- After each checkpoint, run `npm run typecheck && npm run lint`.
