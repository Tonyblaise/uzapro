# Research: Run Reports

The source is the canvas file `design/canvas/Uzapoint ERP.dc.html` at version 1794508919:

- the card markup (~lines 851–863);
- the `isRepView` markup (~870–892);
- `repFmt()` and `repRun()` (~3659–3763);
- the card wiring in the render values (~4313–4325).

## R1 Where the report is computed

**Decision**: one pure module, `src/data/reports.ts`, exporting:

```ts
runReport(name, period, src): ReportResult
```

`src` is a plain snapshot (`ReportSource`) of the store slices a report reads: receivables,
payables, credit notes, expenses, accounts, ledger, stock levels, movements, wastage, products,
targets, sales and stores. A hook, `useReport(name, period)`, builds the snapshot with
`useAppStore` selectors and memoises the result.

Each of the design's `case`s becomes one function, kept in the design's order, with the design's
exact labels, colours, empty messages and notes.

**Rationale**: a pure function lets Vitest check every report against the seed, and changes made
earlier in the session flow in through the snapshot (Principle II/III).

**Alternatives considered**: computing reports inside components. That would duplicate logic and
be hard to test.

## R2 Design figures and their sources

| Design source | Here | Live? |
|---|---|---|
| `salesTotal = 4,820,000 × sc`, `orders = round(1,100 × sc)` | `REPORT_FIXED.salesMonth`, `.ordersMonth` | Fixed, scaled |
| `UZ_SALES.channels` | `UZ_SALES.channels` (fixtures/overviews) | Fixed |
| `UZ_SALES.boards` "Top products" / "Top customers" | `UZ_SALES.boards` | Fixed, scaled |
| `UZ_HOME.suppliers` | `UZ_HOME.suppliers` | Fixed, scaled |
| `stockVal = 2,650,000`; purchases `3,400,000 × sc × 0.6` for input VAT; COGS 58%; unit cost 60% | `REPORT_FIXED` constants | Fixed |
| Paid expenses (`r[8].pill === "Paid"`, date in range), with `r[6]` tax, `r[7]` amount and the `UZ_EXPDETAIL` fee | `expenses.expenses` (`status`, `date`, `tax`, `amount`, `fee`) | Live |
| Credit notes in range and not `Voided` | `sales.creditNotes` (`date`, `status.label`, `amount`, `customer`, `source`, `reason`, `number`) | Live |
| Receivables, `rcvBal` and `rcvStatus` | `receivableRows(money.receivables)` | Live |
| Payables, `payBal` | `balance()` over `money.payables` | Live |
| Bank accounts `r[0]`, `r[4]` balance | `accounts.accounts` (`name`, `balance`) | Live |
| `UZ_LEDGER` (`date`, `kind`, `amt`) | `accounts.ledger` | Live |
| `UZ_STOCK.lines` | `stock.levels` (`product`, `store`, `quantity`) | Live |
| `UZ_STOCK.moves` | `stock.movements` (`date`, `product`, `variant`, `kind.label`, `store`, `change`, `left`, `by`, `ref`) | Live |
| `UZ_STOCK.low` | `UZ_STOCK_FIXED.low` | Fixed |
| Wastage tab rows (`ref`, `item`, `qty`, `reason`, `value`) | `stock.wastage` mapped as `WastageList` does (first item's name, quantity and reason, plus `value`) | Live |
| Prices from Products › All products (`r[2]`, with "From " removed) | `catalog.products[].priceLabel` | Live |
| `UZ_TARGETS` and `tgAchieved` | `sales.targets` plus a new pure `targetAchieved(t, sales, stores)` | Live |

**Decision**: move `useAchieved`'s logic out of `src/features/sales/TargetList.tsx` into a pure
`targetAchieved()` in `src/data/targets.ts`, used by both TargetList and the reports. TargetList's
behaviour doesn't change.

## R3 Periods

**Decision**: export `REPORT_PERIODS` with:

| Period | Dates | Scale factor |
|---|---|---|
| This month | 2026-11-01 to 2026-11-10 | 1 |
| Last month | 2026-10-01 to 2026-10-31 | 4.29/4.82 |
| This year | 2026-01-01 to 2026-11-10 | 38.6/4.82 |

- Dates are ISO, so the "in range" check compares ISO strings directly. The design's display-date
  parsing isn't needed because our records hold ISO dates.
- Subtitle: `"{period} · {date(start)} to {date(end)}"`.
- Point-in-time reports (Customer statements, Balance sheet, Trial balance, Aged receivables, Stock
  valuation, Low stock) have the subtitle "As at 10 Nov 2026". Sales targets has "All targets".
  Neither kind shows the period picker (`asAt: true`).

## R4 Formats

- **`repFmt(n)`**: `(n < 0 ? "−" : "") + num(Math.abs(Math.round(n)))`. This is the design's
  en-KE grouping, which is the same as the project's `num()` grouping for integers.
- **KPI money**: `"KES " + repFmt(n)`.
- **Percentage columns**: one decimal plus "%". "Share of sales" is the design's `toFixed(2) + "%"`.
- **Cells**: numbers are formatted by column. Bold section labels are `{ text, bold }` cells, and
  bold right-aligned subtotal cells are `{ text, bold, right }`.
- **Total row**: every cell bold; the label on the left and numbers on the right.

**Decision**: results keep raw numbers in `rows` and `total` (CSV uses them, rounded to 2
decimals). The view formats them for display.

## R5 Where the open report lives (Design deviation, FR-005)

**Decision**: use the URL search parameters `?report={slug}&period={slug}` on the Reports tab route:

- the report slug is `slugify(name)`, for example `profit-loss` or `returns-refunds`;
- the period slug is `this-month`, `last-month` or `this-year`.

Behaviour:
- Run uses `router.push`, so the browser's back button returns to the cards.
- "All reports" and period changes use `router.replace`.
- An unknown report slug, or a "Coming soon" report, shows the cards.
- The last period chosen is remembered in the `ui` slice (`ui.reportPeriod`) and used as the default
  for the next Run, as the design's `repPeriod` state does.
- Changing tabs drops the query, because tab links have none.

## R6 Card changes

**Decision**:
- Replace the generic `"Run, schedule or export"` text with the design's per-report descriptions
  (`REPORT_DESCRIPTIONS`, 18 entries; "Not available yet" otherwise).
- `ReportCard` gains `runnable: boolean`. It's true when `REPORT_NAMES` includes the title, so
  "Production yield" and "Reorder forecast" are false.
- **Card layout**: a full-height flex column; the description grows; the button sits in a
  right-aligned row. The grid uses `align-items: stretch` so cards in a row share a height.
- **Buttons**: Run is a primary `sm` Button with a right chevron, `aria-label="Run {title}"`.
  Coming soon is a disabled secondary `sm` Button.

The Run button uses a `chevron-right` icon shown before the label (the design's `icon` prop on
`Button`).

## R7 The report view

**Decision**: `src/features/generic/ReportView.tsx`, rendered by `ReportCards` when a valid report
parameter is present:

- **Header row**: flex-wrap; a secondary "All reports" button (chevron-left); the title
  (`type-card-title`) and subtitle (`type-small text-text-muted`) with `flex:1 min-w-[200px]`; the
  period `SearchSelect` (`aria-label` "Period", in a box 160–200px wide) for period reports; a
  secondary "Export CSV" button (download icon).
- **KPIs**: a grid of `repeat(auto-fit, minmax(190px, 1fr))` tiles, each with a surface background,
  border, `radius-lg`, an eyebrow label, a 20px title-weight value in the KPI's colour class, and a
  small note.

  We use `minmax(min(190px,100%),1fr)` so tiles never spill at 320px, as earlier panel grids do.
- **Table**: the existing bare `Table` from `src/components/ui/DataTable.tsx` (the DS DataTable
  without the toolbar) inside a flush `Card`. It is the same component the list screens use, minus
  search, count and paging, which is what the design's report table shows.
  - Columns map to `DataColumn`s with `numeric` set for number and percentage columns.
  - Cells use `render` to show bold labels and subtotals.
  - The total row is appended as a row whose cells all render bold.
  - `minWidth` is 140px per column (at least 480px), so wide reports scroll inside the card on
    phones.
- **Empty state**: a dashed box with the empty message.
- **Note**: small muted text.

## R8 Export

**Decision**: reuse the existing `copyCsv(headers, rows)` from `commands/session.ts`. Its toast is
"Copied {n} rows as CSV.", but this design wants "Copied {title} as CSV.". Add an optional
`message` parameter to `copyCsv`; the existing callers keep their wording.

- Cells are converted with `typeof c === "number" ? Math.round(c × 100) / 100 : plain(c)`.
- Bold and section cells give their text.
- The total row is appended.
- The clipboard-failure toast is the existing "Copy is not available here.".

## R9 Testing

- **Vitest** (`tests/unit/reports.test.ts`), against the seed:
  - Sales summary in three periods (sales 4,820,000, 4,290,000 and 38,600,000; orders 1,100, 979
    and 8,809 per the design's rounding);
  - Profit & loss lines and totals;
  - Trial balance debits equal credits;
  - Customer statements totals equal the receivables total;
  - Aged receivables buckets add up to the total;
  - VAT return direction;
  - the empty message for a period with no credit notes;
  - `repFmt` negatives;
  - every name in `REPORT_NAMES` returns a result with columns, and each "Coming soon" name is not
    runnable.

  Expected figures are worked out during implementation from the design's rules, not invented.
- **Playwright** (`tests/smoke/reports.spec.ts`): quickstart 1–7. Update `generic.spec.ts`'s
  "8 cards that do nothing" test to the new behaviour (Run buttons and Coming soon).
  `responsive.spec.ts`: a report view at 320px, plus the accessibility scan.
