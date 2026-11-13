"use client";
/** One role card (contracts/ui.md › Card; the user's screenshot 1). */
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import type { RoleCardView } from "@/data";
import { usersLabel } from "./shared";

export function RoleCard({ role, onEdit, menu }: { role: RoleCardView; onEdit: () => void; menu: MenuItem[] }) {
  return (
    <article aria-label={role.name} className="flex min-w-0 flex-col gap-4 rounded-md border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 flex-none place-items-center rounded-md text-[var(--role-ink)]" style={{ background: `var(--role-${role.colour})` }} aria-hidden="true">
          <Icon name="folder-lock" size={20} />
        </span>
        <h2 className="type-card-title m-0 min-w-0 flex-1 self-center break-words text-text">{role.name}</h2>
        <RowActions label={`${role.name} options`} items={menu} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {(role.avatars.length > 0 || role.extra > 0) && (
          <span className="flex" aria-hidden="true">
            {role.avatars.map((a, i) => (
              <span
                key={i}
                className="type-caption -ml-1.5 grid size-8 place-items-center rounded-full font-semibold ring-2 ring-[var(--surface)] first:ml-0"
                style={{ background: `var(--avatar-tint-${(i % 4) + 1})`, color: `var(--avatar-ink-${(i % 4) + 1})` }}
              >
                {a}
              </span>
            ))}
            {role.extra > 0 && (
              <span className="type-caption ml-1 grid size-8 place-items-center rounded-full bg-grey-100 font-semibold text-text-secondary first:ml-0">+{role.extra}</span>
            )}
          </span>
        )}
        <span className="type-body text-text-muted">{usersLabel(role.users)}</span>
      </div>
      <p className="type-caption m-0 -mt-2 text-text-muted">{role.locked ? "Full access to everything" : `Can open ${role.open} of ${role.total} modules`}</p>
      <Button variant="secondary" icon="user-cog" fullWidth onClick={onEdit} aria-label={`Edit role: ${role.name}`} className="mt-auto">
        Edit role
      </Button>
    </article>
  );
}
