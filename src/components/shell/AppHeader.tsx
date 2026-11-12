"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hrefFor } from "@/config/modules";
import { ROLE_IDS, ROLES } from "@/config/roles";
import { accountManager, nameInitials, setSearch, signOut, switchRole, useCurrentUserName, useProfile, useRole, useSearch, type RoleId } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Field";

/** The canvas AppHeader: search, help, bell (with dot), divider, user chip + account menu. */
export function AppHeader({ onMenu }: { onMenu: () => void }) {
  const role = useRole();
  const name = useCurrentUserName();
  const profile = useProfile();
  const router = useRouter();
  const q = useSearch();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLButtonElement>(null);
  const initials = nameInitials(name);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        chip.current?.focus();
      }
    };
    document.addEventListener("keydown", esc);
    menu.current?.querySelector<HTMLElement>("button,select")?.focus();
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center gap-2 border-b border-border bg-surface px-4 md:gap-4 md:px-6">
      <span className="md:hidden">
        <IconButton icon="menu" label="Open menu" onClick={onMenu} />
      </span>
      <div className="min-w-0 max-w-[420px] flex-[1_1_0%]">
        <Input
          icon="search"
          placeholder="Search products, invoices, customers"
          aria-label="Search"
          value={q}
          onChange={(e) => setSearch(e.target.value)}
          boxClassName="!bg-canvas !border-transparent"
        />
      </div>
      <div className="hidden flex-1 md:block" />
      <IconButton icon="circle-help" label="Help" onClick={() => go(hrefFor("sup"))} />
      <IconButton icon="bell" label="Notifications" badge />
      <div aria-hidden="true" className="hidden h-7 w-px bg-border sm:block" />
      <button
        ref={chip}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-pill py-1 pl-1 pr-2 text-left hover:bg-grey-100"
      >
        <span className="grid size-8 place-items-center rounded-full bg-green-100 text-[13px] font-semibold leading-none text-green-700">{initials}</span>
        <span className="hidden flex-col sm:flex">
          <span className="type-label font-semibold text-text">{name}</span>
          <span className="type-caption text-text-muted">{role.role}</span>
        </span>
        <span className="text-text-muted">
          <Icon name="chevron-down" size={14} />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)}>
          <div
            ref={menu}
            role="menu"
            aria-label="Account menu"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-[60px] flex w-[min(340px,calc(100vw-32px))] flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg"
          >
            <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-3">
              <div className="type-title grid size-[52px] flex-none place-items-center rounded-md bg-green-100 font-bold text-green-800">{initials}</div>
              <div className="min-w-0 flex-1">
                <div className="type-title text-text">{name}</div>
                <span className="type-caption mt-0.5 inline-block rounded-pill border border-green-200 bg-surface px-2 py-px font-bold uppercase tracking-[.03em] text-green-700">
                  {role.id === "owner" ? "Business admin" : role.role}
                </span>
                <div className="type-small mt-1 truncate text-text-secondary">{profile.email || `${role.first.toLowerCase()}@buildbyblaise.co.ke`}</div>
              </div>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void accountManager();
              }}
              className="flex items-center gap-3 rounded-md border border-warning bg-warning-soft p-3 text-left"
            >
              <span className="grid size-9 flex-none place-items-center rounded-md bg-warning-text font-bold text-white">?</span>
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text">Not assigned</span>
                <span className="type-small block text-text-secondary">Account manager</span>
              </span>
              <span className="inline-flex text-text-muted">
                <Icon name="chevron-right" size={14} />
              </span>
            </button>
            <div className="my-1 h-px bg-border" />
            {/* Design deviation (spec › Design deviations): the canvas has role data but no visible switcher. */}
            <label className="flex flex-col gap-1 px-3 py-1">
              <span className="type-caption text-text-muted">View as</span>
              <select
                value={role.id}
                onChange={async (e) => {
                  await switchRole(e.target.value as RoleId);
                  setOpen(false);
                  router.push("/dashboard");
                }}
                className="type-body h-[var(--control-height-sm)] rounded-sm border border-border-strong bg-surface px-2 text-text"
              >
                {ROLE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {ROLES[id].label} ({ROLES[id].name})
                  </option>
                ))}
              </select>
            </label>
            {(
              [
                ["users", "Profile", () => go(hrefFor("prof"))],
                ["settings", "Settings", () => go(hrefFor("set"))],
                ["circle-help", "Help", () => go(hrefFor("sup"))],
              ] as const
            ).map(([icon, label, onClick]) => (
              <button key={label} type="button" role="menuitem" onClick={onClick} className="type-label flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-text hover:bg-canvas">
                <span className="inline-flex text-text-muted">
                  <Icon name={icon} size={16} />
                </span>
                <span className="flex-1">{label}</span>
                <span className="inline-flex text-text-muted">
                  <Icon name="chevron-right" size={14} />
                </span>
              </button>
            ))}
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.push("/login");
              }}
              className="type-label flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-text hover:bg-canvas"
            >
              <span className="inline-flex text-text-muted">
                <Icon name="x" size={16} />
              </span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
