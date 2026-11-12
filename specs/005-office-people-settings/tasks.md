---

description: "Task list for feature 005: Office, People and Settings"
---

# Tasks: Office, People and Settings

**Input**: Design documents from `specs/005-office-people-settings/`

**Prerequisites**: plan.md, spec.md (with Clarifications), research.md, data-model.md,
contracts/routes.md, contracts/data-access.md, quickstart.md. Builds on features 001–004.

**Tests**: the constitution requires Playwright smoke tests, so each story ends with one. Vitest
covers the pure helpers. The role × route and phone-width tests cover the new tabs.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 from spec.md

## How to read the design

Use the same method as feature 001 (`specs/001-dashboard-sales-stock/tasks.md` › "How to read
the design"). The relevant names in `design/canvas/Uzapoint ERP.dc.html` are:

- **Calendar**: `isCal`, `calData`, `calView`, `calFormOpen`, `calStore` (about lines 3185–3248); the
  drawer wiring (lines 3967–3998 and 5608–5613); the markup (lines 166–211, 1469–1489, 1617–1643).
- **File Manager**: `docsData`, `docsView`, `docsDrawer`, `docEdit*`, `docRemove`, `docSubtree`
  (lines 3251–3417 and 3960–4050); the markup (lines 1154–1208, 1545–1615, 2745–2775).
- **Settings**:
  - `isBizProfile` and `bp` (markup 1014–1057, logic around 4829);
  - `terminals` (markup 1059–1102, logic around 4845);
  - `setOpen` (line 2977) and the `setModal` definitions (around 4864–4976);
  - `structHelp` (line 763);
  - the Branches, Storage locations and Location groups row actions.
- **Profile**: `isProfile` (markup 1104–1152, logic around 4987–5004).
- **Generic screens**: `isTable` (markup 761–824), `isForm` (826–840), `isCards` (842–858), the
  `create` drawer (2776–2786), the `record` drawer (1517–1543), `rowConfirm` (1810–1817), and the
  row-action fallback (around line 3849).
- **Header actions**: `headerActions`, around line 4059.

The data is in `design/canvas/erp-data.js`: `UZ_MODS` rows for rep, ppl, perm, comm and set;
`UZ_EVENTS`, `UZ_DOCS`, `UZ_BIZ`, `UZ_GROUPS`, `UZ_BRANCHES`, `UZ_LOCPOS`, `UZ_TERMS`, `UZ_LOC`
and `UZ_ROLES`. Copy all strings exactly.

---

## Phase 1: Setup

- [X] T001 Create the branch `005-office-people-settings` from `004-accounts-expenses` (`git checkout -b`), and confirm `npm run typecheck && npm run lint && npm run test:unit` pass

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: complete this phase before any user story.

- [X] T002 [P] Create `src/data/types/office.ts` with these types, and export it from `src/data/types/index.ts`:
  - CalEvent
  - Folder, DocFile
  - BusinessProfile, Group, Branch, Terminal, TerminalSlots
  - Profile
  - GenericRow, GenericForm, ReportCard
  - the input types
- [X] T003 [P] Create the fixtures. All are verbatim:
  - `src/data/fixtures/calendar.ts`: `UZ_EVENTS`
  - `src/data/fixtures/docs.ts`: `UZ_DOCS` folders and files
  - `src/data/fixtures/settings.ts`: `UZ_BIZ`, `UZ_GROUPS`, `UZ_BRANCHES`, `UZ_LOCPOS`, `UZ_TERMS`, plus the profile defaults (cities list) from the design's `_profiles` seed
  - `src/data/fixtures/generic.ts`: the `UZ_MODS` rows, form fields and report card items for rep, ppl, perm, comm and the set tabs Staff logins, Taxes, Connected apps, Import and export
- [X] T004 [P] Create pure helpers, and add `tests/unit/office.test.ts`:
  - `src/data/calendar.ts`: `monthGrid`, `comingUp`, `visibleEvents`, `CAL_TODAY = "2026-11-01"`
  - `src/data/docs.ts`: `fileKind`, `subtree`, `folderPath`, `storageTotals`, `keepExtension`
  - `src/data/settings.ts`: `bizCompletion` (10 required keys), `slotsFree`, `groupAncestors`

  The tests cover: the November 2026 grid starting Monday 26 Oct, coming-up from 1 Nov, Accounts events hidden for the cashier, the subtree of `legal`, `keepExtension("x.pdf","y")`, `bizCompletion(seed)` returning 2 missing, and slot rules.
- [X] T005 Add the `calendar`, `docs`, `settings`, `profiles` and `generic` slices to `src/data/store/state.ts` and seed them in `src/data/store/seed.ts`
- [X] T006 Add the selectors `currentUserName(state)` and `currentUserFirst(state)`, both read from `profiles`.
  - Replace every command's `who()` (`ROLES[role].name`) with `currentUserName` in `src/data/commands/*.ts`. Use `currentUserFirst` in the login message in `src/data/commands/session.ts`.
  - Add `useCurrentUserName()` and `useCurrentUserFirst()`. Use them in `src/components/shell/AppHeader.tsx` and in the dashboard greeting ("Welcome back, {first}") in `src/features/dashboard/`.
- [X] T007 Add `useBranchNames()` (from `settings.branches`) and `addBranchQuick(name)` (the design's `setSync`: next `BBL-BRN-00n` code, the first group, all other fields empty) in `src/data/commands/settings.ts`. Replace `UZ_LOC.branches` with `useBranchNames()` in:
  - `src/features/stock/WarehouseList.tsx`, whose inline "new branch" now calls `addBranchQuick`
  - `src/features/accounts/AccountForm.tsx`
  - `src/features/expenses/ExpenseForm.tsx`
- [X] T008 Set `inScope: true` for rep, ppl, perm, cal, comm, docs, prof and set in `src/config/modules.ts`, with column definitions for the table tabs; Help stays out of scope. Create empty `screens.tsx` files in `src/features/{generic,calendar,files,settings,profile}/` and register them in `src/features/screens.ts`.
- [X] T009 Create `src/data/queries-office.ts` with the hooks in contracts/data-access.md, and export it from `src/data/index.ts`

**Checkpoint**: all eight modules render their header and tabs, the header still shows "Tony Ashiuma", and the existing smoke tests pass.

---

## Phase 3: User Story 1 - Plan the business calendar (Priority: P1) 🎯 MVP

**Independent Test**: quickstart 1–3.

- [X] T010 [US1] Create `src/data/commands/calendar.ts`:
  - `saveEvent(input, id?)`: blocked without a title or start date; adds a custom type; message "Event saved."
  - `deleteEvent(id)`: message "{title} deleted."
- [X] T011 [US1] Create the calendar UI:
  - `src/features/calendar/CalendarScreen.tsx`: header with Previous/Next month, "Today" and the title; Monday-first grid with today dot, tone chips and an "Add an event" click on empty days; "Coming up" list
  - `EventDetails.tsx`: the details modal with Delete and Edit
  - `EventForm.tsx`: the drawer "New event" / "Edit event"
  - the delete confirmation
  - the header action "New event"; URL params per contracts/routes.md
- [X] T012 [US1] Write `tests/smoke/calendar.spec.ts` covering quickstart 1–3, including the Cashier view

---

## Phase 4: User Story 2 - Manage company files (Priority: P1)

**Independent Test**: quickstart 4–6.

- [X] T013 [US2] Create `src/data/commands/docs.ts` with these commands (owner = current user; design messages and blocking rules):
  - `createFolder(name, parent)`: the new folder inherits its parent's access
  - `uploadFile({ name, size, folder, notes })`: stores no file content
  - `renameDoc(kind, id, name, notes)`: keeps the extension
  - `moveFile(id, folder)`
  - `deleteDoc(kind, id)`: deletes the subtree; returns the parent when the open folder was inside it
  - `toggleStar(id)`
- [X] T014 [US2] Create the File Manager UI:
  - `src/features/files/FileManager.tsx`:
    - the storage rings in token colours;
    - the toolbar: type filter, sort and search;
    - the list or grid toggle, and breadcrumbs from `?dir=`;
    - the DataTable list and grid cards with star and row actions;
    - the empty states
  - `FileDrawer.tsx`: details, the Folder move select, and Download (message only)
  - `FolderForm.tsx`, `UploadForm.tsx`: file chosen with FileReader for size only
  - `EditDocForm.tsx`, `DeleteDocConfirm.tsx`
  - the header actions "New folder" and "Upload"
- [X] T015 [US2] Write `tests/smoke/files.spec.ts` covering quickstart 4–6

---

## Phase 5: User Story 3 - Set up the business structure (Priority: P1)

**Independent Test**: quickstart 7–10.

- [X] T016 [US3] Create `src/data/commands/settings.ts`. All commands use the design's `setModal` validation and messages, including the "{name} created." / "{name} saved." suffixes for a store and a terminal.
  - `saveBusinessProfile(patch)`, `setLogo(dataUrl)`
  - `saveBranch(input, edit?)`: optionally creates a store and a terminal; renaming cascades to stores and terminals
  - `setHeadquarters`, `deleteBranch`
  - `saveGroup(input, edit?)`: optionally creates a branch, store and terminal; excludes cycles
  - `deleteGroup`
  - `saveStorageLocation(input, edit?)`, `setPos`, `deleteStorageLocation`: reuse or extend `saveStore`/`deleteStore` in `src/data/commands/stock.ts`; blocked while the store holds stock or a terminal
  - `saveTerminal(input, edit?)` (Pay and activate, or Add as inactive), `setTerminalActive`, `deleteTerminal`, `addPaidSlot`
  - New groups, branches and terminals get the next code `BBL-GRP-`, `BBL-BRN-` or `BBL-TRM-` plus 3 digits (design `setCode`: the highest existing number + 1).
  - A store created from the branch or group dialog is named "{branch} Store", gets type "Retail" when POS is ticked and "Store" otherwise, and has its POS flag set (design `setStoreAdd`).
- [X] T017 [P] [US3] Create `src/features/settings/BusinessProfile.tsx`:
  - the logo with "Change logo" (FileReader, type and size checks);
  - the completion ring, "+ {detail}" chips and "+{n} more";
  - the Contact, Location, Registration and "How you sell" cards, each with Edit;
  - the section and full edit modals
- [X] T018 [P] [US3] Create these files in `src/features/settings/`:
  - `BranchList.tsx`, `GroupList.tsx` and `StorageList.tsx`, each with the design's columns, row actions and disabled rules
  - `SettingsDialog.tsx`: the shared add/edit modal per kind, with cascading checkboxes
  - `StructHelp.tsx`: the explainer strip above the three tabs
  - the header actions "Add branch", "Add group" and "Add storage location"
- [X] T019 [P] [US3] Create `src/features/settings/Terminals.tsx`:
  - the slot summary bar and stats;
  - "Add a paid slot";
  - search, the All/Active/Inactive filter and the terminal cards with Edit, Activate/Deactivate and Delete;
  - the terminal dialog with the slot-full choices and the "No POS locations here" note;
  - the header action "Add terminal"
- [X] T020 [US3] Register the five Settings tabs in `src/features/settings/screens.tsx`, and write `tests/smoke/settings.spec.ts` covering quickstart 7–10 (including the new store in Stock › Warehouses and the new branch in the account and expense pickers)

---

## Phase 6: User Story 4 - Keep my profile up to date (Priority: P2)

**Independent Test**: quickstart 11.

- [X] T021 [US4] Create `src/data/commands/profile.ts`:
  - `saveProfile(patch)`: message "Profile saved."; validates email and first name
  - `setPhoto(dataUrl | "")`: messages "Photo updated." / "Photo removed."
  - `changePassword(current, next)`: checks the rules; stores nothing
- [X] T022 [US4] Create `src/features/profile/ProfileScreen.tsx`:
  - the photo card (FileReader, JPG/PNG up to 2 MB, Remove);
  - personal info and address, with Undo and Save available only when something has changed;
  - Change password, with the 5 rule chips, "Show passwords" and the mismatch text
- [X] T023 [US4] Write `tests/smoke/profile.spec.ts` covering quickstart 11: the header name updates, the password rules gate saving, and the dashboard greeting reads "Welcome back, Anthony Ashiuma"

---

## Phase 7: User Story 5 - Browse reports, team, permissions, messages and other settings (Priority: P2)

**Independent Test**: quickstart 12.

- [X] T024 [US5] Create `src/data/commands/generic.ts`: `deleteGenericRow(moduleId, tab, key)`, with the message "{name} deleted."
- [X] T025 [US5] Create the generic screens in `src/features/generic/`:
  - `GenericTable.tsx`: DataTable search, "Showing N of M", Export CSV, a View drawer for each row, and Delete for the Owner only with confirmation
  - `RecordDrawer.tsx`: the Overview list, with Edit, Duplicate and Print disabled
  - `GenericForm.tsx`: Save shows "Changes saved."; Cancel resets the form
  - `ReportCards.tsx`: "Run, schedule or export"; not clickable
  - `NewRecordDrawer.tsx`: Name, Status (with add-new) and Notes; Create shows "Record created."
  - `screens.tsx`: registers rep (6 tabs), ppl, perm, comm (5 tabs) and the four Settings tabs, and every generic tab gets the "New" header action (the design's last fallback), including the report card tabs, "Build a report", "Send message" and "Import and export"
- [X] T026 [US5] Write `tests/smoke/generic.spec.ts` covering quickstart 12, including that the Accountant has no Delete

---

## Phase 8: Polish & Cross-Cutting

- [X] T027 [P] Extend `tests/smoke/navigation.spec.ts` (the role × route test) to quickstart 13. Add `/calendar/calendar`, `/file-manager/all-documents`, `/settings/business-profile`, `/settings/terminals`, `/profile/profile` and `/reports/popular` to `tests/smoke/responsive.spec.ts`, and run the accessibility scan over the new forms.
- [X] T028 Do a visual fidelity review against the canvas for every new tab and dialog, and log accepted differences in spec › Design deviations (the disabled record-drawer buttons, Cancel resetting the form, and anything else)
- [X] T029 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`), walk through quickstart 1–13, and commit on `005-office-people-settings`

---

## Dependencies & Execution Order

- Setup → Foundational (T002–T009) → stories.
- **US1**, **US2**, **US4** and **US5** depend only on Foundational and are independent of each
  other.
- **US3** depends on Foundational and on the store rules in `commands/stock.ts`, which its own
  T016 changes. Its pickers check uses T007.
- The data-layer tasks (T010, T013, T016, T021, T024) are best done by one person in order. The UI
  tasks can then run in parallel by feature folder.

### Parallel opportunities

- T002–T004.
- After the data layer: the UI for US1 (T011), US2 (T014), US3 (T017–T019), US4 (T022) and US5
  (T025) all live in separate folders and can run at the same time.
- Within US3: T017, T018 and T019.

## Implementation Strategy

1. **MVP**: Phases 1–3 (Calendar).
2. Add US2 (File Manager) and US3 (Settings structure), the other P1 stories.
3. Add US4 (Profile) and US5 (generic screens), then polish, run every gate and commit.

## Notes

- Copy all wording from the design. Invent no behaviour beyond it (Clarification Q1).
- Calendar today is 1 Nov 2026 (Clarification Q2).
- Photos, logos and uploads stay in memory only. Nothing is sent anywhere.
