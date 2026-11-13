# Contract: UI (permissions)

## Route

`/permissions/permissions` (unchanged). Only the owner can reach it, as before. The tab's screen
changes from the generic table to `RoleCards`.

## Page: RoleCards

- **PageHeader**:
  - eyebrow "People", title "Permissions", subtitle "What each role can see and do" (registry);
  - action: a primary Button with a `plus` icon, "Add new role". Sentence case per Principle IV;
    the screenshot shows "Add New Role".
- **Grid**: `grid gap-4`; `grid-cols-1`, then `sm:grid-cols-2` (≥640), `lg:grid-cols-3` (≥1024)
  and `xl:grid-cols-4` (≥1280).
- **Card** (`Card`, padding 20) is an `article` with the accessible name `{Role name}`:
  - **Row 1**:
    - a 40px tile `rounded-md` with `bg: var(--role-N)` and a white `folder-lock` icon at 20px;
    - the role name `type-card-title`, wrapping;
    - `RowActions` labelled "{Role name} options".
  - **Row 2**:
    - the avatar stack: 28px circles, overlapping by 8px, with initials on tint tokens and a 2px
      surface ring;
    - "+N" in the same circle style;
    - "Total N users" or "Total 1 user" in `type-body text-text-muted`.
  - **Row 3**: "Can open X of Y modules" in `type-caption text-text-muted`.
  - **Row 4**: a full-width secondary Button with a `user-cog` icon, "Edit role". Its accessible
    name is "Edit role: {Role name}".
- **Menu items**:
  - Owner: Duplicate.
  - Others: Rename, Duplicate, Delete (danger).

## Dialog: EditRoleDialog (Modal)

- **Title**: "Edit role". **Subtitle**: `{Role name}`.
- **Body**:
  - an `h3` "Role access";
  - for the owner, the note "The owner always has full access." (`type-caption`);
  - sections in sidebar order, each with an eyebrow heading (the section name);
  - each row is a `div` with `role="group"` and `aria-label="{Module}"`:
    - left: the module icon (16px, muted) and name (`type-body-strong`);
    - right: 3 buttons, Read, Write and Delete.
  - Rows are separated by 1px `--border` dividers.
- **Access button**:
  - `type="button"`, `aria-pressed`, `aria-label="{Module}: {Level}"`;
  - height 40, min-width 88, `rounded-md`;
  - **selected**: a `check` icon (16px), `border-2 border-primary`, `text-primary-text`;
  - **unselected**: `border border-border text-text`;
  - **locked**: `disabled`, with the selected look at 60% opacity.
- **Footer**:
  - "Cancel" (secondary) closes and discards;
  - "Save" (primary) is disabled until the draft differs from what's saved.
  - Escape, ✕ and Cancel all discard.
- **Below 640px**: each row is `flex-col`, and the buttons sit in a `grid grid-cols-3 gap-2`.

## Dialog: RoleNameDialog (Modal, width 420)

- **Title**: "Add new role" or "Rename role".
- **Field**: "Role name", with an inline error per data-model.
- **Buttons**: Cancel; then "Add role" or "Save".

## Gating rules (app-wide)

| Place | Need | Behaviour without it |
|---|---|---|
| Header `Actions` slot | write | Not rendered |
| `?action=` / `?edit=` in the URL | write | Params removed; toast "Your role can only view {Module}." |
| `RowActions` items | `item.need ?? rowActionNeed(label)` | Item removed; trigger hidden if nothing is left |
| Inline buttons in record views and lists (research R5) | write or delete | Not rendered (`<Can>`) |
| Dashboard quick task with `action` | write on its target module | Tile hidden |
| POS "Open shift" / "Launch" | write on `pos` | Hidden; the card shows "View only" |
| Module in sidebar, search, links, Uza AI | read | Hidden, or redirect to /dashboard (existing guard) |

## Toasts and copy

- "{Role} access saved."
- "{Name} added."
- "Role renamed to {Name}."
- "{Name} deleted."
- "Move {N} people to another role first."
- "Your role can only view {Module}."
- Delete confirm: title "Delete {Name}?", message "This role will be removed. This can't be undone.", confirm "Delete role".
