---

description: "Task list for feature 008: Uza AI"
---

# Tasks: Uza AI

**Input**: Design documents from `specs/008-uza-ai/`

**Prerequisites**: plan.md, spec.md (Clarifications Q1–Q2), research.md (R1–R13), data-model.md,
contracts/ui-and-data.md, quickstart.md. Builds on features 001–007.

**Tests**: the constitution requires Playwright smoke tests. Vitest covers the pure helpers (the
answer engine, role gate, tickets and ideas).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US4 from spec.md

## Reference

- **Canvas source**: `design/canvas/Uzapoint ERP.dc.html` (version 1794506539):
  - the panel markup (~lines 2795–2965);
  - `aiStore`, `aiTickets`, `aiTicketMsgs`, `aiAddTicket`, `aiAnswer` and `aiVals` (~3632–3769).
- Copy every string exactly from there.
- Style with tokens only, never the design's inline hex. `#111` in the tooltip maps to the existing
  dark-surface token used by `Toast`, which is `bg-grey-900`.

---

## Phase 1: Setup

- [X] T001 Create the branch `008-uza-ai` from `main` (`git checkout -b 008-uza-ai`). It carries the uncommitted Tony Blaise rename. Confirm `npm run typecheck && npm run lint && npm run test:unit` pass.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 [P] Add the types `AiAction`, `AiMessage`, `AiChat`, `TicketPriority`, `TicketStatus`, `TicketMessage`, `SupportTicket`, `IdeaStatus` and `FeatureIdea` (data-model.md) to `src/data/types/office.ts`. Export them from `src/data/types/index.ts`.
- [X] T003 [P] Add the Lucide icons `Sparkles` (`sparkles`), `MessageSquare` (`message-square`), `Lightbulb` (`lightbulb`), `Wrench` (`wrench`), `Paperclip` (`paperclip`), `Send` (`send`), `ThumbsUp` (`thumbs-up`) and `ArrowUpRight` (`arrow-up-right`) to `src/components/ui/Icon.tsx`.
- [X] T004 [P] Styles:
  - add `--shadow-fab` (`0 10px 28px` in a green-800 tint at 38%) to `src/styles/tokens.css`;
  - add to `src/styles/globals.css`, in `@layer components`:
    - `.uz-fab`: scales to 1.06 on hover;
    - `.uz-fab-tip`: a dark tooltip to the left with an arrow, shown on `:hover` and `:focus-visible`;
    - `.uz-dots`: three 6px dots in `--text-muted`, using the design's `uzDot` keyframes with 0, 0.15 and 0.3 second delays;
    - a `prefers-reduced-motion` rule that stops both animations.
- [X] T005 [P] Export the `useDialog` hook from `src/components/ui/Overlay.tsx`, with no change to its behaviour.
- [X] T006 Create `src/data/fixtures/uzaai.ts` with:
  - `AI_CHATS`: c3, c2 and c1, with the messages copied exactly from `aiStore`, the actions as `{kind:"screen"}`, and `awaitingDetails` false;
  - `SUPPORT_TICKETS`: TKT-1042, 1041 and 1038, with their messages built as `aiTicketMsgs` builds them (data-model.md › Seed);
  - `FEATURE_IDEAS`: i1–i8, copied exactly;
  - `IDEA_STOP_WORDS`: the design's 24 words;
  - the fixed copy constants: `AI_PROMPTS`, `AI_FALLBACK`, `AI_FILE_REPLY`, `AI_BUG_ASK`, `AI_SALES_TEXT`, and the refund, invoice and purchase how-to texts;
  - `AI_TARGETS`: the answer-target table from research R2.
- [X] T007 Add the `ai` slice (`AiState`, data-model.md) to `src/data/store/state.ts`, seeded in `src/data/store/seed.ts`:
  - deep-copy the fixtures, with `votes: {i6:true}`, `mine: {}` and `seq: 1`;
  - panel defaults: `open: false`, `tab: "chat"`, `view: "chat"`, `chatId: null`, an empty draft, `file: null`, `typing: false`, `filter: "all"`;
  - support defaults: `view: "list"`, `ref: null`, a form with priority Medium and empty fields, no error, an empty reply;
  - features defaults: `tab: "Roadmap"`, an empty query and form, `checked: false`, no error.
