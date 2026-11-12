# Feature Specification: Run Reports

**Feature Branch**: `009-run-reports`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "I made updates to the reports section. I basically added an option to
run each report"

## Scope at a glance

The updated canvas (version 1794508919) makes the report cards on Reports › Popular, Sales, Money
and Stock runnable. Each card now has a **Run** button, and running it opens a **report view** in
place of the cards. The view has:

- an "All reports" back button;
- the report's title and subtitle (the period and its dates, or "As at 10 Nov 2026");
- a period picker ("This month", "Last month", "This year") for reports that cover a period;
- an "Export CSV" button;
- a row of KPI tiles;
- a table with a bold total row;
- a short note about where the figures come from.

The canvas defines 18 reports. The two cards it has no report for, "Production yield" and "Reorder
forecast", show a disabled **Coming soon** button instead of Run. Every card also gets its own short
description in place of the generic "Run, schedule or export".

| Tab | Reports |
|---|---|
| Popular | Sales summary, Profit & loss, Balance sheet, Stock valuation, VAT return, Customer statements, Purchase analysis, *Production yield (coming soon)* |
| Sales | Sales summary, Sales by product, Sales by customer, Sales by channel, Returns & refunds, Sales targets |
| Money | Profit & loss, Balance sheet, Trial balance, Cash flow, VAT return, Aged receivables |
| Stock | Stock valuation, Stock movement, Low stock, Wastage, *Reorder forecast (coming soon)* |

Some figures are fixed in the design: sales totals, channels, top products and customers, supplier
spend and stock value. These scale with the period. All other figures come from the live demo data,
so reports reflect what the presenter recorded earlier in the session. That covers expenses, credit
notes, receivables, payables, bank balances, the ledger, stock levels and movements, wastage,
product prices and sales targets.

The "Build a report" and "Sent automatically" tabs are unchanged.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a report from its card (Priority: P1)

The presenter opens Reports, sees each report described in plain words, and chooses **Run** on
"Sales summary". The cards are replaced by the Sales summary report: KPI tiles for total sales,
average order, refunds and net sales, then a table of sales by channel with a total row. They
choose "All reports" to go back to the cards.

**Why this priority**: running a report is the whole of this change. Without it the cards are still
placeholders.

**Independent Test**: open Reports › Popular and choose "Run" on Sales summary. Check:
- the heading "Sales summary" and the subtitle "This month · 1 Nov 2026 to 10 Nov 2026";
- 4 KPI tiles (Total sales KES 4,820,000 with "1,100 orders");
- 3 channel rows (POS, Invoice, Ecommerce) and a bold "Total" row.

Then "All reports" returns to the 8 cards.

**Acceptance Scenarios**:

1. **Given** Reports › Popular, Sales, Money or Stock, **Then** each card shows:
   - the file icon and the title;
   - the design's one-line description, for example "Total sales, orders and refunds" for Sales
     summary or "What the business owns and owes" for Balance sheet;
   - at the bottom right, a small **Run** button with a right chevron and the accessible name "Run
     {report}". Production yield and Reorder forecast show a disabled secondary **Coming soon**
     button instead, and their description is "Not available yet".

   Cards in a row are the same height.
2. **Given** a card, **When** the presenter chooses Run, **Then** the cards are replaced by the
   report view:
   - the header row: a secondary "All reports" button with a left chevron; the report title in the
     card-title style with the subtitle beneath; the period picker (period reports only); and a
     secondary "Export CSV" button with a download icon;
   - KPI tiles: uppercase label, a large value in the KPI's colour, and a small note;
   - the table, ending in a bold total row when the report has one;
   - the note.

   The page title and tabs stay as they are.
3. **Given** a report view, **When** they choose "All reports", **Then** the cards for that tab show
   again. Switching to another Reports tab, or to another module, also leaves the report.
4. **Given** a report view, **When** they reload the page or use the browser's back and forward
   buttons, **Then** the same report (and period) is shown, or the cards when they've gone back.
