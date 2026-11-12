# Feature Specification: Purchases and Suppliers

**Feature Branch**: `002-purchases-suppliers`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "purchases and suppliers"

**Design source**: `design/canvas/Uzapoint ERP.dc.html` (the Purchases module `buy` and the
Suppliers module `vend`: overview board, purchase order form and view, receive goods, goods
receipt view, purchase return form, rejected items, supplier form) and `design/canvas/erp-data.js`
(`UZ_MODS` › buy / vend rows, `UZ_BUY`). Every screen, label, figure and message comes from
these files (Constitution Principle I). This feature builds on feature 001: the shell, roles,
stock levels and stock movements already exist.

## User Scenarios & Testing *(mandatory)*

The demo presenter acts as one of the four demo people. Purchases and Suppliers are visible to the
Owner (all tabs), the Accountant (Purchases: Overview, Purchase orders, Purchase returns, Rejected
items; Suppliers) and the Store keeper (Purchases: Purchase orders, Goods receipts, Purchase
returns, Rejected items; Suppliers). The Cashier sees neither.

### User Story 1 - Order stock from a supplier (Priority: P1)

The presenter opens Purchases › Purchase orders, sees the seeded orders (supplier, reference,
total, received, status) and creates a new purchase order. They choose a supplier and a
destination store, set the order and expected delivery dates, add line items by searching
products (with a default quantity), set the payment term and method, and save. The order appears
in the list and can be opened to see its supplier, delivery details, items, totals and activity,
downloaded as a PDF (message only), edited, or accepted.

**Why this priority**: ordering from suppliers is the core purchasing flow and the entry point
for receiving goods.

**Independent Test**: create a purchase order with two products and confirm it is listed with the
right supplier and total, then open it and see its items.

**Acceptance Scenarios**:

1. **Given** Purchase orders, **When** the presenter creates an order from Eastside Bicycle
   Supplies for Main Store with two products, **Then** it is listed with the next `PUR-ORD-`
   reference, the computed total, Received "None" and status "Draft" ("Save") or "Approved"
   ("Save and approve", which also records "Sent to supplier" in its activity).
2. **Given** a new order with no supplier or no items, **When** the presenter tries to save,
   **Then** saving is blocked and "No items added yet. Search for a product above." stays visible.
3. **Given** an order, **When** the presenter opens it, **Then** they see "Purchase order {ref}",
   the supplier, "Deliver to", "Items" ("What was ordered from the supplier") with quantities and
   costs, totals, and the actions Download PDF and Edit.
4. **Given** an order that is not yet accepted, **When** the presenter chooses "Accept", **Then**
   its status becomes Accepted and the activity records who accepted it.

---

### User Story 2 - Receive goods into stock (Priority: P1)

From an order (row action "Accept and receive goods" or the order view), the presenter opens
"Receive {ref}", confirms the destination store and received date, optionally enters the delivery
note and supplier invoice numbers, and for each item sets received, accepted and rejected
quantities (or uses "Receive all as ordered" / "Accept all received"). Saving creates a goods
receipt, adds only the accepted quantities to stock at the destination store, logs "Received"
stock movements, lists any rejected quantities under Rejected items, and updates the order's
Received and Status columns (Partial / Full, Accepted / Completed).

**Why this priority**: receiving is what makes purchasing visible in stock — the key cross-module
moment of the demo.

**Independent Test**: create and approve an order for Bike Pump ×10 into Main Store, receive it
with 9 accepted and 1 rejected, and confirm Main Store's Bike Pump quantity rises by 9 only, a GRN
is listed, and a rejected item appears. (Seed orders carry a single placeholder line "Items on
{ref}" in the design, so receiving them records the receipt without changing product stock.)

**Acceptance Scenarios**:

1. **Given** an order to receive, **When** the presenter receives all items as ordered into
   Stores, **Then** a goods receipt `GRN-` is listed, the stock at Stores rises by the accepted
   quantities, the order shows Received "Full" and status "Completed", and the design's message
   ("{GRN} saved. {n} accepted into {store}." followed by "{PYB} added to Payables." when the
   order is unpaid) is shown.
2. **Given** a receipt where some units are rejected, **When** it is saved, **Then** only accepted
   units enter stock and each rejected line appears in Rejected items with reason "Rejected on
   delivery" and status "Waiting".
3. **Given** a goods receipt, **When** the presenter opens it, **Then** they see "Goods receipt
   {ref}" with "Stock updated", the supplier, "Received into", and "Items received" (ordered,
   received, accepted, rejected) with the note "Only accepted quantities go into stock", plus
   Print and PDF (messages only).
