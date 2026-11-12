/**
 * Profile commands (feature 005, US4). Wording from the design's `pf` and `pw` blocks (research R6).
 * The password is checked against the rules and never stored (the demo has a fake login).
 */
import { PASSWORD_RULES } from "../fixtures/settings";
import { badEmail } from "../settings";
import { getStore, showToast } from "../store";
import { fail, ok, type Profile, type ProfileDetails, type Result } from "../types";
import { MAX_IMAGE_BYTES } from "./settings";

/** "Save changes": blocked by a bad email or an empty first name. Updates the name everywhere. */
export async function saveProfile(details: ProfileDetails): Promise<Result<Profile>> {
  const first = details.first.trim();
  if (badEmail(details.email)) return fail("Enter a valid email address.");
  if (!first) return fail("Enter your first name.");
  const store = getStore();
  const role = store.getState().session.role;
  const saved: Profile = {
    ...store.getState().profiles[role],
    first,
    last: details.last.trim(),
    email: details.email.trim(),
    phone: details.phone,
    country: details.country,
    city: details.city,
    address: details.address,
  };
  store.setState((s) => ({ profiles: { ...s.profiles, [role]: saved } }));
  const message = "Profile saved.";
  showToast(message);
  return ok(saved, message);
}

/** The photo error for a chosen file, or "" (JPG or PNG up to 2 MB). */
export function photoFileError(file: { name: string; size: number }): string {
  if (!/\.(jpe?g|png)$/i.test(file.name)) return "Use a JPG or PNG image.";
  if (file.size > MAX_IMAGE_BYTES) return "That photo is bigger than 2 MB.";
  return "";
}

/** Set the photo (a data URL kept for the session), or remove it with "". Pass the file to check it. */
export async function setPhoto(dataUrl: string, file?: { name: string; size: number }): Promise<Result<string>> {
  const err = dataUrl && file ? photoFileError(file) : "";
  if (err) {
    showToast(err);
    return fail(err);
  }
  const store = getStore();
  const role = store.getState().session.role;
  store.setState((s) => ({ profiles: { ...s.profiles, [role]: { ...s.profiles[role], photo: dataUrl } } }));
  const message = dataUrl ? "Photo updated." : "Photo removed.";
  showToast(message);
  return ok(dataUrl, message);
}

/** Each rule chip's state for a new password (design `pw.rules`). */
export function passwordRules(next: string): { label: string; ok: boolean }[] {
  return PASSWORD_RULES.map((r) => ({ label: r.label, ok: r.test(next) }));
}

/**
 * "Update password": blocked when Current is empty, a rule fails, the two new entries differ, or
 * the new one equals the current one. Nothing is stored.
 */
export async function changePassword(current: string, next: string, confirm: string = next): Promise<Result<void>> {
  if (!current) return fail("Enter your current password.");
  if (!passwordRules(next).every((r) => r.ok)) return fail("The new password doesn't meet every rule.");
  if (confirm !== next) return fail("The new passwords don't match.");
  if (next === current) return fail("Choose a password that is different from the current one.");
  const message = "Password updated. Use it next time you log in.";
  showToast(message);
  return ok(undefined, message);
}
