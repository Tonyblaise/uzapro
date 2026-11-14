import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 012 · wholesale pricing and customer credit (quickstart 1–12). Store data resets on a
 * full page load, so each flow logs in once and then moves with in-app links.
 */

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const amount = (page: Page) => drawer(page).getByLabel("Amount each (KES)");

async function pick(page: Page, label: string, option: string) {
  await drawer(page).getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

/** New sale for a customer with Helmet (Medium) in cartons chosen, not yet added. */
async function helmetCartons(page: Page, customer: string) {
  await page.goto("/sales/all-sales?action=new");
  await pick(page, "Customer", customer);
  await pick(page, "Product", "Helmet");
  await pick(page, "Product variant", "Medium");
  await pick(page, "Unit of measure", "Carton");
}

/** A credit sale of 2 cartons of Helmet (Medium) to Mountain Goats: KES 34,568, over the KES 19,600 available. */
async function overLimitSale(page: Page) {
  await helmetCartons(page, "Mountain Goats");
  await drawer(page).getByLabel("Number of units").fill("2");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await pick(page, "Paid by", "Pay later (credit)");
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
}

test("the group price fills in, changes at a break and falls back for a walk-in (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await helmetCartons(page, "Mountain Goats");
  await expect(amount(page)).toHaveValue("14900");
  await expect(drawer(page)).toContainText("Distributor price");
  await drawer(page).getByLabel("Number of units").fill("5");
  await expect(amount(page)).toHaveValue("14400");

  // A typed price is kept when the quantity changes, and can be put back.
  await amount(page).fill("15000");
  await drawer(page).getByLabel("Number of units").fill("3");
  await expect(amount(page)).toHaveValue("15000");
  await drawer(page).getByRole("button", { name: "Use Distributor price" }).click();
  await expect(amount(page)).toHaveValue("14900");

  // An added line follows the customer.
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await expect(drawer(page)).toContainText("Helmet · Medium × 3 Carton");
  await expect(drawer(page)).toContainText("44,700");
  await pick(page, "Customer", "Walk-in Customer");
  await expect(drawer(page)).toContainText("49,170");
  await expect(drawer(page)).not.toContainText("Distributor price");
  await pick(page, "Customer", "Morningview Bicycles");
  await expect(drawer(page)).toContainText("46,500");
  await expect(drawer(page)).toContainText("Wholesale price");
});

test("below the first break the standard price shows with a hint (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/all-sales?action=new");
  await pick(page, "Customer", "Morningview Bicycles");
  await pick(page, "Product", "Muthokinju Paint");
  await pick(page, "Product variant", "White");
  await pick(page, "Unit of measure", "Tray");
  await expect(amount(page)).toHaveValue("2802");
  await expect(drawer(page)).toContainText("Wholesale price from 2 Tray");
  await drawer(page).getByLabel("Number of units").fill("2");
  await expect(amount(page)).toHaveValue("2700");
});

test("an invoice line takes the group price when the unit has one (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/invoices?action=invoice");
  await pick(page, "Invoice to", "Mountain Goats");
  await pick(page, "Add item", "Helmet · Medium");
  const row = drawer(page).getByRole("row").filter({ hasText: "Helmet · Medium" });
  await expect(row.getByLabel("Rate")).toHaveValue("1639");
  await row.getByRole("button", { name: "unit", exact: true }).click();
  await page.getByRole("option", { name: "Carton", exact: true }).click();
  await expect(row.getByLabel("Rate")).toHaveValue("14900");
  await expect(row).toContainText("Distributor price");
  await row.getByLabel("Rate").fill("15500");
  await row.getByLabel("Quantity").fill("5");
  await expect(row.getByLabel("Rate")).toHaveValue("15500");
  await row.getByRole("button", { name: "Use Distributor price" }).click();
  await expect(row.getByLabel("Rate")).toHaveValue("14400");
});

test("a sale over the credit limit is stopped; the owner approves it with a reason (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await overLimitSale(page);
  const stop = page.getByRole("dialog", { name: "Over the credit limit" });
  await expect(stop).toContainText("This sale is KES 14,968.00 over what Mountain Goats can still take on credit.");
  for (const figure of ["KES 100,000.00", "KES 80,400.00", "KES 19,600.00", "KES 34,568.00"]) await expect(stop).toContainText(figure);
  await stop.getByRole("button", { name: "Approve anyway" }).click();
  await expect(stop).toContainText("Give a reason of at least 5 characters");
  await stop.getByLabel("Reason for approving").fill("Paying on Friday");
  await stop.getByRole("button", { name: "Approve anyway" }).click();
  await expect(toast(page)).toHaveText("Credit sale recorded. KES 34,568.00 added to Receivables as RCV-0013, due in 30 days.");

  await page.getByRole("row").nth(1).click();
  await expect(drawer(page)).toContainText("Credit approved by");
  await expect(drawer(page)).toContainText("Tony Blaise: Paying on Friday");
});

