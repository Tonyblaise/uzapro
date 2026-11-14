# Research: Breaking bulk and reorder points

## R1. What "breaking bulk" means here

**Decision**: unit conversion on a single stock figure in base units. No separate count of
unopened cartons and no "open a carton" action.

**Rationale**: stock is one number per product and store today. Counting cartons and pieces
separately would need a second level per unit, a break action, and rules for which to sell from
first. Conversion gives the outcome asked for (wholesale and retail sell from the same stock, and
the figures are true) with one change in one function.

**Alternatives considered**: separate stock per unit with an explicit break. Rejected for this
prototype; it can be added later on top of `contains`.

## R2. Where conversion happens

**Decision**: in `findShortfall` and `applyStockChanges`. `StockChange` gains `unit?`; both
functions multiply `change` by `unitFactor(products, product, variant, unit)`.

**Rationale**: about 20 call sites create stock changes. Converting in the two functions that
consume them means a caller only has to pass the unit it already has, and cannot convert twice.

## R3. The factor

**Decision**: `ExtraUnitPrice.contains`. `unitFactor` is 1 for the base unit, `contains` for a
defined extra unit, and 1 for any other unit (FR-004). When a saved extra unit has no `contains`,
the product command defaults it to `max(1, round(unit price / base price))`.

**Rationale**: the design's seed already prices extra units as base price × multiplier, so the
multiplier is the factor. The default keeps products created before this feature sensible.

## R4. On order

**Decision**: purchase orders whose status is not Cancelled or Completed; per line,
`(qty − recv) × factor`, matched by the product in the line key and by the order's store.

**Rationale**: a draft is an intention to buy, and counting it is what stops "Create draft
purchase orders" from producing duplicates (SC-004).

## R5. Suggestion and rounding

**Decision**: when `onHand + onOrder ≤ min`: `need = max − onHand − onOrder`,
`units = ceil(need / factor)`. Otherwise nothing.

**Rationale**: rounding up never leaves stock below the order-up-to level, and overshoots by less
than one order unit (SC-003).

## R6. Creating drafts

**Decision**: `createReorderDrafts` groups suggestions by supplier and store and calls the
existing `savePurchaseOrder(input, { approve: false })` for each group. Lines with no supplier are
skipped and counted.

**Rationale**: drafts then behave exactly like hand-made purchase orders (edit, approve, receive).

## R7. Reports

**Decision**: the "Low stock" report and the dashboard alert keep the design's fixed figures, and
the "Reorder forecast" card stays "Coming soon".

**Rationale**: those figures are ported from the canvas for products that are not in the
catalogue. Rewiring the report framework is a separate change; an existing smoke test also pins
the card.
