# Feature Specification: Quotation to order, and returns against a delivery

**Feature Branch**: `019-quote-to-order-returns`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "continue" (roadmap item: "Quotation to order, and returns against a delivery", the two gaps left by feature 013).

## Context

Feature 013 added sales orders and delivery notes but left two gaps a wholesaler meets quickly:

- A quotation can only become an invoice. When the customer says yes to a quote for goods that will be delivered, the clerk has to retype it as a sales order.
- Goods that come back with the driver (damaged, refused, wrong item) cannot be recorded against the delivery. The only route is a credit note, which needs an invoice, and often the goods are not invoiced yet.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Turn an accepted quotation into a sales order (Priority: P1)

The clerk opens an approved quotation and chooses "Convert to order". The order form opens with the customer and the quoted items, quantities and rates already filled in. They set the deliver-by date and save. The order is created, and the quotation shows the order it became.

**Why this priority**: it removes retyping at the moment a sale is won.

**Independent Test**: convert a quotation that lists products. The order has the same customer, items, quantities and rates; the quotation shows the order number and no longer offers either conversion.

**Acceptance Scenarios**:

1. **Given** a quotation that has not been converted, **When** it is opened, **Then** "Convert to order" is offered next to "Convert to invoice".
2. **Given** "Convert to order", **When** the form opens, **Then** it is filled with the quotation's customer, store and product lines at the quoted rates, and those rates are not replaced by price-list prices.
3. **Given** the order is saved, **When** the quotation is opened again, **Then** it shows the order number as what it was converted to and offers no conversion.
4. **Given** a quotation with a discount, **When** it is converted, **Then** the discount is spread across the line rates so the order total matches the quotation total (to the nearest shilling per line).
5. **Given** a quotation for the walk-in customer, or with no product lines, **When** "Convert to order" is chosen, **Then** it is refused with a message saying why.
6. **Given** a converted order, **When** it is saved, **Then** the credit check from feature 012 runs as for any new order.

---

### User Story 2 - Record goods returned from a delivery (Priority: P1)

The driver comes back with 1 box the customer refused. The clerk opens the delivery note and chooses "Record return": the quantity per line, and a reason. The box goes back into the store's stock, the delivery note shows the return, and the order shows that box as still to dispatch, so it can be sent again.

**Why this priority**: without it stock is wrong the moment anything comes back.

**Independent Test**: return part of a delivery that is not invoiced. Stock at the store rises by the returned quantity (in base units), the delivery note lists the return with its reason, and the order's dispatched quantity falls by the same amount.

**Acceptance Scenarios**:

1. **Given** a delivery note with goods that are not yet invoiced, **When** "Record return" is confirmed with quantities and a reason, **Then** a return with the next RTN number is recorded on the note, stock returns to the note's store, the order's dispatched quantity falls, and a toast reads "{RTN} recorded. {n} items back at {store}."
2. **Given** the return form, **When** a quantity is more than was delivered less what was already returned, every quantity is 0, or no reason is picked, **Then** it is refused with an inline message.
3. **Given** goods that are already invoiced, **When** a return is tried, **Then** it is refused with "{n} {item} can be returned here. The rest is invoiced: raise a credit note from the invoice."
4. **Given** a note with returns, **When** it is opened or listed, **Then** it shows each return (number, date, reason, items) and "Returned" quantities per line.
5. **Given** a role without the right to dispatch, **When** a delivery note is opened, **Then** "Record return" is not offered.

---

### Edge Cases

- **Everything returned**: the order goes back to "Open" if nothing else was dispatched.
- **Bulk units and batches**: returned stock comes back in base units (feature 014) and is not in a batch (feature 016).
- **A return before the note is marked delivered** is allowed: goods can be refused at the door.
- **A quotation line that is not a product** (free text) is left out of the order, and the form says how many lines were left out.
- **Narrow screens**: the return form works from 320px wide.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A quotation that has not been converted MUST offer "Convert to order", which opens the order form filled from the quotation.
- **FR-002**: Converted lines MUST keep the quoted rates, with any quotation discount spread across them.
- **FR-003**: Saving the order MUST record the order number on the quotation, after which neither conversion is offered.
- **FR-004**: Conversion MUST be refused for the walk-in customer and for a quotation with no product lines.
- **FR-005**: A delivery note MUST offer "Record return" while it has goods that are neither returned nor invoiced.
- **FR-006**: A return MUST take a quantity per line (from 0 up to what can be returned, at least one above 0) and a reason from a list.
- **FR-007**: A return MUST put the stock back in the note's store, add a return record (RTN-0001 …) to the note, and reduce the order line's dispatched quantity.
- **FR-008**: A return MUST NOT take a line below what has been invoiced on the order.
- **FR-009**: Recording a return needs the "Dispatch sales orders" right (feature 018). Converting a quotation needs Write on Sales.
- **FR-010**: All changes MUST stay in memory for the session. The Help Center article on sales orders MUST cover both. New controls MUST use existing components and tokens and pass the accessibility checks.

### Key Entities

- **Delivery return**: number, date, who recorded it, reason, and the items and quantities returned. It belongs to a delivery note.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A converted order's total equals the quotation's total to within KES 1 per line.
- **SC-002**: After a return, stock at the store has risen by exactly the returned quantity in base units, and the order's dispatched quantity has fallen by exactly the returned quantity.
- **SC-003**: A line's returned quantity never exceeds its delivered quantity, and dispatched never falls below invoiced.
- **SC-004**: Converting a quotation takes under 20 seconds.

## Assumptions

- **Returns of invoiced goods** stay with the existing credit note flow.
- **A return does not create a credit note or change what the customer owes**, because only goods that are not invoiced can be returned here.
- **Return reasons**: Damaged in transit, Wrong item, Customer refused, Not ordered, Short dated.
- **Dependencies**: quotations (001), orders and delivery notes (013), bulk units (014), dispatch right (018).

## Design deviations

Required by Constitution Principle I. Added at the user's request (2026-11-15).

| Canvas | Built | Why |
|---|---|---|
| A quotation converts to an invoice only | Also "Convert to order" | Sales orders exist since feature 013 |
| No returns on sales deliveries (the canvas has no sales delivery notes) | "Record return" on a delivery note | Goods come back; stock must follow |
