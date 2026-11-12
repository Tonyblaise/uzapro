# Research: Uza AI

The source is the canvas file `design/canvas/Uzapoint ERP.dc.html` at version 1794506539. It
contains:

- the panel markup (lines ~2795–2965);
- `aiStore`, `aiTickets`, `aiTicketMsgs`, `aiAddTicket`, `aiAnswer` and `aiVals` (lines ~3632–3769);
- the icon additions (~3784);
- the `ai:` binding in the render values (~5961).

Every decision below follows that code unless the spec's Clarifications or Design deviations say
otherwise.

## R1 Where the state lives

**Decision**: add an `ai` slice to `AppState`, holding both the data and the panel's navigation
state:

- **Data**: `convs`, `tickets`, `ideas`, `votes`, `mine` and `seq`, plus a per-chat
  `awaitingDetails` flag (the design's `bug`).
- **Panel**: `open`, `tab`, `view`, `convId`, `draft`, `file`, `typing`, `filter`; the Support
  view, selected ticket, form and error; the Features tab, search, form, `checked` and error.

Seed the data from a new fixture, `fixtures/uzaai.ts`.

**Rationale**:
- The design keeps it all in component state plus a cached `_ais` object. A store slice is the
  project's equivalent: in memory, resets on reload (Principle III), and reachable from commands.
- A chat answer's "Open TKT-1043" action must switch the panel to Support › that ticket. So does
  `signOut`, which must close the panel. Both need shared state.

**Alternatives considered**:
- React state local to the panel: it couldn't be reached from `signOut` and would be lost when the
  shell re-mounts.
- `sessionStorage`: rejected by Principle III.

## R2 How answers are worked out

**Decision**: a pure function in `src/data/uzaai.ts`:

```ts
answer(text, ctx): { text: string; act?: AiAction }
```

`ctx` is a plain snapshot holding:
- the role;
- the user's first name;
- whether the chat is waiting for problem details;
- the receivable rows (with balance and status);
- the low-stock list;
- the expenses.

The command (R3) builds the snapshot from the store at the moment the question is asked.

- **Keyword order** is copied from `aiAnswer`: waiting-for-details, then problem, greeting, owed,
  stock, expense, refund, invoice, sale, purchase, then the fallback. Matching uses lower-cased
  `includes`. The greeting uses the design's regular expression
  `^(hi|hello|hey|habari|good (morning|afternoon|evening))\b`.
- **Money** is formatted as the design's `fmt`: `"KES " + num(Math.round(n))`, which gives
  "KES 45,600". It is not `kes()`, which adds decimals.
- **Owed** means receivable rows whose status pill is "Overdue", sorted by balance (largest first).
  The first 4 are listed as `• {party}, {fmt(balance)} (due {date(due)})`. The total is all
  balances. One overdue row gives "1 invoice is"; more give "{n} invoices are".
- **Stock** reads `UZ_STOCK_FIXED.low` and keeps rows whose status is not "Healthy". That gives 3:
  Skateboard, Knee pads and Laser Printer.
- **Spending**:
  - "paid this month" means status `Paid` and a date in `2026-11`;
  - "waiting" means status `Waiting approval`;
  - the wording follows the design: "1 expense is" or "{n} expenses are".
- **Sales** is the fixed design sentence.
- **Role gate (Clarification Q1)**: every answer has a target `{module, tab, area}`. If
  `canSee(role, module, tab)` is false, the reply is "You don't have access to {area}. Ask the
  business owner." with no action. The check runs after keyword matching and before any figures are
  worked out.

  | Answer | Module | Tab | Area |
  |---|---|---|---|
  | owed | rcv | Receivables | Receivables |
  | stock | inv | Overview | Stock |
  | spending | exp | Expenses | Expenses |
  | refund | sales | Refunds (credit notes) | Refunds |
  | invoice | sales | Invoices | Invoices |
  | sales | sales | All sales | Sales |
  | purchases | buy | Purchase orders | Purchases |

  All seven tab titles were checked against `src/config/modules.ts` on 2026-11-12.

**Rationale**: a pure function lets Vitest cover every wording branch and the role gate without a
browser.

**Alternatives considered**: computing the answers inside the React component. That is harder to
test and mixes data with UI (Principle II).

## R3 Sending and the typing delay

**Decision**: a command `askUzaAi(text, file?)`:

1. Ignore the call if the text is blank and there is no file, or if Uza AI is already typing.
2. Create the chat if none is open. Its id is `n{seq}` and its title is the text or the file name.
   Move it to the top of the list.
3. Add the user's message and set the chat's date to `DEMO_TODAY`. Clear the draft and file, and set
   `typing` on.
4. After 700ms, work out the answer from a fresh snapshot, add it, and turn `typing` off.

A file with no text gets the design's fixed reply.

The problem flow (`awaitingDetails`) is kept per chat. The waiting branch calls `addTicket`
(R4) with:
- the subject: the message, cut to 57 characters plus "…" when longer than 60;
- priority Medium;
- the body: the message plus "\n\n(Reported from {where})".

**Rationale**: matches `ask()` in `aiVals`. Using the store's own timer keeps the flow testable with
fake timers in Vitest and with real waits in Playwright.

## R4 Support tickets

**Decision**: seed the three design tickets (TKT-1042, TKT-1041 and TKT-1038, newest first) with
their messages already written out from `aiTicketMsgs`:

- the user's first message is the subject plus ".";
- tickets that are not Open also get a reply from "Faith · UzaPro support", timed 16:05 on the same
  day;
- the times are the design's.

`addTicket(subject, priority, body)`:
- picks the next number: the highest ref number, with a floor of 1042, plus 1;
- adds the ticket at the top with status Open;
- adds the user's message, timed `"10 Nov 2026, " + HH:MM` (the real clock time);
- adds the automatic reply "Thanks, we've got your request. Someone from the team will reply here
  within {1 hour | 4 hours | 1 day}." from "UzaPro support", timed "Automatic reply".

The automatic reply follows the priority (High, Medium or Low). The chat-reported path also adds
this reply, as the design does.

Pill tones:
- Status: Open = info, In progress = info, Resolved = success.
- Priority: High = danger, Medium = warning, Low = neutral.

A reply box shows unless the status matches `/resolved|closed/i`.

**Rationale**: data is held as typed records instead of the design's generic table rows (Principle
II). The new-ticket toast is "{ref} sent to support.".

