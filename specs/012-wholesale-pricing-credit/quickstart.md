# Quickstart: Wholesale pricing and customer credit

**Prerequisites**: `npm install`, then `npm run dev`. Sign in at `http://localhost:3000/login` with
the demo Owner account shown on the login page. Seed figures: [data-model.md](./data-model.md) ›
Seed. Copy: [contracts/ui.md](./contracts/ui.md).

## Validation scenarios

1. **Group price on a sale** (US1): Sales › All sales › New sale.
   - Customer "Mountain Goats", product Helmet, variant Medium, unit Carton. Amount each fills in
     as 14900 with the note "Distributor price".
   - Number of units 5: the amount becomes 14400.
   - Change the customer to "Walk-in Customer": the amount becomes 16390 and the note goes.
2. **Below the first break**: customer "Morningview Bicycles", Muthokinju Paint, White, Tray, 1
   unit. Amount is 2802 with "Wholesale price from 2 Tray". At 2 units it becomes 2700.
3. **Hand-typed price**: type 15000 in Amount each, change the units. The amount stays 15000 and
   "Use Distributor price" appears; pressing it restores the list price.
4. **Invoice** (US1): Sales › Invoices › New invoice for "Mountain Goats". Add
   "Helmet · Medium", set the unit to Carton: the rate becomes 14900. For "Walk-in Customer" the
   same steps leave the rate as it is today.
5. **Over the limit** (US2): as Owner, New sale for "Mountain Goats", 2 cartons of Helmet
   (Medium), Paid by "Pay later (credit)", Record sale.
   - The dialog "Over the credit limit" shows limit KES 100,000.00, owed KES 80,400.00, available
     KES 19,600.00.
   - "Approve anyway" needs a reason. After approving, the sale is recorded and its view shows
     "Credit approved by …".
6. **No approval for a cashier**: use the account menu's "View as" to switch to Cashier and repeat
   step 5. The dialog has only "Close".
7. **Overdue**: any credit sale for "Morningview Bicycles" stops with "Morningview Bicycles has
   KES 45,600.00 overdue" and "Oldest: INV-0351, due 27 Feb 2026."
8. **Till**: open a terminal, attach "Mountain Goats", add 6 Bike Pump: the line shows 310 each
   and "Distributor price". Charge, choose Pay later for more than KES 19,600 of goods: the same
   stop dialog opens.
9. **Customer record** (US3): Customers shows Group, Credit limit and Balance owed; Morningview
   shows "Overdue". Edit "Mountain Goats", set the limit to 150000 and save. Step 5 now goes
   through without a stop.
10. **Cash terms**: set "Mountain Goats" to Cash terms. A credit sale stops with "Mountain Goats is
    on cash terms".
11. **Price lists** (US4): Products › Price lists › Wholesale › Add price: Bike Pump, Standard,
    Box, from 1 at 3600 and from 10 at 3400. Adding the same variant and unit again is refused.
    A new sale to "Morningview Bicycles" for a Box of Bike Pump fills in 3600.
12. **Customer groups** (US4): Customers › Customer groups › New group "Schools". Delete on
    Wholesale is refused with "Move 1 customer to another group first."
13. **Read only**: as Owner, set Store keeper › Products to Read. As Store keeper, Price lists
    shows prices with no Add price button and no row menu.
14. **Reload**: everything returns to the seed.

## Automated checks

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm run test:smoke
```

All five must pass. `tests/unit/pricing.test.ts` and `tests/unit/credit.test.ts` cover the rules;
`tests/smoke/pricing-credit.spec.ts` covers scenarios 1, 5, 6, 7, 9, 11 and 12.
