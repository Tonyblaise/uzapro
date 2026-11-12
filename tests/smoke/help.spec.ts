import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 007 · Help Center (quickstart 1–8, analysis C1–C2). Uses only the two articles that ship
 * with the data layer ("How to give a refund", "Reconciling a bank feed"), so the content can grow
 * without breaking these checks.
 */

const HELP = "/help/help-center";
const REFUND = `${HELP}?article=how-to-give-a-refund`;
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tree = (page: Page) => page.getByRole("tree", { name: "Categories" });
const item = (page: Page, name: string) => tree(page).getByRole("treeitem", { name, exact: true });
/** A category's own row (clicking the treeitem's centre could land on one of its children). */
const row = (page: Page, name: string) => tree(page).getByText(name, { exact: true });
const outlineNav = (page: Page) => page.getByRole("navigation", { name: "On this page" });
const crumbs = (page: Page) => page.getByRole("navigation", { name: "Breadcrumb" });
const title = (page: Page, name: string) => page.getByRole("heading", { level: 2, name, exact: true });
const landingTitle = (page: Page) => page.getByRole("heading", { name: "UzaPro Help Center" });
const landingSearch = (page: Page) => page.getByRole("searchbox", { name: "Search help articles" });
const topSearch = (page: Page) => page.getByRole("textbox", { name: "Search", exact: true });

const OUTLINE = [
  "Raise the credit note",
  "Choose how the money goes back",
  "Approve the credit note",
  "Frequently asked questions",
  "Can I refund only part of a sale?",
  "What if the customer never paid?",
  "Where do I see the customer credit?",
  "Need help?",
];

test("Help opens on the Help Center landing page (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Help", exact: true }).click();
  await page.waitForURL(`**${HELP}`);

  // A single tab: no tab strip, and no header button.
  await expect(page.getByRole("navigation", { name: "Sections" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^New\b/ })).toHaveCount(0);

  for (const c of ["Getting started", "Selling", "Stock and products", "Buying", "Money", "Settings"]) {
    await expect(item(page, c)).toHaveAttribute("aria-level", "1");
    await expect(item(page, c)).toHaveAttribute("aria-expanded", "false");
  }
  await expect(landingTitle(page)).toBeVisible();
  await expect(page.getByText("Search our guides and documentation to learn how to use UzaPro.")).toBeVisible();
  await expect(landingSearch(page)).toHaveAttribute("placeholder", "Search help articles and answers…");
  await expect(page.getByText("Browse categories in the sidebar, or type to search.")).toBeVisible();
  await expect(page.getByText("That article was not found.")).toHaveCount(0);
});

