import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/** Sales story (US3, T065): quickstart scenarios 4–6, quotation, blocked sales and targets. */

const drawer = (page: Page) => page.getByRole("dialog").last();

/** Pick an option in the design's SearchSelect, found by its label. */
async function pick(page: Page, label: string, option: string) {
  await drawer(page).getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

/** Record Bike Pump ×2 (zero-rated) and Helmet Medium ×1 for Morningview Bicycles. */
async function recordSale(page: Page) {
  await page.goto("/sales/all-sales?action=new");
  await expect(drawer(page).getByRole("heading", { name: "New sale" })).toBeVisible();
  await pick(page, "Customer", "Morningview Bicycles");
  await pick(page, "Product", "Bike Pump");
  await drawer(page).getByLabel("Number of units").fill("2");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await pick(page, "Product", "Helmet");
  await pick(page, "Product variant", "Medium");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  // VAT 16% on the Helmet only: 1,639 × 0.16 = 262.24; total 690 + 1,639 + 262.24.
  await expect(drawer(page).getByText("262.24")).toBeVisible();
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
  await expect(page.getByText("Sale recorded. KES 2,591.24 paid by M-Pesa.")).toBeVisible();
}

test("record a sale: listed first, stock drops at Point of Sale", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await recordSale(page);
  const first = page.getByRole("row").nth(1);
  await expect(first).toContainText("Morningview Bicycles");
  await expect(first).toContainText("2,591.24");
  await expect(first).toContainText("Paid");

  // Navigate in-app (a reload resets the demo data) to Stock management.
  await page.getByRole("link", { name: "Stock", exact: true }).click();
  await page.getByRole("link", { name: "Stock management", exact: true }).click();
  await page.getByLabel("Search this list").fill("Bike Pump");
  await expect(page.getByRole("row", { name: /Bike Pump.*Point of Sale/ }).first()).toContainText("26");
});

test("void the sale: Sale voided., listed as VOID-0002", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await recordSale(page);
  await page.getByRole("row").nth(1).click();
  await expect(drawer(page).getByText("Sale SAL-001185").first()).toBeVisible();
  await drawer(page).getByRole("button", { name: "Void", exact: true }).click();
  await expect(drawer(page).getByRole("heading", { name: "Void sale" })).toBeVisible();
  await pick(page, "Reason", "Entered by mistake");
  await drawer(page).getByRole("button", { name: "Void sale" }).click();
  await expect(page.getByText("Sale voided.")).toBeVisible();
  await page.getByRole("link", { name: "Voided items", exact: true }).click();
  const row = page.getByRole("row", { name: /VOID-0002/ });
  await expect(row).toContainText("SAL-001185");
  await expect(row).toContainText("Entered by mistake");
});

test("raise a credit note on a sale and approve it", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await recordSale(page);
  await page.getByRole("row").nth(1).click();
  await drawer(page).getByRole("button", { name: "Credit note" }).click();
  await expect(drawer(page).getByRole("heading", { name: "Raise credit note" })).toBeVisible();
  await drawer(page).getByText("I confirm these items and amounts.").click();
  await drawer(page).getByRole("button", { name: "Raise credit note" }).click();
  await expect(page.getByText("CRN-0008 raised for KES 2,701.64. It is waiting for approval.")).toBeVisible();
  await drawer(page).getByRole("button", { name: "Close" }).click();

  await page.getByRole("link", { name: "Refunds (credit notes)", exact: true }).click();
  const row = page.getByRole("row", { name: /CRN-0008/ });
  await expect(row).toContainText("Waiting approval");
  await row.click();
  await drawer(page).getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("CRN-0008 approved.")).toBeVisible();
  await expect(drawer(page).getByText("Approved", { exact: true }).first()).toBeVisible();
});

test("a quotation with a discount computes its totals", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/quotations?action=quote");
  await expect(drawer(page).getByRole("heading", { name: "New quotation" })).toBeVisible();
  await pick(page, "Quotation to", "Mountain Goats");
  await pick(page, "Add item", "Helmet · Medium");
  await drawer(page).getByLabel("Discount", { exact: true }).fill("10");
  await drawer(page).getByRole("button", { name: "discount type" }).click();
  await page.getByRole("option", { name: "%", exact: true }).click();
  // 1,639 − 10% = 1,475.10; VAT 16% = 236.02; total 1,711.12.
  await expect(drawer(page).getByText("KES 236.02")).toBeVisible();
  await expect(drawer(page).getByText("KES 1,711.12")).toBeVisible();
  await drawer(page).getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Q-001003 saved.")).toBeVisible();
  const row = page.getByRole("row", { name: /Q-001003/ });
  await expect(row).toContainText("Mountain Goats");
  await expect(row).toContainText("1,711");
});

test("an empty sale cannot be recorded", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/all-sales?action=new");
  await expect(drawer(page).getByText("No items in this sale.")).toBeVisible();
  await expect(drawer(page).getByRole("button", { name: "Record sale" })).toBeDisabled();
});

test("a walk-in customer cannot buy on credit", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/all-sales?action=new");
  await pick(page, "Product", "Bike Pump");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await pick(page, "Paid by", "Pay later (credit)");
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
  await expect(page.getByText("Pick the customer first. Walk-in customers can't buy on credit.")).toBeVisible();
  await expect(drawer(page).getByRole("heading", { name: "New sale" })).toBeVisible();
});

test("delete a sales target", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/sales-targets");
  const row = page.getByRole("row", { name: /October store sales/ });
  await row.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByText("Target deleted.")).toBeVisible();
  await expect(page.getByRole("row", { name: /October store sales/ })).toHaveCount(0);
});
