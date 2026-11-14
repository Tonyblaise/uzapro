import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/** Feature 017 · stock counts (quickstart 1–5). Data resets on a full page load. */

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });

async function openCounts(page: Page) {
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Stock counts");
}

/** Start a full count of Main Store and count every line as the system figure, except the overrides. */
async function countMainStore(page: Page, overrides: Record<string, string>) {
  await openCounts(page);
  await page.getByRole("button", { name: "New count" }).click();
  await drawer(page).getByRole("button", { name: "Store", exact: true }).click();
  await page.getByRole("option", { name: "Main Store", exact: true }).click();
  await drawer(page).getByRole("button", { name: "Start count" }).click();
  await expect(toast(page)).toHaveText("CNT-0002 started.");
  const view = page.getByRole("dialog", { name: "CNT-0002" });
  await expect(view.getByRole("spinbutton").first()).toBeVisible();
  const lines = view.getByRole("row").filter({ has: page.getByRole("spinbutton") });
  for (let i = 0; i < (await lines.count()); i++) {
    const line = lines.nth(i);
    const product = (await line.getByRole("cell").first().innerText()).trim();
    const system = (await line.getByRole("cell").nth(1).innerText()).replace(/,/g, "").trim();
    await line.getByRole("spinbutton").fill(overrides[product] ?? system);
  }
  return view;
}

test("the seed count is listed with its variance (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openCounts(page);
  for (const text of ["Point of Sale", "3 Nov 2026", "Partial", "3 of 3", "−1", "Approved"]) await expect(row(page, "CNT-0001")).toContainText(text);
  await row(page, "CNT-0001").click();
  await expect(drawer(page)).toContainText("Tony Blaise, 3 Nov 2026, 16:40");
  await expect(drawer(page).getByRole("spinbutton")).toHaveCount(0);
  await expect(drawer(page).getByRole("button", { name: "Approve" })).toHaveCount(0);
});

test("count a store, submit, and approve: stock changes by the variance (US1–US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const view = await countMainStore(page, { "Bike Pump": "33", "Racing Wheelset": "14" });
  await expect(view.getByRole("row").filter({ hasText: "Bike Pump" })).toContainText("+3");
  await expect(view.getByRole("row").filter({ hasText: "Racing Wheelset" })).toContainText("−2");
  await view.getByRole("button", { name: "Submit for approval" }).click();
  await expect(toast(page)).toHaveText("CNT-0002 sent for approval.");
  await expect(view).toContainText("Waiting approval");
  await expect(view).toContainText("3 units");
  await expect(view).toContainText("2 units");
  await expect(view.getByRole("spinbutton")).toHaveCount(0);

  await view.getByRole("button", { name: "Send back" }).click();
  await expect(toast(page)).toHaveText("CNT-0002 sent back for a recount.");
  await expect(view.getByLabel("Counted: Bike Pump")).toHaveValue("33");
  await view.getByRole("button", { name: "Submit for approval" }).click();
  await view.getByRole("button", { name: "Approve" }).click();
  await expect(toast(page)).toHaveText("CNT-0002 approved. Stock updated.");
  await expect(view).toContainText("Approved by");
  await view.getByRole("button", { name: "Close" }).click();
  for (const text of ["Main Store", "Full", "+1", "Approved"]) await expect(row(page, "CNT-0002")).toContainText(text);

  // Stock followed the count: the reorder line shows Bike Pump at 33 (was 30).
  await tab(page, "Reorder");
  await expect(row(page, "Bike Pump")).toContainText("33");
  await expect(row(page, "Racing Wheelset")).toContainText("14");
});

test("a count cannot be submitted until every line is counted, and a store has one open count (US1, US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openCounts(page);
  await page.getByRole("button", { name: "New count" }).click();
  await drawer(page).getByRole("button", { name: "Store", exact: true }).click();
  await page.getByRole("option", { name: "Main Store", exact: true }).click();
  await drawer(page).getByRole("button", { name: "Untick all" }).click();
  await expect(drawer(page).getByRole("button", { name: "Start count" })).toBeDisabled();
  // The real checkbox is visually hidden; its label is what a person clicks.
  await drawer(page).getByText("Bike Pump", { exact: true }).click();
  await drawer(page).getByText("Racing Wheelset", { exact: true }).click();
  await expect(drawer(page)).toContainText("Partial count: 2 of");
  await drawer(page).getByRole("button", { name: "Start count" }).click();
  const view = page.getByRole("dialog", { name: "CNT-0002" });
  await view.getByLabel("Counted: Bike Pump").fill("29");
  await view.getByRole("button", { name: "Submit for approval" }).click();
  await expect(toast(page)).toHaveText("Count every line first. 1 left.");
  await view.getByLabel("Counted: Racing Wheelset").fill("1.5");
  await view.getByRole("button", { name: "Save" }).click();
  await expect(view.getByRole("alert")).toHaveText("Enter whole numbers of 0 or more");
  await view.getByRole("button", { name: "Close" }).click();
  await expect(row(page, "CNT-0002")).toContainText("In progress");
  await expect(row(page, "CNT-0002")).toContainText("1 of 2");

  await page.getByRole("button", { name: "New count" }).click();
  await drawer(page).getByRole("button", { name: "Store", exact: true }).click();
  await page.getByRole("option", { name: "Main Store", exact: true }).click();
  await drawer(page).getByRole("button", { name: "Start count" }).click();
  await expect(drawer(page).getByRole("alert")).toHaveText("Main Store already has a count open: CNT-0002.");
});

test("a store keeper can count and submit but not approve (SC-003)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const view = await countMainStore(page, {});
  await view.getByRole("button", { name: "Submit for approval" }).click();
  await expect(view.getByRole("button", { name: "Approve" })).toBeVisible();
  await view.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption("store");
  await page.waitForURL("**/dashboard");
  await openCounts(page);
  await row(page, "CNT-0002").click();
  await expect(drawer(page)).toContainText("Waiting approval");
  for (const name of ["Approve", "Send back", "Cancel count"]) await expect(drawer(page).getByRole("button", { name })).toHaveCount(0);
  await drawer(page).getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: "New count" })).toBeVisible();
});
