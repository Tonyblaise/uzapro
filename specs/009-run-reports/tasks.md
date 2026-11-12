---

description: "Task list for feature 009: Run Reports"
---

# Tasks: Run Reports

**Input**: Design documents from `specs/009-run-reports/`

**Prerequisites**: plan.md, spec.md, research.md (R1–R9), data-model.md, contracts/ui-and-data.md,
quickstart.md. Builds on features 001–008.

**Tests**: the constitution requires Playwright smoke tests. Vitest covers the 18 report
calculations against the seed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US4 from spec.md

## Reference

- **Canvas source**: `design/canvas/Uzapoint ERP.dc.html` (version 1794508919):
  - the card markup (~lines 851–863);
  - the `isRepView` markup (~870–892);
  - `repFmt` and `repRun` (~3659–3763);
  - the card wiring (~4313–4325).
- Copy every label, description, empty message and note exactly.
- Style with tokens only.

---

## Phase 1: Setup

- [X] T001 Create the branch `009-run-reports` from `main` (`git checkout -b 009-run-reports`), and confirm `npm run typecheck && npm run lint && npm run test:unit` pass.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 [P] Add the types `ReportPeriod`, `ReportColumn`, `ReportCell`, `ReportKpi` and `ReportResult` (data-model.md) to `src/data/types/office.ts`, and add `runnable: boolean` to `ReportCard`.
- [X] T003 [P] Create `src/data/fixtures/reports.ts` with:
  - `REPORT_NAMES`: the 18 names, in the design's `case` order;
  - `REPORT_DESCRIPTIONS`: copied exactly from the design's `desc` map;
  - `REPORT_PERIODS`: the date ranges and scale factors from research R3;
  - `REPORT_FIXED`: the constants from data-model.md;
  - `REPORT_DEFAULT_NOTE` and `REPORT_DEFAULT_EMPTY`.
- [X] T004 [P] Create `src/data/targets.ts` with the pure `targetAchieved(t, sales, stores)`, moved from `useAchieved` in `src/features/sales/TargetList.tsx`. Change TargetList to call it (memoised), with no change in behaviour.
- [X] T005 Update `REPORT_CARDS` in `src/data/fixtures/generic.ts` so each card's `desc` comes from `REPORT_DESCRIPTIONS[title] ?? "Not available yet"` and `runnable` is `REPORT_NAMES.includes(title)`. Remove the "Clicking a card does nothing" comment.
- [X] T006 Add `reportPeriod: ReportPeriod` to `UiState` in `src/data/store/state.ts` (seed: "This month"). Create `src/data/commands/reports.ts` with `setReportPeriod`. Add an optional third parameter, `message`, to `copyCsv` in `src/data/commands/session.ts`; existing callers are unchanged.
- [X] T007 Create `src/data/reports.ts` with:
  - `repFmt` and `formatCell` (research R4);
  - `reportSlug`, `reportFromSlug`, `periodSlug` and `periodFromSlug` (research R5);
  - `ReportSource` and `runReport(name, period, src)` implementing all 18 reports one for one from `repRun`, using the source mapping in research R2. Where the design calls `docDate`, use `date()` from `@/lib/format`;
  - `reportCsv(result)` (research R8);
  - `useReport(name, period)` in `src/data/queries-office.ts`, which builds `ReportSource` from `useAppStore` selectors and memoises `runReport`. `reports.ts` stays hook-free.

  Export everything from `src/data/index.ts`.
