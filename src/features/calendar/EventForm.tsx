"use client";
/**
 * The design's event drawer (`isCalForm`, `calFormOpen`, `calStore`): "New event" / "Edit event".
 * Save is disabled without a title or a start date; saving reopens the event's details.
 */
import { useState } from "react";
import { addCalType, saveEvent, toast, useCalendarTypes, type CalEvent } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CRUMB } from "./shared";

export function EventForm({
  event: e,
  date,
  onSaved,
  onCancel,
  onClose,
}: {
  event?: CalEvent;
  date: string;
  onSaved: (id: string) => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  const types = useCalendarTypes();
  // Design `calFormOpen(e, date)` defaults.
  const [title, setTitle] = useState(e ? e.title : "");
  const [start, setStart] = useState(e ? e.date : date);
  const [time, setTime] = useState(e ? e.time : "");
  const [end, setEnd] = useState(e ? e.endDate || e.date : date);
  const [endTime, setEndTime] = useState(e ? e.endTime || e.time : "");
  const [address, setAddress] = useState(e ? e.address || "" : "");
  const [type, setType] = useState(e ? e.type : "Work");
  const [notes, setNotes] = useState(e ? e.notes : "");
  const [busy, setBusy] = useState(false);

  const blocked = !title.trim() || !start;

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const r = await saveEvent({ title, date: start, time, endDate: end, endTime, address, type, notes }, e?.id);
    setBusy(false);
    if (r.ok) onSaved(r.value.id);
    else toast(r.message);
  };

  return (
    <Drawer open title={e ? "Edit event" : "New event"} subtitle={CRUMB} onClose={onClose} width={440}>
      <div className="flex flex-col gap-4">
        <Input label="What is happening?" placeholder="Enter a title" value={title} onChange={(x) => setTitle(x.target.value)} />
        <Input label="Start date" type="date" value={start} onChange={(x) => setStart(x.target.value)} />
        <Input label="Start time (optional)" type="time" value={time} onChange={(x) => setTime(x.target.value)} />
        <Input label="End date" type="date" value={end} onChange={(x) => setEnd(x.target.value)} />
        <Input label="End time (optional)" type="time" value={endTime} onChange={(x) => setEndTime(x.target.value)} />
        <Input label="Address (optional)" placeholder="Where is it?" value={address} onChange={(x) => setAddress(x.target.value)} />
        <SearchSelect label="Type" noun="type" options={types} value={type} onChange={setType} onCreate={(name) => addCalType(name)} />
        <Textarea id="cal-notes" label="Description" rows={4} placeholder="Optional" value={notes} onChange={(x) => setNotes(x.target.value)} />
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
