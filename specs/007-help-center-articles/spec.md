# Feature Specification: Help Center Articles

**Feature Branch**: `007-help-center-articles`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "I want the help section to be similar to this" (two reference
screenshots of a documentation-style help center: a category tree sidebar, a search landing page,
and an article page with breadcrumbs and an "On this page" outline)

## Scope at a glance

The Help module becomes a documentation-style **Help Center** modelled on the reference screenshots.
This departs from the canvas, which has a chat and three plain lists, so it is a **user-directed
design deviation**. Constitution Principle I requires that deviation to be recorded, and it is
logged below.

- **Layout and behaviour** come from the reference screenshots.
- **Look** stays UzaPro's: design tokens, typography and the app shell. Nothing from the
  reference's branding, product name or content is copied.
- **Article content** is written for UzaPro and describes how the demo actually works (selling,
  stock, purchases, money, settings). It is hardcoded demo content, like all other data.

The reference screenshots show three areas:
1. **Category sidebar**: a "Help Center" header with a search toggle, and a tree of categories,
   sub-categories and articles that can be expanded and collapsed.
2. **Landing page**: an icon, the title "UzaPro Help Center", a subtitle, a large search box, and
   the hint "Browse categories in the sidebar, or type to search.".
3. **Article page**:
   - breadcrumbs (Help Center › category › article);
   - the title and "Updated {time} ago";
   - the body with section headings and sub-headings, text, emphasis, lists, tables or callouts,
     and FAQs;
   - an "On this page" outline on the right that links to every heading.

The Help Center replaces all four existing Help tabs (Ask UzaPro, How-to guides, Help requests,
Response times): Help has a single "Help Center" tab (Clarification Q1). No floating assistant
bubble is built.

## Clarifications

### Session 2026-11-12

- Q: What happens to the existing Help tabs (Ask UzaPro, How-to guides, Help requests, Response times)? → A: The Help Center replaces all four; Help has a single "Help Center" tab and no chat.
- Q: How many articles should the demo ship with? → A: About 12 articles across 5–6 categories, with one sub-category level.
- Q: Should the Help Center page keep the generic "New" header button? → A: No; the Help Center has no header button.
- Q: When someone types in the app's top search bar on the Help Center, should it search help articles? → A: Yes; it shows the same article results as the landing page search.

## User Scenarios & Testing *(mandatory)*

All four roles can open the Help Center: every role already sees Help.

### User Story 1 - Read a help article (Priority: P1)

The presenter opens Help and sees the Help Center. The sidebar holds the category tree and the main
area holds the landing page. They expand a category (for example "Selling") and pick an article
("How to give a refund"). The article opens with:
- breadcrumbs, the title and "Updated {time} ago";
- the body;
- the "On this page" outline.

The article and its category are highlighted in the sidebar. Choosing an outline entry scrolls to
that heading. Choosing a breadcrumb goes back to the landing page or to that category.

**Why this priority**: reading guidance is the core of a help center and what the screenshots show
most.

**Independent Test**: open Help, expand a category, open an article, and confirm the breadcrumbs,
title, updated line, body sections and outline match the article. Choose an outline entry and
confirm the page scrolls to that heading.

**Acceptance Scenarios**:

1. **Given** Help, **When** it opens, **Then** the sidebar shows the top-level categories and the
   main area shows the landing page.
2. **Given** a collapsed category, **When** the presenter chooses it, **Then** it expands to show its
   sub-categories and articles. Choosing it again collapses it.
3. **Given** an article, **When** it is opened, **Then** its breadcrumbs, title, updated line, body
   and outline are shown, and it is highlighted in the sidebar with its parent categories expanded.
4. **Given** an article's outline, **When** the presenter chooses a heading, **Then** the page
   scrolls to that heading.
5. **Given** an article link that is opened directly or bookmarked, **When** it loads, **Then** that
   article opens with its category expanded.

---

### User Story 2 - Search for an answer (Priority: P1)

