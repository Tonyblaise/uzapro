import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 015 · Integrations (quickstart 1–6). Store data resets on a full page load, so each
 * flow logs in once and then moves with in-app links.
 */

const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });
const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const tab = (page: Page, name: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
const status = (page: Page) => page.getByRole("list", { name: "Set-up status" }).getByRole("listitem");
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

async function openIntegrations(page: Page) {
  await nav(page).getByRole("link", { name: "Integrations", exact: true }).click();
  await page.waitForURL("**/integrations/m-pesa-daraja");
  await expect(page.getByRole("heading", { level: 1, name: "Integrations" })).toBeVisible();
}

async function fillKeys(page: Page) {
  await page.getByLabel(/^Consumer key/).fill("ck-live-123");
  await page.getByLabel(/^Consumer secret/).fill("cs-live-456");
  await page.getByLabel(/^Lipa na M-Pesa Online passkey/).fill("pk-live-789");
}

test("M-Pesa (Daraja): opens on the design's tested Till; the fields follow the account type (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  await expect(page.getByLabel("Applies to")).toHaveValue("all");
  await expect(page.getByLabel("Till number")).toHaveValue("524118");
  for (const [i, text] of ["Configured: done", "Connection tested: done", "Payment URLs registered: done"].entries()) await expect(status(page).nth(i)).toContainText(text);
  await expect(page.getByLabel(/^Consumer key/)).toHaveAttribute("placeholder", "Saved. Type a new one to replace it");

  await page.getByLabel("Account type").selectOption("paybill");
  await expect(page.getByLabel("Till number")).toHaveCount(0);
  await expect(page.getByText("Per-terminal account numbers")).toBeVisible();
  await button(page, "Save credentials").click();
  await expect(page.getByText("Enter the Paybill number")).toBeVisible();

  // A terminal starts empty and needs its own keys.
  await page.getByLabel("Applies to").selectOption({ label: "Terminal 1 · no credentials yet" });
  await expect(status(page).nth(0)).toContainText("Configured: not yet");
  await button(page, "Save credentials").click();
  await expect(page.getByText("Enter the consumer key")).toBeVisible();
});

test("M-Pesa (Daraja): save a Paybill, test, then register; saved keys are not shown again (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  await page.getByLabel("Account type").selectOption("paybill");
  await page.getByLabel("Paybill number").fill("522522");
  await button(page, "Add terminal").click();
  await page.getByLabel("Terminal", { exact: true }).selectOption({ label: "Terminal 1" });
  await page.getByLabel("Terminal account number").fill("FRONT");
  await fillKeys(page);
  await button(page, "Save credentials").click();
  await expect(toast(page)).toHaveText("M-Pesa credentials saved for the whole business.");
  await expect(status(page).nth(1)).toContainText("Connection tested: not yet");
  await expect(page.getByLabel(/^Consumer key/)).toHaveValue("");
  await expect(button(page, "Register payment URLs")).toBeDisabled();

  await button(page, "Test connection").click();
  await expect(toast(page)).toHaveText("Connection works.");
  await expect(status(page).nth(1)).toContainText("Connection tested: done");
  await button(page, "Register payment URLs").click();
  await expect(toast(page)).toHaveText("Payment URLs registered.");
  await expect(status(page).nth(2)).toContainText("Payment URLs registered: done");

  // An edit must be saved before it can be tested.
  await page.getByLabel("Paybill number").fill("600600");
  await expect(button(page, "Test connection")).toBeDisabled();
  await button(page, "Save credentials").click();
  await expect(status(page).nth(1)).toContainText("Connection tested: not yet");
  await expect(page.getByLabel("Terminal account number")).toHaveValue("FRONT");
});

test("M-Pesa (Daraja): payments received, and matching one to an invoice (feature 026)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  const list = page.getByRole("region", { name: "Payments received" });
  await expect(list.getByRole("row").filter({ hasText: "SKM4R8TQ1Z" })).toContainText("Not matched yet");
  await page.getByRole("button", { name: /^Not matched/ }).click();
  await expect(list.getByRole("row").filter({ hasText: /SK/ })).toHaveCount(2);
  await list.getByRole("row").filter({ hasText: "SKH6D1VW8E" }).getByRole("button", { name: "Match" }).click();
  const dialog = page.getByRole("dialog", { name: "Match payment" });
  await dialog.getByRole("button", { name: "Record payment" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Pick the invoice this payment is for.");
  await dialog.getByRole("radio").first().click();
  await dialog.getByRole("button", { name: "Record payment" }).click();
  await expect(toast(page)).toContainText("Payment recorded against");
  await expect(list.getByRole("row").filter({ hasText: /SK/ })).toHaveCount(1);
});

test("M-Pesa bank integrations: only NCBA, added and removed (feature 026)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  await tab(page, "M-Pesa bank integrations");
  await expect(page.getByText("No bank integrations yet.")).toBeVisible();
  await expect(page.getByLabel("Paybill")).toHaveValue("880100");
  await button(page, "Add bank integration").click();
  await expect(page.getByText("Enter the bank account number (digits only).")).toBeVisible();
  await page.getByLabel("Bank account number").fill("0180294833321");
  await button(page, "Add bank integration").click();
  await expect(toast(page)).toHaveText("NCBA linked. We'll mark it active once the bank turns on alerts.");
  const row = page.getByRole("region", { name: "Linked bank accounts" });
  await expect(row).toContainText("NCBA · Paybill 880100");
  await expect(row).toContainText("Waiting for bank");
  await row.getByRole("button", { name: "Remove NCBA 0180294833321" }).click();
  await expect(toast(page)).toHaveText("NCBA integration removed.");
  await expect(page.getByText("No bank integrations yet.")).toBeVisible();
});

