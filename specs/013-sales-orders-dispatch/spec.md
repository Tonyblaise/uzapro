# Feature Specification: Sales orders and dispatch

**Feature Branch**: `012-wholesale-pricing-credit` (built on top of feature 012, which is not yet committed)

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "build sales orders and dispatch" (roadmap item 3: "Sales orders, dispatch and delivery. Order, then pick, then a delivery note, then an invoice. Include partial deliveries, driver and vehicle, and proof of delivery.")

## Context

A wholesaler rarely hands goods over the counter. A customer orders, the store picks and loads what it has, a driver delivers it, and the customer is invoiced for what arrived. Today UzaPro has only two documents for this: a quotation (no stock, no commitment) and an invoice (stock leaves at once, the customer owes at once). There is nothing for "ordered, not yet sent" or "sent in two trips", and delivery notes exist only for goods received from suppliers.

This feature adds the two missing documents, a **sales order** and a **delivery note**, and links them to stock and invoices.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Take a sales order (Priority: P1)

A sales clerk opens Sales › Sales orders and chooses "New order". They pick the customer "Mountain Goats", a "Deliver by" date and the store the goods will leave from, and add lines: product, unit, quantity. Prices fill in from the customer's price list (feature 012). They save. The order appears as SO-0002 with the status "Open". No stock has moved and the customer owes nothing yet.

**Why this priority**: every other story starts from an order.

**Independent Test**: create an order for a named customer with two lines. It is listed with the right total and "Open", stock levels are unchanged, and Receivables has no new row.

**Acceptance Scenarios**:

1. **Given** the order form, **When** a customer, a deliver-by date and at least one line with a quantity above 0 are entered, **Then** Save creates the next SO number, a toast reads "{number} saved.", and the order is listed as "Open".
2. **Given** the order form, **When** the customer is the walk-in customer or no customer is picked, **Then** saving is refused with "Pick the customer first. Walk-in customers can't place orders."
3. **Given** a customer in a priced group, **When** a line is added or its unit or quantity changes, **Then** the rate follows the same rules as on an invoice (feature 012), and a typed rate is kept.
4. **Given** an order that would take the customer over their credit limit, or a customer who is overdue or on cash terms, **When** it is saved, **Then** the credit stop from feature 012 appears; with an approval the order records who approved it.
5. **Given** a saved order, **When** it is opened, **Then** it shows each line with ordered, dispatched and left to dispatch, the total, the deliver-by date, and its delivery notes and invoices.
6. **Given** an order with nothing dispatched, **When** "Cancel order" is confirmed, **Then** its status is "Cancelled" and it can no longer be dispatched.

---

### User Story 2 - Dispatch goods with a delivery note (Priority: P1)

The store keeper's side of the job: from an open order, choose "Dispatch". Each line shows what is left to send, defaulting to all of it. They lower one line because the store is short, enter the driver and the vehicle, and confirm. A delivery note DN-0002 is created with the status "Out for delivery", the sent quantities leave the order's store, and the order shows "Part dispatched". A second dispatch later sends the rest and the order becomes "Dispatched".

**Why this priority**: this is the point of the feature: goods leave against an order, in one trip or several.

**Independent Test**: dispatch part of an order. A delivery note exists, stock at the store dropped by exactly the sent quantities, and the order shows the remainder. Dispatch the rest: the order is "Dispatched" and a third dispatch is not offered.

**Acceptance Scenarios**:

1. **Given** an open order, **When** Dispatch is opened, **Then** each line with something left is listed with its remaining quantity filled in.
2. **Given** the dispatch form, **When** a quantity is above what is left, below 0, or every quantity is 0, **Then** confirming is refused with an inline message.
3. **Given** the dispatch form, **When** the store does not hold enough of a product, **Then** confirming is refused with "Only {n} {product} left at {store}." and nothing changes.
4. **Given** a valid dispatch, **When** it is confirmed, **Then** a delivery note with the next DN number is created as "Out for delivery", stock leaves the order's store, each stock movement carries the DN number, and a toast reads "{DN} created. {n} items left {store}."
5. **Given** an order, **When** some but not all quantities are dispatched, **Then** it shows "Part dispatched"; when all are, "Dispatched".
6. **Given** a delivery note, **When** it is opened, **Then** it shows the order, customer, store, driver, vehicle, lines and status, with "Print delivery note".
7. **Given** a driver name or vehicle left blank, **When** the dispatch is confirmed, **Then** it is refused with "Enter the driver's name" or "Enter the vehicle registration".

---

### User Story 3 - Confirm delivery (Priority: P2)

When the driver is back, the clerk opens the delivery note and chooses "Mark delivered". They enter who received the goods. The note becomes "Delivered" and records the receiver's name, the date and the time: the proof of delivery.

