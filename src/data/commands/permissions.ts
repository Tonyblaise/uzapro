/** Permissions commands (feature 011, data-model.md › Commands). Session-only state. */
import { ROLE_COLOURS } from "../fixtures/permissions";
import { accessFor, validateRoleName, withLocks } from "../permissions";
import { getStore, showToast } from "../store";
import { fail, ok, type Result, type RoleAccess, type RoleDef } from "../types";

const roleOf = (key: string) => getStore().getState().permissions.roles.find((r) => r.key === key);

export async function saveRoleAccess(key: string, access: RoleAccess): Promise<Result<void>> {
  const role = roleOf(key);
  if (!role) return fail("That role no longer exists.");
  getStore().setState((s) => ({ permissions: { ...s.permissions, access: { ...s.permissions.access, [key]: withLocks(key, access) } } }));
  const message = `${role.name} access saved.`;
  showToast(message);
  return ok(undefined, message);
}

function nextColour(roles: readonly RoleDef[]): number {
  return (roles.length % ROLE_COLOURS) + 1;
}

function insertRole(name: string, access: RoleAccess): string {
  let key = "";
  getStore().setState((s) => {
    key = `r-${s.permissions.nextCustom}`;
    const role: RoleDef = { key, name, colour: nextColour(s.permissions.roles), builtIn: false, locked: false, users: 0, people: [] };
    return {
      permissions: {
        roles: [...s.permissions.roles, role],
        access: { ...s.permissions.access, [key]: withLocks(key, access) },
        nextCustom: s.permissions.nextCustom + 1,
      },
    };
  });
  return key;
}

export async function addRole(name: string): Promise<Result<string>> {
  const err = validateRoleName(name, getStore().getState().permissions.roles);
  if (err) return fail(err);
  const n = name.trim();
  const key = insertRole(n, {} as RoleAccess);
  const message = `${n} added.`;
  showToast(message);
  return ok(key, message);
}

export async function renameRole(key: string, name: string): Promise<Result<void>> {
  const s = getStore().getState();
  const role = roleOf(key);
  if (!role) return fail("That role no longer exists.");
  if (role.locked) return fail("The owner role can't be renamed.");
  const err = validateRoleName(name, s.permissions.roles, key);
  if (err) return fail(err);
  const n = name.trim();
  getStore().setState((st) => ({ permissions: { ...st.permissions, roles: st.permissions.roles.map((r) => (r.key === key ? { ...r, name: n } : r)) } }));
  const message = `Role renamed to ${n}.`;
  showToast(message);
  return ok(undefined, message);
}

/** "{Name} copy", then "{Name} copy 2", "copy 3"… until free (cut to 40 characters). */
export function copyName(name: string, roles: readonly RoleDef[]): string {
  const taken = (n: string) => roles.some((r) => r.name.toLowerCase() === n.toLowerCase());
  const base = `${name} copy`.slice(0, 40);
  if (!taken(base)) return base;
  for (let i = 2; ; i++) {
    const n = `${name.slice(0, 40 - ` copy ${i}`.length)} copy ${i}`;
    if (!taken(n)) return n;
  }
}

export async function duplicateRole(key: string): Promise<Result<string>> {
  const s = getStore().getState();
  const role = roleOf(key);
  if (!role) return fail("That role no longer exists.");
  const name = copyName(role.name, s.permissions.roles);
  const access = accessFor(s, key);
  const copy = insertRole(name, access);
  const message = `${name} added.`;
  showToast(message);
  return ok(copy, message);
}

export async function deleteRole(key: string): Promise<Result<void>> {
  const role = roleOf(key);
  if (!role) return fail("That role no longer exists.");
  if (role.locked) return fail("The owner role can't be deleted.");
  if (role.users > 0) {
    const message = `Move ${role.users} ${role.users === 1 ? "person" : "people"} to another role first.`;
    showToast(message);
    return fail(message);
  }
  getStore().setState((s) => {
    const access = { ...s.permissions.access };
    delete access[key];
    return { permissions: { ...s.permissions, roles: s.permissions.roles.filter((r) => r.key !== key), access } };
  });
  const message = `${role.name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

/** A plain toast for UI-side notices (e.g. "Your role can only view Sales."). */
export function showNotice(text: string): void {
  showToast(text);
}
