"use client";
/** "New task" / "Edit task" drawer (feature 023). Save is disabled without a title. */
import { useState } from "react";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { REMINDER_REPEATS, TASK_PRIORITIES, TASK_STATUSES, saveTask, toast, useTaskUser, useTeamNames, type ReminderRepeat, type Task, type TaskPriority, type TaskStatus } from "@/data";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CRUMB } from "./shared";

export function TaskForm({ task: t, onSaved, onCancel, onClose }: { task?: Task; onSaved: (id: string) => void; onCancel: () => void; onClose: () => void }) {
  const team = useTeamNames();
  const me = useTaskUser();
  const [title, setTitle] = useState(t?.title ?? "");
  const [due, setDue] = useState(t?.due ?? "");
  const [assignee, setAssignee] = useState(t?.assignee ?? me);
  const [priority, setPriority] = useState<TaskPriority>(t?.priority ?? "Medium");
  const [status, setStatus] = useState<TaskStatus>(t?.status ?? "To do");
  const [notes, setNotes] = useState(t?.notes ?? "");
  const [remind, setRemind] = useState(!!t?.reminder);
  const [rDate, setRDate] = useState(t?.reminder?.date ?? (t?.due || DEMO_TODAY));
  const [rTime, setRTime] = useState(t?.reminder?.time ?? "09:00");
  const [repeat, setRepeat] = useState<ReminderRepeat>(t?.reminder?.repeat ?? "None");
  const [busy, setBusy] = useState(false);

  const blocked = !title.trim() || (remind && !rDate);
  const people = team.includes(assignee) || !assignee ? team : [...team, assignee];

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const r = await saveTask({ title, due, assignee, priority, status, notes, reminder: remind ? { date: rDate, time: rTime, repeat } : null }, t?.id);
    setBusy(false);
    if (r.ok) onSaved(r.value.id);
    else toast(r.message);
  };

  return (
    <Drawer open title={t ? "Edit task" : "New task"} subtitle={CRUMB} onClose={onClose} width={440}>
      <div className="flex flex-col gap-4">
        <Input label="What needs doing?" placeholder="Enter a title" value={title} onChange={(x) => setTitle(x.target.value)} />
        <SearchSelect label="Assigned to" noun="person" options={people} value={assignee} onChange={setAssignee} />
        <Input label="Due date (optional)" type="date" value={due} onChange={(x) => setDue(x.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Priority" options={TASK_PRIORITIES} value={priority} onChange={(x) => setPriority(x.target.value as TaskPriority)} />
          <Select label="Status" options={TASK_STATUSES} value={status} onChange={(x) => setStatus(x.target.value as TaskStatus)} />
        </div>
        <Textarea id="task-notes" label="Notes" rows={3} placeholder="Optional" value={notes} onChange={(x) => setNotes(x.target.value)} />
        <div className="flex flex-col gap-3 rounded-md border border-border p-3">
          <Checkbox checked={remind} onChange={setRemind} label="Remind me" hint="Shows on the Dashboard and the bell when it is due" />
          {remind && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Remind on" type="date" value={rDate} onChange={(x) => setRDate(x.target.value)} />
                <Input label="At (optional)" type="time" value={rTime} onChange={(x) => setRTime(x.target.value)} />
              </div>
              <Select label="Repeat" options={REMINDER_REPEATS} value={repeat} onChange={(x) => setRepeat(x.target.value as ReminderRepeat)} />
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button disabled={blocked || busy} onClick={save}>
            Save
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
