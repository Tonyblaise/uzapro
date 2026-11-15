import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 014 · bulk units and reorder points (quickstart 1–6). Store data resets on a full page
 * load, so each flow logs in once and then moves with in-app links.
 */

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });

async function pick(page: Page, label: string, option: string) {
  await drawer(page).getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function sellHelmetCartons(page: Page, cartons: string) {
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "All sales");
  await page.getByRole("button", { name: "New sale" }).click();
  await pick(page, "Product", "Helmet");
  await pick(page, "Product variant", "Medium");
  await pick(page, "Unit of measure", "Carton");
  await drawer(page).getByLabel("Number of units").fill(cartons);
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await pick(page, "Paid by", "Cash");
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
}

test("a sale in cartons takes its pieces, and a shortage is counted in pieces (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await sellHelmetCartons(page, "2");
  await expect(toast(page)).toContainText("Sale recorded.");
  // 44 pieces less 2 cartons of 10. (Stock management splits a product by variant, so the reorder line is where the product total shows.)
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Reorder");
  await expect(row(page, "Helmet")).toContainText("24");

  await sellHelmetCartons(page, "3");
  await expect(toast(page)).toHaveText("Only 24 Helmet left at Point of Sale.");
  await drawer(page).getByRole("button", { name: "Cancel" }).click();

  // The reorder line follows the stock: 24 is above the reorder point of 20.
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Reorder");
  await expect(row(page, "Helmet")).toContainText("OK");
});

test("the product form and record show what a bulk unit contains (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/products/all-products?view=Helmet");
  await expect(drawer(page).getByRole("region", { name: "Bulk units" })).toContainText("Medium: Carton of 10 Piece");
  await drawer(page).getByRole("button", { name: "Edit" }).click();
  const form = page.getByRole("dialog").last();
  await expect(form.getByLabel("Base units in this unit").first()).toHaveValue("10");
  await expect(form).toContainText("Base unit");
});

test("the reorder list suggests orders and turns them into draft purchase orders (US2, US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Reorder");
  await expect(page.getByText("3 lines to reorder")).toBeVisible();
  for (const text of ["Main Store", "Out of stock", "3 Crate", "72 in base units", "Eastside Bicycle Supplies"]) await expect(row(page, "Muthokinju Paint")).toContainText(text);
  for (const text of ["Reorder now", "24 Piece", "Magaliesburg Wheels"]) await expect(row(page, "Racing Wheelset")).toContainText(text);
  for (const text of ["Reorder now", "7 Piece", "Not set"]) await expect(row(page, "Groupset")).toContainText(text);
  await expect(row(page, "Bike Pump")).toContainText("OK");

  await page.getByRole("button", { name: "Create draft purchase orders" }).click();
  await expect(toast(page)).toHaveText("2 draft purchase orders created. 1 skipped: no supplier set.");
  await expect(row(page, "Muthokinju Paint")).toContainText("On order");
  await expect(row(page, "Racing Wheelset")).toContainText("On order");
  await expect(page.getByText("1 line to reorder")).toBeVisible();

  await nav(page).getByRole("link", { name: "Purchases" }).click();
  await tab(page, "Purchase orders");
  await expect(page.getByRole("row").filter({ hasText: "Draft" })).toHaveCount(2);
});

test("set a reorder point on a product variant, then edit and remove one store's line (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/products/all-products?edit=Carbon%20Sole%20Shoes");
  const form = page.getByRole("dialog", { name: "Edit product" });
  // Size 42 is the first variant row; its Reorder at / Order up to are the first of each.
  await form.getByLabel("Reorder at").first().fill("50");
  await form.getByLabel("Order up to").first().fill("40");
  await expect(form.getByRole("alert")).toHaveText("Order up to must be above the reorder point");
  await expect(form.getByRole("button", { name: "Save" })).toBeDisabled();
  await form.getByLabel("Order up to").first().fill("80");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form).toHaveCount(0);

  // One line per store stock is bought into; there is no separate "Set reorder point".
  await nav(page).getByRole("link", { name: "Stock", exact: true }).click();
  await tab(page, "Reorder");
  await expect(page.getByRole("button", { name: "Set reorder point" })).toHaveCount(0);
  await expect(row(page, "Carbon Sole Shoes")).toHaveCount(4);
  const main = () => row(page, "Carbon Sole Shoes").filter({ hasText: "Main Store" });
  for (const text of ["Size 42", "Reorder now", "40 Piece", "Not set"]) await expect(main()).toContainText(text);

  await main().click();
  const edit = page.getByRole("dialog", { name: "Edit reorder point" });
  await edit.getByLabel("Reorder at").fill("10");
  await edit.getByRole("button", { name: "Save" }).click();
  await expect(main()).toContainText("OK");

  await main().getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Remove" }).click();
  await page.getByRole("dialog", { name: "Remove this reorder point?" }).getByRole("button", { name: "Remove" }).click();
  await expect(toast(page)).toHaveText("Reorder point removed.");
  await expect(main()).toHaveCount(0);
  await expect(row(page, "Carbon Sole Shoes")).toHaveCount(3);
});

test("a role with Read on Stock sees the list but cannot change it (FR-016)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  // The Cashier sees only Stock management in the seed, so Reorder is not offered.
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Reorder", exact: true })).toHaveCount(0);
});
