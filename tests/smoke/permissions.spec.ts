import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 011 · modular role permissions (quickstart 1–8). Access lives in memory, so every test
 * edits roles and switches "View as" inside one page load (a page.goto would restore the seed).
 */

const main = (page: Page) => page.getByRole("main");
const card = (page: Page, name: string) => main(page).getByRole("article", { name, exact: true });

/** Opens People › Permissions with in-app navigation (keeps the session's edits). */
async function openPermissions(page: Page) {
  await page.getByRole("complementary", { name: "Main" }).getByRole("link", { name: "Permissions", exact: true }).click();
  await page.waitForURL("**/permissions/permissions");
}

/** In-app navigation to a URL (no reload). */
async function go(page: Page, url: string) {
  await page.evaluate((u) => (window as unknown as { next: { router: { push: (u: string) => void } } }).next.router.push(u), url);
  await page.waitForURL(`**${url.split("?")[0]}*`);
}

async function setLevel(page: Page, role: string, changes: [string, "Read" | "Write" | "Delete"][]) {
  await openPermissions(page);
  await main(page).getByRole("button", { name: `Edit role: ${role}` }).click();
  const dialog = page.getByRole("dialog", { name: "Edit role" });
  for (const [module, level] of changes) await dialog.getByRole("button", { name: `${module}: ${level}`, exact: true }).click();
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(`${role} access saved.`)).toBeVisible();
}

async function viewAs(page: Page, role: "accountant" | "cashier" | "store") {
  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption(role);
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("Welcome back, Tony Blaise");
}

