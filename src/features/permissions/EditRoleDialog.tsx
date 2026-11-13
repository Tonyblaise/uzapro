"use client";
/** Edit role (the user's screenshot 2): one row per module with Read, Write and Delete switches (FR-003–FR-008, FR-014). */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { Icon } from "@/components/ui/Icon";
import { NO_ACCESS, lockedAccess, sameAccess, saveRoleAccess, toggleRight, useModuleGroups, useRoleAccess, useRoleDefs, useSession, type RoleAccess } from "@/data";
import { AccessRow } from "./AccessRow";


export function EditRoleDialog({ roleKey, onClose }: { roleKey: string; onClose: () => void }) {
  const role = useRoleDefs().find((r) => r.key === roleKey);
  const saved = useRoleAccess(roleKey);
  const groups = useModuleGroups();
  const { role: me } = useSession();
  const [draft, setDraft] = useState<RoleAccess>(saved);
  const dirty = useMemo(() => (Object.keys(draft) as (keyof RoleAccess)[]).some((k) => !sameAccess(draft[k], saved[k])), [draft, saved]);

  // Leaving the owner role (e.g. switched from a linked tab) discards the draft (spec › Edge cases).
  useEffect(() => {
    if (me.id !== "owner") onClose();
  }, [me.id, onClose]);

  if (!role) return null;
  const owner = role.locked;
  const save = async () => {
    const r = await saveRoleAccess(roleKey, draft);
    if (r.ok) onClose();
  };

  return (
    <Modal
      open
      title="Edit role"
      subtitle={role.name}
      width={680}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!dirty}>
            Save
          </Button>
        </>
      }
    >
      <h3 className="type-card-title m-0 text-text">Role access</h3>
      {owner ? (
        <div role="note" className="mt-3 flex gap-3 rounded-md bg-info-soft p-3 text-info-text">
          <Icon name="info" size={18} className="mt-0.5 flex-none" />
          <div>
            <p className="type-label m-0">Admin has access to everything</p>
            <p className="type-small m-0 mt-0.5">The owner always has full access: they can read, write and delete in every module, and manage permissions. This can&apos;t be changed.</p>
          </div>
        </div>
      ) : (
        <p className="type-small mb-0 mt-1 text-text-muted">Turn on any mix of Read, Write and Delete for each module. Write and Delete also turn on Read.</p>
      )}
      {groups.map((g) => (
        <section key={g.section} aria-label={g.section} className="mt-4">
          <h4 className="type-eyebrow m-0 uppercase text-text-muted">{g.section}</h4>
          {g.modules.map((m) => {
            const lock = lockedAccess(roleKey, m.id);
            return (
              <AccessRow
                key={m.id}
                name={m.name}
                icon={m.icon}
                access={draft[m.id] ?? NO_ACCESS}
                locked={lock !== undefined}
                note={!owner && lock ? (lock.read ? "Always on" : "Owner only") : undefined}
                onToggle={(r) => setDraft((d) => ({ ...d, [m.id]: toggleRight(d[m.id] ?? NO_ACCESS, r) }))}
              />
            );
          })}
        </section>
      ))}
    </Modal>
  );
}
