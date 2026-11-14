# Research: Quotation to order, and returns against a delivery

## R1. Conversion opens the form

**Decision**: "Convert to order" opens the order form prefilled, like "Convert to invoice" opens
the invoice form. It does not create the order in one click.

**Rationale**: an order needs a deliver-by date the quotation does not have, and the credit check
may need an approval, which the form already handles.

## R2. Discount

**Decision**: orders have no discount field, so the quotation's discount is spread pro rata:
`rate × (1 − discount ÷ subtotal)`, rounded to 2 decimals.

## R3. What a return does to the order

**Decision**: it lowers the order line's `dispatched`, so the goods are "left to dispatch" again.
It is limited to `dispatched − invoiced` on the order line.

**Rationale**: the customer still ordered them; the order should show they are outstanding. Goods
that are already invoiced need a credit note, which is the existing flow.

## R4. Right

**Decision**: recording a return needs "Dispatch sales orders" (feature 018): it is the same
person and the same kind of stock movement, in reverse.
