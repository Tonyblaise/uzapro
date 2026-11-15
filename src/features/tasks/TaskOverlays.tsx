"use client";
/** Task overlays, driven by the URL: `?action=new`, `?view=<id>`, `&step=edit`, `&step=delete`. */
import { useTask } from "@/data";
import { DeleteTask } from "./DeleteTask";
import { TaskDetails } from "./TaskDetails";
import { TaskForm } from "./TaskForm";
import { useTaskOverlay } from "./shared";

export function TaskOverlays() {
  const { params, open, close } = useTaskOverlay();
  const action = params.get("action");
  const id = params.get("view");
  const step = params.get("step");
  const task = useTask(id);

  if (action === "new") return <TaskForm key="new" onSaved={(nid) => open({ view: nid })} onCancel={close} onClose={close} />;
  if (!task) return null;
  const back = () => open({ view: task.id });
  if (step === "edit") return <TaskForm key={`edit-${task.id}`} task={task} onSaved={back} onCancel={back} onClose={close} />;
  if (step === "delete") return <DeleteTask task={task} onCancel={back} onClose={close} />;
  return <TaskDetails task={task} onClose={close} onEdit={() => open({ view: task.id, step: "edit" })} onDelete={() => open({ view: task.id, step: "delete" })} />;
}
