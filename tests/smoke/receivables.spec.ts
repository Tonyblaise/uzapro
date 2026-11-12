import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 003 · Receivables (quickstart 1–3, 8, 9 and the statement). Store data resets on a full
 * page load, so each flow logs in, opens Receivables once and then moves with in-app links. Forms
 * update the URL when they close, so each flow waits for the form to be hidden before using the
 * header buttons again.
 */

async function choose(scope: Locator | Page, picker: string, option: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const toast = (page: Page) => page.getByRole("status");
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });
const cell = (r: Locator, i: number) => r.getByRole("cell").nth(i);

async function rowAction(page: Page, text: string, action: string) {
  await row(page, text).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: action }).click();
}

/** Tick an open item in the payment form's checklist. */
const tick = (form: Locator, ref: string) => form.locator("label").filter({ hasText: ref }).getByRole("checkbox", { name: "Pay this item" }).check();

async function openReceivables(page: Page) {
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await tab(page, "Receivables");
  await expect(row(page, "RCV-0012")).toBeVisible();
}

test("Receivables list shows the design's balances and statuses (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await openReceivables(page);
  const expected: [string, string, string][] = [
    ["RCV-0012", "45,600", "Overdue"],
    ["RCV-0011", "1,026", "Overdue"],
    ["RCV-0010", "48,400", "Part paid"],
    ["RCV-0008", "32,000", "Unpaid"],
    ["RCV-0009", "0", "Paid"],
    ["RCV-0007", "0", "Paid"],
    ["RCV-0006", "0", "Paid"],
  ];
  for (const [ref, balance, status] of expected) {
    const r = row(page, ref);
    await expect(cell(r, 8)).toHaveText(balance);
    await expect(cell(r, 9)).toHaveText(status);
  }
  await expect(page.getByText("Customers owe you", { exact: true })).toBeVisible();
});

test("Record a full payment on RCV-0011, then verify it (quickstart 2)", async ({ page, errors }) => {
  void errors;
  await openReceivables(page);
  await rowAction(page, "RCV-0011", "Record payment");
  const form = page.getByRole("dialog", { name: "Record payment" });
  await expect(form.getByText("Open receivables for Blazing Cycle Trails (oldest first)")).toBeVisible();
  await expect(form.locator("label").filter({ hasText: "RCV-0011" }).getByRole("checkbox")).toBeChecked();
  await form.getByRole("button", { name: "Pay full balance" }).click();
  await expect(form.getByLabel("Amount received (KES)")).toHaveValue("1026");
  await choose(form, "Payment method", "Bank transfer");
  await choose(form, "Paid into", "Equity Bank — Main");
  await form.getByRole("button", { name: "Save payment" }).click();
  await expect(toast(page)).toContainText("PAY-0022 saved. KES 1,026 applied to RCV-0011.");
  await expect(form).toBeHidden();
  await expect(cell(row(page, "RCV-0011"), 9)).toHaveText("Paid");
  await expect(cell(row(page, "RCV-0011"), 8)).toHaveText("0");

  await tab(page, "Payments");
  const pay = row(page, "PAY-0022");
  await expect(pay).toContainText("RCV-0011");
  await expect(pay).toContainText("Bank transfer");
  await expect(cell(pay, 7)).toHaveText("Pending");
  await rowAction(page, "PAY-0022", "Verify");
  await expect(toast(page)).toContainText("PAY-0022 verified.");
  await expect(cell(row(page, "PAY-0022"), 7)).toHaveText("Verified");
});

test("Paying more than the selected receivables is blocked (quickstart 3)", async ({ page, errors }) => {
  void errors;
  await openReceivables(page);
  await page.getByRole("button", { name: "Record payment" }).click();
  const form = page.getByRole("dialog", { name: "Record payment" });
  await choose(form, "Customer", "Mountain Goats");
  await tick(form, "RCV-0008");
  await form.getByLabel("Amount received (KES)").fill("40000");
  await expect(form.getByText("That is more than the 32,000 KES selected. Lower the amount or tick more receivables.")).toBeVisible();
  await expect(form.getByRole("button", { name: "Save payment" })).toBeDisabled();
  await form.getByRole("button", { name: "Cancel" }).click();
  await expect(form).toBeHidden();
});

