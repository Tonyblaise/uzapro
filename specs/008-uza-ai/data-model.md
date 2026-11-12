# Data Model: Uza AI

The types go in `src/data/types/office.ts`, the seed in `src/data/fixtures/uzaai.ts`, and the store
slice `ai` in `src/data/store/state.ts`. All of it is in memory and re-seeded on reload.

## Types

```ts
type AiAction =
  | { kind: "screen"; label: string; module: ModuleId; tab: string }   // "Open Receivables"
  | { kind: "ticket"; label: string; ref: string };                    // "Open TKT-1043"

interface AiMessage {
  me: boolean;          // true for the user, false for Uza AI
  text: string;         // shown with line breaks preserved
  file?: string;        // the attached file's name only; the file itself is never read
  act?: AiAction;
}

interface AiChat {
  id: string;           // "c1".."c3" seeded; "n{seq}" new
  title: string;        // the first message text, or the file name
  date: string;         // ISO; set to DEMO_TODAY on every send
  msgs: AiMessage[];
  awaitingDetails: boolean;   // design `bug[conv.id]`
}

type TicketPriority = "Low" | "Medium" | "High";
type TicketStatus = "Open" | "In progress" | "Resolved" | "Closed";

interface TicketMessage {
  me: boolean;
  who?: string;         // "Faith · UzaPro support" | "UzaPro support"; "You" when me
  when: string;         // "14 Oct 2026, 10:12" | "Automatic reply"
  text: string;
}

interface SupportTicket {
  ref: string;          // "TKT-1042"
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  msgs: TicketMessage[];
}

type IdeaStatus = "Planned" | "In progress" | "Done" | "Under review";

interface FeatureIdea {
  id: string;           // "i1".."i8" seeded; "u{seq}" the user's own
  title: string;
  desc: string;         // the outcome
  status: IdeaStatus;
  eta?: string;         // "2-4 weeks", "Released Oct 2026"
  votes: number;        // base count, not including the user's vote
  tags: string;         // "payments, mpesa"; "" when none
}
```

## Store slice `ai`

```ts
interface AiState {
  // data
  chats: AiChat[];                    // newest first
  tickets: SupportTicket[];           // newest first
  ideas: FeatureIdea[];               // seed order; Browse sorts by count
  votes: Record<string, boolean>;     // seed { i6: true }
  mine: Record<string, boolean>;
  seq: number;                        // starts at 1; used for chat and idea ids
  // panel
  open: boolean;
  tab: "chat" | "support" | "features";
  view: "list" | "chat";
  chatId: string | null;              // null means a new, empty chat
  draft: string;                      // up to 4,000 characters
  file: string | null;
  typing: boolean;
  filter: "all" | "week";
  support: { view: "list" | "new" | "ticket"; ref: string | null; form: { subject: string; priority: TicketPriority; body: string }; error: string; reply: string };
  features: { tab: "Roadmap" | "My ideas" | "Browse" | "New"; q: string; form: { title: string; outcome: string; tags: string }; checked: boolean; error: string };
}
```

## Seed (from the canvas `aiStore`, `aiTicketMsgs` and the Help requests rows)

**Chats**:

| Id | Title | Date | Messages |
|---|---|---|---|
| c3 | Which customers owe me money? | 2026-11-07 | The user asks the title. Uza AI replies "2 customers have overdue invoices. Open Receivables to see each one and record payments." with the action "Open Receivables" (rcv › Receivables). |
| c2 | How do I give a refund? | 2026-10-29 | The user asks the title. Uza AI replies with the design's credit-note steps and the action "Open Refunds" (sales › Refunds (credit notes)). |
| c1 | Receipt printer stopped printing | 2026-10-14 | Four messages: "Report a problem"; the request for details; "Receipt printer stopped printing at the Westlands till."; then "Thanks. I logged this as TKT-1042 so the support team can look at it. You can follow it under Support." |

**Tickets**:

| Ref | Subject | Priority | Status | Messages |
|---|---|---|---|---|
| TKT-1042 | POS printer not connecting | High | Open | The user's message at 14 Oct 2026, 10:12. |
| TKT-1041 | Stock count mismatch | Medium | In progress | The user's message at 22 Oct 2026, 15:40, then Faith at 22 Oct 2026, 16:05: "Thanks for reporting this. We can see the problem and are working on a fix. We'll update you here." |
| TKT-1038 | Invoice email not sending | Low | Resolved | The user's message at 30 Sep 2026, 09:05, then Faith at 30 Sep 2026, 16:05: "This is fixed now. Let us know here if it happens again." |

The user's first message on each seeded ticket is the subject followed by ".".

**Ideas**: i1–i8, exactly as in spec User Story 4, scenario 3. The descriptions, ETAs and tags are
copied from the design.

## Derived values (pure helpers in `src/data/uzaai.ts`)

| Helper | Returns |
|---|---|
| `answer(text, ctx)` | `{ text, act? }`. The rules are in research R2. |
| `chatAge(iso)` | "Today", "{n}d", "{n}w" or "{n}mo", relative to `DEMO_TODAY` |
| `chatGroups(chats, filter)` | Headed groups: "Last 7 days" (dates on or after `DEMO_TODAY` minus 7 days) and "Older" |
| `ideaVotes(idea, votes)` | `idea.votes` plus 1 if the user voted |
| `roadmap(ideas, votes)` | The Planned, In progress and Done groups, with counts and cards; empty groups are left out |
| `browseIdeas(ideas, votes, q)` | Ideas matching the search, sorted by count |
| `myIdeas(ideas, votes, mine)` | Ideas the user shared or voted for |
| `similarIdeas(ideas, title, outcome)` | Up to 3 ideas scoring 2 or more (research R5) |
| `nextTicketRef(tickets)` | `TKT-{max(highest number, 1042) + 1}` |
| `ticketTone(status)` / `priorityTone(p)` | StatusPill tones (research R4) |
| `viewingLabel(pathname)` | The text after "Viewing:" (research R9) |
| `clipSubject(text)` | The text, or its first 57 characters plus "…" when longer than 60 |

## State transitions

**Ticket**: new tickets start as `Open` and are never changed in the demo. Seeded tickets keep their
design status. Replies are allowed while the status is not Resolved or Closed.

**Chat**: new (`chatId` null) → created on the first send, and `awaitingDetails` set when a problem
keyword appears. The next send in that chat creates a ticket and clears `awaitingDetails`.

**Idea**: a submitted idea starts as `Under review` and stays there in the demo. A vote toggles in
`votes`.

## Validation

| Form | Rule | Message |
|---|---|---|
| Support request | The subject is blank after trimming | "Add a subject so we know what this is about." |
| Support request | The description is blank | "Tell us what happened." |
| Idea | The title is blank | "Give your idea a title." |
| Idea | The outcome is blank | "Say what the idea would help you do." |
| Chat | The text is blank and there is no file, or Uza AI is typing | Send is disabled and the call does nothing |
| Ticket reply | The text is blank | Does nothing |
