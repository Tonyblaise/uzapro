import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 013 · sales orders and dispatch (quickstart 1–9). Store data resets on a full page load,
 * so each flow logs in once and then moves with in-app links.
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

/** Sales › Sales orders › New order: Mountain Goats, Bike Pump in boxes. Leaves the form open. */
async function startOrder(page: Page, boxes: string) {
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "Sales orders");
  await page.getByRole("button", { name: "New order" }).click();
  await pick(page, "Customer", "Mountain Goats");
  await pick(page, "Add item", "Bike Pump · Standard");
  const line = drawer(page).getByRole("row").filter({ hasText: "Bike Pump · Standard" });
  await line.getByRole("button", { name: "unit", exact: true }).click();
  await page.getByRole("option", { name: "Box", exact: true }).click();
  await line.getByLabel("Quantity").fill(boxes);
  return line;
}

async function dispatch(page: Page, sendNow?: string) {
  await drawer(page).getByRole("button", { name: "Dispatch" }).click();
  const form = page.getByRole("dialog", { name: /^Dispatch SO-/ });
  if (sendNow) await form.getByLabel("Send now: Bike Pump · Standard").fill(sendNow);
  await form.getByLabel("Driver").fill("Peter Kamau");
  await form.getByLabel("Vehicle registration").fill("KDG 412X");
  await form.getByRole("button", { name: "Confirm dispatch" }).click();
}

test("the seed order and delivery note are listed (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/sales/sales-orders");
  for (const text of ["Morningview Bicycles", "6 Nov 2026", "12 Nov 2026", "Part dispatched", "16,560"]) await expect(row(page, "SO-0001")).toContainText(text);
  await tab(page, "Deliveries");
  for (const text of ["SO-0001", "Peter Kamau", "KDG 412X", "Delivered"]) await expect(row(page, "DN-0001")).toContainText(text);
  await row(page, "DN-0001").click();
  await expect(drawer(page)).toContainText("Amina Yusuf, 8 Nov 2026, 15:20");
  await expect(drawer(page).getByRole("button", { name: "Mark delivered" })).toHaveCount(0);
  await drawer(page).getByRole("button", { name: "Print delivery note" }).click();
  await expect(toast(page)).toHaveText("DN-0001 sent to the printer.");
});

test("take an order, dispatch it in two parts, confirm delivery and invoice it (US1–US4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  // A box holds 12 Bike Pump (feature 014) and Main Store holds 30, so two boxes is the most it can send.
  const line = await startOrder(page, "2");
  await expect(line.getByLabel("Rate")).toHaveValue("3800");
  await expect(line).toContainText("Distributor price");
  await expect(drawer(page)).toContainText("KES 7,600.00");
  await drawer(page).getByRole("button", { name: "Save", exact: true }).click();
  await expect(toast(page)).toHaveText("SO-0002 saved.");
  await expect(row(page, "SO-0002")).toContainText("Open");

  // Part dispatch: 1 of 2 boxes leaves Main Store.
  await row(page, "SO-0002").click();
  await dispatch(page, "1");
  await expect(toast(page)).toHaveText("DN-0002 created. 1 item left Main Store.");
  await expect(drawer(page)).toContainText("Part dispatched");
  await expect(drawer(page).getByRole("link", { name: "DN-0002" })).toBeVisible();

  // Sending more than is left is refused; the rest goes in a second note.
  await drawer(page).getByRole("button", { name: "Dispatch" }).click();
  const form = page.getByRole("dialog", { name: "Dispatch SO-0002" });
  await expect(form.getByLabel("Send now: Bike Pump · Standard")).toHaveValue("1");
  await form.getByLabel("Send now: Bike Pump · Standard").fill("5");
  await form.getByLabel("Driver").fill("Peter Kamau");
  await form.getByLabel("Vehicle registration").fill("KDG 412X");
  await form.getByRole("button", { name: "Confirm dispatch" }).click();
  await expect(form.getByRole("alert")).toHaveText("You can send at most 1 Box of Bike Pump · Standard");
  await form.getByLabel("Send now: Bike Pump · Standard").fill("1");
  await form.getByRole("button", { name: "Confirm dispatch" }).click();
  await expect(toast(page)).toHaveText("DN-0003 created. 1 item left Main Store.");
  await expect(drawer(page).getByRole("button", { name: "Dispatch" })).toHaveCount(0);
  await expect(drawer(page).getByRole("button", { name: "Edit" })).toHaveCount(0);

  // Invoice: exactly the 2 boxes, and stock does not move again.
  await drawer(page).getByRole("button", { name: "Create invoice" }).click();
  await expect(toast(page)).toHaveText("INV-0356 saved. RCV-0013 added to Receivables.");
  await expect(drawer(page)).toContainText("Invoiced");
  await drawer(page).getByRole("link", { name: "INV-0356" }).click();
  await expect(drawer(page)).toContainText("7,600");
  await drawer(page).getByRole("button", { name: "Close" }).click();

  // Proof of delivery.
  await tab(page, "Deliveries");
  await row(page, "DN-0003").click();
  await drawer(page).getByRole("button", { name: "Mark delivered" }).click();
  await drawer(page).getByRole("button", { name: "Confirm delivery" }).click();
  await expect(drawer(page)).toContainText("Enter who received the goods");
  await drawer(page).getByLabel("Received by").fill("Amina Yusuf");
  await drawer(page).getByRole("button", { name: "Confirm delivery" }).click();
  await expect(toast(page)).toHaveText("DN-0003 marked delivered.");
  await expect(drawer(page)).toContainText("Amina Yusuf, 10 Nov 2026");
  await drawer(page).getByRole("button", { name: "Close" }).click();
  await expect(row(page, "DN-0003")).toContainText("Delivered");

  // Stock: 30 at Main Store, less 2 boxes of 12; the invoice took nothing more.
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Stock management");
  await expect(page.getByRole("row").filter({ hasText: "Bike Pump" }).filter({ hasText: "Main Store" })).toContainText("6");
  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await expect(row(page, "RCV-0013")).toContainText("INV-0356");
});

