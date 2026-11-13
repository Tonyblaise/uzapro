# Research: Modular role permissions

There were no NEEDS CLARIFICATION items in Technical Context; the two spec questions were answered
on 2026-11-13. These decisions settle the open design points.

## R1. Where visibility comes from

**Decision**: add a `permissions` store slice, `{ roles: RoleDef[]; access: Record<RoleKey, Record<ModuleId, AccessLevel>> }`. `effectiveRole(state, roleId)` returns the config `Role` from `ROLES` with:
- `mods` replaced by the modules where the level is Read or higher;
- `tabs` kept as is.

`useRole`, `useSession`, `RouteGuard`, the Uza AI `answer` context, `commands/generic.ts` and the
calendar money check then all use the effective role. `visibleModules`, `visibleTabs` and `canSee`
don't change.

**Rationale**: one source of truth, and the change touches about 6 call sites. The Owner keeps
`mods` undefined, which already means all modules, because it is locked to Delete everywhere.

**Alternatives considered**:
- Editing `ROLES` in place: config is static and imported at module scope, so it can't hold
  session state.
- A second, parallel visibility function: the page and the app could drift apart, which is exactly
  the bug being fixed.

## R2. Seed levels (SC-002 parity)

**Decision**: work out each role's starting level from what it can see today:

| Role | Level |
|---|---|
| Owner | Delete on all 21 modules (locked) |
| Accountant | **Write** on fin, exp, rcv, pay, sales, buy, cust, vend, rep, docs; **Read** on home, cal, ppl, sup |
| Cashier | **Write** on sales, pos, cust; **Read** on home, cal, inv, sup |
| Store keeper | **Write** on inv, prod, buy, vend, docs; **Read** on home, cal, sup |

Everything else starts at none. Dashboard (`home`) and Profile (`prof`) are Read and locked for every role.

Profile is outside the non-owner whitelists today. Locking it at Read makes it reachable for every role, as the spec's edge case requires, so that people can always sign out and switch role. This is the only change to visibility.

A unit test checks that, for every role, `visibleModules(effectiveRole(seed))` equals `visibleModules(ROLES[id])` plus Profile.

**Rationale**:
- These levels match the canvas's Scope column: Accountant "Edit" and Store "Edit" become Write;
  Cashier "Limited" becomes Write on its selling modules and Read elsewhere.
- Non-owner roles start without Delete. That is the usual small-business default: voids and deletes
  are kept for the owner.

**Behaviour change**: roles other than the owner lose void and delete actions they have today
(for example, the Accountant voiding an expense). This follows from the spec's seeded levels
(FR-007). The plan records it here so the tests are updated on purpose. The owner can grant Delete
in one click.

**Alternatives considered**: seeding Delete wherever a role sees a module. That keeps every current
button, but it makes the canvas's "Edit" and "Limited" scopes meaningless.

## R3. Level picking (Q1)

**Decision**: `pickLevel(current, clicked)` returns `clicked === current ? "none" : clicked`.
- Levels are ordered none < read < write < delete.
- `has(level, need)` is an ordinal comparison.
- Locked rows ignore picks.

**Rationale**: one ✓ per row, as in the screenshot. Clicking the ticked button again clears the row,
which is the only way to set none without a fourth button.

## R4. Central gates for Write and Delete (Q2)

**Decision**: `ModuleScreen` wraps its children in `AccessContext.Provider value={{ module, level }}`.

1. **Header actions**: every `ScreenDef.Actions` in the app is a create button ("New …", "Record …",
   "Add …", "Stock in", "Upload", "Issue credit"). They render only if `has(level, "write")`.
2. **Overlay params**: if the URL has `action` or `edit` and the level is below Write,
   `ModuleScreen` removes those params (`router.replace`) and shows the toast
   "Your role can only view {Module}." Void and delete steps reached through record views (for
   example `?view=…&step=void`) are gated by R6.
3. **Row menus**: `RowActions` reads the context and drops items whose need isn't met. The need
   comes from `item.need`, or from `rowActionNeed(label)`:
   - **read**: View, View details, View stock, Download PDF, Print, Statement.
   - **delete**: Delete, Void, Void sale, Void credit, Cancel transfer, Undo, Write off.
   - **write**: everything else (Edit, Approve, Reject, Mark as received, Record payment, Pay now,
     Set as headquarters, Use to pay, Verify, Accept…).

   The default is write, so a new label is safe by default. If no items are left, the "…" trigger
   is hidden.
4. **Dashboard quick tasks** with an `action` need Write on the target module. Without it, the tile
   is hidden.

**Rationale**: covers most controls with 4 edits. The label classes reuse the existing `ROW_ICONS`
label convention in `Menu.tsx`.

**Alternatives considered**:
- Gating every control inside every module: about 100 edits, and easy to miss one.
- Disabling instead of hiding: the spec says hidden, and disabled buttons with no reason given are
  worse for users.

## R5. Inline controls that need a `<Can>` gate (audit)

The `?action` gate already covers buttons inside forms. These record views and lists have inline
Write or Delete buttons outside forms. Each is wrapped in `<Can need="write">` or
`<Can need="delete">`, or uses `useCan()`:

- **sales**:
  - `RecordView.tsx`: Edit, Convert, Record payment, Void;
  - `SaleView.tsx`: Void sale, Refund;
  - `DocumentLists.tsx`: inline Convert, Send, Record payment;
  - `SalesList.tsx`, `SalesOverview.tsx`, `TargetList.tsx`.
- **purchases**: `PurchaseOrderView.tsx` (Approve, Receive, Edit, Cancel), `GoodsReceiptView.tsx`,
  `PurchaseOrderList.tsx`.
