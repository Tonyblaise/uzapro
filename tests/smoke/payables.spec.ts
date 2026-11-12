import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 003 · Payables (quickstart 1, 4 and 10). Store data resets on a full page load, so each
 * flow logs in, opens Payables once and then moves with in-app links.
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const toast = (page: Page) => page.getByRole("status");
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });
const cell = (r: Locator, i: number) => r.getByRole("cell").nth(i);

async function rowAction(page: Page, text: string, action: string) {
  await row(page, text).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: action }).click();
}

async function openPayables(page: Page) {
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Payables" }).click();
  await tab(page, "Payables");
  await expect(row(page, "PYB-0014")).toBeVisible();
}

test("Payables list shows the design's balances, approvals and statuses (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await openPayables(page);
  // Cells: 7 balance (with "Paid …"), 8 approval, 9 status.
  const expected: [string, string, string, string][] = [
    ["PYB-0014", "79,560", "Approved", "Unpaid"],
    ["PYB-0013", "24,200", "Approved", "Overdue"],
    ["PYB-0012", "12,800", "Waiting approval", "Unpaid"],
    ["PYB-0011", "0", "Approved", "Paid"],
    ["PYB-0010", "0", "Approved", "Paid"],
  ];
  for (const [ref, balance, approval, status] of expected) {
    const r = row(page, ref);
    await expect(cell(r, 7)).toContainText(balance);
    await expect(cell(r, 8)).toHaveText(approval);
    await expect(cell(r, 9)).toHaveText(status);
  }
  await expect(page.getByText("You owe suppliers", { exact: true })).toBeVisible();
});

test("Approve PYB-0012 and pay it in full (quickstart 4)", async ({ page, errors }) => {
  void errors;
  await openPayables(page);
  await rowAction(page, "PYB-0012", "Approve");
  await expect(toast(page)).toContainText("PYB-0012 approved for payment.");
  await expect(cell(row(page, "PYB-0012"), 8)).toHaveText("Approved");

  await rowAction(page, "PYB-0012", "Pay supplier");
  const form = page.getByRole("dialog", { name: "Pay supplier" });
  await expect(form.getByText("Approved payables for Road & Travel Tyres (oldest first)")).toBeVisible();
  await expect(form.locator("label").filter({ hasText: "PYB-0012" }).getByRole("checkbox")).toBeChecked();
  await form.getByRole("button", { name: "Pay full balance" }).click();
  await expect(form.getByLabel("Amount paid (KES)")).toHaveValue("12800");
  await expect(form.getByRole("button", { name: "Paid from", exact: true })).toContainText("Equity Bank — Main");
  await form.getByRole("button", { name: "Save payment" }).click();
  await expect(toast(page)).toContainText("VPMT-0009 saved.");
  await expect(form).toBeHidden();
  await expect(cell(row(page, "PYB-0012"), 9)).toHaveText("Paid");

  await tab(page, "Payments");
  const pay = row(page, "VPMT-0009");
  await expect(pay).toContainText("PYB-0012");
  await expect(pay).toContainText("Road & Travel Tyres");
  await expect(cell(pay, 6)).toHaveText("12,800");
});

test("Supplier ageing buckets the open payables (quickstart 10)", async ({ page, errors }) => {
  void errors;
  await openPayables(page);
  await tab(page, "Supplier ageing");
  // Cells: 0 supplier, 1 open, 2 not yet due, 3 1–30 days, …, 7 total.
  const mag = row(page, "Magaliesburg Wheels");
  await expect(cell(mag, 3)).toHaveText("24,200");
  await expect(cell(mag, 7)).toHaveText("24,200");
  const east = row(page, "Eastside Bicycle Supplies");
  await expect(cell(east, 2)).toHaveText("79,560");
  await expect(cell(east, 7)).toHaveText("79,560");
});
