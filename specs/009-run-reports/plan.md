# Implementation Plan: Run Reports

**Branch**: `009-run-reports` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-run-reports/spec.md`

## Summary

Make the Reports cards runnable, as the updated canvas does.

- **Cards**: each card on Popular, Sales, Money and Stock gets the design's description and a
  **Run** button. "Production yield" and "Reorder forecast" show a disabled **Coming soon** button.
- **Report view**: Run replaces the cards. It has "All reports", the title and subtitle, a period
  picker (period reports only), Export CSV, KPI tiles, a table with a bold total row, an empty
  state, and a note.
- **18 reports**: ported one for one from the design's `repRun`. Design-fixed figures are scaled by
  the period, and live figures come from the in-memory store.

Technical approach:
- a pure `runReport(name, period, src)` in `src/data/reports.ts`, unit tested against the seed;
- a memoised `useReport` hook that builds the store snapshot;
- a `ReportView` component rendered by `ReportCards` when `?report=` is valid (the recorded
  deviation, FR-005);
- `copyCsv` reused, with an optional toast message;
- Sales › Targets' "achieved" logic moved into a shared pure helper.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: unchanged (Next.js 16, React, Zustand, Tailwind 4, lucide-react). There
are no new packages.

**Storage**: none new. `ui.reportPeriod` remembers the last period chosen in the session. The open
report lives in the URL.

**Testing**:
- Vitest: `tests/unit/reports.test.ts` covers all 18 reports against the seed, plus the
  period-scaling and balance checks.
- Playwright: `tests/smoke/reports.spec.ts` covers quickstart 1–8. `generic.spec.ts` is updated, and
  `responsive.spec.ts` gets a report view at 320px with the accessibility scan.

**Target Platform / Project Type**: unchanged (a static-export web app on the Cloudflare Worker)

**Performance Goals**: reports appear instantly when run or when the period changes. The largest
input is about 100 ledger and movement rows.

**Constraints**:
- Design tokens only. The KPI colours map to `text-green-700`, `text-danger-text`, `text-info-text`
  and `text-warning-text`.
- No network calls.
- Accessible buttons, picker and table.
- No sideways page scrolling from 320px up.

**Scale/Scope**:
- 4 card tabs, 25 cards (18 runnable report names, some on several tabs, and 2 coming soon);
- 1 report view;
- 3 periods.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ with one recorded deviation | The cards, the view and all 18 reports follow canvas version 1794508919 (`repRun`, `repFmt`, the `isRepView` markup). The one deviation, keeping the report in the URL, is logged in spec › Design deviations. Feature 005's "cards do nothing" decision is superseded by the canvas itself. |
| II. Data behind a seam | ✅ | Fixed design figures come from existing fixtures (`UZ_SALES`, `UZ_HOME`, `UZ_STOCK_FIXED`) and a new `fixtures/reports.ts` holding the design's constants verbatim. The UI reads only `@/data` (`useReport`). |
| III. Ephemeral in-memory | ✅ | Reports are worked out from the live store and reset on reload. The only new state is `ui.reportPeriod`, held in memory. |
| IV. Tokens & accessibility | ✅ | Token classes; real buttons with "Run {report}" names; the labelled "Period" picker; a table with header cells; no exclamation marks in the new copy. |
| V. Component and config-driven | ✅ | The existing `Card`, `Button`, `Table`, `SearchSelect`; the card registry `REPORT_CARDS`; the cards screen kind. |
| VI. Simplicity & types | ✅ | No new dependencies. A typed `ReportResult` and `ReportCell` union. `targetAchieved` is shared instead of duplicated. |

**Gate result**: PASS.

**Post-design re-check**: PASS. There are no new dependencies, no network access and no storage.

## Project Structure

### Documentation

`specs/009-run-reports/` contains plan.md, research.md, data-model.md, quickstart.md,
contracts/ui-and-data.md, checklists/requirements.md, and tasks.md (from `/speckit-tasks`).

### Source Code (changes on top of features 001–008)

```text
src/
├── data/
│   ├── types/office.ts             # ReportPeriod, ReportColumn, ReportCell, ReportKpi, ReportResult;
│   │                               #   ReportCard gains `runnable`
│   ├── fixtures/reports.ts         # NEW: names, descriptions, periods, fixed figures, default copy
│   ├── fixtures/generic.ts         # REPORT_CARDS: design descriptions + runnable
│   ├── reports.ts                  # NEW: runReport (18 cases), repFmt, formatCell, reportCsv,
│   │                               #   slugs (pure, no hooks)
│   ├── queries-office.ts           # useReport (memoised store snapshot → runReport)
│   ├── targets.ts                  # NEW: targetAchieved (moved from TargetList)
│   ├── commands/session.ts         # copyCsv(headers, rows, message?)
│   ├── commands/reports.ts         # NEW: setReportPeriod
│   ├── store/state.ts, seed.ts     # ui.reportPeriod
│   └── index.ts                    # exports
├── features/
│   ├── generic/ReportCards.tsx     # equal-height cards, Run / Coming soon, ?report → ReportView
│   ├── generic/ReportView.tsx      # NEW: header, KPIs, table, empty state, note, export
│   └── sales/TargetList.tsx        # uses targetAchieved
tests/
├── unit/reports.test.ts            # NEW
└── smoke/reports.spec.ts           # NEW; generic.spec.ts and responsive.spec.ts updated
```

**Structure Decision**: follows the existing pattern: pure data-layer logic behind `@/data`, and UI
in the generic feature folder that already owns the report cards.

## Complexity Tracking

None. There are no constitution violations to justify.
