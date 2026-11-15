"use client";
/** Header action: "New task". */
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/ui/Can";
import { useTaskOverlay } from "./shared";

export function NewTaskAction() {
  const { open } = useTaskOverlay();
  return (
    <Can need="write">
      <Button icon="plus" onClick={() => open({ action: "new" })}>
        New task
      </Button>
    </Can>
  );
}
