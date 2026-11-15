"use client";
/** "Task details" modal: notes, assignee, due date, priority, reminder, and Delete / Edit / Mark done. */
import type { ReactNode } from "react";
import { date as fmtDate } from "@/lib/format";
import { isReminderDue, reminderWhen, setTaskStatus, statusPill, taskPriorityTone, toast, type Task } from "@/data";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/ui/Can";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { ReminderActions } from "./ReminderActions";

function Line({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="type-body flex items-start gap-3 text-text-muted">
      <span className="mt-0.5 inline-flex flex-none">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 [overflow-wrap:anywhere]">
        {label}: <b className="font-medium text-text">{children}</b>
      </span>
    </div>
  );
}

export function TaskDetails({ task: t, onClose, onEdit, onDelete }: { task: Task; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const pill = statusPill(t);
  const done = t.status === "Done";
  const toggle = async () => {
    const r = await setTaskStatus(t.id, done ? "To do" : "Done");
    if (!r.ok) toast(r.message);
  };
  return (
    <Modal open title="Task details" onClose={onClose} width={520}>
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-card-title text-text [overflow-wrap:anywhere]">{t.title}</span>
            <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
          </div>
          {t.notes && <div className="type-body mt-2 whitespace-pre-wrap text-text-secondary [overflow-wrap:anywhere]">{t.notes}</div>}
        </div>
        <div className="flex flex-col gap-3">
          <Line icon="user" label="Assigned to">
            {t.assignee}
          </Line>
          <Line icon="calendar" label="Due">
            {t.due ? fmtDate(t.due) : "No date"}
          </Line>
          <Line icon="circle-alert" label="Priority">
            <StatusPill tone={taskPriorityTone(t.priority)} dot={false}>
              {t.priority}
            </StatusPill>
          </Line>
          <Line icon="alarm-clock" label="Reminder">
            {t.reminder ? `${reminderWhen(t.reminder)}${t.reminder.repeat !== "None" ? ` · repeats ${t.reminder.repeat.toLowerCase()}` : ""}` : "None"}
          </Line>
        </div>
        {isReminderDue(t) && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-warning-soft p-3">
            <span className="type-label text-warning-text">This reminder is due</span>
            <ReminderActions task={t} />
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <Can need="delete">
            <Button variant="secondary" fullWidth onClick={onDelete}>
              Delete
            </Button>
          </Can>
          <Can need="write">
            <Button variant="secondary" fullWidth onClick={onEdit}>
              Edit
            </Button>
          </Can>
          <Can need="write">
            <Button fullWidth icon={done ? "undo-2" : "check"} onClick={toggle}>
              {done ? "Reopen" : "Mark done"}
            </Button>
          </Can>
        </div>
      </div>
    </Modal>
  );
}