- [X] T008 Create `src/data/uzaai.ts` with these pure helpers (research R2, R4, R5, R9; data-model.md › Derived values):
  - the answers: `answer(text, ctx)`, including the role gate through `canSee` and the `AI_TARGETS` table; `fmtKes`, which is `"KES " + num(Math.round(n))`;
  - the chat list: `chatAge`, `chatGroups`;
  - the ideas: `ideaVotes`, `roadmap`, `browseIdeas`, `myIdeas`, `similarIdeas`;
  - the tickets: `nextTicketRef`, `ticketTone`, `priorityTone`, `clipSubject`;
  - the screen label: `viewingLabel(pathname)`.

  `ctx` is `{ role, first, awaiting, receivables: ReceivableRow[], lowStock, expenses }`.
- [X] T009 Create `tests/unit/uzaai.test.ts`, run against the seed:
  - the file-only reply ("I got {file}. I can't read files yet, …");
  - every answer branch with the exact design wording (the owed list with up to 4 rows and the singular and plural forms, the empty-overdue sentence, stock, spending with and without waiting expenses, refund, invoice, sales, purchase, greeting, fallback);
  - keyword precedence ("refund problem" → problem);
  - the role gate: as the Cashier, owed, spending, invoices, stock and purchases are refused, while refunds and sales answer;
  - `chatAge` and `chatGroups` around 10 Nov 2026;
  - `nextTicketRef` with the 1042 floor;
  - `clipSubject` at 60 and 61 characters;
  - `similarIdeas("WhatsApp receipts", …)` finds i6, and an unrelated title finds nothing;
  - `roadmap` counts are 3, 1 and 1;
  - `viewingLabel` for `/dashboard`, `/sales/invoices`, `/stock/overview` and `/customers/customers`.
- [X] T010 Create `src/data/commands/uzaai.ts` with the panel commands `openUzaAi` (resets to the chat tab with a new empty chat, as the design does), `closeUzaAi` and `setAiTab`. In `src/data/commands/session.ts`, make `signOut` set `ai.open = false`. Add `useUzaAi` and `useViewingLabel` (using `usePathname`) to `src/data/queries-office.ts`, and export everything from `src/data/index.ts`.
- [X] T011 Create `src/features/uzaai/UzaAi.tsx` and `shared.tsx`:
  - **launcher**: `fixed right-6 bottom-6 z-[80]`, 58px, the gradient from `--green-500` to `--green-800`, a 3px white border, `--shadow-fab`, a 26px sparkles icon, `aria-label="Open Uza AI"` and a `.uz-fab-tip` tooltip. It is hidden while the panel is open.
  - **panel**: `role="dialog"`, `aria-label="Uza AI and help"`, `fixed inset-y-0 right-0 w-[min(460px,100vw)] z-[85]`, the surface colour, a left border, a shadow, and a flex column. It uses `useDialog` for the focus trap and Escape. On close, focus returns to the launcher.
  - **tab strip**: a tablist with "Uza AI", "Support" and "Features", each with its icon; the active tab has a 2px `--green-600` underline. There is a Close icon button.
  - **shared**: `AiBadge` (the gradient circle with a `--green-50` ring, at 28, 44 and 72px), `Bubble` and the typing dots.
- [X] T012 In `src/components/shell/AppShell.tsx`, mount `<UzaAi />` and add `pb-[88px]` to `<main>` (Clarification Q2).

**Checkpoint**: unit tests pass. The launcher shows on every signed-in page and the panel opens and closes with its three tabs. Existing smoke tests still pass.

---

## Phase 3: User Story 1 - Ask Uza AI about the business (Priority: P1) 🎯 MVP

**Goal**: ask a question and get the design's scripted, role-limited answer with an action.

**Independent Test**: quickstart 1–5.

- [X] T013 [US1] In `src/data/commands/uzaai.ts`, add `setAiDraft` (cut to 4,000 characters), `setAiFile`, `newAiChat` and `askUzaAi(text, file, where)`:
  - ignore the call if there is no text and no file, or if Uza AI is already typing;
  - create the chat `n{seq}` at the top of the list if none is open;
  - add the user's message and set the date to `DEMO_TODAY`;
  - clear the draft and file, and set `typing` on;
  - after 700ms, build `ctx` from the live store (first extract `receivableRows(list: Receivable[]): ReceivableRow[]` into `src/data/money.ts`, have `useReceivables` in `src/data/queries-money.ts` call it, and use it here on `getStore().getState().money.receivables`) and add `answer()` or the file reply; for a waiting chat, call `addTicket` (a stub until T020 in US3 replaces it, returning a ref through `nextTicketRef`; T024 connects the full flow); then turn `typing` off.

  Also add `runAiAction(act)`: a ticket action switches to Support › ticket; a screen action returns `{href}` for the caller.
