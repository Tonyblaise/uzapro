---

description: "Task list for feature 010: Point of Sale"
---

# Tasks: Point of Sale

**Input**: Design documents from `specs/010-point-of-sale/`

**Prerequisites**: plan.md, spec.md (Clarifications Q1–Q2), research.md (R1–R9), data-model.md,
contracts/ui-and-data.md, quickstart.md. Builds on features 001–009.

**Tests**: the constitution requires Playwright smoke tests. Vitest covers the pure POS helpers and
the effects of a completed sale.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US4 from spec.md

## Reference

Canvas source: `design/canvas/Uzapoint ERP.dc.html` and `erp-data.js` (version 1794512813):

- the CSS (~lines 35–43);
- the `poslaunch` markup (~902–922);
- the till markup (~2853–3130);
- the launch hook (~3329);
- `posApplySale`, `posStore` and `posVals` (~4074–4264).

Copy every label and message exactly, except where spec › Design deviations says otherwise. Style
with tokens only.

---

## Phase 1: Setup

- [X] T001 Create the branch `010-point-of-sale` from `main` (`git checkout -b 010-point-of-sale`). Confirm `npm run typecheck && npm run lint && npm run test:unit` pass.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 [P] Types:
  - add `"pos"` to `ModuleId` in `src/data/types/common.ts`;
  - add `"poslaunch"` to `ScreenKind` in `src/data/types/config.ts`;
  - add `"Sale"` to `LedgerKind` in `src/data/types/accounts.ts`;
  - add the POS types from data-model.md to `src/data/types/sales.ts`.
- [X] T003 [P] Registry and roles:
  - add the `pos` module after `sales` in `src/config/modules.ts`: Sales section, `scan-barcode` icon, "Point of sale", "Pick a terminal to start selling", slug `point-of-sale`, one tab `["Terminals", "poslaunch"]`;
  - add `"pos"` to the Cashier's `mods` in `src/config/roles.ts`;
  - make sure the page header has no action for `pos`. Check `PageHeader` or `ModuleScreen` header-action logic.
- [X] T004 [P] Add `ScanBarcode` (`scan-barcode`) and `CreditCard` (`credit-card`), if missing, to `src/components/ui/Icon.tsx`.
- [X] T005 [P] Data from the design's `erp-data.js` (research R3):
  - append the 5 Point of Sale lines to `STOCK_LINES` in `src/data/fixtures/stock.ts`;
  - update `PRODUCT_ROWS` in `src/data/fixtures/catalog.ts` to the design's new on-hand values and statuses (Muthokinju Paint becomes "Low stock").
