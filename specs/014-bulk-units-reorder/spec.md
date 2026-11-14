# Feature Specification: Breaking bulk and reorder points

**Feature Branch**: `014-bulk-units-reorder` (branched from `012-wholesale-pricing-credit`, which holds features 012 and 013)

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "build breaking bulk and reorder points" (roadmap: "Breaking bulk. Open a carton into pieces so wholesale and retail sell from the same stock." and "Reorder points and suggested purchase orders. Set minimum and maximum levels per branch; turn the reorder forecast into draft purchase orders.")

## Context

Two gaps in stock control:

- **Stock moves by the number on the line, whatever the unit.** A product can be priced per piece and per carton, but selling 2 cartons takes 2 off the stock count, the same as 2 pieces. A wholesaler who sells cartons and a shop that sells pieces from the same shelf end up with stock figures that mean nothing.
- **Nothing says when to buy.** The app shows a "running low" alert from fixed demo figures, and the "Reorder forecast" report is "Coming soon". There is no level per product and store, and no way to turn a shortage into a purchase order.

This feature makes stock figures true across units, and then uses them to suggest what to order.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bulk units draw on the same stock (Priority: P1)

Helmet is sold per piece and per carton of 10, and Point of Sale holds 44. A clerk sells 2 cartons to a distributor: stock falls to 24. A cashier then sells 3 pieces at the till: stock falls to 21. A third sale of 3 cartons is refused, because only 21 pieces are left.

**Why this priority**: every stock figure, and everything in Story 2, depends on it.

**Independent Test**: sell 2 cartons of a product whose carton holds 10. The on-hand figure falls by 20, the stock history shows −20, and a sale that needs more pieces than are left is refused with the number of pieces available.

**Acceptance Scenarios**:

1. **Given** a product unit that contains N base units, **When** Q of that unit are sold, invoiced, dispatched, returned, received, transferred or written off, **Then** stock changes by Q × N base units.
2. **Given** a line in the base unit, or in a unit the product does not define, **When** stock moves, **Then** it moves by the line quantity, exactly as before this feature.
3. **Given** not enough base units for a bulk sale, **When** it is saved, **Then** it is refused with "Only {n} {product} left at {store}.", where n is in base units.
4. **Given** the product form, **When** a price is added in another unit, **Then** the row asks how many base units it contains ("Contains"), and saving needs a whole number of 1 or more.
5. **Given** a product with bulk units, **When** its record is opened, **Then** each bulk unit shows what it contains, for example "Carton of 10 Piece".
6. **Given** a sale of bulk units that is voided, or a credit note that returns goods to stock, **When** it is saved, **Then** stock comes back by the same number of base units that left.

---

### User Story 2 - See what needs reordering (Priority: P1)

The store keeper opens Stock › Reorder. Each line is a product at a store with its reorder point and its order-up-to level, next to what is on hand and what is already on order from suppliers. Muthokinju Paint at Main Store is at 0 against a reorder point of 24: it shows "Out of stock" and suggests 3 crates (72 pieces). Bike Pump is at 30 against 24: "OK".

**Why this priority**: it replaces guesswork about when to buy. It can be shown on its own once Story 1 is in.

**Independent Test**: open Reorder with the seed data. Lines at or below their reorder point show a suggestion that brings stock up to the order-up-to level, rounded up to whole order units; lines above it show "OK" and no suggestion.

**Acceptance Scenarios**:

1. **Given** a line where on hand plus on order is at or below the reorder point, **When** the list shows, **Then** it suggests the order-up-to level less on hand less on order, rounded up to whole order units, with the status "Reorder now", or "Out of stock" when nothing is on hand.
2. **Given** a line where on hand is at or below the reorder point but purchase orders cover it, **When** the list shows, **Then** the status is "On order" and nothing is suggested.
3. **Given** a line above its reorder point, **When** the list shows, **Then** the status is "OK".
4. **Given** stock that falls because of a sale or a dispatch, **When** Reorder is opened again, **Then** the line reflects the new on-hand figure.
5. **Given** "Set reorder point", **When** a product, variant, store, reorder point, order-up-to level, order unit and supplier are entered, **Then** the line is added. The order-up-to level must be above the reorder point, and a product can have one line per store.
6. **Given** a line, **When** Edit or Remove is used, **Then** the line changes or goes.

