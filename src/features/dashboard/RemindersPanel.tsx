"use client";
/** Due task reminders on the Dashboard (feature 023). Hidden when nothing is due. */
import Link from "next/link";
import { hrefFor } from "@/config/modules";
import { reminderWhen, useCan, useDueReminders } from "@/data";
import { Card } from "@/components/ui/Card";
import { ReminderActions } from "@/features/tasks/ReminderActions";

export function RemindersPanel() {
  const due = useDueReminders();
  const can = useCan("read", "task");
  if (!can || !due.length) return null;
  return (
    <section aria-labelledby="dash-reminders" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="dash-reminders" className="type-card-title m-0 text-text">
          Reminders
        </h2>
        <Link href={hrefFor("task", "Tasks")} className="type-small font-semibold text-green-700 no-underline">
          View all tasks
        </Link>
      </div>
      <Card flush>
        {due.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
            <span aria-hidden="true" className="size-2 flex-none rounded-full bg-warning" />
            <Link href={hrefFor("task", "Tasks", { view: t.id })} className="min-w-0 flex-[1_1_200px] no-underline">
              <span className="type-label block text-text">{t.title}</span>
              <span className="type-small block text-text-muted">
                {reminderWhen(t.reminder!)} · {t.assignee}
              </span>
            </Link>
            <ReminderActions task={t} />
          </div>
        ))}
      </Card>
    </section>
  );
}
