# Quickstart: Run Reports

## Prerequisites

1. Run `npm run dev -- -p 3001`.
2. Sign in as demo@uzapro.com / demo@123.

## Scenarios

1. **Cards**: open Reports › Popular.
   - The 8 cards have the design's descriptions, for example "Total sales, orders and refunds".
   - 7 cards have a Run button. "Production yield" shows a disabled "Coming soon" and "Not available
     yet".
   - The cards in each row are the same height.
2. **Run**: choose "Run" on Sales summary. Check:
   - the heading is "Sales summary" and the subtitle is "This month · 1 Nov 2026 to 10 Nov 2026";
   - the KPIs read Total sales "KES 4,820,000" with "1,100 orders", plus Average order, Refunds and
     Net sales;
   - the table has POS, Invoice and Ecommerce rows and a bold "Total" row;
   - the page address contains `?report=sales-summary`.
3. **Back**:
   - "All reports" shows the cards again.
   - Run Sales summary again, then use the browser's back button: the cards show.
   - Reload while the report is open: the report shows again.
4. **Period**: run Profit & loss and choose "This year".
   - The subtitle reads "This year · 1 Jan 2026 to 10 Nov 2026" and the Sales KPI reads "KES
     38,600,000".
   - Open Balance sheet: there is no period picker and the subtitle reads "As at 10 Nov 2026".
5. **Every report**: on Sales, Money and Stock, run each card. Each shows its KPIs and table (or its
   empty message) with no console errors. "Reorder forecast" says "Coming soon".
6. **Live figures**:
   - Record a full payment on RCV-0011 in Receivables. In Customer statements, Blazing Cycle Trails'
     balance is 0, and Total owed has dropped by KES 1,026.
   - Record a paid KES 2,000 Transport expense. In Profit & loss for this month, Transport appears
     under Expenses, and the Expenses KPI has risen by KES 2,000.
7. **Export**: on Sales summary, choose Export CSV. The toast reads "Copied Sales summary as CSV.",
   and the clipboard holds a header row, 3 rows and the total.
8. **Phones**: at 320–430px, Low stock and Aged receivables show:
   - the header row wrapping;
   - KPI tiles stacking;
   - the table scrolling inside its card, with no sideways page scrolling.
9. **Roles**: as the Cashier, Reports isn't in the menu, which is unchanged. As the Accountant,
   reports run as they do for the Owner.

## Gates

```bash
npm run typecheck && npm run lint && npm run test:unit && npm run build && npm run test:smoke
node "$SCRATCH/mobile/audit.mjs"   # 0 issues over the routes, including report views
```
