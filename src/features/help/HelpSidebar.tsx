"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { articlePath, categoryPath, filterTree, helpTree, type HelpTreeNode } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Field";
import { useHelpRoute } from "./shared";

/** One visible row of the tree, in reading order (keyboard navigation walks this list). */
interface Row {
  key: string;
  kind: "cat" | "art";
  id: string;
  parent: string | null;
  open?: boolean;
}

const catKey = (id: string) => `c:${id}`;
const artKey = (id: string) => `a:${id}`;

/** Category ids to expand so the open article (or the `?cat=` category) shows in the tree. */
function routePath(articleId: string | null, catId: string | null): string[] {
  if (articleId) return articlePath(articleId).map((c) => c.id);
  if (catId) return categoryPath(catId).map((c) => c.id);
  return [];
}

/**
 * The Help Center sidebar (T008, T014): a "Help Center" header card with a filter toggle, then the
 * category tree. The tree is an ARIA tree with a roving tab stop: Up/Down move, Right expands (or
 * steps into a group), Left collapses (or steps to the parent), Enter/Space toggle a category, and
 * Enter on an article follows its `?article=` link.
 */
export function HelpSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { articleId, catId, articleHref } = useHelpRoute();
  const fullTree = useMemo(() => helpTree(), []);

  // Expand state. The route's category path is merged in whenever the route changes, so a deep
  // link or a breadcrumb opens its category without closing anything the presenter opened.
  const routeKey = `${articleId ?? ""}|${catId ?? ""}`;
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(routePath(articleId, catId)));
  const [seenRoute, setSeenRoute] = useState(routeKey);
  if (seenRoute !== routeKey) {
    setSeenRoute(routeKey);
    const add = routePath(articleId, catId);
    if (add.some((id) => !expanded.has(id))) setExpanded(new Set([...expanded, ...add]));
  }

  // Sidebar filter (T014): local, separate from the shared search. While it has text the tree
  // shows only matches, all expanded; clearing it brings back `expanded` untouched.
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [filterClosed, setFilterClosed] = useState<Set<string>>(() => new Set());
  const filtering = filter.trim() !== "";
  const tree = useMemo(() => (filtering ? filterTree(filter) : fullTree), [filtering, filter, fullTree]);
  const isOpen = (id: string) => (filtering ? !filterClosed.has(id) : expanded.has(id));

  const activeTop = articleId ? articlePath(articleId) : [];
  const activeCats = new Set(activeTop.map((c) => c.id));

  const rows: Row[] = [];
  const walk = (nodes: HelpTreeNode[], parent: string | null) => {
    for (const n of nodes) {
      const open = isOpen(n.category.id);
      rows.push({ key: catKey(n.category.id), kind: "cat", id: n.category.id, parent, open });
      if (!open) continue;
      walk(n.children, catKey(n.category.id));
      for (const a of n.articles) rows.push({ key: artKey(a.id), kind: "art", id: a.id, parent: catKey(n.category.id) });
    }
  };
  walk(tree, null);

  const [focusKey, setFocusKey] = useState<string | null>(null);
  const tabKey = rows.find((r) => r.key === focusKey)?.key ?? rows.find((r) => r.key === artKey(articleId ?? ""))?.key ?? rows[0]?.key;
  const refs = useRef(new Map<string, HTMLElement>());
  const setRef = (key: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(key, el);
    else refs.current.delete(key);
  };
  const focus = (key: string | undefined) => {
    if (!key) return;
    setFocusKey(key);
    refs.current.get(key)?.focus();
  };

  const toggle = (id: string, to?: boolean) => {
    const next = to ?? !isOpen(id);
    if (filtering) {
      const s = new Set(filterClosed);
      if (next) s.delete(id);
      else s.add(id);
      setFilterClosed(s);
    } else {
      const s = new Set(expanded);
      if (next) s.add(id);
      else s.delete(id);
      setExpanded(s);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-key]");
    const i = rows.findIndex((r) => r.key === el?.dataset.key);
    const row = rows[i];
    if (!row) return;
    const handled = () => {
      e.preventDefault();
      e.stopPropagation();
    };
    switch (e.key) {
      case "ArrowDown":
        handled();
        focus(rows[i + 1]?.key);
        break;
      case "ArrowUp":
        handled();
        focus(rows[i - 1]?.key);
        break;
      case "Home":
        handled();
        focus(rows[0]?.key);
        break;
      case "End":
        handled();
        focus(rows[rows.length - 1]?.key);
        break;
      case "ArrowRight":
        handled();
        if (row.kind === "cat" && !row.open) toggle(row.id, true);
        else if (row.kind === "cat") focus(rows[i + 1]?.parent === row.key ? rows[i + 1]?.key : undefined);
        break;
      case "ArrowLeft":
        handled();
        if (row.kind === "cat" && row.open) toggle(row.id, false);
        else focus(row.parent ?? undefined);
        break;
      case "Enter":
      case " ":
        if (row.kind === "cat") {
          handled();
          toggle(row.id);
        } else if (e.key === " ") {
          handled();
          refs.current.get(row.key)?.click();
        }
        break;
    }
  };

  const closeFilter = () => {
    setFilter("");
    setFilterClosed(new Set());
    setFilterOpen(false);
  };

  const renderNodes = (nodes: HelpTreeNode[], level: number) =>
    nodes.map((n) => {
      const id = n.category.id;
      const key = catKey(id);
      const open = isOpen(id);
      const inPath = activeCats.has(id);
      const highlight = inPath && level === 1;
      const labelId = `help-tree-${id}`;
      return (
        <li
          key={key}
          ref={setRef(key)}
          data-key={key}
          role="treeitem"
          aria-level={level}
          aria-expanded={open}
          aria-selected={highlight}
          aria-labelledby={labelId}
          tabIndex={tabKey === key ? 0 : -1}
          onFocus={(e) => e.target === e.currentTarget && setFocusKey(key)}
          className="outline-none [&:focus-visible>div]:ring-2 [&:focus-visible>div]:ring-action"
        >
          <div
            onClick={() => {
              toggle(id);
              focus(key);
            }}
            className={`flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 ${highlight ? "bg-action-soft font-semibold text-green-700" : inPath ? "text-green-700 hover:bg-surface-hover" : "text-text hover:bg-surface-hover"}`}
          >
            <span className="mt-0.5 shrink-0 text-text-muted">
              <Icon name={open ? "chevron-down" : "chevron-right"} size={16} />
            </span>
            <span className="mt-0.5 shrink-0">
              <Icon name="folder" size={16} />
            </span>
            <span id={labelId} className={`type-body min-w-0 break-words ${highlight ? "font-semibold" : ""}`}>
              {n.category.name}
            </span>
          </div>
          {open && (
            <ul role="group" className="ml-[15px] flex flex-col gap-0.5 border-l border-border py-0.5 pl-2">
              {renderNodes(n.children, level + 1)}
              {n.articles.map((a) => {
                const akey = artKey(a.id);
                const active = a.id === articleId;
                return (
                  <li key={akey} role="none">
                    <Link
                      ref={setRef(akey)}
                      data-key={akey}
                      href={articleHref(a.id)}
                      role="treeitem"
                      aria-level={level + 1}
                      aria-selected={active}
                      aria-current={active ? "page" : undefined}
                      tabIndex={tabKey === akey ? 0 : -1}
                      onFocus={() => setFocusKey(akey)}
                      onClick={() => onNavigate?.()}
                      className={`type-small flex items-start gap-2 rounded-sm px-2 py-1.5 no-underline outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-action ${active ? "bg-action-soft font-semibold text-green-700" : "text-text-secondary hover:bg-surface-hover hover:text-text"}`}
                    >
                      <span className="mt-0.5 shrink-0">
                        <Icon name="file-text" size={15} />
                      </span>
                      <span className="min-w-0 break-words">{a.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-text">
            <Icon name="book-open" size={20} />
          </span>
          <span className="type-title min-w-0 flex-1 font-semibold text-text">Help Center</span>
          <IconButton
            icon="search"
            label="Filter categories"
            variant="secondary"
            size="sm"
            active={filterOpen}
            aria-expanded={filterOpen}
            aria-controls="help-tree-filter"
            onClick={() => (filterOpen ? closeFilter() : setFilterOpen(true))}
          />
        </div>
        {filterOpen && (
          <div id="help-tree-filter">
            <Input
              icon="search"
              size="sm"
              autoFocus
              placeholder="Filter articles"
              aria-label="Filter help articles"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setFilterClosed(new Set());
              }}
              onKeyDown={(e) => e.key === "Escape" && closeFilter()}
            />
          </div>
        )}
      </div>
      {rows.length ? (
        <ul role="tree" aria-label="Categories" onKeyDown={onKeyDown} className="flex flex-col gap-0.5">
          {renderNodes(tree, 1)}
        </ul>
      ) : (
        <p className="type-small m-0 px-2 text-text-muted">No articles match that filter.</p>
      )}
    </div>
  );
}
