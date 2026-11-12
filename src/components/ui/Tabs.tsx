"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Tab } from "@/data";

/** The canvas tab strip: label buttons with a 2px action underline on the active tab. */
export function Tabs({ tabs, active, hrefFor }: { tabs: Tab[]; active: string; hrefFor: (t: Tab) => string }) {
  const ref = useRef<HTMLElement>(null);
  // Phones: one scrollable row; bring the current tab into view without moving the page.
  useEffect(() => {
    const nav = ref.current;
    const cur = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && cur && nav.scrollWidth > nav.clientWidth)
      nav.scrollLeft += cur.getBoundingClientRect().left - nav.getBoundingClientRect().left - (nav.clientWidth - cur.offsetWidth) / 2;
  }, [active]);
  if (tabs.length <= 1) return null;
  return (
    <nav
      ref={ref}
      aria-label="Sections"
      className="flex flex-wrap gap-1 border-b border-border max-md:flex-nowrap max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((t) => {
        const on = t.slug === active;
        return (
          <Link
            key={t.slug}
            href={hrefFor(t)}
            aria-current={on ? "page" : undefined}
            className={`type-label -mb-px shrink-0 whitespace-nowrap border-b-2 px-3 pb-3 pt-2 no-underline max-md:mb-0 hover:text-text hover:no-underline ${on ? "border-action font-semibold text-action" : "border-transparent font-medium text-text-muted"}`}
          >
            {t.title}
          </Link>
        );
      })}
    </nav>
  );
}
