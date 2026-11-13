# Feature Specification: Modular role permissions

**Feature Branch**: `011-modular-permissions`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "The permissions design should be modular, then fix the new permissions and view should be similar to this screenshot" (two reference screenshots: a grid of role cards and an "Edit Role" dialog).

**Reference screenshots** (supplied by the user in chat, not in the design canvas):

1. **Role cards**: a breadcrumb ("Dashboard • Role Management & Permission") and an "Add New Role" primary button. Below them is a grid of cards, four per row on desktop. Each card has:
   - a coloured square icon and the role name;
   - a "…" menu;
   - a stack of up to four avatars with "Total N users";
   - a full-width outline "Edit Role" button.
2. **Edit Role dialog**: a title "Edit Role" with a close ✕ and a section heading "Role Access". Below that is one row per item: its label on the left, then three outline buttons ("Read", "Write", "Delete") on the right. A selected button shows a ✓ and a blue border. Rows are separated by thin dividers. The footer has "Cancel" and a primary "Save".

## Context

Today Permissions (People › Permissions) is a static four-row table copied from the canvas: Role, Users, Modules ("Finance + reports"), Scope ("Full / Edit / Limited"). It can't be edited. Its "Modules" text is also out of date: it predates Point of sale, Uza AI and Help Center. And it has no link to what each role actually sees in the app, which is defined separately per role.

This feature replaces that table:

- **Modular**: access is set per app module (Dashboard, Products, Stock, Sales, Point of sale, and so on), grouped by the sidebar sections. Each module gets Read, Write and Delete.
- **Fixed**: the starting permissions come from what each demo role can actually see today. So the Permissions page and the app agree, and newer modules are included.
- **Matches the screenshots**: a role-card grid and an "Edit Role" dialog in the screenshots' style, drawn with UzaPro's design-system tokens. The Edit Role rows are modules; in the screenshot they are role names.

## Clarifications

### Session 2026-11-13

- Q (revised after release, 2026-11-13): Can a module have more than one of Read, Write and Delete? → A: Yes. They are independent switches, so for example an Accountant can have Read, Write and Delete on Expenses. Write or Delete turns Read on, and turning Read off removes the module. The Owner / Admin dialog shows the note "Admin has access to everything".

- Q: Are Read, Write and Delete a single level per module or three independent switches? → A: (Superseded, see the revision above.) A single level per module.
- Q: What do Write and Delete do? → A: They are enforced. With Read only, create and edit controls are hidden. Without Delete, delete, void and cancel actions are hidden.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See every role at a glance (Priority: P1)

An owner opens People › Permissions. They see one card per role (Owner / Admin, Accountant, Cashier, Store keeper). Each card shows the role's colour icon, its name, the avatars of people in that role, "Total N users", an "Edit Role" button and a "…" menu. Under the role name, a one-line summary says how many modules the role can open, for example "Can open 7 of 21 modules".

**Why this priority**: it replaces the static table and is the entry point for everything else.

**Independent Test**: open `/permissions/permissions` as the owner. Four role cards show, with the right names, user counts and module summaries. The layout has four columns at 1440px, two at 768px and one at 375px, with no sideways scrolling.

**Acceptance Scenarios**:

1. **Given** the demo seed, **When** the owner opens Permissions, **Then** four role cards show in this order:

   | Role | Users |
   |---|---|
   | Owner / Admin | 1 |
   | Accountant | 2 |
   | Cashier | 4 |
   | Store keeper | 3 |

2. **Given** a role card, **When** it renders, **Then**:
   - it shows up to four avatars (initials on a tinted circle) for that role's people;
   - "+N" stands in for any beyond four;
   - the user count reads "Total 1 user" (singular) or "Total N users".
3. **Given** the Cashier card, **When** it renders, **Then** its summary counts only the modules the Cashier can read: Dashboard, Calendar, Sales, Point of sale, Customers, Stock, Help and Profile ("Can open 8 of 21 modules").

---

### User Story 2 - Edit a role's access module by module (Priority: P1)

