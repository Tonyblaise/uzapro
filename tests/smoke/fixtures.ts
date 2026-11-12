import { test as base, expect, type Page } from "@playwright/test";

/** The demo's only login (the Owner); other roles are reached with the account menu's "View as". */
export const DEMO_EMAIL = "demo@uzapro.com";
export const DEMO_PASSWORD = "demo@123";
const VIEW_AS = { owner: "owner", accountant: "accountant", cashier: "cashier", store: "store" } as const;

export async function loginAs(page: Page, role: keyof typeof VIEW_AS) {
  await page.goto("/login");
  await page.getByLabel("Email or phone number").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");
  if (role === "owner") return;
  await page.getByRole("button", { name: /Tony Blaise/ }).click();
  await page.getByLabel("View as").selectOption(VIEW_AS[role]);
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("Welcome back, Tony Blaise");
}

/** Fails the test on any console error or uncaught page error (constitution quality gate). */
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, provide) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await provide(errors);
    expect(errors, "console errors").toEqual([]);
  },
});

export { expect };
