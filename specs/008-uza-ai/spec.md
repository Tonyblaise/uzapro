# Feature Specification: Uza AI

**Feature Branch**: `008-uza-ai`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "I added a feature called uza ai on the claude designs. Please read all
the files and implement"

## Scope at a glance

The updated canvas (version 1794506539) adds **Uza AI**: a round green button with a sparkles icon,
fixed in the bottom-right corner of every signed-in screen. It opens a side panel with three tabs.

| Tab | What it does |
|---|---|
| **Uza AI** | A chat helper. It answers questions about the demo business, such as overdue invoices, low stock, spending this month, sales, refunds, invoices and purchases, and offers a button that opens the right screen. It also takes problem reports and turns them into support tickets. It keeps a list of past chats. |
| **Support** | The user's support requests (tickets). They can read a ticket's conversation, reply, and raise a new request with a subject, urgency and description. |
| **Features** | An ideas board. It has four views: a Roadmap (Planned, In progress, Done), My ideas, Browse (search and vote) and New (share an idea, after checking for similar ones). |

The canvas source has two other changes:

- the panel's CSS (button tooltip and typing dots);
- 9 extra icons: sparkles, message-square, lightbulb, wrench, paperclip, send, thumbs-up, lock and arrow-left.

`erp-data.js` is unchanged. The design's support tickets come from the Help module's "Help requests"
rows: TKT-1042, TKT-1041 and TKT-1038. Feature 007 removed those rows from the Help module, so they
come back here as Uza AI support data.

Uza AI is a scripted demo helper. Its answers are written into the design and work out figures from
the demo data already on screen. Nothing is sent to an AI service or over the network (Constitution
Principle II).

## Clarifications

### Session 2026-11-12

- Q: When someone signs in as a role that can't see a screen (for example the Cashier and Receivables), should Uza AI still answer with that screen's figures or how-to? → A: No. This applies to every answer type, not only money owed, stock and spending. Uza AI answers only when the role can see the answer's target screen. Otherwise it replies "You don't have access to {area}. Ask the business owner." with no action button. The greeting, fallback, problem reports and file replies are always available.
- Q: Should pages leave extra space at the bottom so the fixed Uza AI button never permanently covers a page's last controls? → A: Yes. The button keeps the design's size and position, and every signed-in page gets about 88px of empty space below its content so the last row, pagination or buttons can scroll clear of it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask Uza AI about the business (Priority: P1)

The presenter is on any screen and wants a quick answer, for example "which customers owe me
money?". They select the Uza AI button. A side panel opens on a new chat with a greeting and four
suggested questions. They ask a question and see a short "typing" pause. Uza AI then replies with an
answer worked out from the demo data, plus a button that opens the right screen.

**Why this priority**: the chat is the core of Uza AI and what the canvas leads with. Everything else
sits in the same panel.

**Independent Test**: sign in, select the Uza AI button and choose "Overdue invoices". The reply
lists the overdue invoices and their total, and "Open Receivables" opens Receivables › Receivables.

**Acceptance Scenarios**:

1. **Given** a signed-in user on any screen and the panel closed, **When** they look at the
   bottom-right corner, **Then** they see a round green button with a sparkles icon. On hover or
   keyboard focus it shows the tooltip "Open Uza AI".
2. **Given** the button, **When** they select it, **Then**:
   - a panel opens on the right, labelled "Uza AI and help";
   - the button is hidden while the panel is open;
   - the panel has the tabs "Uza AI", "Support" and "Features", and a Close button;
   - it opens on a **new, empty chat**: the header reads "Uza AI" with a green dot, and there are
     "All chats" (back) and "New chat" buttons;
   - the empty state shows a large sparkles badge, "Chat with Uza AI", "Ask about sales, stock,
     money owed or expenses, or report a problem. Uza AI can help with it all.", and four suggestion
     chips: "Overdue invoices", "Low stock", "Spending this month", "Report a problem".
3. **Given** an empty chat, **When** they choose a chip or type a question and press Enter or Send,
   **Then**:
   - their message appears on the right in a green bubble;
   - a typing indicator (three animated dots beside the sparkles avatar) shows for about 0.7
     seconds;
   - the reply appears on the left in a grey bubble, with an action button when the answer
     has one;
   - the chat is titled with the first message and added to the top of the chat list;
   - the message area scrolls to the newest message.
