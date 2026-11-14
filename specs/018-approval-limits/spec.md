# Feature Specification: Approval rights and discount limits

**Feature Branch**: `018-approval-limits`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "continue" (roadmap item: "Approval limits and per-branch permissions", scoped with the user on 2026-11-15 to four named approval rights per role, with per-branch access left for later).

## Context

Feature 011 gives each role Read, Write and Delete per module. Three later features had to borrow those switches for decisions they do not really describe:

- approving credit over a customer's limit borrowed **Write on Receivables** (feature 012);
- approving a stock count borrowed **Delete on Stock** (feature 017);
- dispatching a sales order borrowed **Write on Sales**, so a store keeper could only dispatch if they could also edit and invoice sales (feature 013).

And nothing limits how big a discount a role can give.

This feature adds four named rights per role, set in the Edit role dialog, so an owner can say exactly who may approve what.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set who may approve what (Priority: P1)

The owner opens People › Permissions and edits the Store keeper role. Under a new "Approvals" heading there are three switches (Approve credit over the limit, Approve stock counts, Dispatch sales orders) and a field "Discount up to (%)". The owner turns on "Dispatch sales orders" and saves.

**Why this priority**: the rights only matter once they can be set.

**Independent Test**: open Edit role for each built-in role: the switches show the seeded rights. Change one and save; reopening shows the change, and Cancel discards an unsaved one.

**Acceptance Scenarios**:

1. **Given** the Edit role dialog, **When** it opens, **Then** an "Approvals" section shows the role's three switches and its discount limit.
2. **Given** the seed, **When** each role is opened, **Then** it shows: Owner all on and 100% (locked); Accountant: credit and dispatch on, counts off, 20%; Cashier: all off, 5%; Store keeper: all off, 0%.
3. **Given** a change to an approval or the discount limit, **When** Save is chosen, **Then** it applies for the rest of the session and the toast reads "{Role} access saved."
4. **Given** a discount limit that is not a whole number from 0 to 100, **When** Save is chosen, **Then** it is refused with "Enter a discount limit from 0 to 100".
5. **Given** a new or duplicated role, **When** it is created, **Then** a new role has no approvals and 0%; a duplicate copies them.

---

### User Story 2 - The rights decide who can approve (Priority: P1)

A store keeper who has been given "Dispatch sales orders" and Read on Sales opens a sales order and dispatches it, although they cannot edit or invoice it. A store keeper given "Approve stock counts" can approve a count. An accountant keeps the right to approve credit over the limit; a cashier still cannot.

**Why this priority**: this is what the switches are for.

**Independent Test**: with the seed, behaviour matches features 012, 013 and 017 for the roles that could reach those actions. After granting a right to another role, that role can do exactly that one thing more.

**Acceptance Scenarios**:

1. **Given** a role with "Approve credit over the limit", **When** a credit stop appears, **Then** "Approve anyway" is offered; without it, it is not.
2. **Given** a role with "Approve stock counts", **When** a count is waiting, **Then** Approve, Send back and Cancel count are offered; without it, they are not, whatever its Delete on Stock.
3. **Given** a role with "Dispatch sales orders" and Read on Sales, **When** an order with stock left is opened, **Then** Dispatch is offered, and Mark delivered on a delivery note; Edit, Create invoice and Cancel order still follow Write and Delete on Sales.
4. **Given** a role without "Dispatch sales orders", **When** an order is opened, **Then** Dispatch is not offered, even with Write on Sales.
5. **Given** any of these actions attempted without the right, **When** it reaches the system another way, **Then** it is refused with a message naming the missing right.

---

### User Story 3 - A discount above the role's limit is refused (Priority: P2)

A cashier at the till gives 10% off. Their limit is 5%, so the sale is refused with "Your role can give discounts up to 5%. This one is 10%." At 5% it goes through. The same limit applies to the discount on a quotation or an invoice.

**Why this priority**: it closes a gap, but nothing else depends on it.

