# Research: Wholesale pricing and customer credit

There were no NEEDS CLARIFICATION items in Technical Context. These decisions settle the open
design points found while reading the code.

## R1. How a group is referenced

**Decision**: groups have a stable `id` (`g-retail`, `g-wholesale`, `g-distributor`, then `g-{n}`).
`Customer.group` and `PriceEntry.group` hold the id.

**Rationale**: customers are keyed by name today, so a rename has to rewrite every sales document
(`updateCustomer`). An id avoids repeating that for groups.

**Alternatives considered**: keying by group name, as customers are. Rejected: a rename would
have to rewrite customers and prices.

## R2. Where prices are stored

**Decision**: a flat list `pricing.prices: PriceEntry[]`, one entry per group, product, variant
and unit, each with sorted `breaks`. A "price list" is the entries for one group; it is not a
stored record.

**Rationale**: the spec has exactly one list per group, always active. A flat list makes lookup,
duplicate detection and "remove a product's prices" one filter each.

**Alternatives considered**: `PriceList` records holding entries. Rejected as an extra level with
nothing to store on it (YAGNI, Principle VI).

## R3. Standard price per unit

**Decision**: `standardPrice(variant, unit)` returns `variant.price` when `unit` is the variant's
base unit (or the variant has no unit), the matching `extraUnits` price otherwise, and
`variant.price` as the last resort.

**Rationale**: this is what the new sale form already does (`pickUnit`). The document form does
not reprice on a unit change today; see R4.

## R4. Repricing without changing today's behaviour (FR-027)

**Decision**: each form line tracks where its price came from: `"std"`, `"list"` or `"hand"`.

- On a change of customer, quantity or unit, a `"hand"` line is never touched.
- If a group price applies, the line takes it and becomes `"list"`.
- If none applies and the line was `"list"`, it goes back to the standard price for its unit and
  becomes `"std"`.
- If none applies and the line was `"std"`, it is left alone.

**Rationale**: the last rule keeps the document form exactly as it is for retail customers, where
changing the unit does not change the rate. Only lines that a price list has touched are ever
repriced.

**Alternatives considered**: always repricing to the standard price for the unit. Rejected: it
changes existing behaviour for every customer and would break existing smoke tests.

## R5. The till

**Decision**: the till sells in pieces only, so it looks up group prices for the unit `"Piece"`.
Cart lines are repriced when the customer or a line's quantity changes. The cart has no
hand-typed prices, so every line is `"std"` or `"list"`. Held sales keep their prices and are
repriced when resumed.

**Rationale**: `completePosSale` writes `unit: "Piece"` on every line, and the cart has no price
field. Till prices include VAT while form prices have VAT added on top; a group price is used the
same way as the variant price it replaces in each place, so no conversion is needed.

## R6. Where the credit check runs

**Decision**: in the commands, with the forms running the same pure check first.

- `recordSale`, `createInvoice` and `completePosSale` call `creditStop`. On a stop they fail with
  the stop attached, unless the input carries `approval: { reason }`, the reason is at least 5
  characters, and the signed-in role has Write on Receivables.
- The forms call `useCreditStop(customer, amount)` on save. On a stop they open `CreditStop`
  instead of calling the command; on approve they call the command with the approval.

**Rationale**: SC-003 requires no way through for a role without approval rights. A check only in
the form would be skipped by any other caller, for example Uza AI actions or a quick task.

**Alternatives considered**: a check only in the UI. Rejected for the reason above.

## R7. What counts toward the balance owed

**Decision**: receivables whose `party` is the customer's name, not voided, using the existing
`balance()` and `daysLate()` from `src/data/money.ts`. Overdue means `balance > 0` and
`daysLate(due) > 0`, which matches the existing "Overdue" pill.

**Rationale**: one definition of balance and overdue across Receivables and credit control.

## R8. Order of stop reasons

**Decision**: cash terms, then overdue, then over the limit. One reason is shown.

**Rationale**: each earlier reason makes the later ones irrelevant to the clerk: a cash-terms
customer cannot buy on credit at all, and an overdue customer is stopped whatever the amount.

## R9. Editing an invoice

**Decision**: the credit check runs when an invoice is created, not when one is edited
(`updateDocument`).

**Rationale**: an edit does not change the receivable today, so there is no new credit to check.
Recorded here so it is a known limit, not an oversight.

## R10. Seed values

**Decision**: see data-model.md › Seed. The values are new (spec › Design deviations). They were
chosen so that the two existing customers show one stop reason each without changing any ported
receivable:

- Morningview Bicycles owes KES 45,600 on RCV-0012, due 27 Feb 2026, so it is overdue.
- Mountain Goats owes KES 48,400 on RCV-0010 and KES 32,000 on RCV-0008, neither overdue: KES
  80,400 against a KES 100,000 limit leaves KES 19,600.

Standard prices for bulk units are the base price times the unit's multiplier (`seed.ts`), for
example Helmet (Medium) Carton = 1,639 × 10 = KES 16,390. Every seed list price is below its
standard price, and Distributor is below Wholesale.

## R11. Approval right

**Decision**: `has(access["rcv"], "write")` for the signed-in role, read from
`permissions.access`. In the seed that is Owner and Accountant.

**Rationale**: spec FR-017. It reuses feature 011 without a new kind of permission.
