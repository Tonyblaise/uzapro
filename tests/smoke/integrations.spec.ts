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

test("M-Pesa (Daraja): the fields follow the account type and Save names what is missing (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  await expect(page.getByLabel("Paybill number")).toBeVisible();
  await expect(page.getByText("Per-terminal account numbers")).toBeVisible();
  await expect(button(page, "Test connection")).toBeDisabled();
  await expect(button(page, "Register payment URLs")).toBeDisabled();

  await page.getByLabel("Account type").selectOption("till");
  await expect(page.getByLabel("Paybill number")).toHaveCount(0);
  await expect(page.getByText("Account numbers (optional)")).toHaveCount(0);
  await expect(page.getByLabel("Store number (head office)")).toBeVisible();
  await expect(page.getByLabel("Till number")).toBeVisible();

  await button(page, "Save credentials").click();
  await expect(page.getByText("Choose what these credentials apply to")).toBeVisible();
  await expect(page.getByText("Enter the store number")).toBeVisible();
  await expect(page.getByText("Enter the till number")).toBeVisible();
  await expect(page.getByText("Enter the consumer key")).toBeVisible();
  await expect(status(page).first()).toContainText("Configured: not yet");
});

test("M-Pesa (Daraja): save, test, then register, and saved keys are not shown again (US1)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  await page.getByLabel("Applies to").selectOption("all");
  await page.getByLabel("Paybill number").fill("522522");
  await button(page, "Add terminal").click();
  await page.getByLabel("Terminal", { exact: true }).selectOption({ label: "Terminal 1" });
  await page.getByLabel("Terminal account number").fill("FRONT");
  await fillKeys(page);
  await button(page, "Save credentials").click();
  await expect(toast(page)).toHaveText("M-Pesa credentials saved.");
  await expect(status(page).nth(0)).toContainText("Configured: done");
  await expect(page.getByLabel(/^Consumer key/)).toHaveValue("");
  await expect(page.getByLabel(/^Consumer key/)).toHaveAttribute("placeholder", "Saved. Type a new one to replace it");
  await expect(button(page, "Register payment URLs")).toBeDisabled();

  await button(page, "Test connection").click();
  await expect(toast(page)).toHaveText("Connection works.");
  await expect(status(page).nth(1)).toContainText("Connection tested: done");
  await button(page, "Register payment URLs").click();
  await expect(toast(page)).toHaveText("Payment URLs registered.");
  await expect(status(page).nth(2)).toContainText("Payment URLs registered: done");

  // An edit must be saved before it can be tested, and a save needs a fresh test.
  await page.getByLabel("Paybill number").fill("600600");
  await expect(button(page, "Test connection")).toBeDisabled();
  await button(page, "Save credentials").click();
  await expect(status(page).nth(1)).toContainText("Connection tested: not yet");

  // A terminal starts empty and keeps its own credentials.
  await expect(page.getByLabel("Applies to").locator("option", { hasText: "Terminal 1" })).toHaveText("Terminal 1 · no credentials yet");
  await page.getByLabel("Applies to").selectOption({ label: "Terminal 1 · no credentials yet" });
  await expect(page.getByLabel("Paybill number")).toHaveValue("");
  await expect(page.getByText("Per-terminal account numbers")).toHaveCount(0);
  await expect(status(page).nth(0)).toContainText("Configured: not yet");
  await page.getByLabel("Applies to").selectOption("all");
  await expect(page.getByLabel("Paybill number")).toHaveValue("600600");
  await expect(page.getByLabel("Terminal account number")).toHaveValue("FRONT");
});

test("M-Pesa bank integrations: saving creates the credentials for the bank letter (US2)", async ({ page, errors, context }) => {
  void errors;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await loginAs(page, "owner");
  await openIntegrations(page);
  await tab(page, "M-Pesa bank integrations");
  await expect(page.getByRole("button", { name: /NCBA Bank/ })).toContainText("Not configured");
  await expect(page.getByLabel("Paybill number")).toHaveValue("880100");
  await expect(button(page, "Copy API username")).toBeDisabled();

  await button(page, "Save credentials").click();
  await expect(page.getByText("Enter your NCBA till number")).toBeVisible();
  await page.getByLabel("Applies to").selectOption("all");
  await page.getByLabel("NCBA till number").fill("000001");
  await button(page, "Save credentials").click();
  await expect(toast(page)).toHaveText("NCBA Bank credentials saved.");
  await expect(page.getByRole("button", { name: /NCBA Bank/ })).toContainText("Configured");
  await expect(page.getByRole("textbox", { name: "API username", exact: true })).toHaveValue("uzapro-ncba-business");
  await expect(page.getByRole("textbox", { name: "API secret key", exact: true })).toHaveValue("••••••••••••");
  await button(page, "Copy API secret key").click();
  await expect(toast(page)).toHaveText("API secret key copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^[a-z0-9]{32}$/);

  await button(page, "Test connection").click();
  await expect(toast(page)).toHaveText("Connection works.");
  await expect(status(page).nth(1)).toContainText("Connection tested: done");
});

test("QuickBooks: connect, choose what to send, sync and disconnect (US4)", async ({ page, errors }) => {
  void errors;
  await loginAs(page, "owner");
  await openIntegrations(page);
  await tab(page, "QuickBooks");
  await expect(status(page).nth(0)).toContainText("Connected: not yet");
  await button(page, "Connect QuickBooks").click();
  await expect(toast(page)).toHaveText(/^Connected to .+ in QuickBooks\.$/);
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
  await expect(toast(page)).toHaveText(/^Sent to QuickBooks: \d+ invoices, \d+ payments received, \d+ customers, \d+ expenses\.$/);
  await expect(status(page).nth(1)).toContainText("Synced: done");
  await expect(page.getByText("Not synced yet")).toHaveCount(0);

  await button(page, "Disconnect").click();
  await page.getByRole("dialog", { name: "Disconnect QuickBooks?" }).getByRole("button", { name: "Disconnect" }).click();
  await expect(toast(page)).toHaveText("QuickBooks disconnected.");
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
  await expect(page.getByLabel("Paybill number")).toBeDisabled();
  await expect(button(page, "Save credentials")).toHaveCount(0);
  await expect(button(page, "Add terminal")).toHaveCount(0);
});
