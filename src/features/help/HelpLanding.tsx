"use client";

import type { ReactNode } from "react";
import { setSearch, useSearch } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Field";

/**
 * The Help Center landing hero (T009): book tile, title, subtitle and the large search box bound
 * to the app-wide search (so it and the top bar are one search, Q4). While the search has text the
 * results (`children`) replace the hint, so the box keeps focus as the presenter types.
 */
export function HelpLanding({ notFound, children }: { notFound?: boolean; children?: ReactNode }) {
  const q = useSearch();
  return (
    <div className="flex flex-col items-center gap-6 pt-6 text-center lg:pt-12">
      {notFound && (
        <p role="status" className="type-small m-0 flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-warning-text">
          <Icon name="circle-alert" size={16} />
          That article was not found.
        </p>
      )}
      <span className="grid size-16 place-items-center rounded-full bg-green-50 text-green-700">
        <Icon name="book-open" size={28} />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="type-display m-0 text-text">UzaPro Help Center</h2>
        <p className="type-body m-0 text-text-secondary">Search our guides and documentation to learn how to use UzaPro.</p>
      </div>
      <div className="w-full max-w-[640px]">
        <Input
          icon="search"
          size="lg"
          type="search"
          placeholder="Search help articles and answers…"
          aria-label="Search help articles"
          value={q}
          onChange={(e) => setSearch(e.target.value)}
          boxClassName="bg-surface"
        />
      </div>
      {q.trim() ? <div className="w-full max-w-[640px] text-left">{children}</div> : <p className="type-small m-0 text-text-muted">Browse categories in the sidebar, or type to search.</p>}
    </div>
  );
}
