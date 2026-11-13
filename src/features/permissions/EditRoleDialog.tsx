"use client";
/** Edit role (the user's screenshot 2): one row per module, grouped by sidebar section (FR-003–FR-008, FR-014). */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { lockedLevel, pickLevel, saveRoleAccess, useModuleGroups, useRoleAccess, useRoleDefs, useSession, type AccessLevel, type RoleAccess } from "@/data";
import { AccessRow } from "./AccessRow";

const NOTE: Partial<Record<AccessLevel, string>> = { read: "Always on", none: "Owner only" };

export function EditRoleDialog({ roleKey, onClose }: { roleKey: string; onClose: () => void }) {
  const role = useRoleDefs().find((r) => r.key === roleKey);
  const saved = useRoleAccess(roleKey);
  const groups = useModuleGroups();
  const { role: me } = useSession();
  const [draft, setDraft] = useState<RoleAccess>(saved);
  const dirty = useMemo(() => Object.keys(draft).some((k) => draft[k as keyof RoleAccess] !== saved[k as keyof RoleAccess]), [draft, saved]);

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
      {owner && <p className="type-caption mb-0 mt-1 text-text-muted">The owner always has full access.</p>}
      {groups.map((g) => (
        <section key={g.section} aria-label={g.section} className="mt-4">
          <h4 className="type-eyebrow m-0 uppercase text-text-muted">{g.section}</h4>
          {g.modules.map((m) => {
            const lock = lockedLevel(roleKey, m.id);
            return (
              <AccessRow
                key={m.id}
                name={m.name}
                icon={m.icon}
                level={draft[m.id] ?? "none"}
                locked={lock !== undefined}
                note={!owner && lock ? NOTE[lock] : undefined}
                onPick={(l) => setDraft((d) => ({ ...d, [m.id]: pickLevel(d[m.id] ?? "none", l) }))}
              />
            );
          })}
        </section>
      ))}
    </Modal>
  );
}
