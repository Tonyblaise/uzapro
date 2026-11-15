import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dueReminders, filterTasks, isReminderDue, nextOccurrence, snoozeTo, sortTasks, statusPill, visibleTasks, type Now } from "@/data/tasks";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import { createSeed } from "@/data/store/seed";
import { deleteTask, saveTask, setTaskStatus, snoozeReminder } from "@/data/commands/tasks";
import type { Task, TaskInput } from "@/data/types";

const NOW: Now = { date: "2026-11-10", time: "12:00" };
const task = (over: Partial<Task> = {}): Task => ({
  id: "x",
  title: "Do it",
  due: "",
  assignee: "Jane Smith",
  priority: "Medium",
  status: "To do",
  notes: "",
  reminder: null,
  createdBy: "Tony Blaise",
  ...over,
});

describe("task helpers", () => {
  it("a reminder is due once its date and time have passed, unless the task is done", () => {
    expect(isReminderDue(task({ reminder: { date: "2026-11-10", time: "11:59", repeat: "None" } }), NOW)).toBe(true);
    expect(isReminderDue(task({ reminder: { date: "2026-11-10", time: "12:01", repeat: "None" } }), NOW)).toBe(false);
    expect(isReminderDue(task({ reminder: { date: "2026-11-10", time: "", repeat: "None" } }), NOW)).toBe(true);
    expect(isReminderDue(task({ status: "Done", reminder: { date: "2026-11-01", time: "", repeat: "None" } }), NOW)).toBe(false);
    expect(isReminderDue(task(), NOW)).toBe(false);
  });

  it("seeds three due reminders at noon on 10 Nov, oldest first", () => {
    expect(dueReminders(createSeed().tasks.tasks, NOW).map((t) => t.title)).toEqual([
      "Chase Road & Travel Tyres bill",
      "Bank the weekend takings",
      "Count the Point of Sale store",
    ]);
  });

  it("repeats move to the next occurrence after now", () => {
    expect(nextOccurrence({ date: "2026-11-10", time: "", repeat: "None" }, NOW)).toBeNull();
    expect(nextOccurrence({ date: "2026-11-10", time: "", repeat: "Weekly" }, NOW)?.date).toBe("2026-11-17");
    expect(nextOccurrence({ date: "2026-10-01", time: "09:00", repeat: "Daily" }, NOW)?.date).toBe("2026-11-11");
    expect(nextOccurrence({ date: "2026-10-31", time: "", repeat: "Monthly" }, NOW)?.date).toBe("2026-11-30");
  });

  it("snoozes for an hour, until tomorrow or for a week", () => {
    const r = { date: "2026-11-10", time: "09:00", repeat: "None" as const };
    expect(snoozeTo(r, "1 hour", NOW)).toMatchObject({ date: "2026-11-10", time: "13:00" });
    expect(snoozeTo(r, "1 hour", { date: "2026-11-10", time: "23:30" })).toMatchObject({ date: "2026-11-11", time: "09:00" });
    expect(snoozeTo(r, "Tomorrow", NOW)).toMatchObject({ date: "2026-11-11", time: "09:00" });
    expect(snoozeTo(r, "Next week", NOW)).toMatchObject({ date: "2026-11-17" });
  });

  it("the owner sees every task; others see their own", () => {
    const all = createSeed().tasks.tasks;
    expect(visibleTasks(all, "owner", "Tony Blaise")).toHaveLength(all.length);
    expect(visibleTasks(all, "cashier", "Jane Smith").map((t) => t.assignee)).toEqual(["Jane Smith"]);
  });

  it("sorts open tasks first and filters by status and assignee", () => {
    const list = sortTasks([task({ id: "a", status: "Done" }), task({ id: "b", due: "2026-11-20" }), task({ id: "c", status: "In progress" })]);
    expect(list.map((t) => t.id)).toEqual(["c", "b", "a"]);
    expect(filterTasks(list, "Done", null).map((t) => t.id)).toEqual(["a"]);
    expect(filterTasks(list, "All", "Mary Achieng")).toHaveLength(0);
    expect(statusPill(task({ due: "2026-11-01" }), "2026-11-10").label).toBe("Overdue");
  });
});

describe("task commands", () => {
  let store: AppStore;
  beforeEach(() => {
    vi.useFakeTimers();
    store = createAppStore();
    registerStore(store);
  });
  afterEach(() => vi.useRealTimers());
  const input = (over: Partial<TaskInput> = {}): TaskInput => ({ title: "Call the bank", due: "", assignee: "", priority: "Low", status: "To do", notes: "", reminder: null, ...over });
  const get = (id: string) => store.getState().tasks.tasks.find((t) => t.id === id)!;

  it("saves, edits and deletes a task", async () => {
    expect((await saveTask(input({ title: "  " }))).ok).toBe(false);
    expect((await saveTask(input({ reminder: { date: "", time: "", repeat: "None" } }))).message).toBe("Choose when to be reminded.");
    const r = await saveTask(input());
    expect(r.ok && r.value).toMatchObject({ title: "Call the bank", assignee: "Tony Blaise", createdBy: "Tony Blaise" });
    const id = r.ok ? r.value.id : "";
    await saveTask(input({ title: "Call the bank again", assignee: "Mary Achieng" }), id);
    expect(get(id)).toMatchObject({ title: "Call the bank again", assignee: "Mary Achieng" });
    expect((await deleteTask(id)).message).toBe("Call the bank again deleted.");
    expect(store.getState().tasks.tasks.find((t) => t.id === id)).toBeUndefined();
  });

  it("marking a repeating task done rolls it to the next round", async () => {
    await setTaskStatus("t2", "Done", NOW);
    expect(get("t2")).toMatchObject({ status: "To do", due: "2026-11-17", reminder: { date: "2026-11-17", repeat: "Weekly" } });
    await setTaskStatus("t0", "Done", NOW);
    expect(get("t0").status).toBe("Done");
  });

  it("snoozes a reminder", async () => {
    const r = await snoozeReminder("t0", "Tomorrow", NOW);
    expect(r.message).toBe("Snoozed for tomorrow.");
    expect(get("t0").reminder).toMatchObject({ date: "2026-11-11", time: "09:00" });
    expect((await snoozeReminder("t4", "Tomorrow", NOW)).ok).toBe(false);
  });
});
