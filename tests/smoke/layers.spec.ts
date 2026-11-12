import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Layering fix: row menus and searchable pickers must show in full, never clipped by a table scroll
 * box or a form card, and never covered by another element.
 */

/** Every visible item is inside the viewport and is what the user would hit at its centre. */
async function allHittable(items: Locator) {
  const n = await items.count();
  expect(n).toBeGreaterThan(0);
  const bad = await items.evaluateAll((els) =>
    els
      .map((el) => {
        const r = el.getBoundingClientRect();
        const inView = r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return inView && hit && (hit === el || el.contains(hit)) ? null : (el.textContent ?? "").trim();
      })
      .filter(Boolean),
  );
  expect(bad, "items clipped or covered").toEqual([]);
}

const menuItems = (page: Page) => page.getByRole("menu").getByRole("menuitem");

test("the last purchase order's row menu shows in full (screenshot 1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/purchases/purchase-orders");
  await page.getByRole("button", { name: "Actions" }).last().click();
  await allHittable(menuItems(page));
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("the Payment term picker in the purchase-order form shows in full (screenshot 2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/purchases/purchase-orders");
  await page.getByRole("button", { name: "New purchase order" }).click();
  const form = page.getByRole("dialog", { name: "New purchase order" });
  await form.getByRole("button", { name: "Payment term", exact: true }).click();
  await allHittable(form.getByRole("option"));
  await form.getByRole("option").first().click();
  await expect(form.getByRole("listbox")).toHaveCount(0);
});

test.describe("short screens", () => {
  test.use({ viewport: { width: 1280, height: 640 } });
  test("a picker low in a drawer opens upward or fits", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    await page.goto("/expenses/expenses");
    await page.getByRole("button", { name: "Record expenses" }).click();
    const form = page.getByRole("dialog", { name: "Record expenses" });
    const trigger = form.getByRole("button", { name: "Payment account", exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await allHittable(form.getByRole("option"));
  });
});

test.describe("phones", () => {
  test.use({ viewport: { width: 375, height: 700 } });
  test("the last purchase order's row menu shows in full", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    await page.goto("/purchases/purchase-orders");
    await page.getByRole("button", { name: "Actions" }).last().click();
    await allHittable(menuItems(page));
  });
});
