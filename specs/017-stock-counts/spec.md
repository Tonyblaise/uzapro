# Feature Specification: Stock counts

**Feature Branch**: `016-batch-expiry` (built on top of feature 016, which is not yet committed)

**Created**: 2026-11-15

**Status**: Replaced by feature 025 (stock counts as in the design, 2026-11-15); kept as a record.

**Input**: User description: "go ahead and build them" (roadmap item: "Stock counts. Full and partial counts with a variance report and approval.")

## Context

Stock figures drift: breakages nobody recorded, miscounts at receiving, theft. Today the only way to correct a figure in UzaPro is to record wastage or a stock-in, one product at a time, with no record that anyone counted. There is no way to count a store, see the differences in one place, and have someone senior agree the correction.

This feature adds a stock count: list what the system says, enter what is on the shelf, review the variance, and approve it to correct stock.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Count a store (Priority: P1)

The store keeper opens Stock › Stock counts and chooses "New count". They pick Point of Sale and leave every product ticked (a full count), or untick some for a partial count. The count opens with one line per product showing the system quantity. They enter what they counted for each line and save. They can come back to it later.

**Why this priority**: nothing else can happen without a count to review.

**Independent Test**: start a count for a store, enter quantities for some lines and save. The count is listed as "In progress" with how many lines are counted, and reopening it shows the saved quantities. Stock has not changed.

**Acceptance Scenarios**:

1. **Given** "New count", **When** a store is picked and at least one product is ticked, **Then** a count is created with the next CNT number, one line per ticked product with the system quantity at that moment, and the status "In progress".
2. **Given** a store with a count in progress or waiting for approval, **When** another count is started there, **Then** it is refused with "{store} already has a count open: {ref}."
3. **Given** a count in progress, **When** counted quantities are entered and saved, **Then** they are kept, a toast reads "{ref} saved.", and stock is unchanged.
4. **Given** a counted quantity that is not a whole number of 0 or more, **When** it is saved, **Then** it is refused with an inline message.

---

### User Story 2 - Review the variance and submit (Priority: P1)

With every line counted, the count shows each line's variance (counted less system), its value at cost, and totals: units over, units short and the net value. The store keeper chooses "Submit for approval".

**Why this priority**: the variance is the result of the count; it is what gets approved.

**Independent Test**: count every line with one over and one short. The variance per line and the totals are right, and Submit moves the count to "Waiting approval" and locks the quantities.

**Acceptance Scenarios**:

1. **Given** a line with a counted quantity, **When** it shows, **Then** its variance is counted less system, shown as "+3", "−2" or "0", with its value at the product's buying price.
2. **Given** a count with uncounted lines, **When** Submit is tried, **Then** it is refused with "Count every line first. {n} left."
3. **Given** a fully counted count, **When** it is submitted, **Then** its status is "Waiting approval", the quantities can no longer be edited, and a toast reads "{ref} sent for approval."

---

### User Story 3 - Approve the count and correct stock (Priority: P1)

The owner opens the count that is waiting, checks the variance, and chooses "Approve". Stock at that store changes by each line's variance, each change is in the stock history as "Counted" with the count's reference, and the count is "Approved". If the figures look wrong, the owner chooses "Send back" and the store keeper recounts.

**Why this priority**: approval is what makes the correction and what makes it trustworthy.

**Independent Test**: approve a count with one line over by 3 and one short by 2. Those two products change by +3 and −2 at that store, with "Counted" movements carrying the count reference; lines with no variance do not move.

**Acceptance Scenarios**:

