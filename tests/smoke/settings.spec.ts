import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 005 · Settings structure (quickstart 7–10). Store data resets on a full page load, so each
 * flow logs in once and then moves with in-app links.
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const toast = (page: Page) => page.getByRole("status");
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });

async function openSettings(page: Page, tabName = "Business profile") {
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Settings" }).click();
  await expect(page).toHaveURL(/\/settings\/business-profile$/);
  if (tabName !== "Business profile") {
    await tab(page, tabName);
    await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: tabName, exact: true })).toHaveAttribute("aria-current", "page");
  }
}

async function options(scope: Locator, picker: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  return scope.getByRole("option");
}

test("Business profile: fill the trading name and KRA PIN (quickstart 7)", async ({ page, errors }) => {
  void errors;
  await openSettings(page);
  await expect(page.getByText("2 required details missing")).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Trading name" })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ KRA PIN" })).toBeVisible();

  await page.getByRole("button", { name: "Edit profile" }).click();
  const form = page.getByRole("dialog", { name: "Edit business profile" });
  await form.getByLabel("Trading name").fill("Blaise Cycles");
  await form.getByLabel("KRA PIN").fill("P051234567X");
  await form.getByRole("button", { name: "Save changes" }).click();
  await expect(toast(page)).toContainText("Business profile saved.");
  await expect(form).toBeHidden();
  await expect(page.getByText("Profile complete")).toBeVisible();
  await expect(page.getByText("P051234567X")).toBeVisible();
});

test("Branches: add Mombasa with its store, which shows everywhere (quickstart 8 and 10)", async ({ page, errors }) => {
  void errors;
  await openSettings(page, "Branches");

  // The headquarters can't be deleted.
  await row(page, "Nairobi HQ").getByRole("button", { name: "Actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Delete" })).toBeDisabled();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Add branch" }).click();
  const form = page.getByRole("dialog", { name: "Add branch" });
  await form.getByLabel("Name", { exact: true }).fill("Nairobi HQ");
  await expect(form.getByText("Name already used")).toBeVisible();
  await expect(form.getByRole("button", { name: "Create branch" })).toBeDisabled();
  await form.getByLabel("Name", { exact: true }).fill("Mombasa");
  await expect(form.getByRole("checkbox", { name: /Create terminal/ })).toBeDisabled();
  await form.getByRole("checkbox", { name: /Create storage location/ }).check();
  await form.getByRole("button", { name: "Create branch" }).click();
  await expect(toast(page)).toContainText("Mombasa created. Mombasa Store added.");
  await expect(form).toBeHidden();
  await expect(row(page, "BBL-BRN-003")).toContainText("Mombasa");

  await tab(page, "Storage locations");
  await expect(row(page, "Mombasa Store")).toContainText("POS enabled");

  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Warehouses");
  await expect(row(page, "Mombasa Store")).toBeVisible();

  // The new branch is offered in the other modules' branch pickers (FR-013).
  await nav(page).getByRole("link", { name: "Accounts" }).click();
  await tab(page, "Bank accounts");
  await page.getByRole("button", { name: "New account" }).click();
  const account = page.getByRole("dialog", { name: "New account" });
  await expect((await options(account, "Branch")).filter({ hasText: /^Mombasa$/ })).toBeVisible();
  await account.getByRole("button", { name: "Cancel" }).click();
  await expect(account).toBeHidden();

  await nav(page).getByRole("link", { name: "Expenses" }).click();
  await page.getByRole("button", { name: "Record expenses" }).click();
  const expense = page.getByRole("dialog", { name: "Record expenses" });
  await expect((await options(expense, "Branch (optional)")).filter({ hasText: /^Mombasa$/ })).toBeVisible();
});

test("Terminals: add as many as you need, no paid slots (user request)", async ({ page, errors }) => {
  void errors;
  await openSettings(page, "Terminals");
  await expect(page.getByText(/slot/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add a paid slot" })).toHaveCount(0);

  for (const name of ["Counter 2", "Counter 3"]) {
    await page.getByRole("button", { name: "Add terminal" }).click();
    const form = page.getByRole("dialog", { name: "Add terminal" });
    await expect(form.getByText(/Pay and activate|No charge|free slots/)).toHaveCount(0);
    await form.getByLabel("Terminal name").fill(name);
    await form.getByRole("button", { name: "Storage location", exact: true }).click();
    await form.getByRole("option", { name: "Main Store", exact: true }).click();
    await form.getByRole("button", { name: "Add terminal" }).click();
    await expect(toast(page)).toContainText(`${name} added and active.`);
    await expect(form).toBeHidden();
  }
  await expect(page.getByRole("button", { name: /^Active 3/ })).toBeVisible();
});
