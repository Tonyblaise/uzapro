/** Calendar commands (feature 005, US1). Wording from the design's `calStore` and `calDelete` (research R2). */
import { getStore, showToast } from "../store";
import { fail, ok, type CalEvent, type CalEventInput, type Result } from "../types";

let seq = 0;

/** "Save" in the event drawer. Blocked without a title or a start date (the design disables Save). */
export async function saveEvent(input: CalEventInput, id?: string): Promise<Result<CalEvent>> {
  const title = input.title.trim();
  if (!title || !input.date) return fail("Enter what is happening and the start date.");
  const store = getStore();
  const s0 = store.getState();
  const v = {
    title,
    date: input.date,
    time: input.time,
    type: input.type,
    notes: input.notes.trim(),
    endDate: input.endDate || input.date,
    endTime: input.endTime || "",
    address: input.address.trim(),
  };
  const existing = id ? s0.calendar.events.find((e) => e.id === id) : undefined;
  const event: CalEvent = existing ? { ...existing, ...v } : { id: `n${Date.now().toString(36)}${seq++}`, ...v };
  store.setState((s) => ({
    calendar: {
      events: existing ? s.calendar.events.map((e) => (e.id === event.id ? event : e)) : [...s.calendar.events, event],
      types: v.type && !s.calendar.types.includes(v.type) ? [...s.calendar.types, v.type] : s.calendar.types,
    },
  }));
  const message = "Event saved.";
  showToast(message);
  return ok(event, message);
}

/** A new type from the form's Type picker (design `newCalType`). Returns the name. */
export function addCalType(name: string): string {
  const n = name.trim();
  if (!n) return n;
  const store = getStore();
  if (!store.getState().calendar.types.includes(n)) store.setState((s) => ({ calendar: { ...s.calendar, types: [...s.calendar.types, n] } }));
  return n;
}

/** "Delete" after "Delete {title}?" / "This permanently deletes the event.". */
export async function deleteEvent(id: string): Promise<Result<void>> {
  const store = getStore();
  const e = store.getState().calendar.events.find((x) => x.id === id);
  if (!e) return fail("That event is no longer listed.");
  store.setState((s) => ({ calendar: { ...s.calendar, events: s.calendar.events.filter((x) => x.id !== id) } }));
  const message = `${e.title} deleted.`;
  showToast(message);
  return ok(undefined, message);
}
