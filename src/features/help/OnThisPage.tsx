"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { HelpOutlineEntry } from "@/data";

/** Scroll a heading into view and put its id in the address bar without a new history entry. */
export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(window.history.state, "", `#${id}`);
}

/**
 * "On this page" (T010): the article's outline as a nav landmark. Level 3 entries are indented
 * under their section. The heading in view is marked `aria-current` (IntersectionObserver).
 * Renders nothing when the article has no sections.
 */
export function OnThisPage({ entries }: { entries: HelpOutlineEntry[] }) {
  const [current, setCurrent] = useState<string | null>(null);
  // After a click, keep the chosen entry current while the smooth scroll passes other headings.
  const lockUntil = useRef(0);

  useEffect(() => {
    const els = entries.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) visible.add(r.target.id);
          else visible.delete(r.target.id);
        }
        const first = entries.find((e) => visible.has(e.id));
        if (first && performance.now() > lockUntil.current) setCurrent(first.id);
      },
      // The band below the sticky app header and above the lower half of the screen.
      { rootMargin: "-80px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [entries]);

  if (!entries.length) return null;

  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    lockUntil.current = e.timeStamp + 1000;
    setCurrent(id);
    jumpTo(id);
  };

  return (
    <nav aria-label="On this page">
      <h2 className="type-eyebrow m-0 mb-3 text-text-secondary">On this page</h2>
      <ul className="m-0 flex list-none flex-col gap-1 border-l border-border p-0">
        {entries.map((e) => {
          const on = e.id === current;
          return (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                onClick={(ev) => onClick(ev, e.id)}
                aria-current={on ? "location" : undefined}
                className={`type-small -ml-px block border-l-2 py-1 no-underline hover:text-text hover:no-underline ${e.level === 3 ? "pl-6" : "pl-3"} ${on ? "border-action font-semibold text-green-700" : "border-transparent text-text-muted"}`}
              >
                {e.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
