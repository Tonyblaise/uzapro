# Feature Specification: Help Centre

> **Superseded by feature 007** (`specs/007-help-center-articles/`): at the user's request, Help became a
> documentation-style Help Center, and the Ask UzaPro chat and the three Help lists were removed.

**Feature Branch**: `006-help-centre`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "the Ask UzaPro chat, guides, help requests and response times"

## Scope at a glance

The Help module (`sup`) is the last module still showing a placeholder. It has four tabs in the
canvas:

| Tab | What it is in the design |
|---|---|
| Ask UzaPro | a chat with the UzaPro assistant |
| How-to guides | a list (3 articles) |
| Help requests | a list (3 tickets) |
| Response times | a list (3 priority levels) |

The three list tabs have only the design's shared list behaviour. Feature 005 already built that
behaviour for Reports, Team and other modules, and this feature reuses it unchanged. The only new
behaviour is the chat. As in feature 005 (Clarification Q1 there), the demo copies the design
exactly and invents nothing beyond it (Constitution Principle I).

## User Scenarios & Testing *(mandatory)*

Visibility follows the design's role definitions:

| Role | Can open |
|---|---|
| Owner, Accountant | all four Help tabs |
| Cashier, Store keeper | Ask UzaPro and How-to guides only |

### User Story 1 - Ask the assistant (Priority: P1)

The presenter opens Help › Ask UzaPro. A header card reads "UzaPro assistant" with the line "Ask
about stock, an invoice, or how to do something.". Below it is the conversation, which starts with
the design's three messages:
- the assistant's greeting;
- the question "How do I issue a credit note?";
- the assistant's answer about Sales → Refunds.

Messages from the user sit on the right in the action colour, and the assistant's sit on the left on
the surface colour. The presenter types a message and presses Send or Enter. Their message appears,
followed by the assistant's reply, which in the design is always: "Open Reports for the full
figures, or search for a record by its ID, for example INV-0355.".

**Why this priority**: it is the only interactive part of Help and the tab the module opens on.

**Independent Test**: open Help, type "Where is my stock?" and press Enter. Confirm the message and
the assistant's reply appear below the three seed messages, and the message box is cleared.

**Acceptance Scenarios**:

1. **Given** Help › Ask UzaPro, **When** it opens, **Then** the header card and the three seed
   messages are shown in order.
2. **Given** a typed message, **When** the presenter presses Send or Enter, **Then** the message
   and the design's reply are added, and the box is cleared.
3. **Given** an empty or blank message box, **When** the presenter presses Send or Enter,
   **Then** nothing is added.
4. **Given** a conversation with new messages, **When** the presenter moves to another module and
   comes back, **Then** the conversation is still there. It resets only on reload.

---

### User Story 2 - Browse guides, help requests and response times (Priority: P2)

The presenter opens How-to guides, Help requests and Response times. Each shows the design's
columns and seed rows, with priority and status pills in the design's tones. They use the shared
list behaviour:
- search with "Showing N of M";
- "Export CSV";
- a View drawer for each row;
- Delete for the Owner only, with confirmation and "{name} deleted.";
- the header "New" button opens the "New record" form, and saving it shows "Record created."
  without adding a row.

**Why this priority**: it completes the module with the design's content and carries no logic of its
own.

**Independent Test**: open Help requests as the Owner and confirm TKT-1042, TKT-1041 and TKT-1038
are listed with their priority and status pills. Delete TKT-1038 and confirm "TKT-1038 deleted.".

**Acceptance Scenarios**:

1. **Given** How-to guides, **When** it opens, **Then** "Setting up a POS terminal", "How to give a
   refund" and "Reconciling a bank feed" are listed with their category, views and status.
2. **Given** Response times, **When** it opens, **Then** High, Medium and Low are listed with their
   respond-in and resolve-in times and the share met (88%, 94%, 97%).
3. **Given** the Cashier, **When** they open Help, **Then** only Ask UzaPro and How-to guides are
   offered, and How-to guides offers no Delete.

---

### Edge Cases

- Sending a message made only of spaces does nothing.
- Every message gets the same reply, as in the design. The assistant does not look anything up.
- The header "New" button also appears on the Ask UzaPro tab, because the design's generic fallback
  applies to every Help tab. Saving it shows "Record created." and changes nothing.
- Reload resets the conversation and the lists to the design seed (Constitution Principle III).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Help MUST provide the tabs Ask UzaPro, How-to guides, Help requests and Response
  times, and open on Ask UzaPro.
- **FR-002**: Ask UzaPro MUST show the design's header card ("UzaPro assistant" and its line) and
  the conversation. It starts with the design's three seed messages, with the user's messages on
  the right and the assistant's on the left.
- **FR-003**: Users MUST be able to send a message with the Send button or the Enter key. A
  non-blank message adds the user's message and then the design's fixed reply, and clears the box.
  A blank message adds nothing.
- **FR-004**: The conversation MUST last for the session while moving around the app, and reset on
  reload.
- **FR-005**: How-to guides, Help requests and Response times MUST show the design's columns and
  seed rows, and behave exactly as the shared list screens from feature 005 (FR-016 there).
- **FR-006**: Every Help tab MUST offer the design's generic "New" header button.
- **FR-007**: Tab visibility MUST follow the design's role definitions (the table under User
  Scenarios), and Delete MUST be offered to the Owner only.

### Key Entities

- **Chat message**: who sent it (the user or the assistant) and its text.
- **Guide, help request, response time**: list rows with the design's columns and pills.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side review, 100% of the Help tabs match the design's layout, wording and
  figures, apart from documented deviations.
- **SC-002**: A presenter can send a question and see the assistant's reply in under 10 seconds.
- **SC-003**: For each role, 100% of visible Help tabs match the design's role definitions, a full
  click-through produces no visible errors, and no screen in the app shows the "Not built yet"
  placeholder.

## Assumptions

- Seed data is ported verbatim from the design: the three chat messages, the fixed reply, and the
  list rows in the module registry (3 guides, 3 help requests, 3 response times).
- The assistant is a fixed reply, as in the design. Nothing is sent anywhere, and no AI or search is
  involved.
- The shared list, form and "New record" behaviour from feature 005 is reused without change.
- Desktop is the primary demo target; phone width must stay usable.

## Design deviations

Required by Constitution Principle I.

| Deviation | Reason | Reference |
|---|---|---|
| The conversation is a polite live region named "Conversation", and the composer is a form, so Enter and Send share one submit | Accessibility (Principle IV): new replies are announced; no visual change | FR-002, FR-003 |
