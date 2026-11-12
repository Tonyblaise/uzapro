import { expect, loginAs, test } from "./fixtures";

/** Quickstart scenario 7 (US4, T073). Store data is in memory, so each flow stays on one page load. */

test("Products overview renders", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/products/overview");
  await expect(page.getByRole("heading", { level: 1, name: "Products" })).toBeVisible();
  for (const text of ["Total products", "Product sales", "Products by category", "Top selling products", "Low stock products"]) {
    await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Add product" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Manage categories" })).toBeVisible();
});

test("add Test Saddle in Parts with a 40% margin, then see it listed", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/products/all-products");
  await page.getByRole("button", { name: "New product" }).click();
  const form = page.getByRole("dialog", { name: "New product" });
  await expect(form).toBeVisible();

  await form.getByLabel("Product name").fill("Test Saddle");
  await form.getByRole("button", { name: "Product category" }).click();
  await form.getByRole("option", { name: "Parts", exact: true }).click();
  await form.getByLabel("Variant name").fill("Standard");
  await form.getByLabel("Cost in KES").fill("1500");
  await form.getByLabel("Price in KES").fill("2500");
  await expect(form.getByText("+40%", { exact: true })).toBeVisible();

  await form.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Test Saddle added.");
  await expect(form).toBeHidden();
  const row = page.getByRole("row").filter({ hasText: "Test Saddle" });
  await expect(row).toContainText("Parts");
  await expect(row).toContainText("2,500");
  await expect(row).toContainText("Active");
});

test("an oversize product image is rejected", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/products/all-products?action=new");
  const form = page.getByRole("dialog", { name: "New product" });
  await form.getByLabel("Product image (optional)").setInputFiles({
    name: "big.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(page.getByRole("status")).toContainText("That image is over 5MB.");
});

test("a duplicate category is blocked and deleting Parts is blocked", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/products/categories");

  await page.getByRole("button", { name: "New category" }).click();
  const form = page.getByRole("dialog", { name: "Add category" });
  await form.getByLabel("Category name").fill("Parts");
  await form.getByRole("button", { name: "Add category" }).click();
  await expect(page.getByRole("status")).toContainText("A category called Parts already exists.");
  await form.getByRole("button", { name: "Close", exact: true }).first().click();
  await expect(form).toBeHidden();

  const parts = page.getByRole("row").filter({ hasText: "2 sub-categories" });
  await parts.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByRole("status")).toContainText("Move its products to another category first.");
  await expect(page.getByRole("row").filter({ hasText: "2 sub-categories" })).toBeVisible();
});

test("open Bike Pump and see its stock history", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/products/all-products");
  await page.getByRole("row").filter({ hasText: "Bike Pump" }).getByText("Bike Pump", { exact: true }).click();
  const record = page.getByRole("dialog", { name: "Bike Pump" });
  await expect(record).toBeVisible();
  await expect(record.getByText("Overview", { exact: true })).toBeVisible();
  for (const head of ["Date", "Variant", "Change", "Store", "Quantity", "Left", "By", "Ref"]) {
    await expect(record.getByRole("columnheader", { name: head, exact: true }).last()).toBeVisible();
  }
  await expect(record.getByRole("cell", { name: "SAL-001168" })).toBeVisible();
  await expect(record.getByText("Point of Sale").first()).toBeVisible();
});