4. **Given** a partial receipt, **When** it is saved, **Then** the order shows Received "Partial"
   and status "Accepted"; once the remaining items are received it shows "Full" and "Completed".

---

### User Story 3 - Return items and handle rejected items (Priority: P2)

The presenter raises a purchase return: chooses the purchase order and goods receipt it is against
(optionally filtering by supplier), picks a reason, adds notes, and sets the return quantity per
item (never more than "Can return"). They "Submit only" (status Waiting approval) or "Submit and
approve". Approving a return reduces stock at the receipt's store and logs a movement. In Rejected
items, the presenter opens a rejected line and marks it sent back, replaced, or written off.

**Why this priority**: completes the purchasing loop but is less central than ordering and
receiving.

**Independent Test**: after receiving a new order with real products (US2, e.g. GRN-0042 with
Helmet · Medium ×5 into Main Store), submit and approve a return of 2 Helmets against it and
confirm Main Store's Helmet quantity drops from 5 to 3 and the return is listed as Approved. (Seed
receipts such as GRN-0041 carry the design's placeholder line "Items on {ref}", so returns against
them change no product stock.)

**Acceptance Scenarios**:

1. **Given** Purchase returns, **When** the presenter submits a return of 2 units against a
   goods receipt with "Submit only", **Then** it is listed as "Waiting approval" and stock does not
   change ("↓ Stock goes down when this return is approved.").
2. **Given** a waiting return, **When** the presenter approves it, **Then** its status becomes
   Approved, stock at the receipt's store drops by the returned quantity, and "{ref} approved.
   Stock reduced." is shown.
3. **Given** a return quantity above "Can return", **When** the presenter tries to submit,
   **Then** submission is blocked.
4. **Given** a rejected item with status Waiting, **When** the presenter chooses "Mark sent
   back", "Mark replaced" or "Write off", **Then** its status changes to Sent back, Replaced or
   Written off, and the actions disappear.

---

### User Story 4 - See purchasing at a glance (Priority: P2)

On Purchases › Overview the presenter sees the design's KPIs (total orders, total spend with its
delta, orders to receive, rejected and returned quantities, active suppliers, lead time), the
orders and spend charts, "Delivered on time" per supplier, and "Recent orders" with "View all".

**Why this priority**: gives the Owner and Accountant the purchasing picture; depends on the
lists from US1–US3 but has no flows of its own.

**Independent Test**: open the overview as the Owner and compare every figure and chart with the
design.

**Acceptance Scenarios**:

1. **Given** the Owner, **When** they open Purchases › Overview, **Then** every KPI, chart and
   panel matches the design's values.
2. **Given** the overview, **When** the presenter selects "View all" on Recent orders, **Then**
   they land on Purchase orders.

---

### User Story 5 - Manage suppliers (Priority: P2)

In Suppliers, the presenter browses the supplier list (name, type, phone, email, town or city,
status), adds a supplier ("Individual person" or "Registered business", name, primary phone and
email, nationality, active switch, address info), edits one, and marks one inactive. New and
edited suppliers are available in the purchase order form and the Stock in form.

**Why this priority**: suppliers feed purchasing, but the seeded suppliers already support the
P1 flows.

**Independent Test**: add a supplier "Kisumu Cycle Parts", then pick it in a new purchase order.

**Acceptance Scenarios**:

1. **Given** Suppliers, **When** the presenter adds an active registered business with "Create
   supplier", **Then** it is listed at the end and "{name} added." is shown.
2. **Given** a supplier saved with "Supplier is active" switched off, **When** it is listed,
   **Then** its status is Inactive and it does not appear in supplier pickers.
3. **Given** a supplier name that already exists, **When** the presenter saves, **Then** saving
   is blocked with "{name} is already in the list."

