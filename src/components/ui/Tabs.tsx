"use client";

import Link from "next/link";
import type { Tab } from "@/data";

/** The canvas tab strip: label buttons with a 2px action underline on the active tab. */
export function Tabs({ tabs, active, hrefFor }: { tabs: Tab[]; active: string; hrefFor: (t: Tab) => string }) {
  if (tabs.length <= 1) return null;
  return (
    <nav aria-label="Sections" className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((t) => {
        const on = t.slug === active;
        return (
          <Link
            key={t.slug}
            href={hrefFor(t)}
            aria-current={on ? "page" : undefined}
            className={`type-label -mb-px border-b-2 px-3 pb-3 pt-2 no-underline hover:text-text hover:no-underline ${on ? "border-action font-semibold text-action" : "border-transparent font-medium text-text-muted"}`}
          >
            {t.title}
          </Link>
        );
      })}
    </nav>
  );
}