test("four role cards with users, avatars and module summaries (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/permissions/permissions");
  const cards = main(page).getByRole("article");
  await expect(cards).toHaveCount(4);
  expect(await cards.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).toEqual(["Owner / Admin", "Accountant", "Cashier", "Store keeper"]);
  await expect(card(page, "Owner / Admin")).toContainText("Total 1 user");
  await expect(card(page, "Owner / Admin")).toContainText("Can open 21 of 21 modules");
  const cashier = card(page, "Cashier");
  await expect(cashier).toContainText("Total 4 users");
  await expect(cashier).toContainText("JS");
  await expect(cashier).toContainText("+3");
  await expect(cashier).toContainText("Can open 8 of 21 modules");
  await expect(card(page, "Accountant")).toContainText("Can open 15 of 21 modules");
  await expect(card(page, "Store keeper")).toContainText("Can open 9 of 21 modules");
  await expect(page.getByRole("columnheader", { name: "Scope" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add new role" })).toBeVisible();
});

test("Edit role: 21 modules, one level per row, save and cancel (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/permissions/permissions");
  const trigger = main(page).getByRole("button", { name: "Edit role: Cashier" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Edit role" });
  await expect(dialog).toContainText("Cashier");
  await expect(dialog.getByRole("group")).toHaveCount(21);
  for (const s of ["Overview", "Sales", "Procurement", "Financials", "People", "Office", "Account"]) await expect(dialog.getByRole("heading", { name: s, exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Sales: Write" })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByRole("button", { name: "Stock: Read" })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByRole("button", { name: "Permissions: Read" })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Save" })).toBeDisabled();

  await dialog.getByRole("button", { name: "Purchases: Read" }).click();
  await expect(dialog.getByRole("button", { name: "Purchases: Read" })).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Cashier access saved.")).toBeVisible();
  await expect(card(page, "Cashier")).toContainText("Can open 9 of 21 modules");

  // Clearing then cancelling keeps the saved level.
  await trigger.click();
  await dialog.getByRole("button", { name: "Purchases: Read" }).click();
  await expect(dialog.getByRole("button", { name: "Purchases: Read" })).toHaveAttribute("aria-pressed", "false");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toHaveCount(0);
  await trigger.click();
  await expect(dialog.getByRole("button", { name: "Purchases: Read" })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  // The owner is locked to full access.
  await main(page).getByRole("button", { name: "Edit role: Owner / Admin" }).click();
  await expect(dialog).toContainText("The owner always has full access.");
  await expect(dialog.getByRole("button", { name: "Sales: Delete" })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Sales: Delete" })).toHaveAttribute("aria-pressed", "true");
});

test("Read controls what a role sees: Stock removed from the Cashier (US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await setLevel(page, "Cashier", [["Stock", "Read"]]); // clicking the picked level clears it
  await expect(card(page, "Cashier")).toContainText("Can open 7 of 21 modules");
  await viewAs(page, "cashier");
  const nav = page.getByRole("complementary", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Stock", exact: true })).toHaveCount(0);
  await expect(main(page).getByText("Check stock")).toHaveCount(0);
  await expect(main(page).getByText("14 items are running low")).toHaveCount(0);
  await go(page, "/stock/stock-management");
  await page.waitForURL("**/dashboard");
});

test("Write gate: Sales at Read hides create, edit and void (US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await setLevel(page, "Cashier", [["Sales", "Read"]]);
  await viewAs(page, "cashier");
  await expect(main(page).getByText("New sale")).toHaveCount(0); // quick task hidden
  await page.getByRole("complementary", { name: "Main" }).getByRole("link", { name: "Sales", exact: true }).click();
  await page.waitForURL("**/sales/**");
  await expect(page.getByRole("button", { name: "New sale" })).toHaveCount(0);
  await main(page).getByRole("button", { name: "Actions" }).first().click();
  const items = await page.getByRole("menu").getByRole("menuitem").allTextContents();
  expect(items.map((t) => t.trim()).every((t) => ["View", "Download PDF"].includes(t))).toBe(true);
  await page.keyboard.press("Escape");
  await go(page, "/sales/all-sales?action=new");
  await expect(page.getByText("Your role can only view Sales.")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Delete gate: the Accountant voids expenses only with Delete (US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const openExpenses = async () => {
    await page.getByRole("complementary", { name: "Main" }).getByRole("link", { name: "Expenses", exact: true }).click();
    await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Expenses", exact: true }).click();
    await page.waitForURL("**/expenses/expenses");
  };
  await viewAs(page, "accountant");
  await openExpenses();
  await expect(page.getByRole("button", { name: "Record expenses" })).toBeVisible();
  await main(page).getByRole("button", { name: "Actions" }).first().click();
  await expect(page.getByRole("menu").getByRole("menuitem", { name: "Approve" })).toBeVisible();
  await expect(page.getByRole("menu").getByRole("menuitem", { name: "Void" })).toHaveCount(0);
  await page.getByRole("menu").getByRole("menuitem", { name: "View" }).click();
  const details = page.getByRole("dialog", { name: "Expense details" });
  await expect(details.getByRole("button", { name: "Approve" })).toBeVisible();
  await expect(details.getByRole("button", { name: "Void" })).toHaveCount(0);

  // Grant Delete as the owner, then the Accountant can void.
  await details.getByRole("button", { name: "Close" }).last().click();
  await expect(details).toHaveCount(0);
  await page.getByRole("button", { name: /Mary Achieng/ }).click();
  await page.getByLabel("View as").selectOption("owner");
  await page.waitForURL("**/dashboard");
  await setLevel(page, "Accountant", [["Expenses", "Delete"]]);
  await viewAs(page, "accountant");
  await openExpenses();
  await main(page).getByRole("button", { name: "Actions" }).first().click();
  await expect(page.getByRole("menu").getByRole("menuitem", { name: "Void" })).toBeVisible();
});

test("POS gate: Point of sale at Read shows View only (US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await setLevel(page, "Cashier", [["Point of sale", "Read"]]);
  await viewAs(page, "cashier");
  await page.getByRole("complementary", { name: "Main" }).getByRole("link", { name: "Point of sale", exact: true }).click();
  await page.waitForURL("**/point-of-sale/**");
  await expect(main(page).getByText("View only").first()).toBeVisible();
  await expect(main(page).getByRole("button", { name: /Launch|Open shift/ })).toHaveCount(0);
});

test("add, duplicate, rename and delete roles (US4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/permissions/permissions");
  await page.getByRole("button", { name: "Add new role" }).click();
  const nameDialog = page.getByRole("dialog", { name: "Add new role" });
  await nameDialog.getByRole("button", { name: "Add role" }).click();
  await expect(nameDialog).toContainText("Enter a role name.");
  await nameDialog.getByLabel("Role name").fill("cashier");
  await nameDialog.getByRole("button", { name: "Add role" }).click();
  await expect(nameDialog).toContainText("A role with this name already exists.");
  await nameDialog.getByLabel("Role name").fill("Supervisor");
  await nameDialog.getByRole("button", { name: "Add role" }).click();
  const edit = page.getByRole("dialog", { name: "Edit role" });
  await expect(edit).toContainText("Supervisor");
  await edit.getByRole("button", { name: "Sales: Write" }).click();
  await edit.getByRole("button", { name: "Save" }).click();
  await expect(card(page, "Supervisor")).toContainText("Total 0 users");
  await expect(card(page, "Supervisor")).toContainText("Can open 3 of 21 modules");

  await card(page, "Supervisor").getByRole("button", { name: "Supervisor options" }).click();
  await page.getByRole("menuitem", { name: "Duplicate" }).click();
  await expect(card(page, "Supervisor copy")).toContainText("Can open 3 of 21 modules");
  await card(page, "Supervisor copy").getByRole("button", { name: "Supervisor copy options" }).click();
  await page.getByRole("menuitem", { name: "Rename" }).click();
  const rename = page.getByRole("dialog", { name: "Rename role" });
  await rename.getByLabel("Role name").fill("Floor lead");
  await rename.getByRole("button", { name: "Save" }).click();
  await expect(card(page, "Floor lead")).toBeVisible();

  await card(page, "Floor lead").getByRole("button", { name: "Floor lead options" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("dialog", { name: "Delete Floor lead?" }).getByRole("button", { name: "Delete role" }).click();
  await expect(card(page, "Floor lead")).toHaveCount(0);
  await expect(page.getByText("Floor lead deleted.")).toBeVisible();

  await card(page, "Cashier").getByRole("button", { name: "Cashier options" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByText("Move 4 people to another role first.")).toBeVisible();

  await card(page, "Owner / Admin").getByRole("button", { name: "Owner / Admin options" }).click();
  await expect(page.getByRole("menu").getByRole("menuitem")).toHaveText(["Duplicate"]);
});

test("a 40-character role name wraps on its card", async ({ page, errors }) => {
  void errors;
  await page.setViewportSize({ width: 375, height: 800 });
  await loginAs(page, "owner");
  await page.goto("/permissions/permissions");
  await page.getByRole("button", { name: "Add new role" }).click();
  const long = "Regional inventory and procurement leads";
  expect(long.length).toBe(40);
  await page.getByRole("dialog", { name: "Add new role" }).getByLabel("Role name").fill(long);
  await page.getByRole("dialog", { name: "Add new role" }).getByRole("button", { name: "Add role" }).click();
  await page.keyboard.press("Escape");
  const box = await card(page, long).boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
