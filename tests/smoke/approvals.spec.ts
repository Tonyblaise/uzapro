import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/** Feature 018 · approval rights and discount limits (quickstart 1–4). Data resets on a full page load. */

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const right = (page: Page, name: string) => page.getByRole("dialog", { name: /Edit role/ }).getByRole("button", { name: new RegExp(`^${name}:`) });

async function editRole(page: Page, role: string) {
  await nav(page).getByRole("link", { name: "Permissions" }).click();
  await page.getByRole("button", { name: `Edit role: ${role}` }).click();
  return page.getByRole("dialog", { name: /Edit role/ });
}

async function viewAs(page: Page, role: string) {
  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption(role);
  await page.waitForURL("**/dashboard");
}

async function pick(page: Page, label: string, option: string) {
  await drawer(page).getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("Edit role shows each role's approvals and saves a change (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  let edit = await editRole(page, "Accountant");
  await expect(right(page, "Approve credit over the limit")).toHaveAttribute("aria-pressed", "true");
  await expect(right(page, "Approve stock counts")).toHaveAttribute("aria-pressed", "false");
  await expect(right(page, "Dispatch sales orders")).toHaveAttribute("aria-pressed", "true");
  await expect(edit.getByLabel("Discount up to (%)")).toHaveValue("20");
  await expect(edit.getByRole("button", { name: "Save" })).toBeDisabled();

  await right(page, "Approve stock counts").click();
  await edit.getByLabel("Discount up to (%)").fill("150");
  await edit.getByRole("button", { name: "Save" }).click();
  await expect(edit).toContainText("Enter a discount limit from 0 to 100");
  await edit.getByLabel("Discount up to (%)").fill("15");
  await edit.getByRole("button", { name: "Save" }).click();
  await expect(toast(page)).toHaveText("Accountant access saved.");

  edit = await editRole(page, "Accountant");
  await expect(right(page, "Approve stock counts")).toHaveAttribute("aria-pressed", "true");
  await expect(edit.getByLabel("Discount up to (%)")).toHaveValue("15");
  await right(page, "Dispatch sales orders").click();
  await edit.getByRole("button", { name: "Cancel" }).click();

  edit = await editRole(page, "Accountant");
  await expect(right(page, "Dispatch sales orders")).toHaveAttribute("aria-pressed", "true");
  await edit.getByRole("button", { name: "Cancel" }).click();

  edit = await editRole(page, "Owner / Admin");
  await expect(right(page, "Approve credit over the limit")).toBeDisabled();
  await expect(edit.getByLabel("Discount up to (%)")).toHaveValue("100");
  await expect(edit.getByLabel("Discount up to (%)")).toBeDisabled();
});

test("a store keeper given the dispatch right can dispatch but not edit or invoice (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const edit = await editRole(page, "Store keeper");
  await edit.getByRole("button", { name: "Sales: Read", exact: true }).click();
  await right(page, "Dispatch sales orders").click();
  await edit.getByRole("button", { name: "Save" }).click();
  await viewAs(page, "store");
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "Sales orders");
  await expect(page.getByRole("button", { name: "New order" })).toHaveCount(0);
  await page.getByRole("row").filter({ hasText: "SO-0001" }).click();
  for (const name of ["Create invoice", "Edit", "Cancel order"]) await expect(drawer(page).getByRole("button", { name })).toHaveCount(0);
  await drawer(page).getByRole("button", { name: "Dispatch" }).click();
  const form = page.getByRole("dialog", { name: "Dispatch SO-0001" });
  await form.getByLabel("Driver").fill("Peter Kamau");
  await form.getByLabel("Vehicle registration").fill("KDG 412X");
  await form.getByRole("button", { name: "Confirm dispatch" }).click();
  await expect(toast(page)).toHaveText("DN-0002 created. 2 items left Main Store.");
  await drawer(page).getByRole("link", { name: "DN-0002" }).click();
  await drawer(page).getByRole("button", { name: "Mark delivered" }).click();
  await drawer(page).getByLabel("Received by").fill("Amina Yusuf");
  await drawer(page).getByRole("button", { name: "Confirm delivery" }).click();
  await expect(toast(page)).toHaveText("DN-0002 marked delivered.");
});

test("an accountant without the credit right cannot approve a credit stop (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const edit = await editRole(page, "Accountant");
  await right(page, "Approve credit over the limit").click();
  await edit.getByRole("button", { name: "Save" }).click();
  await viewAs(page, "accountant");
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "All sales");
  await page.getByRole("button", { name: "New sale" }).click();
  await pick(page, "Customer", "Mountain Goats");
  await pick(page, "Product", "Helmet");
  await pick(page, "Product variant", "Medium");
  await pick(page, "Unit of measure", "Carton");
  await drawer(page).getByLabel("Number of units").fill("2");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await pick(page, "Paid by", "Pay later (credit)");
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
  const stop = page.getByRole("dialog", { name: "Over the credit limit" });
  await expect(stop).toContainText("Ask a manager to approve this, or take another payment method.");
  await expect(stop.getByRole("button", { name: "Approve anyway" })).toHaveCount(0);
});

test("a cashier's till discount above 5% is refused (US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  const main = page;
  await nav(main).getByRole("link", { name: "Point of sale" }).click();
  await main.waitForURL("**/point-of-sale/terminals");
  const card = main.getByRole("list", { name: "Terminals" }).getByRole("listitem").first();
  [page] = await Promise.all([main.waitForEvent("popup"), card.getByRole("button", { name: "Launch" }).click()]);
  await expect(page.getByRole("group", { name: "Enter your PIN" })).toBeFocused();
  for (const k of "1234") await page.keyboard.press(k);
  const cart = page.getByRole("complementary", { name: "Cart" });
  await page.getByRole("button", { name: "Add Bike Pump" }).click();
  await cart.getByRole("button", { name: "+ Add" }).click();
  await cart.getByLabel("Discount", { exact: true }).fill("34.5"); // KES 34.50 off KES 345 = 10%
  await page.getByRole("button", { name: /^Charge/ }).click();
  const co = page.getByRole("dialog", { name: "Checkout" });
  await co.getByRole("button", { name: /^Complete sale/ }).click();
  await expect(co.getByRole("alert")).toHaveText("Your role can give discounts up to 5%. This one is 10%.");
  await co.getByRole("button", { name: "Close" }).click();
  await cart.getByLabel("Discount", { exact: true }).fill("17.25"); // 5%
  await page.getByRole("button", { name: /^Charge/ }).click();
  await co.getByRole("button", { name: /^Complete sale/ }).click();
  await expect(page.getByRole("dialog", { name: "Sale complete" })).toBeVisible();
});