- [X] T006 [P] Styles:
  - add to `src/styles/tokens.css` the POS content colours as named tokens (`--pos-tint-1..6` and `--pos-ink-1..6` from the design's palette; `--pos-avatar-*` for the four seller-avatar pairs; `--receipt-paper`);
  - add to `src/styles/globals.css` `.uz-ptile`, `.uz-key`, `.uz-orow` (hover), `.uz-switch` (role switch) and `.uz-shake` with its keyframes;
  - add the POS breakpoints: the cart at 340px below 1100px; the slide-in cart, stacked checkout and order rows without Items and Time below 860px; the stacked PIN grid below 760px;
  - add a `prefers-reduced-motion` guard.
- [X] T007 Export the variant-stock helper from `src/data/queries-stock.ts`: `variantStock(movements, products)` returning `(product, store, total) → VariantMap`. Keep the existing hooks on it.
- [X] T008 Create `src/data/fixtures/pos.ts` with:
  - the Terminal 1 shift seed (open; by Tony Blaise; 09:05; 10 Nov 2026; float 5000; refs SAL-POS-0006..0001);
  - the six POS docs from data-model.md (`vat`, `subtotal` and payments worked out as in the design's `mk`);
  - `POS_SETTINGS_DEFAULT`, the six-colour palette indices, the staff colour order, and `DEMO_PIN = "1234"`.
- [X] T009 Add the `pos` slice (`PosState`) to `src/data/store/state.ts`, seeded in `src/data/store/seed.ts`:
  - `shifts`, `docs`, `held`, `settings`;
  - `ui` with defaults. The shift's `start` is `Date.now() − 3h12m` at seed time.
- [X] T010 Create `src/data/pos.ts` with the pure helpers from data-model.md: `posTotals`, `quickCash`, `productCode`, `matchCode`, `shiftCollections`, `expectedCash`, `closeDiff`, `todayStats`, `onShiftLabel` and `staffList`. Also `posProducts(products, variants, variantStock, store)`, which builds `{ name, cat, vs, min, max, stock }`, leaves out Inactive products and uses `UZ_VARIANTS` prices.
- [X] T011 Create `tests/unit/pos.test.ts`:
  - totals with KES and % discounts, and the cap;
  - VAT = 16/116 of the total;
  - `quickCash(1984)` gives Exact, 2,000 and the 500 and 1000 round-ups;
  - `productCode("Bike Pump","Standard")` = "bikpum-standard", and `matchCode` for an exact code, "name variant", a partial single-variant name and a partial multi-variant name;
  - the seed shift: 6 docs, collections by method, expected cash = 5,000 + cash sales 3,968 (SAL-POS-0004 1,639 + SAL-POS-0002 2,329) = 8,968;
  - `closeDiff` labels;
  - `todayStats` peak hour and top products;
  - `onShiftLabel`.
- [X] T012 Create `src/data/commands/pos.ts` with the launch commands: `launchTill(id)` (resets `ui`; step "pin" if the shift is open, otherwise "shift"; `who` and `pinWho` = the current user's name) and `exitTill()`. Add `usePos`, `usePosTerminal(id)` and `usePosProducts(store)` to `src/data/queries-office.ts` (or a new `queries-pos.ts`). Export from `src/data/index.ts`.
- [X] T013 Create `src/features/pos/screens.tsx` and `PosLaunch.tsx`:
  - **terminal cards** (research R1; spec User Story 1, scenario 1): 16px radius; a scan tile; name and "{branch} · {store}"; the status pill (Shift open amber, Closed, Inactive); the two facts on a canvas panel; a large full-width button (`arrow-up-right`) that calls `router.push(?till=id)`;
  - the "Need another till?…" line with "Manage terminals" linking to `hrefFor("set","Terminals")`;
  - when `?till` names an active terminal, render `<Till id/>`.

  Register `pos` in `src/features/screens.ts`. In `src/components/shell/AppShell.tsx`, hide `<UzaAi/>` while `?till` is present.

**Checkpoint**: the module shows for the Owner and the Cashier. The terminal card shows the seeded open shift. Unit tests pass, and the existing smoke tests pass. Update any stock or report expectation the new design stock lines change, and note it in the commit.

---

## Phase 3: User Story 1 - Ring up a sale (Priority: P1) 🎯 MVP

**Goal**: get from the terminal card to a completed cash, M-Pesa, card or pay-later sale with a receipt, with the effects across UzaPro.

**Independent Test**: quickstart 1–5.

- [X] T014 [US1] In `src/data/commands/pos.ts`, add:
  - **PIN and seller**: `continueToPin`, `pickSeller`, `pressPin(key)` (1234 enters the till; otherwise the error and a shake counter) and `lockTill`;
  - **navigation**: `setPosView`, `setPosQuery`, `setPosCategory`;
  - **cart**: `tapProduct` (one variant adds it; several open the variant dialog), `chooseVariant`, `setVariantQty`, `addVariantToCart`, `changeLine`, `removeLine`, `clearCart`, `setLineNote`, `toggleNoteLine`;
  - **discount**: `setDiscount`, `toggleDiscountType`, `setDiscountOpen`;
  - **barcode**: `scanCode` (toast on no match);
  - **checkout**: `charge` (pre-fills the phone from the customer), `setPayMethod`, `setPayAmount`, `pressCashKey`, `setPayRef`, `setPayPhone`, `requestMpesa` (validate the phone; set waiting; after 1,800ms set paid with a generated code), `addPartPayment`, `removePayment`, `setSaleNote`, `toggleNotify`;
  - **completion**: `completePosSale()` as research R5 describes. Validation messages, the next sale number from `sales.saleNo`, a `Sale` row (channel "POS", type "POS sale", status Paid or Unpaid, `session: true`), `applyStockChanges(KIND.sold)` at the terminal's store, a ledger `post` per payment (kind "Sale"), `addReceivable` for any credit part, the doc and shift ref, a cleared cart, the receipt modal, and the toasts;
  - **receipt and dialogs**: `closeModal`, `receiptNext` (opens the customer picker if `askCust` is on), `printReceipt`, `sendReceipt`, `openReceipt(ref)`;
  - **beep**: plays on add when `settings.sound` is on (research R7).
- [X] T015 [US1] Create `src/features/pos/Till.tsx`:
  - a fixed, inset-0, z-[250] overlay that chooses `PreSteps` or the app layout (rail, main column with header and view, cart aside) by `ui.step`;
  - it renders the active dialog;
  - while it is mounted, the page's toast layer stays visible above it.

  Create `src/features/pos/PreSteps.tsx`:
  - a top bar with the "U" logo, "Back to UzaPro" and "{terminal} · {branch} · {store}";
  - the step bar (Terminal, Open shift, PIN, with done, current and future styles);
  - **open shift**: "This shift is already open" with the opener card and "Continue to PIN", or "Open a new shift" with "Opening cash in the drawer (KES)", quick floats, the counting hint and "Open shift" (US2 wires validation);
  - **PIN**: "Secure login", "Who is selling?" (four people with avatars and `aria-pressed`), the PIN dots (with shake), the error alert, the 3×4 keypad (Clear and Delete icons, labelled), keyboard handling on a focused pad, and "Demo PIN: 1234".
- [X] T016 [US1] Create `src/features/pos/Rail.tsx`, `TillHeader.tsx`, `SellView.tsx` and `Cart.tsx`:
  - **rail**: a nav labelled "Point of sale"; Sell, Today, Orders (held badge), People and Shift with `aria-current`; then Settings, Lock and Exit (Exit in red);
  - **header**: "{terminal} · {store}" and the view title; the search box with each view's placeholder; the seller chip with "On shift {h}h {m}m"; the cart toggle below 860px;
  - **Sell view**: category chips with dots and counts; product tiles (`aria-label` "Add {product}"; initials or image; stock badge colours by quantity; in-cart badge; the price "From KES …"); "No products match your search.";
  - **cart aside**: the customer button; the barcode box; the Cart heading with count and Clear; the empty state; lines (name, "{variant} · KES … each", the stock warning, the note, −/+, the Note button with quick-note chips and a text box, Remove); totals; the discount editor; Hold and "Charge {total}".
- [X] T017 [US1] Create `src/features/pos/dialogs/Variant.tsx`, `Checkout.tsx` and `Receipt.tsx` (20px-radius `Modal`s):
  - **variant**: options with stock-here text, a quantity stepper, and "Add {qty} · KES {amount}";
  - **checkout**: the two-column body (stacks below 860px) with every element in spec User Story 1, scenario 7, including the 6-column cash keypad, quick amounts, the M-Pesa panel, the reference field, split payments, change, notify toggles, the error alert, and the completion button with its label and background states;
  - **receipt**: the success header or "Receipt {ref}"; the monospace slip on `--receipt-paper` with the design's lines and sums, and the footer "Prices include VAT at 16%. Thank you for shopping with us." (no "!", per the deviation); Print, Send, and "New sale" or "Done".
- [X] T018 [US1] Create `tests/smoke/pos.spec.ts` with quickstart 1–5:
  - the terminal card facts and "Manage terminals";
  - the wrong PIN error, then 1234 by keyboard;
  - a cash sale with Bike Pump and Helmet Medium (Total KES 1,984.00; Give change KES 1,016.00; receipt SAL-001185; toast "Receipt printing…");
  - the effects: All sales first row, Point of Sale stock −1, a Cash drawer "Sale" transaction;
  - an M-Pesa plus cash split;
  - pay later for Morningview Bicycles creating a "Sale on credit" receivable, and the walk-in credit error;
  - "… can't be more than what is due." and "… is still due." messages.

**Checkpoint**: US1 works on its own. Today, Orders, People and Shift are present but empty placeholders.

---

## Phase 4: User Story 2 - Open and close a shift (Priority: P1)

**Goal**: open with a float; see the X-report; close with a count and difference.

**Independent Test**: quickstart 8.

- [X] T019 [US2] In `src/data/commands/pos.ts`, add:
  - `setFloatDraft` and `openShift()` (validation toast; set the shift; step "pin"; toast "Shift opened on {terminal}.");
  - `askCloseShift`, `setCloseCount`, `setCloseNote`, and `confirmCloseShift()` ("Enter the cash you counted."; close the shift with `closedAt`, `lastCount`, `lastDiff` and `refs: []`; exit the till; toast "{terminal} shift closed. The drawer balanced." or "Over by" / "Short by" KES x).
- [X] T020 [P] [US2] Create `src/features/pos/ShiftView.tsx`:
  - the "X-report · so far" card (gradient head, Opened by, Opened at, Sales; rows Opening cash, Cash, M-Pesa, Card, On credit, Total sales; "Expected cash in drawer");
  - the "End of shift" card with the danger "Close shift" button.

  Create `src/features/pos/dialogs/CloseShift.tsx`: expected cash, "Cash you counted (KES)", the live difference banner, the optional note, the error, and Cancel / Close shift.
- [X] T021 [US2] Extend `tests/smoke/pos.spec.ts` with quickstart 8:
  - the X-report figures for the seed;
  - closing with a short count shows "Short by" and the toast;
  - the card shows Closed;
  - opening with a blank float shows the toast;
  - opening with 2,000 shows "Shift opened on Terminal 1." and leads to the PIN step.

---

## Phase 5: User Story 3 - Customers, held sales and orders (Priority: P2)

**Goal**: pick or add customers, hold and resume sales, and browse the shift's orders and receipts.

**Independent Test**: quickstart 6.

- [X] T022 [US3] In `src/data/commands/pos.ts`, add:
  - `openCustomerPicker`, `setCustomerQuery`, `pickCustomer`;
  - `openNewCustomer`, `setNewCustomer`, `saveNewCustomer()`: the design's messages; add to `customers` as `{name, phone || "—", email "—", address "—", status Active}`; toast "{name} added to customers."; select them;
  - `holdSale()` (toast "Sale put on hold. Find it under Orders."), `resumeHeld(i)` (toast "Sale resumed.") and `discardHeld(i)`.
- [X] T023 [P] [US3] Create `src/features/pos/OrdersView.tsx` and `PeopleView.tsx`:
  - **Orders**: the held cards (dashed amber; Resume and Discard), then order rows (5 columns with a coloured left border, and a pill Paid or On credit) that open the receipt; search by reference or customer; the empty text;
  - **People**: "Add customer" and customer cards ("Sell to {first}" or "Selected"; what they owe in amber).

  Create `src/features/pos/dialogs/Customer.tsx` and `NewCustomer.tsx`.
- [X] T024 [US3] Extend `tests/smoke/pos.spec.ts` with quickstart 6:
  - pick Morningview Bicycles;
  - add Grace Wanjiru (and check the duplicate-name error), then check she appears in Customers › Customers;
  - hold and resume, checking the badge;
  - open SAL-POS-0005's receipt, which shows SKB7Q2LM0P.

---

## Phase 6: User Story 4 - Today and settings (Priority: P3)

**Goal**: the shift dashboard and the till settings.

**Independent Test**: quickstart 7.

- [X] T025 [US4] In `src/data/commands/pos.ts`, add `openPosSettings`, `togglePosSetting(key)`, `setQuickNoteDraft`, `addQuickNote` and `removeQuickNote(i)`.
- [X] T026 [P] [US4] Create `src/features/pos/TodayView.tsx`:
  - four KPI tiles (the first with a green gradient);
  - "Best sellers this shift" with "See orders";
  - "Sales by hour": a CSS bar chart with a 5-tick axis, 25% gridlines, 8–19 labels, the peak bar in `--green-600` and the others in `--green-200`, "Busiest: …", and bar titles.

  Create `src/features/pos/dialogs/Settings.tsx`: a right-hand Drawer, "Terminal settings · Saved for {terminal} in this session", six labelled `role="switch"` rows, and quick-note chips with Remove, a text box and "Add note" (Enter adds).
- [X] T027 [US4] Extend `tests/smoke/pos.spec.ts` with quickstart 7:
  - the Today KPIs and the "Busiest" line;
  - turning off "Show stock on products" hides the tile badges;
  - adding "No box" shows it as a chip on a cart line's note;
  - Lock returns to the PIN step with the cart kept.

---

## Phase 7: Polish & Cross-Cutting

- [X] T028 [P] In `tests/smoke/responsive.spec.ts`, at 320px and 375px:
  - the till's sell view has no sideways scrolling; the cart button opens the slide-in cart; checkout stacks;
  - axe finds no serious or critical issues on the PIN step, the sell view and checkout;
  - the Cashier sees Point of sale; the Accountant and the Store keeper don't.

  Add `/point-of-sale/terminals` to the scratchpad `mobile/routes.json` and run the audit with 0 issues.
- [X] T029 Do a visual review against the canvas at 1440px and 375px: terminals, open shift, PIN, sell, checkout, receipt, today, orders, people, shift and settings (Principle I). Record any accepted differences in `specs/010-point-of-sale/spec.md` › Design deviations.
- [X] T030 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`), walk through quickstart 1–10, mark the tasks done, and commit on `010-point-of-sale`.

---

## Dependencies & Execution Order

- Setup (T001) → Foundational (T002–T013) → US1 (T014–T018) → US2 (T019–T021) → US3 (T022–T024) → US4 (T025–T027) → Polish (T028–T030).
- **Within Foundational**:
  - T002–T006 run in parallel;
  - T007 needs T005; T008 needs T002; T009 needs T008;
  - T010 needs T002 and T007; T011 needs T010; T012 needs T009;
  - T013 needs T003, T004, T006 and T012.
- **US2–US4** each add to `commands/pos.ts` and `pos.spec.ts` (so those edits run in sequence) and add their own view and dialog files (those can be written in parallel, marked [P]). They depend on US1's till shell (T015–T016).

### Parallel opportunities

- T002–T006.
- T020, T023 and T026 (separate view files) once their command task is done.
- T028 alongside T029.

## Implementation Strategy

1. **MVP**: Phases 1–3. The terminal card, PIN, selling and checkout with all methods, the receipt, and the effects across Sales, stock, accounts and receivables.
2. Then shift open and close (US2), customers, holds and orders (US3), and Today and settings (US4).
3. Polish: phones, the accessibility scan, the audit, the visual review, every gate, the commit.
