/**
 * Pure permission helpers (feature 011, contracts/data-access.md). Each module has independent
 * Read, Write and Delete switches; Read decides visibility, Write gates create/edit, Delete gates
 * delete/void/cancel/undo.
 */
import { MODULES } from "@/config/modules";
import { ROLES } from "@/config/roles";
import { LOCKED_READ, OWNER_ONLY, ROLE_DEFS, SEED_WRITE } from "./fixtures/permissions";
import type { AccessLevel, AccessRight, ModuleAccess, ModuleId, Role, RoleAccess, RoleDef, RoleId } from "./types";
import type { AppState } from "./store/state";

/** Switch order in the Edit role dialog. */
export const ACCESS_LEVELS: readonly AccessRight[] = ["read", "write", "delete"];
export const LEVEL_LABEL: Record<AccessLevel, string> = { none: "No access", read: "Read", write: "Write", delete: "Delete" };

export const NO_ACCESS: ModuleAccess = { read: false, write: false, delete: false };
export const FULL_ACCESS: ModuleAccess = { read: true, write: true, delete: true };
export const READ_ONLY: ModuleAccess = { read: true, write: false, delete: false };

/** Whether `access` allows an action that needs `need`. */
export const has = (access: ModuleAccess | undefined, need: AccessLevel): boolean => need === "none" || !!access?.[need];

/**
 * Flips one switch. Turning Write or Delete on also turns Read on; turning Read off turns the
 * module off (a role can't write or delete where it can't look).
 */
export function toggleRight(a: ModuleAccess, right: AccessRight): ModuleAccess {
  const on = !a[right];
  if (right === "read") return on ? { ...a, read: true } : { ...NO_ACCESS };
  return { ...a, [right]: on, read: on ? true : a.read };
}

export const sameAccess = (a: ModuleAccess | undefined, b: ModuleAccess | undefined): boolean =>
  (a?.read ?? false) === (b?.read ?? false) && (a?.write ?? false) === (b?.write ?? false) && (a?.delete ?? false) === (b?.delete ?? false);

/** The forced access of a locked row, or undefined when the row can be edited. */
export function lockedAccess(roleKey: string, moduleId: ModuleId): ModuleAccess | undefined {
  if (roleKey === "owner") return FULL_ACCESS;
  if (OWNER_ONLY.includes(moduleId)) return NO_ACCESS;
  if (LOCKED_READ.includes(moduleId)) return READ_ONLY;
  return undefined;
}
export const lockedRow = (roleKey: string, moduleId: ModuleId) => lockedAccess(roleKey, moduleId) !== undefined;

/** Applies locked rows and fills missing modules (save and seed). */
export function withLocks(roleKey: string, access: Partial<RoleAccess>): RoleAccess {
  const out = {} as RoleAccess;
  for (const m of MODULES) out[m.id] = { ...(lockedAccess(roleKey, m.id) ?? access[m.id] ?? NO_ACCESS) };
  return out;
}

/** Starting access from what each demo role saw before this feature (research R2). */
export function seedAccess(roleId: RoleId): RoleAccess {
  const role = ROLES[roleId];
  const write: readonly ModuleId[] = roleId === "owner" ? [] : SEED_WRITE[roleId];
  const access = Object.fromEntries(
    MODULES.map((m) => {
      if (roleId === "owner") return [m.id, FULL_ACCESS];
      if (write.includes(m.id)) return [m.id, { read: true, write: true, delete: false }];
      return [m.id, !role.mods || role.mods.includes(m.id) ? READ_ONLY : NO_ACCESS];
    }),
  ) as RoleAccess;
  return withLocks(roleId, access);
}

/** Access for a role key, filling any module the map lacks with none. */
export function accessFor(s: Pick<AppState, "permissions">, key: string): RoleAccess {
  return s.permissions.access[key] ?? withLocks(key, {});
}

export function accessOn(s: Pick<AppState, "permissions">, key: string, moduleId: ModuleId): ModuleAccess {
  return accessFor(s, key)[moduleId] ?? NO_ACCESS;
}

/** The config role with `mods` taken from saved Read access (research R1). */
export function roleWithAccess(roleId: RoleId, access: RoleAccess): Role {
  const base = ROLES[roleId];
  if (roleId === "owner") return base;
  return { ...base, mods: MODULES.filter((m) => has(access[m.id], "read")).map((m) => m.id) };
}

export function effectiveRole(s: Pick<AppState, "permissions">, roleId: RoleId): Role {
  return roleWithAccess(roleId, accessFor(s, roleId));
}

/** The seeded effective role (tests and parity checks). */
export const seedRole = (roleId: RoleId): Role => roleWithAccess(roleId, seedAccess(roleId));

export function moduleSummary(access: RoleAccess): { open: number; total: number } {
  return { open: MODULES.filter((m) => has(access[m.id], "read")).length, total: MODULES.length };
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

const READ_ACTIONS = new Set(["View", "View details", "View stock", "View all", "Download PDF", "Download", "Print", "Statement", "Open"]);
const DELETE_ACTIONS = new Set(["Delete", "Void", "Void sale", "Void credit", "Void expense", "Cancel transfer", "Cancel order", "Undo", "Write off", "Remove"]);

/** The level a row-menu action needs; unknown labels need Write (safe default, research R4). */
export function rowActionNeed(label: string): AccessLevel {
  if (READ_ACTIONS.has(label)) return "read";
  if (DELETE_ACTIONS.has(label) || /^(Delete|Void|Cancel|Undo)\b/.test(label)) return "delete";
  return "write";
}

export const ROLE_NAME_MAX = 40;

export function validateRoleName(name: string, roles: readonly RoleDef[], exceptKey?: string): string | null {
  const n = name.trim();
  if (!n) return "Enter a role name.";
  if (n.length > ROLE_NAME_MAX) return `Use ${ROLE_NAME_MAX} characters or fewer.`;
  if (roles.some((r) => r.key !== exceptKey && r.name.toLowerCase() === n.toLowerCase())) return "A role with this name already exists.";
  return null;
}

export function seedPermissions(): AppState["permissions"] {
  return {
    roles: ROLE_DEFS.map((r) => ({ ...r, people: [...r.people] })),
    access: Object.fromEntries(ROLE_DEFS.map((r) => [r.key, seedAccess(r.key as RoleId)])),
    nextCustom: 1,
  };
}
