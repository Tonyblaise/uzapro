# Contract: Data-access additions (`@/data`)

UI imports only from `@/data`. Commands return `Promise<Result<T>>` and carry the design's message.

## Reads

```ts
// Calendar
useCalendarEvents(): CalEvent[]            // already filtered for the role (FR-003)
useCalendarTypes(): string[]
monthGrid(year, month); comingUp(events); CAL_TODAY

// File Manager
useDocs(): { folders; files; starred }
useStorageTotals(): { total; images; documents; spreadsheets }   // KB
folderPath(id); subtree(id); fileKind(name)

// Settings
useBusinessProfile(): BusinessProfile; bizCompletion(biz)
useBranches(); useBranchNames(): string[]  // replaces UZ_LOC.branches in pickers
useGroups(); useStorageLocations()         // stock.stores + pos flag + in-use flags
useTerminals(): { included; purchased; price; list }

// Profile
useProfile(): Profile; useCurrentUserName(): string

// Generic screens
useGenericRows(moduleId, tab): GenericRow[]
GENERIC_FORMS / REPORT_CARDS (read-only fixtures)
```

## Commands

```ts
saveEvent(input, id?)          // "Event saved."
deleteEvent(id)                // "{title} deleted."

createFolder(name, parent)     // "{name} created in {parent}."
uploadFile(input)              // "{name} added to {folder}."
renameDoc(kind, id, name, notes)  // "Changes saved."
moveFile(id, folder)           // "Moved to {folder}."
deleteDoc(kind, id)            // "{name} deleted."
toggleStar(id)

saveBusinessProfile(patch)     // "Business profile saved."
setLogo(dataUrl)               // "Logo updated. It shows on receipts and invoices."
saveBranch(input, edit?)       // "{name} created." / "{name} saved." (+ store/terminal suffixes)
setHeadquarters(name)          // "{name} is now the headquarters."
deleteBranch(name)
saveGroup(input, edit?); deleteGroup(name)
saveStorageLocation(input, edit?); setPos(name, on); deleteStorageLocation(name)
saveTerminal(input, edit?); setTerminalActive(id, on); deleteTerminal(id); addPaidSlot()

saveProfile(patch)             // "Profile saved."
setPhoto(dataUrl | "")         // "Photo updated." / "Photo removed."
changePassword(current, next)  // "Password updated. Use it next time you log in."

deleteGenericRow(moduleId, tab, key)   // "{name} deleted."
```

Each command's exact validation and wording come from the design (research R2–R6).

## Integration changes

- `useBranchNames()` replaces `UZ_LOC.branches` in the warehouse, account and expense forms.
- `currentUserName(state)` replaces `ROLES[role].name` in the commands' "who" and in the header.
- `saveStore` and `deleteStore` (feature 001) honour the new rules for POS, terminals and stock in
  use.
