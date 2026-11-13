# Tasks: Modular role permissions

**Input**: Design documents in `specs/011-modular-permissions/`: plan.md, spec.md, research.md,
data-model.md, contracts/data-access.md, contracts/ui.md and quickstart.md.

**Tests**: included. The plan names `tests/unit/permissions.test.ts`,
`tests/smoke/permissions.spec.ts` and new `responsive.spec.ts` rows. Every earlier feature shipped
with unit and smoke coverage.

**Organization**: tasks are grouped by user story (spec US1–US4), so each story can be built and
tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: US1 is the role cards, US2 Edit role, US3 enforcement and US4 role add, rename,
  duplicate and delete.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: tokens, icons and types that every story uses.

- [X] T001 [P] Add the role tile colour tokens `--role-1` … `--role-6` and `--role-ink` to `src/styles/tokens.css` (research R7):
  - use values from the existing primary, warning, danger, purple, success and info scales;
  - add a one-line comment;
  - check that the white icon has at least 3:1 contrast on each.
- [X] T002 [P] Register the `folder-lock` and `user-cog` icons (lucide `FolderLock` and `UserCog`) in `src/components/ui/Icon.tsx`, if they aren't already there.
- [X] T003 [P] Create `src/data/types/permissions.ts` with `AccessLevel`, `RoleDef`, `RoleAccess` and `PermissionsState` (data-model.md), and re-export it from `src/data/types/index.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the permissions slice, the pure helpers and the effective role. Every story reads
these.

**⚠️ CRITICAL**: no story work can start until this phase is complete.

- [X] T004 Create `src/data/fixtures/permissions.ts` with the 4 built-in roles (research R2 and R8):
  - `ROLE_DEFS`:

    | Key | Name | Colour | Users | People |
    |---|---|---|---|---|
    | owner | Owner / Admin | 1 | 1 | Tony Blaise |
    | accountant | Accountant | 2 | 2 | Mary Achieng |
    | cashier | Cashier | 3 | 4 | Jane Smith |
    | store | Store keeper | 4 | 3 | Grant Jensen |

  - `SEED_WRITE`: the per-role list of Write modules;
  - `LOCKED_READ = ["home","prof"]`.

  Add a header comment citing the canvas Permissions table and `ppl/team`.
- [X] T005 Create the pure helpers in `src/data/permissions.ts`, per contracts/data-access.md:
  - `ACCESS_LEVELS`, `rank`, `has`, `pickLevel`, `lockedRow`;
  - `seedAccess(roleId)`: Delete everywhere for the owner. For others, Read on every module in `ROLES[id].mods` plus `prof`, raised to Write for `SEED_WRITE`. Everything else is none.
  - `effectiveRole(state, roleId)`: the owner keeps `mods` undefined; other roles get `mods` = modules at Read or above; `tabs` stays as is;
  - `moduleSummary`, `initials`, `rowActionNeed` (with the label classes from research R4) and `validateRoleName`.
- [X] T006 Add the `permissions: PermissionsState` slice to `AppState` in `src/data/store/state.ts`, and `seedPermissions()` in `src/data/store/seed.ts`:
  - roles from `ROLE_DEFS`;
  - access from `seedAccess` for each built-in role;
  - `nextCustom: 1`.
- [X] T007 Switch the read side to the effective role:
  - in `src/data/queries.ts`, `useSession().role` and `useRole()` return `effectiveRole(state, id)`, memoised on `session.role` and `permissions.access[id]`;
  - in `src/data/commands/uzaai.ts` (line ~93) and `src/data/commands/generic.ts` (line ~16), replace `ROLES[...]` with `effectiveRole(s, …)`;
  - change `canSeeMoneyEvents` and `visibleEvents` in `src/data/calendar.ts` to take the effective `Role`, and update their callers.
- [X] T008 Add the access context and hooks to `src/data/queries.ts`, exported from `@/data`:
  - `AccessContext` (default `{ module: undefined, level: "delete" }`);
  - `useAccess()`;
  - `useCan(need, moduleId?)`;
  - `useRoleCards()`, `useRoleAccess(key)` and `useModuleGroups()`, in sidebar section order from `MODULES`.
- [X] T009 [P] Write `tests/unit/permissions.test.ts` for the foundation:
  - **Parity (SC-002)**: for each of the 4 roles, `visibleModules(effectiveRole(seed))` equals `visibleModules(ROLES[id])` plus Profile, and `visibleTabs` is unchanged for every module.
  - **Levels**: `pickLevel` (same level clears to none), `has` ordering, and `lockedRow` for the owner, home and prof.
  - **Row actions**: `rowActionNeed` for View, Download PDF, Edit, Approve, Void sale, Cancel transfer, Undo, Write off and an unknown label (expected: write).
  - **Names**: `validateRoleName` messages.
  - **Summaries**: `moduleSummary` gives 21, 15, 8 and 9 open modules.
- [X] T010 Run `npm run typecheck && npm run test:unit && npx playwright test tests/smoke/navigation.spec.ts` to confirm nothing regressed before any UI work.

**Checkpoint**: the app behaves exactly as before, with Profile now reachable for every role, and
access comes from the store.

---

## Phase 3: User Story 1 - See every role at a glance (Priority: P1) 🎯 MVP

**Goal**: People › Permissions shows the role-card grid in place of the static table.

**Independent Test**: open `/permissions/permissions` as the owner. Four cards show, with the
names, "Total N users", avatar stacks with "+N", "Can open X of 21 modules", and 4, 3, 2 and 1
columns at 1440, 1024, 768 and 375px.

### Tests for User Story 1

- [X] T011 [P] [US1] Create `tests/smoke/permissions.spec.ts` with the test "four role cards with users, avatars and module summaries" (quickstart 1). Check:
  - card order;
  - "Total 1 user" (singular) and "Total 4 users";
  - "JS" and "+3" on Cashier;
  - "Can open 8 of 21 modules" on Cashier;
  - no "Users / Modules / Scope" table headers.

### Implementation for User Story 1

- [X] T012 [US1] Change the `perm` module tab's screen kind from the generic table to a new `"roles"` kind:
  - in `src/config/modules.ts`, extend `ScreenKind` in `src/data/types`;
  - in `src/features/generic/screens.tsx`, remove the `perm` export;
  - in `src/data/fixtures/generic.ts`, remove `"perm/permissions"` rows that are no longer used. Keep the canvas values in the fixtures' header comment.
- [X] T013 [P] [US1] Create `src/features/permissions/RoleCard.tsx` per contracts/ui.md › Card:
  - a Card `article` with the accessible name set to the role name;
  - a 40px `--role-N` tile with a `folder-lock` icon;
  - the role name;
  - a `RowActions` placeholder slot;
  - the avatar stack: 28px initials circles on `--pos-tint-*`/`--pos-ink-*`-style tint tokens with a ring, and "+N";
  - "Total N user(s)" and the "Can open X of Y modules" caption;
  - a full-width secondary "Edit role" Button with a `user-cog` icon and `aria-label="Edit role: {name}"`.
- [X] T014 [US1] Create `src/features/permissions/RoleCards.tsx`: a grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`) of `RoleCard` from `useRoleCards()`. Create `src/features/permissions/screens.tsx` exporting `permissionsScreens = { permissions: { Body: RoleCards, Actions: AddRoleAction } }`, with `AddRoleAction` a stub primary "Add new role" Button until US4.
- [X] T015 [US1] Point `perm` at the new screens in `src/features/screens.ts`, importing from `./permissions/screens` instead of `./generic/screens`.
- [X] T016 [US1] Run T011 and check the page at 1440 and 375px.

