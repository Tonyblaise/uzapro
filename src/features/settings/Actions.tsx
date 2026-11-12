"use client";
/**
 * Header actions of the Settings structure tabs (design `headerActions` for `set`): "Add branch",
 * "Add group", "Add storage location" and "Add terminal". Each opens its dialog with `?action=new`.
 */
import { Button } from "@/components/ui/Button";
import { useSettingsOverlay } from "./shared";

function AddButton({ children }: { children: string }) {
  const { open } = useSettingsOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      {children}
    </Button>
  );
}

export const AddBranchAction = () => <AddButton>Add branch</AddButton>;
export const AddGroupAction = () => <AddButton>Add group</AddButton>;
export const AddStorageAction = () => <AddButton>Add storage location</AddButton>;
export const AddTerminalAction = () => <AddButton>Add terminal</AddButton>;
