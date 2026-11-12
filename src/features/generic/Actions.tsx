"use client";
/**
 * The header "New" button (design `headerActions` last fallback, line 4063): every generic tab,
 * including the card and form tabs, opens the "New record" drawer (`?action=new`).
 */
import { Button } from "@/components/ui/Button";
import { useGenericOverlay } from "./shared";

export function NewAction() {
  const { open } = useGenericOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New
    </Button>
  );
}
