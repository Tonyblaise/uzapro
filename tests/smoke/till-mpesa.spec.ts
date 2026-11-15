import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 022 · the till uses the M-Pesa set-up saved under Integrations (quickstart 1–3).
 * "Launch" opens the till in a new tab that shares the main tab's data.
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

/** Open Terminal 1, log in with the demo PIN, put a Bike Pump in the cart and choose M-Pesa at checkout. */
async function mpesaCheckout(main: Page) {
  await nav(main).getByRole("link", { name: "Point of sale" }).click();
  await main.waitForURL("**/point-of-sale/terminals");
  const card = main.getByRole("list", { name: "Terminals" }).getByRole("listitem").first();
  const [till] = await Promise.all([main.waitForEvent("popup"), card.getByRole("button", { name: "Launch" }).click()]);
  await expect(till.getByRole("group", { name: "Enter your PIN" })).toBeFocused();
  for (const k of "1234") await till.keyboard.press(k);
  await till.getByRole("button", { name: "Add Bike Pump" }).click();
  await till.getByRole("button", { name: /^Charge/ }).click();
  const co = till.getByRole("dialog", { name: "Checkout" });
  await co.getByRole("button", { name: "M-Pesa" }).click();
  return co;
}

test("without an M-Pesa set-up the till takes a typed code only (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const co = await mpesaCheckout(page);
  await expect(co.getByText("M-Pesa requests are not set up for this terminal.")).toBeVisible();
  await expect(co.getByRole("button", { name: "Send request" })).toHaveCount(0);
  await expect(co.getByLabel("Customer's phone")).toHaveCount(0);
  await co.getByLabel("M-Pesa code").fill("SKTEST1234");
  await co.getByRole("button", { name: /^Complete sale/ }).click();
  await expect(co.page().getByRole("dialog", { name: "Sale complete" })).toBeVisible();
});

test("a saved and tested Paybill lets the till send a request to the terminal's account (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Integrations", exact: true }).click();
  await page.waitForURL("**/integrations/m-pesa-daraja");
  await page.getByLabel("Applies to").selectOption("all");
  await page.getByLabel("Paybill number").fill("522522");
  await button(page, "Add terminal").click();
  await page.getByLabel("Terminal", { exact: true }).selectOption({ label: "Terminal 1" });
  await page.getByLabel("Terminal account number").fill("FRONT");
  await page.getByLabel(/^Consumer key/).fill("ck-live-123");
  await page.getByLabel(/^Consumer secret/).fill("cs-live-456");
  await page.getByLabel(/^Lipa na M-Pesa Online passkey/).fill("pk-live-789");
  await button(page, "Save credentials").click();
  await expect(toast(page)).toHaveText("M-Pesa credentials saved.");
  await button(page, "Test connection").click();
  await expect(toast(page)).toHaveText("Connection works.");

  const co = await mpesaCheckout(page);
  await expect(co.getByText("Payments go to Paybill 522522, account FRONT.")).toBeVisible();
  await co.getByLabel("Customer's phone").fill("0712 345 678");
  await co.getByRole("button", { name: "Send request" }).click();
  await expect(co.getByText(/^Payment received\. Code S/)).toBeVisible();
  await expect(co.getByLabel("M-Pesa code")).toHaveValue(/^S[A-Z0-9]{9}$/);
});