test("an order can be edited and cancelled only before anything is dispatched (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await startOrder(page, "1");
  await drawer(page).getByRole("button", { name: "Save", exact: true }).click();
  await row(page, "SO-0002").click();
  await drawer(page).getByRole("button", { name: "Edit" }).click();
  const form = page.getByRole("dialog", { name: "Edit SO-0002" });
  await form.getByLabel("Quantity").fill("2");
  await form.getByRole("button", { name: "Save", exact: true }).click();
  await expect(row(page, "SO-0002")).toContainText("7,600");
  await row(page, "SO-0002").getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Cancel order" }).click();
  await page.getByRole("dialog", { name: "Cancel SO-0002?" }).getByRole("button", { name: "Cancel order" }).click();
  await expect(toast(page)).toHaveText("SO-0002 cancelled.");
  await expect(row(page, "SO-0002")).toContainText("Cancelled");
  // The seed order is part dispatched: no Edit or Cancel.
  await row(page, "SO-0001").getByRole("button", { name: "Actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Dispatch" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Cancel order" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "Edit" })).toHaveCount(0);
});

test("a short store refuses the dispatch, and an order over the credit limit is stopped (US1, US2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  // An order for more boxes than Main Store holds (30), at a token rate so credit is not the issue.
  const line = await startOrder(page, "31");
  await line.getByLabel("Rate").fill("1");
  await drawer(page).getByRole("button", { name: "Save", exact: true }).click();
  await expect(toast(page)).toHaveText("SO-0002 saved.");
  await row(page, "SO-0002").click();
  await dispatch(page);
  await expect(toast(page)).toHaveText("Only 30 Bike Pump left at Main Store.");
  await expect(page.getByRole("dialog", { name: "Dispatch SO-0002" })).toBeVisible();
  await page.getByRole("dialog", { name: "Dispatch SO-0002" }).getByRole("button", { name: "Cancel" }).click();
  await drawer(page).getByRole("button", { name: "Close" }).click();

  // 6 boxes is KES 22,800 against KES 19,569 available (the open order's KES 31 counts).
  await page.getByRole("button", { name: "New order" }).click();
  await pick(page, "Customer", "Mountain Goats");
  await pick(page, "Add item", "Bike Pump · Standard");
  const big = drawer(page).getByRole("row").filter({ hasText: "Bike Pump · Standard" });
  await big.getByRole("button", { name: "unit", exact: true }).click();
  await page.getByRole("option", { name: "Box", exact: true }).click();
  await big.getByLabel("Quantity").fill("6");
  await drawer(page).getByRole("button", { name: "Save", exact: true }).click();
  const stop = page.getByRole("dialog", { name: "Over the credit limit" });
  for (const figure of ["KES 22,800.00", "KES 31.00", "KES 19,569.00"]) await expect(stop).toContainText(figure);
  await stop.getByLabel("Reason for approving").fill("Agreed with the owner");
  await stop.getByRole("button", { name: "Approve anyway" }).click();
  await expect(toast(page)).toHaveText("SO-0003 saved.");
  await row(page, "SO-0003").click();
  await expect(drawer(page)).toContainText("Tony Blaise: Agreed with the owner");

  // The customer record shows what is on order.
  await drawer(page).getByRole("button", { name: "Close" }).click();
  await nav(page).getByRole("link", { name: "Customers" }).click();
  await page.waitForURL("**/customers/customers");
  await page.getByRole("row", { name: /Mountain Goats/ }).click();
  const credit = page.getByRole("dialog", { name: "Edit customer" }).getByRole("region", { name: "Credit" });
  await expect(credit).toContainText("KES 22,831.00");
  await expect(credit).toContainText("KES 0.00");
});

test("a role with Read on Sales can view orders; Dispatch follows its own right (FR-019, feature 018)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Permissions" }).click();
  await page.getByRole("button", { name: "Edit role: Accountant" }).click();
  const edit = page.getByRole("dialog", { name: /Edit role/ });
  await edit.getByRole("button", { name: "Sales: Write" }).click();
  await edit.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption("accountant");
  await page.waitForURL("**/dashboard");
  await nav(page).getByRole("link", { name: "Sales", exact: true }).click();
  await tab(page, "Sales orders");
  await expect(page.getByRole("button", { name: "New order" })).toHaveCount(0);
  await row(page, "SO-0001").click();
  await expect(drawer(page)).toContainText("Part dispatched");
  for (const name of ["Create invoice", "Edit", "Cancel order"]) await expect(drawer(page).getByRole("button", { name })).toHaveCount(0);
  // The Accountant keeps "Dispatch sales orders", so Dispatch stays without Write on Sales.
  await expect(drawer(page).getByRole("button", { name: "Dispatch" })).toBeVisible();
});
