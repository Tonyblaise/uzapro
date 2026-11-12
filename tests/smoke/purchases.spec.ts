import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 002 · US1–US4 Purchases (quickstart 1–5). Store data resets on a full page load, so each
 * flow logs in, opens Purchases once and then moves with in-app links. Drawers update the URL
 * asynchronously when they close, so each flow waits for the drawer to be hidden before using the
 * header buttons again.
 */

async function choose(scope: Locator | Page, picker: string, option: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const toast = (page: Page) => page.getByRole("status");

/** Quantity cell of a Stock management row (Product, Variant, Store, Quantity, …). */
const qty = (page: Page, product: string, variant: string) =>
  page.getByRole("row").filter({ hasText: product }).filter({ hasText: variant }).getByRole("cell").nth(3);

async function openPurchaseOrders(page: Page) {
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Purchases" }).click();
  await tab(page, "Purchase orders");
  await expect(page.getByRole("row").filter({ hasText: "PUR-ORD-0409" })).toBeVisible();
}

/** Quickstart 2: Eastside Bicycle Supplies, Main Store, Bike Pump · Standard ×10 and Helmet · Medium ×5, "Save and approve". */
async function createApprovedOrder(page: Page) {
  await page.getByRole("button", { name: "New purchase order" }).click();
  const form = page.getByRole("dialog", { name: "New purchase order" });
  await choose(form, "Supplier", "Eastside Bicycle Supplies");
  await expect(form.getByRole("button", { name: "Destination store", exact: true })).toContainText("Main Store");
  await choose(form, "Search products", "Bike Pump · Standard");
  await form.getByRole("group", { name: "Bike Pump · Standard" }).getByLabel("Quantity").fill("10");
  await choose(form, "Search products", "Helmet · Medium");
  await form.getByRole("group", { name: "Helmet · Medium" }).getByLabel("Quantity").fill("5");
  await form.getByRole("button", { name: "Save and approve" }).click();
  await expect(toast(page)).toContainText("PUR-ORD-0410 saved.");
  await expect(form).toBeHidden();
  const row = page.getByRole("row").filter({ hasText: "PUR-ORD-0410" });
  await expect(row).toContainText("Approved");
  await expect(row).toContainText("None");
  return row;
}

/** Quickstart 3: receive all as ordered with Bike Pump accepted 9 of 10. */
async function receiveOrder(page: Page, row: Locator) {
  await row.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Accept and receive goods" }).click();
  const recv = page.getByRole("dialog", { name: "Receive goods" });
  await expect(recv.getByText("Receive PUR-ORD-0410")).toBeVisible();
  await recv.getByRole("button", { name: "Receive all as ordered" }).click();
  await recv.getByRole("group", { name: "Bike Pump · Standard" }).getByLabel("Accepted", { exact: true }).fill("9");
  await recv.getByRole("button", { name: "Receive 2 lines" }).click();
  await expect(toast(page)).toHaveText("GRN-0042 saved. 14 accepted into Main Store. PYB-0015 added to Payables.");
  const view = page.getByRole("dialog", { name: "Purchase order PUR-ORD-0410" });
  await expect(view).toBeVisible();
  await expect(view.getByText("GRN-0042", { exact: true })).toBeVisible();
  await view.getByRole("button", { name: "Close" }).click();
  await expect(view).toBeHidden();
}

test("Purchases overview shows the design figures and View all opens Purchase orders", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Purchases" }).click();
  await tab(page, "Overview");
  await expect(page.getByRole("heading", { level: 1, name: "Purchases" })).toBeVisible();
  const kpis: [string, string][] = [
    ["Total orders", "3"],
    ["Total spend", "KES 641,596"],
    ["Active suppliers", "3"],
    ["Goods received", "2"],
    ["Avg lead time", "6d"],
    ["Rejected items", "2"],
    ["Returns", "5"],
  ];
  for (const [label, value] of kpis) {
    const card = page.locator(".uz-kpi8 > div").filter({ has: page.getByText(label, { exact: true }) });
    await expect(card).toContainText(value);
  }
  for (const title of ["Purchase orders by month", "Purchase order status", "Supplier performance", "Spending trend (6 months)", "Recent orders", "Top suppliers"]) {
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText("Delivered on time")).toBeVisible();
  await page.getByRole("link", { name: "View all" }).click();
  await page.waitForURL("**/purchases/purchase-orders");
  await expect(page.getByRole("row").filter({ hasText: "PUR-ORD-0372" })).toContainText("Croma");
});

