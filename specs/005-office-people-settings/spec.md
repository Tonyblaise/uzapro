# Feature Specification: Office, People and Settings

**Feature Branch**: `005-office-people-settings`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "I want to build the reports, team, permissions, calendar, messages,
filemanager, profile and settings"

## Scope at a glance

Eight modules from the canvas come into scope:
- Reports (`rep`)
- Team (`ppl`)
- Permissions (`perm`)
- Calendar (`cal`)
- Messages (`comm`)
- File Manager (`docs`)
- Profile (`prof`)
- Settings (`set`)

The design gives them two levels of depth, and this feature copies both as they are (Constitution
Principle I):

- **Working screens** with their own behaviour:
  - Calendar.
  - File Manager.
  - Profile.
  - Settings › Business profile, Branches, Location groups, Storage locations and Terminals.
- **Standard list and form screens**: Reports, Team, Permissions, Messages, and Settings › Staff
  logins, Taxes, Connected apps and Import and export. The canvas gives these only its shared
  behaviour, described in US5. The demo shows exactly that and invents no extra behaviour.

The Help module (`sup`) is not part of this feature.

## Clarifications

### Session 2026-11-12

- Q: For the screens the design treats as plain lists and forms (Reports, Team, Permissions, Messages, and Settings › Staff logins, Taxes, Connected apps, Import and export), should the demo copy the design's limited behaviour exactly, or add working behaviour? → A: Copy the design exactly. Report cards do nothing, Messages never sends, and "New" shows "Record created." without adding a row.
- Q: Should the calendar treat 1 Nov 2026 as "today", as the design's calendar does, or 10 Nov 2026, the date the rest of the demo uses? → A: 1 Nov 2026, as in the design's calendar; it sets the "today" dot, "Coming up", "Today" and the date "New event" starts on.

## User Scenarios & Testing *(mandatory)*

Visibility follows the design's role definitions:

| Role | Can open |
|---|---|
| Owner | every module and tab in this feature |
| Accountant | Calendar, Reports, Team and File Manager |
| Store keeper | Calendar and File Manager |
| Cashier | Calendar only |

Only the Owner sees Permissions, Messages, Profile and Settings. For other roles, the user menu's
Profile and Settings links open the dashboard instead, as in the design.

### User Story 1 - Plan the business calendar (Priority: P1)

The presenter opens Calendar and sees November 2026 as a month grid (Monday to Sunday). Each day
shows coloured event chips by type (Work, Accounts, Stock, Marketing), and a "Coming up" list sits
below the grid. They move between months and return with "Today". They open an event to see its
details (title, notes, start, end, address) and edit or delete it. They add an event with "New
event" or by clicking an empty day.

**Why this priority**: it is the most visual and interactive of these screens, and every role can
open it.

**Independent Test**: open Calendar and confirm November 2026 shows the seed events. Add an event
on 20 November and confirm it appears on that day with "Event saved.".

**Acceptance Scenarios**:

1. **Given** Calendar, **When** it opens, **Then** it shows November 2026 with the design's seed
   events on their days, and "Coming up" lists the next 5 events from 1 Nov 2026.
2. **Given** "New event" or an empty day, **When** the presenter enters a title and start date and
   saves, **Then** the event appears on its day, its details open, and "Event saved." is shown.
   Saving is blocked without a title or a start date.
3. **Given** an event's details, **When** the presenter chooses Delete and confirms ("Delete
   {title}?" / "This permanently deletes the event."), **Then** the event is removed and
   "{title} deleted." is shown.
4. **Given** the Cashier or the Store keeper, **When** they open Calendar, **Then** Accounts events
   are hidden.

---

### User Story 2 - Manage company files (Priority: P1)

The presenter opens File Manager. It shows storage rings (Total, Images, Documents, Spreadsheets,
each out of 5 GB) and the "All Files" area with:
- a type filter;
- newest or oldest sort;
- a search box that also matches the linked record and notes;
- a list or grid toggle;
- breadcrumbs inside folders.

