"use client";

import { useMemo, useState } from "react";
import { getArticle, outline, useSearch } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { ArticleView } from "./ArticleView";
import { HelpLanding } from "./HelpLanding";
import { HelpResults } from "./HelpResults";
import { HelpSidebar } from "./HelpSidebar";
import { OnThisPage } from "./OnThisPage";
import { useHelpRoute } from "./shared";

/**
 * The Help Center (T011, research R6). Desktop: category sidebar (~300px), the main column (at
 * most 760px) and, on an article, the "On this page" outline (~240px). Below `lg` the sidebar is a
 * "Browse categories" disclosure above the content and the outline is hidden.
 *
 * Main area: the shared search's results while it has text (top bar or landing box, Q4), else the
 * article named by `?article=`, else the landing page (with a note if that article is unknown).
 */
export function HelpCenter() {
  const { articleId } = useHelpRoute();
  const q = useSearch();
  const searching = q.trim() !== "";
  const article = getArticle(articleId);
  const entries = useMemo(() => (article ? outline(article) : []), [article]);
  const [browseOpen, setBrowseOpen] = useState(false);

  const showArticle = !!article && !searching;
  const showOutline = showArticle && entries.length > 0;

  return (
    <div
      className={`flex min-w-0 flex-col gap-4 lg:grid lg:items-start lg:gap-8 ${showOutline ? "lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_240px]" : "lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]"}`}
    >
      <div className="min-w-0 lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto">
        <button
          type="button"
          aria-expanded={browseOpen}
          aria-controls="help-sidebar"
          onClick={() => setBrowseOpen((o) => !o)}
          className="type-label flex w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5 text-left text-text lg:hidden"
        >
          <Icon name="folder" size={16} />
          <span className="flex-1">Browse categories</span>
          <Icon name={browseOpen ? "chevron-up" : "chevron-down"} size={16} />
        </button>
        <aside id="help-sidebar" aria-label="Help categories" className={`${browseOpen ? "mt-2 block" : "hidden"} rounded-md bg-surface p-3 lg:mt-0 lg:block`}>
          <HelpSidebar onNavigate={() => setBrowseOpen(false)} />
        </aside>
      </div>

      <div className={`min-w-0 w-full ${showArticle ? "max-w-[760px]" : "mx-auto max-w-[760px]"}`}>
        {searching && article ? (
          <HelpResults query={q} />
        ) : showArticle ? (
          <ArticleView key={article.id} article={article} entries={entries} />
        ) : (
          <HelpLanding notFound={!!articleId && !article}>
            <HelpResults query={q} />
          </HelpLanding>
        )}
      </div>

      {showOutline && (
        <div className="sticky top-[88px] hidden max-h-[calc(100vh-112px)] overflow-y-auto xl:block">
          <OnThisPage key={article.id} entries={entries} />
        </div>
      )}
    </div>
  );
}
