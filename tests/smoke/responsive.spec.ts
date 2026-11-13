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
  "/purchases/overview",
  "/purchases/purchase-orders",
  "/purchases/goods-receipts",
  "/suppliers/suppliers",
  "/receivables/receivables",
  "/receivables/payments",
  "/payables/payables",
  "/payables/supplier-ageing",
  "/accounts/bank-accounts",
  "/accounts/transactions",
  "/expenses/overview",
  "/expenses/expenses",
  "/calendar/calendar",
  "/file-manager/all-documents",
  "/settings/business-profile",
  "/settings/terminals",
  "/profile/profile",
  "/reports/popular",
  "/help/help-center",
  "/help/help-center?article=how-to-give-a-refund",
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

/** Smallest common phone (320px): the screens whose grids used to overflow there. */
test.describe("at 320px", () => {
  test.use({ viewport: { width: 320, height: 700 } });
  test("overview boards and File Manager fit without horizontal page scroll", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    for (const path of ["/dashboard", "/stock/overview", "/purchases/overview", "/file-manager/all-documents"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} overflows by ${overflow}px at 320px`).toBeLessThanOrEqual(0);
    }
  });
});

/** Feature 008 · Uza AI on phones (T029, FR-020, SC-006, SC-006a, FR-006). */
test.describe("Uza AI on phones", () => {
  test.use({ viewport: { width: 320, height: 700 } });
  const AXE = require.resolve("axe-core/axe.min.js");
  const panel = (page: import("@playwright/test").Page) => page.getByRole("dialog", { name: "Uza AI and help" });

  async function scan(page: import("@playwright/test").Page) {
    await page.addScriptTag({ path: AXE });
    const bad = await page.evaluate(async () => {
      const w = window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: { id: string; impact: string; nodes: unknown[] }[] }> } };
      const r = await w.axe.run({ include: [['[role="dialog"]']] }, { resultTypes: ["violations"] });
      return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id} (${v.nodes.length})`);
    });
    expect(bad, "serious or critical axe violations").toEqual([]);
  }

  test("the panel fits 320px on every tab and passes the accessibility scan", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    await page.getByRole("button", { name: "Open Uza AI" }).click();
    const fits = async (what: string) => {
      const overflow = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]') as HTMLElement;
        return Math.max(document.documentElement.scrollWidth - innerWidth, ...Array.from(d.querySelectorAll<HTMLElement>("*")).map((el) => el.getBoundingClientRect().right - innerWidth));
      });
      expect(overflow, `${what} overflows by ${overflow}px`).toBeLessThanOrEqual(0.5);
    };
    await panel(page).getByRole("button", { name: "Overdue invoices" }).click();
    await expect(panel(page).getByRole("button", { name: "Open Receivables" })).toBeVisible();
    await fits("chat");
    await scan(page);
    await panel(page).getByRole("tab", { name: "Support" }).click();
    await fits("support");
    await scan(page);
    await panel(page).getByRole("tab", { name: "Features" }).click();
    await fits("roadmap");
    for (const t of ["Browse", "New"]) {
      await panel(page).getByRole("tab", { name: t }).click();
      await fits(t);
    }
    await scan(page);
  });

  test("a chat action navigates and closes the panel on a phone", async ({ page, errors }) => {
    void errors;
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, "owner");
    await page.getByRole("button", { name: "Open Uza AI" }).click();
    await panel(page).getByRole("button", { name: "Overdue invoices" }).click();
    await panel(page).getByRole("button", { name: "Open Receivables" }).click();
    await page.waitForURL("**/receivables/receivables");
    await expect(panel(page)).toBeHidden();
    await expect(page.getByRole("button", { name: "Open Uza AI" })).toBeVisible();
  });

  test("scrolled to the bottom, no page control sits under the launcher (SC-006a)", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    for (const width of [320, 375, 430]) {
      await page.setViewportSize({ width, height: 740 });
      for (const path of ["/sales/all-sales", "/stock/stock-management", "/settings/business-profile"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const hits = await page.evaluate(() => {
          const fab = document.querySelector('[aria-label="Open Uza AI"]')!.getBoundingClientRect();
          return Array.from(document.querySelectorAll<HTMLElement>("main a[href], main button, main input, main select, main textarea"))
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.height > 0 && r.left < fab.right && r.right > fab.left && r.top < fab.bottom && r.bottom > fab.top;
            })
            .map((el) => el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 30) || el.tagName);
        });
        expect(hits, `${path} at ${width}px: controls under the launcher`).toEqual([]);
      }
    }
  });
});

