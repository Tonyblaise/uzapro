import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 023 · Tasks (replaces Messages). Store data resets on a full page load, so each flow logs
 * in once and moves with in-app links. The demo clock is 10 Nov 2026.
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const toast = (page: Page) => page.getByRole("status");
const reminders = (page: Page) => page.getByRole("region", { name: "Reminders" });

test("Messages is gone and Tasks lists the seed tasks", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await expect(nav(page).getByRole("link", { name: "Messages", exact: true })).toHaveCount(0);
  await nav(page).getByRole("link", { name: "Tasks", exact: true }).click();
  await expect(page).toHaveURL(/\/tasks\/tasks$/);
  await expect(page.getByRole("button", { name: /Prepare October VAT return/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Reminders due/ })).toBeVisible();

  await page.getByRole("group", { name: "Filter tasks" }).getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("button", { name: /Update supplier price lists/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Prepare October VAT return/ })).toHaveCount(0);
});

test("create a task with a reminder, see it on the Dashboard, mark it done", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  // The seeded overdue reminder is on the Dashboard.
  await expect(reminders(page)).toContainText("Chase Road & Travel Tyres bill");

  await nav(page).getByRole("link", { name: "Tasks", exact: true }).click();
  await page.getByRole("button", { name: "New task" }).click();
  const form = page.getByRole("dialog", { name: "New task" });
  await form.getByLabel("What needs doing?").fill("Renew the shop licence");
  await form.getByText("Remind me").click();
  await form.getByLabel("Remind on").fill("2026-11-09");
  await form.getByLabel("At (optional)").fill("");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(toast(page)).toContainText("Task saved.");
  const details = page.getByRole("dialog", { name: "Task details" });
  await expect(details).toContainText("Renew the shop licence");
  await expect(details).toContainText("This reminder is due");
  await details.getByRole("button", { name: "Close" }).click();

  await nav(page).getByRole("link", { name: "Dashboard" }).click();
  const row = reminders(page).locator("div", { hasText: "Renew the shop licence" }).last();
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Mark done" }).click();
  await expect(toast(page)).toContainText("Renew the shop licence done.");
  await expect(reminders(page)).not.toContainText("Renew the shop licence");
});

test("the bell lists due reminders and snoozes them", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.getByRole("button", { name: /^Notifications, \d+ reminders due$/ }).click();
  const panel = page.getByRole("dialog", { name: "Reminders" });
  const item = panel.locator("div", { hasText: "Chase Road & Travel Tyres bill" }).last();
  await item.getByRole("button", { name: "Snooze" }).click();
  await page.getByRole("menuitem", { name: "Tomorrow" }).click();
  await expect(toast(page)).toContainText("Snoozed for tomorrow.");
  await expect(panel).not.toContainText("Chase Road & Travel Tyres bill");
});

test("a cashier sees only their own tasks", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  await nav(page).getByRole("link", { name: "Tasks", exact: true }).click();
  await expect(page.getByRole("button", { name: /Bank the weekend takings Jane/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Prepare October VAT return/ })).toHaveCount(0);
});
