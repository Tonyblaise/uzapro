# Research: Help Center Articles

Sources: the two reference screenshots in the feature input, the spec's clarifications (Q1–Q4), and
the existing app code. The canvas has no Help Center, so this is a user-directed deviation.

## R1. Module shape (Q1, Q3)

- Help (`sup`) has a single tab, "Help Center" (slug `help-center`), which replaces Ask UzaPro, How-to
  guides, Help requests and Response times.
- The page header has no action (Q3).
- The tab strip is hidden, because there is only one tab. This is the existing rule in
  `ModuleScreen`: `hasTabs` is set when there is more than one tab.
- **Removed** (feature 006): `AskUzaPro.tsx`, `commands/help.ts`, `fixtures/help.ts`, the `help`
  slice, `ChatMessage`, `useChatMessages`, the `sup/*` generic rows, and their tests
  (`tests/unit/help.test.ts`, `tests/smoke/help.spec.ts`, which is rewritten).
- **Decision**:
  - The registry entry becomes `["Help Center", "helpcenter"]`, using a new `ScreenKind`.
  - Every role keeps seeing Help.
  - The Cashier and Store keeper's design tab limit (`sup: ['Ask UzaPro', 'How-to guides']`) would
    hide the new tab, so their `sup` limit changes to `["Help Center"]` in `src/config/roles.ts`.
    This is logged as a deviation.

## R2. Article addresses (FR-003)

- Routes are `/[module]/[tab]`, and overlays use search parameters.
- **Decision**:
  - `/help/help-center` shows the landing page.
  - `/help/help-center?article=<id>` shows an article.
  - `#<heading-id>` anchors point at sections, and the outline uses them.
- Browser back and forward work because the router keeps the history.
- An unknown `article` value shows the landing page with "That article was not found.".
- **Alternatives**: a third route segment. Rejected because the route tree is fixed at
  `[module]/[tab]`, and a search parameter matches the app's overlay convention.

## R3. Search (FR-005, FR-006, FR-006a / Q4)

- The app already shares one search value (`useSearch`/`setSearch`). The top bar writes it, it is
  cleared on tab change, and File Manager binds its own search box to it.
- **Decision**:
  - The landing search box binds to the shared search value, so the top bar and the landing box
    are one search (Q4).
  - While the shared search has text, the main area shows results instead of the landing hero or
    the article. Choosing a result opens the article and clears the search.
  - The sidebar filter is separate, local state behind the search icon, and it filters the tree only.
- **Matching**:
  - Case-insensitive, with trimmed and collapsed spaces.
  - It matches the title, the section headings and the body text.
  - Title matches rank first, then heading matches, then body matches; within a rank, articles keep
    their tree order.
  - The snippet is about 140 characters of plain text around the first body match, or the article's
    introduction for a title match.
- Implemented as a pure `searchArticles(query)` helper with unit tests.

## R4. Article content model (FR-007–FR-011, Q2)

- **Decision**: articles are typed data, not markdown, so rendering stays fully in our components and
  tokens. The body is an introduction plus sections. Each section has a heading, a level (2 or 3)
  and blocks.
- Block types:
  - `p`: paragraph text with `**bold**` segments, parsed by a tiny helper
  - `ul` / `ol`: lists
  - `table`: a header row and data rows
  - `note`: a highlighted tip, with a tone of info or warning
  - `faq`: a question (level 3 heading) and its answer paragraphs
  - `links`: screen links and related-article links (US3)
- A screen link is `{ label, module, tab }`. It renders as a link only when the role can see that
  module and tab (`canSee`); otherwise it is plain text.
- Heading ids are slugs of the heading text, made unique within the article.
- "Updated {n} {unit} ago": each article has an `updated` ISO date, and the time is computed
  relative to `DEMO_TODAY` (2026-11-10) in days, weeks or months ("Updated 2 months ago",
  "Updated 3 weeks ago", "Updated yesterday").

## R5. Content plan (Q2: about 12 articles, 6 categories, one sub-category level)

| Category | Sub-category | Articles |
|---|---|---|
| Getting started | — | Finding your way around UzaPro |
| Selling | — | Recording a sale; How to give a refund |
| Selling | Invoices and quotations | Sending an invoice and recording its payment |
| Stock and products | — | Adding a product; Moving stock between stores |
| Buying | — | Ordering from a supplier and receiving goods |
| Money | — | Recording a deposit; Reconciling a bank feed |
| Money | Expenses | Recording an expense |
| Settings | — | Setting up a POS terminal; Adding a branch and its store |

- That is 12 articles. It includes the design's three guide titles: "Setting up a POS terminal",
  "How to give a refund" and "Reconciling a bank feed".
- Content rules:
  - Every step must match how the demo actually works, using the real button labels and messages
    from features 001–005 (for example "Sale recorded.", "Raise credit note", "Record payment").
  - "Reconciling a bank feed" describes matching a bank statement against Accounts › Transactions
    with the account and date filters. There is no automatic bank feed.
  - Each article has 2–5 sections, at least one list, and an FAQ or a "Need help?" ending. At least
    one article uses a table, and at least one uses a note.
  - The voice follows the design system's content rules: sentence case, KES amounts, no emoji, no
    exclamation marks.
- The content is written by one agent and reviewed against the live screens before commit.

## R6. Layout and look (FR-001, FR-013, FR-014)

**Desktop** (≥ 1024px): three columns.
- **Sidebar**, about 300px:
  - a "Help Center" header card with a book icon and a search icon button that reveals the filter
    field;
  - the tree: chevrons, folder icons for categories and file icons for articles, indent guides, and
    an `action-soft` highlight with green text on the active category and article.
- **Main**: a column at most 760px wide.
- **"On this page" outline**, about 240px: an eyebrow heading, the entries, indented
  sub-headings, and a left rule.

**Landing**: centred. A 64px round `green-50` tile with a book icon, the `type-display` title, a
muted subtitle, the large search input, and the hint.

**Article**:
- breadcrumbs with chevrons;
- the `type-display` title;
- the updated line with a clock icon;
- sections divided by a rule, with level 2 headings in `type-h2` and level 3 in `type-title`.

**Tokens**:
- The book icon (`book-open`, or the nearest Lucide icon) is added to the shared Icon map.
- Colours are tokens only.

**Phone**:
- The sidebar collapses into a "Browse categories" disclosure above the content.
- The outline is hidden.

**Accessibility**:
- The tree uses `role="tree"` and `treeitem`, with arrow-key navigation, Enter to open, and
  Left/Right to collapse or expand.
- The breadcrumbs and the outline are `nav` landmarks.
- The outline marks the current section with `aria-current` while scrolling.
