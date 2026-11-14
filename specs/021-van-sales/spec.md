# Feature Specification: Van sales

**Feature Branch**: `021-van-sales`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "go ahead" (roadmap item 5: "Sales rep and van sales app. Route visits, order taking, cash and M-Pesa collection, and stock on the van." Chosen next by the assistant and reported to the user as such.)

## Context

A distributor's sales happen on the road. A rep loads a van in the morning, visits a list of shops, sells from the van, takes cash or M-Pesa or sells on credit, and hands in the cash at night. Today UzaPro can only sell from the counter: a sale always leaves the "Point of Sale" store, there is no list of visits, and nothing shows what the rep should hand in.

This feature adds a field-sales screen built for a phone: today's visits, selling from the van's stock at the customer's own prices, and an end-of-day summary.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See today's route and the van's stock (Priority: P1)

The rep opens Sales › Field sales. It shows the van, today's visits (customer, phone, status), and what is on the van. A summary at the top shows visits done, sales so far, cash to hand in and what was sold on credit.

**Why this priority**: it is the rep's home screen; everything else starts from it.

**Independent Test**: open Field sales with the seed data: two planned visits, the van's stock, and a summary of zeros.

**Acceptance Scenarios**:

1. **Given** the seed, **When** Field sales opens, **Then** it shows the van, its stock by product, and today's visits with the status "Planned".
2. **Given** "Add visit", **When** a customer is picked, **Then** a planned visit for today is added. The walk-in customer and a customer already on today's route are refused.
3. **Given** the summary, **When** nothing has been sold, **Then** it shows 0 of N visits done and KES 0.00 for sales, cash and credit.

---

### User Story 2 - Sell from the van on a visit (Priority: P1)

The rep taps "Start visit" on Mountain Goats. The screen shows the customer's available credit and anything overdue. The rep adds items from what is on the van, at the customer's prices, chooses how it is paid (Cash, M-Pesa or Pay later) and completes the sale. Stock leaves the van, the visit shows "Sold" with the sale's number, and the summary updates.

**Why this priority**: this is the sale.

**Independent Test**: complete a cash sale on a visit. Stock in the van falls by what was sold (in base units), stock elsewhere is unchanged, a sale is recorded with the channel "Field sales", the visit is "Sold", and cash to hand in rises by the sale total.

**Acceptance Scenarios**:

1. **Given** a planned visit, **When** it is started, **Then** only products in stock on the van can be added, at the customer's group price or the standard price.
2. **Given** items and a payment method, **When** the sale is completed, **Then** a sale is recorded from the van, the van's stock falls, the visit becomes "Sold" and shows the sale number, and a toast reads "Sale recorded. …".
3. **Given** more of a product than the van holds, **When** the sale is completed, **Then** it is refused with "Only {n} {product} left at {van}."
4. **Given** "Pay later (credit)", **When** the customer is over their limit, overdue or on cash terms, **Then** the credit stop from feature 012 appears, with approval for roles that have the right.
5. **Given** a visit where nothing is sold, **When** "No sale" is chosen with a reason, **Then** the visit becomes "No sale" and shows the reason.
6. **Given** a visit that is Sold or No sale, **When** it is listed, **Then** it cannot be started again.

---

### User Story 3 - End-of-day summary (Priority: P2)

At the end of the route the summary shows visits done, total sales, the split by Cash, M-Pesa and credit, and "Cash to hand in". The van's stock shows what is left to return to the store.

**Why this priority**: it is how the day is reconciled, but selling works without it.

**Independent Test**: after one cash sale and one M-Pesa sale, the summary's cash to hand in equals the cash sale only, and total sales equals both.

**Acceptance Scenarios**:

1. **Given** sales on visits, **When** the summary shows, **Then** total sales is their sum, and Cash, M-Pesa and credit each show their part.
2. **Given** the summary, **When** it shows, **Then** "Cash to hand in" is the cash part only.

---

### Edge Cases

- **Loading and unloading the van** use the existing stock transfer between the store and the van.
- **Bulk units, batches and price lists** (features 012, 014, 016) apply to van sales as to any sale.
- **Money a customer already owes** is collected with the existing "Record payment" in Receivables; the visit links to it.
- **Several vans**: a van is a storage location of the type "Van". With more than one, the screen has a van picker.
- **No van**: the screen explains that a storage location of the type "Van" is needed.
- **Phone first**: the screen works from 320px wide without sideways scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sales MUST gain a "Field sales" tab showing a van, its stock, today's visits and a summary.
- **FR-002**: A van MUST be a storage location of the type "Van". Its stock is ordinary stock at that location.
- **FR-003**: A visit MUST have a customer, a date, a van, a rep and a status: Planned, Sold or No sale.
- **FR-004**: "Add visit" MUST add a planned visit for today for a named customer not already on today's route for that van.
- **FR-005**: A sale on a visit MUST leave the van's stock, MUST use the customer's prices (feature 012), MUST be checked for credit when paid later (feature 012), and MUST be recorded as a sale with the channel "Field sales".
- **FR-006**: Only products in stock on the van MUST be offered on a visit.
- **FR-007**: Completing the sale MUST mark the visit Sold with the sale's number; "No sale" MUST need a reason and mark the visit No sale.
- **FR-008**: The summary MUST show visits done of the total, total sales, and the Cash, M-Pesa and credit parts, with "Cash to hand in" equal to the cash part.
- **FR-009**: Selling and adding visits need Write on Sales.
- **FR-010**: Existing counter sales MUST still leave the "Point of Sale" store, unchanged.
- **FR-011**: All changes MUST stay in memory for the session. The Help Center MUST gain an article. The screen MUST use existing components and tokens, work from 320px wide, and pass the accessibility checks.

### Key Entities

- **Visit**: number, date, customer, van, rep, status, the sale it produced, or the reason for no sale.
- **Day summary** (worked out): visits done and total; sales total; cash, M-Pesa and credit parts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A rep can complete a two-item sale on a visit in under 60 seconds on a phone.
- **SC-002**: After any van sale, the van's stock has fallen by exactly what was sold in base units and no other location has changed.
- **SC-003**: Cash to hand in always equals the sum of cash payments on that van's visit sales for the day.
- **SC-004**: Counter sales, invoices and the till behave exactly as before.

## Assumptions

- **This is a screen inside UzaPro, not a separate mobile app.** It is laid out for a phone, but it is the same web app and the same login.
- **No offline use and no GPS or route planning.** Visits are a list for the day.
- **One rep per van per day**: the signed-in user.
- **Payment methods on a visit**: Cash, M-Pesa and Pay later (credit). M-Pesa is recorded, not verified, as elsewhere.
- **The seed van and route are new**, because the canvas has none (see Design deviations). The van's seed stock is moved from the Main Store, so product totals do not change.
- **Dependencies**: sales (001), stock transfers (001), credit and prices (012), bulk units (014).

## Design deviations

Required by Constitution Principles I and II. Added following the user's "go ahead" on the roadmap (2026-11-15).

| Canvas | Built | Why |
|---|---|---|
| Sales has no field-sales screen | New tab "Field sales" | Roadmap item: van sales |
| Storage locations are stores and warehouses | One more, of the type "Van", with stock moved from the Main Store | A van needs somewhere to hold stock (Principle II: new seed values) |
| A sale always leaves "Point of Sale" | A visit's sale leaves the van | The goods are on the van |
