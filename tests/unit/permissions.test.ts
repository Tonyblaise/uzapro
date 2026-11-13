import { beforeEach, describe, expect, it } from "vitest";
import { MODULES } from "@/config/modules";
import { ROLES, canSee, visibleModules, visibleTabs } from "@/config/roles";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import {
  FULL_ACCESS,
  NO_ACCESS,
  READ_ONLY,
  accessOn,
  effectiveRole,
  has,
  lockedAccess,
  lockedRow,
  moduleSummary,
  rowActionNeed,
  seedAccess,
  seedRole,
  toggleRight,
  validateRoleName,
} from "@/data/permissions";
import { ROLE_DEFS } from "@/data/fixtures/permissions";
import type { RoleId } from "@/data/types";

const IDS: RoleId[] = ["owner", "accountant", "cashier", "store"];
const ids = (r: Parameters<typeof visibleModules>[0]) => visibleModules(r).map((m) => m.id);

describe("seed parity with today's role visibility (SC-002)", () => {
  for (const id of IDS) {
    it(`${id}: same modules (plus Profile) and same tabs`, () => {
      const before = ids(ROLES[id]);
      const after = ids(seedRole(id));
      const expected = id === "owner" ? before : [...new Set([...before, "prof"])];
      expect(after.sort()).toEqual(expected.sort());
      for (const m of MODULES) if (canSee(ROLES[id], m.id)) expect(visibleTabs(seedRole(id), m.id)).toEqual(visibleTabs(ROLES[id], m.id));
    });
  }

  it("module summaries: 21, 15, 8 and 9 of 21", () => {
    expect(IDS.map((id) => moduleSummary(seedAccess(id)).open)).toEqual([21, 15, 8, 9]);
    expect(moduleSummary(seedAccess("owner")).total).toBe(21);
  });

  it("seeds Write on working modules, Read elsewhere, Delete only for the owner", () => {
    const RW = { read: true, write: true, delete: false };
    expect(seedAccess("cashier")).toMatchObject({ sales: RW, pos: RW, cust: RW, inv: READ_ONLY, home: READ_ONLY, prof: READ_ONLY, buy: NO_ACCESS, perm: NO_ACCESS });
    expect(seedAccess("accountant")).toMatchObject({ fin: RW, exp: RW, ppl: READ_ONLY, inv: NO_ACCESS });
    expect(seedAccess("store")).toMatchObject({ inv: RW, prod: RW, sales: NO_ACCESS });
    expect(Object.values(seedAccess("owner")).every((a) => a.read && a.write && a.delete)).toBe(true);
  });
});

describe("Read, Write and Delete switches (Q1 revised)", () => {
  it("checks each right on its own", () => {
    expect(has({ read: true, write: false, delete: true }, "delete")).toBe(true);
    expect(has({ read: true, write: false, delete: true }, "write")).toBe(false);
    expect(has(READ_ONLY, "read")).toBe(true);
    expect(has(NO_ACCESS, "read")).toBe(false);
    expect(has(undefined, "read")).toBe(false);
    expect(has(NO_ACCESS, "none")).toBe(true);
  });
  it("allows any mix: Read, Write and Delete together", () => {
    let a = toggleRight(NO_ACCESS, "read");
    a = toggleRight(a, "write");
    a = toggleRight(a, "delete");
    expect(a).toEqual(FULL_ACCESS);
    expect(toggleRight(FULL_ACCESS, "write")).toEqual({ read: true, write: false, delete: true });
  });
  it("Write or Delete turns Read on; Read off turns the module off", () => {
    expect(toggleRight(NO_ACCESS, "delete")).toEqual({ read: true, write: false, delete: true });
    expect(toggleRight(NO_ACCESS, "write")).toEqual({ read: true, write: true, delete: false });
    expect(toggleRight(FULL_ACCESS, "read")).toEqual(NO_ACCESS);
  });
  it("locks the owner, Dashboard, Profile and (for others) Permissions", () => {
    expect(lockedAccess("owner", "sales")).toEqual(FULL_ACCESS);
    expect(lockedAccess("cashier", "home")).toEqual(READ_ONLY);
    expect(lockedAccess("cashier", "prof")).toEqual(READ_ONLY);
    expect(lockedAccess("cashier", "perm")).toEqual(NO_ACCESS);
    expect(lockedRow("cashier", "sales")).toBe(false);
    expect(lockedRow("r-1", "perm")).toBe(true);
  });
});

describe("row action classes (research R4)", () => {
  it.each([
    ["View", "read"],
    ["Download PDF", "read"],
    ["Edit", "write"],
    ["Approve", "write"],
    ["Record payment", "write"],
    ["Void sale", "delete"],
    ["Cancel transfer", "delete"],
    ["Undo", "delete"],
    ["Write off", "delete"],
    ["Delete", "delete"],
    ["Something new", "write"],
  ])("%s needs %s", (label, need) => expect(rowActionNeed(label)).toBe(need));
});

describe("role names", () => {
  const roles = ROLE_DEFS;
  it("validates blank, long and duplicate names", () => {
    expect(validateRoleName("  ", roles)).toBe("Enter a role name.");
    expect(validateRoleName("x".repeat(41), roles)).toBe("Use 40 characters or fewer.");
    expect(validateRoleName("cashier", roles)).toBe("A role with this name already exists.");
    expect(validateRoleName("Cashier", roles, "cashier")).toBeNull();
    expect(validateRoleName("Supervisor", roles)).toBeNull();
  });
});

describe("effective role in the store", () => {
  let store: AppStore;
  beforeEach(() => {
    store = createAppStore();
    registerStore(store);
  });
  it("starts from the seed", () => {
    const s = store.getState();
    expect(accessOn(s, "cashier", "inv")).toEqual(READ_ONLY);
    expect(canSee(effectiveRole(s, "cashier"), "inv")).toBe(true);
    expect(canSee(effectiveRole(s, "owner"), "perm")).toBe(true);
  });
});
