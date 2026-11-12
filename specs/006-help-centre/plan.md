# Implementation Plan: Help Centre

**Branch**: `006-help-centre` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-help-centre/spec.md`

## Summary

Bring Help (`sup`), the last placeholder module, into scope. Ask UzaPro is a faithful port of the
design's chat: the header card, three seed messages, Send or Enter, and one fixed reply, kept for
the session. How-to guides, Help requests and Response times reuse feature 005's generic list
screens, fed with the design's seed rows. When this is done, no screen in the app shows the "Not
built yet" placeholder.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: unchanged. Nothing new.

**Storage**: in-memory store only. A new `help` slice.

**Testing**:
- Vitest: the send rule (blank text is ignored, the reply follows).
- Playwright: `help.spec.ts`.
- The navigation test changes from checking the placeholder to checking that every module is in
  scope.

**Target Platform / Project Type**: unchanged

**Performance Goals**: the reply appears immediately

**Constraints**: design tokens only. The fixed reply is copied verbatim. Nothing leaves the browser.

**Scale/Scope**: 1 module, 4 tabs, 1 new screen, 9 seed rows, 3 seed messages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ | Chat layout, seed messages and the fixed reply come from the canvas (research R1). The lists reuse the shared behaviour exactly. |
| II. Data behind a seam | ✅ | The `help` slice and the new generic rows sit behind `@/data`. |
| III. Ephemeral in-memory | ✅ | The conversation lasts for the session and resets on reload. |
| IV. Tokens & accessibility | ✅ | Bubbles use the action and surface tokens. The composer input has the label "Message". New messages are announced in a polite live region. |
| V. Component and config-driven | ✅ | `sup` sets `inScope`. The list tabs are driven by the registry through the existing generic screens. |
| VI. Simplicity & types | ✅ | One small screen and one command. No dependencies. |

**Gate result**: PASS.

## Project Structure

### Documentation

`specs/006-help-centre/` contains plan.md, research.md, data-model.md, quickstart.md,
contracts/ui-and-data.md, checklists/requirements.md, and tasks.md (from `/speckit-tasks`).

### Source Code (changes on top of features 001–005)

```text
src/
├── config/modules.ts                  # sup → inScope: true, columns for the three list tabs
├── data/
│   ├── fixtures/help.ts               # NEW: seed messages and CHAT_REPLY
│   ├── fixtures/generic.ts            # CHANGE: sup/* rows
│   ├── types/office.ts                # CHANGE: ChatMessage
│   ├── store/state.ts, seed.ts        # NEW: help slice
│   ├── commands/help.ts               # NEW: sendChatMessage
│   ├── queries-office.ts              # CHANGE: useChatMessages
│   └── index.ts
├── features/
│   ├── help/                          # AskUzaPro.tsx, screens.tsx (chat + generic lists)
│   └── screens.ts                     # register sup
tests/unit/help.test.ts, tests/smoke/help.spec.ts, tests/smoke/navigation.spec.ts (placeholder test → all in scope)
```

**Structure Decision**: a small `help` feature folder. Its `screens.tsx` combines the chat screen
with `screensFor("sup", ["how-to-guides", "help-requests", "response-times"])` from the generic
feature. This is small enough to build directly, without parallel agents.

### Build order (input to `/speckit-tasks`)

1. Foundation: fixtures, types, slice, command with a unit test, registry, hook.
2. US1 Ask UzaPro screen and smoke test.
3. US2 list registration and smoke test.
4. Retire the placeholder check in the navigation test. Mark feature 001's placeholder deviation as
   superseded. Run all gates and commit.

## Complexity Tracking

No violations.
