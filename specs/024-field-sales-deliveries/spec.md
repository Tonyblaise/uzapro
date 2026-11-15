# Feature 024: Field sales (with Deliveries)

**Date**: 2026-11-15 · **Status**: Implemented

## Summary
The design adds **Field sales** to the Sales menu: orders reps take on the road. Each one becomes a delivery, listed under its **Deliveries** tab. An earlier version of the design (`1794711929-bdec`) made Deliveries a module of its own; the design now in `design/` (`1794713705-004d`) puts it under Field sales. Stock leaves the store when the delivery is dispatched, not when the order is taken.

## Requirements
- **FR-001** Field sales lists every field sale: Sale, Rep and route, Customer and location, Items, Total, Payment (Paid / On credit / On delivery / Collected) and Delivery status. Sales reps lists each rep with route, vehicle, orders today, sales (not counting cancelled ones), open deliveries and status. Choosing a rep lists that rep's sales.
- **FR-002** **New field sale** (full screen) records the customer, phone and delivery location, the items, the store to deliver from, the delivery date, the driver and notes, the rep and route, and the payment. The payment is **Paid now** (method and reference), **On delivery** or **On credit**. The design's validation messages apply in order.
- **FR-003** Saving creates FS-#### and DLV-####, both Pending, and adds the sale to Sales › All sales (channel "Field"):
  - Paid now: status Paid, and the money is posted to the method's account.
  - On credit: status Unpaid, and a "Sale on credit" receivable due in 30 days, through the customer's credit limit.
  - On delivery: status Awaiting delivery.

  No stock moves when the sale is saved.
- **FR-004** Field sales › Deliveries lists every field-sale delivery: those still to go out (Pending, Rescheduled, Out for delivery) first, oldest first, marked Today or Late; then Delivered and Cancelled, newest first. Each delivery opens a full-screen view with:
  - progress steps
  - who and where (with a Google Maps link)
  - facts, items, history and money
- **FR-005** The next action depends on the status:
  - **Dispatch** (driver) takes the items out of the store.
  - **Mark as delivered** needs who received it. For pay on delivery, it also needs how the money was collected (M-Pesa needs a code). It posts the money and marks the sale Paid.
  - **Couldn't deliver** needs a reason and a new date. It puts the items back.
  - **Cancel this delivery** needs a reason. It puts the items back if they were out, marks the sale Cancelled and closes a credit receivable. If the customer already paid, it tells you to refund.
- **FR-006** Taking a field sale and changing a delivery need Write on Field sales. The Store keeper sees only the Deliveries tab, so dispatches and confirms but takes no orders.

## Design deviations
- **Van sales removed.** Sales › Field sales (feature 021: vans, visits, van stock) is replaced by this module, at the user's request.
- **Sales-order delivery notes** (DN-…, features 013 and 019) stay under Sales › Deliveries. Field sales › Deliveries lists field-sale deliveries only, as in the design.
- **Roles.**
  - Cashier: Write on Field sales, as in the design.
  - Store keeper: Write on Field sales, with only its Deliveries tab, as in the design.
  - Accountant: Read on Field sales.
- **Prices and credit.** Prices follow the customer's price list (feature 012), and a credit field sale goes through the credit gate. The design used the standard price and no limit check.
- **Stock counting.** Stock is counted per product and store (the app's model), not per variant. Dispatch does not refuse a shortfall, as in the design.
- **Seed data.** The seeded field sales are not added to All sales (the design adds only new ones). Their stock is not moved: DLV-0239 is seeded as out for delivery without a stock movement.

## Design update (canvas v1794778583-c3c7, 2026-11-16)

- **Sales reps:** the header button is **New sales rep**. The form has full name, Kenyan phone, route, an optional vehicle and an On route switch. Each row has **See their sales**, **Edit** and **Mark off duty** / **Mark on route**. Renaming a rep moves their sales and deliveries with them.
- **Deliveries:** the header button is **New delivery**, a delivery made on its own with no field sale or rep.
  - It can be **Linked to** a sale or invoice. A sale's items load into the form. A seed invoice only fills the customer, matched by name, because invoice lines are free-text descriptions, not products.
  - Payment is Already paid, Collect on delivery or Nothing to collect.
  - It takes the DLV- ref and shows "For {ref}" or "Standalone".
  - It is not listed in Field sales and doesn't count towards a rep's figures.
- Each Field sales tab now has its own header button, as in the design. The Store keeper sees **New delivery** on Deliveries.
