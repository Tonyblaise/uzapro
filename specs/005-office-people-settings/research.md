# Research: Office, People and Settings

Sources:
- `design/canvas/Uzapoint ERP.dc.html` (markup up to about line 2793, logic from line 2794)
- `design/canvas/erp-data.js`
- the two design surveys taken during `/speckit-specify`

Line numbers are approximate.

## R1. Standard list and form screens (Reports, Team, Permissions, Messages, four Settings tabs)

- The design gives these modules no logic of their own. They render through the generic `table`,
  `form` and `cards` kinds:
  - **Table**:
    - "Search this list", "Showing N of M" and "Export CSV" (toast "Copied {n} rows as CSV.").
    - Clicking a row, or the View row action, opens the `record` drawer: the row's first cell as the
      title, plus an "Overview" label/value list. Its Edit, Duplicate and Print buttons have no
      handlers.
    - Owner only (`canDelete = !role.tabs`): a Delete row action, the confirmation "Delete {name}?" /
      "This permanently deletes this record.", then the row is removed and "{name} deleted." is shown.
  - **Form**: uncontrolled fields. Save shows "Changes saved."; Cancel has no handler.
  - **Cards**: the title plus "Run, schedule or export". Clicking does nothing.
  - **Header "New"** (the last fallback in `headerActions`): opens the "New record" drawer (Name,
    Status `['Not finished','Active']` with add-new, and Notes). Create shows "Record created." and
    adds no row.
- **Decision**: one shared, data-driven set of generic screens (`GenericTable`, `GenericForm`,
  `ReportCards`, `NewRecordDrawer`, `RecordDrawer`). Their content comes from a verbatim fixture of
  the module registry's rows, fields and items. The rows live in a `generic` store slice keyed by
  `module/tab`, so Delete works and resets on reload. Clarification Q1: nothing beyond the design.
- **Rationale**: twelve tabs share identical behaviour, and one implementation keeps them
  consistent with the design.
- **Alternatives**: a bespoke screen per module. Rejected: it duplicates code and invites
  behaviour the design doesn't have.
- The design's dead Edit, Duplicate and Print buttons in the record drawer are rendered disabled
  (logged as a deviation), because buttons that do nothing are worse for accessibility. The dead
  form Cancel resets the form instead (deviation).

## R2. Calendar (`calData`, `calView`, `calFormOpen`, `calStore`, around lines 3185–3248; markup lines 166–211, 1469–1489, 1617–1643)

- Month grid only, Monday first. Header: Previous and Next month, "Today", and the title
  "{Month} {year}". Chip tones: Accounts = warning, Work = info, Stock = neutral,
  Marketing = success. Today (1 Nov 2026, Clarification Q2) carries an action-colour dot.
- "Coming up" lists the first 5 events on or after 1 Nov 2026.
- Event details modal: title, notes, "{d Month yyyy} at {h:mm AM/PM}" start and end, address if set,
  and Delete and Edit buttons.
- Form drawer ("New event" / "Edit event"):
  - Fields: "What is happening?", Start date, Start time (optional), End date, End time (optional),
    Address (optional), Type (Work, Accounts, Stock, Marketing; new types allowed) and Description.
  - Saving is blocked without a title or a start date. Saving reopens the details and shows
    "Event saved.".
  - Cancel returns to the details when editing.
- Delete confirmation: "Delete {title}?" / "This permanently deletes the event.", then
  "{title} deleted.".
- Roles with `tabs` but no `figures` (Cashier, Store keeper) do not see Accounts events.
- Seed: `UZ_EVENTS`, 10 events from 31 Oct to 31 Dec 2026 (id, date, time, title, type, notes).
- **Decision**: a `calendar` slice holding events and custom types, and pure helpers for the month
  grid and coming-up list in `src/data/calendar.ts`, tested with Vitest. `CAL_TODAY = "2026-11-01"`.

## R3. File Manager (`docsData`, `docsView`, `docsDrawer`, `docEdit*`, `docRemove`, around lines 3251–3417; markup lines 1154–1208, 1545–1615, 2745–2775)

- Seed: `UZ_DOCS`, 21 folders (id, name, parent, access; `company` is the root) and 18 files (name,
  folder, size in KB, modified, owner, linked record). The logic works on a copy.
- Layout:
  - Storage rings Total, Images, Documents and Spreadsheets, each "of 5 GB". The type comes from
    the file extension.
  - Type filter, Newest or Oldest sort, search over name, linked record and notes, a list or grid
    toggle (`docView`), and breadcrumbs.
  - Empty states: "No files match that search." / "Nothing here yet.".
- Star toggle per item.
- Row actions:
  - View: opens the folder or the file drawer.
  - Edit: rename plus notes. The extension is kept and the name can't be empty. "Changes saved.".
  - Delete, with the confirmation texts:
    - "This permanently deletes the file."
    - "…folder. It is empty."
    - "…folder and everything in it: {n} subfolders and {m} files."

    Afterwards: "{name} deleted.". If the open folder was inside the deleted one, the view returns
    to its parent.
