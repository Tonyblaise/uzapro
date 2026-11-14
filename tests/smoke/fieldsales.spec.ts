import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/** Feature 021 · van sales, at phone width (quickstart 1–4). Data resets on a full page load. */

test.use({ viewport: { width: 390, height: 844 } });

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const summary = (page: Page) => page.getByRole("group", { name: "Today's summary" });
const visits = (page: Page) => page.getByRole("region", { name: "Today's visits" });
const onVan = (page: Page) => page.getByRole("region", { name: "On the van" });

async function pick(page: Page, label: string, option: string) {
  await drawer(page).getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("the route, the van's stock and an empty summary show (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/field-sales");
  await expect(page.getByText("Van KDG 412X")).toBeVisible();
  await expect(summary(page)).toContainText("0 of 2");
  await expect(visits(page).getByRole("listitem")).toHaveCount(2);
  await expect(visits(page)).toContainText("Mountain Goats");
  await expect(visits(page)).toContainText("+254 733 208 561");
  await expect(onVan(page).getByRole("listitem").filter({ hasText: "Aluminium Frame" })).toContainText("20");
  await expect(onVan(page).getByRole("listitem").filter({ hasText: "Carbon Road Frame" })).toContainText("10");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("sell from the van on a visit, record a no sale, and read the summary (US2, US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/field-sales");
  await page.getByRole("button", { name: "Start visit: Mountain Goats" }).click();
  await expect(drawer(page)).toContainText("Available credit: KES 19,600.00");
  // Only what is on the van is offered.
  await drawer(page).getByRole("button", { name: "Add item", exact: true }).click();
  await expect(page.getByRole("option", { name: "Aluminium Frame · 54cm", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "Bike Pump · Standard", exact: true })).toHaveCount(0);
  await page.getByRole("option", { name: "Aluminium Frame · 54cm", exact: true }).click();
  await drawer(page).getByLabel("Quantity: Aluminium Frame · 54cm").fill("21");
  await drawer(page).getByRole("button", { name: "Complete sale" }).click();
  await expect(toast(page)).toHaveText("Only 20 Aluminium Frame left at Van KDG 412X.");
  await drawer(page).getByLabel("Quantity: Aluminium Frame · 54cm").fill("2");
  await expect(drawer(page)).toContainText("KES 72,036.00");

  // Pay later is over the limit: the credit stop appears. Cash goes through.
  await pick(page, "Paid by", "Pay later (credit)");
  await drawer(page).getByRole("button", { name: "Complete sale" }).click();
  await page.getByRole("dialog", { name: "Over the credit limit" }).getByRole("button", { name: "Cancel" }).click();
  await pick(page, "Paid by", "Cash");
  await drawer(page).getByRole("button", { name: "Complete sale" }).click();
  await expect(toast(page)).toHaveText("Sale recorded. KES 72,036.00 paid by Cash.");
  const sold = visits(page).getByRole("listitem").filter({ hasText: "Mountain Goats" });
  await expect(sold).toContainText("Sold");
  await expect(sold).toContainText("SAL-001185");
  await expect(sold.getByRole("button")).toHaveCount(0);
  await expect(onVan(page).getByRole("listitem").filter({ hasText: "Aluminium Frame" })).toContainText("18");

  await page.getByRole("button", { name: "Start visit: Morningview Bicycles" }).click();
  await expect(drawer(page)).toContainText("Overdue: KES 45,600.00");
  await drawer(page).getByRole("button", { name: "No sale" }).click();
  await drawer(page).getByRole("button", { name: "Record no sale" }).click();
  await expect(drawer(page).getByRole("alert")).toHaveText("Pick a reason");
  await pick(page, "Why was there no sale?", "Shop closed");
  await drawer(page).getByRole("button", { name: "Record no sale" }).click();
  await expect(toast(page)).toHaveText("No sale recorded for Morningview Bicycles.");
  await expect(visits(page).getByRole("listitem").filter({ hasText: "Morningview Bicycles" })).toContainText("Shop closed");

  await expect(summary(page)).toContainText("2 of 2");
  const stats = await summary(page).innerText();
  expect(stats.match(/KES 72,036\.00/g)).toHaveLength(2); // Sales and Cash to hand in
  expect(stats.match(/KES 0\.00/g)).toHaveLength(2); // M-Pesa and On credit
});

test("add a visit; a customer already on the route is refused (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/customers/customers?action=new");
  const form = page.getByRole("dialog", { name: "New customer" });
  await form.getByLabel("Name").fill("Kilele Riders");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Kilele Riders added.")).toBeVisible();
  // On a phone the sidebar is behind the menu button.
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("complementary", { name: "Main" }).getByRole("link", { name: "Sales", exact: true }).click();
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Field sales", exact: true }).click();
  await page.getByRole("button", { name: "Add visit" }).click();
  await pick(page, "Customer", "Mountain Goats");
  await drawer(page).getByRole("button", { name: "Add to route" }).click();
  await expect(drawer(page).getByRole("alert")).toHaveText("Mountain Goats is already on today's route.");
  await pick(page, "Customer", "Kilele Riders");
  await drawer(page).getByRole("button", { name: "Add to route" }).click();
  await expect(toast(page)).toHaveText("Kilele Riders added to the route.");
  await expect(visits(page).getByRole("listitem")).toHaveCount(3);
  await expect(summary(page)).toContainText("0 of 3");
});