test("Payment plan on RCV-0008 and its first instalment (quickstart 8)", async ({ page, errors }) => {
  void errors;
  await openReceivables(page);
  await tab(page, "Payment plans");
  await expect(row(page, "PLN-0003")).toBeVisible();
  await page.getByRole("button", { name: "New payment plan" }).click();
  const form = page.getByRole("dialog", { name: "New payment plan" });
  await choose(form, "Receivable", "RCV-0008 · Mountain Goats · KES 32,000");
  await expect(form.getByText("3 payments of about KES 10,667 (monthly), from 17 Nov 2026 to 17 Jan 2027.")).toBeVisible();
  await form.getByRole("button", { name: "Create plan" }).click();
  await expect(toast(page)).toContainText("PLN-0004 created for Mountain Goats.");
  await expect(form).toBeHidden();
  const plan = row(page, "PLN-0004");
  await expect(cell(plan, 5)).toHaveText("10,667");
  await expect(cell(plan, 4)).toHaveText("0 of 3 paid");

  await rowAction(page, "PLN-0004", "Record instalment");
  const pay = page.getByRole("dialog", { name: "Record payment" });
  await expect(pay.getByText("Instalment for PLN-0004.")).toBeVisible();
  await expect(pay.getByLabel("Amount received (KES)")).toHaveValue("10667");
  await pay.getByRole("button", { name: "Save payment" }).click();
  await expect(toast(page)).toContainText("PAY-0022 saved. KES 10,667 applied to RCV-0008.");
  await expect(pay).toBeHidden();
  await expect(cell(row(page, "PLN-0004"), 4)).toHaveText("1 of 3 paid");

  await tab(page, "Payments");
  await expect(cell(row(page, "PAY-0022"), 5)).toHaveText("Instalment");
  await tab(page, "Receivables");
  await expect(cell(row(page, "RCV-0008"), 8)).toHaveText("21,333");
});

test("Issue CRD-0005, use it to pay, and void CRD-0004 (quickstart 9)", async ({ page, errors }) => {
  void errors;
  await openReceivables(page);
  await tab(page, "Customer credits");
  await expect(row(page, "CRD-0004")).toBeVisible();
  await page.getByRole("button", { name: "Issue credit" }).click();
  const form = page.getByRole("dialog", { name: "Issue customer credit" });
  await choose(form, "Customer", "Morningview Bicycles");
  await form.getByLabel("Credit amount").fill("3000");
  await choose(form, "Source type", "Manual");
  await form.getByRole("textbox", { name: "Reason", exact: true }).fill("Goodwill for a late delivery");
  await form.getByRole("button", { name: "Issue credit" }).click();
  await expect(toast(page)).toContainText("CRD-0005: KES 3,000 credit for Morningview Bicycles.");
  await expect(form).toBeHidden();
  await expect(cell(row(page, "CRD-0005"), 6)).toHaveText("3,000");

  await rowAction(page, "CRD-0005", "Use to pay");
  const pay = page.getByRole("dialog", { name: "Record payment" });
  await expect(pay.getByText("Available credit: KES 3,000")).toBeVisible();
  await tick(pay, "RCV-0012");
  await pay.getByRole("button", { name: "Pay full balance" }).click();
  await expect(pay.getByLabel("Amount received (KES)")).toHaveValue("3000");
  await pay.getByRole("button", { name: "Save payment" }).click();
  await expect(toast(page)).toContainText("PAY-0022 saved. KES 3,000 applied to RCV-0012.");
  await expect(pay).toBeHidden();
  await expect(cell(row(page, "CRD-0005"), 6)).toHaveText("0");
  await expect(cell(row(page, "CRD-0005"), 7)).toHaveText("Used up");

  await rowAction(page, "CRD-0004", "Void credit");
  await expect(toast(page)).toContainText("CRD-0004 voided.");
  await expect(cell(row(page, "CRD-0004"), 7)).toHaveText("Voided");
});

test("Receivables statement regenerates (quickstart 10)", async ({ page, errors }) => {
  void errors;
  await openReceivables(page);
  await tab(page, "Receivables statement");
  await expect(page.getByText("Unpaid balances by customer, aged as of today (10 Nov 2026).")).toBeVisible();
  await expect(row(page, "Morningview Bicycles")).toBeVisible();
  await page.getByRole("button", { name: "Generate statement" }).click();
  await expect(toast(page)).toContainText("Statement updated.");
});
