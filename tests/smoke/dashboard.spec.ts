import { expect, loginAs, test } from "./fixtures";

/** Dashboard story (US1, T050): login, forgot password, dashboard figures, chart toggle, links. */

test.describe("login", () => {
  test("shows the design's validation messages", async ({ page, errors }) => {
    void errors;
    await page.goto("/login");
    // Only the demo Owner login works; anything else gets the design's message.
    await expect(page.getByText("Demo login: demo@uzapro.com / demo@123")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create a free account" })).toHaveCount(0);
    await page.getByLabel("Email or phone number").fill("demo@uzapro.com");
    await page.getByLabel("Password", { exact: true }).fill("demo1234");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Wrong email or password. Check them and try again.")).toBeVisible();
    await page.getByLabel("Email or phone number").fill("tony@buildbyblaise.co.ke");
    await page.getByLabel("Password", { exact: true }).fill("demo@123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Wrong email or password. Check them and try again.")).toBeVisible();

    await page.getByLabel("Email or phone number").fill("abc");
    await page.getByLabel("Password", { exact: true }).fill("demo1234");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("That doesn't look like an email or phone number.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("forgot password → check your messages → back to log in", async ({ page, errors }) => {
    void errors;
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await page.getByLabel("Email or phone number").fill("tony@buildbyblaise.co.ke");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your messages" })).toBeVisible();
    await page.getByRole("button", { name: "Back to log in" }).click();
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });
});

test.describe("dashboard", () => {
  test("shows the design's figures", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, Tony Ashiuma");
    await expect(page.getByText("KES 184K", { exact: true })).toBeVisible();
    const pending = page.locator(".uz-kpi8 > div").filter({ hasText: "Pending invoices" });
    await expect(pending).toContainText("2");
    await expect(pending).toContainText("awaiting payment");
    await expect(page.getByText("1, KES 1,026", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comparative analysis" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stock performance" })).toBeVisible();
  });

  test("comparative analysis toggles Bars, Lines and Area", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    const group = page.getByRole("group", { name: "Chart style" });
    const chart = page.getByRole("img", { name: "Sales and purchases by month" });
    await expect(group.getByRole("button", { name: "Bars" })).toHaveAttribute("aria-pressed", "true");
    await expect(chart).toBeVisible();

    await group.getByRole("button", { name: "Lines" }).click();
    await expect(group.getByRole("button", { name: "Lines" })).toHaveAttribute("aria-pressed", "true");
    await expect(chart.locator("polyline")).toHaveCount(2);
    await expect(chart.locator("polygon")).toHaveAttribute("fill", "none");

    await group.getByRole("button", { name: "Area" }).click();
    await expect(group.getByRole("button", { name: "Area" })).toHaveAttribute("aria-pressed", "true");
    await expect(chart.locator("polygon")).toHaveAttribute("fill", "var(--green-50)");

    await group.getByRole("button", { name: "Bars" }).click();
    await expect(chart.locator("polyline")).toHaveCount(0);
  });

  test("panel links open the matching module and tab", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "owner");
    await page.getByRole("link", { name: "View stock" }).click();
    await page.waitForURL("**/stock/overview");
    await expect(page.getByRole("heading", { level: 1, name: "Stock" })).toBeVisible();

    await page.goto("/dashboard");
    await page.getByRole("link", { name: "View details" }).first().click();
    await page.waitForURL("**/sales/invoices");
  });

  test("cashier gets the simple home with quick tasks", async ({ page, errors }) => {
    void errors;
    await loginAs(page, "cashier");
    await expect(page.getByRole("heading", { name: "What would you like to do?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Needs your attention" })).toBeVisible();
    await page.getByRole("link", { name: /New sale/ }).click();
    await page.waitForURL("**/sales/all-sales?action=new");
  });
});
