# Feature Specification: Batch and expiry tracking

**Feature Branch**: `016-batch-expiry`

**Created**: 2026-11-15

**Status**: Removed (2026-11-15). The Expiry tab, batches, earliest-expiry-first and the expired-stock check were taken out of the app; this spec is kept as a record.

**Input**: User description: "go ahead and build them" (roadmap item: "Batch and expiry tracking. Sell the earliest-expiring batch first and alert on stock close to expiry. This matters for food, drinks, cosmetics and pharmacy.")

## Context

UzaPro counts stock as one number per product and store. It cannot say that 4 of the 12 tins of paint on the shelf expire this month, or that 2 expired in October and must not be sold. For a shop selling food, drinks, cosmetics or medicine that is the difference between a write-off spotted in time and a customer complaint.

This feature lets a store record which stock belongs to which batch and when it expires, uses the earliest-expiring batch first, keeps expired stock out of sales, and shows what is expired or about to be.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See what is expired or expiring (Priority: P1)

The store keeper opens Stock › Expiry. Each line is a batch: product, store, batch number, expiry date, days left, quantity and a status. Muthokinju Paint at Point of Sale has three batches: one expired in October, one expiring in 18 days, one good until next April. A summary reads "1 expired · 1 expiring in 30 days".

**Why this priority**: seeing the problem is the first value, and everything else acts on this list.

**Independent Test**: open Expiry with the seed data. Batches are listed earliest expiry first with the right days left and status, and the summary counts match.

**Acceptance Scenarios**:

1. **Given** batches, **When** the list shows, **Then** they are ordered by expiry date, earliest first, each with "Expired", "Expires soon" (30 days or fewer left) or "OK".
2. **Given** a batch that expired, **When** it shows, **Then** days left reads "Expired {n} days ago".
3. **Given** the summary, **When** it shows, **Then** it counts expired batches and batches expiring within 30 days.

---

### User Story 2 - Record a batch (Priority: P1)

Stock arrives, or is already on the shelf, and the store keeper chooses "Record batch": product, store, batch number, expiry date and quantity. The quantity cannot be more than the stock at that store that is not yet in a batch.

**Why this priority**: without it there is nothing to track beyond the seed.

**Independent Test**: record a batch for stock that has none. It is listed, and trying to record more than the unbatched stock is refused with the amount available.

**Acceptance Scenarios**:

1. **Given** stock at a store that is not in a batch, **When** a batch is recorded with a number, an expiry date and a quantity within that stock, **Then** it is listed and a toast reads "Batch {number} recorded."
2. **Given** the form, **When** the quantity is more than the unbatched stock, **Then** it is refused with "Only {n} {product} at {store} is not in a batch yet."
3. **Given** the form, **When** the batch number is already used for that product and store, the number or date is blank, or the quantity is not a whole number of 1 or more, **Then** it is refused with an inline message.
4. **Given** a batch, **When** "Remove" is confirmed, **Then** the batch record goes and its stock counts as not in a batch again. Stock on hand does not change.

---

### User Story 3 - Earliest expiry goes first, and expired stock is not sold (Priority: P1)

A cashier sells 5 tins of paint. The 4 in the batch that expires soonest go first, then 1 from the next batch. The 2 expired tins are never used for a sale: with 10 in date, a sale of 11 is refused, although the shelf holds 12.

**Why this priority**: this is what stops expired goods reaching a customer.

**Independent Test**: sell more than the earliest in-date batch holds: that batch is used up, the next is reduced, and the expired batch is untouched. A sale needing more than the in-date stock is refused.

**Acceptance Scenarios**:

1. **Given** in-date batches, **When** stock is sold, invoiced or dispatched, **Then** quantities come from the batch with the earliest expiry first, then the next, then stock not in a batch.
2. **Given** an expired batch, **When** stock is sold, **Then** it is not used, and a sale that needs more than the in-date stock is refused with "Only {n} {product} left at {store}.", where n leaves out expired stock.
3. **Given** a batch whose quantity reaches zero, **When** the list shows, **Then** the batch is gone.
4. **Given** stock that leaves for another reason (wastage, transfer, return to supplier), **When** it is saved, **Then** expired batches are used first, then earliest expiry.

---

### User Story 4 - Write off an expired batch (Priority: P2)

On an expired batch, the store keeper chooses "Write off". Its quantity is recorded as wastage with the reason "Expired", stock on hand falls, and the batch is gone.

