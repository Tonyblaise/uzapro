# Feature Specification: Accounts and Expenses

**Feature Branch**: `004-accounts-expenses`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "accounts and expenses"

**Design source**: `design/canvas/Uzapoint ERP.dc.html`:
- the Accounts module (`fin`): Bank accounts, Deposits, Withdrawals, Transfers and Transactions,
  the account form (`isAccEdit`), the money-movement form (`isFinModal`) and the account filters
  (`hasAccFilter`)
- the Expenses module (`exp`): the overview board, Expenses, Recurring, Voided and Expense
  categories, the expense form (`isExpForm`), the recurring form (`isRecForm`), the void form
  (`isExpVoid`) and the category form (`isExpCat`)

Data comes from `design/canvas/erp-data.js`: `UZ_MODS` › fin / exp rows, `UZ_LEDGER`,
`UZ_ACCDETAIL`, `UZ_BANKS`, `UZ_DEPDETAIL`, `UZ_WDDETAIL`, `UZ_TRDETAIL`, `UZ_EXPCAT`,
`UZ_EXPDETAIL`, `UZ_RECDETAIL` and `UZ_EXPTREND`. Every screen, label, figure and message comes
from these files (Constitution Principle I). This feature completes the Financials section on top
of features 001–003.

## Clarifications

### Session 2026-11-12

- Q: When a sale is paid on the spot, should the money also go into an account and appear in Transactions? → A: No, follow the design: paid sales do not move account balances; only payments, expenses (and their transaction fees), deposits, withdrawals, transfers and cash refunds on credit notes do.

## User Scenarios & Testing *(mandatory)*

The Owner and the Accountant see both modules with all their tabs. The Cashier and the Store
keeper see neither (design role definitions).

### User Story 1 - Know where the money is (Priority: P1)

The presenter opens Accounts › Bank accounts and sees each account (Equity Bank — Main, M-Pesa
Till, Cash drawer). Each shows its bank or provider, account number, type and current balance.
They open an account to see its details: branch, till, opening balance, bank branch, SWIFT and
active state. They then open Transactions to see every money movement across accounts (date,
account, reference, description, signed amount), filtered by account and date range as the design
allows. They can add a new account or edit one.

Bank accounts shows a grid of account cards. Each card shows the type icon, name, type, status,
balance, opening balance and the net inflow or outflow since opening, with Deposit, Withdraw and
Edit account buttons. An "Account type" select (All account types, Bank, Mobile money, Cash, Petty
cash) filters the cards.

**Why this priority**: account balances are the backbone the other money flows update.

**Independent Test**: open Bank accounts and confirm the three seed balances match the design;
open Transactions and confirm the ten seed ledger entries are listed newest first.

**Acceptance Scenarios**:

1. **Given** Bank accounts, **When** the presenter opens the list, **Then** Equity Bank — Main
   shows 4,812,300, M-Pesa Till 386,450 and Cash drawer 24,600.
2. **Given** Transactions, **When** the presenter filters by M-Pesa Till, **Then** only its
   entries are listed (e.g. TRN-0031 −250,000, DEP-0217 +18,450, WDL-0103 −42,300).
3. **Given** "New account", **When** the presenter saves a new account with a name, type, bank and
   opening balance, **Then** it is listed with that balance and "{name} added." is shown.

---

### User Story 2 - Move money in, out and between accounts (Priority: P1)

The presenter records a deposit, a withdrawal or a transfer between two accounts. A deposit or
withdrawal has an account, method, purpose (withdrawals only), description and amount. A transfer
has a from account, a to account and an amount. Each is listed in its tab with the next reference
(`DEP-`, `WDL-`, `TRN-`). The affected account balances change, and the movement appears in
Transactions. A transfer appears there as two lines.

**Why this priority**: this is the core of the Accounts module and what makes balances move.

**Independent Test**: transfer KES 50,000 from M-Pesa Till to Equity Bank — Main and confirm the
balances become 336,450 and 4,862,300, "Transfer saved." is shown, and Transactions gains two
TRN-0032 lines.

**Acceptance Scenarios**:

1. **Given** Deposits, **When** a deposit of 10,000 into Cash drawer is saved, **Then** DEP-0219
   is listed, Cash drawer becomes 34,600, and "Deposit saved." is shown.
2. **Given** Withdrawals, **When** a withdrawal of 5,000 from M-Pesa Till is saved, **Then**
   WDL-0105 is listed, M-Pesa Till drops by 5,000, and "Withdrawal saved." is shown.
3. **Given** a transfer where the from and to accounts are the same, or an amount of 0, **When**
   the presenter tries to save, **Then** saving is blocked as in the design.

---