The owner clicks "Edit Role" on a card. A dialog titled "Edit Role" opens, showing the role's name. Under "Role Access" there is one row per module, grouped under the sidebar section headings (Overview, Sales, Procurement, Financials, People, Office, Account). Each row has Read, Write and Delete buttons that show the current access. The owner changes some access and clicks Save. The card updates, and a toast confirms "Cashier access saved."

**Why this priority**: this is the core of "modular permissions".

**Independent Test**:
1. Open Edit Role for Cashier, give Purchases "Read" and save. The Cashier card now says 8 modules.
2. Reopen the dialog. Purchases still shows Read.
3. Cancel a second change. It is discarded.

**Acceptance Scenarios**:

1. **Given** the Edit Role dialog for Accountant, **When** it opens, **Then** every module row shows the Accountant's current access, and modules the Accountant can't open show no button selected.
2. **Given** a row, **When** the owner picks an access button, **Then** that switch turns on or off according to FR-006.
3. **Given** unsaved changes, **When** the owner clicks Cancel, presses Escape or clicks ✕, **Then** the dialog closes and nothing changes.
4. **Given** changes, **When** the owner clicks Save, **Then**:
   - the dialog closes;
   - the card summary updates;
   - a toast reads "{Role} access saved.";
   - the change lasts until the page is reloaded.
5. **Given** the dialog, **When** the owner uses the keyboard, **Then**:
   - every access button can be reached with Tab;
   - each button announces its module and level (for example "Sales: Write") and whether it is pressed;
   - focus stays in the dialog and returns to the "Edit Role" button when the dialog closes.

---

### User Story 3 - Permissions change what a role sees (Priority: P2)

After the owner removes Stock from the Cashier and saves, they switch the demo role to Cashier (Profile › switch role). Stock is no longer in the sidebar, the dashboard tasks or Uza AI answers. Opening a Stock link directly shows the existing "not available for your role" state.

**Why this priority**: it "fixes" permissions so the page and the app agree, instead of being a decoration. It builds on Story 2.

**Independent Test**: remove Cashier › Stock, save, switch to Cashier, check the sidebar and visit `/stock/stock-management`.

**Acceptance Scenarios**:

1. **Given** the seed, **When** each role is used, **Then** it sees exactly the modules it saw before this feature. Nothing changes until someone edits a role.
2. **Given** Cashier's Stock set to none, **When** the user switches to Cashier, **Then** Stock is gone from the sidebar, search, quick tasks and dashboard alerts that link to Stock.
3. **Given** a module set to Read only for a role, **When** that role opens it, **Then** its create and edit controls are hidden and its delete, void and cancel actions are hidden (FR-011). Viewing, downloading and running reports still work.

---

### User Story 4 - Add, rename, duplicate and delete roles (Priority: P3)

The owner clicks "Add New Role" and enters a name, for example "Supervisor". A new card appears with a colour picked from the role palette, "Total 0 users" and no module access, and its Edit Role dialog opens straight away. From any card's "…" menu the owner can Rename, Duplicate (as "{Name} copy", with the same access) or Delete.

**Why this priority**: useful but not needed to edit the four built-in roles.

**Independent Test**: add "Supervisor", give it Sales Read, save. Then duplicate it, rename the copy, and delete it.

**Acceptance Scenarios**:

1. **Given** the Add role form, **When** the name is blank or matches an existing role (ignoring case), **Then** Save is blocked with an inline message.
2. **Given** a role with one or more users, **When** the owner picks Delete, **Then** it is refused with "Move {N} people to another role first."
3. **Given** a role with no users, **When** the owner confirms Delete, **Then** the card is removed and a toast reads "{Role} deleted."
4. **Given** the Owner / Admin role, **When** its "…" menu opens, **Then** Delete and Rename are not offered.

---

### Edge Cases

- **The Owner / Admin role is locked to full access** on every module. The Edit Role dialog shows its rows as selected but disabled, with the note "The owner always has full access." This keeps anyone from locking themselves out of Permissions.
- **Permissions, Profile and Help**:
  - The Permissions row is locked at none for every role except the owner, shown disabled with the caption "Owner only".
  - Profile is always readable by every role, because people must be able to sign out and switch roles. Its row shows Read locked.
