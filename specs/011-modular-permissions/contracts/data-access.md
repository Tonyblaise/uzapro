# Contract: data access (permissions)

Components import only from `@/data` (Principle II).

## Pure helpers (`src/data/permissions.ts`)

```ts
export const ACCESS_LEVELS: readonly AccessLevel[];        // ["read","write","delete"] (button order)
export function has(level: AccessLevel, need: AccessLevel): boolean;
export function pickLevel(current: AccessLevel, clicked: AccessLevel): AccessLevel; // same → "none"
export function lockedRow(roleKey: string, moduleId: ModuleId): boolean;
export function effectiveRole(state: AppState, roleId: RoleId): Role;
export function moduleSummary(access: Record<ModuleId, AccessLevel>): { open: number; total: number };
export function rowActionNeed(label: string): AccessLevel;  // research R4
export function validateRoleName(name: string, roles: RoleDef[], exceptKey?: string): string | null;
export function initials(name: string): string;
```

## Read hooks (`src/data/queries.ts`)

| Hook | Returns |
|---|---|
| `useRole()` / `useSession().role` | The **effective** role (changed: it used to be `ROLES[id]`) |
| `useRoleCards()` | `{ key, name, colour, locked, users, avatars: string[], extra, open, total }[]` |
| `useRoleAccess(key)` | `Record<ModuleId, AccessLevel>` for that role |
| `useModuleGroups()` | `{ section, modules: { id, name, icon }[] }[]` in sidebar order |
| `useAccess()` | `{ module, level }` from `AccessContext` (in `ModuleScreen`). Outside a module screen it is `{ module: undefined, level: "delete" }`. |
| `useCan(need, moduleId?)` | Boolean. With `moduleId`, it checks the current role's level for that module; otherwise it uses the context. |
| `AccessContext` | Exported for `ModuleScreen` |

## Commands (`src/data/commands/permissions.ts`)

All of these return `Result` like the existing commands, and set the toast.

```ts
saveRoleAccess(key: string, access: Record<ModuleId, AccessLevel>): Result<void>;
addRole(name: string): Result<string>;          // new key
renameRole(key: string, name: string): Result<void>;
duplicateRole(key: string): Result<string>;
deleteRole(key: string): Result<void>;
```

## Store

- `AppState.permissions: PermissionsState`, from `seedPermissions()` in `seed.ts`.
- Linked till tabs (feature 010) share the slice through the existing linked store, so a till
  follows the opener's permissions.
