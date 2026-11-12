/**
 * Calendar pure helpers (design `calView`, `calStamp`, `calWhen`; research R2). The calendar has
 * its own "today", 1 Nov 2026 (Clarification Q2). Months are 1-based (1 = January).
 */
import { ROLES } from "@/config/roles";
import { date as fmtDate } from "@/lib/format";
import type { CalEvent, MonthCell, RoleId, Tone } from "./types";

export const CAL_TODAY = "2026-11-01";
export const CAL_TODAY_YEAR = 2026;
export const CAL_TODAY_MONTH = 11;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** Monday-first weeks covering the month, padded with the neighbouring months' days. */
export function monthGrid(year: number, month: number, today: string = CAL_TODAY): MonthCell[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const total = Math.ceil((offset + count) / 7) * 7;
  const cells: MonthCell[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(Date.UTC(year, month - 1, 1 - offset + i));
    const id = iso(d);
    cells.push({ iso: id, day: d.getUTCDate(), inMonth: d.getUTCMonth() === month - 1, isToday: id === today });
  }
  return cells;
}

/** "November 2026" */
export function monthTitle(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Previous / next month (design `shift`). */
export function shiftMonth(year: number, month: number, n: number): { year: number; month: number } {
  const d = new Date(Date.UTC(year, month - 1 + n, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

/** Sorted by date then time (design `calView` sort). */
export function sortEvents(events: readonly CalEvent[]): CalEvent[] {
  return events.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function eventsOn(events: readonly CalEvent[], date: string): CalEvent[] {
  return events.filter((e) => e.date === date);
}

/** The "Coming up" list: the first `n` events on or after `today`. */
export function comingUp(events: readonly CalEvent[], today: string = CAL_TODAY, n = 5): CalEvent[] {
  return sortEvents(events)
    .filter((e) => e.date >= today)
    .slice(0, n);
}

/** Can this role see money (Accounts) events? Design `canMoney = !role.tabs || !!role.figures`. */
export function canSeeMoneyEvents(roleId: RoleId): boolean {
  const role = ROLES[roleId];
  return !role.tabs || !!role.figures;
}

/** Events this role may see, sorted (FR-003: the Cashier and Store keeper don't see Accounts events). */
export function visibleEvents(events: readonly CalEvent[], roleId: RoleId): CalEvent[] {
  const money = canSeeMoneyEvents(roleId);
  return sortEvents(events.filter((e) => money || e.type !== "Accounts"));
}

/** Chip tone per type; unknown types use the Stock (neutral) tone, as in the design. */
export function calTone(type: string): Tone {
  return ({ Accounts: "warning", Work: "info", Stock: "neutral", Marketing: "success" } as Record<string, Tone>)[type] ?? "neutral";
}

/** "1 November 2026 at 9:00 AM" (design `calStamp`). */
export function calStamp(date: string, time = ""): string {
  const [y, m, d] = date.split("-").map(Number);
  const text = `${d} ${MONTH_NAMES[(m ?? 1) - 1]} ${y}`;
  if (!time) return text;
  const [h = 0, mi = 0] = time.split(":").map(Number);
  return `${text} at ${h % 12 || 12}:${pad(mi)}${h < 12 ? " AM" : " PM"}`;
}

/** "1 Nov 2026, 9:00 am" (design `calWhen`, the details "When" field). */
export function calWhen(e: Pick<CalEvent, "date" | "time">): string {
  if (!e.time) return fmtDate(e.date);
  const [h = 0, mi = 0] = e.time.split(":").map(Number);
  return `${fmtDate(e.date)}, ${h % 12 || 12}:${pad(mi)} ${h < 12 ? "am" : "pm"}`;
}
