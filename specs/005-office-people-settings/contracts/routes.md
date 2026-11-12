# UI Contract: Office, People and Settings routes

This extends the earlier route contracts. The guards and the `?action=` / `?view=` conventions are
unchanged.

## Routes now in scope

| Path | Tabs |
|---|---|
| `/reports` | `popular`, `sales`, `money`, `stock`, `build-a-report`, `sent-automatically` |
| `/team` | `team` |
| `/permissions` | `permissions` |
| `/calendar` | `calendar` |
| `/messages` | `send-message`, `saved-messages`, `sent-messages`, `campaigns`, `scheduled` |
| `/file-manager` | `all-documents` |
| `/profile` | `profile` |
| `/settings` | `business-profile`, `branches`, `location-groups`, `storage-locations`, `terminals`, `staff-logins`, `taxes`, `connected-apps`, `import-and-export` |

`/help` stays a placeholder.

## Search-param overlays

| Param | Valid on | Opens |
|---|---|---|
| `?action=new` | generic table and card tabs | "New record" drawer |
| `?view=<first cell>` | generic table tabs | Record drawer |
| `?action=new[&date=YYYY-MM-DD]` / `?view=<eventId>[&step=edit]` | `/calendar/calendar` | New event / event details / edit |
| `?dir=<folderId>` | `/file-manager/all-documents` | The open folder (breadcrumbs) |
| `?action=folder` / `?action=upload` / `?view=<fileId>` | `/file-manager/all-documents` | New folder / Upload / file drawer |
| `?action=new` / `?view=<name>` | `/settings/branches`, `location-groups`, `storage-locations`, `terminals` | Add / edit dialog |
| `?view=<section>` | `/settings/business-profile` | The edit modal for a section (`all` opens the full modal) |

## Header actions

| Tab | Button |
|---|---|
| Calendar | "New event" |
| File Manager | "New folder" and "Upload" |
| Settings › Branches | "Add branch" |
| Settings › Location groups | "Add group" |
| Settings › Storage locations | "Add storage location" |
| Settings › Terminals | "Add terminal" |
| Business profile, Profile | none |
| All generic tabs (Reports, Team, Permissions, Messages, Staff logins, Taxes, Connected apps, Import and export) | "New" |

Read the exact labels from the design's `headerActions` while implementing.

## Role visibility

| Role | Modules |
|---|---|
| Owner | all eight modules |
| Accountant | Calendar, Reports, Team, File Manager |
| Store keeper | Calendar, File Manager |
| Cashier | Calendar |

The generic Delete action is offered to the Owner only.