- [X] T014 [US1] Create `src/features/uzaai/ChatView.tsx`:
  - **header**: "All chats" (back), a 9px green dot, the title ("Uza AI" for a new chat) with an ellipsis, and "New chat";
  - **empty state**: a 72px badge, "Chat with Uza AI", the subtitle, and the four suggestion chips, which call `askUzaAi`;
  - **messages**:
    - user messages right-aligned in `--green-700` with white text and corner radii 16 16 4 16;
    - Uza AI messages left-aligned in `--canvas` with a 28px badge and radii 16 16 16 4;
    - text uses `pre-line` and `overflow-wrap: anywhere`;
    - a paperclip chip shows the file name;
    - the action is a secondary small Button with the `arrow-up-right` icon. It is disabled with the title "Not available for your role" when `canSee` fails. A screen action calls `router.push(href)` and closes the panel below 900px.
  - **typing row**: the badge and `.uz-dots`;
  - **scrolling**: auto-scroll to the bottom on a new message or on typing;
  - **live region**: a visually hidden `aria-live="polite"` region with the latest Uza AI text.
- [X] T015 [US1] Create `src/features/uzaai/Composer.tsx`:
  - the "Viewing: {useViewingLabel()}" chip with a 7px `--green-600` dot;
  - a box with a 1.5px `--green-200` border;
  - the file chip with a "Remove file" button;
  - a textarea (2 rows, `maxLength` 4,000, placeholder "Ask Uza AI anything…", `aria-label` "Message to Uza AI"; Enter sends, Shift+Enter adds a new line);
  - a paperclip label (titled "Attach a file") around a hidden file input that keeps only `file.name` and resets the input;
  - the "{n} / 4,000" counter, using the en-KE number format;
  - a 38px round Send button (`aria-label` "Send"), disabled and in `--green-200` when there is nothing to send, otherwise `--green-700`.
- [X] T016 [US1] Create `tests/smoke/uzaai.spec.ts` with quickstart 1–5:
  - the launcher's name, tooltip and hiding;
  - the empty state and chips;
  - "Overdue invoices": wait for the reply, check the wording, then "Open Receivables" navigates;
  - the live figures after recording a receivables payment (overdue total) and a new paid expense dated this month (spending total);
  - attach `receipt.pdf` with `setInputFiles`: the composer chip shows it and "Remove file" clears it; attach again and send with no text: the message reads "Sent a file" with the paperclip chip, and the reply is the file reply;
  - with the panel open, sign out: the login page has no "Open Uza AI" button; after signing back in the launcher is visible and the panel is closed (quickstart 12);
  - the low stock, refund, sales, greeting and fallback answers;
  - as the Cashier, the "You don't have access to Receivables. Ask the business owner." reply with no action, while the refund answers;
  - "Viewing: …" on two screens;
  - Escape closes and focus returns to the launcher.

**Checkpoint**: US1 works on its own. The chat list, Support and Features are still empty placeholders inside the panel.

---

## Phase 4: User Story 2 - Pick up an earlier chat (Priority: P2)

**Goal**: browse, filter and reopen past chats.

**Independent Test**: quickstart 6.

- [X] T017 [US2] In `src/data/commands/uzaai.ts`, add `showAiList`, `openAiChat(id)` (opens the chat view and keeps the chat) and `setAiFilter("all" | "week")`.
- [X] T018 [US2] Create `src/features/uzaai/ChatList.tsx`:
  - a header with a 44px badge, "Uza AI", "Your business helper in UzaPro" and a "New" button with a plus icon;
  - the filter chips "All" and "Last 7 days" (the active chip is `--green-700` with white text, the other `--canvas`);
  - groups from `chatGroups`, each with an uppercase eyebrow heading;
  - rows as buttons, each with a 36px chat icon tile, the title (with an ellipsis) and `chatAge`, and a `--canvas` hover;
  - "No chats in this period." when the filtered list is empty.

  Wire `view === "list"` in `UzaAi.tsx`.
