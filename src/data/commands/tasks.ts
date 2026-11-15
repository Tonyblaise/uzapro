/** Task and reminder commands (feature 023), modelled on the Calendar commands. */
import { ROLES } from "@/config/roles";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import { demoNow, nextOccurrence, snoozeTo, type Now } from "../tasks";
import { fail, ok, type Result, type SnoozeFor, type Task, type TaskInput, type TaskStatus } from "../types";

let seq = 0;

/** The signed-in person's name as it appears on tasks (the demo role's name). */
export const taskUser = (s: Pick<AppState, "session">) => ROLES[s.session.role].name;

function update(id: string, fn: (t: Task) => Task): Task | undefined {
  const store = getStore();
  const t = store.getState().tasks.tasks.find((x) => x.id === id);
  if (!t) return undefined;
  const next = fn(t);
  store.setState((s) => ({ tasks: { tasks: s.tasks.tasks.map((x) => (x.id === id ? next : x)) } }));
  return next;
}

/** "Save" in the task drawer. Blocked without a title, or with a reminder that has no date. */
export async function saveTask(input: TaskInput, id?: string): Promise<Result<Task>> {
  const title = input.title.trim();
  if (!title) return fail("Enter what needs doing.");
  if (input.reminder && !input.reminder.date) return fail("Choose when to be reminded.");
  const store = getStore();
  const s0 = store.getState();
  const v = { ...input, title, notes: input.notes.trim(), assignee: input.assignee || taskUser(s0), reminder: input.reminder ? { ...input.reminder } : null };
  const existing = id ? s0.tasks.tasks.find((t) => t.id === id) : undefined;
  if (id && !existing) return fail("That task is no longer listed.");
  const task: Task = existing ? { ...existing, ...v } : { id: `t${Date.now().toString(36)}${seq++}`, createdBy: taskUser(s0), ...v };
  store.setState((s) => ({ tasks: { tasks: existing ? s.tasks.tasks.map((t) => (t.id === task.id ? task : t)) : [...s.tasks.tasks, task] } }));
  const message = "Task saved.";
  showToast(message);
  return ok(task, message);
}

/**
 * Change a task's status. Marking a task with a repeating reminder Done starts the next round:
 * the task goes back to "To do" with the reminder (and due date) moved to the next occurrence.
 */
export async function setTaskStatus(id: string, status: TaskStatus, now: Now = demoNow()): Promise<Result<Task>> {
  let message = "";
  const t = update(id, (t) => {
    const next = status === "Done" && t.reminder ? nextOccurrence(t.reminder, now) : null;
    if (next) {
      message = `${t.title} done. Next reminder ${next.date}.`;
      const shift = t.due ? Math.round((Date.parse(next.date) - Date.parse(t.reminder!.date)) / 86400000) : 0;
      const due = t.due ? new Date(Date.parse(t.due) + shift * 86400000).toISOString().slice(0, 10) : "";
      return { ...t, status: "To do", reminder: next, due };
    }
    message = status === "Done" ? `${t.title} done.` : `${t.title} moved to ${status}.`;
    return { ...t, status };
  });
  if (!t) return fail("That task is no longer listed.");
  showToast(message);
  return ok(t, message);
}

/** "Snooze" on a due reminder. */
export async function snoozeReminder(id: string, by: SnoozeFor, now: Now = demoNow()): Promise<Result<Task>> {
  const existing = getStore().getState().tasks.tasks.find((x) => x.id === id);
  if (!existing?.reminder) return fail("That reminder is no longer listed.");
  const t = update(id, (t) => ({ ...t, reminder: snoozeTo(t.reminder!, by, now) }))!;
  const message = `Snoozed for ${by === "1 hour" ? "an hour" : by.toLowerCase()}.`;
  showToast(message);
  return ok(t, message);
}

/** "Delete" after "Delete {title}?". */
export async function deleteTask(id: string): Promise<Result<void>> {
  const store = getStore();
  const t = store.getState().tasks.tasks.find((x) => x.id === id);
  if (!t) return fail("That task is no longer listed.");
  store.setState((s) => ({ tasks: { tasks: s.tasks.tasks.filter((x) => x.id !== id) } }));
  const message = `${t.title} deleted.`;
  showToast(message);
  return ok(undefined, message);
}
