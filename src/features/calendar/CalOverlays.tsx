"use client";
/**
 * Calendar overlays, driven by the URL (contracts/routes.md):
 * `?action=new[&date=]` → "New event"; `?view=<id>` → Event details; `&step=edit` → "Edit event";
 * `&step=delete` → "Delete {title}?" (the design's `calConfirm`).
 */
import { CAL_TODAY, useCalendarEvent } from "@/data";
import { DeleteEvent } from "./DeleteEvent";
import { EventDetails } from "./EventDetails";
import { EventForm } from "./EventForm";
import { useCalOverlay } from "./shared";

export function CalOverlays() {
  const { params, open, close } = useCalOverlay();
  const action = params.get("action");
  const id = params.get("view");
  const step = params.get("step");
  const event = useCalendarEvent(id);

  if (action === "new") {
    const date = params.get("date") || CAL_TODAY;
    return <EventForm key={`new-${date}`} date={date} onSaved={(nid) => open({ view: nid })} onCancel={close} onClose={close} />;
  }
  if (!event) return null;
  const back = () => open({ view: event.id });
  if (step === "edit") return <EventForm key={`edit-${event.id}`} event={event} date={event.date} onSaved={back} onCancel={back} onClose={close} />;
  if (step === "delete") return <DeleteEvent event={event} onCancel={back} onClose={close} />;
  return <EventDetails event={event} onClose={close} onEdit={() => open({ view: event.id, step: "edit" })} onDelete={() => open({ view: event.id, step: "delete" })} />;
}