- [X] T019 [US2] Extend `tests/smoke/uzaai.spec.ts` with quickstart 6:
  - the three seeded chats appear with 3d, 2w and 4w under the right headings;
  - the "Last 7 days" filter works;
  - opening the refund chat shows "Open Refunds";
  - as the Cashier, the seeded chat "Which customers owe me money?" shows "Open Receivables" disabled, with the title "Not available for your role";
  - asking in an old chat moves it to "Today".

---

## Phase 5: User Story 3 - Report a problem and follow it in Support (Priority: P2)

**Goal**: problem reports become tickets, and tickets are listed, viewed, replied to and raised.

**Independent Test**: quickstart 7–8.

- [X] T020 [US3] In `src/data/commands/uzaai.ts`, replace the T013 stub with `addTicket(subject, priority, body)`, which:
  - uses `nextTicketRef` and adds the ticket at the top with status Open;
  - adds the user's message, timed `"10 Nov 2026, HH:MM"` (the real clock);
  - adds the automatic reply for the priority, from "UzaPro support", timed "Automatic reply".

  Also add `supportNew`, `supportBack`, `openTicket(ref)`, `setSupportForm(patch)` (which clears the error), `sendSupportRequest()`, `setTicketReply` and `sendTicketReply()` (blank does nothing; otherwise it adds a "You" message with today's time). `sendSupportRequest` validates with the design's messages, then calls `addTicket`, opens the ticket and shows the toast "{ref} sent to support.".
- [X] T021 [P] [US3] Create `src/features/uzaai/SupportList.tsx`:
  - a header with a 44px chat tile, "Support", "Your support requests and our replies." and "New request";
  - ticket cards as buttons, each showing the ref in small tabular figures, a StatusPill (`ticketTone`), the subject, the last message (prefixed "You: " for the user's own, with an ellipsis) and "{priority} priority · {when}". Cards have a `--green-200` border and a `--canvas` hover;
  - the dashed empty state: "No support requests yet.", a "Start a conversation" button, and the hint with the bold "Report a problem" and "Features".
- [X] T022 [P] [US3] Create `src/features/uzaai/SupportForm.tsx`:
  - "Back" and the heading "New support request";
  - the Field "Subject" (with the design's placeholder);
  - the SearchSelect "How urgent is it?" (Low, Medium, High);
  - the textarea "What happened?" (6 rows, with the design's placeholder);
  - the error shown with `role="alert"` in the danger colour;
  - a full-width "Send to support" button with the send icon;
  - the response-times note.
- [X] T023 [P] [US3] Create `src/features/uzaai/TicketView.tsx`:
  - a header with "Back", the subject (with an ellipsis), "{ref} · {priority} priority" and a StatusPill;
  - messages in the style of the design's `tm` (each with a "{who} · {when}" line; the user's right-aligned in `--green-700`, support's left-aligned in `--canvas`, radii 14px);
  - the reply box ("Write a reply", `aria-label` "Reply") with a Send button, hidden when the status matches `/resolved|closed/i`.

  Wire the Support views in `UzaAi.tsx`.
- [X] T024 [US3] Connect the chat problem flow in `askUzaAi`:
  - a problem keyword sets `awaitingDetails` on that chat;
  - the next message in that chat calls `addTicket(clipSubject(text), "Medium", text + "\n\n(Reported from " + where + ")")` and replies with the design's wording and the action `{kind:"ticket", label:"Open {ref}", ref}`;
  - the waiting flag is per chat, so a new chat is not affected.

  Add unit tests for this in `tests/unit/uzaai.test.ts`, using Vitest fake timers.
- [X] T025 [US3] Extend `tests/smoke/uzaai.spec.ts` with quickstart 7–8:
  - "Report a problem", then the details, gives TKT-1043; "Open TKT-1043" opens the ticket with the "(Reported from …)" text and the 4-hour automatic reply;
  - the Support list order;
  - TKT-1038 has no reply box; a reply in TKT-1041 appears as "You";
  - the empty-subject error; a valid High request gives the toast "TKT-1044 sent to support." and the 1-hour reply.

---

## Phase 6: User Story 4 - Share and vote on feature ideas (Priority: P3)

**Goal**: the roadmap, browsing and voting, and sharing an idea after the similar-ideas check.

**Independent Test**: quickstart 9.

- [X] T026 [US4] In `src/data/commands/uzaai.ts`, add:
  - `setFeaturesTab`, `setIdeaQuery`, and `toggleIdeaVote(id)`;
  - `setIdeaForm(patch)`, which resets `checked` and the error;
  - `checkIdea()`, with the design's title and outcome errors;
  - `submitIdea()`, which adds `u{seq}` as Under review with 0 base votes, records it as the user's and voted for, switches to My ideas, clears the form, and shows the toast "Thanks. Your idea was shared.".
- [X] T027 [US4] Create `src/features/uzaai/FeaturesTab.tsx`:
  - **header**: a 44px lightbulb tile, "Features", "Ideas you shared, voted on, or want to browse.", and the four-part switch as a tablist on `--canvas` (the selected part has a surface background and `--shadow-sm`);
  - **Roadmap**: a timeline in a 40px column of group icons (each a 36px tile in the soft tone and strong text: Planned, info, clipboard-list; In progress, warning, wrench; Done, green, circle-check), a vertical rule beside the cards, the "{label} ({n})" headings, and cards with the title, description, a calendar icon with the ETA and a thumbs-up with "{n} votes";
  - **Browse and My ideas**: the "Search ideas" Field with a search icon (Browse only), and `IdeaCard` (in `shared.tsx`) with:
    - a 48px vote column with a chevron and the count, using `aria-pressed` and the "Vote for / Remove vote for" label, styled green when voted;
    - the title and StatusPill (Planned info, In progress warning, Done success, Under review neutral);
    - the description and meta line;
  - **empty states**: the design's texts, plus "Share an idea" on My ideas;
  - **New**: the warning note with an info icon, "Idea title", the "What would it help you do?" textarea, "Tags (optional)", the error with `role="alert"`, and "Check for similar ideas", which turns into the uppercase match heading, the match rows with vote chips, and "Submit my idea" with a check icon.
- [X] T028 [US4] Extend `tests/smoke/uzaai.spec.ts` with quickstart 9:
  - the Roadmap counts;
  - Browse order, and a vote taking 64 to 65 with `aria-pressed`;
  - My ideas contents;
  - the empty-title error;
  - "WhatsApp receipts" lists the WhatsApp idea;
  - submitting gives the toast, and My ideas shows "Your idea" with 1 vote.

---

## Phase 7: Polish & Cross-Cutting

- [X] T029 [P] In `tests/smoke/responsive.spec.ts`:
  - open the panel at 320px on the Chat, Support and Features tabs and check there is no sideways scrolling;
  - run the axe scan on the open panel in each tab;
  - at 375px, a chat action ("Open Receivables") navigates and closes the panel (FR-006);
  - add the launcher-overlap check from SC-006a on 3 long pages (Sales › All sales, Stock › Stock management, Settings › Business profile), scrolled to the bottom.

  Also add the same overlap check to the scratchpad `mobile/audit.mjs`.
- [X] T030 Run the full smoke suite. Fix any existing test that clicks a control near the bottom right and is now covered by the launcher; prefer layout fixes over test changes. Run the mobile audit over the 72 routes at 6 widths, with 0 issues.
- [X] T031 Do a visual review against the canvas at 1440px and 375px for every panel view (Principle I). Record any accepted differences in `specs/008-uza-ai/spec.md` › Design deviations.
- [X] T032 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`), walk through quickstart 1–12, mark the tasks done, and commit on `008-uza-ai`.

---

## Dependencies & Execution Order

- Setup (T001) → Foundational (T002–T012) → US1 (T013–T016) → US2, US3 and US4.
- Within Foundational:
  - T002–T005 run in parallel;
  - T006 needs T002; T007 needs T006; T008 needs T002 and T006; T009 needs T008;
  - T010 needs T007; T011 needs T003–T005 and T010; T012 needs T011.
- **US2, US3 and US4** all depend on US1's panel and commands file. They can then run one after
  another in any order. They share `commands/uzaai.ts` and `UzaAi.tsx`, so those edits are made in
  sequence.
  - US3's T024 changes `askUzaAi` from US1.
- Polish comes last.

### Parallel opportunities

- T002, T003, T004 and T005.
- T021, T022 and T023 (separate component files, after T020).
- T029 alongside T031.

## Implementation Strategy

1. **MVP**: Phases 1–3. The launcher and panel, and asking questions with live, role-limited answers
   and working actions.
2. Then add the chat list (US2), Support with tickets from chat (US3) and the Features board (US4),
   each checked with its own smoke scenarios.
3. Polish: responsive and overlap checks, the visual review, every gate, and the commit.