They open folders and files, star items, rename a file or folder and edit its notes, move a file to
another folder, and "download" a file (message only). They also create folders, upload files, and
delete files or folders. Deleting a folder warns how many subfolders and files go with it.

**Why this priority**: a rich, self-contained screen that the Owner, Accountant and Store keeper all
use.

**Independent Test**: create the folder "Receipts" inside a seed folder and confirm the message
"Receipts created in {parent}." and that it is listed there. Upload a file into it and confirm
"{name} added to Receipts.".

**Acceptance Scenarios**:

1. **Given** File Manager, **When** the presenter searches by a file name, **Then** only matching
   items are listed. When nothing matches, "No files match that search." is shown.
2. **Given** a file, **When** the presenter edits its name and notes and saves, **Then** the name
   keeps its file extension and "Changes saved." is shown. Saving is blocked with an empty name.
3. **Given** a file's details, **When** the presenter picks another folder, **Then** the file moves
   and "Moved to {folder}." is shown.
4. **Given** a folder with contents, **When** the presenter deletes it, **Then** the confirmation
   states the number of subfolders and files, and confirming removes them all and shows
   "{name} deleted.".
5. **Given** Upload, **When** no file is chosen or the name is empty, **Then** saving is blocked.

---

### User Story 3 - Set up the business structure (Priority: P1)

Under Settings the Owner manages:
- the **business profile**: logo, a completion ring showing missing required details, and the
  Contact, Location, Registration and "How you sell" cards, each editable;
- **branches**: add, edit, set as headquarters, delete;
- **location groups**: add, edit, delete;
- **storage locations**: add, edit, allow or stop sales (POS), delete;
- **terminals**: slots, add, edit, activate or deactivate, delete, add a paid slot.

An explainer strip above the Branches, Location groups and Storage locations tabs describes how the
three fit together.

**Why this priority**: it is the setup the rest of the demo relies on (branches and stores appear
in other modules' pickers).

**Independent Test**: add the branch "Mombasa" with "also create a store" ticked. Confirm
"Mombasa created. Mombasa Store added." is shown, the branch is listed, and the new store appears
under Storage locations and under Stock › Warehouses.

**Acceptance Scenarios**:

1. **Given** Business profile, **When** the presenter fills a missing required detail and saves,
   **Then** the completion ring updates and "Business profile saved." is shown. Saving is blocked by
   an invalid email ("Check the email").
2. **Given** Branches, **When** the presenter adds a branch with a name already in use, **Then**
   saving is blocked ("Name already used").
3. **Given** a branch that has storage locations, or is the headquarters, **When** the presenter
   opens its actions, **Then** Delete is unavailable.
4. **Given** Terminals with every slot in use, **When** the presenter activates another terminal,
   **Then** "All slots are in use. Deactivate a terminal or add a paid slot first." is shown.
   "Add a paid slot" adds a slot ("Paid slot added (KES 1,000 a month).").
5. **Given** a storage location that holds stock or has a terminal, **When** the presenter opens
   its actions, **Then** Delete is unavailable.

---

### User Story 4 - Keep my profile up to date (Priority: P2)

The Owner opens Profile and:
- changes or removes their photo (JPG or PNG up to 2 MB);
- edits their personal details and address, with Undo and Save available only once something has
  changed;
- changes their password, with the design's five rule chips (8+ characters, uppercase, lowercase,
  number, symbol) and a confirmation field.

**Why this priority**: useful for the demo but self-contained.

**Independent Test**: change the first name to "Anthony" and save. Confirm "Profile saved." is
shown and the header user chip shows the new name.

**Acceptance Scenarios**:

1. **Given** Profile with no changes, **When** the presenter looks at the buttons, **Then** Undo
   and "Save changes" are unavailable.
2. **Given** an invalid email, **When** the presenter tries to save, **Then** saving is blocked and
   "Enter a valid email address." is shown.
