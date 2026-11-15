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
  // 44 pieces less 2 cartons of 10 leaves 24: a third sale of 3 cartons is short, counted in pieces.
  await sellHelmetCartons(page, "3");
  await expect(toast(page)).toHaveText("Only 24 Helmet left at Point of Sale.");
  await drawer(page).getByRole("button", { name: "Cancel" }).click();
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

test("set a reorder point on a product (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/products/all-products?edit=Carbon%20Sole%20Shoes");
  const form = page.getByRole("dialog", { name: "Edit product" });
  // One reorder point for the whole product; purchase orders order its first variant (Size 42).
  await form.getByLabel("Reorder at").fill("50");
  await form.getByLabel("Order up to").fill("40");
  await expect(form.getByRole("alert")).toHaveText("Order up to must be above the reorder point");
  await expect(form.getByRole("button", { name: "Save" })).toBeDisabled();
  await form.getByLabel("Order up to").fill("80");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form).toHaveCount(0);

  // Reopening the product (in-app: a reload resets the demo data) shows the reorder point.
  await row(page, "Carbon Sole Shoes").click();
  await drawer(page).getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("dialog", { name: "Edit product" }).getByLabel("Order up to")).toHaveValue("80");
});
