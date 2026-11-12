# Implementation Plan: Office, People and Settings

**Branch**: `005-office-people-settings` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-office-people-settings/spec.md`

## Summary

Bring the remaining eight modules into scope as faithful ports of the canvas:

- **Working screens**:
  - Calendar: month grid and events.
  - File Manager: folders, files, search, upload, move, delete.
  - Profile: details, photo, password.
  - Settings: the business profile with its completion ring, branches, location groups, storage
    locations and terminals.
- **Generic screens**: Reports, Team, Permissions, Messages, and Settings › Staff logins, Taxes,
  Connected apps and Import and export use one shared, data-driven set of list, form and card
  screens with exactly the design's shared behaviour (Clarification Q1).

There are two integrations:
- Branches and storage locations become shared data. Settings feeds the branch pickers elsewhere,
  and storage locations are the Stock › Warehouses records.
- The profile name becomes the app-wide current-user name.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: Next.js 16.4, React 19, Tailwind 4, Zustand 5, lucide-react. Nothing new.
Photo, logo and upload files are read with the browser's FileReader.

**Storage**: in-memory store only. No new storage keys.

**Testing**:
- Vitest: calendar grid and coming-up list, folder subtree and storage totals, business-profile
  completion, terminal slot rules.
- Playwright smoke tests: `calendar.spec.ts`, `files.spec.ts`, `settings.spec.ts`,
  `profile.spec.ts` and `generic.spec.ts`. The role × route and phone-width tests cover the new
  tabs.

**Target Platform / Project Type**: unchanged

**Performance Goals**: every change appears immediately

**Constraints**: design tokens only. The calendar uses its own today, 1 Nov 2026 (Clarification
Q2). Nothing leaves the browser.

**Scale/Scope**: 8 modules, 26 tabs, about 12 forms and dialogs, about 90 seed rows, and 3
touch-points in existing code (branch pickers, the "who" name, the store rules).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ | Behaviour and wording come from the canvas (research R1–R6). The generic screens copy the design's shared behaviour exactly (Q1). Dead controls are documented as deviations. |
| II. Data behind a seam | ✅ | New fixtures (events, docs, settings, generic rows, profiles), types and slices sit behind `@/data`. Pickers stop importing the static `UZ_LOC.branches`. |
| III. Ephemeral in-memory | ✅ | New slices reset on reload. Photos, logos and uploads live only in memory. |
| IV. Tokens & accessibility | ✅ | Event chips use the tone tokens. Storage rings use token colours. Generic screens reuse the shared DataTable and Overlay. |
| V. Component and config-driven | ✅ | The modules set `inScope`. One generic screen set is driven by the registry fixture. Feature folders: `calendar`, `files`, `settings`, `profile`, `generic`. |
| VI. Simplicity & types | ✅ | No new dependencies. Pure helpers for grid, subtree and completion. |

**Gate result**: PASS.

## Project Structure

### Documentation

`specs/005-office-people-settings/` contains plan.md, research.md, data-model.md, quickstart.md,
contracts/ (routes.md, data-access.md), checklists/requirements.md, and tasks.md (from
`/speckit-tasks`).

### Source Code (changes on top of features 001–004)

```text
src/
├── config/modules.ts                 # rep, ppl, perm, cal, comm, docs, prof, set → inScope: true (sup stays out)
├── data/
│   ├── fixtures/calendar.ts, docs.ts, settings.ts, generic.ts   # NEW verbatim ports
│   ├── types/office.ts               # NEW
│   ├── calendar.ts, docs.ts, settings.ts                         # NEW pure helpers
│   ├── store/state.ts, seed.ts       # NEW slices: calendar, docs, settings, profiles, generic
│   ├── commands/calendar.ts, docs.ts, settings.ts, profile.ts, generic.ts   # NEW
│   ├── commands/stock.ts             # CHANGE: store rules (POS, terminal or stock in use)
│   ├── commands/*.ts                 # CHANGE: who() → currentUserName(state)
│   ├── queries-office.ts             # NEW hooks
│   └── index.ts
├── components/shell/AppHeader.tsx    # CHANGE: show useCurrentUserName()
├── features/
│   ├── generic/                      # GenericTable, GenericForm, ReportCards, NewRecordDrawer, RecordDrawer, screens for rep/ppl/perm/comm + 4 settings tabs
│   ├── calendar/                     # MonthGrid, ComingUp, EventDetails, EventForm
│   ├── files/                        # FileManager (rings, toolbar, list/grid, breadcrumbs), FileDrawer, FolderForm, UploadForm, DeleteConfirm
│   ├── settings/                     # BusinessProfile, BranchList, GroupList, StorageList, Terminals, SettingsDialog, StructHelp
│   ├── profile/                      # ProfileScreen (photo, details, password)
│   ├── stock/WarehouseList.tsx, accounts/AccountForm.tsx, expenses/ExpenseForm.tsx   # CHANGE: useBranchNames()
│   └── screens.ts                    # register the eight modules
tests/unit/office.test.ts
tests/smoke/calendar.spec.ts, files.spec.ts, settings.spec.ts, profile.spec.ts, generic.spec.ts
```

**Structure Decision**: one feature folder per working module, plus `generic` for the shared
screens. The data layer is written first, including the integrations, and the UI is built against
it by parallel agents with strict ownership of their folders.

### Build order (input to `/speckit-tasks`)

1. Foundation: types, fixtures, slices, pure helpers with unit tests, registry, hooks, and the
   current-user name and branch-picker integrations.
2. US1 Calendar.
3. US2 File Manager.
4. US3 Settings structure (business profile, branches, groups, storage locations, terminals).
5. US4 Profile.
6. US5 Generic screens.
7. Smoke tests, phone width and accessibility, visual review, gates, commit.

## Complexity Tracking

No violations.
