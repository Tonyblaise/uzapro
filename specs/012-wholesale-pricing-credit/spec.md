# Feature Specification: Wholesale pricing and customer credit

**Feature Branch**: `012-wholesale-pricing-credit`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Wholesale pricing and customer credit (012). Add wholesale price lists and customer groups: each customer belongs to a customer group (e.g. Retail, Wholesale, Distributor); a price list sets prices per product variant and unit (piece, carton, crate) for a group, with quantity-break prices and an optional minimum order quantity. When a sale, quotation, invoice or till sale is made for a customer, the price comes from their group's price list, falling back to the standard price. Add customer credit limits and terms: each customer has a credit limit in KES and payment terms (e.g. cash, 7, 14, 30 days). When a "Pay later (credit)" sale or invoice would take the customer over their limit, or they have overdue invoices, the sale is blocked with a clear message showing limit, balance owed and amount available; a role with the credit-override permission (Owner by default) can approve it with a reason, and Cashiers cannot. Show credit limit, balance owed and available credit on the customer record. This is a front-end prototype: hardcoded seed data behind the data-access layer, changes kept in memory only, screens consistent with the existing design canvas, permissions enforced through the existing Read/Write/Delete role switches from feature 011."

## Context

UzaPro is aimed at growing retailers and wholesalers in East Africa. The retail side is well covered. The wholesale side is thin in two places that a wholesaler meets on day one:

- **One price for everyone.** A product has one price per unit (piece, tray, crate, carton). A wholesaler sells the same carton at different prices to a walk-in shopper, a shop and a distributor, and cheaper again above a certain quantity.
- **Credit with no ceiling.** Any customer can buy on "Pay later (credit)" for any amount, even with an invoice months overdue. Receivables then shows the damage after the fact.

The app's own ideas list already promises the first ("Different prices for wholesale customers", Planned). This feature delivers it, and adds credit limits and terms.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The right price fills in for each customer (Priority: P1)

A sales clerk starts a sale, quotation or invoice and picks the customer "Mountain Goats", who is in the Distributor group. They add 2 cartons of Helmet (Medium). The Distributor price for a carton fills in, and a small note under the line reads "Distributor price". They raise the quantity to 5 cartons and the price drops to the "5 or more" price. They change the customer to "Walk-in Customer" and the lines go back to the standard price.

**Why this priority**: it is the reason a wholesaler would choose the product. Without it every wholesale price is typed by hand.

**Independent Test**: with the seed data, make a new sale for a Distributor customer and for the walk-in customer with the same product, unit and quantity. The two prices differ and match the price list and the standard price.

**Acceptance Scenarios**:

1. **Given** a customer in a group that has a price for the chosen variant and unit, **When** the line is added, **Then** that price fills in and the line shows "{Group} price".
2. **Given** a price with quantity breaks, **When** the quantity reaches a break, **Then** the price changes to that break's price, and changes back when the quantity drops below it.
3. **Given** a customer whose group has no price for the variant and unit, **When** the line is added, **Then** the standard price fills in and no note shows.
4. **Given** lines already on the document, **When** the customer is changed, **Then** every line that has not been edited by hand is repriced for the new customer.
5. **Given** a price the clerk typed by hand, **When** the quantity or customer changes, **Then** the typed price stays, and a "Use {Group} price" link restores the list price.
6. **Given** the till with a customer attached to the sale, **When** items are added or their quantity changes, **Then** the cart uses that customer's group prices in the same way. With no customer attached, the till uses standard prices.

---

### User Story 2 - Credit is checked before the sale goes through (Priority: P1)

A cashier rings up KES 30,000 for "Mountain Goats" and chooses "Pay later (credit)". Mountain Goats has a limit of KES 100,000 and already owes KES 80,400, so only KES 19,600 is available. The sale is stopped with a message that shows the limit, the amount owed, the amount available and how far over this sale would go. The cashier can take another payment method, or ask someone who is allowed to approve it. The owner approves it with a reason, and the sale goes through marked "Credit approved by {name}".

**Why this priority**: uncontrolled credit is the main way a wholesaler loses money. It is as important as pricing and can be shown on its own.

**Independent Test**: as Cashier, try a credit sale that goes over a customer's limit: it is blocked and there is no way to approve it. As Owner, the same sale offers "Approve anyway", needs a reason, and then completes.

**Acceptance Scenarios**:

