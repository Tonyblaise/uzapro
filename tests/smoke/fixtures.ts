import { test as base, expect, type Page } from "@playwright/test";

/** Demo logins: the role is picked from the start of the email (research R8). */
export const LOGINS = {
  owner: "tony@buildbyblaise.co.ke",
  accountant: "mary@buildbyblaise.co.ke",
  cashier: "jane@buildbyblaise.co.ke",
  store: "grant@buildbyblaise.co.ke",
} as const;
export const PASSWORD = "demo1234";

export async function loginAs(page: Page, role: keyof typeof LOGINS) {
  await page.goto("/login");
  await page.getByLabel("Email or phone number").fill(LOGINS[role]);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");
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
