"use client";
/** People › Permissions: role cards, Edit role and the role menus (feature 011, US1/US2/US4). */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Overlay";
import type { MenuItem } from "@/components/ui/Menu";
import { deleteRole, duplicateRole, useRoleCards, type RoleCardView } from "@/data";
import { EditRoleDialog } from "./EditRoleDialog";
import { RoleCard } from "./RoleCard";
import { RoleNameDialog } from "./RoleNameDialog";
import { useRoleOverlay } from "./shared";

export function RoleCards() {
  const cards = useRoleCards();
  const { params, open, close } = useRoleOverlay();
  const [confirm, setConfirm] = useState<RoleCardView | null>(null);
  const action = params.get("action");
  const editing = params.get("role");

  const menu = (r: RoleCardView): MenuItem[] => {
    const dup: MenuItem = { label: "Duplicate", icon: "copy", onClick: () => void duplicateRole(r.key) };
    if (r.locked) return [dup];
    return [
      { label: "Rename", icon: "pencil", onClick: () => open({ action: "rename", role: r.key }) },
      dup,
      { label: "Delete", danger: true, onClick: () => (r.users > 0 ? void deleteRole(r.key) : setConfirm(r)) },
    ];
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((r) => (
          <RoleCard key={r.key} role={r} onEdit={() => open({ role: r.key })} menu={menu(r)} />
        ))}
      </div>
      {editing && !action && <EditRoleDialog key={editing} roleKey={editing} onClose={close} />}
      {(action === "new" || action === "rename") && (
        <RoleNameDialog key={`${action}-${editing ?? ""}`} roleKey={action === "rename" ? (editing ?? undefined) : undefined} onClose={close} onAdded={(key) => open({ role: key })} />
      )}
      <ConfirmDialog
        open={!!confirm}
        title={`Delete ${confirm?.name ?? ""}?`}
        message="This role will be removed. This can't be undone."
        confirmLabel="Delete role"
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) void deleteRole(confirm.key);
          setConfirm(null);
        }}
      />
    </>
  );
}

/** Header action: "Add new role". */
export function AddRoleAction() {
  const { open } = useRoleOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      Add new role
    </Button>
  );
}
