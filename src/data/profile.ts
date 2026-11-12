/** Current-user selectors (FR-014): the session role's profile is the name the app shows. */
import { ROLES } from "@/config/roles";
import type { AppState } from "./store/state";

/** "{first} {last}" of the session role's profile (falls back to the role's seed name). */
export function currentUserName(s: Pick<AppState, "session" | "profiles">): string {
  const p = s.profiles[s.session.role];
  return `${p?.first ?? ""} ${p?.last ?? ""}`.trim() || ROLES[s.session.role].name;
}

/** The profile's first name (the login message). */
export function currentUserFirst(s: Pick<AppState, "session" | "profiles">): string {
  return s.profiles[s.session.role]?.first.trim() || ROLES[s.session.role].first;
}

/** "TB" from a full name (header chip and menu, design `um.initials`). */
export function nameInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
