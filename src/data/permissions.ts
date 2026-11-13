/**
 * Pure permission helpers (feature 011, contracts/data-access.md). Access is one level per
 * module (none < read < write < delete); Read decides visibility, Write gates create/edit,
 * Delete gates delete/void/cancel/undo.
 */
import { MODULES } from "@/config/modules";
import { ROLES } from "@/config/roles";
import { LOCKED_READ, OWNER_ONLY, ROLE_DEFS, SEED_WRITE } from "./fixtures/permissions";
import type { AccessLevel, ModuleId, Role, RoleAccess, RoleDef, RoleId } from "./types";
import type { AppState } from "./store/state";

/** Button order in the Edit role dialog. */
export const ACCESS_LEVELS: readonly Exclude<AccessLevel, "none">[] = ["read", "write", "delete"];
export const LEVEL_LABEL: Record<AccessLevel, string> = { none: "No access", read: "Read", write: "Write", delete: "Delete" };

const RANK: Record<AccessLevel, number> = { none: 0, read: 1, write: 2, delete: 3 };
export const rank = (l: AccessLevel) => RANK[l];
export const has = (level: AccessLevel, need: AccessLevel) => RANK[level] >= RANK[need];

/** Clicking the picked level again clears the row (research R3). */
export const pickLevel = (current: AccessLevel, clicked: AccessLevel): AccessLevel => (clicked === current ? "none" : clicked);

/** The forced level of a locked row, or undefined when the row can be edited. */
export function lockedLevel(roleKey: string, moduleId: ModuleId): AccessLevel | undefined {
  if (roleKey === "owner") return "delete";
  if (OWNER_ONLY.includes(moduleId)) return "none";
  if (LOCKED_READ.includes(moduleId)) return "read";
  return undefined;
}
export const lockedRow = (roleKey: string, moduleId: ModuleId) => lockedLevel(roleKey, moduleId) !== undefined;

/** Applies locked rows to an access map (save and seed). */
export function withLocks(roleKey: string, access: RoleAccess): RoleAccess {
  const out = { ...access };
  for (const m of MODULES) {
    const l = lockedLevel(roleKey, m.id);
    if (l === "read") out[m.id] = has(out[m.id] ?? "none", "read") ? out[m.id] : "read";
    else if (l) out[m.id] = l;
    else out[m.id] ??= "none";
  }
  return out;
}

/** Starting access from what each demo role saw before this feature (research R2). */
export function seedAccess(roleId: RoleId): RoleAccess {
  const role = ROLES[roleId];
  const write: readonly ModuleId[] = roleId === "owner" ? [] : SEED_WRITE[roleId];
  const access = Object.fromEntries(
    MODULES.map((m) => {
      if (roleId === "owner") return [m.id, "delete"];
      if (write.includes(m.id)) return [m.id, "write"];
      return [m.id, !role.mods || role.mods.includes(m.id) ? "read" : "none"];
    }),
  ) as RoleAccess;
  return withLocks(roleId, access);
}

/** Access for a role key, filling any module the map lacks with none. */
export function accessFor(s: Pick<AppState, "permissions">, key: string): RoleAccess {
  return s.permissions.access[key] ?? withLocks(key, {} as RoleAccess);
}

export function levelFor(s: Pick<AppState, "permissions">, key: string, moduleId: ModuleId): AccessLevel {
  return accessFor(s, key)[moduleId] ?? "none";
}

/** The config role with `mods` taken from saved Read access (research R1). */
export function roleWithAccess(roleId: RoleId, access: RoleAccess): Role {
  const base = ROLES[roleId];
  if (roleId === "owner") return base;
  return { ...base, mods: MODULES.filter((m) => has(access[m.id] ?? "none", "read")).map((m) => m.id) };
}

export function effectiveRole(s: Pick<AppState, "permissions">, roleId: RoleId): Role {
  return roleWithAccess(roleId, accessFor(s, roleId));
}

/** The seeded effective role (tests and parity checks). */
export const seedRole = (roleId: RoleId): Role => roleWithAccess(roleId, seedAccess(roleId));

export function moduleSummary(access: RoleAccess): { open: number; total: number } {
  return { open: MODULES.filter((m) => has(access[m.id] ?? "none", "read")).length, total: MODULES.length };
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