### User Story 3 - Record and approve expenses (Priority: P1)

The presenter records one or more expenses: date, branch, category, payee, reason, source account,
method, tax and net amount. The expense is listed with the next `EXP-` reference. Its outcome
depends on the category and the payment choice:
- **Paid**: the source account's balance drops, and an Expense entry (plus a Transaction cost
  entry if there is a fee) is added to Transactions.
- **Waiting approval**: the category needs approval, so nothing is paid until it is approved.
- **Added to Payables**: the expense is recorded as a bill to pay later.

The confirmation summarises what happened (e.g. "1 paid, 1 waiting approval."). The presenter
approves a waiting expense ("{ref} approved and paid from {account}."). They can void a paid
expense with a reason; voiding returns the money to its account ("{ref} voided. Money returned
to {account}.") and moves the expense to Voided.

**Why this priority**: recording spending is the main daily task of this module.

**Independent Test**: approve EXP-0043 (waiting approval) and confirm it becomes Paid, M-Pesa Till
drops by its amount of 6,500 (the design posts the expense's amount column; the 897 tax is shown
separately), and the payment appears in Transactions.

**Acceptance Scenarios**:

1. **Given** Expenses, **When** the presenter records a Transport expense of 2,000 paid from Cash
   drawer, **Then** EXP-0044 is listed as Paid, Cash drawer drops by 2,000, and the design's
   summary message is shown.
2. **Given** an expense in a category that needs approval (e.g. Internet and phone), **When** it
   is recorded, **Then** it is listed as Waiting approval and no balance changes until it is
   approved.
3. **Given** an expense recorded as a bill to pay later, **When** it is saved, **Then** a payable
   with the expense reference as its document appears in Payables. Paying that payable in Payables
   marks the expense Paid, as the design does.
4. **Given** a paid expense, **When** it is voided with a reason, **Then** it moves to Voided with
   the date, who voided it and the reason, and its amount returns to the source account
   (a "Voided: …" entry is added to Transactions).
5. **Given** an expense that is an unpaid bill, **When** it is voided, **Then** its payable is
   removed from Payables; voiding is not offered once that payable has been partly paid.

---

### User Story 4 - Repeat bills and spending categories (Priority: P2)

The presenter manages recurring expenses: name, category, account, amount, how often (frequency,
interval, day), start, optional end or maximum count, and auto-record. Each recurring expense
shows its next date and status. The presenter can "Record now" to create the next expense
("{EXP} recorded from {name}."), pause or resume a schedule, or edit it. Under Expense categories
they see each category's parent, monthly budget, spent this month, whether it needs approval, and
status. They can add or edit a category with colour, parent, description, budget, approval rule
and active state.

**Why this priority**: valuable depth for the demo, but secondary to recording and paying.

**Independent Test**: choose "Record now" on REC-0002 and confirm a new Internet and phone
expense of 6,500 from M-Pesa Till appears with the design's message, and the schedule's next date
advances.

**Acceptance Scenarios**:

1. **Given** Recurring, **When** "Record now" is used on an active schedule, **Then** an expense
   is created from it, the message "{EXP} recorded from {name}." is shown, and the next date moves
   one step.
2. **Given** a new recurring expense, **When** it is saved, **Then** "Set up {name} ({ref})." is
   shown and it is listed with its next date.
3. **Given** Expense categories, **When** a category is created or edited, **Then** "{name}
   created." or "{name} saved." is shown, and expenses in it follow its approval rule.

---

### User Story 5 - See spending at a glance (Priority: P2)

On Expenses › Overview the presenter sees the design's expense KPIs, the monthly spending trend
(`UZ_EXPTREND` plus this month), spending by category against budget, and recent expenses.

**Why this priority**: a summary view with no new records of its own.

**Independent Test**: open the overview as the Owner and compare every figure with the design.

**Acceptance Scenarios**:

1. **Given** the Owner, **When** they open Expenses › Overview, **Then** every KPI, chart and
   panel matches the design's values.

---

### User Story 6 - Payments move real money (Priority: P1)

Customer payments (feature 003) now increase the receiving account's balance and add a
Transactions entry ("Payment from {customer}"). Supplier payments decrease the paying account
and add an entry ("Payment to {supplier}"). Payments made with customer or supplier credit
move no money. This replaces feature 003's out-of-scope rule (FR-019 there).

**Why this priority**: it ties Receivables, Payables, Expenses and Accounts into one consistent
money picture, which is the point of completing Financials.

**Independent Test**: record a 1,026 payment on RCV-0011 into Equity Bank — Main and confirm the
account rises by 1,026 and Transactions shows the payment.

**Acceptance Scenarios**:

1. **Given** a customer payment into M-Pesa Till, **When** it is saved, **Then** M-Pesa Till rises
   by the amount and Transactions lists it with the payment reference.
2. **Given** a supplier payment from Equity Bank — Main, **When** it is saved, **Then** the
   balance drops by the amount and Transactions lists it.
3. **Given** a payment made with credit, **When** it is saved, **Then** no account balance changes.

---

### Edge Cases

- Accounts may go negative only if the design allows it. The design's supplier payment form shows
  a soft warning ("This is more than the KES … in {account}. You can still save it.") and still
  saves, so this feature shows that warning in both the supplier payment and withdrawal forms.
- An inactive account is not offered in account pickers.
- A voided expense cannot be voided again or approved.
- A paused recurring expense offers "Resume" instead of "Record now".
- Category budgets of 0 show no budget bar. "Spent this month" counts this month's non-voided
  expenses.
- Reload resets all accounts, ledger and expenses to the design seed (Constitution Principle III).

## Requirements *(mandatory)*

### Functional Requirements

**Accounts**

- **FR-001**: Accounts MUST provide the Bank accounts, Deposits, Withdrawals, Transfers and
  Transactions tabs with the design's columns, seed rows, filters, row actions and header actions.
  Bank accounts MUST show the design's card grid with its "Account type" filter. (The design's code
  also defines type chips and a list view, but its markup never shows them, so they are not built.)
