/**
 * Task and reminder pure helpers (feature 023). "Now" is the demo clock: DEMO_TODAY with the real
 * time of day (as new records use, src/lib/demo-clock.ts).
 */
import { DEMO_TODAY, addDays, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import type { Pill, Reminder, RoleId, SnoozeFor, Task, TaskStatus, Tone } from "./types";

export interface Now {
  date: string;
  time: string;
}

export const demoNow = (): Now => ({ date: DEMO_TODAY, time: demoTime() });

const RANK: Record<TaskStatus, number> = { "In progress": 0, "To do": 1, Done: 2 };

/** Open tasks first (In progress, then To do), then by due date (no date last), then title. */
export function sortTasks(tasks: readonly Task[]): Task[] {
  return tasks.slice().sort((a, b) => RANK[a.status] - RANK[b.status] || (a.due || "9999").localeCompare(b.due || "9999") || a.title.localeCompare(b.title));
}

/** The owner sees every task; everyone else sees tasks assigned to them or that they created. */
export function visibleTasks(tasks: readonly Task[], roleId: RoleId, me: string): Task[] {
  return sortTasks(roleId === "owner" ? tasks : tasks.filter((t) => t.assignee === me || t.createdBy === me));
}

export type TaskFilter = "All" | TaskStatus;

export function filterTasks(tasks: readonly Task[], status: TaskFilter, mine: string | null): Task[] {
  return tasks.filter((t) => (status === "All" || t.status === status) && (!mine || t.assignee === mine));
}

/** "YYYY-MM-DDTHH:MM" sort key; an empty time is the start of the day. */
export const reminderKey = (r: Pick<Reminder, "date" | "time">) => `${r.date}T${r.time || "00:00"}`;

export function isReminderDue(t: Task, now: Now = demoNow()): boolean {
  return !!t.reminder && t.status !== "Done" && reminderKey(t.reminder) <= reminderKey(now);
}

/** Due reminders, oldest first. */
export function dueReminders(tasks: readonly Task[], now: Now = demoNow()): Task[] {
  return tasks.filter((t) => isReminderDue(t, now)).sort((a, b) => reminderKey(a.reminder!).localeCompare(reminderKey(b.reminder!)));
}

function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  const out = new Date(Date.UTC(y, m - 1 + n, Math.min(d, last)));
  return out.toISOString().slice(0, 10);
}

/** The next reminder after this one for a repeating reminder (strictly after `now`), or null. */
export function nextOccurrence(r: Reminder, now: Now = demoNow()): Reminder | null {
  if (r.repeat === "None") return null;
  const step = (iso: string) => (r.repeat === "Daily" ? addDays(iso, 1) : r.repeat === "Weekly" ? addDays(iso, 7) : addMonths(iso, 1));
  let date = step(r.date);
  while (reminderKey({ date, time: r.time }) <= reminderKey(now)) date = step(date);
  return { ...r, date };
}

/** Where a snoozed reminder moves to. "1 hour" past midnight becomes tomorrow at 09:00. */
export function snoozeTo(r: Reminder, by: SnoozeFor, now: Now = demoNow()): Reminder {
  if (by === "Tomorrow") return { ...r, date: addDays(now.date, 1), time: r.time || "09:00" };
  if (by === "Next week") return { ...r, date: addDays(now.date, 7), time: r.time || "09:00" };
  const [h = 0, m = 0] = now.time.split(":").map(Number);
  if (h + 1 >= 24) return { ...r, date: addDays(now.date, 1), time: "09:00" };
  return { ...r, date: now.date, time: `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
}

export function taskPriorityTone(p: Task["priority"]): Tone {
  return p === "High" ? "danger" : p === "Medium" ? "warning" : "neutral";
}

export function statusPill(t: Task, today: string = DEMO_TODAY): Pill {
  if (t.status === "Done") return { label: "Done", tone: "success" };
  if (t.due && t.due < today) return { label: "Overdue", tone: "danger" };
  return { label: t.status, tone: t.status === "In progress" ? "info" : "neutral" };
}

/** "10 Nov 2026, 9:00 am" or "10 Nov 2026". */
export function reminderWhen(r: Pick<Reminder, "date" | "time">): string {
  if (!r.time) return fmtDate(r.date);
  const [h = 0, mi = 0] = r.time.split(":").map(Number);
  return `${fmtDate(r.date)}, ${h % 12 || 12}:${String(mi).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}