**Independent Test**: as a role with a 5% limit, a till sale and an invoice with a discount above 5% are refused and one at 5% is saved.

**Acceptance Scenarios**:

1. **Given** a discount in KES or in percent, **When** it is more than the role's limit as a percentage of the amount before the discount, **Then** saving is refused with "Your role can give discounts up to {limit}%. This one is {given}%."
2. **Given** a discount at or under the limit, or no discount, **When** it is saved, **Then** it goes through as before.
3. **Given** the Owner, **When** any discount is given, **Then** it is never refused.

---

### Edge Cases

- **Owner**: all approvals on and 100%, locked, like the rest of the owner's access.
- **Seeing the screen**: an approval right does not make a module visible. Dispatch needs Read on Sales as well; approving counts needs Read on Stock.
- **Typed prices**: a price typed below the list price is not a discount and is not limited here.
- **A discount on an edited quotation or invoice** is checked like a new one.
- **Rounding**: the percentage given is rounded to one decimal place before it is compared.
- **Narrow screens**: the Approvals section works from 320px wide.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each role MUST have three approval rights (approve credit over the limit, approve stock counts, dispatch sales orders) and a discount limit (a whole percentage, 0 to 100).
- **FR-002**: The Edit role dialog MUST show and save them in an "Approvals" section; the Owner's are all on at 100% and locked.
- **FR-003**: The seed MUST be: Accountant: credit and dispatch on, counts off, 20%; Cashier: none, 5%; Store keeper: none, 0%.
- **FR-004**: Approving a credit stop MUST need "Approve credit over the limit". This replaces Write on Receivables (feature 012, FR-017).
- **FR-005**: Approving, sending back and cancelling a stock count MUST need "Approve stock counts". This replaces Delete on Stock (feature 017, FR-010).
- **FR-006**: Dispatching a sales order and marking a delivery note delivered MUST need "Dispatch sales orders", and MUST NOT need Write on Sales. This replaces Write on Sales for those two actions (feature 013, FR-019).
- **FR-007**: A discount on a till sale, a quotation or an invoice MUST be refused when it is more than the role's limit as a percentage of the amount before the discount.
- **FR-008**: Each of these MUST be enforced where the action is carried out, not only by hiding the button.
- **FR-009**: A new role MUST start with no approvals and 0%; a duplicated role MUST copy them; a deleted role's are removed.
- **FR-010**: All changes MUST stay in memory for the session. The Help Center MUST gain an article. New controls MUST use existing components and tokens and pass the accessibility checks.

### Key Entities

- **Role approvals**: for one role: approve credit, approve stock counts, dispatch orders, discount limit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Before any edit, every built-in role can approve credit, approve counts and dispatch exactly where it could reach those actions before this feature.
- **SC-002**: After a right is turned off for a role, that role cannot complete the action by any route: 0 ways through.
- **SC-003**: No till sale, quotation or invoice is saved with a discount above the role's limit.
- **SC-004**: An owner can change one approval for one role in under 20 seconds.

## Assumptions

- **Per-branch access is out of scope** (agreed with the user): every right applies across all branches.
- **Amount limits** (for example "approve credit up to KES 50,000") are out of scope; an approval is yes or no.
- **Seed parity**: the Accountant had Write on Sales and on Receivables, so keeps dispatch and credit. Only the Owner had Delete on Stock, so only the Owner approves counts. The Cashier's Write on Sales did not reach dispatch (the tabs are hidden for that role), so no dispatch.
- **Discount limits in the seed are new values** (see Design deviations).
- **Dependencies**: permissions (011), credit (012), orders (013), counts (017).

## Design deviations

Required by Constitution Principles I and II. Added at the user's request (2026-11-15).

| Canvas | Built | Why |
|---|---|---|
| Edit role has module switches only (itself a feature 011 deviation) | An "Approvals" section with three switches and a discount limit | The user asked for approval limits |
| Any role that can sell can give any discount | A limit per role | Same |
| No approval or discount data | New seed values, listed in FR-003 | The canvas has none (Principle II) |