test("a cashier sees the stop but cannot approve it, and the sale stays open (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  await overLimitSale(page);
  const stop = page.getByRole("dialog", { name: "Over the credit limit" });
  await expect(stop).toContainText("Ask a manager to approve this, or take another payment method.");
  await expect(stop.getByRole("button", { name: "Approve anyway" })).toHaveCount(0);
  await expect(stop.getByLabel("Reason for approving")).toHaveCount(0);
  await stop.getByRole("button", { name: "Close" }).last().click();
  await expect(page.getByRole("dialog", { name: "New sale" })).toContainText("Helmet · Medium × 2 Carton");
  // Paying another way goes through.
  await pick(page, "Paid by", "Cash");
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
  await expect(toast(page)).toHaveText("Sale recorded. KES 34,568.00 paid by Cash.");
});

test("an overdue customer is stopped on a credit sale and on an invoice (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/all-sales?action=new");
  await pick(page, "Customer", "Morningview Bicycles");
  await pick(page, "Product", "Bike Pump");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await pick(page, "Paid by", "Pay later (credit)");
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
  const stop = page.getByRole("dialog", { name: "Morningview Bicycles has KES 45,600.00 overdue" });
  await expect(stop).toContainText("Oldest: INV-0351, due 27 Feb 2026.");
  await stop.getByRole("button", { name: "Cancel" }).click();
  await drawer(page).getByRole("button", { name: "Cancel" }).click();

  await tab(page, "Invoices");
  await page.getByRole("button", { name: "New invoice" }).click();
  await pick(page, "Invoice to", "Morningview Bicycles");
  await pick(page, "Add item", "Bike Pump · Standard");
  await drawer(page).getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Morningview Bicycles has KES 45,600.00 overdue" })).toBeVisible();
});

test("the customer list and form show and change group, limit and terms (US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Customers" }).click();
  const goats = page.getByRole("row", { name: /Mountain Goats/ });
  for (const text of ["Distributor", "100,000.00", "80,400.00"]) await expect(goats).toContainText(text);
  const morning = page.getByRole("row", { name: /Morningview Bicycles/ });
  for (const text of ["Wholesale", "50,000.00", "45,600.00", "Overdue"]) await expect(morning).toContainText(text);
  await expect(page.getByRole("row", { name: /Walk-in Customer/ })).toContainText("Retail");

  await goats.click();
  const form = page.getByRole("dialog", { name: "Edit customer" });
  const credit = form.getByRole("region", { name: "Credit" });
  await expect(credit).toContainText("KES 19,600.00");
  await form.getByLabel("Credit limit (KES) (optional)").fill("-5");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form).toContainText("Enter an amount of 0 or more");
  await form.getByLabel("Credit limit (KES) (optional)").fill("150000");
  await form.getByRole("button", { name: "Payment terms", exact: true }).click();
  await page.getByRole("option", { name: "14 days", exact: true }).click();
  await form.getByRole("button", { name: "Save" }).click();
  await expect(toast(page)).toHaveText("Mountain Goats saved.");
  await expect(goats).toContainText("150,000.00");

  // The raised limit lets the same sale through, due after the new terms.
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
  await expect(toast(page)).toHaveText("Credit sale recorded. KES 34,568.00 added to Receivables as RCV-0013, due in 14 days.");
});