5. **Given** a report with no rows for the period, for example Returns & refunds or Stock movement
   for a period with none, **Then** a dashed box shows the report's empty message ("No refunds in
   this period.", "No stock moved in this period." or "No money moved in this period."). It falls
   back to "Nothing to show for this period." for reports without their own message.

---

### User Story 2 - Change the period and see the figures change (Priority: P1)

The presenter wants last month's figures. They pick "Last month" in the period picker. The subtitle,
KPIs and table update. Reports that show a position at a date (Balance sheet, Trial balance,
Customer statements, Aged receivables, Stock valuation, Low stock, Sales targets) have no period
picker.

**Why this priority**: a report without a period is a snapshot. Changing the period is the main
interaction in the design's report view.

**Independent Test**: run Profit & loss and change the period from "This month" to "This year". The
subtitle becomes "This year · 1 Jan 2026 to 10 Nov 2026", and Sales becomes KES 38,600,000. Open
Balance sheet: there is no period picker and the subtitle reads "As at 10 Nov 2026".

**Acceptance Scenarios**:

1. **Given** a period report, **Then** the picker offers "This month" (1–10 Nov 2026), "Last month"
   (1–31 Oct 2026) and "This year" (1 Jan–10 Nov 2026). The default is "This month", or the last
   period chosen in the session. The subtitle reads "{period} · {start} to {end}".
2. **Given** a period change, **Then**:
   - the design-fixed sales figures scale by the design's factors: 1 for this month, 4.29 / 4.82
     for last month and 38.6 / 4.82 for this year. That gives sales of KES 4,820,000, KES
     4,290,000 and KES 38,600,000;
   - live records (expenses, credit notes, ledger entries, stock movements) are filtered to the
     period's dates.
3. **Given** a point-in-time report (Balance sheet, Trial balance, Customer statements, Aged
   receivables, Stock valuation, Low stock) or Sales targets, **Then** there is no period picker.
   The subtitle reads "As at 10 Nov 2026", or "All targets" for Sales targets.

---

### User Story 3 - Reports reflect what was recorded in the demo (Priority: P2)

Earlier in the demo the presenter recorded a customer payment, an expense and a credit note. When
they run Customer statements, Profit & loss, Cash flow or Returns & refunds, the new figures are
included.

**Why this priority**: it shows the reports are connected to the rest of the app. It is valuable,
but it builds on User Stories 1 and 2.

**Independent Test**: record a full payment on RCV-0011 (KES 1,026) in Receivables, then run
Customer statements. Blazing Cycle Trails' balance and overdue amount drop by KES 1,026, and so does
the "Total owed" KPI. Record a paid KES 2,000 Transport expense, then run Profit & loss for this
month. Transport appears under Expenses, and Expenses and Net profit change by KES 2,000.

**Acceptance Scenarios**: each report is worked out as the design's `repRun` does. "Live" below
means the figures come from the current session's records.

