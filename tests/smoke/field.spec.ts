import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 024 · Field sales, Sales reps and Deliveries (design `UZ_MODS` field). Store data resets on a full
 * page load, so each flow logs in, opens one page, then moves with in-app links.
 */

const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });

async function pick(scope: ReturnType<Page["getByRole"]>, page: Page, label: string, option: string) {
  await scope.getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("take a field sale paid on delivery, dispatch it and confirm delivery with the M-Pesa code", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Field sales", exact: true }).click();
  await page.waitForURL("**/field-sales/field-sales");
  await expect(row(page, "FS-0112")).toContainText("On credit");

  await page.getByRole("button", { name: "New field sale" }).click();
  const form = page.getByRole("dialog", { name: "New field sale" });
  await form.getByRole("button", { name: "Save and send to deliveries" }).click();
  await expect(form.getByRole("alert")).toHaveText("Pick the customer.");

  await pick(form, page, "Customer", "Mountain Goats");
  await form.getByLabel("Delivery location").fill("Ridgeways Mall, shop 4");
  await pick(form, page, "Product", "Bike Pump");
  await form.getByLabel("Qty").fill("2");
  await form.getByRole("button", { name: "Add", exact: true }).click();
  await expect(form).toContainText("KES 690.00");
  await pick(form, page, "Rep who took the order", "Kevin Otieno");
  await expect(form.getByLabel("Route or area")).toHaveValue("Kiambu Road");
  await expect(form.getByRole("button", { name: "On delivery" })).toHaveAttribute("aria-pressed", "true");
  await form.getByRole("button", { name: "Save and send to deliveries" }).click();
  await expect(toast(page)).toHaveText("FS-0113 saved. Delivery DLV-0241 is waiting in Field sales › Deliveries.");
  for (const text of ["Kevin Otieno", "On delivery", "Pending"]) await expect(row(page, "FS-0113")).toContainText(text);

  // Field sales › Deliveries: dispatch, then confirm with the money collected.
  await tab(page, "Deliveries");
  await page.waitForURL("**/field-sales/deliveries");
  await expect(row(page, "DLV-0241")).toContainText("690");
  await row(page, "DLV-0241").click();
  const view = page.getByRole("dialog", { name: "Delivery DLV-0241" });
  await view.getByRole("button", { name: "Dispatch" }).click();
  await expect(toast(page)).toHaveText("DLV-0241 is out for delivery.");
  await view.getByLabel("Received by").fill("Ann Mwende");
  await view.getByRole("button", { name: "Mark as delivered" }).click();
  await expect(view.getByRole("alert")).toHaveText("Add the M-Pesa code for the payment.");
  await view.getByLabel("Reference").fill("SKQ81TZ");
  await view.getByRole("button", { name: "Mark as delivered" }).click();
  await expect(toast(page)).toHaveText("DLV-0241 delivered.");
  await expect(view).toContainText("Received by Ann Mwende");
  await view.getByRole("button", { name: "Close" }).first().click();
  await expect(row(page, "DLV-0241")).toContainText("Delivered");

  // The sale is in Sales › All sales, now paid.
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "All sales");
  await expect(row(page, "Mountain Goats").filter({ hasText: "Field" }).first()).toContainText("Paid");
});

test("couldn't deliver reschedules it; cancelling moves it to Delivered as Cancelled", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/field-sales/deliveries?view=DLV-0239");
  const view = page.getByRole("dialog", { name: "Delivery DLV-0239" });
  await view.getByRole("button", { name: "Couldn't deliver" }).click();
  await view.getByRole("button", { name: "Reschedule" }).click();
  await expect(view.getByRole("alert")).toHaveText("Say why.");
  await view.getByLabel("Reason").fill("Shop closed");
  await view.getByRole("button", { name: "Reschedule" }).click();
  await expect(toast(page)).toHaveText("DLV-0239 rescheduled.");
  await expect(view).toContainText("Not delivered: Shop closed.");

  await view.getByRole("button", { name: "Cancel this delivery" }).click();
  await view.getByLabel("Reason").fill("Customer changed their mind");
  await view.getByRole("button", { name: "Cancel delivery" }).click();
  await expect(toast(page)).toHaveText("DLV-0239 cancelled.");
  await view.getByRole("button", { name: "Close" }).first().click();
  await expect(row(page, "DLV-0239")).toContainText("Cancelled");
});

test("Sales reps shows each rep's day and opens their sales", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/field-sales/sales-reps");
  // Peter Roadie: FS-0110 today, FS-0109 yesterday; both still open.
  for (const text of ["Thika Road", "KDA 412M · van", "On route"]) await expect(row(page, "Peter Roadie")).toContainText(text);
  await row(page, "Peter Roadie").click();
  await page.waitForURL("**/field-sales/field-sales?rep=*");
  await expect(page.getByText("Showing Peter Roadie's sales.")).toBeVisible();
  await expect(row(page, "FS-")).toHaveCount(2);
});

test("Deliveries lists those still to go out first; sales-order notes stay under Sales", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/field-sales/deliveries");
  await expect(row(page, "DLV-0235")).toBeVisible();
  const refs = await page.getByRole("row").filter({ hasText: "DLV-" }).evaluateAll((rs) => rs.map((r) => r.textContent?.match(/DLV-\d+/)?.[0]));
  expect(refs).toEqual(["DLV-0239", "DLV-0238", "DLV-0237", "DLV-0240", "DLV-0236", "DLV-0235"]);
  await expect(row(page, "DN-")).toHaveCount(0);
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "Deliveries");
  await expect(row(page, "DN-0001")).toContainText("SO-0001");
});

test("the Cashier takes field sales; the Store keeper only delivers; the Accountant can only look", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  await nav(page).getByRole("link", { name: "Field sales", exact: true }).click();
  await expect(page.getByRole("button", { name: "New field sale" })).toBeVisible();

  await page.getByRole("button", { name: /Jane Smith/ }).click();
  await page.getByLabel("View as").selectOption("store");
  await page.waitForURL("**/dashboard");
  await nav(page).getByRole("link", { name: "Field sales", exact: true }).click();
  await page.waitForURL("**/field-sales/deliveries");
  await expect(page.getByRole("button", { name: "New field sale" })).toHaveCount(0);
  await row(page, "DLV-0238").click();
  await expect(page.getByRole("dialog", { name: "Delivery DLV-0238" }).getByRole("button", { name: "Dispatch" })).toBeVisible();
  await page.getByRole("dialog", { name: "Delivery DLV-0238" }).getByRole("button", { name: "Close" }).first().click();

  await page.getByRole("button", { name: /Grant Jensen/ }).click();
  await page.getByLabel("View as").selectOption("accountant");
  await page.waitForURL("**/dashboard");
  await nav(page).getByRole("link", { name: "Field sales", exact: true }).click();
  await tab(page, "Deliveries");
  await row(page, "DLV-0238").click();
  const view = page.getByRole("dialog", { name: "Delivery DLV-0238" });
  await expect(view).toContainText("Paid by M-Pesa");
  await expect(view.getByRole("button", { name: "Dispatch" })).toHaveCount(0);
});
