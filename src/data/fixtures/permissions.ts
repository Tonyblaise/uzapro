/**
 * Built-in roles for People › Permissions (feature 011, research R2/R8).
 *
 * - Names and user counts: the canvas Permissions table (`UZ_MODS.perm`: Owner / Admin 1,
 *   Accountant 2, Cashier 4, Store / Inventory 3; the store role keeps the app's "Store keeper").
 * - People: the canvas `ppl/team` rows.
 * - Seed levels: the canvas Scope column mapped to levels: "Full" → Delete everywhere;
 *   "Edit" → Write on the role's working modules; "Limited" → Write on selling modules only.
 *   Every other module the role sees today is Read (spec › Design deviations).
 */
import type { ModuleId, RoleDef, RoleId } from "../types";

export const ROLE_DEFS: readonly RoleDef[] = [
  { key: "owner", name: "Owner / Admin", colour: 1, builtIn: true, locked: true, users: 1, people: ["Tony Blaise"] },
  { key: "accountant", name: "Accountant", colour: 2, builtIn: true, locked: false, users: 2, people: ["Mary Achieng"] },
  { key: "cashier", name: "Cashier", colour: 3, builtIn: true, locked: false, users: 4, people: ["Jane Smith"] },
  { key: "store", name: "Store keeper", colour: 4, builtIn: true, locked: false, users: 3, people: ["Grant Jensen"] },
];

/** Modules each non-owner role starts at Write on (the rest it sees are Read). */
export const SEED_WRITE: Record<Exclude<RoleId, "owner">, readonly ModuleId[]> = {
  accountant: ["fin", "exp", "rcv", "pay", "sales", "buy", "cust", "vend", "rep", "docs"],
  cashier: ["sales", "pos", "cust"],
  store: ["inv", "prod", "buy", "vend", "docs"],
};

/** Always readable by every role: a home screen and a way to sign out or switch role. */
export const LOCKED_READ: readonly ModuleId[] = ["home", "prof"];

/** Only the owner manages permissions; locked at none for every other role. */
export const OWNER_ONLY: readonly ModuleId[] = ["perm"];

/** Role tile palette size (--role-1..6). */
export const ROLE_COLOURS = 6;
