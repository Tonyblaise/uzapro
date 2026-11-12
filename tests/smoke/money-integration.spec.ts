import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 003 · US3: sales and purchases create real receivables and payables (quickstart 5–7).
 * Store data resets on a full page load, so each flow moves with in-app links after login.
 */

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status");
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();

async function pick(page: Page, label: string, option: string) {
  await drawer(page).getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function creditSale(page: Page) {
  await page.goto("/sales/all-sales?action=new");
  await pick(page, "Customer", "Mountain Goats");
  await pick(page, "Product", "Bike Pump");
  await drawer(page).getByLabel("Number of units").fill("2");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await pick(page, "Paid by", "Pay later (credit)");
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
  await expect(toast(page)).toHaveText("Credit sale recorded. KES 690.00 added to Receivables as RCV-0013, due in 30 days.");
}

test("a credit sale creates RCV-0013 and voiding the sale closes it", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await creditSale(page);

  await nav(page).getByRole("link", { name: "Receivables" }).click();
  const row = page.getByRole("row").filter({ hasText: "RCV-0013" });
  await expect(row).toContainText("Mountain Goats");
  await expect(row).toContainText("Sale on credit");
  await expect(row).toContainText("690");

  await nav(page).getByRole("link", { name: "Sales" }).click();
  await tab(page, "All sales");
  await page.getByRole("row").nth(1).click();
  await drawer(page).getByRole("button", { name: "Void", exact: true }).click();
  await pick(page, "Reason", "Entered by mistake");
  await drawer(page).getByRole("button", { name: "Void sale" }).click();
  await expect(toast(page)).toHaveText("Sale voided.");

  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await expect(page.getByRole("row").filter({ hasText: "RCV-0013" })).toContainText("Voided");
});

test("receiving an unpaid purchase order creates an approved Goods received payable", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/purchases/purchase-orders");
  const row = page.getByRole("row").filter({ hasText: "PUR-ORD-0408" });
  await row.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Accept and receive goods" }).click();
  const recv = page.getByRole("dialog", { name: "Receive goods" });
  await recv.getByRole("button", { name: "Receive all as ordered" }).click();
  await recv.getByRole("button", { name: /^Receive \d+ lines?$/ }).click();
  await expect(toast(page)).toContainText("PYB-0015 added to Payables.");
  // Saving returns to the order view (design `poView`); close it before using the sidebar.
  await drawer(page).getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await nav(page).getByRole("link", { name: "Payables" }).click();
  const pyb = page.getByRole("row").filter({ hasText: "PYB-0015" });
  await expect(pyb).toContainText("Magaliesburg Wheels");
  await expect(pyb).toContainText("Goods received");
  await expect(pyb).toContainText("Approved");
});

test("Record payment on an invoice pays its receivable and marks the invoice Paid", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/invoices");
  await page.getByRole("row").filter({ hasText: "INV-0355" }).click();
  await drawer(page).getByRole("button", { name: "Record payment" }).click();
  const form = page.getByRole("dialog", { name: "Record payment" });
  await expect(form.getByText("RCV-0011")).toBeVisible();
  await form.getByRole("button", { name: "Pay full balance" }).click();
  await form.getByRole("button", { name: "Save payment" }).click();
  await expect(toast(page)).toHaveText("PAY-0022 saved. KES 1,026 applied to RCV-0011.");
  await expect(form).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("row").filter({ hasText: "INV-0355" })).toContainText("Paid");

  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await expect(page.getByRole("row").filter({ hasText: "RCV-0011" })).toContainText("Paid");
});