- **No-access role**: a custom role with no access still sees Dashboard and Profile. Dashboard is locked to Read for every role so there is always a home screen.
- **Long role names**: they wrap to two lines on the card and in the dialog title, and are not cut off. Names are limited to 40 characters.
- **Narrow screens** (320px):
  - Edit Role rows stack, with the module label above and the three buttons spread evenly below;
  - the dialog becomes a full-height sheet whose body scrolls;
  - the Cancel and Save footer stays visible.
- **Unsaved changes in the dialog**: if the owner switches role while the dialog is open (for example from another tab), the edits are discarded.
- **Point of sale**: the till checks Point of sale Read for the signed-in role. A cashier role that loses Point of sale can no longer open a till, and an already-open till keeps running until it is closed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: People › Permissions MUST show a grid of role cards in place of the static table. The page has:
  - the page header, with the "Add New Role" primary button aligned to the title row;
  - four columns from 1280px, three from 1024px, two from 640px and one below that.
- **FR-002**: Each role card MUST show:
  - a 40px rounded-square icon in the role's colour;
  - the role name in the heading style;
  - a "…" menu;
  - an avatar stack (at most 4, then "+N") and "Total N user(s)";
  - a one-line module summary, "Can open X of Y modules";
  - a full-width outline "Edit Role" button with the user-cog icon.
- **FR-003**: Access MUST be set per module for every module in the app registry. Modules are grouped under the sidebar section headings in sidebar order. The dialog body scrolls; its header and footer stay put.
- **FR-004**: Each module row MUST show three outline buttons: Read, Write and Delete.
  - A selected button shows a ✓ icon before its label, a 2px primary-colour border and a primary-tinted label.
  - An unselected button shows a 1px border and a plain label.
  - Each button exposes its pressed state to assistive technology.
- **FR-005**: The access levels MUST mean:
  - **Read**: the module shows in the sidebar and can be opened.
  - **Write**: the role can create and edit records there.
  - **Delete**: the role can delete, void or cancel records there.
- **FR-006**: Read, Write and Delete MUST be independent switches per module (revised 2026-11-13). Any mix can be on, for example Read, Write and Delete together.
  - Turning Write or Delete on also turns Read on, because a role must open a module to act in it.
  - Turning Read off turns the whole module off.
  - Each switch's accessible name is "{Module}: {Right}" and its pressed state shows whether that right is on.
- **FR-007**: The starting access MUST come from each role's current visibility (the modules each role sees today). Seeded levels:
  - Owner / Admin: full access everywhere.
  - Accountant: Write on the Financials modules, Sales, Purchases, Customers, Suppliers, Reports and File Manager; Read on the others it sees now.
  - Cashier: Write on Sales, Point of sale and Customers; Read on Stock, Calendar, Dashboard and Help.
  - Store keeper: Write on Stock, Products, Purchases, Suppliers and File Manager; Read on the others it sees now.
  - Modules a role can't see today start with no access.
  - Exact lists: research R2.
- **FR-008**: Saving MUST update the role's access for the rest of the session and show the toast "{Role} access saved." Cancel, ✕ and Escape MUST discard changes. Save MUST be disabled until something changes.
- **FR-009**: Module visibility for a role MUST come from that role's Read access. This covers the sidebar, search, dashboard quick tasks and alerts, Uza AI answers and direct links, so the Permissions page and the app never disagree.
- **FR-010**: Within a module, tab-level limits that exist today MUST stay as they are. For example, the Cashier only sees "All sales" and "Refunds" in Sales. A newly granted module shows all of its tabs.
- **FR-011**: Write and Delete MUST be enforced in each module:
  - **Read only**: the module's create and edit controls are hidden. These include primary "New …" / "Record …" / "Add …" buttons, quick tasks that create records, row actions that edit or approve, and forms opened from a direct link, which show a "Your role can only view {Module}." notice instead.
  - **Write but not Delete**: delete, void, cancel and undo actions are hidden from row menus and record views.
  - **Viewing**: viewing, downloading, printing and running reports stay available at Read.
- **FR-012**: "Add New Role" MUST:
  - ask for a name (required, unique ignoring case, at most 40 characters);
  - create a role with the next colour in the role palette, 0 users, and only the locked Dashboard and Profile access;
  - then open its Edit Role dialog.
