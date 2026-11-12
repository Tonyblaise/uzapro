import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 005 · US5 generic screens (quickstart 12): Reports, Team, Permissions, Messages and
 * Settings › Staff logins, Taxes, Connected apps, Import and export. Store data resets on a full
 * page load, so flows that change data stay on one page after the first visit.
 */

const toast = (page: Page) => page.getByRole("status");
const showing = (page: Page) => page.getByText(/^Showing \d+ of \d+$/);

/** Every generic tab and a piece of its seed content (a card title, field label or first cell). */
const TABS: [path: string, seed: string][] = [
  ["/reports/popular", "Production yield"],
  ["/reports/sales", "Sales targets"],
  ["/reports/money", "Aged receivables"],
  ["/reports/stock", "Reorder forecast"],
  ["/reports/build-a-report", "Report name"],
  ["/reports/sent-automatically", "Weekly P&L"],
  ["/team/team", "Mary Achieng"],
  ["/permissions/permissions", "Store / Inventory"],
  ["/messages/send-message", "Audience"],
  ["/messages/saved-messages", "Invoice due"],
  ["/messages/sent-messages", "30 Oct 16:40"],
  ["/messages/campaigns", "Black Friday"],
  ["/messages/scheduled", "Statement reminder"],
  ["/settings/staff-logins", "Grant Jensen"],
  ["/settings/taxes", "Zero-rated"],
  ["/settings/connected-apps", "SMS gateway"],
  ["/settings/import-and-export", "Record type"],
];

test("every generic tab shows its seed content and the New button", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  for (const [path, seed] of TABS) {
    await page.goto(path);
    await expect(page.getByText(seed, { exact: true }).first(), path).toBeVisible();
    await expect(page.getByRole("button", { name: "New", exact: true }), path).toBeVisible();
  }
});

test("Reports › Popular shows 8 cards with Run or Coming soon (feature 009)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/reports/popular");
  const cards = page.getByRole("list", { name: "Reports" }).getByRole("listitem");
  await expect(cards).toHaveCount(8);
  await expect(cards.first()).toContainText("Sales summary");
  await expect(cards.first()).toContainText("Total sales, orders and refunds");
  await expect(cards.first().getByRole("button", { name: "Run Sales summary" })).toBeEnabled();
  await expect(cards.last().getByRole("button", { name: "Coming soon" })).toBeDisabled();
});

test("Saved messages: search, view, delete, and New without a new row", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/messages/saved-messages");
  await expect(showing(page)).toHaveText("Showing 3 of 3");

  await page.getByLabel("Search this list").fill("whats");
  await expect(showing(page)).toHaveText("Showing 1 of 3");
  await expect(page.getByRole("row").filter({ hasText: "Welcome" })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Order ready" })).toHaveCount(0);
  await page.getByLabel("Search this list").fill("");
  await expect(showing(page)).toHaveText("Showing 3 of 3");

  // Row click opens the record drawer.
  await page.getByRole("row").filter({ hasText: "Invoice due" }).click();
  const record = page.getByRole("dialog", { name: "Invoice due" });
  await expect(record.getByText("Overview")).toBeVisible();
  await expect(record).toContainText("name, amount, due");
  await expect(record.getByRole("button", { name: "Edit" })).toBeDisabled();
  await record.getByRole("button", { name: "Close" }).click();
  await expect(record).toBeHidden();

  // New → Create shows the message and adds no row.
  await page.getByRole("button", { name: "New", exact: true }).click();
  const create = page.getByRole("dialog", { name: "New record" });
  await create.getByLabel("Name").fill("Payment thanks");
  await create.getByRole("button", { name: "Create" }).click();
  await expect(toast(page)).toContainText("Record created.");
  await expect(create).toBeHidden();
  await expect(showing(page)).toHaveText("Showing 3 of 3");

  // Owner Delete with confirmation.
  await page.getByRole("row").filter({ hasText: "Order ready" }).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  const confirm = page.getByRole("dialog", { name: "Delete Order ready?" });
  await expect(confirm).toContainText("This permanently deletes this record.");
  await confirm.getByRole("button", { name: "Delete" }).click();
  await expect(toast(page)).toContainText("Order ready deleted.");
  await expect(page.getByRole("row").filter({ hasText: "Order ready" })).toHaveCount(0);
  await expect(showing(page)).toHaveText("Showing 2 of 2");
});

test("a generic form Save shows Changes saved.", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/reports/build-a-report");
  await expect(page.getByLabel("Data source")).toHaveValue("Sales");
  await expect(page.getByLabel("Report name")).toHaveAttribute("placeholder", "Weekly sales by rep");
  await page.getByLabel("Data source").fill("Stock");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByLabel("Data source")).toHaveValue("Sales");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(toast(page)).toContainText("Changes saved.");
});

test("the Accountant is not offered Delete on Reports or Team", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "accountant");
  for (const [path, row] of [
    ["/reports/sent-automatically", "Daily sales"],
    ["/team/team", "Tony Blaise"],
  ] as const) {
    await page.goto(path);
    await page.getByRole("row").filter({ hasText: row }).getByRole("button", { name: "Actions" }).click();
    await expect(page.getByRole("menuitem", { name: "View" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toHaveCount(0);
    await page.keyboard.press("Escape");
  }
});