1. **Given** a credit sale within the customer's available credit and no overdue receivables, **When** it is saved, **Then** it goes through as it does today.
2. **Given** a credit sale that would take the customer over their limit, **When** it is saved, **Then** it is stopped with: "Over the credit limit", the limit, balance owed, available credit and the amount over.
3. **Given** a customer with an overdue receivable, **When** any credit sale is saved, **Then** it is stopped with "{Customer} has KES {amount} overdue" and the oldest overdue document and its due date.
4. **Given** a stopped sale and a role that may approve credit, **When** the user picks "Approve anyway", **Then** a reason is required (at least 5 characters). On confirm the sale completes and records who approved it, when and why.
5. **Given** a stopped sale and a role that may not approve credit, **When** the message shows, **Then** there is no approve action, and the message says "Ask a manager to approve this, or take another payment method."
6. **Given** a customer with no credit limit set, **When** a credit sale is saved, **Then** no limit check runs. The overdue check still runs.
7. **Given** an invoice (always on credit), **When** it is saved, **Then** the same checks run. Quotations are never checked.
8. **Given** the till, **When** "Pay later" is chosen at checkout, **Then** the same checks, message and approval apply.

---

### User Story 3 - See and set a customer's group, limit and terms (Priority: P2)

The owner opens Customers. Each row now also shows the customer's group, credit limit and balance owed. Opening a customer shows a "Credit" section: limit, balance owed, available credit, payment terms and any overdue amount. The customer form has three new fields: Customer group, Credit limit (KES) and Payment terms.

**Why this priority**: Stories 1 and 2 work from seed data alone. This story lets the user change that data and see it.

**Independent Test**: edit "Mountain Goats", set the limit to KES 150,000 and terms to 14 days, and save. The list and the Credit section show the new values, and a credit sale of KES 30,000 now goes through.

**Acceptance Scenarios**:

1. **Given** the seed data, **When** Customers opens, **Then** each row shows Group, Credit limit and Balance owed. A customer with no limit shows "No limit"; the walk-in customer shows "—" for limit.
2. **Given** the customer form, **When** it is saved with a new group, limit or terms, **Then** the row updates, a toast reads "{Customer} saved." (the existing wording), and later sales use the new values.
3. **Given** a credit limit, **When** it is blank, **Then** it means no limit. **When** it is not a whole or decimal amount of 0 or more, **Then** saving is blocked with an inline message.
4. **Given** a customer over their limit or with overdue receivables, **When** their row and Credit section show, **Then** a warning pill reads "Over limit" or "Overdue".
5. **Given** the payment terms on a customer, **When** an invoice or credit sale is made for them, **Then** the due date defaults to today plus those terms. "Cash" terms means the customer cannot buy on credit: a credit sale is stopped as in Story 2 with "{Customer} is on cash terms."

---

### User Story 4 - Manage price lists and customer groups (Priority: P3)

The owner opens Products › Price lists. They see one price list per customer group, with how many prices it holds and how many customers use it. Opening the Wholesale list shows its prices: product, variant, unit, standard price, and the list price at each quantity break. They add a price for Bike Pump (Box): KES 3,600 from 1 box and KES 3,400 from 10 boxes. Under Customers › Customer groups they add a group "Schools", which starts with an empty price list.

**Why this priority**: the seed price lists are enough to demo Stories 1 to 3. Editing them makes the feature complete.

**Independent Test**: add a price to the Wholesale list, then make a sale to a Wholesale customer for that product and unit. The new price fills in.

**Acceptance Scenarios**:

1. **Given** Price lists, **When** it opens, **Then** it lists one price list per group other than Retail, with the number of prices and customers.
2. **Given** a price list, **When** a price is added, **Then** it needs a product, variant, unit and at least one "from quantity" and price. Only units the variant sells in are offered.
3. **Given** quantity breaks on a price, **When** two breaks have the same "from quantity", or a price is 0 or less, **Then** saving is blocked with an inline message.
4. **Given** a price that already exists for the same variant and unit, **When** another is added, **Then** it is refused with "This list already has a price for {product} ({variant}, {unit}). Edit that one."
5. **Given** a list price above the standard price, **When** it is saved, **Then** it is allowed, with a note "Higher than the standard price".
6. **Given** Customer groups, **When** a group is added, **Then** it needs a unique name (ignoring case, at most 40 characters) and appears with 0 customers and an empty price list.
7. **Given** a group with customers, **When** Delete is picked, **Then** it is refused with "Move {N} customers to another group first." ("1 customer" for one) The Retail group cannot be renamed or deleted.
8. **Given** a role with only Read on Products, **When** Price lists opens, **Then** prices can be viewed but not added, edited or removed.

---

### Edge Cases

