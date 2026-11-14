# Feature Specification: Integrations

**Feature Branch**: none of its own. Built in the working tree alongside `014-bulk-units-reorder`, which was in progress at the time and is not part of this feature.

**Created**: 2026-11-15

**Status**: Implemented

**Input**: User description: "I want to build the integrations page", with six screenshots of another product's Integrations area: M-Pesa (Daraja) with Paybill and Till variants, the "Applies to" list, a sub-menu, and M-Pesa bank integrations (NCBA Bank).

## Context

UzaPro takes M-Pesa at the till, but the business has nowhere to say which M-Pesa account the money goes to. M-Pesa was only a payment method name and a "Connected" row under Settings › Connected apps.

This feature adds an **Integrations** module where the owner enters the business's own M-Pesa credentials: directly with Safaricom (Daraja), or through a bank till (NCBA). Credentials can be business-wide or for one terminal.

Decisions taken with the user before building:

- Sub-navigation uses the app's tab strip, not the screenshots' fly-out menu.
- Only the two M-Pesa pages are built at first; QuickBooks was added afterwards (User Story 4). API management, Third party apps and Webhooks are not.
- Settings › Connected apps and Import and export moved to Integrations at first, and were then removed altogether at the user's request.
- Connection tests and URL registration are simulated (Principle II).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect the business's own M-Pesa account (Priority: P1)

The owner opens Integrations › M-Pesa (Daraja), chooses "All terminals (business-wide)", picks Paybill or Till, enters the numbers and the three Daraja keys, and saves. They test the connection, then register the payment URLs. Three status pills show how far set-up has got.

**Why this priority**: it is the reason the module exists.

**Independent Test**: save a Paybill for all terminals, test it, register URLs. All three pills read done. Change the Paybill number and save: "Connection tested" and "Payment URLs registered" go back to not yet.

**Acceptance Scenarios**:

1. **Given** the form, **When** the account type is Paybill, **Then** it asks for the Paybill number and shows "Account numbers (optional)"; **When** it is Till, **Then** it asks for the store number (head office) and the till number instead.
2. **Given** an incomplete form, **When** Save is chosen, **Then** each missing field shows its own message and nothing is saved.
3. **Given** a valid form, **When** it is saved, **Then** a toast reads "M-Pesa credentials saved.", "Configured" is done, and the key fields are empty with the placeholder "Saved. Type a new one to replace it".
4. **Given** nothing saved for the chosen scope, **Then** "Test connection" and "Register payment URLs" are disabled; after a save, Test is enabled; after a test, Register is enabled.
5. **Given** saved credentials, **When** a field is edited, **Then** Test and Register are disabled until the change is saved, and saving needs a fresh test.
6. **Given** a business-wide Paybill, **When** "Add terminal" is used, **Then** a terminal can be given its own account number, once each.
7. **Given** "Terminal 1 · no credentials yet" is chosen, **Then** the form is empty and saves credentials for that terminal only; the list then reads "Terminal 1 · own credentials".

---

### User Story 2 - Collect M-Pesa through a bank till (Priority: P2)

The owner opens Integrations › M-Pesa bank integrations, picks NCBA Bank, chooses what it applies to, enters the NCBA till number and saves. UzaPro creates the API and notification credentials the business gives the bank in its instruction letter. Each has a copy button. Secret ones are never displayed.

**Independent Test**: save with a till number. The six created fields fill in, the secret ones as dots; copying a secret puts the real value on the clipboard. Saving again keeps the same credentials.

**Acceptance Scenarios**:

1. **Given** nothing saved, **Then** the created fields read "Created when you save" and their copy buttons are disabled.
2. **Given** no till number, **When** Save is chosen, **Then** "Enter your NCBA till number" shows.
3. **Given** a valid form, **When** it is saved, **Then** a toast reads "NCBA Bank credentials saved.", the bank tile reads "Configured", and the created fields fill in.
4. **Given** saved credentials, **When** "Test connection" is chosen, **Then** "Connection tested" is done.

---

### User Story 3 - Keep credentials to the people who should see them (Priority: P2)

Only the Owner sees Integrations at first. A role given Read sees the pages and their status but cannot change anything.

**Acceptance Scenarios**:

1. **Given** a built-in role other than Owner, **Then** Integrations is not in the sidebar.
2. **Given** a role with Read on Integrations, **Then** every field is disabled and Save, Test, Register and Add terminal are not shown.

### User Story 4 - Send the books to QuickBooks (Priority: P2)

Added on request ("under integrations, add quickbooks"). The owner opens Integrations › QuickBooks, chooses Connect QuickBooks, picks what to send (invoices, payments received, customers, products, expenses), the QuickBooks account each lands in, and how often. Sync now sends them and records when it ran and how many of each went.

