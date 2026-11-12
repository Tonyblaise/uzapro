import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Quickstart scenarios 8–9 (US5, T081). Store data is in memory and resets on reload, so each
 * flow stays on one page load and moves between tabs with the tab links.
 */

async function choose(scope: Locator | Page, picker: string, option: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

async function tab(page: Page, name: string) {
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
}

test("Stock overview renders", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/overview");
  await expect(page.getByRole("heading", { level: 1, name: "Stock" })).toBeVisible();
  for (const text of ["Total stock value", "Recent stock movements", "Stock movements", "Stock by category", "Recent stock movement", "Low stock alerts"]) {
    await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
  }
});

test("transfer Bike Pump ×2 Main Store → Point of Sale, ship, then mark as received", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/transfer-stock");
  await page.getByRole("button", { name: "New transfer" }).click();
  const form = page.getByRole("dialog", { name: "New stock transfer" });
  await expect(form).toBeVisible();
  await choose(form, "Destination store (to)", "Point of Sale");
  await choose(form, "Search items", "Bike Pump · Standard");
  await expect(form.getByText("30 in Main Store")).toBeVisible();
  await form.getByLabel("Quantity to move").fill("2");
  await form.getByRole("button", { name: "Transfer and ship", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Transfer on its way to Point of Sale.");

  const row = page.getByRole("row").filter({ hasText: "TRF-0033" });
  await expect(row).toContainText("In transit");
  await row.click();
  const view = page.getByRole("dialog", { name: "Transfer TRF-0033" });
  await view.getByRole("button", { name: "Mark as received" }).click();
  await expect(page.getByRole("status")).toContainText("Transfer received at Point of Sale.");
  await expect(row).toContainText("Received");

  // Main Store 30 → 28, Point of Sale 28 → 30.
  await tab(page, "Stock management");
  await choose(page, "store", "Main Store");
  await expect(page.getByRole("row").filter({ hasText: "Bike Pump" })).toContainText("28");
  await choose(page, "store", "Point of Sale");
  await expect(page.getByRole("row").filter({ hasText: "Bike Pump" })).toContainText("30");
});

test("an over-quantity transfer is blocked", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/transfer-stock?action=transfer");
  const form = page.getByRole("dialog", { name: "New stock transfer" });
  await choose(form, "Destination store (to)", "Point of Sale");
  await choose(form, "Search items", "Bike Pump · Standard");
  await form.getByLabel("Quantity to move").fill("31");
  for (const name of ["Confirm transfer", "Transfer and ship", "Transfer, ship and receive"]) {
    await expect(form.getByRole("button", { name, exact: true })).toBeDisabled();
  }
  await form.getByLabel("Quantity to move").fill("30");
  await expect(form.getByRole("button", { name: "Transfer and ship", exact: true })).toBeEnabled();
});

test("cancel a Not finished transfer (TRF-0030)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/transfer-stock");
  const row = page.getByRole("row").filter({ hasText: "TRF-0030" });
  await expect(row).toContainText("Not finished");
  await row.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Cancel transfer" }).click();
  const dialog = page.getByRole("dialog", { name: "Cancel transfer TRF-0030?" });
  await expect(dialog).toContainText("No stock has moved, so your stock levels stay the same.");
  await dialog.getByRole("button", { name: "Cancel transfer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Transfer TRF-0030 cancelled.");
  await expect(row).toContainText("Cancelled");

  // No stock moved: Bike Pump is still 30 at Main Store.
  await tab(page, "Stock management");
  await choose(page, "store", "Main Store");
  await expect(page.getByRole("row").filter({ hasText: "Bike Pump" })).toContainText("30");
});

test("record 1 damaged Carbon Sole Shoes at Main Store (40 → 39)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/wastage");
  await page.getByRole("button", { name: "Record wastage" }).click();
  const form = page.getByRole("dialog", { name: "Record stock wastage" });
  await choose(form, "Search product", "Carbon Sole Shoes · Size 42");
  await expect(form.getByText("40 in Main Store")).toBeVisible();
  await form.getByRole("button", { name: "Record wastage", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Wastage recorded at Main Store.");
  await expect(form).toBeHidden();
  await expect(page.getByRole("row").filter({ hasText: "WST-0009" })).toContainText("Carbon Sole Shoes · Size 42");

  await page.getByRole("button", { name: "Record wastage" }).click();
  const again = page.getByRole("dialog", { name: "Record stock wastage" });
  await choose(again, "Search product", "Carbon Sole Shoes · Size 42");
  await expect(again.getByText("39 in Main Store")).toBeVisible();
});

test("the store filter limits Stock management to one store", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/stock-management");
  // Groupset is stocked at Stores and (since feature 010's design data) at Point of Sale.
  await expect(page.getByRole("row").filter({ hasText: "Groupset" })).toHaveCount(2);
  await choose(page, "store", "Point of Sale");
  await expect(page.getByRole("row").filter({ hasText: "Helmet" }).first()).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Groupset" })).toHaveCount(1);
  await expect(page.getByRole("row").filter({ hasText: "Main Store" })).toHaveCount(0);
  await expect(page.getByRole("row").filter({ hasText: "Stores" })).toHaveCount(0);
});
