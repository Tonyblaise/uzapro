import type { Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 005 · Profile (quickstart 11). Store data resets on a full page load, so the flow logs in
 * once and moves with in-app links.
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const toast = (page: Page) => page.getByRole("status");
/** The header's user chip (initials, name, role). */
const chip = (page: Page, name: string) => page.getByRole("button", { name: new RegExp(`${name} Owner$`) });

// A 1×1 PNG.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

async function openProfile(page: Page) {
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "Profile" }).click();
  await expect(page).toHaveURL(/\/profile\/profile$/);
  await expect(page.getByText("Personal information", { exact: true })).toBeVisible();
}

test("Rename to Anthony updates the header and the greeting; password rules gate saving (quickstart 11)", async ({ page, errors }) => {
  void errors;
  await openProfile(page);
  const undo = page.getByRole("button", { name: "Undo" });
  const save = page.getByRole("button", { name: "Save changes" });
  const first = page.getByLabel("First name", { exact: true });
  const email = page.getByLabel("Email", { exact: true });
  await expect(first).toHaveValue("Tony");
  await expect(chip(page, "TB Tony Blaise")).toBeVisible();
  await expect(undo).toBeDisabled();
  await expect(save).toBeDisabled();

  // Undo restores the saved values.
  await first.fill("Anthony");
  await expect(undo).toBeEnabled();
  await expect(save).toBeEnabled();
  await undo.click();
  await expect(first).toHaveValue("Tony");
  await expect(save).toBeDisabled();

  // A bad email blocks saving.
  const savedEmail = await email.inputValue();
  await email.fill("tony@");
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(save).toBeDisabled();
  await email.fill(savedEmail);
  await expect(page.getByText("Enter a valid email address.")).toHaveCount(0);

  await first.fill("Anthony");
  await save.click();
  await expect(toast(page)).toContainText("Profile saved.");
  await expect(save).toBeDisabled();
  await expect(chip(page, "AB Anthony Blaise")).toBeVisible();

  // Password: the five rule chips, the mismatch text and "Show passwords".
  const update = page.getByRole("button", { name: "Update password" });
  const cur = page.getByLabel("Current password", { exact: true });
  const next = page.getByLabel("New password", { exact: true });
  const conf = page.getByLabel("Confirm new password", { exact: true });
  await expect(page.getByText("○ At least 8 characters")).toBeVisible();
  await expect(update).toBeDisabled();
  await cur.fill("demo1234");
  await next.fill("weakpass");
  await conf.fill("weakpass");
  await expect(page.getByText("✓ At least 8 characters")).toBeVisible();
  await expect(page.getByText("✓ A lowercase letter")).toBeVisible();
  await expect(page.getByText("○ An uppercase letter")).toBeVisible();
  await expect(page.getByText("○ A number")).toBeVisible();
  await expect(page.getByText("○ A symbol")).toBeVisible();
  await expect(update).toBeDisabled();
  await next.fill("Str0ng!pass");
  await expect(page.getByText("The new passwords don't match.")).toBeVisible();
  await expect(update).toBeDisabled();
  await conf.fill("Str0ng!pass");
  await expect(page.getByText("The new passwords don't match.")).toHaveCount(0);
  await expect(next).toHaveAttribute("type", "password");
  await page.getByLabel("Show passwords").check();
  await expect(next).toHaveAttribute("type", "text");
  await expect(update).toBeEnabled();
  await update.click();
  await expect(toast(page)).toContainText("Password updated. Use it next time you log in.");
  await expect(cur).toHaveValue("");

  // The dashboard greets the new name.
  await nav(page).getByRole("link", { name: "Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome back, Anthony Blaise" })).toBeVisible();
});

test("Photo: JPG or PNG only, then Remove", async ({ page, errors }) => {
  void errors;
  await openProfile(page);
  const input = page.getByLabel("Profile photo file");
  await input.setInputFiles({ name: "me.gif", mimeType: "image/gif", buffer: PNG });
  await expect(toast(page)).toContainText("Use a JPG or PNG image.");
  await input.setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });
  await expect(toast(page)).toContainText("Photo updated.");
  await expect(page.getByRole("img", { name: "Profile photo" })).toBeVisible();
  await page.getByRole("button", { name: "Remove photo" }).click();
  await expect(toast(page)).toContainText("Photo removed.");
  await expect(page.getByRole("img", { name: "Profile photo" })).toHaveCount(0);
});
