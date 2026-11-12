# Contract: Run Reports UI and data access

## Routes

| Path | Shows |
|---|---|
| `/reports/{popular,sales,money,stock}` | The tab's cards |
| `…?report=sales-summary` | The Sales summary report, "This month" (or the last period chosen) |
| `…?report=profit-loss&period=this-year` | Profit & loss for "This year" |
| `…?report=production-yield` / `…?report=nope` | The cards (not runnable, or unknown) |

- **Run** uses `router.push`, so the browser's back button returns to the cards. **All reports** and
  period changes use `router.replace`.
- Tab links carry no query, so switching tabs closes the report.

## UI surface

| Element | Accessible name / role | Notes |
|---|---|---|
| Card list | list "Reports" | Unchanged |
| Run | button "Run {report}" | Small, primary, chevron-right |
| Coming soon | button "Coming soon", disabled | Small, secondary |
| Back | button "All reports" | Secondary, chevron-left |
| Title | heading (h2) "{report}" | Subtitle beneath |
| Period | combobox / picker "Period" | Period reports only |
| Export | button "Export CSV" | Secondary, download icon |
| KPI tiles | list "Key figures" | Each item: label, value, note |
| Table | table | Header cells; the total row is bold |
| Empty | text | The report's empty message |
| Note | text | Small, muted |

## Data access (`@/data`)

```ts
REPORT_NAMES, REPORT_PERIODS                // read-only
useReport(name, period): ReportResult       // memoised over a store snapshot
runReport(name, period, src)                // pure (unit tested)
repFmt, formatCell, reportCsv, reportSlug, reportFromSlug, periodSlug, periodFromSlug
setReportPeriod(p)                          // remembers the last period (ui.reportPeriod)
copyCsv(headers, rows, message?)            // gains an optional toast message
targetAchieved(t, sales, stores)            // shared with Sales › Targets
```

## Changes to existing code

- `fixtures/generic.ts`: `REPORT_CARDS` gets the design's descriptions and `runnable`.
- `features/generic/ReportCards.tsx`: equal-height cards with Run or Coming soon; renders
  `ReportView` when `?report` is valid.
- `features/sales/TargetList.tsx`: uses `targetAchieved`. Its behaviour doesn't change.
- `commands/session.ts`: `copyCsv` takes an optional `message`.
- `SearchSelect.tsx`: an optional `ariaLabel` prop (used by the report period picker).
- `tests/smoke/generic.spec.ts`: the "8 cards that do nothing" test becomes "8 cards with Run or
  Coming soon".