test("create and approve a purchase order", async ({ page, errors }) => {
  void errors;
  await openPurchaseOrders(page);
  const row = await createApprovedOrder(page);
  await expect(row).toContainText("Eastside Bicycle Supplies");
  await expect(row).toContainText("7,000");

  await row.click();
  const view = page.getByRole("dialog", { name: "Purchase order PUR-ORD-0410" });
  await expect(view.getByText("What was ordered from the supplier")).toBeVisible();
  await expect(view.getByRole("cell", { name: "Bike Pump · Standard" })).toBeVisible();
  await expect(view.getByRole("cell", { name: "Helmet · Medium" })).toBeVisible();
  await expect(view.getByText("Sent to supplier")).toBeVisible();
  await expect(view.getByText("KES 7,000.00").first()).toBeVisible();
});

test("an order with no items cannot be saved", async ({ page, errors }) => {
  void errors;
  await openPurchaseOrders(page);
  await page.getByRole("button", { name: "New purchase order" }).click();
  const form = page.getByRole("dialog", { name: "New purchase order" });
  await expect(form.getByText("No items added yet. Search for a product above.")).toBeVisible();
  await expect(form.getByRole("button", { name: "Save and approve" })).toBeDisabled();
  await choose(form, "Supplier", "Eastside Bicycle Supplies");
  await expect(form.getByRole("button", { name: "Save and approve" })).toBeDisabled();
  await expect(form.getByRole("button", { name: "Save as draft" })).toBeDisabled();
  await expect(form.getByText("No items added yet. Search for a product above.")).toBeVisible();
});

test("receive an order into stock", async ({ page, errors }) => {
  void errors;
  await openPurchaseOrders(page);
  const row = await createApprovedOrder(page);
  await receiveOrder(page, row);
  await expect(row).toContainText("Full");
  await expect(row).toContainText("Completed");

  await tab(page, "Goods receipts");
  await expect(page.getByRole("row").filter({ hasText: "GRN-0042" })).toContainText("PUR-ORD-0410");

  await tab(page, "Rejected items");
  const rej = page.getByRole("row").filter({ hasText: "REJ-0004" });
  await expect(rej).toContainText("Bike Pump · Standard");
  await expect(rej).toContainText("Rejected on delivery");
  await expect(rej).toContainText("Waiting");

  // Main Store's Bike Pump goes 30 → 39 and Helmet 0 → 5.
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Stock management");
  await choose(page, "store", "Main Store");
  await expect(qty(page, "Bike Pump", "Standard")).toHaveText("39");
  await expect(qty(page, "Helmet", "Medium")).toHaveText("5");
});

test("return items against a goods receipt, then mark a rejected item sent back", async ({ page, errors }) => {
  void errors;
  await openPurchaseOrders(page);
  const row = await createApprovedOrder(page);
  await receiveOrder(page, row);

  // Quickstart 4: Helmet ×2 against GRN-0042, reason Damaged, "Submit and approve".
  await tab(page, "Purchase returns");
  await page.getByRole("button", { name: "New purchase return" }).click();
  const form = page.getByRole("dialog", { name: "New purchase return" });
  await expect(form.getByText("Choose a goods receipt above to load the items you can return.")).toBeVisible();
  await choose(form, "Purchase order", "PUR-ORD-0410 (Completed)");
  await choose(form, "Return against goods receipt", "GRN-0042");
  await choose(form, "Reason", "Damaged");
  const helmet = form.getByRole("group", { name: "Helmet · Medium" });
  await helmet.getByLabel("Return quantity").fill("2");
  await expect(form.getByRole("button", { name: "Submit and approve" })).toBeEnabled();
  await helmet.getByLabel("Return quantity").fill("6");
  await expect(form.getByRole("button", { name: "Submit and approve" })).toBeDisabled();
  await helmet.getByLabel("Return quantity").fill("2");
  await form.getByRole("button", { name: "Submit and approve" }).click();
  await expect(toast(page)).toHaveText("PRT-0006 approved. Stock reduced.");
  await expect(form).toBeHidden();
  const ret = page.getByRole("row").filter({ hasText: "PRT-0006" });
  await expect(ret).toContainText("GRN-0042");
  await expect(ret).toContainText("Approved");

  // Quickstart 5: REJ-0004 "Mark sent back"; no actions remain.
  await tab(page, "Rejected items");
  await page.getByRole("row").filter({ hasText: "REJ-0004" }).click();
  const view = page.getByRole("dialog", { name: "Rejected item REJ-0004" });
  await view.getByRole("button", { name: "Mark sent back" }).click();
  await expect(toast(page)).toHaveText("REJ-0004 marked as sent back.");
  for (const name of ["Mark sent back", "Mark replaced", "Write off"]) {
    await expect(view.getByRole("button", { name })).toHaveCount(0);
  }
  await view.getByRole("button", { name: "Close" }).click();
  await expect(view).toBeHidden();
  await expect(page.getByRole("row").filter({ hasText: "REJ-0004" })).toContainText("Sent back");

  // Main Store's Helmet goes 5 → 3.
  await nav(page).getByRole("link", { name: "Stock" }).click();
  await tab(page, "Stock management");
  await choose(page, "store", "Main Store");
  await expect(qty(page, "Helmet", "Medium")).toHaveText("3");
});