/** Feature 009 · Run Reports on phones (T018, FR-014, SC-006). */
test.describe("reports on phones", () => {
  test.use({ viewport: { width: 320, height: 700 } });
  const AXE = require.resolve("axe-core/axe.min.js");

  test("report views fit 320px and pass the accessibility scan", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    for (const path of ["/reports/money?report=aged-receivables", "/reports/stock?report=low-stock", "/reports/popular?report=sales-summary"]) {
      await page.goto(path);
      await expect(page.getByRole("button", { name: "All reports" })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} overflows by ${overflow}px at 320px`).toBeLessThanOrEqual(0);
      await page.addScriptTag({ path: AXE });
      const bad = await page.evaluate(async () => {
        const w = window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: { id: string; impact: string; nodes: unknown[] }[] }> } };
        const r = await w.axe.run({ include: [["[data-report-view]"]] }, { resultTypes: ["violations"] });
        return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id} (${v.nodes.length})`);
      });
      expect(bad, `${path}: serious or critical axe violations`).toEqual([]);
    }
  });
});

/** Feature 010 · the point-of-sale till on phones (T028, FR-018, FR-019, SC-005). */
test.describe("till on phones", () => {
  test.use({ viewport: { width: 320, height: 700 } });
  const AXE = require.resolve("axe-core/axe.min.js");
  type P = import("@playwright/test").Page;
  const fits = async (page: P, what: string) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${what} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
  };
  const scan = async (page: P, what: string) => {
    await page.addScriptTag({ path: AXE });
    const bad = await page.evaluate(async () => {
      const w = window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: { id: string; impact: string; nodes: unknown[] }[] }> } };
      const r = await w.axe.run({ include: [['[role="dialog"]']] }, { resultTypes: ["violations"] });
      return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id} (${v.nodes.length})`);
    });
    expect(bad, `${what}: serious or critical axe violations`).toEqual([]);
  };

  test("PIN, sell, cart panel and checkout fit 320px and pass the scan", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("complementary", { name: "Main" }).getByRole("link", { name: "Point of sale" }).click();
    const [till] = await Promise.all([page.waitForEvent("popup"), page.getByRole("button", { name: "Launch" }).click()]);
    page = till;
    await expect(page.getByRole("group", { name: "Enter your PIN" })).toBeVisible();
    await fits(page, "PIN");
    await scan(page, "PIN");
    await page.getByRole("group", { name: "Enter your PIN" }).focus();
    for (const k of "1234") await page.keyboard.press(k);
    await page.getByRole("button", { name: "Add Bike Pump" }).click();
    await fits(page, "sell");
    await scan(page, "sell");
    await page.getByRole("button", { name: "1 item" }).click();
    const cart = page.getByRole("complementary", { name: "Cart" });
    await expect(cart.getByRole("button", { name: /^Charge/ })).toBeInViewport();
    await cart.getByRole("button", { name: /^Charge/ }).click();
    await fits(page, "checkout");
    await scan(page, "checkout");
    await page.getByRole("dialog", { name: "Checkout" }).getByRole("button", { name: "Close" }).click();
    await cart.getByRole("button", { name: "Close cart" }).click();
    await expect(cart.getByRole("button", { name: /^Charge/ })).not.toBeInViewport();
  });

  // Accountant / Store keeper visibility is covered by tests/unit/roles.test.ts (canSee pos = false).
});