3. **Given** a new password that meets every rule and matches its confirmation, **When** the
   presenter saves, **Then** "Password updated. Use it next time you log in." is shown. Saving is
   blocked if any rule fails, the two entries differ ("The new passwords don't match."), or the new
   password equals the current one.
4. **Given** a file that is not a JPG or PNG, or is larger than 2 MB, **When** it is chosen as the
   photo, **Then** "Use a JPG or PNG image." or "That photo is bigger than 2 MB." is shown.

---

### User Story 5 - Browse reports, team, permissions, messages and other settings (Priority: P2)

The presenter browses these screens:

| Screen | What it shows |
|---|---|
| Reports | report cards on Popular, Sales, Money and Stock; the "Build a report" form; the "Sent automatically" list |
| Team | the team list |
| Permissions | the role permissions list |
| Messages | the "Send message" form; the Saved messages, Sent messages, Campaigns and Scheduled lists |
| Settings | Staff logins, Taxes and Connected apps lists; the Import and export form |

These use the design's shared behaviour:
- Lists have a search box, "Showing N of M", "Export CSV" (copies the rows), a View drawer for
  each row, and a Delete action for the Owner ("Delete {name}?" / "This permanently deletes this
  record." / "{name} deleted.").
- Forms show "Changes saved." when saved.
- The header "New" button opens a simple "New record" form (Name, Status, Notes), and saving it
  shows "Record created.".

**Why this priority**: it completes the demo's navigation with the design's content. These screens
carry no business logic of their own in the canvas.

**Independent Test**: open each of these tabs as the Owner and confirm the seed rows and cards
match the design. Delete a Saved messages row and confirm "{name} deleted.".

**Acceptance Scenarios**:

1. **Given** Reports › Popular, **When** it opens, **Then** the 8 report cards are listed, each
   with "Run, schedule or export".
2. **Given** a list tab, **When** the presenter types in its search box, **Then** the rows filter
   and the "Showing N of M" count updates.
3. **Given** the Accountant, **When** they open a list tab, **Then** Delete is not offered.

---

### Edge Cases

- Deleting the folder the presenter is currently in returns them to its parent.
- A file's extension is kept when it is renamed.
- A new folder takes its parent's access.
- The headquarters branch and the main terminal cannot be deleted. Neither can the last remaining
  terminal.
- A group that has branches or sub-groups cannot be deleted. A group cannot be made its own parent,
  directly or through another group.
- Calendar end dates and times are not checked against the start, as in the design.
- Reload resets every module in this feature to the design seed (Constitution Principle III). The
  photo and logo last only for the session.

## Requirements *(mandatory)*

### Functional Requirements

**Calendar**

- **FR-001**: Calendar MUST show a Monday-first month grid with month navigation and "Today" (which
  returns to November 2026). Each day shows its events as chips coloured by type. Below the grid,
  "Coming up" lists the next 5 events on or after 1 Nov 2026.
- **FR-002**: Users MUST be able to view, add, edit and delete events. The fields are: title ("What
  is happening?"), start date, optional start time, end date, optional end time, optional address,
  type (from the design's list; new types can be added) and description. Saving is blocked without
  a title or a start date. The design's messages apply.
- **FR-003**: The Cashier and the Store keeper MUST NOT see Accounts events.

**File Manager**

- **FR-004**: File Manager MUST show:
  - the storage rings;
  - the type filter (All file types, Folders, Images, Documents, Spreadsheets, Starred);
  - newest or oldest sort;
  - search across file name, linked record and notes;
  - the list or grid toggle;
  - breadcrumbs;
  - the design's empty-state texts.
- **FR-005**: Users MUST be able to star items, open folders, view file details, rename items and
  edit their notes, and move files between folders. "Download" shows "Downloading {name}." and
  saves no file.
- **FR-006**: Users MUST be able to create folders ("{name} created in {parent}.") and upload files
  ("{name} added to {folder}."), with the design's blocking rules.
- **FR-007**: Users MUST be able to delete files and folders. The confirmation states what will be
  removed. Deleting a folder removes everything in it.

**Settings**

- **FR-008**: Business profile MUST show:
  - the logo or initials, with "Change logo" (JPG, PNG or SVG, up to 2 MB);
  - the completion ring over the design's 10 required details, titled "{n} required details
    missing" or "Profile complete";
  - up to 4 "+ {detail}" shortcuts (and "+{n} more");
  - the four section cards, each with Edit.

  Saving follows the design's validation and messages.
- **FR-009**: Users MUST be able to add, edit, delete and set as headquarters branches, with the
  design's blocking rules and messages. When adding, they can also create the branch's store and a
  terminal.
- **FR-010**: Users MUST be able to add, edit and delete location groups. Cycles are excluded and
  in-use groups cannot be deleted. When adding, a branch, store and terminal can be created in turn.
- **FR-011**: Users MUST be able to add, edit, delete and switch POS sales on or off for storage
  locations. Storage locations MUST be the same records as Stock › Warehouses, so a change in
  either place shows in both.
- **FR-012**: Terminals MUST show the slot summary, search, the All/Active/Inactive filter and the
  terminal cards. Users MUST be able to add, edit, activate or deactivate and delete terminals,
  and add paid slots, with the design's slot rules and messages.
- **FR-013**: Branches added or renamed in Settings MUST appear in the branch pickers of other
  modules for the rest of the session. A branch typed as new in the Stock › Warehouses form MUST
  also be created as a Settings branch, with the next `BBL-BRN-` code and the first group, as the
  design's `setSync` does.

**Profile**

- **FR-014**: Profile MUST provide photo change and removal, personal details and address editing
  with Undo, and password change. The design's validation, rule chips and messages apply. Saving
  the profile updates the user's name everywhere the app shows it: the header chip and menu, "who"
  on new records, the dashboard greeting ("Welcome back, {name}", the full name as in the design)
  and the first name in the login message ("Welcome back, {first}.").

**Standard list and form screens**

- **FR-015**: The screens below MUST show the design's seed cards, rows and form fields:
  - Reports (all 6 tabs);
  - Team;
  - Permissions;
  - Messages (all 5 tabs);
  - Settings › Staff logins, Taxes, Connected apps, and Import and export.
- **FR-016**: Their behaviour MUST follow the design's shared behaviour exactly, adding nothing
  beyond it (Clarification Q1):
  - list search with "Showing N of M";
  - "Export CSV" copies the rows ("Copied {n} rows as CSV.");
  - a View drawer for each row;
  - Delete for the Owner only, with confirmation;
  - form Save shows "Changes saved.";
  - the header "New" button opens the "New record" form, and saving it shows "Record created."
    without adding a row;
  - report cards are shown but do nothing when clicked.

**Cross-cutting**

- **FR-017**: Module and tab visibility MUST follow the design's role definitions (the table under
  User Scenarios).
- **FR-018**: All changes MUST appear immediately and reset on reload. Wording, references and
  numbers MUST match the design.

### Key Entities

- **Event**: id, title, date, optional time, optional end date and time, optional address, type
  (Work, Accounts, Stock, Marketing, or a custom type), notes.
- **Folder**: id, name, parent folder, access.
- **File**: id, name with extension, folder, size, type (image, document, spreadsheet), modified
  date, owner, linked record, notes, starred.
- **Business profile**: name, trading name, type, industry, contact, location, registration, KRA
  PIN, how the business sells, logo.
- **Branch**: name, code, group, city, phone, email, address, headquarters flag.
- **Location group**: name, code, parent group.
- **Storage location**: name, branch, type, POS sales on or off (the same record as a Stock
  warehouse).
- **Terminal**: name, code, storage location, active, main flag. **Terminal slots**: included count, paid
  count, monthly price.
- **Profile**: per role. First name, last name, email, phone, country, city, address, photo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side review, 100% of the screens, tabs, forms and dialogs in this feature
  match the design's layout, wording and figures, apart from documented deviations.
- **SC-002**: A presenter can add a calendar event, create a folder and upload a file, or add a
  branch with its store, each in under 1 minute.
- **SC-003**: For each of the four roles, 100% of visible modules and tabs match the design's role
  definitions, and a full click-through produces no visible errors.
- **SC-004**: A branch or storage location added in Settings is available in other modules' pickers
  and in Stock › Warehouses straight away, with no reload.

## Assumptions

- Seed data is ported verbatim from the design:
  - events (`UZ_EVENTS`, 10);
  - folders and files (`UZ_DOCS`, 21 folders, 19 files);
  - the business profile (`UZ_BIZ`);
  - branches (`UZ_BRANCHES`), groups (`UZ_GROUPS`), POS flags (`UZ_LOCPOS`) and terminals
    (`UZ_TERMS`);
  - the list rows and form fields in the module registry for the standard screens.
- The calendar's "today" is 1 Nov 2026, as in the design's calendar logic (Clarification Q2): it
  sets the today dot, "Coming up", the "Today" button and the date "New event" starts on. The rest
  of the demo stays on 10 Nov 2026.
- Uploads, photos and logos are read in the browser for the session only. Nothing is sent anywhere,
  and "Download" saves no file.
- Messages does not send anything. The demo shows the design's forms and lists only.
- Help (`sup`) remains a placeholder and is left for a later feature.
- Desktop is the primary demo target; phone width must stay usable.

## Design deviations

Required by Constitution Principle I.

| Deviation | Reason | Reference |
|---|---|---|
| The record drawer's Edit, Duplicate and Print buttons are shown disabled | The design gives them no handlers; a button that does nothing is an accessibility problem | FR-016 |
| The generic form's Cancel resets the fields | The design's Cancel has no handler | FR-016 |
| Export CSV copies the filtered rows (the design copies every row) | The shared list component from feature 001 | FR-016 |
| The generic delete confirmation, calendar delete and file edit/delete panels are URL-driven (`&confirm=delete`, `&step=delete`, `&step=edit`, `&kind=folder`) beyond the routes contract | Overlays are URL-driven in this app | contracts/routes.md |
| Dialogs and the event details modal use the shared Modal (heading size, padding, no header rule) rather than the design's own markup | Reuses the shared primitive, as features 003–004 do; content and order are unchanged | SC-001 |
| Colours the design names without a token (`--green-300`, `--green-400`, `--info-bg`, `--warning-bg`, `--warning-border`) use the nearest tokens | Constitution Principle IV (no raw hex) | SC-001 |
| The calendar's viewed month, File Manager's type filter, sort and view, and new cities or towns are kept for the screen only and reset on reload | Matches the design's component state; nothing is persisted (Principle III) | FR-001, FR-004 |
| An inline new folder in a folder picker shows "{name} created in Company." | It reuses the folder command, which always confirms; the design's quick-add is silent | FR-006 |
| Empty calendar days have a keyboard-reachable "Add an event on {date}" button; File Manager cards, star and view toggles are keyboard and screen-reader accessible; card Edit buttons are named "Edit {section}" | Accessibility (Principle IV); no visual change | SC-001 |
| Uploaded files are owned by the current user (the design hardcodes Tony Ashiuma) | Matches the profile-driven user name (FR-014) | FR-006 |
| The design seed has 19 files (the spec said 18) | Ported verbatim | Assumptions |
| There are 17 generic tabs (Reports 6, Team 1, Permissions 1, Messages 5, Settings 4) | Count from the design | FR-015 |
| Deleting a storage location from Stock › Warehouses is also blocked while a terminal uses it | Storage locations and warehouses are the same records (FR-011) | FR-011 |