test("add a price to the Wholesale list and see it on a sale; a duplicate is refused (US4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Products" }).click();
  await tab(page, "Price lists");
  await expect(page.getByRole("button", { name: /^Wholesale/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /^Wholesale/ })).toContainText("6 prices · 1 customer");
  const addBox = async (first: string, second?: string) => {
    await page.getByRole("button", { name: "Add price" }).click();
    const form = page.getByRole("dialog", { name: "Add price" });
    await pick(page, "Product", "Bike Pump");
    await pick(page, "Unit of measure", "Box");
    await expect(form).toContainText("Standard price: KES 4,140.00");
    await form.getByLabel("Price (KES)").first().fill(first);
    if (second) {
      await form.getByRole("button", { name: "Add a quantity break" }).click();
      await form.getByLabel("From quantity").nth(1).fill("10");
      await form.getByLabel("Price (KES)").nth(1).fill(second);
    }
    await form.getByRole("button", { name: "Save" }).click();
    return form;
  };
  await addBox("3600", "3400");
  await expect(toast(page)).toHaveText("Price saved.");
  const row = page.getByRole("row").filter({ hasText: "Bike Pump" }).filter({ hasText: "Box" });
  for (const text of ["4,140.00", "3,600.00", "10+ 3,400.00"]) await expect(row).toContainText(text);

  const again = await addBox("3500");
  await expect(again.getByRole("alert")).toHaveText("This list already has a price for Bike Pump (Standard, Box). Edit that one.");
  await again.getByRole("button", { name: "Cancel" }).click();

  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "All sales");
  await page.getByRole("button", { name: "New sale" }).click();
  await pick(page, "Customer", "Morningview Bicycles");
  await pick(page, "Product", "Bike Pump");
  await pick(page, "Unit of measure", "Box");
  await expect(amount(page)).toHaveValue("3600");
  await drawer(page).getByLabel("Number of units").fill("10");
  await expect(amount(page)).toHaveValue("3400");
});

test("customer groups: add one; a group with customers cannot be deleted (US4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Customers" }).click();
  await tab(page, "Customer groups");
  await expect(page.getByRole("row", { name: /Retail/ })).toContainText("Standard prices");
  await expect(page.getByRole("row", { name: /Distributor/ })).toContainText("6 prices");
  await page.getByRole("button", { name: "New group" }).click();
  const form = page.getByRole("dialog", { name: "New group" });
  await form.getByLabel("Group name").fill("wholesale");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form).toContainText("Another group is already called wholesale.");
  await form.getByLabel("Group name").fill("Schools");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(toast(page)).toHaveText("Schools added.");
  await expect(page.getByRole("row", { name: /Schools/ })).toContainText("0 prices");

  await page.getByRole("row", { name: /Wholesale/ }).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("dialog", { name: "Delete Wholesale?" }).getByRole("button", { name: "Delete" }).click();
  await expect(toast(page)).toHaveText("Move 1 customer to another group first.");
  await expect(page.getByRole("row", { name: /Wholesale/ })).toBeVisible();
});

test("a role with Read on Products can see price lists but not change them (US4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Permissions" }).click();
  await page.getByRole("button", { name: "Edit role" }).nth(3).click();
  const edit = page.getByRole("dialog", { name: /Edit role/ });
  await edit.getByRole("button", { name: "Products: Write" }).click();
  await edit.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption("store");
  await page.waitForURL("**/dashboard");
  await nav(page).getByRole("link", { name: "Products" }).click();
  await tab(page, "Price lists");
  await expect(page.getByRole("row").filter({ hasText: "Helmet" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Add price" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Actions" })).toHaveCount(0);
});

test("the till prices the cart for the customer and stops Pay later over the limit (US1, US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const main = page;
  await nav(main).getByRole("link", { name: "Point of sale" }).click();
  await main.waitForURL("**/point-of-sale/terminals");
  const card = main.getByRole("list", { name: "Terminals" }).getByRole("listitem").first();
  [page] = await Promise.all([main.waitForEvent("popup"), card.getByRole("button", { name: "Launch" }).click()]);
  await expect(page.getByRole("group", { name: "Enter your PIN" })).toBeFocused();
  for (const k of "1234") await page.keyboard.press(k);
  const cart = page.getByRole("complementary", { name: "Cart" });

  await cart.getByRole("button", { name: /Walk-in Customer/ }).click();
  await page.getByRole("dialog", { name: "Who is this sale for?" }).getByRole("button", { name: /Mountain Goats/ }).click();
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Add Bike Pump" }).click();
  await expect(cart).toContainText("KES 310.00 each");
  await expect(cart).toContainText("Distributor price");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Add Groupset" }).click();

  await page.getByRole("button", { name: /^Charge/ }).click();
  const co = page.getByRole("dialog", { name: "Checkout" });
  await co.getByRole("button", { name: "Pay later" }).click();
  await co.getByRole("button", { name: "Complete on credit" }).click();
  const stop = page.getByRole("dialog", { name: "Over the credit limit" });
  await expect(stop).toContainText("KES 19,600.00");
  await stop.getByLabel("Reason for approving").fill("Agreed by the owner");
  await stop.getByRole("button", { name: "Approve anyway" }).click();
  await expect(page.getByRole("dialog", { name: "Sale complete" })).toBeVisible();
});
