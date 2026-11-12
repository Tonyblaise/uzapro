# Quickstart & Validation: Dashboard, Products, Stock, Sales and Customers

## Prerequisites

- Node 22 LTS, npm.
- The design reference in `design/` (see `design/README.md`). Keep the canvas
  (https://claude.ai/artifact/KKMZcTUgzkopE2izUei3TS) open for visual comparison.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
```

## Quality gates (all must pass; constitution "Development Workflow & Quality Gates")

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # eslint (includes the fixtures import restriction)
npm run build          # next build
npx playwright install --with-deps chromium   # first time only
npm run test:smoke     # Playwright: tests/smoke/*
npm run test:unit      # Vitest: format, nextRef, totals, role visibility (optional gate)
```

## Demo logins (from the design's login logic, research R8)

The password can be any 6+ characters. The role comes from the start of the email:

| Email | Role |
|---|---|
| `tony@buildbyblaise.co.ke` (or any other) | Owner, Tony Ashiuma |
| `mary@…` | Accountant, Mary Achieng |
| `jane@…` | Cashier, Jane Smith |
| `grant@…` | Store keeper, Grant Jensen |

## Manual validation scenarios

Run each one after a fresh reload. Expected text is the design's, verbatim.

1. **Login and dashboard (US1)**: log in as tony@… → toast "Welcome back, Tony." → the
   Dashboard shows the banners KES 184K / 1.12M / 4.82M / 38.6M, Pending invoices = 2,
   and Invoice analytics Overdue "1, KES 1,026". Switch the comparative chart Bars → Lines
   → Area.
2. **Login errors**: a password shorter than 6 → "Wrong email or password. Check them and try
   again."; an email like `abc` → "That doesn't look like an email or phone number.".
3. **Roles (US2)**: use the role select to choose Cashier → the sidebar shows only the
   Cashier's modules, and Sales shows only All sales and Refunds. Open `/products` →
   redirected to `/dashboard`.
4. **Record a sale (US3)**: Dashboard quick task "New sale" → `/sales/all-sales?action=new`.
   Pick Morningview Bicycles, add Bike Pump ×2 (zero-rated) and Helmet Medium ×1, then
   record. The new row is at the top of All sales, the total includes 16% VAT on the Helmet
   only, Point of Sale stock for Bike Pump drops 28 → 26, and the Bike Pump history shows a
   Sold −2 movement.
5. **Void (US3)**: open the new sale → Void → "Entered by mistake" → "Sale voided.". It is
   listed in Voided items as VOID-0002, and Bike Pump stock returns to 28.
6. **Credit note (US3)**: raise a credit note on a sale → it is listed as Waiting approval →
   Approve → the status changes, and stock returns if "Return goods to stock" is ticked.
7. **Product (US4)**: add "Test Saddle" in Parts, price 2,500, cost 1,500 → margin 40% →
   saved and listed. Add a category named "Parts" → blocked as a duplicate. Delete
   "Parts" → "Move its products to another category first."
8. **Transfer (US5)**: Main Store → Point of Sale, Bike Pump ×2, "Transfer and ship" →
   In transit → Mark as received → "Transfer received at Point of Sale." Main Store goes
   30 → 28 and Point of Sale 28 → 30.
9. **Wastage (US5)**: record 1 damaged Carbon Sole Shoes at Main Store → "Wastage
   recorded at Main Store." and the quantity goes 40 → 39.
10. **Customer (US6)**: add "Kilele Riders" → listed as Active → available in the new-sale
    customer picker. Adding "Mountain Goats" again → duplicate message.
11. **Placeholder**: as Owner, open Purchases → "Not built yet in this prototype."
12. **Reload**: after steps 4–10, reload → all data is back to the design values, and you
    are still signed in as the same role on the same page (with "Remember me" ticked).
