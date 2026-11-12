"use client";
/** Header action (design `headerActions` for `isCal`): "New event" on 1 Nov 2026 (`calFormOpen(null, '2026-11-01')`). */
import { CAL_TODAY } from "@/data";
import { Button } from "@/components/ui/Button";
import { useCalOverlay } from "./shared";

export function NewEventAction() {
  const { open } = useCalOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "new", date: CAL_TODAY })}>
      New event
    </Button>
  );
}
