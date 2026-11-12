import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 009 · Run Reports (quickstart 1–7). Store data resets on a full page load, so the
 * live-figure flow logs in once and then moves with in-app links.
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const cards = (page: Page) => page.getByRole("list", { name: "Reports" }).getByRole("listitem");
const heading = (page: Page, name: string) => page.getByRole("heading", { level: 2, name, exact: true });
const kpi = (page: Page, label: string) => page.getByRole("list", { name: "Key figures" }).getByRole("listitem").filter({ hasText: label });
const kpiValue = async (page: Page, label: string) => Number(((await kpi(page, label).locator("div").nth(1).textContent()) ?? "").replace(/[^0-9.−-]/g, "").replace("−", "-"));
const back = (page: Page) => page.getByRole("button", { name: "All reports" });

async function choose(scope: Locator | Page, picker: string | RegExp, option: string) {
  await scope.getByRole("button", typeof picker === "string" ? { name: picker, exact: true } : { name: picker }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

async function runReport(page: Page, name: string) {
  await page.getByRole("button", { name: `Run ${name}` }).click();
  await expect(heading(page, name)).toBeVisible();
}

test("cards run reports; back, history and reload work (quickstart 1–3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/reports/popular");
  await expect(cards(page)).toHaveCount(8);
  await expect(cards(page).first()).toContainText("Total sales, orders and refunds");
  await expect(page.getByRole("button", { name: /^Run / })).toHaveCount(7);
  const soon = cards(page).filter({ hasText: "Production yield" });
  await expect(soon).toContainText("Not available yet");
  await expect(soon.getByRole("button", { name: "Coming soon" })).toBeDisabled();

  // Cards in a row share a height.
  const heights = await cards(page).evaluateAll((els) => els.slice(0, 4).map((e) => Math.round(e.getBoundingClientRect().height)));
  expect(new Set(heights).size).toBe(1);

  await runReport(page, "Sales summary");
  await expect(page).toHaveURL(/report=sales-summary/);
  await expect(page.getByText("This month · 1 Nov 2026 to 10 Nov 2026")).toBeVisible();
  await expect(page.getByRole("list", { name: "Key figures" }).getByRole("listitem")).toHaveCount(4);
  await expect(kpi(page, "Total sales")).toContainText("KES 4,820,000");
  await expect(kpi(page, "Total sales")).toContainText("1,100 orders");
  const body = page.getByRole("table").getByRole("row");
  await expect(body).toHaveCount(5);
  await expect(body.nth(1)).toContainText("POS");
  await expect(body.nth(4)).toContainText("Total");
  await expect(body.nth(4).getByText("4,820,000")).toHaveClass(/font-semibold/);

  await back(page).click();
  await expect(cards(page)).toHaveCount(8);
  await runReport(page, "Balance sheet");
  await page.goBack();
  await expect(cards(page)).toHaveCount(8);
  await page.goForward();
  await expect(heading(page, "Balance sheet")).toBeVisible();
  await page.reload();
  await expect(heading(page, "Balance sheet")).toBeVisible();

  for (const bad of ["nope", "production-yield"]) {
    await page.goto(`/reports/popular?report=${bad}`);
    await expect(cards(page)).toHaveCount(8);
  }
});

test("the period picker re-runs period reports; point-in-time reports have none (quickstart 4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/reports/money");
  await runReport(page, "Profit & loss");
  await choose(page, /^Period: /, "This year");
  await expect(page.getByText("This year · 1 Jan 2026 to 10 Nov 2026")).toBeVisible();
  await expect(kpi(page, "Sales")).toContainText("KES 38,600,000");
  await expect(page).toHaveURL(/period=this-year/);

  await back(page).click();
  await runReport(page, "Balance sheet");
  await expect(page.getByText("As at 10 Nov 2026")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Period/ })).toHaveCount(0);

  // The next run starts on the period last chosen.
  await back(page).click();
  await runReport(page, "Cash flow");
  await expect(page.getByText(/^This year · /)).toBeVisible();
});

test("every report runs; Coming soon cannot (quickstart 5)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/reports/popular");
  for (const t of ["Sales", "Money", "Stock"]) {
    await tab(page, t);
    await page.waitForURL(`**/reports/${t.toLowerCase()}`);
    const names = (await page.getByRole("button", { name: /^Run / }).evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!.replace(/^Run /, "")))) as string[];
    for (const name of names) {
      await runReport(page, name);
      await expect(page.getByRole("table").or(page.getByText(/^No .* in this period\.$/)).first()).toBeVisible();
      await back(page).click();
    }
  }
  await expect(cards(page).filter({ hasText: "Reorder forecast" }).getByRole("button", { name: "Coming soon" })).toBeDisabled();
});

