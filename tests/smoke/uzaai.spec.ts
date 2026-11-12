import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 008 · Uza AI (quickstart 1–12). Store data resets on a full page load, so each flow logs
 * in once and then moves with in-app links.
 */

const launcher = (page: Page) => page.getByRole("button", { name: "Open Uza AI" });
const panel = (page: Page) => page.getByRole("dialog", { name: "Uza AI and help" });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const composer = (page: Page) => panel(page).getByRole("textbox", { name: "Message to Uza AI" });
/** The newest Uza AI reply bubble (left-hand, after the typing pause). */
const lastReply = (page: Page) => panel(page).locator(".justify-start .bg-canvas").last();

async function choose(scope: Locator | Page, picker: string, option: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

async function ask(page: Page, text: string) {
  await composer(page).fill(text);
  await composer(page).press("Enter");
  await expect(panel(page).getByLabel("Uza AI is typing")).toBeHidden();
}

async function openPanel(page: Page) {
  await launcher(page).click();
  await expect(panel(page)).toBeVisible();
}

test("launcher opens a new chat; answers come from live data with actions (quickstart 1–2, 4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await expect(launcher(page)).toBeVisible();
  await launcher(page).hover();
  await expect(launcher(page).locator(".uz-fab-tip")).toHaveCSS("opacity", "1");
  await openPanel(page);
  await expect(launcher(page)).toHaveCount(0);
  for (const t of ["Uza AI", "Support", "Features"]) await expect(panel(page).getByRole("tab", { name: t })).toBeVisible();
  await expect(panel(page).getByText("Chat with Uza AI")).toBeVisible();
  await expect(panel(page).getByText("Viewing: Dashboard")).toBeVisible();

  await panel(page).getByRole("button", { name: "Overdue invoices" }).click();
  await expect(panel(page).getByLabel("Uza AI is typing")).toBeVisible();
  await expect(lastReply(page)).toHaveText(
    "2 invoices are overdue, worth KES 46,626:\n• Morningview Bicycles, KES 45,600 (due 27 Feb 2026)\n• Blazing Cycle Trails, KES 1,026 (due 31 May 2026)\n\nIn total customers owe you KES 127,026.",
  );
  await expect(panel(page).getByRole("heading", { name: "Overdue invoices" })).toBeVisible();

  await ask(page, "What stock is running low?");
  await expect(lastReply(page)).toContainText("3 items need restocking:");
  await expect(lastReply(page)).toContainText("• Laser Printer at Office: 0 left (reorder at 5)");
  await ask(page, "How do I give a refund?");
  await expect(lastReply(page)).toContainText("Go to Sales › Refunds (credit notes)");
  await ask(page, "sales today");
  await expect(lastReply(page)).toHaveText("Sales so far: KES 184K today, KES 1.12M this week and KES 4.82M this month.");
  await ask(page, "hello");
  await expect(lastReply(page)).toHaveText("Hi Tony. What can I help you with? You can ask about sales, stock, money owed, expenses, or report a problem.");
  await ask(page, "what's the weather");
  await expect(lastReply(page)).toContainText('Try asking "Which invoices are overdue?"');

  // Shift+Enter adds a line; the counter tracks the draft.
  await composer(page).fill("one");
  await composer(page).press("Shift+Enter");
  await expect(composer(page)).toHaveValue("one\n");
  await expect(panel(page).getByText("4 / 4,000")).toBeVisible();
  await composer(page).fill("");
  await expect(panel(page).getByRole("button", { name: "Send" })).toBeDisabled();

  // The first answer's action opens Receivables › Receivables and the label follows the screen.
  await panel(page).getByRole("button", { name: "Open Receivables" }).first().click();
  await page.waitForURL("**/receivables/receivables");
  await expect(panel(page).getByText("Viewing: Receivables")).toBeVisible();

  // Escape closes and focus returns to the launcher (FR-003).
  await page.keyboard.press("Escape");
  await expect(panel(page)).toBeHidden();
  await expect(launcher(page)).toBeFocused();
});

test("answers follow changes made in the session (quickstart 3, SC-003)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Receivables" }).click();
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Receivables", exact: true }).click();
  const r = page.getByRole("row").filter({ hasText: "RCV-0011" });
  await r.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Record payment" }).click();
  const pay = page.getByRole("dialog", { name: "Record payment" });
  await pay.getByRole("button", { name: "Pay full balance" }).click();
  await choose(pay, "Payment method", "Bank transfer");
  await choose(pay, "Paid into", "Equity Bank — Main");
  await pay.getByRole("button", { name: "Save payment" }).click();
  await expect(pay).toBeHidden();

  await nav(page).getByRole("link", { name: "Expenses" }).click();
  await page.waitForURL("**/expenses/overview");
  await page.getByRole("button", { name: "Record expenses" }).click();
  const exp = page.getByRole("dialog", { name: "Record expenses" });
  await choose(exp, "Category", "Transport");
  await choose(exp, "Payment account", "Cash drawer");
  await exp.getByLabel("Amount (KES)", { exact: true }).fill("2000");
  await exp.getByRole("button", { name: "Save 1 expense" }).click();
  await expect(exp).toBeHidden();

  await openPanel(page);
  await ask(page, "who owes me money");
  await expect(lastReply(page)).toContainText("1 invoice is overdue, worth KES 45,600:");
  await ask(page, "how much did I spend");
  await expect(lastReply(page)).toHaveText("You have spent KES 187,000 on 2 paid expenses this month. 1 expense is waiting for approval.");
});