**Why this priority**: it finishes the job, but wastage can already be recorded by hand.

**Independent Test**: write off the expired seed batch. Wastage gains an "Expired" entry for its quantity, stock on hand falls by that quantity, the other batches are unchanged.

**Acceptance Scenarios**:

1. **Given** an expired batch, **When** "Write off" is confirmed, **Then** a wastage entry with the reason "Expired" is recorded for exactly that batch's quantity, and a toast reads "Batch {number} written off."
2. **Given** a batch that is not expired, **When** its menu opens, **Then** "Write off" is not offered.

---

### Edge Cases

- **Stock not in a batch** is treated as in date and is used after the batches.
- **Stock coming in** (receipts, stock in, returns, voids) is not in a batch until one is recorded.
- **Transfers** move stock out of the sending store's batches; it arrives at the other store not in a batch, and the batch is recorded again there. Carrying batches across a transfer is out of scope.
- **Bulk units**: batch quantities are in base units, like stock (feature 014).
- **A product removed**: its batches go with it. A product renamed: its batches follow.
- **Today** is the demo's fixed date.
- **Read-only role**: with Read on Stock the list can be viewed; recording and writing off need Write, removing needs Delete.
- **Narrow screens**: the list and form work from 320px wide without sideways page scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Stock MUST gain an "Expiry" tab listing batches: Product, Store, Batch, Expiry date, Days left, Quantity, Status, earliest expiry first.
- **FR-002**: A batch MUST have a product, a store, a batch number (unique per product and store), an expiry date and a quantity in base units (a whole number, 1 or more).
- **FR-003**: The batches of a product at a store MUST never add up to more than the stock on hand there.
- **FR-004**: Status MUST be "Expired" (expiry date before today), "Expires soon" (30 days or fewer left) or "OK".
- **FR-005**: Recording a batch MUST be limited to the stock at that store that is not yet in a batch.
- **FR-006**: Sales, invoices, till sales and sales-order dispatches MUST take stock from in-date batches, earliest expiry first, then from stock not in a batch, and MUST NOT take expired stock.
- **FR-007**: A sale that needs more than the in-date stock MUST be refused, stating the in-date quantity.
- **FR-008**: Other outgoing movements (wastage, transfers, purchase returns) MUST take expired batches first, then earliest expiry, then stock not in a batch.
- **FR-009**: An empty batch MUST be removed.
- **FR-010**: "Write off" MUST be offered on expired batches and MUST record wastage with the reason "Expired" for that batch's quantity.
- **FR-011**: "Remove" MUST delete the batch record without changing stock on hand.
- **FR-012**: Recording and writing off need Write on Stock; removing needs Delete on Stock.
- **FR-013**: All changes MUST stay in memory for the session and reset on reload.
- **FR-014**: The Help Center MUST gain an article on batches and expiry.
- **FR-015**: New screens MUST use the existing design-system components and tokens, work from 320px wide, and pass the automated accessibility checks.

### Key Entities

- **Batch**: product, store, batch number, expiry date, quantity in base units.
- **Batch status** (worked out): days left, and Expired, Expires soon or OK.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No sale ever takes stock from an expired batch: 0 cases across the new sale form, invoices, the till and dispatches.
- **SC-002**: After any sequence of movements, a product's batches at a store never exceed its stock on hand there.
- **SC-003**: Sales always empty the earliest-expiring in-date batch before touching a later one.
- **SC-004**: A store keeper can see every expired and soon-to-expire batch in one screen, and write one off in under 15 seconds.
- **SC-005**: Products with no batches behave exactly as before this feature.

## Assumptions

- **Batches are recorded on the Expiry tab**, against stock that is already on hand. Capturing the batch on the goods receipt and stock-in forms is a later step.
- **30 days** is the "expires soon" window for every product.
- **Expired stock is blocked from sales but still counted in stock on hand** until it is written off.
- **Seed batches are new**, because the canvas has none (see Design deviations): three batches of Muthokinju Paint at Point of Sale.
- **Dependencies**: stock and wastage (001), bulk units (014).

## Design deviations

Required by Constitution Principles I and II. Added at the user's request (2026-11-15).

| Canvas | Built | Why |
|---|---|---|
| Stock has no Expiry tab | New tab "Expiry" | The user asked for batch and expiry tracking |
| Any stock on hand can be sold | Expired batches cannot | The point of expiry tracking |
| No batch data | New seed batches | The canvas has none (Principle II) |
