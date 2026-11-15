"use client";
/** Delete confirmation drawer: "Delete {title}?". */
import { deleteTask, toast, type Task } from "@/data";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Overlay";
import { CRUMB } from "./shared";

export function DeleteTask({ task, onCancel, onClose }: { task: Task; onCancel: () => void; onClose: () => void }) {
  const remove = async () => {
    const r = await deleteTask(task.id);
    if (r.ok) onClose();
    else toast(r.message);
  };
  return (
    <Drawer open title={`Delete ${task.title}?`} subtitle={CRUMB} onClose={onClose} width={440}>
      <div className="flex flex-col gap-4">
        <div className="type-body text-text">This permanently deletes the task and its reminder.</div>
        <div className="flex gap-2">
          <Button variant="danger" icon="trash-2" onClick={remove}>
            Delete
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
