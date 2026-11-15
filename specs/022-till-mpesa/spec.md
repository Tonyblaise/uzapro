# Feature Specification: The till uses the saved M-Pesa set-up

**Feature Branch**: `022-till-mpesa`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "sure" (in reply to the assistant's suggestion: "Make the till use the saved M-Pesa credentials … let the till refuse or warn when M-Pesa isn't configured, and use the per-terminal account numbers.")

## Context

Feature 015 added Integrations, where a business saves its M-Pesa (Daraja) and bank set-up for all terminals or for one. The till (feature 010) ignored it: "Send request" at checkout always worked, whether or not anything was set up. This feature joins the two. Requests are still simulated; nothing is sent.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - No set-up: type the code (Priority: P1)

A cashier chooses M-Pesa at checkout on a terminal with no M-Pesa set-up. The till says requests are not set up and asks for the code from the customer's message. There is no phone field and no "Send request".

**Independent Test**: with the seed, open Terminal 1, charge a sale, choose M-Pesa.

**Acceptance Scenarios**:

1. **Given** nothing saved under Integrations, **When** M-Pesa is chosen, **Then** the note reads "M-Pesa requests are not set up for this terminal. Type the M-Pesa code from the customer's message. An owner can set requests up under Integrations."
2. **Given** that note, **When** a code is typed and the sale completed, **Then** the sale is recorded as before.
3. **Given** a set-up that is saved but not tested, **When** M-Pesa is chosen, **Then** the note says the connection has not been tested and requests can't be sent yet.

---

### User Story 2 - Set up: send the request and see where it goes (Priority: P1)

With a tested set-up, the cashier sees the phone field and "Send request", and the note names where the payment goes: the Paybill and account, the Till, or the bank till.

**Independent Test**: save and test a Paybill for all terminals with account FRONT for Terminal 1, then choose M-Pesa at Terminal 1's checkout.

**Acceptance Scenarios**:

1. **Given** Paybill 522522 with account FRONT for Terminal 1, **When** M-Pesa is chosen on Terminal 1, **Then** the note ends "Payments go to Paybill 522522, account FRONT."
2. **Given** that set-up, **When** a Safaricom number is entered and "Send request" chosen, **Then** the till waits, then fills in a code.
3. **Given** a terminal with its own tested set-up and a business-wide one, **When** M-Pesa is chosen, **Then** the terminal's own is used.

### Edge Cases

- A Paybill with no account number for the terminal uses the shared account number; with neither, the note says "account the sale number".
- A set-up that is saved but untested is passed over for a tested one further down the order.
- Saving a set-up again resets its test (feature 015), so the till stops sending requests until it is tested again.
- Another terminal's own set-up never applies to this terminal.

## Requirements *(mandatory)*

- **FR-001**: The till MUST choose the M-Pesa set-up for its terminal in this order: the terminal's own Daraja, the terminal's own bank, business-wide Daraja, business-wide bank; only tested set-ups count.
- **FR-002**: With no usable set-up the till MUST hide the phone field and "Send request", and say why: nothing saved, or saved but not tested.
- **FR-003**: With a usable set-up the till MUST name where payments go, including the Paybill account for that terminal.
- **FR-004**: The request command MUST make the same check itself and refuse with the same message.
- **FR-005**: A typed M-Pesa code MUST keep working in every case.

## Success Criteria *(mandatory)*

- **SC-001**: A cashier can tell from the checkout alone whether a request can be sent and where the money will go.
- **SC-002**: No request is simulated for a terminal without a tested set-up.

## Design deviations

- The design's till always offers "Send request". It is now shown only when the terminal has a tested M-Pesa set-up (Principle I). Reason: the request would otherwise claim to work with nothing behind it.
- Requests remain simulated (Principle II).

## Out of scope

Field sales (feature 021) M-Pesa, QR codes at the till, real requests, and recording which set-up a sale was paid through.
