"use client";
/** "Mark done" and "Snooze" on a due reminder (Tasks screen, Dashboard, header bell). */
import { SNOOZE_OPTIONS, setTaskStatus, snoozeReminder, toast, useCan, type Task } from "@/data";
import { Button } from "@/components/ui/Button";
import { Menu } from "@/components/ui/Menu";

export function ReminderActions({ task }: { task: Task }) {
  const can = useCan("write", "task");
  const run = async (p: Promise<{ ok: boolean; message: string }>) => {
    const r = await p;
    if (!r.ok) toast(r.message);
  };
  if (!can) return null;
  return (
    <div className="flex flex-none items-center gap-2">
      <Menu
        label={`Snooze ${task.title}`}
        trigger={({ open, toggle }) => (
          <Button size="sm" variant="secondary" icon="clock" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
            Snooze
          </Button>
        )}
        items={SNOOZE_OPTIONS.map((by) => ({ label: by === "1 hour" ? "For 1 hour" : by, onClick: () => void run(snoozeReminder(task.id, by)) }))}
      />
      <Button size="sm" icon="check" onClick={() => void run(setTaskStatus(task.id, "Done"))}>
        Mark done
      </Button>
    </div>
  );
}
