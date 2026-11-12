import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 010 · Point of Sale (quickstart 1–9). Store data resets on a full page load, so each flow
 * logs in once and moves with in-app links (the till itself is `?till=1` on the Terminals tab).
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const rail = (page: Page) => page.getByRole("navigation", { name: "Point of sale" });
const cart = (page: Page) => page.getByRole("complementary", { name: "Cart" });
const dialog = (page: Page, name: string | RegExp) => page.getByRole("dialog", { name });
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const card = (page: Page) => page.getByRole("list", { name: "Terminals" }).getByRole("listitem").first();

async function openTill(page: Page) {
  await nav(page).getByRole("link", { name: "Point of sale" }).click();
  await page.waitForURL("**/point-of-sale/terminals");
  await card(page).getByRole("button", { name: "Continue selling" }).click();
  await expect(page.getByRole("group", { name: "Enter your PIN" })).toBeFocused();
  for (const k of "1234") await page.keyboard.press(k);
  await expect(rail(page)).toBeVisible();
}

async function addPumpAndHelmet(page: Page) {
  await page.getByRole("button", { name: "Add Bike Pump" }).click();
  await page.getByRole("button", { name: "Add Helmet" }).click();
  const v = dialog(page, "Helmet");
  await v.getByRole("button", { name: /^Medium/ }).click();
  await v.getByRole("button", { name: "Add 1 · KES 1,639.00" }).click();
}

test("terminal card, PIN, and a cash sale with change and receipt (quickstart 1–3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Point of sale" }).click();
  await expect(card(page)).toContainText("Shift open");
  await expect(card(page)).toContainText("Tony Blaise, 09:05");
  await expect(card(page)).toContainText("6 · KES 17,918");
  await expect(page.getByRole("button", { name: "Open Uza AI" })).toBeVisible();

  await card(page).getByRole("button", { name: "Continue selling" }).click();
  await expect(page).toHaveURL(/till=1/);
  await expect(page.getByRole("button", { name: "Open Uza AI" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Tony Blaise.*opened this shift/ })).toHaveAttribute("aria-pressed", "true");
  for (const k of "1111") await page.getByRole("button", { name: k, exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Terminal 1 till" }).getByRole("alert")).toHaveText("That PIN is wrong. Try again.");
  await page.getByRole("group", { name: "Enter your PIN" }).focus();
  for (const k of "1234") await page.keyboard.press(k);
  await expect(rail(page).getByRole("button", { name: "Sell" })).toHaveAttribute("aria-current", "page");

  await addPumpAndHelmet(page);
  await expect(cart(page)).toContainText("2 items");
  await expect(cart(page)).toContainText("KES 1,984.00");
  await page.getByRole("button", { name: /^Charge/ }).click();
  const co = dialog(page, "Checkout");
  await co.getByLabel("Amount").fill("3000");
  await expect(co.getByText("Give change")).toBeVisible();
  await expect(co.getByText("KES 1,016.00")).toBeVisible();
  await co.getByRole("button", { name: /^Complete sale/ }).click();
  const r = dialog(page, "Sale complete");
  await expect(r).toContainText("SAL-001185");
  await expect(r).toContainText("1 × Helmet Medium");
  await expect(r).toContainText("Thank you for shopping with us.");
  await expect(toast(page)).toHaveText("Receipt printing…");
  await r.getByRole("button", { name: "New sale" }).click();
  await expect(cart(page)).toContainText("The cart is empty");
});