4. **Given** the questions below, **When** they are asked (matching ignores case and looks for any
   of the keywords), **Then** Uza AI replies as the design does:
   - **Money owed** ("overdue", "owe", "owed", "debt", "receivable", "unpaid"):
     - the number of overdue invoices and their total;
     - up to 4 of them, largest first, each as "• {customer}, KES {balance} (due {date})";
     - the total all customers owe;
     - an "Open Receivables" action.

     If nothing is overdue, it says "No invoices are overdue. Customers owe you KES {total} in total,
     none of it late."
   - **Stock** ("stock", "reorder", "run out", "running out", "inventory"): "{n} items need
     restocking:", then each low-stock item as "• {item} at {store}: {qty} left (reorder at
     {level})", and an "Open Stock" action (Stock › Overview).
   - **Spending** ("expense", "spent", "spend", "spending"): "You have spent KES {total} on {n} paid
     expenses this month." When some expenses are waiting for approval, it adds "{m} expense(s)
     is/are waiting for approval." It offers an "Open Expenses" action.
   - **Refunds** ("refund", "credit note", "return"): how to raise a credit note, with an "Open
     Refunds" action.
   - **Invoices** ("invoice", "bill a customer"): how to bill a customer, with an "Open Invoices"
     action.
   - **Sales** ("sale", "sold", "revenue", "today", "week"): "Sales so far: KES 184K today, KES 1.12M
     this week and KES 4.82M this month.", with an "Open Sales" action (Sales › All sales).
   - **Purchases** ("supplier", "purchase", "order"): how to order and receive stock, with an "Open
     Purchases" action (Purchases › Purchase orders).
   - **Greeting** (starts with "hi", "hello", "hey", "habari" or "good morning/afternoon/evening"):
     "Hi {first name}. What can I help you with? …"
   - **Anything else**: the fallback, which lists what it can help with and suggests "Which invoices
     are overdue?" or "What stock is running low?".

   The keyword groups are checked in this order: problem report first (User Story 3), then greeting,
   money owed, stock, spending, refunds, invoices, sales, purchases.

   Each answer type has a **target screen**:

   | Answer | Target screen | {area} |
   |---|---|---|
   | Money owed | Receivables › Receivables | Receivables |
   | Stock | Stock › Overview | Stock |
   | Spending | Expenses › Expenses | Expenses |
   | Refunds | Sales › Refunds (credit notes) | Refunds |
   | Invoices | Sales › Invoices | Invoices |
   | Sales | Sales › All sales | Sales |
   | Purchases | Purchases › Purchase orders | Purchases |

   When the current role cannot see the target screen, Uza AI replies "You don't have access to
   {area}. Ask the business owner." with no action button, and gives no figures or steps.
5. **Given** a reply with an action button, **When** they select it, **Then**:
   - that screen opens behind the panel;
   - on narrow screens (under 900px wide) the panel closes so the screen is visible.
6. **Given** a figure the user has changed earlier in the session, such as a recorded payment or a
   new expense, **When** they ask again, **Then** the answer reflects the current figures.
7. **Given** the composer, **When** they type, **Then**:
   - a "{n} / 4,000" counter updates, and input stops at 4,000 characters;
   - Shift+Enter adds a new line;
   - Send is pale and disabled until there is text or an attached file;
   - while Uza AI is typing, a second message cannot be sent;
   - above the composer, a chip reads "Viewing: {current screen}". The screen name is the
     module name, followed by " › {tab}" when the module has several tabs and the tab is not the
     module's name or "Overview". It reads "Dashboard" on the dashboard.
8. **Given** the panel, **When** they choose Close, **Then** it closes and the round button comes
   back.

---

### User Story 2 - Pick up an earlier chat (Priority: P2)

The presenter wants to show that Uza AI remembers past conversations. They go back to the chat list,
filter it and open an older chat.

**Why this priority**: past chats make the helper feel real, but asking questions works without
them.

**Independent Test**: open Uza AI, choose "All chats" (back). The list shows the three seeded chats
grouped under "Last 7 days" and "Older". Opening "How do I give a refund?" shows its two messages and
the "Open Refunds" action.

**Acceptance Scenarios**:

