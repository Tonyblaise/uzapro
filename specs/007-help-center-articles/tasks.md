---

description: "Task list for feature 007: Help Center Articles"
---

# Tasks: Help Center Articles

**Input**: Design documents from `specs/007-help-center-articles/`

**Prerequisites**: plan.md, spec.md (Clarifications Q1–Q4), research.md (R1–R6), data-model.md,
contracts/ui-and-data.md, quickstart.md. Builds on features 001–006.

**Tests**: the constitution requires Playwright smoke tests. Vitest covers the helpers and the
content integrity.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US3 from spec.md

## Reference

The layout reference is the two screenshots in the feature input; research R6 describes them. The
canvas has no Help Center; this is a user-directed deviation. Never copy the reference product's
name, branding or text. All articles are written for UzaPro and must match how the demo actually
works, using the real button labels and messages from features 001–005.

---

## Phase 1: Setup

- [X] T001 Create the branch `007-help-center-articles` from `006-help-centre` (`git checkout -b`), and confirm `npm run typecheck && npm run lint && npm run test:unit` pass

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 Remove the feature 006 chat and Help lists:
  - delete `src/data/fixtures/help.ts`, `src/data/commands/help.ts`, `src/features/help/AskUzaPro.tsx` and `tests/unit/help.test.ts`;
  - remove the `help` slice from `src/data/store/state.ts` and `src/data/store/seed.ts`;
  - remove `ChatMessage` from `src/data/types/office.ts`;
  - remove `useChatMessages` from `src/data/queries-office.ts` and the help exports from `src/data/index.ts`;
  - remove the `sup/*` rows from `src/data/fixtures/generic.ts`.
- [X] T003 Change the registry and roles:
  - in `src/config/modules.ts`, set `sup` to the single tab `["Help Center", "helpcenter"]`;
  - add `"helpcenter"` to `ScreenKind` in `src/data/types/config.ts`;
  - in `src/config/roles.ts`, change the cashier and store `sup` limits to `["Help Center"]`.
- [X] T004 [P] Add the `HelpCategory`, `HelpArticle`, `HelpSection` and `HelpBlock` types (data-model.md) to `src/data/types/office.ts`
- [X] T005 [P] Add a book icon (Lucide `BookOpen` as `book-open`) to `src/components/ui/Icon.tsx`
- [X] T006 Create `src/data/helpcenter.ts` with the pure helpers below, and `tests/unit/helpcenter.test.ts`:
  - `helpTree`, `articlePath`, `getArticle`;
  - `outline`: unique slug ids, FAQ questions as level 3;
  - `searchArticles`: case- and space-insensitive; ranked title, then heading, then body; snippet about 140 characters;
  - `filterTree`;
  - `updatedAgo`: days, weeks or months relative to `DEMO_TODAY`, with "yesterday".

  The test runs these against a small inline fixture.
- [X] T007 Create `src/data/fixtures/helpcenter.ts`:
  - the 8 categories from research R5;
  - 2 complete sample articles that together use every block type: "How to give a refund" and "Reconciling a bank feed".

  Export the data and helpers from `src/data/index.ts` (`HELP_CATEGORIES`, `HELP_ARTICLES` and the helper functions).

**Checkpoint**: typecheck, lint and unit tests pass. `/help` resolves to `/help/help-center`. The old smoke test `help.spec.ts` is expected to fail until T012.

---

## Phase 3: User Story 1 - Read a help article (Priority: P1) 🎯 MVP

**Independent Test**: quickstart 1–4.

- [X] T008 [US1] Create `src/features/help/HelpSidebar.tsx`:
  - the "Help Center" header card (book icon, title, search icon button);
  - the category tree with chevrons, folder and file icons, indent guides, and expand/collapse state that auto-expands the open article's path;
  - the `action-soft` highlight on the active category and article;
  - `role="tree"` / `treeitem` with arrow keys, Enter, and Left/Right to collapse or expand;
  - article links that use `?article=<id>`.
- [X] T009 [P] [US1] Create `src/features/help/HelpLanding.tsx`: the round tile with the book icon, "UzaPro Help Center", "Search our guides and documentation to learn how to use UzaPro.", the large search input ("Search help articles and answers…"), and "Browse categories in the sidebar, or type to search.". Show the "That article was not found." note when `?article` is unknown.
- [X] T010 [P] [US1] Create `src/features/help/ArticleView.tsx` and `OnThisPage.tsx`:
  - breadcrumbs as a `nav` with chevrons; each part links to the landing page or opens and expands that category;
  - the `type-display` title, and "Updated {…} ago" with a clock icon;
  - the intro and the sections with rule dividers;
  - block renderers for p (with `**bold**`), ul, ol, table, note (info/warning tones), faq and links;
  - heading ids from `outline()`;
  - the right-hand "On this page" `nav`: nested entries that scroll to each heading, `aria-current` on the section in view, and hidden when there are no sections.