test("browsing to an article shows breadcrumbs, title, updated line and outline; the outline jumps (quickstart 2–3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto(HELP);

  // Expand and collapse a category.
  await row(page, "Selling").click();
  await expect(item(page, "Selling")).toHaveAttribute("aria-expanded", "true");
  await item(page, "How to give a refund").click();
  await page.waitForURL(`**${REFUND}`);

  await expect(crumbs(page).getByRole("link", { name: "Help Center" })).toBeVisible();
  await expect(crumbs(page).getByRole("link", { name: "Selling" })).toBeVisible();
  await expect(crumbs(page).getByText("How to give a refund")).toHaveAttribute("aria-current", "page");
  await expect(title(page, "How to give a refund")).toBeVisible();
  await expect(page.getByText("Updated 2 months ago")).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Raise the credit note" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 4, name: "Can I refund only part of a sale?" })).toBeVisible();

  // The article and its category are highlighted.
  await expect(item(page, "How to give a refund")).toHaveAttribute("aria-selected", "true");
  await expect(item(page, "Selling")).toHaveAttribute("aria-selected", "true");

  await expect(outlineNav(page).getByRole("link")).toHaveText(OUTLINE);

  // Outline jump: the heading scrolls into view, the hash updates and the entry is current.
  await outlineNav(page).getByRole("link", { name: "Where do I see the customer credit?" }).click();
  await expect(page).toHaveURL(/#where-do-i-see-the-customer-credit$/);
  await expect(page.getByRole("heading", { name: "Where do I see the customer credit?" })).toBeInViewport();
  await expect(outlineNav(page).getByRole("link", { name: "Where do I see the customer credit?" })).toHaveAttribute("aria-current", "location");

  // Breadcrumbs: the category opens the landing page with it expanded; Help Center goes home.
  await crumbs(page).getByRole("link", { name: "Selling" }).click();
  await page.waitForURL(`**${HELP}?cat=selling`);
  await expect(landingTitle(page)).toBeVisible();
  await expect(item(page, "Selling")).toHaveAttribute("aria-expanded", "true");
  await row(page, "Selling").click();
  await expect(item(page, "Selling")).toHaveAttribute("aria-expanded", "false");
  await page.goto(REFUND);
  await crumbs(page).getByRole("link", { name: "Help Center" }).click();
  await expect(landingTitle(page)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${HELP}$`));
});

test("deep links open the article with its category expanded; an unknown article shows a note (quickstart 4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto(REFUND);
  await expect(title(page, "How to give a refund")).toBeVisible();
  await expect(item(page, "Selling")).toHaveAttribute("aria-expanded", "true");
  await expect(item(page, "How to give a refund")).toHaveAttribute("aria-current", "page");

  await page.goto(`${HELP}?article=nope`);
  await expect(page.getByText("That article was not found.")).toBeVisible();
  await expect(landingTitle(page)).toBeVisible();
});

test("the landing search lists matches and opens one, clearing the search (quickstart 5)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto(HELP);
  await landingSearch(page).fill("refund");
  const first = page.getByRole("listitem").filter({ has: page.getByRole("link") }).getByRole("link").first();
  await expect(page.getByRole("heading", { name: /^\d+ articles? match(es)? “refund”$/ })).toBeVisible();
  await expect(first).toContainText("How to give a refund");
  await expect(first).toContainText("Selling");
  await first.click();
  await page.waitForURL(`**${REFUND}`);
  await expect(title(page, "How to give a refund")).toBeVisible();
  await expect(topSearch(page)).toHaveValue("");

  await page.goto(HELP);
  await landingSearch(page).fill("zzz");
  await expect(page.getByText("No articles match that search.")).toBeVisible();
  await landingSearch(page).fill("   ");
  await expect(page.getByText("Browse categories in the sidebar, or type to search.")).toBeVisible();
});

test("the top search bar searches help articles (quickstart 6)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto(`${HELP}?article=reconciling-a-bank-feed`);
  await expect(title(page, "Reconciling a bank feed")).toBeVisible();
  await topSearch(page).fill("credit");
  await expect(title(page, "Reconciling a bank feed")).toHaveCount(0);
  const result = page.getByRole("link", { name: /^How to give a refund/ });
  await expect(result).toBeVisible();
  await result.click();
  await page.waitForURL(`**${REFUND}`);
  await expect(title(page, "How to give a refund")).toBeVisible();
  await expect(topSearch(page)).toHaveValue("");
});

test("the sidebar filter narrows the tree and clearing it restores the tree (quickstart 7)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto(HELP);
  await row(page, "Selling").click();
  await expect(item(page, "How to give a refund")).toBeVisible();

  await page.getByRole("button", { name: "Filter categories" }).click();
  const filter = page.getByRole("textbox", { name: "Filter help articles" });
  await filter.fill("deposit");
  await expect(item(page, "Money")).toHaveAttribute("aria-expanded", "true");
  await expect(item(page, "Reconciling a bank feed")).toBeVisible();
  await expect(item(page, "Selling")).toHaveCount(0);
  await expect(item(page, "How to give a refund")).toHaveCount(0);

  await filter.fill("");
  await expect(item(page, "Selling")).toHaveAttribute("aria-expanded", "true");
  await expect(item(page, "How to give a refund")).toBeVisible();
  await expect(item(page, "Money")).toHaveAttribute("aria-expanded", "false");
  await expect(item(page, "Reconciling a bank feed")).toHaveCount(0);
});

test("screen links open the app screen, and are plain text when the role can't see it (quickstart 8)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto(REFUND);
  await page.getByRole("link", { name: "Open Sales › Refunds (credit notes)" }).click();
  await page.waitForURL("**/sales/refunds-credit-notes");
  await expect(page.getByRole("link", { name: "Refunds (credit notes)", exact: true })).toHaveAttribute("aria-current", "page");
});

test("as the Cashier, the Accounts › Transactions link is plain text (quickstart 8)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  await page.goto(REFUND);
  await expect(title(page, "How to give a refund")).toBeVisible();
  await expect(page.getByText("Open Accounts › Transactions", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Accounts › Transactions" })).toHaveCount(0);
});

test("the tree works from the keyboard (analysis C1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto(HELP);
  await item(page, "Getting started").focus();
  await page.keyboard.press("ArrowDown");
  await expect(item(page, "Selling")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(item(page, "Selling")).toHaveAttribute("aria-expanded", "true");

  // Down through Selling's children until the refund article has focus.
  const refund = item(page, "How to give a refund");
  for (let i = 0; i < 10 && !(await refund.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("ArrowDown");
  await expect(refund).toBeFocused();

  // Left steps back to the parent; Left again collapses it; Right expands it again.
  await page.keyboard.press("ArrowLeft");
  await expect(item(page, "Selling")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(item(page, "Selling")).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("ArrowRight");
  await expect(item(page, "Selling")).toHaveAttribute("aria-expanded", "true");

  for (let i = 0; i < 10 && !(await refund.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForURL(`**${REFUND}`);
  await expect(title(page, "How to give a refund")).toBeVisible();
});

test("back returns to the previous article (analysis C2)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto(REFUND);
  await expect(title(page, "How to give a refund")).toBeVisible();
  await page.getByRole("complementary", { name: "Related articles" }).getByRole("link", { name: "Reconciling a bank feed" }).click();
  await page.waitForURL(`**${HELP}?article=reconciling-a-bank-feed`);
  await expect(title(page, "Reconciling a bank feed")).toBeVisible();
  await page.goBack();
  await page.waitForURL(`**${REFUND}`);
  await expect(title(page, "How to give a refund")).toBeVisible();
});