1. **Given** an open chat, **When** they choose "All chats", **Then** the list view shows:
   - a header with the sparkles badge, "Uza AI", "Your business helper in UzaPro" and a "New"
     button;
   - the filter chips "All" and "Last 7 days";
   - chats grouped under the uppercase headings "Last 7 days" and "Older". Each row shows a chat
     icon, the title and an age ("Today", "{n}d", "{n}w" or "{n}mo") relative to 10 Nov 2026.
2. **Given** the seeded data, **When** the list first shows, **Then** it contains these chats:

   | Title | Date | Group | Age |
   |---|---|---|---|
   | "Which customers owe me money?" | 7 Nov 2026 | Last 7 days | "3d" |
   | "How do I give a refund?" | 29 Oct 2026 | Older | "2w" |
   | "Receipt printer stopped printing" | 14 Oct 2026 | Older | "4w" |

   The design spells out the messages of each seeded chat. The first two each have a question and an
   answer with an action. The third is a problem report that ends "I logged this as TKT-1042…".
3. **Given** the list, **When** they choose "Last 7 days", **Then** only recent chats show. With
   none, it reads "No chats in this period."
4. **Given** the list, **When** they choose a chat, **Then** it opens with its messages, and asking
   again continues that chat and moves it to "Today".
5. **Given** the list or a chat, **When** they choose "New" or "New chat", **Then** a new empty chat
   opens.

---

### User Story 3 - Report a problem and follow it in Support (Priority: P2)

Something is broken. The presenter tells Uza AI, which logs a support ticket. Later they open
Support to read the reply, answer it, or raise a new request directly.

**Why this priority**: it shows support built into the product. It depends on the panel from
User Story 1.

**Independent Test**:

- Choose "Report a problem". Uza AI asks for details. Type "The till won't print receipts". Uza AI
  replies with a new ticket number (TKT-1043) and an "Open TKT-1043" action.
- The action opens that ticket in Support.
- Raise another request from Support with the subject "Barcode scanner", High urgency and a
  description. A toast reads "TKT-1044 sent to support."

**Acceptance Scenarios**:

