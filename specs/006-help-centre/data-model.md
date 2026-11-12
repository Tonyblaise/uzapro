# Data Model: Help Centre

These are additions to `AppState`. All of them are seeded verbatim from the design and reset on
reload.

## help

- `messages: ChatMessage[]`. Each message is `{ me: boolean; text: string }`.
- Seeded with the design's three messages. The order matters, because it is the display order.
- Rules:
  - Text is trimmed.
  - Blank text adds nothing.
  - Each accepted message is followed by `CHAT_REPLY`.

## generic (existing slice from feature 005)

- New keys:
  - `sup/how-to-guides`: Article, Category, Views, Status
  - `sup/help-requests`: Ticket, Subject, Priority (pill), Status (pill)
  - `sup/response-times`: Priority, Respond in, Resolve in, Met
- Each key has 3 rows, verbatim from `UZ_MODS` › `sup`.
