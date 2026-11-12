import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 004 · Accounts (quickstart 1–4). Store data resets on a full page load, so each flow logs
 * in, opens Accounts once and then moves with in-app links. Forms update the URL when they close,
 * so each flow waits for the form to be hidden before moving on.
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const toast = (page: Page) => page.getByRole("status");
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });
const cell = (r: Locator, i: number) => r.getByRole("cell").nth(i);
const card = (page: Page, name: string) => page.getByRole("article", { name, exact: true });

async function choose(scope: Locator | Page, picker: string, option: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

async function openAccounts(page: Page) {
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Accounts" }).click();
  await tab(page, "Bank accounts");
  await expect(card(page, "Equity Bank — Main")).toBeVisible();
}

const SEED: [string, string][] = [
  ["Equity Bank — Main", "4,812,300"],
  ["M-Pesa Till", "386,450"],
  ["Cash drawer", "24,600"],
];

test("Bank accounts shows the design's balances on the account cards (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await openAccounts(page);
  for (const [name, balance] of SEED) await expect(card(page, name)).toContainText(`${balance}.00`);
  await expect(card(page, "Equity Bank — Main")).toContainText("Net inflow");
  await expect(card(page, "Equity Bank — Main")).toContainText("+312,300.00");

  // The "Account type" picker leaves only M-Pesa Till for Mobile money.
  await choose(page.getByRole("main"), "Account type", "Mobile money");
  await expect(card(page, "M-Pesa Till")).toBeVisible();
  await expect(card(page, "Equity Bank — Main")).toBeHidden();
  await expect(card(page, "Cash drawer")).toBeHidden();
  await choose(page.getByRole("main"), "Account type", "All account types");
  await expect(card(page, "Cash drawer")).toBeVisible();
});

test("Transactions lists the ledger and filters by account (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await openAccounts(page);
  await tab(page, "Transactions");
  await expect(page.getByText("Showing 10 of 10")).toBeVisible();
  await choose(page.getByRole("main"), "Account", "M-Pesa Till");
  await expect(page.getByText("Showing 3 of 3")).toBeVisible();
  await expect(cell(row(page, "TRN-0031"), 4)).toHaveText("− 250,000");
  await expect(cell(row(page, "DEP-0217"), 4)).toHaveText("+ 18,450");
  await expect(cell(row(page, "WDL-0103"), 4)).toHaveText("− 42,300");
  await expect(row(page, "WDL-0103")).toContainText("Withdrawal");

  // A row opens the matching record view.
  await row(page, "DEP-0217").click();
  const view = page.getByRole("dialog", { name: "Deposit receipt" });
  await expect(view).toContainText("DEP-0217");
  await expect(view).toContainText("Money received");
  await view.getByRole("button", { name: "Close" }).last().click();
  await expect(view).toBeHidden();
});

test("Add an account (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await openAccounts(page);
  await page.getByRole("button", { name: "New account" }).click();
  const form = page.getByRole("dialog", { name: "New account" });
  await form.getByLabel("Account name").fill("KCB Payroll");
  await choose(form, "Account type", "Bank");
  await form.getByLabel("Opening balance (KES)").fill("15000");
  await form.getByRole("button", { name: "Add account" }).click();
  await expect(toast(page)).toContainText("KCB Payroll added.");
  await expect(form).toBeHidden();
  await expect(card(page, "KCB Payroll")).toContainText("15,000.00");
});

test("Deposit 10,000 into Cash drawer (quickstart 2)", async ({ page, errors }) => {
  void errors;
  await openAccounts(page);
  await tab(page, "Deposits");
  await page.getByRole("button", { name: "New deposit" }).click();
  const form = page.getByRole("dialog", { name: "New deposit" });
  await choose(form, "Destination account", "Cash drawer");
  await form.getByLabel("Deposit amount (KES)").fill("10000");
  await form.getByLabel("Description").fill("Float top-up");
  await form.getByRole("button", { name: "Create deposit" }).click();
  await expect(toast(page)).toContainText("Deposit saved.");
  await expect(form).toBeHidden();
  const dep = row(page, "DEP-0219");
  await expect(cell(dep, 2)).toHaveText("Cash drawer");
  await expect(cell(dep, 5)).toHaveText("10,000");
  await expect(cell(dep, 6)).toHaveText("Cleared");

  await tab(page, "Bank accounts");
  await expect(card(page, "Cash drawer")).toContainText("34,600.00");
});

