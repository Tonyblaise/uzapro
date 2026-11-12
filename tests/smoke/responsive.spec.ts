import { expect, loginAs, test } from "./fixtures";

/** T087: phone width (390px) — no horizontal page scroll; wide tables scroll inside their card. */
test.use({ viewport: { width: 390, height: 844 } });

const PAGES = [
  "/dashboard",
  "/products/overview",
  "/products/all-products",
  "/stock/overview",
  "/stock/stock-management",
  "/sales/overview",
  "/sales/all-sales",
  "/sales/invoices",
  "/customers/customers",
];

test("in-scope screens fit a 390px phone without horizontal page scroll", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
  }
});

test("the sidebar opens as a drawer from the menu button on a phone", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  const nav = page.getByRole("complementary", { name: "Main" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await nav.getByRole("link", { name: "Customers" }).click();
  await page.waitForURL("**/customers/customers");
});
