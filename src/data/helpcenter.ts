/**
 * Help Center helpers (feature 007, data-model.md). Pure: every function takes the categories and
 * articles, defaulting to the read-only fixture, so unit tests can pass a small inline set.
 */
import { MODULES } from "@/config/modules";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { HELP_ARTICLES, HELP_CATEGORIES } from "./fixtures/helpcenter";
import type { HelpArticle, HelpScreenLink, ModuleId, HelpCategory, HelpOutlineEntry, HelpSearchResult, HelpTreeNode } from "./types";

type Cats = readonly HelpCategory[];
type Arts = readonly HelpArticle[];

const byOrder = (a: HelpCategory, b: HelpCategory) => a.order - b.order;

/** Categories nested by parent, each with its articles in fixture order. */
export function helpTree(cats: Cats = HELP_CATEGORIES, arts: Arts = HELP_ARTICLES): HelpTreeNode[] {
  const build = (parent: string | null): HelpTreeNode[] =>
    cats
      .filter((c) => c.parent === parent)
      .sort(byOrder)
      .map((category) => ({ category, children: build(category.id), articles: arts.filter((a) => a.category === category.id) }));
  return build(null);
}

export function getArticle(id: string | null | undefined, arts: Arts = HELP_ARTICLES): HelpArticle | undefined {
  return id ? arts.find((a) => a.id === id) : undefined;
}

/** Category chain from the top level down to the article's category (breadcrumbs). */
export function articlePath(id: string, cats: Cats = HELP_CATEGORIES, arts: Arts = HELP_ARTICLES): HelpCategory[] {
  const art = getArticle(id, arts);
  return art ? categoryPath(art.category, cats) : [];
}

export function categoryPath(categoryId: string, cats: Cats = HELP_CATEGORIES): HelpCategory[] {
  const out: HelpCategory[] = [];
  let cur = cats.find((c) => c.id === categoryId);
  let guard = 0;
  while (cur && guard++ < 20) {
    out.unshift(cur);
    const parent: string | null = cur.parent;
    cur = parent ? cats.find((c) => c.id === parent) : undefined;
  }
  return out;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Headings (level 2) and sub-headings (level 3, including FAQ questions), with unique ids. */
export function outline(article: HelpArticle): HelpOutlineEntry[] {
  const used = new Map<string, number>();
  const id = (text: string) => {
    const base = slugify(text) || "section";
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n ? `${base}-${n + 1}` : base;
  };
  const out: HelpOutlineEntry[] = [];
  for (const s of article.sections) {
    out.push({ id: id(s.heading), text: s.heading, level: s.level });
    for (const b of s.blocks) if (b.kind === "faq") out.push({ id: id(b.q), text: b.q, level: 3 });
  }
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const plain = (s: string) => s.replace(/\*\*/g, "");

/** All body text of an article as plain strings, in reading order. */
export function articleText(a: HelpArticle): string[] {
  const out = [...a.intro];
  for (const s of a.sections)
    for (const b of s.blocks) {
      if (b.kind === "p" || b.kind === "note") out.push(b.text);
      else if (b.kind === "ul" || b.kind === "ol") out.push(...b.items);
      else if (b.kind === "table") out.push(b.head.join(" "), ...b.rows.map((r) => r.join(" ")));
      else if (b.kind === "faq") out.push(b.q, ...b.a);
      else if (b.kind === "links") out.push(...(b.screens ?? []).map((l) => l.label));
    }
  return out.map(plain);
}

function snippetAround(text: string, q: string, len = 140): string {
  const i = text.toLowerCase().indexOf(q);
  if (text.length <= len) return text;
  const start = Math.max(0, Math.min(i < 0 ? 0 : i - 40, text.length - len));
  return (start > 0 ? "…" : "") + text.slice(start, start + len).trim() + (start + len < text.length ? "…" : "");
}

/** Ranked search over titles, headings and body text (case and space insensitive). */
export function searchArticles(query: string, cats: Cats = HELP_CATEGORIES, arts: Arts = HELP_ARTICLES): HelpSearchResult[] {
  const q = norm(query);
  if (!q) return [];
  const out: HelpSearchResult[] = [];
  for (const a of arts) {
    const body = articleText(a);
    const intro = plain(a.intro[0] ?? "");
    let rank: 0 | 1 | 2 | -1 = -1;
    let snippet = intro;
    if (norm(a.title).includes(q)) rank = 0;
    else if (a.sections.some((s) => norm(s.heading).includes(q) || s.blocks.some((b) => b.kind === "faq" && norm(b.q).includes(q)))) rank = 1;
    else {
      const hit = body.find((t) => norm(t).includes(q));
      if (hit) {
        rank = 2;
        snippet = snippetAround(hit.replace(/\s+/g, " "), q);
      }
    }
    if (rank >= 0) out.push({ article: a, path: categoryPath(a.category, cats), snippet: snippetAround(snippet, q), rank: rank as 0 | 1 | 2 });
  }
  const order = new Map(arts.map((a, i) => [a.id, i]));
  return out.sort((x, y) => x.rank - y.rank || (order.get(x.article.id) ?? 0) - (order.get(y.article.id) ?? 0));
}

/** The tree reduced to articles matching the query (and the categories that hold them). */
export function filterTree(query: string, cats: Cats = HELP_CATEGORIES, arts: Arts = HELP_ARTICLES): HelpTreeNode[] {
  const q = norm(query);
  if (!q) return helpTree(cats, arts);
  const keep = new Set(searchArticles(q, cats, arts).map((r) => r.article.id));
  const prune = (nodes: HelpTreeNode[]): HelpTreeNode[] =>
    nodes
      .map((n) => ({ ...n, children: prune(n.children), articles: n.articles.filter((a) => keep.has(a.id)) }))
      .filter((n) => n.articles.length || n.children.length);
  return prune(helpTree(cats, arts));
}

/** "3 days ago", "2 weeks ago", "2 months ago", "1 year ago", relative to the demo date. */
export function updatedAgo(iso: string, today: string = DEMO_TODAY): string {
  const days = Math.max(0, Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / 864e5));
  const unit = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"} ago`;
  if (days === 0) return "today";
  if (days < 7) return unit(days, "day");
  if (days < 30) return unit(Math.floor(days / 7), "week");
  if (days < 365) return unit(Math.floor(days / 30), "month");
  return unit(Math.floor(days / 365), "year");
}

/** Split "**bold**" segments for rendering: odd indexes are bold. */
export function boldParts(text: string): string[] {
  return text.split("**");
}

/**
 * Resolve a screen link to its module, tab title (what role checks use) and address
 * `/{module slug}/{tab slug}` (analysis I1). Null when the module or tab doesn't exist.
 */
export function resolveScreenLink(link: HelpScreenLink): { moduleId: ModuleId; tabTitle: string; href: string } | null {
  const m = MODULES.find((x) => x.id === link.module);
  const t = m?.tabs.find((x) => x.slug === link.tab);
  return m && t && m.inScope ? { moduleId: m.id, tabTitle: t.title, href: `/${m.slug}/${t.slug}` } : null;
}