- **Walk-in customer**: always in the Retail group, with no credit limit field. Its existing behaviour on credit sales is unchanged.
- **Retail group**: has no price list. Its customers always get standard prices.
- **Quantity below the first break**: if a price starts at 10 cartons and the line has 4, the standard price applies and the line shows "{Group} price from 10 Carton".
- **Unit change on a line**: the line is repriced for the new unit, by the same rules.
- **Split payment**: only the part put on "Pay later (credit)" counts against the limit.
- **Customer credits**: unused customer credits (from credit notes) do not raise the available credit. Available credit is the limit minus the balance owed, never shown below zero.
- **Limit lowered below the balance owed**: allowed. The customer shows "Over limit" and new credit sales are stopped.
- **Voided sale or receivable**: it stops counting toward the balance owed, as in Receivables today.
- **Payment plan on an overdue receivable**: the receivable still counts as overdue until it is paid.
- **Product or variant removed**: its prices disappear from every price list.
- **Approval, then a failed save**: if the sale form has other errors, the approval is kept while the form stays open and discarded if the form is closed.
- **Narrow screens**: the new columns, the Credit section, the stopped-sale message and the price editor work from 320px wide without sideways scrolling.

## Requirements *(mandatory)*

### Functional Requirements

**Customer groups and price lists**

- **FR-001**: Every customer MUST belong to exactly one customer group. New customers default to Retail.
- **FR-002**: The app MUST start with three groups: Retail (built in, standard prices), Wholesale and Distributor.
- **FR-003**: Each group other than Retail MUST have one price list. A price list holds prices per product variant and unit, each with one or more quantity breaks ("from quantity" and price).
- **FR-004**: The price for a line MUST be chosen in this order:
  1. the customer's group price for that variant and unit, at the highest break whose "from quantity" is at or below the line quantity;
  2. otherwise the standard price for that variant and unit.
- **FR-005**: This pricing MUST apply wherever a customer and product lines meet: new sale, quotation, invoice and the till.
- **FR-006**: A line priced from a list MUST show "{Group} price". A line below the first break MUST show "{Group} price from {quantity} {unit}".
- **FR-007**: A hand-typed price MUST be kept when the quantity or customer changes, and MUST offer "Use {Group} price" (or "Use standard price") to go back. On the new sale form, picking another variant or unit starts again from that unit's price, as it does today.
- **FR-008**: Changing the customer on a document MUST reprice every line that was not typed by hand.
- **FR-009**: Products MUST gain a "Price lists" tab: a list of price lists, and for each, a table of its prices with add, edit and remove.
- **FR-010**: Customers MUST gain a "Customer groups" tab: group name, price list, number of customers, with add, rename and delete under the rules in Story 4.
- **FR-011**: A product's record MUST show its group prices next to its standard prices, read only, with a link to the price list.

**Credit limits and terms**

- **FR-012**: Every customer other than the walk-in customer MUST have an optional credit limit in KES (blank means no limit) and payment terms: Cash, 7 days, 14 days or 30 days. New customers default to no limit and 30 days, which matches today's behaviour.
- **FR-013**: The balance owed MUST be the customer's open receivables (total minus paid), excluding voided ones. Available credit MUST be the limit minus the balance owed, with a floor of zero.
- **FR-014**: A receivable MUST count as overdue when it has a balance and its due date is before today.
- **FR-015**: On saving a credit sale, an invoice, or a till sale paid by "Pay later", the app MUST stop the save when any of these is true, and say which:
  - the customer is on Cash terms;
  - the customer has an overdue receivable;
  - the credit part of this sale is more than the available credit.
- **FR-016**: The stopped-sale message MUST show the customer's limit, balance owed, available credit, and either the amount over or the overdue amount with the oldest overdue document and due date.
- **FR-017**: A role MUST be able to approve a stopped sale only if it has Write on Receivables. Owner and Accountant have this in the seed; Cashier and Store keeper do not. No new permission switch is added.
- **FR-018**: Approving MUST require a reason of at least 5 characters, and MUST record the approver, date, reason and the amount over (or overdue) on the sale or invoice, where its record view shows "Credit approved by {name}: {reason}".
- **FR-019**: A role that cannot approve MUST see no approve action and the text "Ask a manager to approve this, or take another payment method."
- **FR-020**: The due date on an invoice or credit sale MUST default to today plus the customer's terms.
- **FR-021**: Quotations MUST NOT be credit checked.

**Customer screens**

- **FR-022**: The Customers table MUST add the columns Group, Credit limit (KES) and Balance owed (KES), and a warning pill "Over limit" or "Overdue" where it applies.
- **FR-023**: The customer form MUST add Customer group, Credit limit (KES) and Payment terms. The walk-in customer shows the group as Retail, locked, and no credit fields.
- **FR-024**: Opening a customer MUST show a Credit section: limit, balance owed, available credit, terms, overdue amount, and a link to that customer's receivables.

**Across the feature**

