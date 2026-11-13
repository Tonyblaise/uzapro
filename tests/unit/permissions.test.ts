import { beforeEach, describe, expect, it } from "vitest";
import { MODULES } from "@/config/modules";
import { ROLES, canSee, visibleModules, visibleTabs } from "@/config/roles";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import {
  effectiveRole,
  has,
  levelFor,
  lockedLevel,
  lockedRow,
  moduleSummary,
  pickLevel,
  rowActionNeed,
  seedAccess,
  seedRole,
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
    expect(seedAccess("cashier")).toMatchObject({ sales: "write", pos: "write", cust: "write", inv: "read", home: "read", prof: "read", buy: "none", perm: "none" });
    expect(seedAccess("accountant")).toMatchObject({ fin: "write", exp: "write", ppl: "read", inv: "none" });
    expect(seedAccess("store")).toMatchObject({ inv: "write", prod: "write", sales: "none" });
    expect(Object.values(seedAccess("owner")).every((l) => l === "delete")).toBe(true);
  });
});

describe("levels", () => {
  it("orders none < read < write < delete", () => {
    expect(has("delete", "write")).toBe(true);
    expect(has("write", "delete")).toBe(false);
    expect(has("read", "read")).toBe(true);
    expect(has("none", "read")).toBe(false);
  });
  it("picking the same level again clears the row", () => {
    expect(pickLevel("write", "write")).toBe("none");
    expect(pickLevel("read", "delete")).toBe("delete");
    expect(pickLevel("none", "read")).toBe("read");
  });
  it("locks the owner, Dashboard, Profile and (for others) Permissions", () => {
    expect(lockedLevel("owner", "sales")).toBe("delete");
    expect(lockedLevel("cashier", "home")).toBe("read");
    expect(lockedLevel("cashier", "prof")).toBe("read");
    expect(lockedLevel("cashier", "perm")).toBe("none");
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
    expect(levelFor(s, "cashier", "inv")).toBe("read");
    expect(canSee(effectiveRole(s, "cashier"), "inv")).toBe(true);
    expect(canSee(effectiveRole(s, "owner"), "perm")).toBe(true);
  });
});