test("a till sale reaches Sales, stock and accounts; split and pay later (quickstart 4–5)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openTill(page);
  await addPumpAndHelmet(page);
  await page.getByRole("button", { name: /^Charge/ }).click();
  await dialog(page, "Checkout").getByRole("button", { name: /^Complete sale/ }).click();
  await dialog(page, "Sale complete").getByRole("button", { name: "New sale" }).click();

  // Split: 5,000 by M-Pesa, the rest in cash.
  await page.getByRole("button", { name: "Add Groupset" }).click();
  await page.getByRole("button", { name: /^Charge/ }).click();
  const co = dialog(page, "Checkout");
  await co.getByRole("button", { name: "M-Pesa" }).click();
  await co.getByLabel("Amount").fill("5000");
  await co.getByLabel("M-Pesa code").fill("SKTEST1234");
  await co.getByRole("button", { name: "Add as part payment and split the rest" }).click();
  await expect(co.getByRole("button", { name: "Cash" })).toHaveAttribute("aria-pressed", "true");
  await co.getByRole("button", { name: "Card" }).click();
  await co.getByLabel("Amount").fill("99999");
  await co.getByRole("button", { name: /^Complete sale/ }).click();
  await expect(co.getByRole("alert")).toHaveText("Card payment can't be more than what is due.");
  await co.getByRole("button", { name: "Cash" }).click();
  await co.getByRole("button", { name: /^Complete sale/ }).click();
  await expect(dialog(page, "Sale complete")).toContainText("M-Pesa SKTEST1234");
  await dialog(page, "Sale complete").getByRole("button", { name: "New sale" }).click();

  // Pay later: refused for a walk-in, accepted for a named customer.
  await page.getByRole("button", { name: "Add Bike Pump" }).click();
  await page.getByRole("button", { name: /^Charge/ }).click();
  await co.getByRole("button", { name: "Pay later" }).click();
  await expect(co).toContainText("Pick a named customer first. Walk-in customers can't buy on credit.");
  await co.getByRole("button", { name: "Complete on credit" }).click();
  await expect(co.getByRole("alert")).toHaveText("Pick a named customer to sell on credit.");
  await co.getByRole("button", { name: "Close" }).click();
  await cart(page).getByRole("button", { name: /Walk-in Customer/ }).click();
  await dialog(page, "Who is this sale for?").getByRole("button", { name: /Morningview Bicycles/ }).click();
  await page.getByRole("button", { name: /^Charge/ }).click();
  await co.getByRole("button", { name: "Pay later" }).click();
  await expect(co).toContainText("will be added to Morningview Bicycles's balance in Receivables, due in 30 days.");
  await co.getByRole("button", { name: "Complete on credit" }).click();
  await dialog(page, "Sale complete").getByRole("button", { name: "New sale" }).click();

  await rail(page).getByRole("button", { name: "Exit" }).click();
  await expect(page).toHaveURL(/\/point-of-sale\/terminals$/);
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "All sales", exact: true }).click();
  await expect(page.getByRole("row").nth(1)).toContainText("Morningview Bicycles");
  await expect(page.getByRole("row").nth(3)).toContainText("1,984");
  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Receivables", exact: true }).click();
  await expect(page.getByRole("row").filter({ hasText: "SAL-001187" })).toContainText("Sale on credit");
  await nav(page).getByRole("link", { name: "Accounts" }).click();
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Transactions", exact: true }).click();
  await expect(page.getByRole("row").filter({ hasText: "SAL-001185" }).first()).toContainText("POS sale, Terminal 1");
});

test("open and close a shift (quickstart 8)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openTill(page);
  await rail(page).getByRole("button", { name: "Shift" }).click();
  await expect(page.getByText("Expected cash in drawer")).toBeVisible();
  await expect(page.getByText("KES 8,968.00")).toBeVisible();
  await page.getByRole("button", { name: "Close shift" }).click();
  const cl = dialog(page, "Close shift");
  await cl.getByRole("button", { name: "Close shift" }).click();
  await expect(cl.getByRole("alert")).toHaveText("Enter the cash you counted.");
  await cl.getByLabel("Cash you counted (KES)").fill("8900");
  await expect(cl).toContainText("Short by");
  await cl.getByRole("button", { name: "Close shift" }).click();
  await expect(toast(page)).toHaveText("Terminal 1 shift closed. Short by KES 68.00.");
  await expect(page).toHaveURL(/\/point-of-sale\/terminals$/);
  await expect(card(page)).toContainText("Closed");

  await card(page).getByRole("button", { name: "Open shift" }).click();
  await expect(page.getByRole("heading", { name: "Open a new shift" })).toBeVisible();
  const till = page.getByRole("dialog", { name: "Terminal 1 till" });
  await till.getByRole("button", { name: "Open shift" }).click();
  await expect(toast(page)).toHaveText("Enter the opening cash. Use 0 if the drawer is empty.");
  await till.getByRole("button", { name: "KES 2,000" }).click();
  await till.getByRole("button", { name: "Open shift" }).click();
  await expect(toast(page)).toHaveText("Shift opened on Terminal 1.");
  await expect(page.getByRole("group", { name: "Enter your PIN" })).toBeVisible();
});

