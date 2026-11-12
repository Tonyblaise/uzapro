import { describe, expect, it } from "vitest";
import { ROLES, canSee, visibleModules, visibleTabs } from "@/config/roles";

const tabs = (r: keyof typeof ROLES, m: Parameters<typeof visibleTabs>[1]) => visibleTabs(ROLES[r], m).map((t) => t.slug);

describe("roles (contracts/routes.md › Role visibility)", () => {
  it("owner sees every module and tab", () => {
    expect(visibleModules(ROLES.owner)).toHaveLength(20);
    expect(tabs("owner", "sales")).toHaveLength(7);
  });
  it("accountant: sales without quotations, no products or stock", () => {
    expect(tabs("accountant", "sales")).toEqual(["overview", "all-sales", "invoices", "refunds-credit-notes", "voided-items", "sales-targets"]);
    expect(canSee(ROLES.accountant, "prod")).toBe(false);
    expect(canSee(ROLES.accountant, "inv")).toBe(false);
    expect(canSee(ROLES.accountant, "cust")).toBe(true);
  });
  it("cashier: two sales tabs and stock management only", () => {
    expect(tabs("cashier", "sales")).toEqual(["all-sales", "refunds-credit-notes"]);
    expect(tabs("cashier", "inv")).toEqual(["stock-management"]);
    expect(canSee(ROLES.cashier, "prod")).toBe(false);
  });
  it("store keeper: products and stock, no sales or customers", () => {
    expect(tabs("store", "prod")).toHaveLength(4);
    expect(tabs("store", "inv")).toHaveLength(5);
    expect(canSee(ROLES.store, "sales")).toBe(false);
    expect(canSee(ROLES.store, "cust")).toBe(false);
  });
});
