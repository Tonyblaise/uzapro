# Quickstart: Point of Sale

## Prerequisites

1. Run `npm run dev -- -p 3001`.
2. Sign in as demo@uzapro.com / demo@123 (Owner).

## Scenarios

1. **Terminals**: open Sales › Point of sale. Terminal 1 shows:
   - "Shift open";
   - "Opened by Tony Blaise, 09:05";
   - "Sales this shift 6 · KES {sum}";
   - a "Continue selling" button;
   - "Manage terminals", which opens Settings › Terminals.
2. **PIN**: choose Continue selling.
   - The step bar and "This shift is already open" show. Choose "Continue to PIN".
   - Type 1111: the dots shake and "That PIN is wrong. Try again." shows.
   - Type 1234 on the keyboard: the till opens on Sell.
3. **A cash sale**:
   - Tap Bike Pump, then Helmet. Choose Medium, then "Add 1 · KES 1,639.00".
   - The cart shows the two lines, a Subtotal and VAT 16% (included), and a Total of KES 1,984.00.
   - Choose Charge and type 3000. "Give change KES 1,016.00" shows. Choose Complete sale.
   - The receipt shows "Sale complete" and SAL-001185, and the toast reads "Receipt printing…".
4. **Effects**: choose New sale, then Exit.
   - Sales › All sales lists SAL-001185 first.
   - Stock at Point of Sale shows Bike Pump and Helmet down by 1 each.
   - Accounts › Cash drawer is up by KES 1,984, with a "Sale" transaction.
5. **Split and credit**:
   - Re-enter the till. Add Groupset and choose Charge. Pay KES 5,000 by M-Pesa with code SKTEST1234,
     then choose "Add as part payment and split the rest". Pay the rest in cash and complete.
   - Next, pick Morningview Bicycles and use Pay later. The message says "…added to Morningview
     Bicycles's balance in Receivables, due in 30 days."; complete. Receivables lists a new "Sale on
     credit".
   - Pay later for a walk-in is refused with "Pick a named customer to sell on credit.".
6. **Customers, hold and orders**:
   - Choose Change, then New customer "Grace Wanjiru". The toast reads "Grace Wanjiru added to
     customers.".
   - Add a product and choose Hold. The Orders badge shows 1. Resume it.
   - Open SAL-POS-0005 from Orders: its receipt shows M-Pesa SKB7Q2LM0P.
7. **Today and settings**:
   - Today shows the four KPIs, best sellers and sales by hour with "Busiest: …".
   - In Settings, turn off "Show stock on products": the badges disappear. Add the quick note "No
     box" and use it on a cart line.
8. **Close shift**:
   - The Shift view shows the X-report, with expected cash of 5,000 plus cash sales.
   - Choose Close shift and enter a count. Short or Over shows. Confirm: the toast reads "Terminal 1
     shift closed. …".
   - The terminal card now reads Closed. Open a shift with KES 2,000: the toast reads "Shift opened
     on Terminal 1.".
9. **Roles**:
   - As the Cashier, Point of sale is in the menu and works.
   - As the Accountant or the Store keeper, it isn't in the menu.
10. **Phones**: at 375px, the cart button in the header opens the cart panel, the checkout stacks,
    and there is no sideways scrolling.

## Gates

```bash
npm run typecheck && npm run lint && npm run test:unit && npm run build && npm run test:smoke
node "$SCRATCH/mobile/audit.mjs"   # 0 issues, including /point-of-sale/terminals
```
