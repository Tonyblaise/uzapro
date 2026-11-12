import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 004 · Expenses (quickstart 5–10 and 12). Store data resets on a full page load, so each
 * flow logs in, opens Expenses once and then moves with in-app links. Forms update the URL when
 * they close, so each flow waits for the form to be hidden before using the header buttons again.
 */

async function choose(scope: Locator | Page, picker: string, option: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const toast = (page: Page) => page.getByRole("status");
const row = (page: Page, text: string) => page.getByRole("row").filter({ hasText: text });
const cell = (r: Locator, i: number) => r.getByRole("cell").nth(i);

async function rowAction(page: Page, text: string, action: string) {
  await row(page, text).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: action, exact: true }).click();
}

async function openExpenses(page: Page, tabName = "Expenses") {
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Expenses" }).click();
  await expect(page).toHaveURL(/\/expenses\/overview$/);
  await expect(page.getByText("Spending by month", { exact: true })).toBeVisible();
  if (tabName !== "Overview") {
    await tab(page, tabName);
    await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: tabName, exact: true })).toHaveAttribute("aria-current", "page");
  }
}

async function openForm(page: Page) {
  await page.getByRole("button", { name: "Record expenses" }).click();
  return page.getByRole("dialog", { name: "Record expenses" });
}

test("Record a Transport expense paid from Cash drawer (quickstart 5)", async ({ page, errors }) => {
  void errors;
  await openExpenses(page);
  const form = await openForm(page);
  await choose(form, "Category", "Transport");
  await choose(form, "Payment account", "Cash drawer");
  await form.getByLabel("Amount (KES)", { exact: true }).fill("2000");
  await expect(form.getByText("1 one-off expense · KES 2,000")).toBeVisible();
  await form.getByRole("button", { name: "Save 1 expense" }).click();
  await expect(toast(page)).toContainText("1 paid.");
  await expect(form).toBeHidden();
  // Cells: 0 date, 1 reference, 2 branch, 3 category, 4 source account, 5 net amount, 6 status.
  const r = row(page, "EXP-0044");
  await expect(cell(r, 3)).toContainText("Transport");
  await expect(cell(r, 4)).toContainText("Cash drawer");
  await expect(cell(r, 5)).toContainText("− KES 2,000.00");
  await expect(cell(r, 6)).toHaveText("Paid");

  // The overview's "Paid from" panel now includes the Cash drawer payment.
  await tab(page, "Overview");
  await expect(page.getByText("KES 187,000", { exact: true })).toBeVisible();
  await expect(page.getByText("Cash drawer", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("KES 2,000", { exact: true }).first()).toBeVisible();
});

test("Approve EXP-0043 (quickstart 6)", async ({ page, errors }) => {
  void errors;
  await openExpenses(page);
  await expect(cell(row(page, "EXP-0043"), 6)).toHaveText("Waiting approval");
  await rowAction(page, "EXP-0043", "Approve");
  await expect(toast(page)).toContainText("EXP-0043 approved and paid from M-Pesa Till.");
  await expect(cell(row(page, "EXP-0043"), 6)).toHaveText("Paid");
  await expect(cell(row(page, "EXP-0043"), 0)).toContainText("Paid");
});

test("Record a bill to pay later for Kenya Power (quickstart 7)", async ({ page, errors }) => {
  void errors;
  await openExpenses(page);
  const form = await openForm(page);
  await form.getByRole("button", { name: "Pay later", exact: true }).click();
  await choose(form, "Category", "Utilities");
  await form.getByLabel("Amount (KES)", { exact: true }).fill("3000");
  await form.getByLabel("Supplier or payee (required)").fill("Kenya Power");
  await expect(form.getByText("This goes to Payables as a bill. Pay it from there when it is due.")).toBeVisible();
  await form.getByRole("button", { name: "Save 1 expense" }).click();
  await expect(toast(page)).toContainText("1 added to Payables.");
  await expect(form).toBeHidden();
  const r = row(page, "EXP-0044");
  await expect(cell(r, 4)).toContainText("Not paid yet");
  await expect(cell(r, 4)).toContainText("Pay later");
  await expect(cell(r, 6)).toHaveText("Unpaid bill");

  await nav(page).getByRole("link", { name: "Payables" }).click();
  await tab(page, "Payables");
  const bill = row(page, "EXP-0044");
  await expect(bill).toContainText("Kenya Power");
  await expect(cell(bill, 2)).toContainText("Bill");
});

test("Void EXP-0040 with a reason (quickstart 8)", async ({ page, errors }) => {
  void errors;
  await openExpenses(page);
  await rowAction(page, "EXP-0040", "Void");
  const dialog = page.getByRole("dialog", { name: "Void expense EXP-0040" });
  await expect(dialog.getByText("The expense moves to Voided and can't be brought back. KES 18,650 goes back into Cash drawer.")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Void expense" })).toBeDisabled();
  await dialog.getByLabel("Reason for voiding").fill("Wrong amount");
  await dialog.getByRole("button", { name: "Void expense" }).click();
  await expect(toast(page)).toContainText("EXP-0040 voided. Money returned to Cash drawer.");
  await expect(dialog).toBeHidden();
  await expect(row(page, "EXP-0040")).toHaveCount(0);

  await tab(page, "Voided");
  const v = row(page, "EXP-0040");
  await expect(v).toContainText("Transport");
  await expect(v).toContainText("18,650");
  await expect(v).toContainText("Tony Blaise");
  await expect(v).toContainText("Wrong amount");
});

test("Record now on REC-0002 and set up a new schedule (quickstart 9)", async ({ page, errors }) => {
  void errors;
  await openExpenses(page, "Recurring");
  // Cells: 0 ref, 1 name, 2 category, 3 paid from, 4 amount, 5 repeats, 6 next date, 7 status.
  await expect(cell(row(page, "REC-0002"), 6)).toHaveText("5 Dec 2026");
  await rowAction(page, "REC-0002", "Record now");
  await expect(toast(page)).toContainText("EXP-0044 recorded from Office internet.");
  await expect(cell(row(page, "REC-0002"), 6)).toHaveText("5 Jan 2027");

  await page.getByRole("button", { name: "New recurring expense" }).click();
  const form = page.getByRole("dialog", { name: "New recurring expense" });
  await form.getByLabel("Recurring expense name").fill("Water delivery");
  await choose(form, "Category", "Utilities");
  await choose(form, "Payment account", "Cash drawer");
  await form.getByLabel("Amount (KES)", { exact: true }).fill("1500");
  await form.getByRole("button", { name: "Create schedule" }).click();
  await expect(toast(page)).toContainText("Set up Water delivery (REC-0004).");
  await expect(form).toBeHidden();
  const r = row(page, "REC-0004");
  await expect(cell(r, 1)).toHaveText("Water delivery");
  await expect(cell(r, 5)).toHaveText("Every month");
  await expect(cell(r, 7)).toHaveText("Active");

  await tab(page, "Expenses");
  await expect(cell(row(page, "EXP-0044"), 3)).toContainText("Internet and phone");
});

test("Create the Marketing category (quickstart 10)", async ({ page, errors }) => {
  void errors;
  await openExpenses(page, "Expense categories");
  await page.getByRole("button", { name: "New category" }).click();
  const form = page.getByRole("dialog", { name: "New category" });
  await form.getByLabel("Category name").fill("Marketing");
  await form.getByLabel("Monthly budget limit (KES)").fill("20000");
  await form.getByRole("button", { name: "Create category" }).click();
  await expect(toast(page)).toContainText("Marketing created.");
  await expect(form).toBeHidden();
  // Cells: 0 category, 1 parent, 2 budget, 3 spent, 4 needs approval, 5 status.
  const r = row(page, "Marketing");
  await expect(cell(r, 2)).toHaveText("20,000");
  await expect(cell(r, 3)).toHaveText("0");
  await expect(cell(r, 5)).toHaveText("Active");
});

test("Expenses overview shows the design's headings and KPIs (quickstart 12)", async ({ page, errors }) => {
  void errors;
  await openExpenses(page, "Overview");
  for (const heading of ["Spending by month", "By category", "Budget vs spent", "Paid from", "Biggest expenses", "Coming up"]) {
    await expect(page.getByText(heading, { exact: true })).toBeVisible();
  }
  const kpis: [string, string, string][] = [
    ["Spent this month", "KES 185,000", "▼ 38% vs October"],
    ["Average month", "KES 274,650", "Last 6 months"],
    ["Waiting approval", "1", "KES 6,500 to approve"],
    ["Transaction costs", "KES 0", "Fees paid this month"],
  ];
  for (const [label, value, note] of kpis) {
    const tile = page.locator("div").filter({ has: page.getByText(label, { exact: true }) }).filter({ hasText: note }).last();
    await expect(tile).toContainText(value);
  }
  await expect(page.getByRole("img", { name: /^Monthly spending: Jun KES 268,000, .* Nov KES 185,000$/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "Rent KES 185,000" })).toBeVisible();
  await expect(page.getByText("KES 185,000 of 200,000")).toBeVisible();
  await expect(page.getByText("Shop and office rent", { exact: true })).toBeVisible();
  await expect(page.getByText("Monthly shop rent", { exact: true })).toBeVisible();
  await expect(page.getByText("Office internet", { exact: true })).toBeVisible();
});
