/** Modular role permissions (feature 011, data-model.md). */
import type { ModuleId } from "./common";

/** One level per module; each level includes the ones below it (Clarification Q1). */
export type AccessLevel = "none" | "read" | "write" | "delete";

export type RoleAccess = Record<ModuleId, AccessLevel>;

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