**Why this priority**: it closes the loop on a dispatch, but orders and invoices work without it.

**Independent Test**: mark a delivery note delivered with a receiver's name. It shows "Delivered", the name and the time, and the action is no longer offered.

**Acceptance Scenarios**:

1. **Given** a note that is "Out for delivery", **When** "Mark delivered" is confirmed with a receiver's name, **Then** it becomes "Delivered" and shows "Received by {name}" with the date and time, and a toast reads "{DN} marked delivered."
2. **Given** the form, **When** the receiver's name is blank, **Then** it is refused with "Enter who received the goods".
3. **Given** a delivered note, **When** it is opened, **Then** "Mark delivered" is not offered.

---

### User Story 4 - Invoice what was dispatched (Priority: P2)

From an order with dispatched goods that are not yet invoiced, the clerk chooses "Create invoice". An invoice is raised for exactly those quantities at the order's rates, due after the customer's payment terms. It appears under Invoices and in Receivables, and no stock moves, because it already left with the delivery note. Once everything on the order is dispatched and invoiced, the order shows "Invoiced".

**Why this priority**: it turns a delivery into money owed. It depends on Story 2.

**Independent Test**: dispatch half an order and create the invoice: it covers only the dispatched half, stock does not move again, and a receivable is added. Dispatch and invoice the rest: the order is "Invoiced".

**Acceptance Scenarios**:

1. **Given** an order with dispatched quantities not yet invoiced, **When** "Create invoice" is chosen, **Then** an invoice for those quantities is created, a receivable is added, and a toast reads "{INV} saved. {RCV} added to Receivables."
2. **Given** that invoice, **When** stock is checked, **Then** it is unchanged by the invoice.
3. **Given** an order with nothing new dispatched, **When** it is opened, **Then** "Create invoice" is not offered.
4. **Given** an order fully dispatched and fully invoiced, **When** it is listed, **Then** its status is "Invoiced".

---

### Edge Cases

- **Order edits**: an order can be edited while nothing is dispatched. After the first dispatch it is fixed.
- **Cancel after dispatch**: not allowed. "Cancel order" is offered only while nothing is dispatched.
- **Credit**: the credit check runs when the order is saved, because that is when the business commits. An invoice raised from an order is not checked again.
- **Open orders and available credit** (decided 2026-11-15): an order counts against the customer's credit limit from the moment it is saved. Available credit is the limit, less the balance owed, less what is on order and not yet invoiced. Invoicing moves the amount from "on order" to "owed"; cancelling the order frees it. This amends feature 012's FR-013.
- **Customer renamed**: orders and delivery notes follow the new name, like other sales documents.
- **Product removed after ordering**: the order keeps its line; dispatching it is refused by the stock check.
- **Read-only role**: with Read on Sales, orders and delivery notes can be viewed and printed, but not created, dispatched, marked delivered, invoiced or cancelled. Cancel needs Delete.
- **Narrow screens**: the two lists, the order form, the dispatch form and the record views work from 320px wide without sideways scrolling of the page.

## Requirements *(mandatory)*

### Functional Requirements

**Sales orders**

- **FR-001**: Sales MUST gain a "Sales orders" tab listing: Order #, Customer, Order date, Deliver by, Status, Amount (KES), with a "New order" action.
- **FR-002**: An order MUST have a named customer, an order date, a deliver-by date, a store the goods leave from, at least one line (product variant, unit, quantity above 0, rate) and optional notes.
- **FR-003**: Order numbers MUST run SO-0001, SO-0002 and so on.
- **FR-004**: Rates on order lines MUST follow feature 012's price rules for the order's customer.
- **FR-005**: Saving an order MUST run feature 012's credit check on the order total, with the same stop dialog and approval rules, and record an approval on the order.
- **FR-005a**: A customer's open orders (not cancelled, the part not yet invoiced, with VAT) MUST count against their credit limit. The customer record and the stop dialog MUST show the amount as "On order, not yet invoiced".
- **FR-006**: Saving an order MUST NOT move stock or create a receivable.
- **FR-007**: An order's status MUST be worked out from its lines: "Open" (nothing dispatched), "Part dispatched", "Dispatched" (everything dispatched), "Invoiced" (everything dispatched and invoiced), or "Cancelled".
- **FR-008**: An order MUST be editable and cancellable only while nothing is dispatched.
- **FR-009**: The order record MUST show, per line: ordered, dispatched, left to dispatch, rate and amount; and list the order's delivery notes and invoices.

**Dispatch and delivery notes**