- [X] T008 Create `tests/unit/reports.test.ts`, run against `createSeed()`:
  - **Sales summary** in all three periods: sales 4,820,000, 4,290,000 and 38,600,000; orders 1,100, 979 and 8,809; three channel rows; total "Total".
  - **Profit & loss**: COGS is 58%; the lines run Income, Sales, Cost of goods sold, Gross profit, Expenses, the categories, Total expenses; total "Net profit"; net = gross − expenses.
  - **Trial balance**: debits equal credits.
  - **Balance sheet**: assets − liabilities = equity.
  - **Customer statements**: total owed equals the sum of receivable balances.
  - **Aged receivables**: the bucket sums equal the total column.
  - **VAT return**: the total label matches the direction (pay or carry forward).
  - **Returns & refunds**: "No refunds in this period." and a null total when there are no credit notes in range.
  - **Stock valuation**: only lines with quantity above 0.
  - **Low stock**: Need restocking 3, Out of stock 2.
  - **Formatting**: `repFmt(-2795600)` is "−2,795,600".
  - **Percentages**: Sales summary "Share" cells show one decimal plus "%"; Returns & refunds "Share of sales" shows two decimals.
  - **KPI colours**: Sales summary "Total sales" is green and "Refunds" is danger; a negative Net profit is danger.
  - **Coverage**: every `REPORT_NAMES` entry returns columns and no `missing`; "Production yield" returns `missing`.
  - **Slugs**: they round-trip.

**Checkpoint**: unit tests, typecheck and lint pass. Sales › Targets is unchanged (its smoke tests pass).

---

## Phase 3: User Story 1 - Run a report from its card (Priority: P1) 🎯 MVP

**Goal**: Run opens the report view; "All reports" and the browser's back button return to the cards.

**Independent Test**: quickstart 1–3.

- [X] T009 [US1] Update `src/features/generic/ReportCards.tsx`:
  - **cards**: equal height (the `li` and `Card` stretch; the inner column is `h-full`; the description takes the remaining space); a right-aligned footer holding either a primary `sm` "Run" Button (chevron-right, `aria-label="Run {title}"`) or a disabled secondary `sm` "Coming soon" Button;
  - **Run**: calls `router.push(?report={slug}&period={slug of ui.reportPeriod})`;
  - **view switch**: reads `report` from the URL with `useSearchParams` and, when `reportFromSlug` gives a runnable name, renders `<ReportView name period />` instead of the list. `NewRecordDrawer` stays.
- [X] T010 [US1] Create `src/features/generic/ReportView.tsx` (research R7):
  - **header row** (`flex-wrap`): a secondary "All reports" button (chevron-left) that calls `router.replace(pathname)`; the title as an h2 (`type-card-title`) with the subtitle beneath (`type-small text-text-muted`); the Export CSV button, a placeholder until US4;
  - **KPIs**: a list labelled "Key figures" in a `repeat(auto-fit, minmax(min(190px,100%),1fr))` grid, each tile with an eyebrow label, a 20px tabular value in its tone class, and a small note;
  - **table**: the bare `Table` in a flush `Card`. Columns come from `cols` (`numeric` for `num` and `pct`), cells from `formatCell`, bold cells through `render`, and the total row is all bold. `minWidth` is `max(480, 140 × columns)`;
  - **empty state**: a dashed box with `result.empty ?? REPORT_DEFAULT_EMPTY`;
  - **note**: `result.note ?? REPORT_DEFAULT_NOTE`.
- [X] T011 [US1] Create `tests/smoke/reports.spec.ts` with quickstart 1–3:
  - the Popular cards' descriptions, 7 Run buttons and a disabled "Coming soon" on Production yield;
  - Run Sales summary: the heading, subtitle, 4 KPI labels, 3 channel rows and the bold Total row;
  - the URL contains `report=sales-summary`;
  - "All reports" returns to the cards;
  - the browser's back button returns to the cards; a reload while the report is open keeps it;
  - `?report=nope` and `?report=production-yield` both show the cards;
  - on Reports › Popular, every card in the first row has the same height.

  Also update the "8 cards that do nothing" test in `tests/smoke/generic.spec.ts` to check for Run and Coming soon instead.

**Checkpoint**: US1 works for every report at "This month".

---

## Phase 4: User Story 2 - Change the period (Priority: P1)

**Goal**: the period picker re-runs the report; point-in-time reports have none.

**Independent Test**: quickstart 4.

