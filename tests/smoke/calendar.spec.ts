import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 005 · Calendar (quickstart 1–3). Store data resets on a full page load, so each flow logs
 * in once and moves with in-app links. The calendar's "today" is 1 Nov 2026 (Clarification Q2).
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const toast = (page: Page) => page.getByRole("status");
const day = (page: Page, iso: string) => page.locator(`[data-date="${iso}"]`);
const comingUp = (page: Page) => page.getByRole("region", { name: "Coming up" });

async function openCalendar(page: Page, role: "owner" | "cashier" = "owner") {
  await loginAs(page, role);
  await nav(page).getByRole("link", { name: "Calendar" }).click();
  await expect(page).toHaveURL(/\/calendar\/calendar$/);
  await expect(page.getByRole("heading", { name: "November 2026" })).toBeVisible();
}

test("November 2026 shows the seed events and adds an event on a day (quickstart 1)", async ({ page, errors }) => {
  void errors;
  await openCalendar(page);
  // Monday-first grid; 1 Nov 2026 is a Sunday, so the grid opens on Mon 26 Oct.
  await expect(page.locator("[data-date]").first()).toHaveAttribute("data-date", "2026-10-26");
  await expect(day(page, "2026-11-12").getByRole("button", { name: "Team meeting" })).toBeVisible();
  await expect(day(page, "2026-11-20").getByRole("button", { name: "VAT return due" })).toBeVisible();
  await expect(day(page, "2026-11-24").getByRole("button", { name: "Black Friday SMS goes out" })).toBeVisible();
  // Today's dot is on 1 Nov.
  await expect(day(page, "2026-11-01").getByRole("button", { name: "Add an event on 1 November 2026" })).toHaveClass(/bg-action/);

  // "Coming up": the first 5 events on or after 1 Nov, starting with the statement reminder.
  const up = comingUp(page).getByRole("button");
  await expect(up).toHaveCount(5);
  await expect(up.first()).toContainText("1 Nov 2026");
  await expect(up.first()).toContainText("Statement reminder email");

  // Month navigation and "Today".
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByRole("heading", { name: "December 2026" })).toBeVisible();
  await expect(day(page, "2026-12-31").getByRole("button", { name: "Eastside Bicycle bill due" })).toBeVisible();
  await page.getByRole("button", { name: "Previous month" }).click();
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(page.getByRole("heading", { name: "October 2026" })).toBeVisible();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await expect(page.getByRole("heading", { name: "November 2026" })).toBeVisible();

  // Add "Supplier visit" on 20 Nov from the day itself.
  await page.getByRole("button", { name: "Add an event on 20 November 2026" }).click();
  const form = page.getByRole("dialog", { name: "New event" });
  await expect(form.getByLabel("Start date")).toHaveValue("2026-11-20");
  await expect(form.getByLabel("End date")).toHaveValue("2026-11-20");
  const save = form.getByRole("button", { name: "Save", exact: true });
  await expect(save).toBeDisabled();
  await form.getByLabel("What is happening?").fill("Supplier visit");
  await expect(save).toBeEnabled();
  await save.click();
  await expect(toast(page)).toContainText("Event saved.");
  const details = page.getByRole("dialog", { name: "Event details" });
  await expect(details).toContainText("Supplier visit");
  await expect(details).toContainText("Event start: 20 November 2026");
  await details.getByRole("button", { name: "Close" }).click();
  await expect(details).toBeHidden();
  await expect(day(page, "2026-11-20").getByRole("button", { name: "Supplier visit" })).toBeVisible();

  // The header's "New event" starts on 1 Nov 2026.
  await page.getByRole("button", { name: "New event" }).click();
  await expect(page.getByRole("dialog", { name: "New event" }).getByLabel("Start date")).toHaveValue("2026-11-01");
});

test("Edit Team meeting to 15:00, then delete it (quickstart 2)", async ({ page, errors }) => {
  void errors;
  await openCalendar(page);
  await day(page, "2026-11-12").getByRole("button", { name: "Team meeting" }).click();
  const details = page.getByRole("dialog", { name: "Event details" });
  await expect(details).toContainText("Event start: 12 November 2026 at 2:00 PM");
  await details.getByRole("button", { name: "Edit" }).click();

  const form = page.getByRole("dialog", { name: "Edit event" });
  await expect(form.getByLabel("What is happening?")).toHaveValue("Team meeting");
  await form.getByLabel("Start time (optional)").fill("15:00");
  await form.getByRole("button", { name: "Save", exact: true }).click();
  await expect(toast(page)).toContainText("Event saved.");
  await expect(details).toContainText("Event start: 12 November 2026 at 3:00 PM");

  // Cancel on the delete confirmation returns to the details.
  await details.getByRole("button", { name: "Delete" }).click();
  const confirm = page.getByRole("dialog", { name: "Delete Team meeting?" });
  await expect(confirm).toContainText("This permanently deletes the event.");
  await confirm.getByRole("button", { name: "Cancel" }).click();
  await expect(details).toBeVisible();

  await details.getByRole("button", { name: "Delete" }).click();
  await confirm.getByRole("button", { name: "Delete" }).click();
  await expect(toast(page)).toContainText("Team meeting deleted.");
  await expect(confirm).toBeHidden();
  await expect(day(page, "2026-11-12").getByRole("button", { name: "Team meeting" })).toHaveCount(0);
});

test("The Cashier does not see Accounts events (quickstart 3)", async ({ page, errors }) => {
  void errors;
  await openCalendar(page, "cashier");
  await expect(day(page, "2026-11-12").getByRole("button", { name: "Team meeting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "VAT return due" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Staff pay day" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Road & Travel Tyres bill due" })).toHaveCount(0);
  await expect(comingUp(page)).not.toContainText("VAT return due");
  await expect(comingUp(page).getByRole("button")).toHaveCount(5);
});
