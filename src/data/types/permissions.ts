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

/** What a role may approve, and the largest discount it may give (feature 018). */
export interface RoleApprovals {
  /** Approve a credit sale, invoice or order over the customer's limit, overdue or on cash terms. */
  credit: boolean;
  /** Approve, send back or cancel a stock count. */
  counts: boolean;
  /** Dispatch a sales order and mark a delivery note delivered. */
  dispatch: boolean;
  /** Largest discount, as a whole percentage (0–100). */
  discountMax: number;
}

export interface PermissionsState {
  roles: RoleDef[];
  access: Record<string, RoleAccess>;
  /** By role key (feature 018). */
  approvals: Record<string, RoleApprovals>;
  nextCustom: number;
}