## R5 The ideas board

**Decision**:
- Seed the 8 design ideas, with `votes: { i6: true }` and no ideas of the user's own.
- Vote count = base votes + 1 if the user has voted.
- **Browse**: search the title, description and tags (lower case, `includes`); sort by vote count,
  highest first.
- **My ideas**: ideas that are the user's own or that the user voted for.
- **Roadmap**: groups Planned, In progress and Done, each with the design's icon (clipboard-list,
  wrench, circle-check) and tone (info, warning, success).
- **`similarIdeas(title, outcome)`**:
  - split into words of more than 3 characters, and drop the design's 24 stop words;
  - remove duplicates;
  - score each idea: +2 when a word is in the title, +1 when it is in the description or tags;
  - keep ideas scoring 2 or more, best first, up to 3.
- **Submitting** an idea:
  - adds `u{seq}` with status Under review and 0 base votes;
  - marks it as the user's own and records their vote;
  - switches to My ideas and shows the toast "Thanks. Your idea was shared." (Principle IV: no exclamation marks; recorded in Design deviations).
- Editing a field resets `checked`.

A design detail worth keeping: the WhatsApp idea's matches only score words in the title and
description. With "WhatsApp receipts", "Send receipts on WhatsApp" scores 4 ("whatsapp" and
"receipts" are both in its title), so it appears.

## R6 Placing the launcher and panel

**Decision**: render `<UzaAi />` inside `AppShell`. It only exists inside the signed-in `(app)`
layout, so it never shows on the login screens.

- **Launcher**: `fixed right-6 bottom-6`, 58px, gradient from `--green-500` to `--green-800`, a 3px
  white border, a green-tinted shadow, `z-[80]`, and a CSS tooltip shown on hover and on
  focus-visible.
- **Panel**: `fixed inset-y-0 right-0 w-[min(460px,100vw)]` at `z-[85]`, with no backdrop, as the
  design has none. Existing drawers (`z-[90]`) and modals (`z-[100]`) still open above it. The toast
  (`z-[200]`) stays on top.

