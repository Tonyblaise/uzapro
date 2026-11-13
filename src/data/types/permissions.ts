/** Modular role permissions (feature 011, data-model.md). */
import type { ModuleId } from "./common";

/** What an action needs ("none" = always allowed). */
export type AccessLevel = "none" | "read" | "write" | "delete";

/** One switch in the Edit role dialog. */
export type AccessRight = Exclude<AccessLevel, "none">;

/**
 * Read, Write and Delete are independent switches per module (Clarification Q1, revised
 * 2026-11-13). Write or Delete always comes with Read: a role must open a module to act in it.
 */
export interface ModuleAccess {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export type RoleAccess = Record<ModuleId, ModuleAccess>;

export interface RoleDef {
  /** "owner" | "accountant" | "cashier" | "store" for built-in roles; "r-{n}" for custom ones. */
  key: string;
  name: string;
  /** Index into --role-1..6. */
  colour: number;
  builtIn: boolean;
  /** Owner / Admin: full access, no rename or delete. */
  locked: boolean;
  users: number;
  /** Names shown as avatars. */
  people: string[];
}

export interface PermissionsState {
  roles: RoleDef[];
  access: Record<string, RoleAccess>;
  nextCustom: number;
}