- **stock**: `TransferView.tsx` (Mark as received, Cancel transfer), `WarehouseList.tsx`,
  `WastageList.tsx`, `StockHistory.tsx` (Undo).
- **expenses**: `ExpenseView.tsx` (Edit, Void), `VoidedList.tsx`.
- **receivables and payables**: `ReceivableList.tsx`, `CreditList.tsx`, `StatementView.tsx` inline
  pay buttons.
- **accounts**: `MoveView.tsx` (Undo, Edit), `BankAccountList.tsx`.
- **files**: `FileDrawer.tsx` (Edit, Delete), `FileManager.tsx` (New folder, Upload inline).
- **calendar**: `CalendarScreen.tsx` (New event inline), `EventDetails.tsx` (Edit, Delete).
- **products**: `ProductRecord.tsx` (Edit, Delete), `CategoryList.tsx`, `UnitList.tsx`.
- **suppliers and customers**: `SupplierList.tsx`, `CustomerList.tsx` inline add.
- **settings**: `Terminals.tsx`, `BranchList.tsx`, `GroupList.tsx`, `StorageList.tsx` (switches,
  Set as headquarters).
- **generic**: `GenericTable.tsx`, `RecordDrawer.tsx`.

The exact list is confirmed during implementation with `grep` for the Write and Delete verbs
(see the tasks).

**POS**:
- Opening a till needs Point of sale **Write**, because selling creates records.
- With Read only, the terminal cards show without "Open"/"Continue selling".
- Voiding inside the till (held-sale delete, line remove) is part of selling and stays at Write.

**Uza AI**: answers already go through `canSee`, so they follow Read automatically. Support tickets
and feature ideas are personal and are not gated.

## R6. Delete-type steps inside record views

**Decision**: record views that open a void or delete step through local state or `step=` check
`useCan("delete")` before showing the trigger. Because the trigger is hidden, the step can't be
reached. A deep link with `step=void` without Delete falls back to the view (the toast from R4 is
reused).

## R7. Role colours

**Decision**: add tokens `--role-1` … `--role-6` for the tile backgrounds, with the icon white
(`--role-ink:#fff`). The values come from the existing primary, warning, danger, purple, success and
info scales so contrast is at least 3:1 for the icon:
- Owner: role-1 (blue);
- Accountant: role-2 (orange);
- Cashier: role-3 (red);
- Store keeper: role-4 (purple);
- custom roles continue round the palette.

**Rationale**: Principle IV requires named tokens. The screenshot uses blue, orange, red, purple and
green tiles.

## R8. Users and avatars

**Decision**: user counts come from the canvas Permissions table: 1, 2, 4 and 3. The known people
come from `ppl/team`: Tony Blaise, Mary Achieng, Jane Smith and Grant Jensen.

The avatar stack shows initials for the known people, then "+N" for the rest of the count. For
example, Cashier shows "JS" and "+3". Custom roles have 0 users and no avatars.

**Rationale**: no invented names (Principle II).

## R9. Dialog layout

**Decision**: use the existing `Modal` (width 640):
- the header has the title "Edit Role" and the subtitle "{Role name}";
- the body is a scrollable list with section sub-headings (`type-eyebrow`);
- each row is a flex row with the label (module icon and name) and a 3-button group;
- the footer has Cancel (secondary) and Save (primary, disabled until something changes).

Below 640px:
- the Modal already becomes a full-height sheet;
- each row wraps, with the label on its own line and the buttons `flex-1` in a 3-column grid.

Selected button style: border `2px var(--primary)`, ✓ icon and the label in `--primary-text`.
Unselected: `1px var(--border)`.

## R10. Add, rename, duplicate and delete

**Decision**:
- **RoleNameDialog** is a Modal with one Field "Role name". It validates required, at most 40
  characters, and unique ignoring case.
- **addRole** gives the role the next palette index, 0 users, Read on home and prof, and none
  elsewhere, then opens EditRoleDialog.
- **duplicateRole** names the copy "{Name} copy". If that name is taken, it tries "{Name} copy 2",
  then 3, and so on.
- **deleteRole** opens a ConfirmDialog. Roles with users are refused with the toast
  "Move {N} people to another role first."
- Owner / Admin's menu shows only Duplicate.

The "…" menu uses the existing `Menu`, with `need` unset because this page is owner-only.

## R11. Implementation notes (2026-11-13)

- **Analysis fixes folded in during implementation** (the analysis remediation wasn't applied separately):
  - I1: the docs use the app's module names: Stock, Help and Accounts.
  - C1: the Permissions row is locked at none for every non-owner role (`lockedLevel`).
  - C2: dashboard quick tasks and alerts are filtered by access (`useHomeItems`).
  - I2: `navigation.spec.ts` uses `seedRole`.
  - U1: avatar tokens are `--avatar-tint-*` / `--avatar-ink-*`.
  - U2: the Edit role dialog closes if the session leaves the owner role.
- **Step and cancel links**: data-changing record steps are also gated centrally in `ModuleScreen`:
  - `step=void|delete`, `confirm=delete` and `cancel=1` need Delete;
  - `step=edit|pay|receive|credit` needs Write.
- **Legacy owner-only checks** now read Delete access: `!role.tabs` in Products, Suppliers, Stock, the Sales lists and generic tables. The Sales invoice "Void" (`role.figures`) now needs Delete.
- **R5 sweep exceptions**: these are deliberately not gated:
  - till-internal controls (Point of sale Write already covers them);
  - Uza AI tickets and ideas (personal);
  - File Manager stars (personal);
  - header actions that only navigate, such as Products › "Manage categories", which hide with the Actions slot.