**Independent Test**: connect, tick Expenses, save: it asks for the expenses account. Choose one, save, Sync now: the toast and "Last sync" list the counts. Disconnect: the Connect card returns.

**Acceptance Scenarios**:

1. **Given** no connection, **Then** the page shows the Connect card and the pills read Connected: not yet, Synced: not yet.
2. **Given** a connection, **Then** it shows the company, company ID, environment and last sync, with invoices, payments and customers ticked.
3. **Given** a record kind that needs an account is ticked with no account chosen, **When** Save is chosen, **Then** that account shows its message. Nothing ticked shows "Choose at least one thing to send".
4. **Given** unsaved changes, **Then** Sync now is disabled until they are saved.
5. **Given** Disconnect is confirmed, **Then** the connection is forgotten. Disconnect needs Delete on Integrations.

### Edge Cases

- A terminal is switched off after it was given credentials: it stays in "Applies to" so they can still be seen and changed.
- The initiator name is cleared: the saved initiator password is dropped with it.
- Switching "Applies to" from a scope with saved credentials to one without clears the form; switching before anything was loaded keeps what was typed.
- The page is reloaded: everything returns to the seed (nothing configured), as with all business data (Principle III).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The sidebar MUST show Integrations in the Account section, between Profile and Settings, with tabs M-Pesa (Daraja), M-Pesa bank integrations and QuickBooks.
- **FR-002**: Connected apps and Import and export MUST no longer appear anywhere in the app.
- **FR-003**: Both M-Pesa forms MUST have an "Applies to" choice: all terminals, or one active terminal, labelled with whether it has its own credentials.
- **FR-004**: Daraja MUST validate: scope chosen; Paybill number, or store and till numbers, digits only; consumer key, consumer secret and passkey on the first save; initiator password when an initiator name is given; each per-terminal row has a terminal, used once, and an account number.
- **FR-005**: Secrets the user types MUST NOT be kept. Only whether each was saved is recorded.
- **FR-006**: Test connection MUST need saved credentials; Register payment URLs MUST need a passed test. Any save MUST reset both.
- **FR-007**: A bank save MUST create the API username, API secret key, notification URL, username, password and secret key once per scope and keep them on later saves.
- **FR-008**: Created values MUST be copyable; secret ones MUST be shown masked.
- **FR-011**: QuickBooks MUST connect at most one company, send one way only (UzaPro to QuickBooks), and need an account only for the record kinds being sent.
- **FR-009**: Without Write on Integrations, fields MUST be disabled and action buttons hidden.
- **FR-010**: Required fields MUST be marked with an asterisk that is not announced twice to screen readers.

### Key Entities

- **Daraja config**: one per scope. Environment, account type, numbers, per-terminal account numbers, initiator name, which secrets are saved, tested, URLs registered.
- **QuickBooks connection**: at most one. Environment, company name and ID, what to send, three account choices, how often, last sync.
- **Bank config**: one per bank and scope. Environment, till number, QR till code, created credentials, tested.

## Success Criteria *(mandatory)*

- **SC-001**: An owner can go from nothing to "Payment URLs registered" in one visit without leaving the page.
- **SC-002**: No typed secret appears anywhere in app state after saving.
- **SC-003**: Both pages fit a 390px phone without horizontal page scroll.
- **SC-004**: A role without Write cannot change any credential.

## Assumptions

- NCBA is the only bank for now; the bank list is data, so more can be added.
- NCBA has no test environment, so its Environment list has one entry.
- Per-terminal account numbers apply only to a business-wide Paybill.
- The till's M-Pesa request (feature 010) is unchanged; it does not yet read these credentials.

## Design deviations

- **New module outside the design canvas** (Principle I): the canvas has no Integrations module. Added at the user's request, built from existing primitives.
- **Not copied from the reference screenshots**: fly-out sub-menu and icon rail (tabs used instead), uppercase field labels (the app's label style is kept), dark mode and language switches, and the other product's name.
- **Two canvas tabs removed**: Settings › Connected apps and Import and export are gone. Connected apps listed placeholder rows (M-Pesa, Shopify, SMS gateway, Amazon) with nothing behind them; the Integrations tabs replace it.
- **Simulated requests** (Principle II): Test connection, Register payment URLs, and the QuickBooks connect and sync wait briefly and succeed. The QuickBooks company is the business's own name with a demo company ID and a demo list of accounts. Nothing is sent. Bank credentials are repeatable demo values on the reserved `.example` domain.
- **`required` on Field, Input and Select**: a small addition to shared primitives for the asterisk.
