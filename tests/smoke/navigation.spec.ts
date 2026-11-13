import { MODULES } from "@/config/modules";
import { ROLES, canSee, visibleModules, visibleTabs } from "@/config/roles";
import { seedRole } from "@/data/permissions";
import type { RoleId } from "@/data/types";
import { expect, loginAs, test } from "./fixtures";

/** Role × route matrix (T053, SC-004, contracts/routes.md). */
const ROLE_LIST: RoleId[] = ["owner", "accountant", "cashier", "store"];

for (const roleId of ROLE_LIST) {
  // Visibility comes from the seeded per-module access (feature 011): Profile is open to every role.
  const role = seedRole(roleId);

  test(`${role.label}: every visible in-scope tab renders`, async ({ page, errors }) => {
    test.setTimeout(90_000); // the owner visits every tab; slow under a full parallel run
    void errors;
    await loginAs(page, roleId);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Welcome back, ${role.name}`);
    for (const m of visibleModules(role).filter((x) => x.inScope && x.id !== "home")) {
      for (const t of visibleTabs(role, m.id)) {
        await page.goto(`/${m.slug}/${t.slug}`);
        await expect(page.getByRole("heading", { level: 1, name: m.name })).toBeVisible();
        if (visibleTabs(role, m.id).length > 1) {
          await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: t.title, exact: true })).toHaveAttribute("aria-current", "page");
        }
      }
    }
  });

  test(`${role.label}: hidden modules and tabs redirect to the dashboard`, async ({ page, errors }) => {
    void errors;
    await loginAs(page, roleId);
    const hidden = MODULES.filter((m) => m.inScope && m.id !== "home").flatMap((m) =>
      m.tabs.filter((t) => !canSee(role, m.id, t.title)).map((t) => `/${m.slug}/${t.slug}`),
    );
    for (const path of hidden.slice(0, 6)) {
      await page.goto(path);
      await page.waitForURL("**/dashboard");
    }
  });

  test(`${role.label}: every visible module is built (no placeholder left)`, async ({ page, errors }) => {
    void errors;
    expect(MODULES.filter((m) => !m.inScope).map((m) => m.id)).toEqual([]);
    await loginAs(page, roleId);
    for (const m of visibleModules(role).filter((x) => x.id !== "home")) {
      await page.goto(`/${m.slug}`);
      await expect(page.getByRole("heading", { level: 1, name: m.name })).toBeVisible();
      await expect(page.getByText("Not built yet in this prototype.")).toHaveCount(0);
    }
  });
}

test("role switch from the account menu changes the sidebar and lands on the dashboard", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption("cashier");
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, Jane Smith");
  const nav = page.getByRole("complementary", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Products" })).toHaveCount(0);
  await page.goto("/sales");
  await page.waitForURL("**/sales/all-sales");
});

test("reload keeps the session and role; sign out returns to login", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "accountant");
  await page.goto("/customers/customers");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Customers" })).toBeVisible();
  await page.getByRole("button", { name: /Mary Achieng/ }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL("**/login");
});

/** Feature 005 · quickstart 13: Office, People and Account modules per role (design UZ_ROLES). */
const OFFICE = ["Reports", "Team", "Permissions", "Calendar", "Messages", "File Manager", "Profile", "Settings"];
const SEES: Record<RoleId, string[]> = {
  owner: OFFICE,
  // Feature 011: Profile is locked open for every role (spec › Edge cases).
  accountant: ["Reports", "Team", "Calendar", "File Manager", "Profile"],
  store: ["Calendar", "File Manager", "Profile"],
  cashier: ["Calendar", "Profile"],
};
for (const roleId of ROLE_LIST) {
  test(`${ROLES[roleId].label}: sees exactly the design's office, people and account modules`, async ({ page, errors }) => {
    void errors;
    await loginAs(page, roleId);
    const nav = page.getByRole("complementary", { name: "Main" });
    for (const name of OFFICE) {
      await expect(nav.getByRole("link", { name, exact: true })).toHaveCount(SEES[roleId].includes(name) ? 1 : 0);
    }
  });
}
