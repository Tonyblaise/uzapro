"use client";
/** Header bell (feature 023): a dot while task reminders are due, and a list of them on click. */
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hrefFor } from "@/config/modules";
import { reminderWhen, useCan, useDueReminders } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { ReminderActions } from "@/features/tasks/ReminderActions";

export function RemindersBell() {
  const canTasks = useCan("read", "task");
  const all = useDueReminders();
  const due = canTasks ? all : [];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  const go = (params?: Record<string, string>) => {
    setOpen(false);
    router.push(hrefFor("task", "Tasks", params));
  };

  return (
    <>
      <IconButton icon="bell" label={due.length ? `Notifications, ${due.length} reminders due` : "Notifications"} badge={due.length > 0} aria-expanded={open} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="fixed inset-0 z-[var(--z-header-menu)]" onClick={() => setOpen(false)}>
          <div
            ref={panel}
            role="dialog"
            aria-label="Reminders"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-[60px] flex max-h-[70vh] w-[min(380px,calc(100vw-32px))] flex-col overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-lg"
          >
            <div className="type-card-title px-2 pb-2 text-text">Reminders</div>
            {due.length ? (
              due.map((t) => (
                <div key={t.id} className="flex flex-col gap-2 border-t border-border px-2 py-3">
                  <button type="button" onClick={() => go({ view: t.id })} className="cursor-pointer border-0 bg-transparent p-0 text-left font-sans">
                    <span className="type-label block text-text">{t.title}</span>
                    <span className="type-small block text-text-muted">{reminderWhen(t.reminder!)}</span>
                  </button>
                  <ReminderActions task={t} />
                </div>
              ))
            ) : (
              <div className="type-body border-t border-border px-2 py-4 text-text-muted">Nothing is due. You’re all caught up.</div>
            )}
            {canTasks && (
              <button type="button" onClick={() => go()} className="type-label mt-1 flex w-full items-center gap-2 rounded-sm border-0 bg-transparent px-2 py-2 text-left text-green-700 hover:bg-canvas">
                <span className="flex-1">View all tasks</span>
                <Icon name="chevron-right" size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