test("customers, hold and resume, and an earlier receipt (quickstart 6)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openTill(page);
  await cart(page).getByRole("button", { name: /Walk-in Customer/ }).click();
  const pick = dialog(page, "Who is this sale for?");
  await pick.getByLabel("Search customers").fill("zzz");
  await expect(pick).toContainText("No one matches. Add them as a new customer.");
  await pick.getByRole("button", { name: "New customer" }).click();
  const nc = dialog(page, "New customer");
  await nc.getByRole("button", { name: "Save and select" }).click();
  await expect(nc.getByRole("alert")).toHaveText("Enter the customer's name.");
  await nc.getByLabel("Name").fill("Morningview Bicycles");
  await nc.getByRole("button", { name: "Save and select" }).click();
  await expect(nc.getByRole("alert")).toHaveText("A customer with this name already exists.");
  await nc.getByLabel("Name").fill("Grace Wanjiru");
  await nc.getByLabel("Phone number").fill("0711 222 333");
  await nc.getByRole("button", { name: "Save and select" }).click();
  await expect(toast(page)).toHaveText("Grace Wanjiru added to customers.");
  await expect(cart(page)).toContainText("Grace Wanjiru");

  await page.getByRole("button", { name: "Add Bike Pump" }).click();
  await cart(page).getByRole("button", { name: "Hold" }).click();
  await expect(toast(page)).toHaveText("Sale put on hold. Find it under Orders.");
  await expect(rail(page).getByLabel("1 on hold")).toBeVisible();
  await rail(page).getByRole("button", { name: "Orders" }).click();
  await expect(page.getByText("On hold · Grace Wanjiru")).toBeVisible();
  await page.getByRole("button", { name: "Resume" }).click();
  await expect(toast(page)).toHaveText("Sale resumed.");
  await expect(cart(page)).toContainText("Bike Pump");

  await rail(page).getByRole("button", { name: "Orders" }).click();
  await page.getByRole("button", { name: /SAL-POS-0005/ }).click();
  await expect(dialog(page, "Receipt SAL-POS-0005")).toContainText("M-Pesa SKB7Q2LM0P");
  await dialog(page, "Receipt SAL-POS-0005").getByRole("button", { name: "Done" }).click();

  await rail(page).getByRole("button", { name: "Exit" }).click();
  await nav(page).getByRole("link", { name: "Customers" }).click();
  await expect(page.getByRole("row").filter({ hasText: "Grace Wanjiru" })).toBeVisible();
});

test("Today, settings, quick notes and Lock (quickstart 7)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openTill(page);
  await rail(page).getByRole("button", { name: "Today" }).click();
  for (const l of ["Sales this shift", "Paid orders", "Average sale", "Items sold"]) await expect(page.getByRole("list", { name: "Shift figures" }).getByText(l, { exact: true })).toBeVisible();
  await expect(page.getByText("Busiest: 10:00 – 11:00")).toBeVisible();

  await rail(page).getByRole("button", { name: "Sell" }).click();
  await expect(page.getByRole("button", { name: "Add Groupset" })).toContainText("3 left");
  await rail(page).getByRole("button", { name: "Settings" }).click();
  const st = dialog(page, "Terminal settings");
  await expect(st).toContainText("Saved for Terminal 1 in this session");
  await st.getByRole("switch", { name: "Show stock on products" }).click();
  await st.getByLabel("New quick note").fill("No box");
  await st.getByLabel("New quick note").press("Enter");
  await st.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: "Add Groupset" })).not.toContainText("3 left");

  await page.getByRole("button", { name: "Add Bike Pump" }).click();
  await cart(page).getByRole("button", { name: "Note" }).click();
  await cart(page).getByRole("button", { name: "No box" }).click();
  await cart(page).getByRole("button", { name: "Done" }).click();
  await expect(cart(page)).toContainText("Note: No box");

  await rail(page).getByRole("button", { name: "Lock" }).click();
  await expect(page.getByRole("group", { name: "Enter your PIN" })).toBeVisible();
  for (const k of "1234") await page.keyboard.press(k);
  await expect(cart(page)).toContainText("Bike Pump");
});

test("inactive and unknown terminals; Cashier access (analysis G1, quickstart 9)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Settings" }).click();
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Terminals", exact: true }).click();
  await page.getByRole("button", { name: "Deactivate" }).first().click();
  await nav(page).getByRole("link", { name: "Point of sale" }).click();
  await expect(card(page)).toContainText("Inactive");
  await expect(card(page).getByRole("button", { name: "Terminal is off" })).toBeDisabled();

  await page.goto("/point-of-sale/terminals?till=99");
  await expect(card(page)).toBeVisible();
  await expect(rail(page)).toHaveCount(0);
});

test("the Cashier can open Point of sale (quickstart 9)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  await nav(page).getByRole("link", { name: "Point of sale" }).click();
  await expect(card(page).getByRole("button", { name: "Continue selling" })).toBeEnabled();
});