---

### Edge Cases

- Receiving more than was ordered, or accepting more than was received, is blocked.
- An order that is Completed cannot be received again; "Accept" is disabled once Accepted or
  Completed, as in the design's row actions.
- A purchase return cannot return more than was accepted on its goods receipt minus earlier
  returns, and approving it can never take stock below zero.
- Inactive suppliers stay in the Suppliers list but are hidden from supplier pickers.
- "Send to Purchases" from the Stock in form (feature 001) adds a goods receipt for that supplier
  and store with purchase order "—" and status "Waiting" (no stock change), as the design does.
- Payment fields (payment term, method, "Pay from account", "Already paid") are captured on the
  order, but no Payables or Accounts records are created; where the design's message mentions
  Payables, the message is shown as designed.
- The Accountant has no Goods receipts tab and the Store keeper has no Overview tab; deep links to
  them redirect to the dashboard (feature 001 routing rules).
- Reload resets all purchasing data to the design seed (Constitution Principle III).

## Requirements *(mandatory)*

### Functional Requirements

**Purchases module**

- **FR-001**: Purchases MUST provide the Overview, Purchase orders, Goods receipts, Purchase
  returns and Rejected items tabs with the design's columns, seed rows, status pills, filters and
  header actions, filtered by role as in the design.
- **FR-002**: Users MUST be able to create and edit a purchase order with supplier, destination
  store, order date, optional expected delivery, internal notes, payment term, payment method,
  optional pay-from account, already-paid amount, and line items found by product search with a
  default quantity. Totals MUST be computed from line quantities and costs.
- **FR-003**: Users MUST be able to open a purchase order view showing supplier, delivery
  details, items, totals, status and activity, with Download PDF (message only) and Edit.
- **FR-004**: Users MUST be able to accept an order and to "Accept and receive goods", as the
  design's row actions do, with the same enabled/disabled rules.
- **FR-005**: Users MUST be able to receive an order in one or more goods receipts, entering per
  line the received, accepted and rejected quantities, the destination store, received date,
  delivery note and supplier invoice numbers and notes; "Receive all as ordered" and "Accept all
  received" MUST fill the quantities.
- **FR-006**: Saving a goods receipt MUST add only accepted quantities to stock at the
  destination store, log "Received" stock movements with the GRN reference, add rejected lines to
  Rejected items, and update the order's Received (Partial/Full) and Status.
- **FR-007**: Users MUST be able to open a goods receipt view with its supplier, store, items and
  totals, and Print / PDF (messages only).
- **FR-008**: Users MUST be able to raise a purchase return against a purchase order and goods
  receipt with a reason, notes and per-item return quantities limited by "Can return", and submit
  it with "Submit only" (Waiting approval) or "Submit and approve".
- **FR-009**: Approving a purchase return MUST reduce stock at the receipt's store, log a stock
  movement, and show "{ref} approved. Stock reduced."
- **FR-010**: Users MUST be able to mark a rejected item as Sent back, Replaced or Written off from
  its view, after which no further actions are offered.
- **FR-011**: The Purchases Overview MUST show the design's KPIs, charts, delivered-on-time list
  and recent orders. Fixed design figures stay fixed; counts the design derives from the lists
  (orders, to receive, rejected, returned, active suppliers) are computed once from the seed and
  then frozen, as in feature 001 (FR-005 there).

**Suppliers module**

- **FR-012**: Suppliers MUST list all seeded suppliers with the design's columns and status, with
  search and Export CSV as in other lists.
- **FR-013**: Users MUST be able to add and edit a supplier (type, name — "Full name" or
  "Registered business name" — primary phone, primary email, nationality, active switch, street,
  town or city, county, postal address) with "Create supplier" / "Save changes", the messages
  "{name} added." / "Changes saved.", and the duplicate block "{name} is already in the list.".
- **FR-014**: Only active suppliers MUST appear in supplier pickers (purchase order, purchase
  return filter, Stock in).

**Cross-cutting**

- **FR-015**: "Send to Purchases" in the Stock in form MUST add a goods receipt (next `GRN-`
  reference, purchase order "—", the chosen supplier and store, its line count, status "Waiting")
  without changing stock, and show "Sent to Purchases.", as the design does.