- **FR-025**: Add, edit and remove actions on price lists follow the role's Write and Delete on Products; on customer groups and customer credit fields, the role's Write and Delete on Customers.
- **FR-026**: All changes MUST stay in memory for the session and reset on reload, like the rest of the demo. No new storage keys.
- **FR-027**: Before any edit, every existing sale, invoice, quotation and till flow for the walk-in customer MUST behave exactly as before this feature.
- **FR-028**: The ideas list entry "Different prices for wholesale customers" MUST change from Planned to Done, and the Help Center MUST gain an article on price lists and credit limits.
- **FR-029**: New screens and controls MUST use the existing design-system components and tokens, work from 320px wide, and pass the automated accessibility checks.

### Key Entities

- **Customer group**: a name, whether it is built in (Retail), and its customers. One price list per group other than Retail.
- **Price list**: belongs to one group. Holds price entries.
- **Price entry**: one product variant and unit, with quantity breaks. Each break is a "from quantity" and a price in KES.
- **Customer** (extended): group, credit limit (optional), payment terms.
- **Credit position** (worked out, not stored): for a customer, the limit, balance owed, available credit, overdue amount and oldest overdue document.
- **Credit approval**: on a sale or invoice, who approved it, when, why, and the amount over the limit or overdue at that moment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a customer in a priced group, the clerk types no prices: 100% of lines with a list price fill in correctly for the unit and quantity chosen.
- **SC-002**: Across the seed data, the price shown on a line always equals the price-list or standard price that the rules in FR-004 give: 0 mismatches over every seed customer, variant, unit and break.
- **SC-003**: No credit sale over the limit, to an overdue customer, or to a cash-terms customer can be completed by a role without approval rights: 0 ways through across new sale, invoice and the till.
- **SC-004**: An owner can approve a stopped sale in under 30 seconds, and the approval is visible on the saved record.
- **SC-005**: An owner can set a customer's group, limit and terms in under 30 seconds from the Customers list.
- **SC-006**: Sales to the walk-in customer and to customers with no limit and nothing overdue take the same number of steps as before this feature.
- **SC-007**: Every new screen and dialog shows no sideways scrolling or clipped controls at 320, 375, 768 and 1440px, and passes the automated accessibility scan with no serious or critical issues.

## Assumptions

- **Minimum order quantity** is the first quantity break. A price that starts "from 10 cartons" is the minimum for that price; below it the standard price applies. A minimum that blocks the sale outright is out of scope.
- **Approval right**: "may approve credit" is Write on Receivables, so it fits the Read, Write and Delete switches from feature 011 without a new kind of permission. A separate switch can come later if owners ask for it.
- **One currency**: limits and prices are in KES.
- **One price list per group**, always active. Date-limited promotions, percentage discounts off the standard price, and prices per branch are out of scope.
- **Per-customer special prices** are out of scope. A customer gets their group's prices.
- **Existing documents** are not repriced. Group prices apply to new lines only.
- **Seed data** is new, because the canvas has none for this feature (see Design deviations). It is chosen to show each case with the existing customers and receivables:
  - Morningview Bicycles: Wholesale, limit KES 50,000, 30 days. It already has an overdue receivable, so it shows the overdue stop.
  - Mountain Goats: Distributor, limit KES 100,000, 30 days. It owes KES 80,400 with nothing overdue, so it shows the over-limit stop.
  - Walk-in Customer: Retail.
  - Wholesale and Distributor price lists cover products that already sell in bulk units (Muthokinju Paint, Bike Pump, Helmet), with Distributor below Wholesale and quantity breaks. The exact entries are in the data model. Wholesale has no price for a Box of Bike Pump, so Story 4 can add one.
- **Demo clock**: "today" is the demo's fixed date, as elsewhere in the app.
- **Dependencies**: customers, products and units (001), receivables (003), the till (010) and role permissions (011).

## Design deviations

Required by Constitution Principles I and II. The canvas has no price lists, customer groups or credit limits; it only lists "Different prices for wholesale customers" as a planned idea. This feature is added at the user's direct request (approved roadmap, 2026-11-14).

| Canvas | Built | Why |
|---|---|---|
| Products has no Price lists tab | New tab "Price lists" | The user asked for wholesale price lists |
| Customers has one tab | New tab "Customer groups" | Price lists are per group |
| Customers table: Name, Phone, Email, Address, Status | Adds Group, Credit limit and Balance owed | The user asked for credit shown on the customer |
| Customer form has four fields | Adds Customer group, Credit limit and Payment terms | Same |
| Credit sales always go through | Stopped when over the limit, overdue or on cash terms, with approval | The user asked for credit control |
| A credit sale is due in 30 days | Due after the customer's terms; the default stays 30 days | Payment terms per customer |
| No seed data for groups, prices, limits or terms | New seed values, listed under Assumptions | The canvas has none (Principle II) |
| Ideas list: "Different prices for wholesale customers" is Planned | Done | It is now built |