- File drawer:
  - Size, Modified, Owner, Linked to and Notes.
  - A Folder select moves the file ("Moved to {folder}.").
  - Download shows "Downloading {name}." and saves nothing.
- New folder: name and "Create in". A new folder inherits its parent's access. "{name} created in
  {parent}.".
- Upload: a chosen file, File name, Folder (defaults to the current folder or `inbox`) and Notes.
  Blocked without a file or a name. "{name} added to {folder}.".
- Dead code: the `recent` view and `docPage` are not built. The folder-info drawer (`docFolder`)
  is reachable only after an edit or delete is cancelled; port that behaviour as it is.
- **Decision**: a `docs` slice (folders, files, starred ids). Uploads record only the name, size
  (KB) and owner (the current user). File contents are never kept or sent anywhere.

## R4. Business structure: branches, groups, storage locations, terminals (`setOpen` line 2977, modal definitions around lines 4864–4976, terminals around lines 4845–4862)

- Seed:
  - `UZ_GROUPS`: 1 group.
  - `UZ_BRANCHES`: 2 branches, Nairobi HQ (headquarters) and Import.
  - `UZ_LOCPOS`: Point of Sale and Main Store have POS on.
  - `UZ_TERMS`: 1 included slot, 0 purchased, KES 1,000 a month, and 1 terminal (the main one).
- **Storage locations are the Stock › Warehouses rows.** The design builds both tabs from the same
  `inv › Warehouses` rows.
- **Decision**: a `settings` slice holding groups, branches, the business profile, terminals, slots
  and POS flags. Storage locations stay in `stock.stores`, and the existing `saveStore` and
  `deleteStore` are reused and extended:
  - The Settings dialog adds the POS flag.
  - Delete is blocked when the store holds stock or has a terminal.
- The Settings explainer strip (`structHelp`) sits above Branches, Location groups and Storage
  locations.
- Branch names come from `settings.branches`. A new hook, `useBranchNames()`, replaces the static
  `UZ_LOC.branches` in the warehouse, account and expense forms (FR-013).
- Renaming a branch updates its stores and terminals. Renaming a group updates its branches and
  sub-groups.
- Each dialog's exact fields, blocking rules and messages are taken from the `setModal` definitions
  while implementing. That includes the cascading checkboxes for creating a store and a terminal,
  and the HQ switch.

## R5. Business profile (`bp` around lines 4829–4844; markup lines 1014–1057)

- Seed: `UZ_BIZ`, about 20 keys.
- Required for the completion ring (10): name, trading, type, industry, email, phone, location,
  address, city and pin.
- Title: "{n} required details missing" or "Profile complete". Up to 4 "+ {label}" chips, then
  "+{n} more"; each chip opens the matching section.
- Cards: Contact, Location, Registration and "How you sell", each with Edit. Edit profile opens the
  full modal.
- Saving is blocked by a bad email ("Check the email") or, in the full modal, an empty name.
  "Business profile saved.".
- Logo: JPG, PNG or SVG up to 2 MB, kept for the session as a data URL. Messages: "That logo is
  bigger than 2 MB." / "Logo updated. It shows on receipts and invoices.".
- **Decision**: `settings.biz` holds these keys, and a pure `bizCompletion()` helper is unit tested.

## R6. Profile (around lines 4987–5004; markup lines 1104–1152)

- The design keeps a profile record per role in `this._profiles`, seeded from `UZ_ROLES`, the
  nations list and 10 cities.
- Photo: JPG or PNG up to 2 MB. Messages: "Use a JPG or PNG image." / "That photo is bigger than
  2 MB." / "Photo updated." / "Photo removed.".
- Personal details and address:
  - Fields: First name, Last name, Email, Phone, Country, City (new cities allowed), Address.
  - Undo and "Save changes" are available only once something has changed. Saving is blocked by a
    bad email ("Enter a valid email address.") or an empty first name.
  - "Profile saved." Saving updates the role's display name.
- Password:
  - Fields: Current, New and Confirm, plus "Show passwords", and five rule chips.
  - Saving is blocked when Current is empty, a rule fails, the two new entries differ ("The new
    passwords don't match."), or the new password equals the current one.
  - "Password updated. Use it next time you log in." No password is stored or checked (the demo has
    fake login).
- **Decision**: a `profiles` slice keyed by role. The selector `currentUserName(state)` replaces
  `ROLES[role].name` wherever the app shows the user (header chip, menu, the "who" on new records).
  The password is checked in the form and never stored.

## R7. Role visibility and the user menu

- Existing role config: the Owner sees everything. The Accountant has `cal`, `rep`, `ppl` and
  `docs`, the Store keeper `cal` and `docs`, and the Cashier `cal`.
- The user menu's Profile and Settings links go to the dashboard for roles that can't see them,
  which the existing guard already does.
- Nothing to build beyond setting `inScope` on the modules.

## R8. Scope boundaries

- Help (`sup`) remains a placeholder.
- Messages never sends anything (Clarification Q1), and Connected apps has no connect logic.