**Checkpoint**: US1 works on its own. The cards show seeded data and Edit role is still a stub.

---

## Phase 4: User Story 2 - Edit a role's access module by module (Priority: P1)

**Goal**: the Edit role dialog has 21 module rows grouped by section, single-level Read, Write or
Delete per row, and Save, Cancel and Escape.

**Independent Test**:
- Open Edit role on Cashier, set Purchases to Read and save. The toast reads "Cashier access saved."
  and the card shows 9 of 21.
- Reopen: Purchases shows Read. Clear it, then Cancel. It still shows Read.
- On the Owner, every row is disabled at Delete.

### Tests for User Story 2

- [X] T017 [P] [US2] Add unit tests to `tests/unit/permissions.test.ts`:
  - `saveRoleAccess` replaces the role's access, forces locked rows back, and sets the toast "{Name} access saved.";
  - saving the Cashier with Purchases at Read makes `canSee(effectiveRole(...), "buy")` true.
- [X] T018 [P] [US2] Add smoke tests to `tests/smoke/permissions.spec.ts` (quickstart 2–3):
  - the dialog has 21 groups and the section headings;
  - `aria-pressed` on "Sales: Write" for the Cashier;
  - picking "Purchases: Read" then Save gives the toast and the card summary 9 of 21;
  - reopening, clicking Read again (cleared), then Cancel leaves Read;
  - Escape closes the dialog and focus returns to "Edit role: Cashier";
  - on the owner, all buttons are disabled with the note "The owner always has full access." and Save is disabled.

