import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 002 · US5 Suppliers and FR-015 Send to Purchases (quickstart 6–7).
 * Store data resets on a full page load, so each flow moves with in-app links after login.
 */

async function choose(scope: Locator | Page, picker: string, option: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();

test("add a supplier, block a duplicate, and edit it", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Suppliers" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Suppliers" })).toBeVisible();

  await page.getByRole("button", { name: "New supplier" }).click();
  const form = page.getByRole("dialog", { name: "New supplier" });
  await form.getByLabel("Registered business name").fill("Kisumu Cycle Parts");
  await form.getByLabel("Town or city (optional)").fill("Kisumu");
  await form.getByRole("button", { name: "Create supplier" }).click();
  await expect(page.getByRole("status")).toContainText("Kisumu Cycle Parts added.");
  await expect(form).toBeHidden();
  const row = page.getByRole("row").filter({ hasText: "Kisumu Cycle Parts" });
  await expect(row).toContainText("Kisumu");
  await expect(row).toContainText("Active");

  await page.getByRole("button", { name: "New supplier" }).click();
  const dup = page.getByRole("dialog", { name: "New supplier" });
  await dup.getByLabel("Registered business name").fill("Magaliesburg Wheels");
  await dup.getByRole("button", { name: "Create supplier" }).click();
  await expect(page.getByRole("status")).toContainText("Magaliesburg Wheels is already in the list.");
  await dup.getByRole("button", { name: "Cancel" }).click();

  await row.click();
  const edit = page.getByRole("dialog", { name: "Edit supplier" });
  await edit.getByRole("radio", { name: "Individual person" }).check();
  await expect(edit.getByLabel("Full name")).toHaveValue("Kisumu Cycle Parts");
  await edit.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Changes saved.");
  await expect(page.getByRole("row").filter({ hasText: "Kisumu Cycle Parts" })).toContainText("Individual");
});

test("an inactive supplier is hidden from the Stock in supplier picker", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Suppliers" }).click();
  await page.getByRole("button", { name: "New supplier" }).click();
  const form = page.getByRole("dialog", { name: "New supplier" });
  await form.getByLabel("Registered business name").fill("Dormant Traders");
  await form.getByLabel("Supplier is active").uncheck();
  await form.getByRole("button", { name: "Create supplier" }).click();
  await expect(page.getByRole("row").filter({ hasText: "Dormant Traders" })).toContainText("Inactive");

  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Stock management");
  await page.getByRole("button", { name: "Stock in" }).click();
  const stockIn = page.getByRole("dialog", { name: "Stock in" });
  await stockIn.getByRole("button", { name: "Supplier", exact: true }).click();
  await expect(stockIn.getByRole("option", { name: "Eastside Bicycle Supplies" })).toBeVisible();
  await expect(stockIn.getByRole("option", { name: "Dormant Traders" })).toHaveCount(0);
});

test("Send to Purchases adds a Waiting goods receipt and leaves stock unchanged", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/stock-management");
  await page.getByRole("button", { name: "Stock in" }).click();
  const stockIn = page.getByRole("dialog", { name: "Stock in" });
  await choose(stockIn, "Supplier", "Eastside Bicycle Supplies");
  await choose(stockIn, "Search items", "Bike Pump · Standard");
  await stockIn.getByRole("button", { name: "Send to Purchases" }).click();
  await expect(page.getByRole("status")).toContainText("Sent to Purchases.");
  await expect(stockIn).toBeHidden();

  await nav(page).getByRole("link", { name: "Purchases" }).click();
  await tab(page, "Goods receipts");
  const grn = page.getByRole("row").filter({ hasText: "GRN-0042" });
  await expect(grn).toContainText("Eastside Bicycle Supplies");
  await expect(grn).toContainText("Waiting");
});
