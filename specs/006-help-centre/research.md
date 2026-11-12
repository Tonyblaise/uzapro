# Research: Help Centre

Sources: `design/canvas/Uzapoint ERP.dc.html` and `design/canvas/erp-data.js`. Line numbers are
approximate.

## R1. Ask UzaPro chat (markup lines 1210–1236, state line 2797, send at line 3953, view model at line 5427)

- **Layout**: a column at most 640px wide with `space-3` gaps.
  - **Header card**: a 40px tile (green-50 background, green-600 `circle-help` icon at 18px), the
    title "UzaPro assistant" (`type-title`) and the line "Ask about stock, an invoice, or how to do
    something." (`type-small`, muted).
  - **Messages**: bubbles at most 80% wide, `radius-lg`, padding `space-3` by `space-4`,
    `type-body`. The user's sit right on `--action` with `--text-on-action`. The assistant's sit
    left on `--surface` with `--text`.
  - **Composer**: an Input with the placeholder "Type a message" and `aria-label="Message"`, and a
    "Send" button.
- **Seed messages**, in order:
  1. assistant: "Ask about stock, an invoice, or how to do something."
  2. user: "How do I issue a credit note?"
  3. assistant: "Go to Sales → Refunds → New, pick the original invoice, choose the lines to return,
     and save. Returned items restock automatically."
- **Send**: trims the draft and does nothing when it's blank. Otherwise it appends the user's
  message and then the fixed reply "Open Reports for the full figures, or search for a record by
  its ID, for example INV-0355.", and clears the draft. Enter triggers send.
- The messages live in app state, so they last while moving between modules and reset on reload.
- **Decision**:
  - A `help` store slice holds `messages`.
  - `sendChatMessage(text)` adds both messages in one update and shows no toast (the design shows
    none). It returns `fail` for blank text.
  - The draft is local component state.
- **Alternatives**: a canned reply chosen by keyword. Rejected because the design has a single
  reply (feature 005 Q1: copy the design exactly).

## R2. Lists (How-to guides, Help requests, Response times)

- These are the generic `table` kind, with the seed rows in `UZ_MODS` › `sup`.
- **Decision**:
  - Add the rows to `src/data/fixtures/generic.ts` under `sup/how-to-guides`, `sup/help-requests`
    and `sup/response-times`.
  - Add the columns to the `sup` registry entry.
  - Register them with the existing `screensFor("sup", [...])` from `src/features/generic/screens.tsx`.
  - The generic screens need no changes.

## R3. Header actions and roles

- **Header actions**: the design's `headerActions` fallback shows "New" on every Help tab,
  including Ask UzaPro (no `sup` branch exists). Ask UzaPro therefore gets the generic "New"
  action and the `NewRecordDrawer` too.
- **Roles**:
  - The Cashier and Store keeper are limited to `sup: ['Ask UzaPro', 'How-to guides']`.
  - The Owner and Accountant have no limit.
  - Generic Delete stays Owner-only.
- The existing role config already encodes these limits. Only `inScope: true` is needed.

## R4. Placeholder retirement

- Once `sup` is in scope, no module uses the "Not built yet" placeholder. The navigation smoke test
  "out-of-scope modules show the placeholder" then has nothing to check.
- **Decision**: change that test so it asserts every module is in scope. Keep the
  `ModulePlaceholder` component as the fallback for unknown kinds.
- Feature 001's design-deviation row for placeholder pages is superseded.