- **FR-002**: Each account MUST have a balance that starts at the design's seed value and changes
  with every deposit, withdrawal, transfer, paid expense, void and payment in this session.
- **FR-003**: Users MUST be able to add and edit accounts (name, type such as Bank, Mobile money
  or Cash, bank or provider from the design's list, account number, branch, till, opening balance,
  bank branch, SWIFT, IBAN, active). New and edit use the same form, as in the design; its types
  are Bank, Mobile money, Cash and Petty cash.
- **FR-004**: Users MUST be able to record deposits, withdrawals and transfers with the design's
  fields, validation and messages ("Deposit saved.", "Withdrawal saved.", "Transfer saved."). Each
  is listed in its tab and in Transactions; a transfer adds an outgoing and an incoming line. Each
  record view offers Reverse, with the design's confirmation, "Reversal" ledger lines and messages
  ("{ref} reversed. {account} balance updated." / "{ref} reversed. Both balances updated.").
- **FR-005**: Transactions MUST list every ledger entry newest first and support the design's
  account and date filters.

**Expenses**

- **FR-006**: Expenses MUST provide the Overview, Expenses, Recurring, Voided and Expense categories
  tabs with the design's columns, seed rows, filters, row actions and header actions.
- **FR-007**: Users MUST be able to record one or more expenses at once, each paid now from an
  account, held for approval when its category requires it, or added to Payables as a bill. The
  confirmation MUST summarise the outcomes as the design does.
- **FR-008**: Approving a waiting expense MUST pay it from its source account and show "{ref}
  approved and paid from {account}."
- **FR-009**: Voiding an expense MUST move it to Voided with date, who and reason, return a paid
  amount to its account ("{ref} voided. Money returned to {account}.") and remove the payable of an
  unpaid bill; an unpaid bill whose payable has been partly paid cannot be voided.
- **FR-010**: Users MUST be able to create, edit, pause, resume, delete and "Record now" recurring
  expenses, with the messages "{name} paused.", "{name} resumed." and "{name} deleted.". "Record
  now" is available only when a schedule is Active, and Pause/Resume is disabled when it has Ended.
  Next dates follow the design's schedule rules.
- **FR-010a**: A recurring expense's auto-record setting MUST mean that expenses created from it are
  paid immediately, skipping category approval, as in the design. Nothing is created without the
  user choosing "Record now".
- **FR-010b**: New `EXP-` references MUST continue from the highest number across both the Expenses
  and Voided lists, and an expense added to Payables MUST show "Not paid yet" as its source account,
  as the design does.
- **FR-011**: Users MUST be able to create and edit expense categories (colour, parent, description,
  monthly budget, needs approval, active). "Spent this month" MUST reflect this session's expenses.
  A category can be deleted ("{name} deleted.") only when no expense, recurring expense or
  sub-category uses it.
- **FR-012**: The Expenses Overview MUST show the design's KPIs, trend, category breakdown and recent
  expenses.

**Integration with features 001–003**

- **FR-013**: Customer and supplier payments (feature 003) MUST move the chosen account's balance
  and add Transactions entries; payments by credit move nothing.
- **FR-013a**: Paid sales (feature 001) MUST NOT move account balances or add Transactions entries,
  as in the design. Approving a credit note whose money goes back in cash or by the original method
  MUST record a "Refund to {customer}" Transactions entry and reduce the refund account, as the
  design does.