---

### User Story 3 - Turn suggestions into draft purchase orders (Priority: P2)

With two lines to reorder from two suppliers, the store keeper chooses "Create draft purchase orders". Two draft purchase orders appear under Purchases, one per supplier and store, each with the suggested quantities in the order unit at the buying price. The Reorder lines now show "On order". Choosing the action again creates nothing.

**Why this priority**: it saves retyping, but the list in Story 2 is already useful without it.

**Independent Test**: create drafts from the seed suggestions. Purchases › Purchase orders gains one draft per supplier and store with the right lines; the Reorder lines show "On order"; a second run reports there is nothing to order.

**Acceptance Scenarios**:

1. **Given** suggestions for one supplier and store, **When** drafts are created, **Then** one draft purchase order holds one line per suggestion: the product variant, the quantity in order units, the order unit and the unit's buying price.
2. **Given** suggestions for several suppliers or stores, **When** drafts are created, **Then** there is one draft per supplier and store, and a toast reads "{n} draft purchase orders created." ("1 draft purchase order created." for one).
3. **Given** a suggestion with no supplier, **When** drafts are created, **Then** it is left out and the toast adds "{m} skipped: no supplier set."
4. **Given** no suggestions, **When** the action is used, **Then** a toast reads "Nothing needs reordering."
5. **Given** a draft created this way, **When** it is received in full, **Then** stock rises by the base units ordered and the Reorder line returns to "OK".

---

### Edge Cases

- **Variants**: stock is counted per product and store, not per variant, so a reorder line is per product and store. The line names the variant to order; the draft can be edited before it is sent.
- **Units that are not defined for a product**: documents can still use any unit from the list. Such a line moves stock by its quantity, as today.
- **Changing what a unit contains**: later movements use the new figure; past movements are not rewritten.
- **A unit removed from a product**: reorder lines that order in that unit fall back to the base unit.
- **A product removed**: its reorder lines go with it.
- **Purchase orders that count as on order**: every order that is not cancelled or completed, for the quantity not yet received, at the line's store.
- **The existing "Low stock" report and dashboard alert** keep their fixed demo figures. The "Reorder forecast" report card stays "Coming soon"; Stock › Reorder is where the live figures are.
- **Read-only role**: with Read on Stock, the Reorder list can be viewed; setting, editing, removing and creating drafts are hidden. Creating drafts also needs Write on Purchases.
- **Narrow screens**: the Reorder list and its form work from 320px wide without sideways scrolling of the page.

## Requirements *(mandatory)*

### Functional Requirements

**Bulk units**

- **FR-001**: Each extra unit a product variant is priced in MUST record how many base units it contains (a whole number, 1 or more).
- **FR-002**: Stock on hand MUST be counted in the variant's base unit.
- **FR-003**: Every stock movement MUST convert its quantity to base units using the line's unit: sales, invoices, sales-order dispatches, voids, credit notes that return stock, goods receipts, purchase returns, stock in, transfers and wastage.
- **FR-004**: A line in the base unit, or in a unit the variant does not define, MUST move stock by the line quantity.
- **FR-005**: Shortage messages MUST state what is available in base units.
- **FR-006**: The product form MUST ask "Contains" for each price in another unit, and default it from the price ratio when left blank.
- **FR-007**: The product record MUST show what each bulk unit contains.
- **FR-008**: The seed bulk units MUST contain: Tray 6 and Crate 24 (Muthokinju Paint), Box 12 (Bike Pump), Carton 10 (Helmet), matching their seed prices.

**Reorder points**

