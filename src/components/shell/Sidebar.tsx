"use client";

import Link from "next/link";
import { SECTIONS, hrefFor } from "@/config/modules";
import { setNavClosed, useSession, useVisibleModules, type ModuleId } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

/** The canvas sidebar: logo, collapsible section groups, NavItems; sticky full height. */
export function Sidebar({ activeId, open, onNavigate }: { activeId: ModuleId | null; open: boolean; onNavigate: () => void }) {
  const modules = useVisibleModules();
  const { navClosed } = useSession();
  const groups = SECTIONS.map((sec) => ({ sec, items: modules.filter((m) => m.section === sec) })).filter((g) => g.items.length > 0);

  return (
    <aside
      aria-label="Main"
      className={`fixed inset-y-0 left-0 z-[var(--z-sidebar)] flex w-[var(--sidebar-width)] flex-none flex-col border-r border-border bg-surface transition-transform duration-200 ease-standard md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? "translate-x-0 shadow-lg" : "-translate-x-full"}`}
    >
      <div className="px-6 pb-4 pt-5">
        <Link href="/dashboard" aria-label="UzaPro home" onClick={onNavigate} className="no-underline hover:no-underline">
          <Logo />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 pb-5">
        {groups.map((g) => {
          const closed = !!navClosed[g.sec];
          const hasActive = g.items.some((i) => i.id === activeId);
          return (
            <div key={g.sec}>
              <button
                type="button"
                aria-expanded={!closed}
                onClick={() => setNavClosed(g.sec)}
                className="type-eyebrow flex w-full items-center justify-between rounded-sm px-3 pb-2 pt-4 text-text-muted"
              >
                <span>{g.sec}</span>
                <span className="inline-flex items-center gap-1.5">
                  {closed && hasActive && <span title="The page you are on is in here" className="size-1.5 rounded-full bg-action" />}
                  <span className="inline-flex transition-transform duration-150" style={{ transform: `rotate(${closed ? "-90deg" : "0deg"})` }}>
                    <Icon name="chevron-down" size={14} />
                  </span>
                </span>
              </button>
              {!closed &&
                g.items.map((m) => {
                  const active = m.id === activeId;
                  return (
                    <div key={m.id} className="my-1">
                      <Link
                        href={hrefFor(m.id)}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-[38px] w-full items-center gap-3 rounded-sm px-3 no-underline hover:no-underline ${active ? "bg-action font-semibold text-text-on-action hover:text-text-on-action" : "type-label text-text-secondary hover:bg-grey-100 hover:text-text-secondary"}`}
                      >
                        <Icon name={m.icon} size={18} />
                        <span className="min-w-0 flex-1 truncate text-[14px] leading-5">{m.name}</span>
                      </Link>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
