# Data model: Modular role permissions

## AccessLevel

```ts
type AccessLevel = "none" | "read" | "write" | "delete";
```

- **Order**: none < read < write < delete.
- `has(level, need)` is true when `rank(level) >= rank(need)`.
- **Rule**: a level grants everything below it (Clarification Q1).

## RoleDef

| Field | Type | Notes |
|---|---|---|
| `key` | `string` | `"owner" \| "accountant" \| "cashier" \| "store"` for built-in roles; `"r-{n}"` for custom roles |
| `name` | `string` | Shown as follows. Required, at most 40 characters, unique ignoring case. |
| `colour` | `1..6` | Index into `--role-1..6` |
| `builtIn` | `boolean` | True for the 4 demo roles (the ones the role switcher offers) |
| `locked` | `boolean` | True only for Owner / Admin: full access, no rename or delete |
| `users` | `number` | Seed values: 1, 2, 4, 3. Custom roles: 0. |
| `people` | `string[]` | Names for the avatars; from `ppl/team` for built-in roles; `[]` for custom roles |

Built-in role names:

| Key | Name |
|---|---|
| `owner` | "Owner / Admin" |
| `accountant` | "Accountant" |
| `cashier` | "Cashier" |
| `store` | "Store keeper" |

## RoleAccess

`Record<ModuleId, AccessLevel>` for each role key, covering all 21 modules.

**Locked rows**:
- `home` and `prof` are always at least Read for every role.
- `perm` is locked at none for every role except the owner (only the owner manages permissions).
- Every row is Delete for the owner.

`lockedLevel(roleKey, moduleId)` returns the forced level (owner: delete; `perm`: none; `home`/`prof`: read), and `lockedRow` is true when it returns one.

## PermissionsState (store slice `permissions`)

```ts
interface PermissionsState {
  roles: RoleDef[];                                    // display order: built-in roles first, then custom roles in the order created
  access: Record<string, Record<ModuleId, AccessLevel>>;
  nextCustom: number;                                  // for r-{n} keys
}
```

The slice is seeded from `fixtures/permissions.ts` (research R2), is not persisted, and a reload
restores the seed.

## Derived values

| Name | Definition |
|---|---|
| `effectiveRole(state, roleId)` | `ROLES[roleId]` with `mods` set to the modules where the level is Read or higher. The owner keeps `mods` undefined. |
| `levelFor(state, roleId, moduleId)` | The stored level for that role and module |
| `moduleSummary(access)` | `{ open: count(level ≥ read), total: 21 }`, shown as "Can open X of Y modules" |
| `avatarStack(role)` | The first 4 of `people` as initials; `extra = users − shown` ("+N" when above 0) |
| `rowActionNeed(label)` | `"read" \| "write" \| "delete"` from the label classes (research R4) |

## Commands and their state changes

| Command | Effect | Toast |
|---|---|---|
| `saveRoleAccess(key, access)` | Replaces `access[key]`. Locked rows are forced back to their locked values. | "{Name} access saved." |
| `addRole(name)` | Adds a RoleDef with the next colour and access `{home: read, prof: read, others: none}`, and returns the key | "{Name} added." |
| `renameRole(key, name)` | Validates the name, then updates it. Refused for the owner. | "Role renamed to {Name}." |
| `duplicateRole(key)` | Adds a copy named "{Name} copy" (with " 2", " 3" and so on if that name is taken), with the same access and 0 users | "{Copy} added." |
| `deleteRole(key)` | Refused for the owner or for roles with users. Otherwise removes the role and its access. | "{Name} deleted." / "Move {N} people to another role first." |

Validation messages:
- "Enter a role name."
- "Use 40 characters or fewer."
- "A role with this name already exists."
