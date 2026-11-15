/** Seed tasks (feature 023). Dates sit around the demo clock, 10 Nov 2026. */
import type { Reminder, TaskPriority, TaskStatus } from "../types";

/** [title, due, assignee, priority, status, notes, reminder] — ids are "t{index}". */
export const TASK_ROWS: readonly (readonly [string, string, string, TaskPriority, TaskStatus, string, Reminder | null])[] = [
  ["Chase Road & Travel Tyres bill", "2026-11-07", "Mary Achieng", "High", "To do", "KES 1,918, was due 31 Oct", { date: "2026-11-07", time: "09:00", repeat: "None" }],
  ["Count the Point of Sale store", "2026-11-10", "Grant Jensen", "Medium", "In progress", "SC-0014", { date: "2026-11-10", time: "08:00", repeat: "None" }],
  ["Bank the weekend takings", "2026-11-10", "Jane Smith", "High", "To do", "Main till and van", { date: "2026-11-10", time: "", repeat: "Weekly" }],
  ["Prepare October VAT return", "2026-11-20", "Mary Achieng", "High", "To do", "KES 164K to pay", { date: "2026-11-18", time: "10:00", repeat: "Monthly" }],
  ["Order more brake pads", "2026-11-14", "Grant Jensen", "Medium", "To do", "14 items are running low", null],
  ["Plan the store launch event", "2026-11-25", "Tony Blaise", "Low", "To do", "Store launch project", { date: "2026-11-21", time: "09:00", repeat: "None" }],
  ["Update supplier price lists", "2026-11-05", "Tony Blaise", "Low", "Done", "", null],
];

export const TASK_STATUSES = ["To do", "In progress", "Done"] as const;
export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;
export const REMINDER_REPEATS = ["None", "Daily", "Weekly", "Monthly"] as const;
export const SNOOZE_OPTIONS = ["1 hour", "Tomorrow", "Next week"] as const;
