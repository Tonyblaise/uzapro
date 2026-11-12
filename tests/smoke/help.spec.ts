import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 006 · Help (quickstart 1–6). Store data resets on a full page load, so the chat flow
 * moves with in-app links after the first visit.
 */

const REPLY = "Open Reports for the full figures, or search for a record by its ID, for example INV-0355.";
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tabs = (page: Page) => page.getByRole("navigation", { name: "Sections" });
const toast = (page: Page) => page.getByRole("status");
const log = (page: Page) => page.getByRole("log", { name: "Conversation" });
const showing = (page: Page) => page.getByText(/^Showing \d+ of \d+$/);

test("Ask UzaPro shows the seed and answers with the design's reply (quickstart 1–3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Help", exact: true }).click();
  await page.waitForURL("**/help/ask-uzapro");
  await expect(page.getByText("UzaPro assistant")).toBeVisible();
  await expect(log(page).locator("> div")).toHaveCount(3);
  await expect(log(page)).toContainText("How do I issue a credit note?");
  await expect(log(page)).toContainText("Returned items restock automatically.");

  // Enter sends; the box clears; the fixed reply follows.
  const box = page.getByRole("textbox", { name: "Message" });
  await box.fill("Where is my stock?");
  await box.press("Enter");
  await expect(box).toHaveValue("");
  await expect(log(page).locator("> div")).toHaveCount(5);
  await expect(log(page).locator("> div").nth(3)).toHaveText("Where is my stock?");
  await expect(log(page).locator("> div").nth(4)).toHaveText(REPLY);

  // A blank message adds nothing; the Send button also sends.
  await box.fill("   ");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(log(page).locator("> div")).toHaveCount(5);
  await box.fill("And my invoices?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(log(page).locator("> div")).toHaveCount(7);

  // The conversation lasts while moving around the app.
  await nav(page).getByRole("link", { name: "Dashboard" }).click();
  await page.waitForURL("**/dashboard");
  await nav(page).getByRole("link", { name: "Help", exact: true }).click();
  await expect(log(page).locator("> div")).toHaveCount(7);
  await expect(log(page)).toContainText("And my invoices?");
});

test("the Help lists show the design's rows; New and Delete behave as the generic screens (quickstart 4–5)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await page.goto("/help/how-to-guides");
  for (const a of ["Setting up a POS terminal", "How to give a refund", "Reconciling a bank feed"]) await expect(page.getByRole("row").filter({ hasText: a })).toBeVisible();

  await tabs(page).getByRole("link", { name: "Response times", exact: true }).click();
  for (const pct of ["88%", "94%", "97%"]) await expect(page.getByRole("cell", { name: pct, exact: true })).toBeVisible();

  await tabs(page).getByRole("link", { name: "Help requests", exact: true }).click();
  await expect(page.getByRole("row").filter({ hasText: "TKT-1042" })).toContainText("High");
  await expect(page.getByRole("row").filter({ hasText: "TKT-1042" })).toContainText("Open");
  await expect(showing(page)).toHaveText("Showing 3 of 3");

  await page.getByRole("button", { name: "New", exact: true }).click();
  const create = page.getByRole("dialog", { name: "New record" });
  await create.getByLabel("Name").fill("Till drawer stuck");
  await create.getByRole("button", { name: "Create" }).click();
  await expect(toast(page)).toContainText("Record created.");
  await expect(create).toBeHidden();
  await expect(showing(page)).toHaveText("Showing 3 of 3");

  await page.getByRole("row").filter({ hasText: "TKT-1038" }).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("dialog", { name: "Delete TKT-1038?" }).getByRole("button", { name: "Delete" }).click();
  await expect(toast(page)).toContainText("TKT-1038 deleted.");
  await expect(showing(page)).toHaveText("Showing 2 of 2");

  // "New" is also on the chat tab (the design's generic fallback).
  await tabs(page).getByRole("link", { name: "Ask UzaPro", exact: true }).click();
  await expect(page.getByRole("button", { name: "New", exact: true })).toBeVisible();
});

test("the Cashier sees only Ask UzaPro and How-to guides, without Delete (quickstart 6)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  await page.goto("/help/how-to-guides");
  const links = tabs(page).getByRole("link");
  await expect(links).toHaveText(["Ask UzaPro", "How-to guides"]);
  await page.getByRole("row").filter({ hasText: "How to give a refund" }).getByRole("button", { name: "Actions" }).click();
  await expect(page.getByRole("menuitem", { name: "View" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Delete" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.goto("/help/help-requests");
  await page.waitForURL("**/dashboard");
});