test("reports follow payments, expenses and credit notes recorded in the demo (quickstart 6)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");

  // A credit note on a new sale (in-app navigation keeps the demo data).
  await page.goto("/sales/all-sales?action=new");
  const drawer = page.getByRole("dialog").last();
  await choose(drawer, "Customer", "Morningview Bicycles");
  await choose(drawer, "Product", "Bike Pump");
  await drawer.getByLabel("Number of units").fill("2");
  await drawer.getByRole("button", { name: "Add to sale" }).click();
  await drawer.getByRole("button", { name: "Record sale" }).click();
  await expect(page.getByText(/^Sale recorded\./)).toBeVisible();
  await page.getByRole("row").nth(1).click();
  await page.getByRole("dialog").last().getByRole("button", { name: "Credit note" }).click();
  await page.getByRole("dialog").last().getByText("I confirm these items and amounts.").click();
  await page.getByRole("dialog").last().getByRole("button", { name: "Raise credit note" }).click();
  await expect(page.getByText(/^CRN-0008 raised/)).toBeVisible();
  await page.getByRole("dialog").last().getByRole("button", { name: "Close" }).click();

  // Baselines.
  await nav(page).getByRole("link", { name: "Reports" }).click();
  await runReport(page, "Customer statements");
  const owed0 = await kpiValue(page, "Total owed");
  await back(page).click();
  await tab(page, "Money");
  await runReport(page, "Cash flow");
  const in0 = await kpiValue(page, "Money in");
  await back(page).click();
  await runReport(page, "VAT return");
  const claim0 = await kpiValue(page, "VAT you can claim");

  // Pay RCV-0011 and record a KES 2,000 Transport expense.
  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await tab(page, "Receivables");
  await page.getByRole("row").filter({ hasText: "RCV-0011" }).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Record payment" }).click();
  const pay = page.getByRole("dialog", { name: "Record payment" });
  await pay.getByRole("button", { name: "Pay full balance" }).click();
  await choose(pay, "Payment method", "Bank transfer");
  await choose(pay, "Paid into", "Equity Bank — Main");
  await pay.getByRole("button", { name: "Save payment" }).click();
  await expect(pay).toBeHidden();
  await nav(page).getByRole("link", { name: "Expenses" }).click();
  await page.getByRole("button", { name: "Record expenses" }).click();
  const exp = page.getByRole("dialog", { name: "Record expenses" });
  await choose(exp, "Category", "Transport");
  await choose(exp, "Payment account", "Cash drawer");
  await exp.getByLabel("Amount (KES)", { exact: true }).fill("2000");
  await exp.getByRole("button", { name: "Save 1 expense" }).click();
  await expect(exp).toBeHidden();

  await nav(page).getByRole("link", { name: "Reports" }).click();
  await runReport(page, "Customer statements");
  expect(await kpiValue(page, "Total owed")).toBe(owed0 - 1026);
  await back(page).click();
  await tab(page, "Money");
  await runReport(page, "Aged receivables");
  expect(await kpiValue(page, "Total owed")).toBe(owed0 - 1026);
  await back(page).click();
  await runReport(page, "Cash flow");
  expect(await kpiValue(page, "Money in")).toBe(in0 + 1026);
  await back(page).click();
  await runReport(page, "VAT return");
  expect(await kpiValue(page, "VAT you can claim")).toBeGreaterThanOrEqual(claim0);
  await back(page).click();
  await runReport(page, "Profit & loss");
  await expect(page.getByRole("row").filter({ hasText: "Transport" })).toContainText("−2,000");
  await expect(kpi(page, "Expenses")).toContainText("KES 187,000");
  await tab(page, "Sales");
  await runReport(page, "Returns & refunds");
  await expect(page.getByRole("row").filter({ hasText: "CRN-0008" })).toBeVisible();
  await expect(kpi(page, "Credit notes")).toContainText("1");
});

test("Export CSV copies the report (quickstart 7)", async ({ page, context, errors }) => {
  void errors;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await loginAs(page, "owner");
  await page.goto("/reports/sales");
  await runReport(page, "Sales summary");
  await page.getByRole("button", { name: "Export CSV" }).click();
  await expect(page.getByRole("status").filter({ hasText: /\S/ })).toHaveText("Copied Sales summary as CSV.");
  const csv = await page.evaluate(() => navigator.clipboard.readText());
  const lines = csv.split("\n");
  expect(lines).toHaveLength(5);
  expect(lines[0]).toBe('"Channel","Orders","Sales (KES)","Average order (KES)","Share"');
  expect(lines[4]).toMatch(/^"Total","1,100",4820000,/);
});