test("files attach by name only; sign out closes the panel (edge cases, quickstart 12)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openPanel(page);
  const file = { name: "receipt.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") };
  await panel(page).getByLabel("Attach a file").setInputFiles(file);
  await expect(panel(page).getByText("receipt.pdf")).toBeVisible();
  await panel(page).getByRole("button", { name: "Remove file" }).click();
  await expect(panel(page).getByText("receipt.pdf")).toHaveCount(0);
  await panel(page).getByLabel("Attach a file").setInputFiles(file);
  await panel(page).getByRole("button", { name: "Send" }).click();
  await expect(panel(page).getByText("Sent a file")).toBeVisible();
  await expect(lastReply(page)).toHaveText("I got receipt.pdf. I can't read files yet, but you can attach it to a support request or an expense.");

  // The open panel covers the account menu at this width, so dispatch the clicks directly.
  await page.getByRole("button", { name: /Tony Blaise/ }).dispatchEvent("click");
  await page.getByRole("menuitem", { name: "Sign out" }).dispatchEvent("click");
  await page.waitForURL("**/login");
  await expect(launcher(page)).toHaveCount(0);
  await page.getByLabel("Email or phone number").fill("demo@uzapro.com");
  await page.getByLabel("Password", { exact: true }).fill("demo@123");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");
  await expect(launcher(page)).toBeVisible();
  await expect(panel(page)).toHaveCount(0);
});

test("answers are limited by role (quickstart 5, Clarification Q1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "cashier");
  await openPanel(page);
  await ask(page, "who owes me money");
  await expect(lastReply(page)).toHaveText("You don't have access to Receivables. Ask the business owner.");
  await expect(panel(page).getByRole("button", { name: "Open Receivables" })).toHaveCount(0);
  await ask(page, "low stock");
  await expect(lastReply(page)).toHaveText("You don't have access to Stock. Ask the business owner.");
  await ask(page, "How do I give a refund?");
  await expect(panel(page).getByRole("button", { name: "Open Refunds" })).toBeEnabled();

  // The seeded chat's action for a hidden screen is disabled (analysis C4).
  await panel(page).getByRole("button", { name: "All chats" }).click();
  await panel(page).getByRole("button", { name: /Which customers owe me money\?/ }).click();
  const action = panel(page).getByRole("button", { name: "Open Receivables" });
  await expect(action).toBeDisabled();
  await expect(action).toHaveAttribute("title", "Not available for your role");
});

test("chat list groups, filters and reopens past chats (quickstart 6)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openPanel(page);
  await panel(page).getByRole("button", { name: "All chats" }).click();
  await expect(panel(page).getByText("Your business helper in UzaPro")).toBeVisible();
  const recent = panel(page).getByRole("region", { name: "Last 7 days" });
  const older = panel(page).getByRole("region", { name: "Older" });
  await expect(recent.getByRole("button")).toHaveText(["Which customers owe me money?3d"]);
  await expect(older.getByRole("button")).toHaveText(["How do I give a refund?2w", "Receipt printer stopped printing4w"]);
  await panel(page).getByRole("button", { name: "Last 7 days" }).click();
  await expect(older).toHaveCount(0);
  await panel(page).getByRole("button", { name: "All", exact: true }).click();

  await older.getByRole("button", { name: /How do I give a refund\?/ }).click();
  await expect(panel(page).getByRole("button", { name: "Open Refunds" })).toBeVisible();
  await ask(page, "and for invoices?");
  await panel(page).getByRole("button", { name: "All chats" }).click();
  // The design keeps list order and only re-dates the chat, so it joins "Last 7 days" as "Today".
  await expect(recent.getByRole("button")).toHaveText(["Which customers owe me money?3d", "How do I give a refund?Today"]);
  await panel(page).getByRole("button", { name: "New", exact: true }).click();
  await expect(panel(page).getByText("Chat with Uza AI")).toBeVisible();
});

