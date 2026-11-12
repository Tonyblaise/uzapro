# Quickstart & Validation: Purchases and Suppliers

## Run and gates

The same commands as feature 001 (`specs/001-dashboard-sales-stock/quickstart.md`):

```bash
npm run dev
npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke
```

Log in as `tony@…` (Owner), `mary@…` (Accountant) or `grant@…` (Store keeper). The password is any
6 or more characters.

## Manual validation scenarios

Run each after a fresh reload. The expected text is the design's.

1. **Overview (US4)**: as the Owner, open `/purchases/overview`. KPIs: Total orders 3, Total spend
   KES 641,596, Active suppliers 3, Goods received 2, Avg lead time 6d, Rejected items 2,
   Returns 5. The orders and spend charts, "Delivered on time" and "Recent orders" match the
   canvas.
2. **New order (US1)**: on Purchase orders, select "New purchase order". Choose Eastside Bicycle
   Supplies, Main Store, then Bike Pump · Standard ×10 and Helmet · Medium ×5, and select
   "Save and approve". PUR-ORD-0410 is listed as Approved, with Received None. Opening it shows
   the items, the total, and activity with "Sent to supplier".
3. **Receive (US2)**: on PUR-ORD-0410, choose "Accept and receive goods", then "Receive all as
   ordered". Set Bike Pump accepted to 9 and save. The toast reads "GRN-0042 saved. 14 accepted
   into Main Store. PYB-… added to Payables.". In Stock › Stock management, Main Store's Bike Pump
   goes 30 → 39 and Helmet 0 → 5. REJ-0004 is listed as Waiting, and the order shows Full ·
   Completed.
4. **Return (US3)**: on Purchase returns, select "New purchase return". Choose PUR-ORD-0410 and
   GRN-0042, reason Damaged, Helmet ×2, then "Submit and approve". The toast reads "PRT-0006
   approved. Stock reduced." and Main Store's Helmet goes 5 → 3.
5. **Rejected (US3)**: open REJ-0004 and select "Mark sent back". The status is Sent back and no
   actions remain.
6. **Suppliers (US5)**: create the supplier "Kisumu Cycle Parts" ("Kisumu Cycle Parts added.").
   It is available in the new-order supplier picker. Creating "Croma" again (if present) or
   "Magaliesburg Wheels" is blocked with "… is already in the list.". An inactive supplier is
   hidden from the pickers.
7. **Send to Purchases**: in Stock › Stock management choose "Stock in", pick a supplier, add an
   item, and leave "Skip Purchases" unticked. The toast reads "Sent to Purchases." and Goods
   receipts lists a new GRN with PO "—" and status Waiting. Stock is unchanged.
8. **Roles**: the Accountant has no Goods receipts tab, the Store keeper has no Overview tab, and
   the Cashier sees neither module. Hidden deep links redirect to `/dashboard`.
9. **Reload**: all purchasing data returns to the seed.
