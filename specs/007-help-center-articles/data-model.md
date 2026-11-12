# Data Model: Help Center Articles

The data is read-only and lives in `src/data/fixtures/helpcenter.ts`. It adds no store slice,
because nothing changes.

```text
HelpCategory { id: string; name: string; parent: string | null; order: number }

HelpArticle {
  id: string                  // slug, used in ?article=
  title: string
  category: string            // HelpCategory.id (a top-level or a sub-category)
  updated: string             // ISO date; "Updated … ago" is relative to DEMO_TODAY
  intro: string[]             // paragraphs ("**bold**" allowed)
  sections: HelpSection[]
  related?: string[]          // HelpArticle ids
}

HelpSection { heading: string; level: 2 | 3; blocks: HelpBlock[] }

HelpBlock =
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "note"; tone: "info" | "warning"; text: string }
  | { kind: "faq"; q: string; a: string[] }
  | { kind: "links"; screens?: { label: string; module: ModuleId; tab: string }[]; articles?: string[] }
```

## Derived (pure helpers in `src/data/helpcenter.ts`)

| Helper | Returns |
|---|---|
| `helpTree()` | the nested categories with their articles, in order |
| `articlePath(id)` | the category chain, for breadcrumbs |
| `outline(article)` | `{ id, text, level }[]`, with unique slug ids; FAQ questions count as level 3 |
| `searchArticles(q)` | ranked `{ article, path, snippet, rank }[]` |
| `filterTree(q)` | the tree reduced to matching articles and their categories |
| `updatedAgo(iso, today = DEMO_TODAY)` | e.g. "2 months ago" |

## Validation (unit tests)

- Every article's category exists.
- Every related id exists.
- Every screen link points at an in-scope module and tab.
- Outline ids are unique within an article.
- The three design guide titles are present.
