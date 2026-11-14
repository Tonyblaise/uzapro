# Quickstart: Sales orders and dispatch

> Since feature 014 a Box of Bike Pump is 12 pieces and Main Store holds 30, so use 2 boxes (send 1, then 1) in steps 2 to 4 and 7; stock ends at 6.

**Prerequisites**: `npm install`, `npm run dev`, sign in as the demo Owner.

1. **Seed**: Sales › Sales orders lists SO-0001 (Morningview Bicycles, Part dispatched, 16,560).
   Sales › Deliveries lists DN-0001 (Delivered, Peter Kamau, KDG 412X).
2. **Take an order** (US1): New order for Mountain Goats, deliver by any date, add
   "Bike Pump · Standard", unit Box, quantity 3. The rate is 3800. Save: "SO-0002 saved.", status
   Open. Stock › Stock management still shows Bike Pump at Main Store as 30.
3. **Part dispatch** (US2): open SO-0002 › Dispatch. Send now shows 3; change it to 2, driver
   "Peter Kamau", vehicle "KDG 412X", Confirm: "DN-0002 created. 2 items left Main Store." The
   order shows Part dispatched, and Bike Pump at Main Store is 28.
4. **Second dispatch**: Dispatch again; Send now shows 1. Confirm: the order is Dispatched and
   Dispatch is no longer offered.
5. **Too much**: on an order, enter more than is left: "You can send at most …".
6. **Mark delivered** (US3): Sales › Deliveries › DN-0002 › Mark delivered, received by
   "Amina Yusuf". Status Delivered, "Received by Amina Yusuf".
7. **Invoice** (US4): SO-0002 › Create invoice: "INV-… saved. RCV-… added to Receivables." The
   invoice is for 3 boxes; stock is unchanged; the order shows Invoiced.
8. **Cancel**: a new order with nothing dispatched › Cancel order: Cancelled.
9. **Credit stop**: a new order for Morningview Bicycles stops as overdue. After step 2, Mountain
   Goats' customer record shows KES 11,400 on order and KES 8,200 available.
10. **Reload**: everything returns to the seed.

## Automated checks

`npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:smoke`.