1. **Given** a chat, **When** the message mentions a problem ("bug", "problem", "broken", "not
   working", "doesn't work", "error", "crash"), **Then** Uza AI replies "Sorry about that. Tell me
   what went wrong, which page you were on and what you expected to happen. I'll pass it to the
   support team." and waits for the details.
2. **Given** Uza AI is waiting for details, **When** the next message is sent in that chat, **Then**:
   - a ticket is created with the next number (TKT-1043 first), Medium priority and Open status;
   - the ticket's subject is the message, cut to 57 characters plus "…" when longer than 60;
   - its first message is the user's text plus "(Reported from {Viewing screen})";
   - Uza AI replies "Thanks for telling me. I logged this as {ref} and sent it to the support team.
     They usually reply within 4 hours, and you can follow it under Support.", with an "Open {ref}"
     action that opens the ticket in the Support tab.
3. **Given** the Support tab, **When** it opens, **Then** it shows:
   - a header with a chat icon, "Support", "Your support requests and our replies." and a "New
     request" button;
   - one card per ticket, newest first. Each card shows the ref, a status pill, the subject, the
     last message ("You: " prefix for the user's own), and "{priority} priority · {when}".
4. **Given** the seeded tickets:

   | Ref | Subject | Priority | Status |
   |---|---|---|---|
   | TKT-1042 | "POS printer not connecting" | High | Open |
   | TKT-1041 | "Stock count mismatch" | Medium | In progress |
   | TKT-1038 | "Invoice email not sending" | Low | Resolved |

   **When** a ticket is opened, **Then**:
   - every ticket shows the user's first message (the subject with a full stop);
   - In progress and Resolved tickets also show a reply from "Faith · UzaPro support" at 16:05 the
     same day. The In progress reply says "…working on a fix"; the Resolved one says "This is fixed
     now…".
   - Message times are 14 Oct 2026, 10:12 for TKT-1042, 22 Oct 2026, 15:40 for TKT-1041, and 30 Sep
     2026, 09:05 for TKT-1038.
5. **Given** an open ticket view, **Then**:
   - the header shows Back, the subject, "{ref} · {priority} priority" and the status pill;
   - the user's messages are green and on the right; support replies are grey and on the left; each
     has a "{who} · {when}" line;
   - a "Write a reply" box with a Send button shows unless the ticket is Resolved or Closed;
   - sending a reply adds it as "You" with today's time, and an empty reply does nothing.
6. **Given** "New request", **When** the form opens ("New support request", with Back), **Then** it
   has:
   - "Subject" (placeholder "For example, Receipt printer not working");
   - "How urgent is it?" (Low, Medium or High; default Medium);
   - "What happened?" (placeholder "Tell us what you were doing, what went wrong and what you
     expected.");
   - a full-width "Send to support" button;
   - the note "We reply to high-priority requests within 1 hour, medium within 4 hours and low
     within 1 day."
7. **Given** the form, **When** they send it with no subject, **Then** it shows "Add a subject so we
   know what this is about." With no description it shows "Tell us what happened." When valid:
   - the ticket is created with Open status, and its card has the chosen priority;
   - it gets an automatic reply: "Thanks, we've got your request. Someone from the team will reply
     here within {1 hour | 4 hours | 1 day}." from "UzaPro support", timed "Automatic reply";
   - the ticket view opens and a toast reads "{ref} sent to support.".
8. **Given** no tickets, **Then** a dashed empty box reads "No support requests yet." It has a "Start
   a conversation" button and a hint that points to "Report a problem" in Uza AI and the "Features"
   tab. This state can't be reached with the seed data, but it is built as the design shows it.

---

### User Story 4 - Share and vote on feature ideas (Priority: P3)

The presenter shows how customers shape the product. They read the roadmap, vote for an idea, and
share a new one after checking for similar ideas.

**Why this priority**: it completes the panel, but nothing else depends on it.

**Independent Test**:

- Open Features. The Roadmap shows Planned (3), In progress (1) and Done (1).
- In Browse, vote for "Print barcode labels"; its count goes from 64 to 65.
- In New, enter "WhatsApp receipts" and choose "Check for similar ideas". "Send receipts on
  WhatsApp" is offered.
- Submit. A toast reads "Thanks. Your idea was shared.", and My ideas shows the new idea tagged
  "Your idea".

**Acceptance Scenarios**:

1. **Given** the Features tab, **Then** it shows:
   - a header with a lightbulb icon, "Features" and "Ideas you shared, voted on, or want to browse.";
   - a four-part switch: "Roadmap", "My ideas", "Browse", "New". Roadmap is selected by default.
2. **Given** Roadmap, **Then** the ideas are grouped into a timeline. Each group has a coloured icon
   and a count; empty groups are hidden:
   - Planned (clipboard icon, blue);
   - In progress (wrench icon, amber);
   - Done (check icon, green).

   Each card shows the title, description, a calendar icon with the timing (for example "2-4 weeks"
   or "Released Oct 2026") and a thumbs-up with "{n} votes".
3. **Given** the 8 seeded ideas:

   | Idea | Status | Votes |
   |---|---|---|
   | M-Pesa payments match invoices automatically | Planned | 214 |
   | Send invoices to KRA eTIMS | Planned | 187 |
   | Different prices for wholesale customers | Planned | 96 |
   | Supplier price history | In progress | 72 |
   | Transaction costs on expenses | Done | 133 |
   | Send receipts on WhatsApp | Under review | 158 (the user has already voted, so it shows 159) |
   | Print barcode labels | Under review | 64 |
   | Customer loyalty points | Under review | 41 |

   **Then**:
   - Browse lists all of them, sorted by vote count, with a "Search ideas" box. The search matches
     the title, description or tags.
   - With no matches it shows "No ideas match your search."
4. **Given** an idea card in Browse or My ideas, **Then** it shows:
   - a vote button with an up chevron and the count, and its pressed state is announced;
   - the title and a status pill: Planned (info), In progress (warning), Done (success), Under review
     (neutral);
   - the description;
   - a meta line of "Your idea · Tags: …" or "Tags: …".

   Selecting the vote button adds or removes the user's vote (+1 or −1). The button turns green when
   voted.
5. **Given** My ideas, **Then** it lists the ideas the user shared or voted for. Initially that is
   "Send receipts on WhatsApp". With none, it shows "Ideas you share or vote for will show here." and
   a "Share an idea" button that opens New.
6. **Given** New, **Then** the form has:
   - a warning note: "Your idea's title and outcome may be seen by other UzaPro customers. Comments
     are seen only by you and the UzaPro team.";
   - "Idea title" (placeholder "For example, Send receipts on WhatsApp");
   - "What would it help you do?" (placeholder "Describe the result you want, not how to build
     it.");
   - "Tags (optional)";
   - a full-width "Check for similar ideas" button.
7. **Given** the form, **When** they check with no title, **Then** it shows "Give your idea a title."
   With no outcome it shows "Say what the idea would help you do." When valid:
   - the button is replaced by a "Similar ideas. Vote for one if it covers yours" list of up to 3
     matches, each with its own vote chip. With no matches the heading reads "No similar ideas
     found".
   - Matches are scored on words longer than 3 letters, excluding the design's list of common
     words. A word scores 2 when it appears in the title and 1 when it appears in the description or
     tags. Ideas scoring 2 or more are shown, best first.
   - "Submit my idea" adds the idea as Under review with the user's own vote, so it shows 1 vote.
     The view switches to My ideas, the form clears, and a toast reads "Thanks. Your idea was
     shared."
   - Editing any field after a check hides the matches again, until the user checks again.

---

### Edge Cases

- **Signed out**: the Uza AI button and panel never show on the login, forgot-password or "sent"
  screens. Signing out closes the panel.
- **Re-opening**: the round button always opens a new empty chat, even if a chat was open before
  (as in the design). Earlier chats stay in the list.
- **Only a file attached**:
  - the message is labelled "Sent a file" with a paperclip chip showing the file name;
  - Uza AI replies "I got {file}. I can't read files yet, but you can attach it to a support request
    or an expense.";
  - the file is never read or uploaded; only its name is used. The chip in the composer has a
    "Remove file" button.
- **A file with text**: the text is answered as usual, and the file name shows on the user's
  message.
- **Problem-report state** is kept per chat. Starting a new chat while one is waiting for details
  does not turn the new chat's first message into a ticket.
- **Roles**: Uza AI is available to every role. Answers are limited by role (see Clarifications and
  User Story 1, scenario 4). A role that can't see an answer's target screen gets the "You don't
  have access to {area}. Ask the business owner." reply instead.
  - For example, the Cashier asking "Which customers owe me money?" gets "You don't have access to
    Receivables. Ask the business owner."
  - Seeded chats keep their action buttons. Selecting one for a screen the role can't see does
    nothing.
- **Overlap**: the round button must not cover a drawer's or modal's own buttons. It sits beneath
  open drawers and modals, as the design's layering does, and toasts stay readable.
- **End of a page**: every signed-in page has about 88px of empty space below its content. Scrolled
  to the bottom, the last table row, pagination or button sits above the launcher, never under it
  (Clarification Q2).
- **Small phones (320–430px)**: the panel is full width. The four Features switch labels and the
  ticket cards fit without sideways scrolling.
- **Long messages**: long words wrap inside the bubble rather than overflowing.
- **Reload**: chats, tickets, votes and ideas reset to the seed (Constitution Principle III).

## Requirements *(mandatory)*

### Functional Requirements

**Launcher and panel**

- **FR-001**: Every signed-in screen MUST show the Uza AI launcher as the design shows it:
  - a 58px round button fixed 24px from the bottom-right corner;
  - a green gradient, a white border and a sparkles icon;
  - the tooltip "Open Uza AI" on hover or focus;
  - the accessible name "Open Uza AI".

  It MUST be hidden while the panel is open and whenever the user is signed out.
- **FR-002**: Selecting the launcher MUST open a right-hand panel and start a new empty chat. The
  panel MUST:
  - be a dialog labelled "Uza AI and help";
  - be 460px wide, or full width on smaller screens;
  - have a tab strip with "Uza AI" (sparkles), "Support" (message-square) and "Features"
    (lightbulb);
  - show the active tab with a green underline;
  - have a Close button.
- **FR-001a**: Every signed-in page's main content MUST end with about 88px of empty space (the 58px
  launcher, its 24px offset and a small gap). Scrolled to the bottom, no control may sit under the
  launcher.
- **FR-003**: The panel MUST close with Close or the Escape key, and return focus to the launcher.

**Uza AI chat**

- **FR-004**: The chat view MUST match User Story 1, scenarios 2, 3 and 7:
  - the header, the empty state and the four suggestion chips;
  - the message bubbles: the user's in green on the right; Uza AI's in grey on the left, with a
    sparkles avatar;
  - the typing indicator, the "Viewing: …" chip, and the composer with its 4,000-character counter,
    attach and Send.
- **FR-005**: Uza AI MUST answer using the keyword rules, wording and order in User Story 1,
  scenario 4 and User Story 3, scenario 1. Answers about money owed, stock and spending MUST be
  worked out from the live demo data at the moment of asking.
- **FR-005a**: Before giving any answer that has a target screen, Uza AI MUST check that the current
  role can see that screen. If it can't, Uza AI MUST reply "You don't have access to {area}. Ask the
  business owner." with no action button and no figures or steps.
- **FR-006**: Action buttons MUST open the named module and tab. Ticket actions MUST open that ticket
  in Support. On screens under 900px wide, a module action MUST close the panel.
- **FR-007**: The chat list MUST match User Story 2:
  - the "All" and "Last 7 days" filters;
  - the "Last 7 days" and "Older" groups;
  - the age labels relative to the demo date of 10 Nov 2026;
  - the three seeded chats, with their exact messages from the design;
  - "No chats in this period." when a filter leaves no chats.
- **FR-008**: Sending a message MUST create a chat when none is open, titled with the message or the
  file name, at the top of the list. It MUST also update the chat's date to the demo date.

**Support**

- **FR-009**: Support MUST list the tickets newest first, as in User Story 3, scenario 3. It MUST be
  seeded with the three design tickets and their conversations (User Story 3, scenario 4).
- **FR-010**: The ticket view MUST show:
  - the conversation;
  - the status pill, using the tones Open = info, In progress = info and Resolved = success, with the
    priority pills mapped High = danger, Medium = warning and Low = neutral;
  - a reply box, only while the ticket is not Resolved or Closed.
- **FR-011**: The new-request form MUST validate as in User Story 3, scenario 7. On success it MUST
  create the ticket, add the automatic reply that matches its priority, open the ticket and show the
  toast.
- **FR-012**: Ticket numbers MUST continue from the highest existing ref, with a floor of 1042. The
  first new ticket is TKT-1043.
- **FR-013**: A problem reported through the chat MUST create a Medium ticket, as in User Story 3,
  scenario 2.

**Features**

- **FR-014**: The Features tab MUST provide Roadmap, My ideas, Browse and New, as in User Story 4, and
  be seeded with the eight design ideas and the user's existing vote.
- **FR-015**: Voting MUST toggle the user's vote and update every count shown for that idea (Roadmap,
  lists and similar-idea chips).
- **FR-016**: New ideas MUST pass the validation and similar-idea check in User Story 4, scenario 7
  before they can be submitted.

**General**

- **FR-017**: Uza AI MUST NOT send data over the network or read attached file contents. All state is
  in memory and resets on reload.
- **FR-018**: The design's text MUST be used exactly. That covers labels, placeholders, error
  messages, toasts, empty states and answer wording, except where Design deviations says otherwise.
- **FR-019**: Everything in the panel MUST be usable by keyboard and screen reader:
  - tabs, chips, list rows, vote buttons (with `aria-pressed` and a "Vote for … / Remove vote for …"
    label) and every icon button have accessible names;
  - focus stays inside the open panel;
  - new Uza AI replies are announced politely.
- **FR-020**: The panel MUST work at every width from 320px to desktop without sideways scrolling.
- **FR-021**: The icons the panel uses MUST be available through the shared icon set: the design's
  additions (sparkles, message-square, lightbulb, wrench, paperclip, send, thumbs-up, lock and
  arrow-left) plus arrow-up-right on action buttons.

### Key Entities

- **Chat (conversation)**: an id, a title, a date, its messages, and whether it is waiting for
  problem details.
- **Chat message**: who sent it (the user or Uza AI), the text, an optional attached file name, and
  an optional action. An action either opens a module and tab with a label, or opens a ticket.
- **Support ticket**: a ref (TKT-####), a subject, a priority (Low, Medium or High), a status (Open,
  In progress, Resolved or Closed) and its messages.
- **Ticket message**: who sent it ("You", "UzaPro support" or "Faith · UzaPro support"), a time
  label and the text.
- **Feature idea**: an id, a title, a description (the outcome), a status (Planned, In progress,
  Done or Under review), an optional timing (eta), a base vote count, tags, and whether it is the
  user's own.
- **Vote**: whether the user has voted for an idea.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any signed-in screen, a presenter can open Uza AI and get the overdue-invoices
  answer in 2 actions and under 3 seconds.
- **SC-002a**: As the Cashier, asking about money owed, spending or purchases returns the
  no-access reply in 100% of checks, with no figures shown.
- **SC-002**: All 8 answer types (money owed, stock, spending, refunds, invoices, sales, purchases,
  greeting), plus the fallback and the problem report, produce the design's wording. Each action
  button lands on the right screen, in 100% of checks.
- **SC-003**: After recording a payment or an expense, asking again shows the updated figure, in
  100% of checks.
- **SC-004**: A presenter can report a problem through chat and find the new ticket in Support in
  under 30 seconds.
- **SC-005**: Voting, sharing an idea and raising a support request each finish with the design's
  confirmation (an updated count or a toast) and no console errors.
- **SC-006**: The panel and launcher pass the automated accessibility scan with no serious or
  critical issues. The panel shows no sideways scrolling at widths of 320, 360, 375, 390, 414 and
  430px.
- **SC-006a**: At widths of 320–430px, with any page scrolled to the bottom, the launcher overlaps no
  link, button or input on the page.
- **SC-007**: Every existing smoke test still passes. The launcher must not block any control those
  tests use.

## Assumptions

- **The canvas is the source**: this spec was written from the canvas file
  `design/canvas/Uzapoint ERP.dc.html` (version 1794506539, now saved in the repository). The panel
  markup, `aiStore`, `aiAnswer`, `aiVals`, `aiTickets`, `aiTicketMsgs` and `aiAddTicket` define the
  behaviour.
- **Scripted, not a real AI**: in line with the constitution, answers follow the design's keyword
  rules. Connecting a real assistant is future work behind the same data-layer seam.
- **Support tickets** come from the Help module's design rows ("Help requests"). Feature 007 replaced
  the Help module's tabs with the Help Center, so the tickets now live only in Uza AI's Support tab.
  The Help Center itself is unchanged.
- **Demo date**: ages and new-ticket dates use the app's demo date of 10 Nov 2026. Times on new
  messages use the real clock time, as in the design.
- **Role access**: the design has no role rule for Uza AI, so every role sees the launcher. Answers
  are limited by role (Clarification Q1). Asking for the greeting, the fallback, a problem report or
  a file reply works for every role.
- **Spending "this month"** counts Paid expenses dated November 2026. "Waiting approval" counts
  expenses in that state, as in the design.
- **Low stock** is the items in the stock low-stock list whose status is not "Healthy", as in the
  design.
- **Focus trap, Escape and announcing new replies** are accessibility additions that the
  constitution requires (Principle IV); the design does not show them.

## Design deviations

Required by Constitution Principle I. These are the only intended differences from the canvas.

| Deviation | Reason | Reference |
|---|---|---|
| Every signed-in page gets about 88px of empty space at the bottom so the launcher never hides the last controls | User decision (Clarification Q2); the canvas lets the button float over content | FR-001a |
| The panel closes with Escape, traps focus and announces new replies | Constitution Principle IV (accessibility); the canvas has no keyboard handling | FR-003, FR-019 |
| Answers are limited by role: when the role can't see the answer's target screen, Uza AI replies "You don't have access to {area}. Ask the business owner." | Role-based access from feature 001; the canvas answers every role the same way. User decision (Clarification Q1). | FR-005a |
| The idea toast reads "Thanks. Your idea was shared." instead of the canvas's "Thanks! Your idea was shared." | Constitution Principle IV forbids exclamation marks; Principle I allows a recorded deviation | FR-018 |
| The panel sits one layer lower than the canvas (below drawers and modals) | So a record opened from a chat action shows above the panel | FR-002 |

Visual review (T031, 2026-11-12): every panel view was compared with the canvas markup at 1440px and 375px. There are no differences beyond the rows above. Continuing an older chat keeps its place in the list and re-dates it to "Today", as the canvas does.