The design gives the launcher z 80 and the panel z 90. The panel is lowered by 5 so that a drawer
opened while the panel is visible still sits on top. That can happen when a chat action navigates
on a wide screen and the user then opens a record.

**Alternatives considered**: reusing `Drawer`. Rejected because it adds a 40% backdrop and a footer
that the design does not have.

## R7 Accessibility (Principle IV and FR-003/FR-019)

**Decision**:
- Export the existing `useDialog` hook from `Overlay.tsx`, which handles focus trapping, Escape and
  focus restore. The panel is `role="dialog"` with `aria-label="Uza AI and help"`.
- When the panel closes, focus returns to the launcher. The launcher is rendered again on close, so
  it is focused through a ref in a post-close effect.
- The three panel tabs are a `tablist` with `aria-selected`. The Features switch is a second
  `tablist`. Chips and rows are buttons.
- The message list contains a visually hidden `aria-live="polite"` region that repeats the latest
  Uza AI reply.
- The vote buttons use `aria-pressed` and the label "Vote for {title}" or "Remove vote for
  {title}".
- The composer is a `textarea` labelled "Message to Uza AI", with `maxLength=4000`. Enter sends;
  Shift+Enter adds a new line.

## R8 Space at the bottom of pages (Clarification Q2)

**Decision**: add `pb-[88px]` to `<main>` in `AppShell` at every width. 88px is the 58px launcher,
its 24px offset and a 6px gap. The audit script in the scratchpad's `mobile/` folder gets one more
check: with the page scrolled to the bottom, no interactive element's box intersects the launcher's
box.

**Alternatives considered**: hiding the launcher while the page scrolls. The design doesn't do that.

## R9 The "Viewing" label

**Decision**: `viewingLabel(pathname)`:
- `/dashboard` gives "Dashboard";
- otherwise use `findModuleBySlug` and `findTab` to get `{module.name}`, plus " › {tab.title}" when
  the module has more than one tab and the tab title is neither the module name nor "Overview".

## R10 Action buttons

**Decision**:
- A module action calls `router.push(hrefFor(mod, tab))`. On screens under 900px wide
  (`window.matchMedia("(max-width: 899px)")`) it also closes the panel.
- A ticket action sets the Support tab, `ticket` view and that ref.
- Seeded chat actions that the current role can't see do nothing: they are rendered as disabled
  buttons with the title "Not available for your role". Answers to new questions already leave the
  action out (R2).

## R11 Icons

**Decision**: add these Lucide icons to `Icon.tsx`: `Sparkles`, `MessageSquare`, `Lightbulb`,
`Wrench`, `Paperclip`, `Send`, `ThumbsUp` and `ArrowUpRight`. The design uses `arrow-up-right` on
the action buttons. `Lock`, `ArrowLeft`, `ClipboardList`, `CircleCheck`, `ChevronUp`, `Calendar`,
`Info`, `Search` and `Plus` already exist.

## R12 Signing out and reloading

**Decision**:
- `signOut` sets `ai.open = false`. The chats, tickets and ideas stay for the rest of the session,
  like every other slice.
- A reload re-seeds everything.
- Opening from the launcher always resets the panel to the chat tab with a new empty chat (`convId:
  null`), as the design's `open` does.

## R13 Testing

- **Vitest** (`tests/unit/uzaai.test.ts`):
  - every answer branch and its wording;
  - the role gate for each answer type as the Cashier;
  - the problem flow creating a ticket;
  - `addTicket` numbering and the automatic reply by priority;
  - `similarIdeas`, vote counting and grouping;
  - `viewingLabel`;
  - chat ages and grouping relative to 10 Nov 2026.
- **Playwright** (`tests/smoke/uzaai.spec.ts`): quickstart scenarios 1–9, plus an axe scan of the
  panel in all three tabs.
- **Responsive**: `responsive.spec.ts` gets an open panel at 320px.
- **Existing smoke tests**: they must still pass. The launcher is fixed at bottom-right, so any test
  clicking a bottom-right control is now safe because of the bottom padding.
