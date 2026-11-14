# Feature Specification: WhatsApp receipts, invoices and payment reminders

**Feature Branch**: `020-whatsapp`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "continue" (roadmap item 5, first part: "WhatsApp receipts, statements and payment reminders"; chosen by the assistant because it is the one item in that group that works without a backend, and reported to the user as such).

## Context

In East Africa a shop's customers are on WhatsApp, not email. Today UzaPro can "send" a receipt by SMS or email, both simulated, and has no way to chase a customer who owes money other than phoning them.

WhatsApp has click-to-chat links: a link that opens a chat with a given number and a message already typed, for the user to press send. That needs no backend and no WhatsApp Business account, so it can be real in this prototype: UzaPro writes the message, the user sends it from their own WhatsApp.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remind a customer who owes money (Priority: P1)

The accountant opens Receivables, finds an overdue row for Morningview Bicycles and chooses "Send reminder". A dialog shows the customer's phone number and a message that lists what they owe: each open invoice with its due date and balance, the total, and how to pay. The accountant can edit either, then chooses "Open WhatsApp", which opens a WhatsApp chat with the message ready to send. The reminder is logged, and the next time the dialog opens it says when the customer was last reminded.

**Why this priority**: collecting money owed is the most valuable message a wholesaler sends.

**Independent Test**: choose "Send reminder" on a receivable. The message lists that customer's open receivables and their total; the link goes to the customer's number in international form with the message; after it is used, reopening the dialog shows when the last reminder went.

**Acceptance Scenarios**:

1. **Given** a receivable with a balance, **When** "Send reminder" is chosen, **Then** a dialog shows the customer's phone and a message listing every open receivable of that customer (document, due date, balance, and "overdue by N days" where it applies) and the total.
2. **Given** the dialog, **When** "Open WhatsApp" is used, **Then** a WhatsApp chat opens in a new tab for the phone number in international form (254…) with the message, a toast reads "WhatsApp opened for {customer}.", and the reminder is logged.
3. **Given** a customer reminded earlier in the session, **When** the dialog opens again, **Then** it shows "Last reminded {date and time}".
4. **Given** a customer with no phone number, or one that is not a valid number, **When** the dialog opens, **Then** "Open WhatsApp" is unavailable until a valid number is typed, with the hint "Enter a mobile number, for example 0712 345 678".
5. **Given** a receivable that is paid or voided, **When** its menu opens, **Then** "Send reminder" is not offered.

---

### User Story 2 - Send a receipt or an invoice on WhatsApp (Priority: P1)

After a sale, the cashier chooses "WhatsApp" on the till receipt or on the sale's record. The message lists the items, the total and how it was paid. On an invoice, "WhatsApp" writes a message with the invoice number, the amount, the balance and the due date.

**Why this priority**: it is what customers ask for at the counter, and it replaces printing.

**Independent Test**: open a sale and choose "WhatsApp": the message has the sale reference, each item with its quantity and amount, and the total. Do the same on an invoice: number, amount, balance due and due date.

**Acceptance Scenarios**:

1. **Given** a sale's record, **When** "WhatsApp" is chosen, **Then** the dialog's message has the business name, the sale reference and date, one line per item, the total, and the payment (or "on credit").
2. **Given** an invoice, **When** "WhatsApp" is chosen, **Then** the message has the invoice number, the amount, the balance due and the due date.
3. **Given** the till's receipt, **When** "WhatsApp" is chosen, **Then** the same receipt message is offered, above the till.
4. **Given** a walk-in sale, **When** "WhatsApp" is chosen, **Then** the phone field is empty and must be typed.

---

### Edge Cases

- **Phone formats**: "+254 712 340 118", "0712 340 118", "254712340118" and "712340118" all become 254712340118. Anything else is not valid.
- **The message can be edited** before sending; UzaPro does not keep the edited text.
- **UzaPro does not know whether the message was sent.** It logs that WhatsApp was opened.
- **No WhatsApp on the device**: the link opens WhatsApp's web page, which explains what to do.
- **Read-only roles** can send receipts, invoices and reminders: nothing is changed by them.
- **Narrow screens**: the dialog works from 320px wide.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Receivables MUST offer "Send reminder" on a receivable with a balance that is not voided.
- **FR-002**: The reminder message MUST list every open receivable of that customer (document or reference, due date, balance, days overdue), the total owed, and the business name.
- **FR-003**: A sale's record and the till receipt MUST offer "WhatsApp" with a receipt message: business name, reference, date, items with quantity and amount, total, and payment.
- **FR-004**: An invoice's record MUST offer "WhatsApp" with the invoice number, amount, balance due and due date.
- **FR-005**: The dialog MUST show the customer's phone (editable) and the message (editable), and a link "Open WhatsApp" that opens a click-to-chat link in a new tab for the number in international form.
- **FR-006**: The link MUST be unavailable until the number is a valid Kenyan mobile number.
- **FR-007**: Using the link MUST show "WhatsApp opened for {name}." and, for a reminder, log the date and time against the customer.
- **FR-008**: The dialog MUST show when the customer was last reminded in this session.
- **FR-009**: These actions MUST be available with Read on the module.
- **FR-010**: UzaPro itself MUST NOT send anything or call any service: the message leaves from the user's own WhatsApp.
- **FR-011**: The ideas list entry "Send receipts on WhatsApp" MUST change to Done, and the Help Center MUST gain an article. New controls MUST use existing components and tokens and pass the accessibility checks.

### Key Entities

- **Reminder log**: per customer, the dates and times a reminder was opened in WhatsApp this session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reminder can be on its way in 3 clicks from the Receivables list.
- **SC-002**: The reminder's total always equals the customer's balance owed in Receivables.
- **SC-003**: Every phone format in Edge Cases produces the same international number; invalid numbers never produce a link.
- **SC-004**: The app makes no network request of its own when a message is prepared or opened.

## Assumptions

- **Click-to-chat, not the WhatsApp Business API.** Automated sending, delivery receipts, templates and scheduled reminders need a backend and a WhatsApp Business account, and are out of scope.
- **Kenyan mobile numbers** (07… and 01…), matching the rest of the app.
- **Statements** as a separate message are out of scope; the reminder lists what is owed.
- **The seed customers' phone numbers** are the canvas's example numbers.
- **Dependencies**: sales (001), receivables (003), the till (010), credit (012).

## Design deviations

Required by Constitution Principles I and II, and noted against the Technology Constraints. Added following the user's "continue" on the roadmap (2026-11-15).

| Canvas | Built | Why |
|---|---|---|
| Receipts are sent by SMS or email (simulated) | Also "WhatsApp", which opens a real click-to-chat link | Roadmap item; WhatsApp is how customers are reached |
| Receivables rows have Record payment, priority and View | Also "Send reminder" | Same |
| The constitution allows no third-party APIs in this phase | A link to `wa.me` that the user chooses to open. The app calls nothing and sends nothing | It is a hyperlink, not an integration; recorded here so it is a known exception |
| Ideas list: "Send receipts on WhatsApp" is Under review | Done | It is now built |