1. **Sales summary / Sales by channel** (the same report):
   - KPIs: "Total sales" (with "{orders} orders"), "Average order", "Refunds" (with "{n} credit
     notes") and "Net sales" (sales minus refunds);
   - rows: one per channel (POS, Invoice, Ecommerce), with orders, sales, average order and share;
   - total row: "Total".
   - Refunds are live: non-voided credit notes dated in the period.
2. **Sales by product**:
   - rows: the design's top products, with units sold, sales and average price;
   - KPIs: "Best seller", "Products shown", "Their sales".
3. **Sales by customer**:
   - rows: the design's top customers, with orders, sales and "Owes you now";
   - "Owes you now" is live (receivable balances);
   - KPIs: "Top customer", "Customers shown", "They still owe".
4. **Customer statements** (live, as at 10 Nov 2026):
   - rows: one per customer with receivables, sorted by balance, showing invoiced, paid, balance
     and overdue;
   - KPIs: "Customers with a balance", "Total owed", "Overdue".
5. **Returns & refunds** (live):
   - rows: the non-voided credit notes in the period, showing credit note, customer, date, invoice,
     reason and amount;
   - KPIs: "Credit notes", "Refunded", "Share of sales" (two decimals and a "%").
6. **Sales targets** (live):
   - rows: one per target, showing target, for, dates, target amount, reached, and progress as a
     percentage with one decimal;
   - KPIs: "Targets", and "On track" (75% or more reached).
7. **Profit & loss**:
   - cost of goods is 58% of sales;
   - expenses are live: paid expenses in the period, plus their transaction fees, grouped by
     category and largest first;
   - lines: Income, Sales, Cost of goods sold, Gross profit (bold), Expenses, the categories
     indented, Total expenses (bold); total row "Net profit";
   - KPIs: "Sales"; "Gross profit" with "{margin}% margin"; "Expenses" with "{n} paid
     expenses"; "Net profit" (green when 0 or more, red when negative).
8. **Balance sheet** (as at 10 Nov 2026):
   - assets: live bank account balances, live receivables, and stock of KES 2,650,000;
   - liabilities: live payables and VAT owed (output VAT less input VAT, never below 0);
   - total row: "Owner's equity (net worth)";
   - KPIs: "Assets", "Liabilities", "Net worth".
9. **Trial balance** (as at 10 Nov 2026):
   - the same figures as the balance sheet, in Debit and Credit columns, with owner's equity
     balancing them;
   - KPIs: "Debits", "Credits", and "Difference" at "KES 0" with "Balanced".
10. **Cash flow** (live):
    - ledger entries in the period, grouped by type, showing transactions, money in, money out
      and net;
    - KPIs: "Money in", "Money out", "Net cash flow" with "{n} transactions".
11. **VAT return**:
    - output VAT is sales × 16/116;
    - input VAT is the live tax on paid expenses in the period, plus 60% of KES 3,400,000 × the
      period factor × 16/116;
    - rows: sales including VAT, output VAT, input VAT;
    - total row: "VAT to pay", or "VAT to carry forward" when input VAT is larger;
    - KPIs: "VAT on sales", "VAT you can claim", and "VAT to pay KRA" or "VAT to carry
      forward" with "Due by the 20th of next month";
    - note: "Standard rate of 16%. Check the figures before filing on iTax."
12. **Aged receivables** (live, as at 10 Nov 2026):
    - rows: each open receivable with customer, document, due date and its balance in one of "Not
      due", "1–30 days", "31–60 days", "61–90 days" or "Over 90 days", plus a total;
    - KPIs: "Total owed" with "{n} open balances", "Not yet due", "Over 90 days".
13. **Purchase analysis**:
    - rows: the design's suppliers, with orders, spent, average order and share;
    - KPIs: "Spent with suppliers", "Biggest supplier", "Purchase orders".
14. **Stock valuation** (live, as at 10 Nov 2026):
    - rows: each stock line with quantity above 0, showing product, store, quantity, unit cost
      (60% of the live selling price), value at cost and value at price;
    - KPIs: "Value at cost", "Value at selling price", "Lines in stock";
    - note: "Unit cost is estimated at 60% of the selling price where no buying price is
      recorded."
15. **Stock movement** (live):
    - rows: the movements in the period, showing date, product, variant, type, store, change,
      balance, by and reference;
    - KPIs: "Movements", "Units in", "Units out".
16. **Low stock** (as at 10 Nov 2026):
    - rows: the design's low-stock list, showing product, store, in stock, reorder at and status;
    - KPIs: "Need restocking" (status not Healthy) and "Out of stock" (quantity 0).
17. **Wastage** (live):
    - rows: the wastage records, showing ref, item, quantity, reason and value;
    - KPIs: "Records", "Value lost".

Amounts in tables are whole numbers with thousands separators; negatives use "−" (for example
"−2,795,600"). KPI money reads "KES {amount}". The default note is "Built from the sample data in
UzaPro. Figures update as you record sales, expenses and payments."

---

### User Story 4 - Export a report (Priority: P3)

The presenter wants to paste a report into a spreadsheet. They choose **Export CSV**. The report is
copied as CSV and a toast confirms "Copied {report} as CSV."

**Why this priority**: it's useful, but it doesn't change what the report shows.

**Independent Test**: run Sales summary and choose Export CSV. The toast reads "Copied Sales summary
as CSV.". The clipboard holds a header row, 3 channel rows and the total row.

**Acceptance Scenarios**:

1. **Given** a report view, **When** they choose Export CSV, **Then** the clipboard gets:
   - the column headings, every row and the total row, with each value quoted;
   - numbers rounded to two decimals;
   - pills and bold cells as plain text.

   The toast reads "Copied {report} as CSV.".
2. **Given** a browser without clipboard access, **Then** the toast reads "Copy is not available
   here.".

---

### Edge Cases

- **Roles**: Reports follow the existing role rules. A role that can't see Reports never sees the
  cards or the view. Every role that can see Reports can run every report, as in the design.
- **Coming soon**: "Production yield" and "Reorder forecast" cannot be run. Their button is disabled
  and is still announced as "Coming soon".
- **Empty periods**: Returns & refunds, Cash flow and Stock movement can have no rows in a period.
  They then show their empty message and no total row. The KPIs still show (zeros where
  applicable).
- **Negative results**: Net profit, net cash flow and table amounts below zero show "−" and use the
  danger colour where the design sets it.
- **Deep link to an unknown report**: a report name that doesn't exist opens the cards for that tab
  instead.
- **Phones (320–430px)**:
  - the header row wraps;
  - KPI tiles go into fewer columns;
  - wide tables scroll inside their card, without sideways page scrolling;
  - Run buttons stay visible.
- **Reload**: a report shows the seed data again after a reload (Constitution Principle III). Only
  the open report and period come from the URL.
- **Running the same report from two tabs** (for example Sales summary from Popular and from Sales)
  gives the same result. The view stays on the tab it was run from.

## Requirements *(mandatory)*

### Functional Requirements

**Cards**

- **FR-001**: Each card on Reports › Popular, Sales, Money and Stock MUST show:
  - the design's per-report description;
  - a "Run" button (small, primary, right chevron, accessible name "Run {report}");
  - or, for reports the design doesn't define, a disabled secondary "Coming soon" button and the
    description "Not available yet".
- **FR-002**: Cards MUST be equal height within a row, with the button at the bottom right.

**Report view**

- **FR-003**: Run MUST replace the cards with the report view for that report: the header row, KPIs,
  table, empty state and note, as in the design.
- **FR-004**: "All reports" MUST return to the tab's cards. Leaving the tab or module MUST also close
  the report.
- **FR-005**: The open report and period MUST be part of the page address, so reloads and the
  browser's back and forward buttons keep or restore the view.
- **FR-006**: Period reports MUST offer "This month", "Last month" and "This year" with the design's
  date ranges and scaling. Point-in-time reports and Sales targets MUST NOT show a picker.
- **FR-007**: The 18 reports MUST compute their KPIs, rows, totals, empty messages and notes as
  described in User Story 3, using the design's wording for every label.
- **FR-008**: Figures that come from records the presenter can change MUST reflect the current
  session. That covers expenses, credit notes, receivables, payables, bank balances, the ledger,
  stock levels and movements, wastage, product prices and targets.
- **FR-009**: Number formats MUST follow the design:
  - whole numbers with en-KE grouping in tables;
  - "−" for negatives;
  - percentages with one decimal (two for "Share of sales");
  - "KES {amount}" in KPIs;
  - dates like "1 Nov 2026".
- **FR-010**: KPI values MUST use the design's colours: green, danger or info text where set, and
  normal text otherwise.

**Export**

- **FR-011**: Export CSV MUST copy the report (headings, rows and total) as CSV, then show "Copied
  {report} as CSV.", or "Copy is not available here." when the clipboard is unavailable.

**General**

- **FR-012**: Reports MUST NOT make network calls. Everything is worked out in the browser from the
  demo data.
- **FR-013**: The report view MUST be usable by keyboard and screen reader:
  - real buttons;
  - the period picker labelled "Period";
  - table headers;
  - the KPI label read before its value.
- **FR-014**: The report view MUST work from 320px wide without sideways page scrolling.

### Key Entities

- **Report definition**:
  - a name and a description;
  - whether it covers a period or a point in time;
  - its columns (a heading, plus whether each is numeric or a percentage);
  - its empty message and note.
- **Report result**:
  - the title and subtitle;
  - the KPIs, each with a label, value, optional note and optional colour;
  - the rows;
  - an optional total row;
  - an optional empty message and note.
- **Period**: "This month", "Last month" or "This year", each with a start date, an end date and a
  scale factor for design-fixed figures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any of the four card tabs, a presenter can open any of the 18 reports in one
  action and return to the cards in one action.
- **SC-002**: All 18 reports show the design's titles, KPI labels, column headings, totals and notes,
  in 100% of checks against the design.
- **SC-003**: Changing the period updates the subtitle, KPIs and rows at once, with no page reload.
- **SC-004**: After recording a payment, an expense or a credit note, the related reports reflect it
  in 100% of checks: Customer statements, Aged receivables, Profit & loss, Cash flow, VAT return and
  Returns & refunds.
- **SC-005**: Export CSV puts a valid CSV on the clipboard (one header row, one line per row, plus
  the total), and the toast confirms it.
- **SC-006**: The report view passes the automated accessibility scan with no serious or critical
  issues, and shows no sideways page scrolling at widths of 320, 360, 375, 390, 414 and 430px.
- **SC-007**: All existing smoke tests still pass.

## Assumptions

- **The canvas is the source**: this spec was written from the canvas file
  `design/canvas/Uzapoint ERP.dc.html` (version 1794508919, now saved in the repository). The card
  markup changes, the `isRepView` markup, `repRun()`, `repFmt()` and the card wiring define the
  behaviour. `erp-data.js` is unchanged.
- **This replaces an earlier decision**: feature 005 (Clarification Q1) treated the report cards as
  not clickable, because the canvas had no report view then. The canvas now defines one.
- **Report address**: the design keeps the open report in screen state. Here it is part of the page
  address instead (FR-005), so the browser's back and forward buttons and reloads behave as
  elsewhere in the app (the `?action=` / `?view=` convention).
- **Design-fixed figures** are kept as the design has them: sales of KES 4.82M a month and 1,100
  orders; channel, product, customer and supplier figures; stock value of KES 2.65M; purchases of
  KES 3.4M for input VAT; the 58% cost of goods; and unit cost at 60% of price. A real ledger will
  replace them later.
- **Out of scope**: the design's code also has two hooks with no visible control, so they can't be
  reached from the canvas:
  - an "ask Uza AI about this report" handler;
  - an Uza AI action type that opens a report.

  Neither is built here.
- **Build a report and Sent automatically** keep their current behaviour.
- **Number format in report tables**: amounts are whole numbers with the currency in the column
  heading ("Sales (KES)"), as the design's `repFmt` shows them. This matches the project's existing
  table format (`num()`, used where the heading carries the currency). KPI tiles keep
  "KES {amount}". This follows the design, so it is not a deviation.

## Design deviations

Required by Constitution Principle I. These are the only intended differences from the canvas.

| Deviation | Reason | Reference |
|---|---|---|
| The open report and its period are kept in the page address (`?report=…&period=…`), not only in screen state | Keeps reloads and the browser's back and forward buttons consistent with the rest of the app (the `?action=` / `?view=` convention) | FR-005 |
| Point-in-time reports (Balance sheet, Trial balance, Customer statements, Aged receivables, Stock valuation, Low stock, Sales targets) always use "This month" for their period-scaled inputs | In the canvas, a period chosen on another report silently changed the Balance sheet's VAT owed even though it has no period picker | FR-006 |
| The report table's scroll area is keyboard-focusable ("{report} table"). The period picker's accessible name is "Period: {period}". | Constitution Principle IV; the accessibility scan flags both | FR-013 |

Visual review (T019, 2026-11-12): the cards, Sales summary, Profit & loss and Aged receivables were compared with the canvas markup at 1440px and 375px. There are no differences beyond the rows above.

Noticed but outside this feature: the active module tab (`--green-600` on the canvas background) scores 4.26:1 contrast, just under 4.5:1. It appears on every module page and comes from the design.
