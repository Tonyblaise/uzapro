# Implementation Plan: Uza AI

**Branch**: `008-uza-ai` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-uza-ai/spec.md`

## Summary

Build the canvas's **Uza AI**: a floating launcher on every signed-in page that opens a 460px
right-hand panel with three tabs.

- **Uza AI chat**:
  - scripted answers worked out from the live demo data, limited by role (Clarification Q1);
  - action buttons that open the right screen;
  - a list of past chats with filters;
  - problem reports that become support tickets.
- **Support**: tickets with their conversations, replies, and a new-request form with automatic
  replies by priority.
- **Features**: Roadmap, My ideas, Browse with voting, and New with a similar-ideas check.

Every signed-in page gets 88px of space at the bottom so the launcher never covers its last
controls (Clarification Q2).

Technical approach:
- a new `ai` store slice seeded from a fixture;
- pure helpers in `src/data/uzaai.ts` (the answer engine, grouping, similarity), all unit tested;
- commands for every action;
- one `src/features/uzaai/` component tree mounted in `AppShell`.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: unchanged (Next.js 16, React, Zustand, Tailwind 4, lucide-react). There
are no new packages; the 8 extra icons come from lucide-react.

**Storage**: none new. The in-memory `ai` slice is re-seeded on reload.

**Testing**:
- Vitest: `tests/unit/uzaai.test.ts` covers the answers, role gate, tickets, ideas, grouping and the
  "Viewing" label.
- Playwright: `tests/smoke/uzaai.spec.ts`, plus an axe scan and the panel at 320px in
  `responsive.spec.ts`.
- The mobile audit gets a launcher-overlap check.

**Target Platform / Project Type**: unchanged (a static-export web app on the Cloudflare Worker)

**Performance Goals**: a reply about 0.7 seconds after sending (the design's delay). The panel opens
instantly.

**Constraints**:
- Design tokens only. The gradient (`--green-500` to `--green-800`), `--green-50` ring and
  `--shadow-lg` all exist. The launcher's green-tinted shadow becomes a new token,
  `--shadow-fab`, in `tokens.css`.
- No network calls; attached files are never read (FR-017).
- Accessible dialog, tabs and live region.
- No sideways scrolling from 320px up.

**Scale/Scope**:
- 1 launcher and 1 panel with 3 tabs and 9 views (chat list, chat, support list, support form,
  ticket, roadmap, my ideas, browse, new idea);
- 3 seeded chats, 3 tickets and 8 ideas;
- about 13 pure helpers and about 20 commands.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ with recorded deviations | The panel, copy, data and flows are taken from canvas version 1794506539. The five deviations (role-limited answers, page bottom space, accessibility additions, the toast without its exclamation mark, the panel's lower layer) are user decisions, constitution requirements or technical needs, and are logged in spec › Design deviations. The idea toast drops its exclamation mark (Principle IV), and this is recorded. |
| II. Data behind a seam | ✅ | The seed is copied exactly from the canvas file's `aiStore` and `aiTicketMsgs` (a Principle I source), so no values are invented. The fixture `fixtures/uzaai.ts`, the slice, the helpers and the commands sit behind `@/data`. The UI imports only `@/data`. The answer engine reads store snapshots, not fixtures. |
| III. Ephemeral in-memory | ✅ | The `ai` slice resets on reload. No new storage keys. File attachments keep only the name. |
| IV. Tokens & accessibility | ✅ | Token colours (plus the new `--shadow-fab` token); a dialog with focus trap and Escape; a tablist; `aria-pressed` votes; a polite live region; visible focus. |
| V. Component and config-driven | ✅ | One feature folder. Answer targets use `hrefFor` and `canSee` from the module and role registries. |
| VI. Simplicity & types | ✅ | No new dependencies. Discriminated unions for actions. Pure, testable helpers. |

**Gate result**: PASS.

**Post-design re-check**: PASS. The data model and contract add no network access, no storage and no
dependencies.

## Project Structure

### Documentation

`specs/008-uza-ai/` contains plan.md, research.md, data-model.md, quickstart.md,
contracts/ui-and-data.md, checklists/requirements.md, and tasks.md (from `/speckit-tasks`).

### Source Code (changes on top of features 001–007)

```text
src/
├── components/
│   ├── shell/AppShell.tsx            # mount <UzaAi/>; main gets pb-[88px]
│   └── ui/
│       ├── Icon.tsx                  # + sparkles, message-square, lightbulb, wrench, paperclip,
│       │                             #   send, thumbs-up, arrow-up-right
│       └── Overlay.tsx               # export useDialog
├── data/
│   ├── types/office.ts               # AiAction, AiMessage, AiChat, SupportTicket, FeatureIdea…
│   ├── fixtures/uzaai.ts             # NEW: seeded chats, tickets, ideas, stop words, fixed copy
│   ├── uzaai.ts                      # NEW: answer(), chatAge/Groups, roadmap, browse/my/similar
│   │                                 #   ideas, nextTicketRef, tones, viewingLabel, clipSubject
│   ├── commands/uzaai.ts             # NEW: open/close, chat, support, features commands
│   ├── commands/session.ts           # signOut closes the panel
│   ├── store/state.ts, store/seed.ts # the ai slice
│   ├── queries-office.ts             # useUzaAi, useViewingLabel
│   └── index.ts                      # exports
├── features/uzaai/                   # NEW
│   ├── UzaAi.tsx                     # launcher + panel shell (dialog, tabs, close)
│   ├── ChatList.tsx, ChatView.tsx, Composer.tsx
│   ├── SupportList.tsx, SupportForm.tsx, TicketView.tsx
│   ├── FeaturesTab.tsx               # switch + Roadmap / list / new idea
│   └── shared.tsx                    # AiBadge (gradient sparkles), Bubble, IdeaCard
└── styles/
    ├── tokens.css                    # --shadow-fab
    └── globals.css                   # .uz-fab tooltip, .uz-dots typing animation
                                      # (reduced-motion safe)
tests/
├── unit/uzaai.test.ts                # NEW
└── smoke/uzaai.spec.ts               # NEW; responsive.spec.ts adds the panel at 320px
```

**Structure Decision**: follows the existing pattern: a data slice, fixtures, pure helpers and
commands behind `@/data`, and one feature folder for the UI. The panel lives in the shell rather
than a route, because the design overlays it on every page.

## Complexity Tracking

None. There are no constitution violations to justify.
