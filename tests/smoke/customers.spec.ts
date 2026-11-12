import { expect, loginAs, test } from "./fixtures";

/** Customers story (US6, T085): quickstart scenario 10. */

test("add Kilele Riders and pick it in a new sale", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/customers/customers?action=new");
  const form = page.getByRole("dialog", { name: "New customer" });
  await form.getByLabel("Name").fill("Kilele Riders");
  await form.getByLabel("Phone number (optional)").fill("+254 700 000 001");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Kilele Riders added.")).toBeVisible();
  const row = page.getByRole("row", { name: /Kilele Riders/ });
  await expect(row).toContainText("Active");

  // In-app navigation keeps the session data (a reload resets it).
  await page.getByRole("link", { name: "Sales", exact: true }).click();
  await page.getByRole("link", { name: "All sales", exact: true }).click();
  await page.getByRole("button", { name: "New sale" }).click();
  const sale = page.getByRole("dialog", { name: "New sale" });
  await sale.getByRole("button", { name: "Customer", exact: true }).click();
  await page.getByRole("option", { name: "Kilele Riders", exact: true }).click();
  await expect(sale.getByRole("button", { name: "Customer", exact: true })).toContainText("Kilele Riders");
});

test("a duplicate customer name is blocked", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/customers/customers?action=new");
  const form = page.getByRole("dialog", { name: "New customer" });
  await form.getByLabel("Name").fill("Mountain Goats");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Mountain Goats is already a customer.")).toBeVisible();
  await expect(form).toBeVisible();
  await expect(page.getByRole("row", { name: /Mountain Goats/ })).toHaveCount(1);
});
