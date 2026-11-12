# Implementation Plan: Help Center Articles

**Branch**: `007-help-center-articles` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-help-center-articles/spec.md`

## Summary

Replace Help's four tabs with a single documentation-style **Help Center**, modelled on the user's
reference screenshots and styled with UzaPro's tokens.

- **Sidebar**: a category tree with expand and collapse, the current article highlighted, and a
  filter behind a search icon.
- **Landing page**: a search hero.
- **Article pages**: breadcrumbs, title, "Updated … ago", sectioned bodies with lists, tables, notes
  and FAQs, and an "On this page" outline.
- **Search**: shared with the app's top bar (Q4).
- **Content**: 12 UzaPro articles in 6 categories (two of them with a sub-category), written to
  match how the demo actually works.

Feature 006's chat and the Help lists are removed (Q1).

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: unchanged. Nothing new; article bodies are typed data, not markdown.

**Storage**: none new. The content is a read-only fixture. The landing search uses the existing
shared search value.

**Testing**:
- Vitest: the tree, path, outline, search ranking and snippets, the relative "updated" time, and
  content integrity (categories, related ids, screen links, unique heading ids, the design guide
  titles).
- Playwright: `help.spec.ts` (rewritten), plus phone width and roles.

**Target Platform / Project Type**: unchanged

**Performance Goals**: search results update as the presenter types, over 12 articles

**Constraints**:
- Tokens only. None of the reference product's branding or content is used.
- Accessible tree, outline and breadcrumbs.
- Nothing leaves the browser.

**Scale/Scope**: 1 module, 1 tab, 3 views (landing, results, article), 12 articles, 8 categories
(6 top-level and 2 sub-categories)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ with recorded deviation | The canvas has no Help Center; the user directed this redesign (the feature input, Q1). It is logged in spec › Design deviations, including the Cashier and Store keeper tab-limit change (research R1). All other modules are untouched. |
| II. Data behind a seam | ✅ | Fixtures and pure helpers sit behind `@/data`. UI imports only `@/data`. |
| III. Ephemeral in-memory | ✅ | Read-only content and transient search state. No storage keys. |
| IV. Tokens & accessibility | ✅ | Token styling, a tree with keyboard support, `nav` landmarks, proper heading levels. |
| V. Component and config-driven | ✅ | The registry entry becomes one `helpcenter` tab. A `help` feature folder holds the views. |
| VI. Simplicity & types | ✅ | Typed content blocks instead of a markdown dependency. Small pure helpers. |

**Gate result**: PASS (with the user-directed deviation recorded).

## Project Structure

### Documentation

`specs/007-help-center-articles/` contains plan.md, research.md, data-model.md, quickstart.md,
contracts/ui-and-data.md, checklists/requirements.md, and tasks.md (from `/speckit-tasks`).

### Source Code (changes on top of features 001–006)

```text
src/
├── config/modules.ts                 # sup → [["Help Center", "helpcenter"]]
├── config/roles.ts                   # cashier/store sup limit → ["Help Center"]
├── data/
│   ├── types/office.ts, types/config.ts   # Help* types; ScreenKind "helpcenter"; remove ChatMessage
│   ├── fixtures/helpcenter.ts        # NEW: categories and 12 articles
│   ├── helpcenter.ts                 # NEW pure helpers (tree, path, outline, search, filter, updatedAgo)
│   ├── fixtures/help.ts, commands/help.ts   # REMOVE (feature 006 chat)
│   ├── fixtures/generic.ts           # REMOVE sup/* rows
│   ├── store/state.ts, seed.ts       # REMOVE help slice
│   ├── queries-office.ts, index.ts   # remove chat exports; export the help center API
├── components/ui/Icon.tsx            # add a book icon (and any other missing icon)
├── features/help/                    # REPLACE: HelpCenter, HelpSidebar (tree + filter), HelpLanding,
│                                     #   HelpResults, ArticleView (blocks), OnThisPage, screens.tsx
tests/unit/helpcenter.test.ts          # NEW (replaces help.test.ts)
tests/smoke/help.spec.ts               # REWRITE; responsive routes updated
```

**Structure Decision**: one `help` feature folder. Two tracks can run in parallel after the
foundation: the article content (fixtures) and the UI. They meet at the typed content model.

### Build order (input to `/speckit-tasks`)

1. Foundation: types, the registry and roles change, removal of the feature 006 chat and lists,
   helpers with unit tests, an initial fixture (categories plus 2 sample articles that use every
   block type), and the icon.
2. US1: sidebar tree, landing page, article view and outline, deep links.
3. US2: landing and top-bar search results, sidebar filter.
4. US3: screen and related-article links with role checks, the "Need help?" ending.
5. Content: all 12 articles, reviewed against the live screens.
6. Smoke tests, phone width and accessibility, visual review, gates, commit.

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected because |
|---|---|---|
| Departs from the canvas (Principle I) | The user explicitly asked for this Help Center (the feature input, Q1) | Keeping the canvas Help tabs would ignore the request. The deviation is recorded, as Principle I requires. |