- **FR-013**: The card "…" menu MUST offer:
  - Rename (same name rules);
  - Duplicate ("{Name} copy", same access, 0 users);
  - Delete (only with 0 users, after a confirm dialog). Otherwise it is refused with "Move {N} people to another role first."

  Owner / Admin offers only Duplicate.
- **FR-014**: The Owner / Admin role MUST always have full access. Its Edit role rows are shown on and disabled, under an info note "Admin has access to everything", and its card reads "Full access to everything".
- **FR-015**: Only the owner role MUST be able to open Permissions. This is unchanged: other demo roles don't have the module.
- **FR-016**: All new state MUST stay in memory for the session. No new storage keys.
- **FR-017**: The page and dialog MUST work from 320px wide without sideways scrolling, pass automated accessibility checks, and follow the design-system tokens (colours, radius, type, spacing). The screenshot's look is reproduced with UzaPro's tokens, not copied pixel for pixel.
- **FR-018**: The Help Center article about permissions and roles MUST be updated to describe role cards and per-module Read, Write and Delete.

### Key Entities

- **Role**:
  - id, name, colour, built-in flag (Owner / Admin, Accountant, Cashier, Store keeper) or custom;
  - its people (names for avatars) and user count;
  - its access map.
- **Module access**: for one role and one module, which of Read, Write and Delete are granted, and whether the row is locked (owner, Dashboard, Profile).
- **Module**: an existing app module from the registry, with its id, label, icon and sidebar section.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An owner can change one module's access for one role and save it in under 20 seconds, with at most 3 clicks after opening Permissions.
- **SC-002**: Before any edit, every role sees exactly the same modules and tabs as it did before this feature, checked across all 4 roles.
- **SC-003**: After an edit that removes a module, that module is gone from every place the role could reach it (sidebar, search, quick tasks, alerts, Uza AI, direct link): 0 leaks.
- **SC-004**: The page and dialog show no sideways scrolling and no clipped controls at 320, 375, 390, 414, 768 and 1440px widths, and pass the automated accessibility scan with no serious or critical issues.
- **SC-005**: All 21 modules are listed in the Edit Role dialog. None is missing, including Point of sale, Help and Profile.

## Assumptions

- The screenshots set the layout and interaction pattern. Colours, fonts, radii and icons come from UzaPro's design system (Principle IV). The screenshot's breadcrumb maps to the existing page header.
- The rows in the Edit Role dialog are modules, not roles as in the screenshot, because the user asked for modular permissions.
- User counts per role come from the canvas's Permissions table (1, 2, 4 and 3). Avatars use the team members known for each role; any remaining count shows as "+N".
- People keep their current role. Moving people between roles stays in Team and Settings › Staff logins and is out of scope.
- Changes last for the browser session only, like the rest of the demo (Principle III).
- The four built-in demo roles stay the roles the role switcher offers. Custom roles appear on the Permissions page, but you can't switch the demo into them.

## Design deviations

Required by Constitution Principle I. The canvas still shows the static four-row Permissions table. This feature changes it at the user's direct request.

| Canvas | Built | Why |
|---|---|---|
| Permissions is a read-only table: Role, Users, Modules, Scope | A grid of role cards with Edit Role, Add New Role and a "…" menu | The user asked for this view (reference screenshots, 2026-11-13) |
| Scope is one word per role (Full, Edit, Limited) | Read, Write and Delete per module | The user asked for modular permissions |
| Role visibility is fixed per demo role | Derived from each role's saved Read access | "Fix the permissions": the page and the app must agree |
| The Edit Role rows in the screenshot are roles | Rows are modules, grouped by sidebar section | Modular permissions, set per role |
| The canvas Scope (Full, Edit, Limited) | Seed levels: Delete for the owner; Write on each role's working modules and Read elsewhere (research R2) | The canvas has no per-module levels |
| The screenshot's selected buttons and primary button are blue | Brand green (`--action`) | Green is the only brand colour (Principle IV) |
| The screenshot's "+N" avatar overlaps the stack | "+N" sits next to the stack | Keeps the initials readable |
| The screenshot's labels are in title case: "Add New Role", "Edit Role", "Role Access" | Sentence case: "Add new role", "Edit role", "Role access" | Design-system content rule (Principle IV) |
