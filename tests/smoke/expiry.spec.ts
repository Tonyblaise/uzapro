import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/** Feature 016 · batch and expiry tracking (quickstart 1–5). Data resets on a full page load. */

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });

async function pick(page: Page, label: string, option: string) {
  await drawer(page).getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function sellPaint(page: Page, units: string) {
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "All sales");
  await page.getByRole("button", { name: "New sale" }).click();
  await pick(page, "Product", "Muthokinju Paint");
  await pick(page, "Product variant", "White");
  await drawer(page).getByLabel("Number of units").fill(units);
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await pick(page, "Paid by", "Cash");
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
}

async function openExpiry(page: Page) {
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Expiry");
}

test("the expiry list shows expired and soon-to-expire batches, earliest first (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openExpiry(page);
  await expect(page.getByText("1 expired · 1 expiring in 30 days")).toBeVisible();
  for (const text of ["Muthokinju Paint", "Point of Sale", "31 Oct 2026", "Expired 10 days ago", "Expired"]) await expect(row(page, "MP-2409")).toContainText(text);
  for (const text of ["28 Nov 2026", "18 days", "Expires soon"]) await expect(row(page, "MP-2411")).toContainText(text);
  for (const text of ["30 Apr 2027", "OK"]) await expect(row(page, "MP-2502")).toContainText(text);
  const batches = await page.getByRole("row").filter({ hasText: /MP-\d+/ }).allInnerTexts();
  expect(batches.map((t) => t.match(/MP-\d+/)![0])).toEqual(["MP-2409", "MP-2411", "MP-2502"]);
});

test("a sale uses the earliest in-date batch, never the expired one; then the expired batch is written off (US3, US4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await sellPaint(page, "5");
  await expect(toast(page)).toContainText("Sale recorded.");
  await openExpiry(page);
  await expect(row(page, "MP-2411")).toHaveCount(0);
  await expect(row(page, "MP-2502").getByRole("cell").nth(5)).toHaveText("5");
  await expect(row(page, "MP-2409").getByRole("cell").nth(5)).toHaveText("2");

  // 5 in date and 2 expired on a shelf of 7: a sale of 6 is refused.
  await sellPaint(page, "6");
  await expect(toast(page)).toHaveText("Only 5 Muthokinju Paint left at Point of Sale.");
  await drawer(page).getByRole("button", { name: "Cancel" }).click();

  await openExpiry(page);
  await row(page, "MP-2502").getByRole("button", { name: "Actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Write off" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await row(page, "MP-2409").getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Write off" }).click();
  await page.getByRole("dialog", { name: "Write off batch MP-2409?" }).getByRole("button", { name: "Write off" }).click();
  await expect(toast(page)).toHaveText("Batch MP-2409 written off.");
  await expect(row(page, "MP-2409")).toHaveCount(0);
  await expect(page.getByText("0 expired · 0 expiring in 30 days")).toBeVisible();
  await tab(page, "Wastage");
  await expect(page.getByRole("row").filter({ hasText: "Muthokinju Paint" }).filter({ hasText: "Expired" }).first()).toBeVisible();
});

test("record a batch from stock that is not in one, and remove it (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/expiry");
  await page.getByRole("button", { name: "Record batch" }).click();
  const form = page.getByRole("dialog", { name: "Record batch" });
  await pick(page, "Product", "Bike Pump");
  await pick(page, "Store", "Main Store");
  await expect(form).toContainText("30 not in a batch yet");
  await form.getByLabel("Batch number").fill("BP-01");
  await form.getByLabel("Expiry date").fill("2026-12-05");
  await form.getByLabel("Quantity").fill("31");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form.getByRole("alert")).toHaveText("Only 30 Bike Pump at Main Store is not in a batch yet.");
  await form.getByLabel("Quantity").fill("10");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(toast(page)).toHaveText("Batch BP-01 recorded.");
  for (const text of ["Bike Pump", "Main Store", "5 Dec 2026", "25 days", "Expires soon"]) await expect(row(page, "BP-01")).toContainText(text);
  await expect(page.getByText("1 expired · 2 expiring in 30 days")).toBeVisible();

  await row(page, "BP-01").getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Remove" }).click();
  await page.getByRole("dialog", { name: "Remove batch BP-01?" }).getByRole("button", { name: "Remove" }).click();
  await expect(toast(page)).toHaveText("Batch BP-01 removed.");
  await expect(row(page, "BP-01")).toHaveCount(0);
});
