import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 004 · US6: payments and refunds move real money (quickstart 11, FR-013, FR-013a).
 * Store data resets on a full page load, so each flow moves with in-app links after login.
 */

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status");
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
/** Open a tab and wait until it is current (a module link first redirects to its default tab). */
async function tab(page: Page, name: string) {
  const link = page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true });
  await expect(page.getByRole("navigation", { name: "Sections" }).locator('[aria-current="page"]')).toHaveCount(1);
  await link.click();
  await expect(link).toHaveAttribute("aria-current", "page");
}

async function pick(page: Page, label: string, option: string) {
  await drawer(page).getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("a customer payment into Equity Bank — Main raises its balance and adds a Transactions line", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await page.getByRole("row").filter({ hasText: "RCV-0011" }).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Record payment" }).click();
  const form = page.getByRole("dialog", { name: "Record payment" });
  await form.getByRole("button", { name: "Pay full balance" }).click();
  await form.getByRole("button", { name: "Paid into", exact: true }).click();
  await page.getByRole("option", { name: "Equity Bank — Main", exact: true }).click();
  await form.getByRole("button", { name: "Save payment" }).click();
  await expect(toast(page)).toHaveText("PAY-0022 saved. KES 1,026 applied to RCV-0011.");
  await expect(form).toBeHidden();

  await nav(page).getByRole("link", { name: "Accounts" }).click();
  await tab(page, "Bank accounts");
  // 4,812,300 + 1,026
  await expect(page.getByText(/4,813,326/).first()).toBeVisible();
  await tab(page, "Transactions");
  const line = page.getByRole("row").filter({ hasText: "PAY-0022" });
  await expect(line).toContainText("Payment from Blazing Cycle Trails");
  await expect(line).toContainText("Equity Bank — Main");
  await expect(line).toContainText("1,026");
});

test("approving a cash refund on a sale's credit note takes the money out of Cash drawer", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/all-sales?action=new");
  await pick(page, "Customer", "Morningview Bicycles");
  await pick(page, "Product", "Bike Pump");
  await drawer(page).getByLabel("Number of units").fill("2");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
  await expect(toast(page)).toContainText("Sale recorded.");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("row").nth(1).click();
  await expect(drawer(page).getByRole("heading", { name: /^Sale SAL-/ })).toBeVisible();
  await drawer(page).getByRole("button", { name: "Credit note" }).click();
  await drawer(page).getByText("I confirm these items and amounts.").click();
  await drawer(page).getByRole("button", { name: "Raise credit note" }).click();
  await expect(toast(page)).toContainText("CRN-0008 raised");
  await drawer(page).getByRole("button", { name: "Close" }).click();

  await tab(page, "Refunds (credit notes)");
  await page.getByRole("row", { name: /CRN-0008/ }).click();
  await drawer(page).getByRole("button", { name: "Approve" }).click();
  await expect(toast(page)).toHaveText("CRN-0008 approved.");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await nav(page).getByRole("link", { name: "Accounts" }).click();
  await tab(page, "Transactions");
  const line = page.getByRole("row").filter({ hasText: "CRN-0008" });
  await expect(line).toContainText("Refund to Morningview Bicycles");
  await expect(line).toContainText("Cash drawer");
});

test("paying an expense bill in full in Payables marks the expense Paid from the paying account", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Expenses" }).click();
  await tab(page, "Expenses");
  await page.getByRole("button", { name: "Record expenses" }).click();
  const form = page.getByRole("dialog", { name: "Record expenses" });
  await form.getByRole("button", { name: "Pay later", exact: true }).click();
  await form.getByRole("button", { name: "Category", exact: true }).click();
  await form.getByRole("option", { name: "Utilities", exact: true }).click();
  await form.getByLabel("Amount (KES)", { exact: true }).fill("3000");
  await form.getByLabel("Supplier or payee (required)").fill("Kenya Power");
  await form.getByRole("button", { name: "Save 1 expense" }).click();
  await expect(toast(page)).toContainText("1 added to Payables.");
  await expect(form).toBeHidden();

  await nav(page).getByRole("link", { name: "Payables" }).click();
  await tab(page, "Payables");
  await page.getByRole("row").filter({ hasText: "EXP-0044" }).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Pay supplier" }).click();
  const pay = page.getByRole("dialog", { name: "Pay supplier" });
  await pay.getByRole("button", { name: "Pay full balance" }).click();
  await pay.getByRole("button", { name: "Save payment" }).click();
  await expect(toast(page)).toHaveText("VPMT-0009 saved. KES 3,000 paid to Kenya Power.");
  await expect(pay).toBeHidden();

  await nav(page).getByRole("link", { name: "Expenses" }).click();
  await tab(page, "Expenses");
  const exp = page.getByRole("row").filter({ hasText: "EXP-0044" });
  await expect(exp).toContainText("Paid");
  await expect(exp).toContainText("Equity Bank — Main");
});