The presenter types in the landing page's search box ("Search help articles and answers…"). A list
of matching articles appears; each shows its title, category path and a short snippet. Matches are
found in titles and in article text. Choosing a result opens the article. The sidebar's search icon
reveals a field that filters the tree to matching articles. Clearing it restores the full tree.

**Why this priority**: the screenshots put search front and centre, and it is how a presenter finds
an answer quickly.

**Independent Test**: type "refund" on the landing page and confirm the refund articles are listed
with their category paths. Open one. Then filter the sidebar with "transfer" and confirm only
matching articles and their categories remain.

**Acceptance Scenarios**:

1. **Given** the landing page, **When** the presenter types a word that appears in an article,
   **Then** matching articles are listed, with title matches first.
2. **Given** a search with no matches, **When** results would show, **Then** a "No articles match
   that search." message is shown.
3. **Given** the sidebar search, **When** text is entered, **Then** only matching articles and their
   categories remain, expanded. **When** it is cleared, **Then** the tree returns to its previous
   state.

---

### User Story 3 - Find help in context (Priority: P2)

Articles link to the screens they describe. "How to give a refund" links to Sales › Refunds (credit
notes); "Recording a deposit" links to Accounts › Deposits. They also link to related articles. Each
article ends with a "Need help?" section.

**Why this priority**: it ties the help content to the working demo screens, but the Help Center is
useful without it.

**Independent Test**: open "How to give a refund", follow its link to the screen, and confirm Sales
› Refunds (credit notes) opens. Return, and follow a related-article link.

**Acceptance Scenarios**:

1. **Given** an article with a screen link, **When** the presenter follows it, **Then** that screen
   opens in the app, if the presenter's role can see it.
2. **Given** a screen the role can't see, **When** the link would show, **Then** it is shown as
   plain text rather than a link.

---

### Edge Cases

- Deep links to an unknown article show the landing page with a short "That article was not found."
  note.
- An article with no sub-headings shows an outline with only its top-level sections. With no
  sections at all, the outline is hidden.
- Long titles wrap in the sidebar and the breadcrumbs, and never overflow the page.
- At phone width the sidebar becomes a collapsible panel above the content, and the outline is
  hidden.
- Searches ignore letter case and extra spaces. A search of only spaces shows the landing page.

## Requirements *(mandatory)*

### Functional Requirements

**Navigation**

- **FR-001**: Help MUST have a single tab, "Help Center", replacing the Ask UzaPro, How-to guides,
  Help requests and Response times tabs (Clarification Q1). It shows a category sidebar and a main
  area, as in the reference screenshots, styled with UzaPro's design tokens. The page header has
  no action button (Clarification Q3).
- **FR-002**: The sidebar MUST show a "Help Center" header with a search toggle, and a tree of
  categories, one level of sub-categories, and articles, with expand and collapse. The open
  article and its category MUST be highlighted.
- **FR-003**: Each article MUST have its own address, so that it can be opened directly, bookmarked,
  and reached with the browser's back and forward buttons.

**Landing and search**

- **FR-004**: The landing page MUST show:
  - an icon;
  - the title "UzaPro Help Center";
  - the subtitle "Search our guides and documentation to learn how to use UzaPro.";
  - a search box with the placeholder "Search help articles and answers…";
  - the hint "Browse categories in the sidebar, or type to search.".
- **FR-005**: Search MUST match article titles and article text, ignoring case. Results MUST list
  title matches first, and show the title, category path and a snippet. With no matches it MUST
  show "No articles match that search.".
- **FR-006**: The sidebar search MUST filter the tree to matching articles and their categories.
- **FR-006a**: On the Help Center, the app's top search bar MUST search help articles, showing the
  same results as the landing page search (Clarification Q4).

**Articles**

- **FR-007**: An article page MUST show:
  - breadcrumbs (Help Center › category path › article), whose parts can be followed;
  - the title;
  - "Updated {time} ago", relative to the demo date of 10 Nov 2026;
  - the body.
- **FR-008**: Article bodies MUST support:
  - an introduction;
  - section headings and sub-headings;
  - paragraphs with bold text;
  - bullet and numbered lists;
  - a simple table;
  - a highlighted note or tip;
  - FAQs (questions as sub-headings).

  Sections are separated by dividers, as in the screenshots.