test("Withdraw 5,000 from M-Pesa Till (quickstart 3)", async ({ page, errors }) => {
  void errors;
  await openAccounts(page);
  await tab(page, "Withdrawals");
  await page.getByRole("button", { name: "New withdrawal" }).click();
  const form = page.getByRole("dialog", { name: "New withdrawal" });
  await choose(form, "Source account", "M-Pesa Till");
  await form.getByLabel("Withdrawal amount (KES)").fill("5000");
  await form.getByLabel("Description").fill("Petty cash");
  await form.getByRole("button", { name: "Create withdrawal" }).click();
  await expect(toast(page)).toContainText("Withdrawal saved.");
  await expect(form).toBeHidden();
  const wd = row(page, "WDL-0105");
  await expect(cell(wd, 2)).toHaveText("M-Pesa Till");
  await expect(cell(wd, 7)).toHaveText("Completed");

  await tab(page, "Bank accounts");
  await expect(card(page, "M-Pesa Till")).toContainText("381,450.00");
});

test("Transfer 50,000 from M-Pesa Till to Equity Bank — Main (quickstart 4)", async ({ page, errors }) => {
  void errors;
  await openAccounts(page);
  await tab(page, "Transfers");
  await page.getByRole("button", { name: "New transfer" }).click();
  const form = page.getByRole("dialog", { name: "New account transfer" });
  await choose(form, "From account", "M-Pesa Till");
  await choose(form, "To account", "Equity Bank — Main");
  await form.getByLabel("Transfer amount (KES)").fill("50000");
  await form.getByLabel("Description").fill("Weekly banking");
  await form.getByRole("button", { name: "Confirm transfer" }).click();
  await expect(toast(page)).toContainText("Transfer saved.");
  await expect(form).toBeHidden();
  await expect(cell(row(page, "TRN-0032"), 5)).toHaveText("50,000");

  await tab(page, "Bank accounts");
  await expect(card(page, "M-Pesa Till")).toContainText("336,450.00");
  await expect(card(page, "Equity Bank — Main")).toContainText("4,862,300.00");

  await tab(page, "Transactions");
  await expect(row(page, "TRN-0032")).toHaveCount(2);
  await expect(row(page, "Transfer to Equity Bank — Main").filter({ hasText: "TRN-0032" })).toContainText("− 50,000");
  await expect(row(page, "Transfer from M-Pesa Till").filter({ hasText: "TRN-0032" })).toContainText("+ 50,000");
});

test("Reverse DEP-0218", async ({ page, errors }) => {
  void errors;
  await openAccounts(page);
  await tab(page, "Deposits");
  await row(page, "DEP-0218").click();
  const view = page.getByRole("dialog", { name: "Deposit receipt" });
  await view.getByRole("button", { name: "Reverse", exact: true }).click();
  await expect(view).toContainText("Reverse this deposit? KES 45,600.00 will be taken back out of Equity Bank — Main.");
  await view.getByRole("button", { name: "Yes, reverse it" }).click();
  await expect(toast(page)).toContainText("DEP-0218 reversed. Equity Bank — Main balance updated.");
  await expect(view).toContainText("Amount credited (reversed)");
  await expect(view).toContainText("Reversed by");
  await expect(view.getByRole("button", { name: "Reverse", exact: true })).toHaveCount(0);
  await view.getByRole("button", { name: "Close" }).last().click();
  await expect(view).toBeHidden();
  await expect(cell(row(page, "DEP-0218"), 6)).toHaveText("Reversed");

  await tab(page, "Bank accounts");
  await expect(card(page, "Equity Bank — Main")).toContainText("4,766,700.00");
});