test("a reported problem becomes a ticket; Support lists, replies and raises requests (quickstart 7–8)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Sales" }).click();
  await openPanel(page);
  await panel(page).getByRole("button", { name: "Report a problem" }).click();
  await expect(lastReply(page)).toContainText("Sorry about that. Tell me what went wrong");
  await ask(page, "The till won't print receipts");
  await expect(lastReply(page)).toContainText("I logged this as TKT-1043 and sent it to the support team.");
  await panel(page).getByRole("button", { name: "Open TKT-1043" }).click();
  await expect(panel(page).getByRole("heading", { name: "The till won't print receipts" })).toBeVisible();
  await expect(panel(page).getByText(/\(Reported from Sales/)).toBeVisible();
  await expect(panel(page).getByText("Thanks, we've got your request. Someone from the team will reply here within 4 hours.")).toBeVisible();

  await panel(page).getByRole("button", { name: "Back" }).click();
  const cards = panel(page).getByRole("button", { name: /^TKT-/ });
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toContainText("TKT-1043");
  await expect(cards.nth(3)).toContainText("TKT-1038");

  await panel(page).getByRole("button", { name: /TKT-1038/ }).click();
  await expect(panel(page).getByText("This is fixed now. Let us know here if it happens again.")).toBeVisible();
  await expect(panel(page).getByRole("textbox", { name: "Reply" })).toHaveCount(0);
  await panel(page).getByRole("button", { name: "Back" }).click();
  await panel(page).getByRole("button", { name: /TKT-1041/ }).click();
  await panel(page).getByRole("textbox", { name: "Reply" }).fill("Any update?");
  await panel(page).getByRole("button", { name: "Send", exact: true }).click();
  await expect(panel(page).getByText("Any update?")).toBeVisible();
  await expect(panel(page).getByText(/^You · 10 Nov 2026, \d\d:\d\d$/)).toBeVisible();

  await panel(page).getByRole("button", { name: "Back" }).click();
  await panel(page).getByRole("button", { name: "New request" }).click();
  await panel(page).getByRole("button", { name: "Send to support" }).click();
  await expect(panel(page).getByRole("alert")).toHaveText("Add a subject so we know what this is about.");
  await panel(page).getByLabel("Subject").fill("Barcode scanner");
  await panel(page).getByRole("button", { name: "Send to support" }).click();
  await expect(panel(page).getByRole("alert")).toHaveText("Tell us what happened.");
  await choose(panel(page), "How urgent is it?", "High");
  await panel(page).getByLabel("What happened?").fill("It beeps but nothing is entered.");
  await panel(page).getByRole("button", { name: "Send to support" }).click();
  await expect(toast(page)).toHaveText("TKT-1044 sent to support.");
  await expect(panel(page).getByText("TKT-1044 · High priority")).toBeVisible();
  await expect(panel(page).getByText("Thanks, we've got your request. Someone from the team will reply here within 1 hour.")).toBeVisible();
});

test("Features: roadmap, voting and sharing an idea (quickstart 9)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openPanel(page);
  await panel(page).getByRole("tab", { name: "Features" }).click();
  await expect(panel(page).getByRole("heading", { name: "Planned (3)" })).toBeVisible();
  await expect(panel(page).getByRole("heading", { name: "In progress (1)" })).toBeVisible();
  await expect(panel(page).getByRole("heading", { name: "Done (1)" })).toBeVisible();

  await panel(page).getByRole("tab", { name: "Browse" }).click();
  const cards = panel(page).getByRole("article");
  await expect(cards.first()).toHaveAccessibleName("M-Pesa payments match invoices automatically");
  const vote = panel(page).getByRole("button", { name: "Vote for Print barcode labels" });
  await expect(vote).toHaveText("64");
  await vote.click();
  const voted = panel(page).getByRole("button", { name: "Remove vote for Print barcode labels" });
  await expect(voted).toHaveText("65");
  await expect(voted).toHaveAttribute("aria-pressed", "true");
  await panel(page).getByRole("textbox", { name: "Search ideas" }).fill("zzz");
  await expect(panel(page).getByText("No ideas match your search.")).toBeVisible();

  await panel(page).getByRole("tab", { name: "My ideas" }).click();
  await expect(cards).toHaveCount(2);

  await panel(page).getByRole("tab", { name: "New" }).click();
  await panel(page).getByRole("button", { name: "Check for similar ideas" }).click();
  await expect(panel(page).getByRole("alert")).toHaveText("Give your idea a title.");
  await panel(page).getByLabel("Idea title").fill("WhatsApp receipts");
  await panel(page).getByLabel("What would it help you do?").fill("Customers get their receipt straight away.");
  await panel(page).getByRole("button", { name: "Check for similar ideas" }).click();
  await expect(panel(page).getByRole("heading", { name: "Similar ideas. Vote for one if it covers yours" })).toBeVisible();
  await expect(panel(page).getByText("Send receipts on WhatsApp")).toBeVisible();
  await panel(page).getByRole("button", { name: "Submit my idea" }).click();
  await expect(toast(page)).toHaveText("Thanks. Your idea was shared.");
  await expect(panel(page).getByRole("tab", { name: "My ideas" })).toHaveAttribute("aria-selected", "true");
  const mineCard = panel(page).getByRole("article", { name: "WhatsApp receipts" });
  await expect(mineCard).toContainText("Your idea");
  await expect(mineCard.getByRole("button", { name: "Remove vote for WhatsApp receipts" })).toHaveText("1");
});
