import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 020 · WhatsApp receipts, invoices and reminders. The tests read the link's address;
 * they do not follow it, and the app makes no request of its own.
 */

const drawer = (page: Page) => page.getByRole("dialog").last();
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const dialog = (page: Page) => page.getByRole("dialog", { name: "Send on WhatsApp" });
const link = (page: Page) => dialog(page).getByRole("link", { name: "Open WhatsApp" });

/** The message carried by the link. */
async function linkText(page: Page) {
  const href = (await link(page).getAttribute("href"))!;
  return { number: new URL(href).pathname.slice(1), text: new URL(href).searchParams.get("text")!, href };
}

async function openReminder(page: Page, ref: string) {
  await page.getByRole("row").filter({ hasText: ref }).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Send reminder" }).click();
}

test("a payment reminder lists what the customer owes and links to their WhatsApp (US1)", async ({ page, errors, context }) => {
  void errors;
  // Stop the new tab from loading wa.me: the test only checks where the link points.
  await context.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>stub</title>" }));
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await openReminder(page, "RCV-0010");
  await expect(dialog(page)).toContainText("Mountain Goats");
  await expect(dialog(page).getByLabel("Phone number")).toHaveValue("+254 733 208 561");
  const { number, text, href } = await linkText(page);
  expect(href.startsWith("https://wa.me/254733208561?text=")).toBe(true);
  expect(number).toBe("254733208561");
  for (const part of ["Hello Mountain Goats,", "SAL-1184: KES 48,400.00, due 19 Nov 2026", "INV-0362: KES 32,000.00, due 5 Dec 2026", "Total owed: KES 80,400.00"]) expect(text).toContain(part);
  await expect(link(page)).toHaveAttribute("target", "_blank");
  await expect(link(page)).toHaveAttribute("rel", "noopener noreferrer");

  const [popup] = await Promise.all([page.waitForEvent("popup"), link(page).click()]);
  await popup.close();
  await expect(toast(page)).toHaveText("WhatsApp opened for Mountain Goats.");
  await expect(dialog(page)).toHaveCount(0);
  await openReminder(page, "RCV-0008");
  await expect(dialog(page)).toContainText(/Last reminded 10 Nov 2026, \d\d:\d\d/);
  await dialog(page).getByRole("button", { name: "Cancel" }).click();

  // An overdue customer, and a paid row with no reminder.
  await openReminder(page, "RCV-0012");
  expect((await linkText(page)).text).toMatch(/INV-0351: KES 45,600\.00, overdue by \d+ days/);
  await dialog(page).getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("row").filter({ hasText: "RCV-0007" }).getByRole("button", { name: "Actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Send reminder" })).toHaveCount(0);
});

test("the link is unavailable until the phone number is valid, and the message can be edited (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/receivables/receivables");
  await openReminder(page, "RCV-0011"); // Blazing Cycle Trails is not a customer record: no phone
  await expect(dialog(page).getByLabel("Phone number")).toHaveValue("");
  await expect(link(page)).toHaveCount(0);
  await expect(dialog(page).getByRole("button", { name: "Open WhatsApp" })).toBeDisabled();
  await expect(dialog(page)).toContainText("Enter a mobile number, for example 0712 345 678");
  await dialog(page).getByLabel("Phone number").fill("0712 345 678");
  await dialog(page).getByLabel("Message").fill("Hello, please call us.");
  const { number, text } = await linkText(page);
  expect(number).toBe("254712345678");
  expect(text).toBe("Hello, please call us.");
});

test("a sale's receipt and an invoice can be sent on WhatsApp (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  // Record a sale so its lines are known.
  await page.goto("/sales/all-sales?action=new");
  const pick = async (label: string, option: string) => {
    await drawer(page).getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("option", { name: option, exact: true }).click();
  };
  await pick("Customer", "Mountain Goats");
  await pick("Product", "Bike Pump");
  await drawer(page).getByLabel("Number of units").fill("2");
  await drawer(page).getByRole("button", { name: "Add to sale" }).click();
  await drawer(page).getByRole("button", { name: "Record sale" }).click();
  await page.getByRole("row").nth(1).click();
  await drawer(page).getByRole("button", { name: "WhatsApp" }).click();
  let m = await linkText(page);
  expect(m.number).toBe("254733208561");
  for (const part of ["Hello Mountain Goats,", "Here is your receipt SAL-001185 of 10 Nov 2026.", "2 x Bike Pump · Standard: KES 690.00", "Total: KES 690.00", "Paid by M-Pesa."]) expect(m.text).toContain(part);
  await dialog(page).getByRole("button", { name: "Cancel" }).click();
  await expect(drawer(page)).toContainText("SAL-001185");
  await drawer(page).getByRole("button", { name: "Close" }).first().click();

  await tab(page, "Invoices");
  await page.getByRole("row").filter({ hasText: "INV-0351" }).click();
  await drawer(page).getByRole("button", { name: "WhatsApp" }).click();
  // The seed invoice is for "Morningview", which is not a customer record, so there is no phone yet.
  await expect(link(page)).toHaveCount(0);
  await dialog(page).getByLabel("Phone number").fill("+254 712 340 118");
  m = await linkText(page);
  expect(m.number).toBe("254712340118");
  for (const part of ["Hello Morningview,", "Here is invoice INV-0351 from", "Amount: KES 45,600.00"]) expect(m.text).toContain(part);
});

test("the till receipt can be sent on WhatsApp, above the till (US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const main = page;
  await nav(main).getByRole("link", { name: "Point of sale" }).click();
  await main.waitForURL("**/point-of-sale/terminals");
  const card = main.getByRole("list", { name: "Terminals" }).getByRole("listitem").first();
  [page] = await Promise.all([main.waitForEvent("popup"), card.getByRole("button", { name: "Launch" }).click()]);
  await expect(page.getByRole("group", { name: "Enter your PIN" })).toBeFocused();
  for (const k of "1234") await page.keyboard.press(k);
  await page.getByRole("button", { name: "Add Bike Pump" }).click();
  await page.getByRole("button", { name: /^Charge/ }).click();
  await page.getByRole("dialog", { name: "Checkout" }).getByRole("button", { name: /^Complete sale/ }).click();
  await page.getByRole("dialog", { name: "Sale complete" }).getByRole("button", { name: "WhatsApp" }).click();
  await expect(dialog(page).getByLabel("Phone number")).toHaveValue(""); // a walk-in sale
  await dialog(page).getByLabel("Phone number").fill("0712 345 678");
  const m = await linkText(page);
  for (const part of ["Hello,", "1 x Bike Pump: KES 345.00", "Total: KES 345.00", "Paid by Cash. Prices include VAT."]) expect(m.text).toContain(part);
  await dialog(page).getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog", { name: "Sale complete" })).toBeVisible();
});
