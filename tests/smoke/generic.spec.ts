import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 005 · US5 generic screens (quickstart 12): Reports, Team and (Permissions: feature 011)
 * Settings › Staff logins and Taxes. Store data resets on a full
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
  ["/settings/staff-logins", "Grant Jensen"],
  ["/settings/taxes", "Zero-rated"],
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

test("Settings › Taxes: search, view, delete, and New without a new row", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/settings/taxes");
  await expect(showing(page)).toHaveText("Showing 3 of 3");

  await page.getByLabel("Search this list").fill("zero");
  await expect(showing(page)).toHaveText("Showing 1 of 3");
  await expect(page.getByRole("row").filter({ hasText: "Zero-rated" })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Exempt" })).toHaveCount(0);
  await page.getByLabel("Search this list").fill("");
  await expect(showing(page)).toHaveText("Showing 3 of 3");

  // Row click opens the record drawer.
  await page.getByRole("row").filter({ hasText: "VAT" }).click();
  const record = page.getByRole("dialog", { name: "VAT" });
  await expect(record.getByText("Overview")).toBeVisible();
  await expect(record).toContainText("Sales + purchase");
  await record.getByRole("button", { name: "Close" }).click();
  await expect(record).toBeHidden();

  // New → Create shows the message and adds no row.
  await page.getByRole("button", { name: "New", exact: true }).click();
  const create = page.getByRole("dialog", { name: "New record" });
  await create.getByLabel("Name").fill("Excise");
  await create.getByRole("button", { name: "Create" }).click();
  await expect(toast(page)).toContainText("Record created.");
  await expect(create).toBeHidden();
  await expect(showing(page)).toHaveText("Showing 3 of 3");

  // Owner Delete with confirmation.
  await page.getByRole("row").filter({ hasText: "Exempt" }).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  const confirm = page.getByRole("dialog", { name: "Delete Exempt?" });
  await expect(confirm).toContainText("This permanently deletes this record.");
  await confirm.getByRole("button", { name: "Delete" }).click();
  await expect(toast(page)).toContainText("Exempt deleted.");
  await expect(page.getByRole("row").filter({ hasText: "Exempt" })).toHaveCount(0);
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
