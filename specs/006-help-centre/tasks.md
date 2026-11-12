---

description: "Task list for feature 006: Help Centre"
---

# Tasks: Help Centre

**Input**: Design documents from `specs/006-help-centre/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-and-data.md,
quickstart.md. Builds on features 001–005, and reuses feature 005's generic screens.

**Tests**: the constitution requires Playwright smoke tests. Vitest covers the send rule.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US2 from spec.md

## How to read the design

In `design/canvas/Uzapoint ERP.dc.html`:
- the chat markup `isChat` (lines ~1210–1236);
- the seed `messages` in the initial state (line ~2797);
- `send` (line ~3953);
- the view model `messages`, `draft`, `onDraft` and `onDraftKey` (line ~5427).

The list rows are in `design/canvas/erp-data.js` › `UZ_MODS` › `sup`. Copy all strings exactly.

---

## Phase 1: Setup

- [ ] T001 Create the branch `006-help-centre` from `005-office-people-settings` (`git checkout -b`), and confirm `npm run typecheck && npm run lint && npm run test:unit` pass

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 [P] Add the fixtures:
  - `src/data/fixtures/help.ts`: the three seed messages and `CHAT_REPLY`, verbatim.
  - `src/data/fixtures/generic.ts`: the `sup/how-to-guides`, `sup/help-requests` and `sup/response-times` rows, verbatim, with pills via `P()`.
- [X] T003 Add the `ChatMessage` type to `src/data/types/office.ts` and a `help` slice (`messages`) to `src/data/store/state.ts`, seeded in `src/data/store/seed.ts`
- [X] T004 Create `src/data/commands/help.ts` with `sendChatMessage(text)`:
  - it trims the text and returns `fail` for blank text;
  - otherwise it appends the user's message, then `CHAT_REPLY`, in one update, with no toast.

  Add `useChatMessages()` to `src/data/queries-office.ts`, export both from `src/data/index.ts`, and add `tests/unit/help.test.ts` covering a blank message, the reply order and the seed.
- [X] T005 Set `inScope: true` for `sup` in `src/config/modules.ts`, with the columns for the three list tabs from the design. Create `src/features/help/screens.tsx`, which combines `screensFor("sup", ["how-to-guides", "help-requests", "response-times"])` (export `screensFor` from `src/features/generic/screens.tsx` if it isn't already) with the Ask UzaPro screen, and register it in `src/features/screens.ts`.

**Checkpoint**: `/help` opens on Ask UzaPro, and the existing smoke tests pass, except the placeholder check fixed in T010.

---

## Phase 3: User Story 1 - Ask the assistant (Priority: P1) 🎯 MVP

**Independent Test**: quickstart 1–3.

- [X] T006 [US1] Create `src/features/help/AskUzaPro.tsx`:
  - the 640px column;
  - the header card (green-50 tile with `circle-help`, "UzaPro assistant" and its line);
  - the message bubbles: the user's right on the action colour, the assistant's left on the surface colour, at most 80% wide, `radius-lg`;
  - the new messages inside a polite live region;
  - the composer: an Input labelled "Message" with the placeholder "Type a message", Enter sends, plus a "Send" button.

  Register it as `ask-uzapro` in `src/features/help/screens.tsx`, with the generic "New" header action and `NewRecordDrawer`.
- [X] T007 [US1] Write `tests/smoke/help.spec.ts` covering quickstart 1–3: the seed, sending with Enter and with the button, a blank message ignored, and the conversation kept after visiting Dashboard

---

## Phase 4: User Story 2 - Browse guides, help requests and response times (Priority: P2)

**Independent Test**: quickstart 4–6.

- [X] T008 [US2] Confirm the three list tabs render through the generic screens (T005), with their header "New", View drawer and Owner-only Delete
- [X] T009 [US2] Extend `tests/smoke/help.spec.ts` with quickstart 4–6:
  - the rows and pills on each list;
  - "TKT-1038 deleted.";
  - "Record created." with no new row;
  - Jane (Cashier) sees only Ask UzaPro and How-to guides, with no Delete

---

## Phase 5: Polish & Cross-Cutting

- [X] T010 In `tests/smoke/navigation.spec.ts`, replace the "out-of-scope modules show the placeholder" test with one that asserts every module in `MODULES` is in scope and that no visible module shows "Not built yet in this prototype.". Add `/help/ask-uzapro` and `/help/help-requests` to `tests/smoke/responsive.spec.ts`.
- [X] T011 Mark feature 001's placeholder-page design deviation as superseded in `specs/001-dashboard-sales-stock/spec.md` › Design deviations. Do a visual check of Ask UzaPro against the canvas and log any differences in `specs/006-help-centre/spec.md` › Design deviations.
- [X] T012 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`), walk through quickstart 1–7, and commit on `006-help-centre`

---

## Dependencies & Execution Order

- Setup → Foundational (T002–T005) → US1 → US2 → Polish.
- US2 needs only T002 and T005. It can run alongside US1.
- T010 must run after T005, because putting `sup` in scope breaks the old placeholder test.

### Parallel opportunities

- T002 alongside the type work in T003.
- US1 (T006–T007) and US2 (T008–T009) share only `help.spec.ts`, so write that file in order.

## Implementation Strategy

1. **MVP**: Phases 1–3 (the chat).
2. Add US2, retire the placeholder test, run every gate and commit.