- **FR-010**: Sales MUST gain a "Deliveries" tab listing: Delivery note, Order, Customer, Date, Driver, Vehicle, Items, Status.
- **FR-011**: "Dispatch" MUST be offered on an order that is not cancelled and has something left to dispatch.
- **FR-012**: A dispatch MUST take, per line, a quantity from 0 up to what is left (at least one above 0), a driver's name, a vehicle registration and optional notes.
- **FR-013**: A dispatch MUST be refused when the order's store does not hold enough stock, naming the product, the store and what is available.
- **FR-014**: A confirmed dispatch MUST create a delivery note (DN-0001, DN-0002 …) with the status "Out for delivery", take the quantities out of the order's store, and add to each order line's dispatched quantity.
- **FR-015**: A delivery note MUST be markable as "Delivered" with the receiver's name; it then records the name, date and time.
- **FR-016**: A delivery note MUST offer "Print delivery note", which behaves like the app's other print actions.

**Invoicing**

- **FR-017**: "Create invoice" MUST be offered on an order with dispatched quantities that are not yet invoiced, and MUST create one invoice for those quantities at the order's rates, due after the customer's payment terms.
- **FR-018**: An invoice created from an order MUST NOT move stock, MUST add a receivable, and MUST be linked from the order.

**Across the feature**

- **FR-019**: Create, edit, dispatch, mark delivered and create invoice need Write on Sales; cancel needs Delete on Sales.
- **FR-020**: All changes MUST stay in memory for the session and reset on reload. No new storage keys.
- **FR-021**: Existing sales, quotation, invoice and till flows MUST behave exactly as before.
- **FR-022**: The Help Center MUST gain an article on sales orders and deliveries.
- **FR-023**: New screens MUST use the existing design-system components and tokens, work from 320px wide, and pass the automated accessibility checks.

### Key Entities

- **Sales order**: number, customer, order date, deliver-by date, store, lines, notes, who took it, optional credit approval, cancelled flag, and the invoices raised from it.
- **Order line**: product variant, unit, quantity ordered, rate, whether it is taxed, quantity dispatched, quantity invoiced.
- **Delivery note**: number, the order it belongs to, customer, date, store, lines (product variant, unit, quantity), driver, vehicle, notes, status, and once delivered: received by, date and time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A clerk can take a two-line order in under 90 seconds.
- **SC-002**: A dispatch can be recorded in under 60 seconds from the order, including driver and vehicle.
- **SC-003**: Across any sequence of partial dispatches, the quantity dispatched for a line never exceeds the quantity ordered, and stock at the store falls by exactly the dispatched quantities: 0 mismatches.
- **SC-004**: Invoices raised from an order add up to exactly the dispatched quantities at the order's rates, and never move stock: 0 mismatches.
- **SC-005**: Every existing smoke and unit test passes without a change to its expectations, apart from tab counts and the Help Center article count.
- **SC-006**: Every new screen shows no sideways page scrolling at 320px and 1440px and passes the automated accessibility scan with no serious or critical issues in its own content.

## Assumptions

- **Picking** is not a separate step. The dispatch form is the pick list: the store confirms what it is sending. A separate pick-and-pack stage is out of scope.
- **Stock is not reserved** by an open order. It is checked when goods are dispatched.
- **Who dispatches**: dispatch follows Write on Sales. The Store keeper role has no Sales access in the seed; the owner can grant it in Permissions.
- **One store per order.** Goods leave from the order's store.
- **Proof of delivery** is the receiver's name, date and time. Signatures and photos are out of scope.
- **Returns** of delivered goods use the existing credit note flow.
- **Converting a quotation to an order** is out of scope; quotations still convert to invoices.
- **Units**: quantities are in the line's unit, and stock moves by that number, as on invoices today.
- **Seed data** is new, because the canvas has none (see Design deviations): one order for Morningview Bicycles (SO-0001: 4 boxes of Bike Pump from Main Store, 2 dispatched, approved while the customer was overdue) and its delivery note (DN-0001, delivered). It is on Morningview Bicycles so that Mountain Goats keeps KES 19,600 of available credit for the demo.
- **Dependencies**: sales documents and stock (001), receivables (003), permissions (011), pricing and credit (012).

## Design deviations

Required by Constitution Principles I and II. The canvas has no sales orders or delivery notes for sales. This feature is added at the user's direct request ("build sales orders and dispatch", 2026-11-14).

| Canvas | Built | Why |
|---|---|---|
| Sales has seven tabs | Two more: "Sales orders" and "Deliveries" | The user asked for sales orders and dispatch |
| Stock leaves when an invoice is saved | Also leaves on a delivery note; an invoice raised from an order moves no stock | Goods leave when they are dispatched |
| No seed data for orders or delivery notes | New seed values, listed under Assumptions | The canvas has none (Principle II) |
| The Accountant's Sales tabs are a fixed list | That list gains the two new tabs | The Accountant raises the invoices |
