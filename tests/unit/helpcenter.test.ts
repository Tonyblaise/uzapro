import { describe, expect, it } from "vitest";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  articlePath,
  filterTree,
  helpTree,
  outline,
  resolveScreenLink,
  searchArticles,
  updatedAgo,
} from "@/data";
import type { HelpArticle, HelpCategory } from "@/data/types";

const cats: HelpCategory[] = [
  { id: "a", name: "Alpha", parent: null, order: 2 },
  { id: "b", name: "Beta", parent: null, order: 1 },
  { id: "a1", name: "Alpha child", parent: "a", order: 1 },
];
const art = (id: string, title: string, category: string, body: string, heading = "Steps"): HelpArticle => ({
  id,
  title,
  category,
  updated: "2026-11-01",
  intro: ["Intro for " + title],
  sections: [{ heading, level: 2, blocks: [{ kind: "p", text: body }, { kind: "faq", q: "Steps", a: ["Answer"] }] }],
});
const arts = [art("x", "Moving stock", "a1", "Use a transfer between stores."), art("y", "Transfer money", "b", "Accounts page."), art("z", "Deposits", "b", "Nothing here", "Transfer rules")];

describe("tree and paths", () => {
  it("nests categories by parent and order", () => {
    const t = helpTree(cats, arts);
    expect(t.map((n) => n.category.id)).toEqual(["b", "a"]);
    expect(t[1]!.children[0]!.articles.map((a) => a.id)).toEqual(["x"]);
    expect(articlePath("x", cats, arts).map((c) => c.name)).toEqual(["Alpha", "Alpha child"]);
  });

  it("builds unique outline ids, with FAQ questions as level 3", () => {
    expect(outline(arts[0]!)).toEqual([
      { id: "steps", text: "Steps", level: 2 },
      { id: "steps-2", text: "Steps", level: 3 },
    ]);
  });
});

describe("search", () => {
  it("ranks title, then heading, then body matches, ignoring case and spaces", () => {
    const r = searchArticles("  TRANSFER ", cats, arts);
    expect(r.map((x) => [x.article.id, x.rank])).toEqual([
      ["y", 0],
      ["z", 1],
      ["x", 2],
    ]);
    expect(r[2]!.snippet).toContain("transfer");
    expect(r[2]!.path.map((c) => c.id)).toEqual(["a", "a1"]);
  });

  it("returns nothing for blank text and filters the tree to matches", () => {
    expect(searchArticles("   ", cats, arts)).toEqual([]);
    const t = filterTree("moving", cats, arts);
    expect(t.map((n) => n.category.id)).toEqual(["a"]);
    expect(t[0]!.children[0]!.articles.map((a) => a.id)).toEqual(["x"]);
  });
});

describe("updatedAgo", () => {
  it("uses days, weeks, months and years relative to the demo date", () => {
    expect(updatedAgo("2026-11-09")).toBe("1 day ago");
    expect(updatedAgo("2026-10-27")).toBe("2 weeks ago");
    expect(updatedAgo("2026-09-08")).toBe("2 months ago");
    expect(updatedAgo("2025-10-01")).toBe("1 year ago");
  });
});

describe("content integrity", () => {
  const ids = new Set(HELP_ARTICLES.map((a) => a.id));
  it("every article has a known category, related ids and resolvable screen links", () => {
    for (const a of HELP_ARTICLES) {
      expect(HELP_CATEGORIES.some((c) => c.id === a.category), a.id).toBe(true);
      for (const r of a.related ?? []) expect(ids.has(r), `${a.id} → ${r}`).toBe(true);
      for (const s of a.sections)
        for (const b of s.blocks)
          if (b.kind === "links") {
            for (const l of b.screens ?? []) expect(resolveScreenLink(l), `${a.id}: ${l.label}`).not.toBeNull();
            for (const r of b.articles ?? []) expect(ids.has(r), `${a.id} → ${r}`).toBe(true);
          }
      const o = outline(a).map((e) => e.id);
      expect(new Set(o).size, a.id).toBe(o.length);
    }
  });

  it("has the 12 planned articles with unique ids, including the design's three guides", () => {
    expect(HELP_ARTICLES).toHaveLength(12);
    expect(ids.size).toBe(HELP_ARTICLES.length);
    const titles = HELP_ARTICLES.map((a) => a.title);
    for (const t of ["Setting up a POS terminal", "How to give a refund", "Reconciling a bank feed"]) expect(titles).toContain(t);
  });

  it("gives every category at least one article, directly or in a sub-category", () => {
    for (const c of HELP_CATEGORIES) {
      const scope = [c.id, ...HELP_CATEGORIES.filter((x) => x.parent === c.id).map((x) => x.id)];
      expect(HELP_ARTICLES.some((a) => scope.includes(a.category)), c.id).toBe(true);
    }
  });

  it("gives every article at least 2 sections and at least one list", () => {
    for (const a of HELP_ARTICLES) {
      expect(a.sections.length, a.id).toBeGreaterThanOrEqual(2);
      expect(a.sections.some((s) => s.blocks.some((b) => b.kind === "ul" || b.kind === "ol")), a.id).toBe(true);
    }
  });

  it("resolves a screen link to its tab title and address", () => {
    expect(resolveScreenLink({ label: "x", module: "fin", tab: "transactions" })).toEqual({ moduleId: "fin", tabTitle: "Transactions", href: "/accounts/transactions" });
    expect(resolveScreenLink({ label: "x", module: "fin", tab: "nope" })).toBeNull();
  });
});