1. **Given** a count waiting for approval, **When** it is approved, **Then** stock at the store changes by each line's variance, a "Counted" movement is recorded per changed line, the status is "Approved", and a toast reads "{ref} approved. Stock updated."
2. **Given** stock that moved after the count was started, **When** the count is approved, **Then** the variance is applied to the current stock (never below zero).
3. **Given** a count waiting for approval, **When** "Send back" is chosen, **Then** it returns to "In progress" with its quantities kept, and a toast reads "{ref} sent back for a recount."
4. **Given** a count in progress or waiting, **When** "Cancel count" is confirmed, **Then** its status is "Cancelled" and stock is unchanged.
5. **Given** a role without the right to approve, **When** a waiting count is opened, **Then** Approve, Send back and Cancel count are not offered.

---

### Edge Cases

- **Full or partial**: a count that includes every product at the store is labelled "Full"; otherwise "Partial".
- **A product with no stock at the store** is not offered for counting there.
- **Batches** (feature 016, since removed): a shortage came out of the oldest batch first.
- **Bulk units** (feature 014): counts are in the base unit.
- **A product removed** while a count is open: its line stays on the count and is skipped when stock is updated.
- **An approved or cancelled count** cannot be changed.
- **Narrow screens**: the list, the new-count form and the count view work from 320px wide without sideways page scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Stock MUST gain a "Stock counts" tab listing: Count, Store, Date, Type (Full or Partial), Lines counted, Variance (units), Variance value (KES), Status, with a "New count" action.
- **FR-002**: A new count MUST take a store and one or more of the products in stock there, and MUST record each line's system quantity at that moment.
- **FR-003**: A store MUST NOT have two counts open (in progress or waiting for approval).
- **FR-004**: While in progress, counted quantities (whole numbers, 0 or more) MUST be editable and savable without changing stock.
- **FR-005**: A line's variance MUST be counted less system; its value MUST be the variance times the product's buying price.
- **FR-006**: The count MUST show totals: units over, units short, and net value.
- **FR-007**: Submitting MUST need every line counted, and MUST lock the quantities.
- **FR-008**: Approving MUST change stock at the store by each line's variance, record a "Counted" movement per changed line with the count's reference, and mark the count "Approved".
- **FR-009**: A waiting count MUST be able to be sent back to in progress; a count that is in progress or waiting MUST be cancellable without changing stock.
- **FR-010**: Starting, entering and submitting need Write on Stock. Approving, sending back and cancelling need Delete on Stock.
- **FR-011**: All changes MUST stay in memory for the session and reset on reload.
- **FR-012**: The Help Center MUST gain an article on stock counts.
- **FR-013**: New screens MUST use the existing design-system components and tokens, work from 320px wide, and pass the automated accessibility checks.

### Key Entities

- **Stock count**: reference, store, date, who started it, status, who approved it and when, and its lines.
- **Count line**: product, system quantity when the count started, counted quantity (blank until counted).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Approving a count changes each counted product's stock by exactly its variance, and changes nothing else: 0 mismatches.
- **SC-002**: Nothing but approval changes stock: starting, saving, submitting, sending back and cancelling leave it untouched.
- **SC-003**: A role without the approval right cannot approve, send back or cancel a count.
- **SC-004**: A store keeper can start a count and enter 5 lines in under 2 minutes.

## Assumptions

- **Approval uses Delete on Stock**, the highest right the current permission model has. In the seed that is the Owner; the Store keeper has Write. A dedicated approval switch belongs to the planned approval-limits feature.
- **System quantities are visible while counting.** A blind count is out of scope.
- **Per product, not per variant**, because that is how stock is counted.
- **Value is at the first variant's buying price.**
- **The seed count is new**, because the canvas has none (see Design deviations): one approved count at Point of Sale from 3 Nov 2026, with no stock movement behind it, like other seed documents.
- **Dependencies**: stock (001), permissions (011), bulk units (014), batches (016).

## Design deviations

Required by Constitution Principles I and II. Added at the user's request (2026-11-15).

| Canvas | Built | Why |
|---|---|---|
| Stock has no counts | New tab "Stock counts" | The user asked for stock counts with approval |
| No count data | One new seed count | The canvas has none (Principle II) |
