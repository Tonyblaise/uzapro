"use client";
/** The design's delete confirmation drawer (`isCalConfirm`): "Delete {title}?". */
import { deleteEvent, toast, type CalEvent } from "@/data";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Overlay";
import { CRUMB } from "./shared";

export function DeleteEvent({ event, onCancel, onClose }: { event: CalEvent; onCancel: () => void; onClose: () => void }) {
  const remove = async () => {
    const r = await deleteEvent(event.id);
    if (r.ok) onClose();
    else toast(r.message);
  };
  return (
    <Drawer open title={`Delete ${event.title}?`} subtitle={CRUMB} onClose={onClose} width={440}>
      <div className="flex flex-col gap-4">
        <div className="type-body text-text">This permanently deletes the event.</div>
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
