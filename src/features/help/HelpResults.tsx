"use client";

import Link from "next/link";
import { useMemo } from "react";
import { searchArticles, setSearch } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { useHelpRoute } from "./shared";

/**
 * Search results for the shared search value (T013): title matches first, each with its category
 * path and a snippet. Opening a result clears the search, since the app only clears it on a module
 * or tab change and the article lives on the same tab.
 */
export function HelpResults({ query }: { query: string }) {
  const { articleHref } = useHelpRoute();
  const results = useMemo(() => searchArticles(query), [query]);
  const q = query.trim().replace(/\s+/g, " ");

  if (!results.length) {
    return (
      <p role="status" className="type-body m-0 py-6 text-center text-text-muted">
        No articles match that search.
      </p>
    );
  }

  return (
    <section aria-labelledby="help-results-heading" className="flex flex-col gap-3">
      <h2 id="help-results-heading" aria-live="polite" className="type-title m-0 text-text">
        {results.length} {results.length === 1 ? "article matches" : "articles match"} “{q}”
      </h2>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {results.map(({ article, path, snippet }) => (
          <li key={article.id}>
            <Link
              href={articleHref(article.id)}
              onClick={() => setSearch("")}
              className="flex gap-3 rounded-md border border-border bg-surface px-4 py-3 text-left no-underline hover:border-border-strong hover:bg-surface-hover hover:no-underline"
            >
              <span className="mt-0.5 shrink-0 text-text-muted">
                <Icon name="file-text" size={18} />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="type-title break-words font-semibold text-text">{article.title}</span>
                <span className="type-caption text-text-muted">{path.map((c) => c.name).join(" › ")}</span>
                <span className="type-small break-words text-text-secondary">{snippet}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