### Implementation for User Story 2

- [X] T019 [US2] Create `saveRoleAccess(key, access)` in `src/data/commands/permissions.ts` (data-model › Commands), and export it from `src/data/commands/index.ts` / `@/data`.
- [X] T020 [US2] Create `src/features/permissions/AccessRow.tsx`, per contracts/ui.md › Access button:
  - a `role="group"` row labelled with the module name;
  - the module icon and name;
  - 3 toggle buttons with `aria-pressed` and `aria-label="{Module}: {Level}"`:
    - selected: ✓ icon, `border-2 border-primary`, `text-primary-text`;
    - unselected: 1px border;
    - locked: disabled at 60% opacity;
  - below 640px the row is `flex-col` and the buttons sit in a `grid-cols-3`.
- [X] T021 [US2] Create `src/features/permissions/EditRoleDialog.tsx`:
  - a `Modal` (width 640) with the title "Edit role" and the role name as subtitle;
  - an `h3` "Role access" and, for the owner, the locked note;
  - rows grouped by `useModuleGroups()`, with eyebrow headings;
  - a draft state that starts from `useRoleAccess(key)` and changes through `pickLevel`;
  - the footer: Cancel, and Save (disabled until the draft differs; calls `saveRoleAccess`, then closes).
- [X] T022 [US2] Wire "Edit role" in `RoleCard.tsx` and `RoleCards.tsx` to open `EditRoleDialog` for that role. Keep the open key in local state; the dialog returns focus to its trigger on close through the existing `useDialog`.
- [X] T023 [US2] Run T017 and T018, and check the dialog at 375px (stacked rows, scrolling body, fixed footer).

**Checkpoint**: US1 and US2 work. Edits change the card summaries and, through `effectiveRole`,
the role's sidebar.

---

## Phase 5: User Story 3 - Permissions change what a role sees and can do (Priority: P2)

**Goal**: Read controls visibility (already done by T007). Write and Delete hide create, edit and
delete controls everywhere (research R4–R6).

**Independent Test**:
- Cashier with Stock at none: Stock is hidden and the URL redirects.
- Cashier with Sales at Read: no "New sale", row menus show only View and Download PDF, and
  `?action=new` gives the toast.
- Accountant at Write on Expenses: no Void. At Delete: Void appears.
- Cashier with Point of sale at Read: "View only", no Launch.

### Tests for User Story 3

- [X] T024 [P] [US3] Add smoke tests to `tests/smoke/permissions.spec.ts` (quickstart 4–7). Use a helper that sets a level through the dialog and then switches role through the Profile role switcher.
  - Stock at none is hidden from the sidebar, and `/stock/stock-management` redirects to the dashboard.
  - Sales at Read hides "New sale". The row menu has only View and Download PDF. `/sales/all-sales?action=new` gives the toast "Your role can only view Sales." with no dialog.
  - Expenses: the Accountant's expense view has no Void at Write and shows Void at Delete.
  - Point of sale at Read shows "View only" and no "Launch" or "Open shift" button.
- [X] T025 [P] [US3] Add unit tests for `effectiveRole` after an edit:
  - Cashier Stock at none makes `canSee` false;
  - Uza AI `answer()` returns the no-access reply for a low-stock question.

### Implementation for User Story 3

- [X] T026 [US3] Create `src/components/ui/Can.tsx`: `<Can need="write|delete" module?>{children}</Can>`. It renders its children only when `useCan(need, module)` is true.
- [X] T027 [US3] In `src/components/shell/ModuleScreen.tsx`:
  - wrap the content in `AccessContext.Provider value={{ module: moduleId, level }}`;
  - render `Actions` only if `has(level, "write")`;
  - add an effect: when `action` or `edit` (and the dependent `step`/`confirm`) is in the URL and the level is below Write, remove those params with `router.replace` and toast "Your role can only view {Module}." (research R4.2, R6).
- [X] T028 [US3] In `src/components/ui/Menu.tsx`:
  - add `need?: AccessLevel` to `MenuItem`;
  - in `RowActions`, filter `items` with `useAccess()` against `item.need ?? rowActionNeed(item.label)`;
  - return `null` when no items are left.
