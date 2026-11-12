import type { Locator, Page } from "@playwright/test";
import { expect, loginAs, test } from "./fixtures";

/**
 * Feature 005 · File Manager (quickstart 4–6). Store data resets on a full page load, so each flow
 * logs in, opens File Manager once and then moves with in-app controls.
 */

const nav = (page: Page) => page.getByRole("complementary", { name: "Main" });
const toast = (page: Page) => page.getByRole("status");
/** A grid card (role=button named after the item). */
const card = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

async function choose(scope: Locator | Page, picker: string, option: string) {
  await scope.getByRole("button", { name: picker, exact: true }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}

async function openFiles(page: Page) {
  await loginAs(page, "owner");
  await nav(page).getByRole("link", { name: "File Manager" }).click();
  await expect(page).toHaveURL(/\/file-manager\/all-documents$/);
  await expect(page.getByRole("heading", { name: "All Files" })).toBeVisible();
  await expect(page.getByText("Total storage", { exact: true })).toBeVisible();
}

test("Create Receipts in Finance and upload a file into it (quickstart 4)", async ({ page, errors }) => {
  void errors;
  await openFiles(page);
  await card(page, "Finance").click();
  await expect(page).toHaveURL(/\?dir=finance$/);
  const crumbs = page.getByRole("navigation", { name: "Folder path" });
  await expect(crumbs.getByRole("button", { name: "All files" })).toBeVisible();
  await expect(crumbs.getByRole("button", { name: "Finance" })).toBeVisible();

  await page.getByRole("button", { name: "New folder" }).click();
  const folderForm = page.getByRole("dialog", { name: "New folder" });
  await expect(folderForm.getByRole("button", { name: "Create", exact: true })).toBeDisabled();
  await expect(folderForm.getByRole("button", { name: "Create in", exact: true })).toHaveText("Finance");
  await folderForm.getByLabel("Folder name").fill("Receipts");
  await folderForm.getByRole("button", { name: "Create", exact: true }).click();
  await expect(toast(page)).toContainText("Receipts created in Finance.");
  await expect(folderForm).toBeHidden();
  await expect(card(page, "Receipts")).toBeVisible();

  await card(page, "Receipts").click();
  await expect(page.getByText("Nothing here yet.")).toBeVisible();
  await page.getByRole("button", { name: "Upload", exact: true }).click();
  const upload = page.getByRole("dialog", { name: "Upload file" });
  await expect(upload.getByText("No file chosen")).toBeVisible();
  await expect(upload.getByRole("button", { name: "Upload", exact: true })).toBeDisabled();
  await upload.getByLabel("Choose a file to upload").setInputFiles({ name: "Fuel receipt.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(2048, 1) });
  await expect(upload.getByText("Fuel receipt.pdf · 2 KB")).toBeVisible();
  await expect(upload.getByRole("button", { name: "Change file" })).toBeVisible();
  await expect(upload.getByLabel("File name")).toHaveValue("Fuel receipt");
  await expect(upload.getByRole("button", { name: "Folder", exact: true })).toHaveText("Receipts");
  await upload.getByLabel("File name").fill("");
  await expect(upload.getByRole("button", { name: "Upload", exact: true })).toBeDisabled();
  await upload.getByLabel("File name").fill("Fuel receipt Nov");
  await upload.getByRole("button", { name: "Upload", exact: true }).click();
  await expect(toast(page)).toContainText("Fuel receipt Nov.pdf added to Receipts.");
  await expect(upload).toBeHidden();
  await expect(card(page, "Fuel receipt Nov.pdf")).toBeVisible();
});

test("Search, move and rename a file (quickstart 5)", async ({ page, errors }) => {
  void errors;
  await openFiles(page);
  const search = page.getByLabel("Search by file name");
  await search.fill("no-such-file");
  await expect(page.getByText("No files match that search.")).toBeVisible();
  await search.fill("INV-0351");
  await expect(card(page, "INV-0351.pdf")).toBeVisible();
  await expect(card(page, "Bank statement Oct 2026.pdf")).toHaveCount(0);

  await card(page, "INV-0351.pdf").click();
  const drawer = page.getByRole("dialog", { name: "INV-0351.pdf" });
  await expect(drawer.getByText("Linked to")).toBeVisible();
  await choose(drawer, "Folder", "Bank");
  await expect(toast(page)).toContainText("Moved to Bank.");
  await expect(drawer.getByRole("button", { name: "Folder", exact: true })).toHaveText("Bank");

  await drawer.getByRole("button", { name: "Download" }).click();
  await expect(toast(page)).toContainText("Downloading INV-0351.pdf.");

  await drawer.getByRole("button", { name: "Edit" }).click();
  const edit = page.getByRole("dialog", { name: "Edit file" });
  await expect(edit.getByLabel("Name")).toHaveValue("INV-0351");
  await expect(edit.getByText(".pdf", { exact: true })).toBeVisible();
  await edit.getByLabel("Name").fill("");
  await expect(edit.getByRole("button", { name: "Save" })).toBeDisabled();
  await edit.getByLabel("Name").fill("INV-0351 paid");
  await edit.getByRole("button", { name: "Save" }).click();
  await expect(toast(page)).toContainText("Changes saved.");
  await expect(page.getByRole("dialog", { name: "INV-0351 paid.pdf" })).toBeVisible();
});

test("Delete the Legal folder and everything in it (quickstart 6)", async ({ page, errors }) => {
  void errors;
  await openFiles(page);
  // Open Legal, then find it by search and delete it from the list: the view returns to All files.
  await card(page, "Legal").click();
  await expect(page).toHaveURL(/\?dir=legal$/);
  await expect(card(page, "Contracts")).toBeVisible();
  await page.getByRole("button", { name: "List view" }).click();
  await page.getByLabel("Search by file name").fill("Legal");
  const row = page.getByRole("row").filter({ hasText: "Legal" });
  await expect(row).toHaveCount(1);
  await row.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "Delete Legal?" });
  await expect(confirm).toContainText("This permanently deletes the folder and everything in it: 4 subfolders and 7 files.");
  await confirm.getByRole("button", { name: "Delete" }).click();
  await expect(toast(page)).toContainText("Legal deleted.");
  await expect(confirm).toBeHidden();
  await expect(page).toHaveURL(/\/file-manager\/all-documents$/);
  await expect(page.getByText("No files match that search.")).toBeVisible();

  // Its subfolders and files went with it.
  await page.getByLabel("Search by file name").fill("Nairobi HQ lease");
  await expect(page.getByText("No files match that search.")).toBeVisible();
});