- **FR-014**: Expenses added to Payables MUST appear as payables (document = the expense reference).
  Paying such a payable in full MUST mark the expense Paid. Its source account becomes the paying
  account, except when the payment was made with supplier credit; then it stays "Not paid yet", as
  the design does.

**Cross-cutting**

- **FR-015**: Every action MUST show the design's confirmation or error text, and references MUST
  follow the design's sequences (`DEP-`, `WDL-`, `TRN-`, `EXP-`, `REC-`).
- **FR-016**: All changes MUST appear immediately in every affected list and balance for the rest of
  the session and reset on reload.

### Key Entities

- **Account**: name, type (Bank, Mobile money, Cash), bank or provider, account number, branch,
  till, opening balance, bank branch, SWIFT, IBAN, active, current balance.
- **Ledger entry**: date, account, reference, description, kind (Deposit, Withdrawal, Transfer,
  Customer payment, Supplier payment, Expense, Expense voided, Fee, Fee voided, Refund), signed
  amount.
- **Deposit / Withdrawal**: reference, date, time, account, method, purpose (withdrawals),
  description, fee, bank reference, notes, who, amount, status.
- **Transfer**: reference, date, from account, to account, description, fee, bank reference, notes,
  who, amount, status.
- **Expense**: reference, date, reason, branch, category, payee, source account, method, payment
  reference, tax, net amount, status (Paid, Waiting approval, Unpaid bill, Voided).
- **Recurring expense**: reference, name, category, account, amount, frequency, interval, day,
  start, end, maximum count, auto-record, number made, payee, method, tax, reason, next date,
  status (Active, Paused).
- **Expense category**: name, colour, parent, description, monthly budget, needs approval, active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side review, 100% of Accounts and Expenses screens, tabs, forms and
  dialogs match the design's layout, wording and figures, apart from documented deviations.
- **SC-002**: After any deposit, withdrawal, transfer, paid or voided expense, or payment, 100% of
  affected account balances and Transactions entries are correct with no reload.
- **SC-003**: A presenter can record an expense or move money between accounts in under 1 minute.
- **SC-004**: For each role, 100% of visible Accounts and Expenses tabs match the design's role
  definitions; a full click-through produces no visible errors, and a reload restores the seed.

## Design deviations

Required by Constitution Principle I.

| Deviation | Reason | Reference |
|---|---|---|
| The expense form adds a "Pay now / Pay later" toggle (with a due date) on one-off cards | The design's logic supports bills (`pickNow`, `pickLater`, `due`) but its markup draws no control; bills to Payables are part of this spec | US3, FR-007, FR-014 |
| Account pickers in the money-movement and expense forms list active accounts only | Spec edge case; the design lists every account | Edge cases |
| The expense view uses the shared Modal: title "Expense details", reference and status pill in the subtitle, 32px amount | The shared Modal has no icon tile or right-hand pill; content and order are unchanged | SC-001 |
| The category ring's fallback colours use tokens instead of the design's two raw hex values | Constitution Principle IV; seed categories always have their own colour | FR-012 |
| "View all" on the overview is a link styled as a small button | It navigates | FR-012 |
| A new branch typed in the account form is kept only while the form is open (a new bank is kept) | Branches belong to Settings, which is out of scope | FR-003 |
| The Reverse confirmation shows "This can't be undone." once | The design's text repeats the sentence | FR-004 |
| Extra URL parameters: `?acc=` (preselect the account from a card's Deposit or Withdraw) and `?record=` (generic Transactions record) | Overlays are URL-driven in this app (routes contract) | contracts/routes.md |
| Transactions lines without their own record view (for example fees) open a generic record drawer | Matches the design's fallback `record` drawer | FR-005 |
| Voided seed expense EXP-0039 shows default method, branch and reference | The design has no detail object for it | FR-009 |

## Assumptions

- Seed data is ported verbatim:
  - Accounts: 3 bank accounts, 3 deposits, 3 withdrawals, 2 transfers, 10 ledger entries.
  - Expenses: 4 expenses, 3 recurring, 1 voided, and the expense categories with their detail
    objects.
- Seed balances are the design's literal Balance column. The ledger is historical and does not
  recompute them; only changes made in this session adjust balances.
- The demo's today is 10 Nov 2026, as in earlier features. New deposits, withdrawals and transfers
  are dated 1 Nov 2026, as the design's money-movement save does; expenses, reversals and voids use
  10 Nov 2026.
- The dashboard's attention items that link to Accounts tabs (Deposits, Withdrawals, Transactions)
  now open real screens; their texts stay fixed.
- Desktop is the primary demo target; phone width must stay usable.