- [X] T029 [US3] In `src/features/dashboard/QuickTasks.tsx`, hide tasks that have an `action` unless `useCan("write", task.module)` is true. Leave `AttentionList` as it is: it is read-only navigation.
- [X] T030 [US3] In `src/features/pos/PosLaunch.tsx`, gate "Open shift" and "Launch" with `useCan("write","pos")`. Without Write, show the muted caption "View only" in their place. Also stop `?till=` from opening when Point of sale is below Write.
- [X] T031 [P] [US3] Audit **sales** (research R5): wrap inline Write and Delete controls in `<Can>` in:
  - `src/features/sales/RecordView.tsx`: Edit, Convert and Record payment need write; Void needs delete;
  - `SaleView.tsx`: Void sale needs delete, Refund needs write;
  - `DocumentLists.tsx`, `SalesList.tsx`, `SalesOverview.tsx` and `TargetList.tsx`.

  Set `need` on any `MenuItem` whose label class is wrong.
- [X] T032 [P] [US3] Audit **purchases** in `src/features/purchases/`:
  - `PurchaseOrderView.tsx`: Approve, Receive and Edit need write; Cancel needs delete;
  - `GoodsReceiptView.tsx`;
  - `PurchaseOrderList.tsx`;
  - `RecordView.tsx`.
- [X] T033 [P] [US3] Audit **stock and products**:
  - `src/features/stock/`: `TransferView.tsx` (Mark as received needs write, Cancel transfer needs delete), `WarehouseList.tsx`, `WastageList.tsx`, `StockHistory.tsx` (Undo needs delete), `StockLevels.tsx` and `shared.tsx`;
  - `src/features/products/`: `ProductRecord.tsx`, `ProductList.tsx`, `CategoryList.tsx` and `UnitList.tsx`.
- [X] T034 [P] [US3] Audit **money**:
  - `src/features/expenses/`: `ExpenseView.tsx` (Edit needs write, Void needs delete), `VoidedList.tsx`, `ExpenseList.tsx`, `CategoryList.tsx` and `RecurringList.tsx`;
  - `src/features/receivables/` (`ReceivableList.tsx`, `CreditList.tsx`, `StatementView.tsx`, `PaymentList.tsx`, `PlanList.tsx`) and `src/features/payables/PayableList.tsx`;
  - `src/features/accounts/`: `MoveView.tsx` (Undo needs delete, Edit needs write), `BankAccountList.tsx`, `TransactionsList.tsx` and `MoveLists.tsx`.
- [X] T035 [P] [US3] Audit **office and other areas**:
  - `src/features/files/`: `FileDrawer.tsx` and `FileManager.tsx` (inline Upload and New folder need write, Delete needs delete);
  - `src/features/calendar/`: `CalendarScreen.tsx` and `EventDetails.tsx`;
  - `src/features/customers/CustomerList.tsx` and `src/features/suppliers/SupplierList.tsx`;
  - `src/features/settings/`: `Terminals.tsx`, `BranchList.tsx`, `GroupList.tsx` and `StorageList.tsx` (switches and Set as headquarters need write);
  - `src/features/generic/`: `GenericTable.tsx` and `RecordDrawer.tsx`.
- [X] T036 [US3] Run a sweep: `grep -rnE '(Edit|Void|Delete|Approve|Undo|Cancel transfer|Write off|Record payment|New |Add |Upload)' src/features` and confirm every hit is inside a form (already gated by `?action`), a `<Can>`, a `useCan` check, or a `RowActions` item. Record any intentional exceptions (for example till-internal controls) in research.md › R5.
- [X] T037 [US3] Update the existing smoke specs that expected a non-owner to void or delete (research R2 behaviour change):
  - find them with `grep -rn "Void\|Delete\|Undo\|Cancel transfer" tests/smoke`, then check which `loginAs` role each test uses;
  - switch each to `loginAs(page,"owner")`, or grant Delete in the test.

  Then run the full `npx playwright test`.

**Checkpoint**: US3 works. The Permissions page and the app agree for Read, Write and Delete.

---

## Phase 6: User Story 4 - Add, rename, duplicate and delete roles (Priority: P3)

**Goal**: "Add new role" and the card "…" menu (Rename, Duplicate, Delete; Duplicate only for the
owner).

**Independent Test**:
- Add "Supervisor", then give it Sales at Write.
- Duplicate it to "Supervisor copy", rename that to "Floor lead", then delete it.
- Cashier's Delete gives the toast "Move 4 people to another role first."

### Tests for User Story 4

- [X] T038 [P] [US4] Add unit tests:
  - `addRole`: next colour, home and prof at Read, 0 users, a new key;
  - `addRole` rejects names that are blank, longer than 40 characters, or duplicates ignoring case;
  - `duplicateRole` naming ("copy", then "copy 2");
  - `renameRole` is refused for the owner;
  - `deleteRole` is refused for the owner and for roles with users, and otherwise removes the role.