- **FR-009**: An "On this page" outline MUST list the article's headings and sub-headings, nested,
  and scroll to each one when chosen.
- **FR-010**: Articles MAY link to app screens and to other articles (US3). A screen link MUST
  respect the presenter's role.

**Content**

- **FR-011**: The Help Center MUST include UzaPro-specific categories and articles covering the
  demo's main tasks. That includes the design's three guide titles ("Setting up a POS terminal",
  "How to give a refund", "Reconciling a bank feed"). The demo ships about 12 articles across 5–6
  categories, with one sub-category level (Clarification Q2). Every article has an introduction,
  sections, and an FAQ or "Need help?" ending.
- **FR-012**: All content MUST be hardcoded, read-only demo data that looks the same on every load.

**Cross-cutting**

- **FR-013**: The Help Center MUST be keyboard and screen-reader accessible:
  - the tree behaves as a navigable tree;
  - the outline and breadcrumbs are navigation landmarks;
  - headings use proper levels.
- **FR-014**: The layout MUST stay usable at phone width (see Edge Cases).

### Key Entities

- **Category**: name, parent category (or none), order.
- **Article**: id (used in its address), title, category, "updated" date, introduction, sections,
  related articles, screen links.
- **Section**: heading, level (section or sub-section), content blocks (paragraph, list, table,
  note, FAQ).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A presenter can find and open the article that answers a common task ("give a
  refund", "move stock", "record an expense") in under 20 seconds, by search or by browsing.
- **SC-002**: 100% of articles open from the tree, from search and by direct address, with correct
  breadcrumbs and outline.
- **SC-003**: In a side-by-side review with the reference screenshots, the sidebar, landing and
  article layouts match in structure (tree, search hero, breadcrumbs, title, updated line, sections,
  outline), using UzaPro's look.
- **SC-004**: For every role, the Help Center opens with no visible errors, and the phone layout
  shows no horizontal page scroll.

## Assumptions

- The reference screenshots show another product's help center. Only the layout and behaviour are
  followed; its name, branding, colours and article text are not used.
- "Updated {time} ago" uses fixed per-article dates relative to the demo date (10 Nov 2026).
- Articles are read-only. Nobody edits help content in the demo.
- The bottom-right floating bubble in the screenshots is not built (Clarification Q1). The Ask
  UzaPro chat from feature 006 is removed from Help, along with the Help list rows (How-to guides,
  Help requests, Response times).
- Desktop is the primary demo target; phone width must stay usable.

## Design deviations

| Deviation | Reason | Reference |
|---|---|---|
| Help is rebuilt as a documentation-style Help Center modelled on reference screenshots, not the canvas's Help tabs | Requested by the user (this feature's input) | FR-001 |
| The canvas's Ask UzaPro chat, How-to guides, Help requests and Response times tabs are removed | Replaced by the Help Center (Clarification Q1) | FR-001 |
| The Cashier's and Store keeper's Help tab limit changes from Ask UzaPro and How-to guides to Help Center | Their design limit names tabs that no longer exist; without the change they would lose Help | FR-001, User Scenarios |
| Landing-page search results appear below the search box (replacing the hint); on an article, a top-bar search replaces the article with results | Keeps focus in the box while typing | FR-005, FR-006a |
| The "On this page" outline shows from 1280px wide; from 1024 to 1279px only the sidebar and article show | Too little room for three columns beside the app sidebar | FR-009, FR-014 |
| The article title is a level-2 heading (sections level 3, sub-sections and FAQs level 4) | The app's page header "Help" is the page's level-1 heading; one h1 per page | FR-013 |
| Related articles show as a "Related articles" aside after the last section | Keeps the outline to the article's own headings | US3 |
| "Sending" an invoice means PDF or Print in the article | The demo has no email sending | FR-011 |
| "Updated today" is used when an article's date is the demo date | None of the seeded articles uses it | FR-007 |

