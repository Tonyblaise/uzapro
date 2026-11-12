# Data Model: Office, People and Settings

These are additions to `AppState` (`src/data/store/state.ts`). All of them are seeded verbatim from
the design and reset on reload.

## calendar

- `events: CalEvent[]`. Each event has:
  - `id`
  - `date` (ISO), `time` ("HH:MM" or "")
  - `endDate`, `endTime` (both may be "")
  - `address`
  - `title`
  - `type`: Work, Accounts, Stock, Marketing, or a custom type
  - `notes`
- `types: string[]`: the four seed types plus any added.
- Validation: `title` must not be empty, and `date` is required.
- Helpers in `src/data/calendar.ts` (pure):
  - `monthGrid(year, month)`
  - `eventsOn(date)`
  - `comingUp(events, today = CAL_TODAY, n = 5)`
  - `visibleEvents(events, role)`: hides Accounts events for roles with `tabs` and no `figures`.

## docs

- `folders: Folder[]`. Each folder has `id`, `name`, `parent` (`company` is the root) and `access`.
- `files: DocFile[]`. Each file has:
  - `id`
  - `name`, with its extension
  - `folder`
  - `size` (KB)
  - `modified` (ISO)
  - `owner`
  - `linked` ("—" or a record)
  - `notes`
- `starred: string[]`: ids of starred files and folders.
- Derived:
  - kind by extension: image, document or spreadsheet;
  - storage totals for each kind;
  - `subtree(folderId)`;
  - the breadcrumb path.
- Rules:
  - A rename keeps the extension.
  - A new folder takes its parent's access.
  - Deleting a folder removes its whole subtree and all files in it.

## settings

- `biz: BusinessProfile`: the `UZ_BIZ` keys plus `logo` (a data URL or "").
- `groups: Group[]`. Each group has `name`, `parent` and `code`.
- `branches: Branch[]`. Each branch has `name`, `code`, `group`, `phone`, `email`, `city`,
  `address` and `hq`.
- `pos: Record<string, boolean>`: POS sales on or off for each storage location.
- `terminals`:
  - `included`, `purchased`, `price`
  - `list: Terminal[]`. Each terminal has `id`, `name`, `code`, `branch`, `store`, `active`,
    `added` and `main`.
- Invariants:
  - Exactly one branch is the headquarters.
  - Branch and group names are unique (case-insensitive).
  - A group can't be its own ancestor.
  - Active terminals can't exceed `included + purchased`.
  - The main terminal can't be deleted, and neither can the last remaining terminal.
- Storage locations are `stock.stores` (existing), each `{ name, branch, type }`, with `pos[name]`.
  - Delete is blocked while the store holds stock or a terminal uses it.
  - A branch's Delete is blocked while it has stores or is the headquarters.
  - A group's Delete is blocked while it has branches or sub-groups.

## profiles

- `Record<RoleId, Profile>`. Each profile has `first`, `last`, `email`, `phone`, `country`, `city`,
  `address` and `photo` (a data URL or "").
- Seeded from `ROLES` (the name split into first and last) and the design's defaults.
- `currentUserName(state)` returns `${first} ${last}` for the session role.

## generic

- `Record<string, GenericRow[]>`, keyed `"{moduleId}/{tabSlug}"`. The rows hold cell values and
  pills, exactly as in the registry fixture.
- The fixture `src/data/fixtures/generic.ts` also holds the form fields (label, value, placeholder,
  full width) and the report card titles for each tab. Forms and cards are read-only data.
