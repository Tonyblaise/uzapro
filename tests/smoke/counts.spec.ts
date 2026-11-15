import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/** Feature 025 · stock counts as in the design (`UZ_COUNTS`, `scVals`). Data resets on a full page load. */

const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });

async function pick(scope: ReturnType<Page["getByRole"]>, page: Page, label: string, option: string) {
  await scope.getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function openCounts(page: Page) {
  await nav(page).getByRole("link", { name: "Stock", exact: true }).click();
  await tab(page, "Stock counts");
}

test("the list shows the design's counts; a blind count hides its values", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/stock-counts");
  for (const text of ["Main Store", "Parts", "Grant Jensen", "Hidden", "Counting"]) await expect(row(page, "SC-0015")).toContainText(text);
  for (const text of ["Point of Sale", "Everything", "Jane Smith", "2", "Waiting approval"]) await expect(row(page, "SC-0014")).toContainText(text);
  await expect(row(page, "SC-0013")).toContainText("Approved");
});

test("start a blind category count, count it, submit, send back, recount and approve", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openCounts(page);
  await page.getByRole("button", { name: "New stock count" }).click();
  const form = page.getByRole("dialog", { name: "New stock count" });
  await form.getByRole("button", { name: /One category/ }).click();
  await form.getByRole("button", { name: "Start counting" }).click();
  await expect(form.getByRole("alert")).toHaveText("Pick the category.");
  await pick(form, page, "Category", "Apparel");
  await expect(form).toContainText("lines to count in Main Store");
  await form.getByRole("button", { name: "Start counting" }).click();

  const view = page.getByRole("dialog", { name: "Stock count SC-0016" });
  await expect(view).toContainText("Main Store · Apparel · counted by Tony Blaise");
  await expect(view).toContainText("Differences show after you submit");
  await expect(view.getByRole("cell", { name: "Hidden" }).first()).toBeVisible();

  // Count Helmet one over with +, Carbon Sole Shoes by typing; submit refuses until all are counted.
  await view.getByRole("button", { name: "Submit for approval" }).click();
  await expect(toast(page)).toContainText("not counted yet. Count them, even if the answer is 0.");
  await expect(view.getByRole("button", { name: /^Not counted/ })).toHaveAttribute("aria-pressed", "true");
  await view.getByRole("button", { name: /^All/ }).click();
  await view.getByRole("switch", { name: "Blind count" }).click(); // show the system figures to count against
  const system = async (product: string) => Number((await row(page, product).getByRole("cell").nth(1).innerText()).trim());
  const helmets = await system("Helmet");
  const shoes = await system("Carbon Sole Shoes");
  await view.getByLabel("Counted quantity for Helmet").fill(String(helmets));
  await view.getByRole("button", { name: "More Helmet" }).click();
  await view.getByLabel("Counted quantity for Carbon Sole Shoes").fill(String(shoes));
  await view.getByLabel("Note for Helmet").fill("One extra");
  await expect(row(page, "Helmet")).toContainText("+1");
  await expect(row(page, "Carbon Sole Shoes")).toContainText("Matches");
  await expect(view).toContainText("Everything is counted. Submit it for approval.");
  await view.getByRole("button", { name: "Submit for approval" }).click();
  await expect(toast(page)).toHaveText("SC-0016 sent for approval.");
  await expect(view).toContainText("Check the differences, then approve to update stock, or send it back.");

  await view.getByRole("button", { name: "Send back to recount" }).click();
  await expect(toast(page)).toHaveText("Lines with differences cleared for recount.");
  await view.getByRole("button", { name: /^All/ }).click();
  await expect(view.getByLabel("Counted quantity for Helmet")).toHaveValue("");
  await expect(view.getByLabel("Counted quantity for Carbon Sole Shoes")).toHaveValue(String(shoes));
  await view.getByLabel("Counted quantity for Helmet").fill(String(helmets + 1));
  await view.getByRole("button", { name: "Submit for approval" }).click();
  await view.getByRole("button", { name: "Approve and update stock" }).click();
  await expect(toast(page)).toHaveText("SC-0016 approved. Stock updated.");
  await expect(view).toContainText("Stock was updated on 10 Nov 2026");
  await expect(view).toContainText("Approved. Stock updated for 1 lines");
  await view.getByRole("button", { name: "Close" }).first().click();
  await expect(row(page, "SC-0016")).toContainText("Approved");

  await tab(page, "Stock management");
  await page.getByLabel("Search this list").fill("Helmet");
  await expect(row(page, "Main Store").first()).toContainText(String(helmets + 1));
});

test("cancel a count; a role without the approve right can count but not approve", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/stock/stock-counts?view=SC-0015");
  const view = page.getByRole("dialog", { name: "Stock count SC-0015" });
  await view.getByRole("button", { name: "Cancel count" }).click();
  await expect(toast(page)).toHaveText("SC-0015 cancelled.");
  await expect(view).toContainText("Count cancelled. Stock not changed");
  await view.getByRole("button", { name: "Close" }).first().click();

  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption("store");
  await page.waitForURL("**/dashboard");
  await openCounts(page);
  await row(page, "SC-0014").click();
  const review = page.getByRole("dialog", { name: "Stock count SC-0014" });
  await expect(review).toContainText("Waiting approval");
  await expect(review.getByRole("button", { name: "Approve and update stock" })).toHaveCount(0);
  await expect(review.getByRole("button", { name: "Cancel count" })).toHaveCount(0);
});