- **FR-009**: Stock MUST gain a "Reorder" tab listing reorder lines: Product, Store, On hand, On order, Reorder at, Order up to, Suggested order, Supplier, Status.
- **FR-010**: A reorder line MUST hold a product, the variant to order, a store, a reorder point (0 or more), an order-up-to level (above the reorder point), an order unit the variant is priced in, and an optional supplier. One line per product and store.
- **FR-011**: "On order" MUST be the quantity not yet received on purchase orders for that product and store that are neither cancelled nor completed, in base units.
- **FR-012**: A line MUST suggest an order when on hand plus on order is at or below the reorder point. The suggestion is the order-up-to level less on hand less on order, rounded up to whole order units.
- **FR-013**: Status MUST be "Out of stock" (suggestion, nothing on hand), "Reorder now" (suggestion), "On order" (on hand at or below the reorder point, covered by orders) or "OK".
- **FR-014**: "Create draft purchase orders" MUST create one draft purchase order per supplier and store for the current suggestions, skip lines with no supplier, and report how many drafts were created and how many lines were skipped.
- **FR-015**: Each draft line MUST carry the variant, the quantity in order units, the order unit and that unit's buying price.

**Across the feature**

- **FR-016**: Setting, editing and creating drafts need Write on Stock; removing a line needs Delete on Stock; creating drafts also needs Write on Purchases.
- **FR-017**: All changes MUST stay in memory for the session and reset on reload. No new storage keys.
- **FR-018**: The Help Center MUST gain an article on bulk units and reorder points.
- **FR-019**: New screens MUST use the existing design-system components and tokens, work from 320px wide, and pass the automated accessibility checks.

### Key Entities

- **Bulk unit** (on a product variant): unit name, selling price, buying price, and how many base units it contains.
- **Reorder line**: product, variant to order, store, reorder point, order-up-to level, order unit, supplier.
- **Reorder position** (worked out): on hand, on order, suggested quantity in base units and in order units, status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For every kind of stock movement, the on-hand figure changes by exactly quantity × units contained: 0 mismatches across sales, invoices, dispatches, voids, returns, receipts, transfers and wastage.
- **SC-002**: A movement in the base unit changes stock exactly as it did before this feature.
- **SC-003**: Every suggestion brings on hand plus on order to at least the order-up-to level, and overshoots by less than one order unit.
- **SC-004**: Creating drafts twice in a row never creates a second set of orders.
- **SC-005**: A store keeper can go from opening Reorder to having draft purchase orders in under 30 seconds.
- **SC-006**: The Reorder list and form show no sideways page scrolling at 320px and 1440px and pass the automated accessibility scan with no serious or critical issues in their own content.

## Assumptions

- **Breaking bulk is unit conversion, not a separate action.** Stock is one number per product and store, in base units. There is no "open a carton" step and no separate count of unopened cartons.
- **Stock stays per product and store**, not per variant, as today.
- **Existing figures are base units.** The seed on-hand figures are read as pieces. Seed documents and past movements are not rewritten.
- **Consequence for existing demo flows**: a sale or dispatch in a bulk unit now needs enough pieces. For example, Main Store holds 30 Bike Pump, which is 2 boxes, so the seed order SO-0001 (2 boxes left to dispatch) can still be dispatched but a third box cannot.
- **Reorder levels are set by hand.** Working them out from sales history is out of scope.
- **One supplier per reorder line.** A supplier catalogue with prices per supplier is out of scope; the draft uses the product's buying price.
- **Seed reorder lines are new**, because the canvas's low-stock figures are for products that are not in the catalogue (see Design deviations).
- **Dependencies**: products and stock (001), purchases (002), sales orders (013).

## Design deviations

Required by Constitution Principles I and II. Added at the user's direct request ("build breaking bulk and reorder points", 2026-11-15).

| Canvas | Built | Why |
|---|---|---|
| Stock has five tabs | A sixth: "Reorder" | The user asked for reorder points |
| The product form's extra-unit rows have a unit and prices | They also have "Contains" | Needed to convert bulk units to stock |
| Stock moves by the line quantity in any unit | Stock moves by quantity × units contained | The user asked for breaking bulk; figures were wrong across units |
| No reorder levels in the data | New seed reorder lines | The canvas has none for catalogue products (Principle II) |
| "Reorder forecast" report is "Coming soon" | Unchanged | Out of scope; Stock › Reorder holds the live figures |