- [X] T011 [US1] Create `src/features/help/HelpCenter.tsx`, which puts it all together:
  - the three-column layout (sidebar about 300px, main column at most 760px, outline about 240px);
  - `?article=` routing;
  - at phone width: a "Browse categories" disclosure and the outline hidden.

  Register it as the `help-center` tab with no header action in `src/features/help/screens.tsx`. Remove the generic `screensFor("sup", …)` call.
- [X] T012 [US1] Rewrite `tests/smoke/help.spec.ts` to cover quickstart 1–4: the landing page, browsing to an article in a sub-category with its breadcrumbs, title, updated line and outline, an outline jump, a deep link, and an unknown article

---

## Phase 4: User Story 2 - Search for an answer (Priority: P1)

**Independent Test**: quickstart 5–7.

- [X] T013 [US2] Bind the landing search to the shared `useSearch`/`setSearch`. Create `src/features/help/HelpResults.tsx`, shown in the main area whenever the shared search has text:
  - each result shows the title, category path and snippet;
  - choosing one opens the article and clears the search;
  - with no matches, "No articles match that search." is shown.

  This makes the top bar search articles too (Q4).
- [X] T014 [US2] Add the sidebar filter in `HelpSidebar.tsx`: the search icon reveals a field that filters the tree with `filterTree`, showing matches expanded. Clearing the field restores the previous expand state.
- [X] T015 [US2] Extend `tests/smoke/help.spec.ts` with quickstart 5–7: "refund" in the landing search, "transfer" in the top search bar, the sidebar filter "deposit", and no matches

---

## Phase 5: User Story 3 - Find help in context (Priority: P2)

**Independent Test**: quickstart 8.

- [X] T016 [US3] In `ArticleView.tsx`, make screen links real in-app links when `canSee(role, module, tab)` holds, and plain text otherwise. Related-article links open those articles. Every article ends with a "Need help?" section.
- [X] T017 [US3] Extend `tests/smoke/help.spec.ts` with quickstart 8: the refund article's link opens Sales › Refunds (credit notes), and as the Cashier an Accounts link is plain text

---

## Phase 6: Content

- [X] T018 Write the remaining 10 articles in `src/data/fixtures/helpcenter.ts`, following research R5:
  - Finding your way around UzaPro
  - Recording a sale
  - Sending an invoice and recording its payment
  - Adding a product
  - Moving stock between stores
  - Ordering from a supplier and receiving goods
  - Recording a deposit
  - Recording an expense
  - Setting up a POS terminal
  - Adding a branch and its store

  Each has 2–5 sections, at least one list, real button labels and messages checked against the live screens, screen links where useful, and a "Need help?" or FAQ ending. Add content-integrity unit tests to `tests/unit/helpcenter.test.ts`: 12 articles, categories exist, related ids exist, screen links point at in-scope tabs, unique outline ids, and the three design guide titles present.

---

## Phase 7: Polish & Cross-Cutting

- [X] T019 [P] In `tests/smoke/responsive.spec.ts`, replace the `/help/ask-uzapro` and `/help/help-requests` routes with `/help/help-center` and `/help/help-center?article=how-to-give-a-refund`. Run the accessibility scan over the landing page, the results and an article.
- [X] T020 Do a visual review against the reference screenshots (structure only) and log any accepted differences in `specs/007-help-center-articles/spec.md` › Design deviations. Mark feature 006's spec as superseded by feature 007 (a note at the top of `specs/006-help-centre/spec.md`).
- [X] T021 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`), walk through quickstart 1–10, and commit on `007-help-center-articles`

---

## Dependencies & Execution Order

- Setup → Foundational (T002–T007) → US1 → US2 → US3. Content (T018) and Polish run last.
- **T018 (content)** depends only on T004, T006 and T007, so it can run in parallel with all the UI
  work (T008–T017). It shares no files with the UI.
- The tasks within US1 that are marked [P] (T009, T010) touch separate files.

### Parallel opportunities

- T004 and T005.
- Two tracks after Foundational:
  - **UI**: T008–T017, in the `src/features/help/` files and `help.spec.ts`.
  - **Content**: T018, in the fixture and its unit tests.

## Implementation Strategy

1. **MVP**: Phases 1–3. The tree, landing page and article view work with the 2 sample articles.
2. Add search (US2) and links (US3) while the content track writes the other 10 articles.
3. Polish, run every gate and commit.