- **FR-016**: Every action MUST show the design's confirmation or error text; references MUST
  follow the design's sequences (`PUR-ORD-`, `GRN-`, `PRT-`, `REJ-`).
- **FR-017**: All changes MUST appear immediately in every affected list and stock quantity for
  the rest of the session and reset on reload.
- **FR-018**: Payables and Accounts remain out of scope: payment details are stored on the order
  only and no records are created in those modules.

### Key Entities

- **Supplier**: name, type (Individual / Business; the form labels them "Individual person" and
  "Registered business"), phone, email, nationality (default Kenya),
  street, town or city, county, postal address, status (Active / Inactive).
- **Purchase order**: reference (`PUR-ORD-####`), supplier, destination store, order date,
  expected delivery, notes, payment term, payment method, pay-from account, already paid, lines
  (product, variant, quantity, unit cost), total, received state (None / Partial / Full), status
  (Draft, Approved, To receive, Accepted, Completed, Cancelled), activity log.
- **Goods receipt**: reference (`GRN-####`), purchase order, supplier, store, received on,
  delivery note no., supplier invoice no., notes, lines (ordered, received, accepted, rejected),
  status (Saved / Partial / Waiting — "Waiting" for receipts sent from Stock in).
- **Purchase return**: reference (`PRT-####`), supplier, purchase order, goods receipt, reason,
  notes, lines (product, variant, quantity, value), total quantity and value, status (Waiting
  approval / Approved).
- **Rejected item**: reference (`REJ-####`), goods receipt, supplier, item, quantity, reason,
  status (Waiting / Sent back / Replaced / Written off).
- **Stock level and stock movement**: from feature 001; receipts add stock, approved returns
  remove it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side review, 100% of Purchases and Suppliers screens, tabs, forms and
  dialogs match the design's layout, wording and figures, apart from documented deviations.
- **SC-002**: A presenter can create a purchase order and receive it into stock in under 2
  minutes.
- **SC-003**: After any receipt or approved return of product lines, the affected product's quantity in Stock ›
  Stock management changes by exactly the accepted or returned quantity, with no reload. (The design's seed orders and
  receipts carry placeholder lines that record the movement without changing product stock.)
- **SC-004**: For each of the four roles, 100% of visible Purchases and Suppliers tabs match the
  design's role definitions, and hidden tabs cannot be reached.
- **SC-005**: A full click-through of both modules produces no visible errors, and after a reload
  100% of the data matches the design seed.

## Design deviations

Required by Constitution Principle I. These are the only intended differences from the design.

| Deviation | Reason | Reference |
|---|---|---|
| Receiving goods and "Already paid" capture payment details, but no Payables or Accounts record is created; the toast still names the `PYB-` bill as the design does | Payables and Accounts are out of scope for this feature | FR-018 |
| Receiving more than is outstanding on an order line, accepting more than was received, returning more than "Can return", or any change that would take stock below zero is blocked | Data integrity, consistent with feature 001 (FR-016 there); the design does not always enforce these limits | Edge cases, FR-005, FR-008 |
| Not built: "New product" inside the order/return product search, the generic "New" header button on Rejected items, and the browser print dialog behind "Print" (message only) | Product creation belongs to Products; the generic drawer and real printing are outside this demo | FR-002, FR-007 |

## Assumptions

- Seed data is ported verbatim from `erp-data.js`: 3 purchase orders (PUR-ORD-0409, -0408,
  -0372), 2 goods receipts (GRN-0041, -0040), 2 purchase returns (PRT-0005, -0004), 2 rejected
  items (REJ-0003, -0002), 3 suppliers, and `UZ_BUY` for the overview.
- Where the design builds order and receipt details for seed rows in its logic (lines, costs,
  dates), those derived values are used as the seed details.
- The new screens reuse feature 001's shell, list toolbar, drawers, pickers and stock data layer.
- The "Top suppliers" panel on the Dashboard keeps its fixed design figures (feature 001, Q3).
- Desktop is the primary demo target; phone width must stay usable, as in feature 001.