- [X] T012 [US2] First, add an optional `ariaLabel` prop to `src/components/ui/SearchSelect.tsx`, used as the trigger's accessible name when there is no `label`; existing callers are unchanged. Then, in `src/features/generic/ReportView.tsx`, add the period `SearchSelect` (`label` hidden, accessible name "Period", in a 160–200px box) for reports where `asAt` is false. Changing it calls `setReportPeriod` and `router.replace(?report&period)`. `ReportCards` reads `period` from the URL with `periodFromSlug`.
- [X] T013 [US2] Extend `tests/smoke/reports.spec.ts` with quickstart 4:
  - Profit & loss for "This year": the subtitle and "KES 38,600,000";
  - Balance sheet has no "Period" control and reads "As at 10 Nov 2026";
  - Run then remembers the last period chosen.

---

## Phase 5: User Story 3 - Reports reflect demo changes (Priority: P2)

**Goal**: live figures follow what the presenter recorded.

**Independent Test**: quickstart 5–6.

- [X] T014 [US3] Check that `useReport` updates when the selected slices change, without a reload, and that all 18 reports render with no console errors. Done when all 18 reports render on every tab with no console errors, and each report's figures match the unit expectations in T008. Fix any mapping gaps against research R2, such as wastage item names, variant labels or "From " prices.
- [X] T015 [US3] Extend `tests/smoke/reports.spec.ts` with quickstart 5–6:
  - run every card on Sales, Money and Stock, checking each heading and that it shows either a table or its empty message;
  - "Reorder forecast" shows "Coming soon";
  - pay RCV-0011 (KES 1,026). Then:
    - Customer statements "Total owed" drops by KES 1,026;
    - Aged receivables "Total owed" drops by KES 1,026;
    - Cash flow "Money in" rises by KES 1,026.
  - record a KES 2,000 Transport expense. Then:
    - Profit & loss shows a Transport line, and "Expenses" has risen by KES 2,000;
    - VAT return "VAT you can claim" has not dropped (the expense's tax is added).
  - raise a credit note on a sale dated this month. Returns & refunds lists it, and "Credit notes" goes up by 1.

---

## Phase 6: User Story 4 - Export a report (Priority: P3)

**Goal**: Export CSV copies the report and confirms it.

**Independent Test**: quickstart 7.

- [X] T016 [US4] Wire "Export CSV" in `ReportView.tsx` to `copyCsv(headers, rows, "Copied {title} as CSV.")`, using `reportCsv(result)`.
- [X] T017 [US4] Extend `tests/smoke/reports.spec.ts` with quickstart 7. Grant `clipboard-read` and `clipboard-write`, export Sales summary, and check:
  - the toast "Copied Sales summary as CSV.";
  - the clipboard text has 5 lines (header, 3 rows, total), and its first line is `"Channel","Orders","Sales (KES)","Average order (KES)","Share"`.

---

## Phase 7: Polish & Cross-Cutting

- [X] T018 [P] In `tests/smoke/responsive.spec.ts`, open Aged receivables and Low stock at 320px, check there is no sideways page scrolling, and run the axe scan on the report view (no serious or critical issues). Add `?report=` variants of the Money and Stock routes to the scratchpad `mobile/routes.json`, then run the mobile audit with 0 issues.
- [X] T019 Do a visual review against the canvas at 1440px and 375px: the cards, and a period report and a point-in-time report (Principle I). Record any accepted differences in `specs/009-run-reports/spec.md` › Design deviations.
- [X] T020 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`), walk through quickstart 1–9, mark the tasks done, and commit on `009-run-reports`.

---

## Dependencies & Execution Order

- Setup (T001) → Foundational (T002–T008) → US1 (T009–T011) → US2 (T012–T013) → US3 (T014–T015)
  → US4 (T016–T017) → Polish (T018–T020).
- Within Foundational:
  - T002, T003 and T004 run in parallel;
  - T005 needs T002 and T003; T006 needs T002; T007 needs T002–T006; T008 needs T007.
- US2, US3 and US4 all edit `ReportView.tsx` and `reports.spec.ts`, so they run in sequence after US1.

### Parallel opportunities

- T002, T003 and T004 (separate files).
- T018 alongside T019.

## Implementation Strategy

1. **MVP**: Phases 1–3. The cards run all 18 reports at "This month", with back navigation.
2. Add the period picker (US2), check the live figures (US3), then add Export (US4).
3. Polish: phones, the accessibility scan and the audit; the visual review; every gate; the commit.
