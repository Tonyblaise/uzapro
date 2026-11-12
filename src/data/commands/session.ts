/** Session commands — validation and wording from the design's login (`lg`) block, research R8. */
import { ROLES, isRoleId } from "@/config/roles";
import { DEMO_LOGIN } from "../fixtures/reference";
import { clearAuth, writeAuth } from "@/lib/storage";
import { fail, ok, type Result, type Role, type RoleId } from "../types";
import { getStore, showToast } from "../store";
import { currentUserFirst } from "../profile";

const okId = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || /^\+?[0-9][0-9\s]{8,13}$/.test(v.trim());

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(input: { id: string; password: string; remember: boolean }): Promise<Result<Role>> {
  const id = input.id ?? "";
  if (!id.trim() || !input.password) return fail(!id.trim() ? "Enter your email or phone number." : "Enter your password.");
  if (!okId(id)) return fail("That doesn't look like an email or phone number.");
  // Only the demo Owner login works; same design message for any other email or password.
  if (id.trim().toLowerCase() !== DEMO_LOGIN.email || input.password !== DEMO_LOGIN.password) return fail("Wrong email or password. Check them and try again.");
  const role = "owner" as const;
  await sleep(600);
  if (input.remember) writeAuth(role);
  else clearAuth();
  getStore().setState((s) => ({ session: { ...s.session, authed: true, role, remember: input.remember }, ui: { ...s.ui, search: "" } }));
  const message = `Welcome back, ${currentUserFirst(getStore().getState()) || "there"}.`;
  showToast(message);
  return ok(ROLES[role], message);
}

export async function requestPasswordReset(id: string): Promise<Result<void>> {
  if (!id.trim()) return fail("Enter your email or phone number.");
  if (!okId(id)) return fail("That doesn't look like an email or phone number.");
  return ok(undefined);
}

export async function resendReset(): Promise<Result<void>> {
  showToast("Reset link sent again.");
  return ok(undefined, "Reset link sent again.");
}

export async function switchRole(role: RoleId): Promise<Result<Role>> {
  if (!isRoleId(role)) return fail("Unknown role.");
  const store = getStore();
  store.setState((s) => ({ session: { ...s.session, role }, ui: { ...s.ui, search: "" } }));
  if (store.getState().session.remember) writeAuth(role);
  return ok(ROLES[role]);
}

export async function signOut(): Promise<Result<void>> {
  clearAuth();
  getStore().setState((s) => ({ session: { ...s.session, authed: false }, ui: { ...s.ui, search: "", toast: null }, ai: { ...s.ai, open: false } }));
  return ok(undefined);
}

export async function accountManager(): Promise<Result<void>> {
  const message = "No account manager yet. Ask UzaPro support to assign one.";
  showToast(message);
  return ok(undefined, message);
}

export function setNavClosed(section: string): void {
  const store = getStore();
  store.setState((s) => {
    const navClosed = { ...s.session.navClosed, [section]: !s.session.navClosed[section] };
    try {
      window.localStorage.setItem("uzNavClosed", JSON.stringify(navClosed));
    } catch {
      /* ignore */
    }
    return { session: { ...s.session, navClosed } };
  });
}

export function setSearch(text: string): void {
  getStore().setState((s) => ({ ui: { ...s.ui, search: text } }));
}

export function toast(text: string): void {
  showToast(text);
}

/** Copy rows as CSV to the clipboard — the design's `exportCsv`. */
export async function copyCsv(headers: string[], rows: (string | number)[][], message?: string): Promise<Result<void>> {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => JSON.stringify(String(c))).join(","))].join("\n");
  return copyText(csv, message ?? `Copied ${rows.length} rows as CSV.`);
}

/** Copy text to the clipboard and confirm with a toast (shared by CSV exports). */
export async function copyText(text: string, message: string): Promise<Result<void>> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
    await navigator.clipboard.writeText(text);
    showToast(message);
    return ok(undefined, message);
  } catch {
    const failed = "Copy is not available here.";
    showToast(failed);
    return fail(failed);
  }
}
