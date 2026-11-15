"use client";
/**
 * Office › Tasks (feature 023): due reminders at the top, then the task list with status filters
 * and "Assigned to me". Ticking a task's box marks it done (or reopens it).
 */
import { useMemo, useState } from "react";
import { date as fmtDate } from "@/lib/format";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { filterTasks, reminderWhen, setTaskStatus, statusPill, taskPriorityTone, toast, useDueReminders, useTaskUser, useTasks, type Task, type TaskFilter } from "@/data";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { ReminderActions } from "./ReminderActions";
import { TaskOverlays } from "./TaskOverlays";
import { useTaskOverlay } from "./shared";

const FILTERS: TaskFilter[] = ["All", "To do", "In progress", "Done"];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`type-small cursor-pointer rounded-pill border px-3 py-1 font-semibold ${on ? "border-green-600 bg-green-50 text-green-700" : "border-border bg-surface text-text-secondary"}`}
    >
      {children}
    </button>
  );
}

function TaskRow({ task: t, onOpen }: { task: Task; onOpen: () => void }) {
  const pill = statusPill(t);
  const done = t.status === "Done";
  const toggle = async (v: boolean) => {
    const r = await setTaskStatus(t.id, v ? "Done" : "To do");
    if (!r.ok) toast(r.message);
  };
  return (
    <div className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0 hover:bg-surface-hover" data-task={t.id}>
      <Checkbox checked={done} onChange={toggle} label={<span className="sr-only">{done ? `Reopen ${t.title}` : `Mark ${t.title} done`}</span>} />
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 border-0 bg-transparent p-0 text-left font-sans">
        <span className="min-w-0 flex-[1_1_220px]">
          <span className={`type-label block truncate ${done ? "text-text-muted line-through" : "text-text"}`}>{t.title}</span>
          <span className="type-small block truncate text-text-muted">
            {t.assignee}
            {t.reminder && (
              <span className="ml-2 inline-flex items-center gap-1 align-middle">
                <Icon name="alarm-clock" size={13} />
                {reminderWhen(t.reminder)}
              </span>
            )}
          </span>
        </span>
        <span className={`type-small u-num w-24 flex-none ${t.due && t.due < DEMO_TODAY && !done ? "text-danger-text" : "text-text-muted"}`}>{t.due ? fmtDate(t.due) : "No date"}</span>
        <span className="flex flex-none items-center gap-2">
          <StatusPill tone={taskPriorityTone(t.priority)} dot={false}>
            {t.priority}
          </StatusPill>
          <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
        </span>
      </button>
    </div>
  );
}

export function TasksScreen() {
  const { open } = useTaskOverlay();
  const tasks = useTasks();
  const due = useDueReminders();
  const me = useTaskUser();
  const [status, setStatus] = useState<TaskFilter>("All");
  const [mine, setMine] = useState(false);
  const shown = useMemo(() => filterTasks(tasks, status, mine ? me : null), [tasks, status, mine, me]);
  const view = (id: string) => open({ view: id });

  return (
    <div className="flex flex-col gap-5">
      {due.length > 0 && (
        <section aria-labelledby="task-due" className="flex flex-col gap-3">
          <h2 id="task-due" className="type-card-title m-0 flex items-center gap-2 text-text">
            <Icon name="alarm-clock" size={18} /> Reminders due ({due.length})
          </h2>
          <Card flush>
            {due.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
                <span aria-hidden="true" className="size-2 flex-none rounded-full bg-warning" />
                <button type="button" onClick={() => view(t.id)} className="min-w-0 flex-[1_1_200px] cursor-pointer border-0 bg-transparent p-0 text-left font-sans">
                  <span className="type-label block text-text">{t.title}</span>
                  <span className="type-small block text-text-muted">{reminderWhen(t.reminder!)}</span>
                </button>
                <ReminderActions task={t} />
              </div>
            ))}
          </Card>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <Chip key={f} on={status === f} onClick={() => setStatus(f)}>
            {f}
          </Chip>
        ))}
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
        <Chip on={mine} onClick={() => setMine((m) => !m)}>
          Assigned to me
        </Chip>
      </div>

      <Card flush>
        {shown.length ? (
          shown.map((t) => <TaskRow key={t.id} task={t} onOpen={() => view(t.id)} />)
        ) : (
          <div className="type-body p-8 text-center text-text-muted">No tasks here. Use “New task” to add one.</div>
        )}
      </Card>

      <TaskOverlays />
    </div>
  );
}