- [X] T039 [P] [US4] Add smoke tests to `tests/smoke/permissions.spec.ts` (quickstart 8):
  - add, edit, duplicate, rename and delete with confirm;
  - the blank-name inline error;
  - the Cashier delete refusal toast;
  - the owner's menu has only Duplicate.

### Implementation for User Story 4

- [X] T040 [US4] Add `addRole`, `renameRole`, `duplicateRole` and `deleteRole` to `src/data/commands/permissions.ts`, with the validation and toasts from data-model.md › Commands.
- [X] T041 [P] [US4] Create `src/features/permissions/RoleNameDialog.tsx`:
  - a Modal (width 420) titled "Add new role" or "Rename role";
  - a Field "Role name" with the inline error from `validateRoleName`;
  - a primary "Add role" or "Save" button.
- [X] T042 [US4] Wire everything:
  - `AddRoleAction` in `src/features/permissions/screens.tsx` opens `RoleNameDialog`. On success it opens `EditRoleDialog` for the new key.
  - The `RowActions` "…" menu in `RoleCard.tsx` is labelled "{name} options":
    - owner: Duplicate;
    - others: Rename, Duplicate and Delete (danger).
  - Delete uses `ConfirmDialog` with the copy from contracts/ui.md.
- [X] T043 [US4] Run T038 and T039.

**Checkpoint**: all four stories work.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T044 [P] Add rows to `tests/smoke/responsive.spec.ts` for `/permissions/permissions` at 320px and for the Edit role dialog: no sideways overflow and the accessibility scan passes (SC-004).
- [X] T045 [P] Update the Help Center article on roles and permissions in `src/data/fixtures/helpcenter.ts` (FR-018) to describe role cards, Edit role, single-level Read, Write and Delete per module, and the owner lock.
- [X] T046 [P] Add a `/permissions/permissions` entry to the mobile audit routes (`<scratchpad>/mobile/routes.json`) and run the audit at 6 widths, aiming for 0 issues.
- [X] T047 Visually check the cards and dialog against the user's screenshots at 1440 and 375px. Note any intentional differences in spec.md › Design deviations.
- [X] T048 Run the full gate: `npm run typecheck && npm run lint && npm run test:unit && npm run build && npx playwright test`. Then commit on `011-modular-permissions`.

---

## Dependencies & Execution Order

### Phase dependencies

- Setup (T001–T003) has no dependencies.
- Foundational (T004–T010) depends on T003 and **blocks every story**.
- US1 (T011–T016) depends on Foundational.
- US2 (T017–T023) depends on US1's card for the dialog trigger.
- US3 (T024–T037) depends only on Foundational, but its smoke tests use the US2 dialog to set levels. Build the gates (T026–T036) after Foundational in parallel with US1 and US2, then run T024 once US2 is done.
- US4 (T038–T043) depends on US1 and US2.
- Polish depends on all stories.

### Within stories

- Write the tests first and check they fail; then the data layer, then the UI.
- T026 (`<Can>`) and T028 (Menu) come before the audit tasks T031–T035.

### Parallel opportunities

- **Setup**: T001, T002 and T003.
- **Foundational**: T009 runs in parallel with T007 and T008 once T005 is in.
- **US1**: T011 and T013.
- **US2**: T017, T018 and T020.
- **US3**: T024 and T025, then the audits T031–T035 once T026 and T028 land.
- **US4**: T038, T039 and T041.
- **Polish**: T044, T045 and T046.

## Parallel Example: User Story 3

```bash
# After T026 (<Can>) and T028 (Menu filter):
Task: "T031 audit sales inline controls"
Task: "T032 audit purchases inline controls"
Task: "T033 audit stock + products inline controls"
Task: "T034 audit money modules inline controls"
Task: "T035 audit office/settings/generic inline controls"
```

## Implementation Strategy

### MVP first (US1 and US2)

1. Phases 1–2, with the parity test green.
2. US1: role cards.
3. US2: the Edit role dialog. Read access already drives visibility through T007.
4. **Stop and validate** with quickstart 1–4. This alone fixes "the page and the app disagree".

### Incremental delivery

1. Add US3 (Write and Delete gates), then run the full smoke suite and update the expectations from
   research R2.
2. Add US4 (role add, rename, duplicate and delete).
3. Polish: responsive checks, Help Center, the mobile audit and the visual check.