test("QuickBooks: connect, choose what to send, sync and disconnect (US4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  await tab(page, "QuickBooks");
  await expect(status(page).nth(0)).toContainText("Connected: not yet");
  await button(page, "Connect QuickBooks").click();
  await expect(page.getByText("Choose your company")).toBeVisible();
  await page.getByRole("button", { name: /Build by Blaise/ }).click();
  await expect(toast(page)).toHaveText("Connected to Build by Blaise.");
  await expect(status(page).nth(0)).toContainText("Connected: done");
  await expect(page.getByText("Not synced yet")).toBeVisible();
  await expect(page.getByLabel("Income account for sales")).toHaveValue("Sales of Product Income");
  await expect(page.getByLabel("Account for expenses")).toHaveCount(0);

  // Sending expenses needs an account for them, and edits are saved before a sync.
  await page.getByRole("checkbox", { name: "Expenses" }).check({ force: true });
  await expect(button(page, "Sync now")).toBeDisabled();
  await button(page, "Save settings").click();
  await expect(page.getByText("Choose the account for expenses")).toBeVisible();
  await page.getByLabel("Account for expenses").selectOption("Operating Expenses");
  await button(page, "Save settings").click();
  await expect(toast(page)).toHaveText("QuickBooks settings saved.");

  await button(page, "Sync now").click();
  await expect(toast(page)).toHaveText("QuickBooks sync finished.");
  await expect(status(page).nth(1)).toContainText("Synced: done");
  await expect(page.getByText("Not synced yet")).toHaveCount(0);
  await expect(page.getByText('Couldn\'t send customer "Walk-in Customer"')).toBeVisible();
  await button(page, "Retry").click();
  await expect(toast(page)).toHaveText("Sent to QuickBooks.");
  await expect(page.getByText('Sent customer "Walk-in Customer (UzaPro)"')).toBeVisible();

  await button(page, "Disconnect").click();
  await page.getByRole("dialog", { name: "Disconnect QuickBooks?" }).getByRole("button", { name: "Disconnect" }).click();
  await expect(toast(page)).toHaveText("QuickBooks disconnected. Nothing was deleted in QuickBooks.");
  await expect(button(page, "Connect QuickBooks")).toBeVisible();
});

test("Integrations has three tabs, and Settings no longer has Connected apps or Import and export", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  const tabs = page.getByRole("navigation", { name: "Sections" });
  await expect(tabs.getByRole("link")).toHaveText(["M-Pesa (Daraja)", "M-Pesa bank integrations", "QuickBooks"]);
  await nav(page).getByRole("link", { name: "Settings", exact: true }).click();
  await expect(tabs.getByRole("link", { name: "Taxes", exact: true })).toBeVisible();
  await expect(tabs.getByRole("link", { name: "Connected apps", exact: true })).toHaveCount(0);
  await expect(tabs.getByRole("link", { name: "Import and export", exact: true })).toHaveCount(0);
});

test("only the Owner sees Integrations until a role is given it, and Read cannot change anything (US3)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Permissions" }).click();
  await page.getByRole("button", { name: "Edit role" }).nth(3).click();
  const edit = page.getByRole("dialog", { name: /Edit role/ });
  await edit.getByRole("button", { name: "Integrations: Read" }).click();
  await edit.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption("cashier");
  await page.waitForURL("**/dashboard");
  await expect(nav(page).getByRole("link", { name: "Integrations", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Jane Smith/ }).click();
  await page.getByLabel("View as").selectOption("store");
  await page.waitForURL("**/dashboard");
  await openIntegrations(page);
  await expect(page.getByLabel("Till number")).toBeDisabled();
  await expect(button(page, "Save credentials")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Match", exact: true })).toHaveCount(0);
});
