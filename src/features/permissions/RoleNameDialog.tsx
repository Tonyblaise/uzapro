"use client";
/** Add new role / Rename role (FR-012, FR-013; research R10). */
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { ROLE_NAME_MAX, addRole, renameRole, useRoleDefs } from "@/data";

export function RoleNameDialog({ roleKey, onClose, onAdded }: { roleKey?: string; onClose: () => void; onAdded: (key: string) => void }) {
  const current = useRoleDefs().find((r) => r.key === roleKey);
  const renaming = !!roleKey;
  const [name, setName] = useState(current?.name ?? "");
  const [error, setError] = useState("");
  if (renaming && !current) return null;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (renaming) {
      const r = await renameRole(roleKey!, name);
      if (!r.ok) return setError(r.message);
      onClose();
    } else {
      const r = await addRole(name);
      if (!r.ok) return setError(r.message);
      onAdded(r.value);
    }
  };

  return (
    <Modal
      open
      title={renaming ? "Rename role" : "Add new role"}
      width={420}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => submit()}>{renaming ? "Save" : "Add role"}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <Input
          label="Role name"
          value={name}
          maxLength={ROLE_NAME_MAX + 10}
          autoFocus
          error={error || undefined}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />
      </form>
    </Modal>
  );
}
