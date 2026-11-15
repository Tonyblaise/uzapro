import { describe, expect, it } from "vitest";
import { ROLES, canSee, visibleModules, visibleTabs } from "@/config/roles";

const tabs = (r: keyof typeof ROLES, m: Parameters<typeof visibleTabs>[1]) => visibleTabs(ROLES[r], m).map((t) => t.slug);

describe("roles (contracts/routes.md › Role visibility)", () => {
  it("owner sees every module and tab", () => {
    // 21 with Point of sale (feature 010), 22 with Integrations (feature 015), 23 with Field sales (024).
    expect(visibleModules(ROLES.owner)).toHaveLength(23);
    expect(tabs("owner", "sales")).toEqual(["overview", "all-sales", "quotations", "sales-orders", "deliveries", "invoices", "voided-items", "sales-targets"]);
    expect(tabs("owner", "field")).toEqual(["field-sales", "sales-reps", "deliveries"]);
    expect(tabs("store", "field")).toEqual(["deliveries"]); // design UZ_ROLES: the Store keeper only delivers
    expect(tabs("owner", "cust")).toEqual(["customers", "refunds-credit-notes", "customer-groups"]); // customer credits are listed with credit notes
    expect(tabs("owner", "vend")).toEqual(["suppliers"]); // supplier credits are listed with purchase returns
  });
  it("accountant: sales without quotations, no products or stock", () => {
    expect(tabs("accountant", "sales")).toEqual(["overview", "all-sales", "sales-orders", "deliveries", "invoices", "voided-items", "sales-targets"]);
    expect(canSee(ROLES.accountant, "prod")).toBe(false);
    expect(canSee(ROLES.accountant, "inv")).toBe(false);
    expect(canSee(ROLES.accountant, "cust")).toBe(true);
    expect(canSee(ROLES.accountant, "pos")).toBe(false);
    expect(canSee(ROLES.cashier, "pos", "Terminals")).toBe(true);
    expect(canSee(ROLES.store, "pos")).toBe(false);
  });
  it("cashier: two sales tabs and stock management only", () => {
    expect(tabs("cashier", "sales")).toEqual(["all-sales"]);
    expect(tabs("cashier", "cust")).toEqual(["customers", "refunds-credit-notes"]); // credit notes moved to Customers
    expect(tabs("cashier", "inv")).toEqual(["stock-management"]);
    expect(canSee(ROLES.cashier, "prod")).toBe(false);
  });
  it("store keeper: products and stock, no sales or customers", () => {
    expect(tabs("store", "prod")).toHaveLength(5); // + Price lists (feature 012)
    expect(tabs("store", "inv")).toHaveLength(6); // + Stock counts (017); Expiry (016) and Reorder (014) removed
    expect(canSee(ROLES.store, "sales")).toBe(false);
    expect(canSee(ROLES.store, "cust")).toBe(false);
  });
});
