# Feature Specification: Receivables and Payables

**Feature Branch**: `003-receivables-payables`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "receivables and payables"

**Design source**: `design/canvas/Uzapoint ERP.dc.html` (Receivables `rcv` and Payables `pay`
modules: lists, the payment form `isRcvPay` used for both customer and supplier payments, payment
plans `isRcvPlan`, credits `isRcvCredit`, the receivables statement `hasRcvStmt`, row actions and
header actions) and `design/canvas/erp-data.js` (`UZ_MODS` › rcv / pay rows, `UZ_RCVDETAIL`,
`UZ_PAYDETAIL`, `UZ_PLANDETAIL`, `UZ_SCDETAIL`). Every screen, label, figure and message comes from
these files (Constitution Principle I). This feature builds on features 001 (sales, invoices,
customers) and 002 (purchases, goods receipts, suppliers).

## Clarifications

### Session 2026-11-12

- Q: Should the Sales invoice view get back the design's "Record payment" button? → A: Yes. It opens the same customer payment form with that invoice's receivable already ticked.
- Q: When a credit sale or an invoice with a receivable is voided, what happens to the receivable? → A: It stays listed but is closed: balance 0, status "Voided"; payments already received stay as they are. (Deviation: the design leaves the receivable unchanged.)

## User Scenarios & Testing *(mandatory)*

The Owner and the Accountant see both modules with all their tabs. The Cashier and the Store
keeper see neither (design role definitions).

### User Story 1 - See and collect what customers owe (Priority: P1)

The presenter opens Receivables and sees every amount owed (reference, customer, type such as
Invoice / Sale on credit / Opening balance, source document, due date, priority, total, paid,
balance, status). Status is computed as the design does: Paid when the balance is zero, Overdue when
past due, Part paid when something has been paid, otherwise Unpaid. The presenter chooses "Record
payment" on a receivable (or the header "Record payment"), picks the customer, sees that customer's
open receivables oldest first, enters the payment amount or "Pay full balance", chooses the method
and receiving account, and saves. The payment is listed under Payments and allocated to the
receivables, whose paid amounts, balances and statuses update.

**Why this priority**: collecting money is the core of Receivables and the most common accountant
task.

**Independent Test**: record a full payment of KES 1,026 against RCV-0011 and confirm it becomes
Paid with balance 0 and a new `PAY-` row lists RCV-0011.

**Acceptance Scenarios**:

1. **Given** Receivables, **When** the presenter opens the list, **Then** every seed receivable
   shows the design's computed balance and status (for example RCV-0012 balance 45,600 Overdue,
   RCV-0009 Paid).
2. **Given** a receivable, **When** the presenter records a payment covering its full balance,
   **Then** a `PAY-` payment is listed with the receivable reference, method and amount, the
   receivable becomes Paid, and "{PAY} saved. KES {amount} applied to {refs}." is shown.
3. **Given** a customer with several open receivables, **When** a payment smaller than their total
   is entered, **Then** it is applied oldest first and the last touched receivable becomes Part paid.
4. **Given** a payment, **When** the presenter chooses "Verify", **Then** its verification becomes
   Verified and "{ref} verified." is shown.
5. **Given** a receivable, **When** the presenter toggles priority, **Then** it switches between
   High and Normal as in the design.

---

### User Story 2 - See and pay what the business owes suppliers (Priority: P1)

The presenter opens Payables and sees every bill (reference, supplier, type such as Purchase order /
Goods received / Bill / Opening balance, document, branch, due date, priority, total, paid, balance,
approval, status). They approve or reject bills waiting approval, then "Pay supplier": pick the
supplier, see that supplier's approved payables oldest first (and any supplier credit), enter the
amount, method (including "Supplier credit") and paying account, and save. The supplier payment is
listed under Payments with verification "Unverified" or as the design sets it, and the payables'
balances and statuses update.

**Why this priority**: paying suppliers closes the purchasing loop from feature 002.

**Independent Test**: approve PYB-0012, pay it in full, and confirm it becomes Paid and a new
`VPMT-` payment lists it.

**Acceptance Scenarios**:

1. **Given** PYB-0012 waiting approval, **When** the presenter chooses "Approve", **Then** its
   approval becomes Approved and "PYB-0012 approved for payment." is shown; "Reject" instead marks
   it Rejected with "PYB-0012 rejected.".
2. **Given** a supplier with approved payables, **When** the presenter pays part of what is owed,
   **Then** a `VPMT-` payment is listed, payables are paid oldest first, and balances and statuses
   update.
3. **Given** a bill still waiting approval, **When** the presenter opens the payment form for that
   supplier, **Then** the bill is not offered for payment (only approved payables are listed).
4. **Given** a supplier payment, **When** the presenter chooses "Verify", **Then** it becomes
   Verified.

---

### User Story 3 - Sales and purchases create real receivables and payables (Priority: P1)

Actions in the existing modules now create records here instead of only naming them in a message:
a credit sale ("Pay later (credit)") creates a "Sale on credit" receivable due in 30 days; saving
an invoice creates an "Invoice" receivable; receiving goods on an unpaid purchase order creates a
"Goods received" payable (approved) due according to the order's payment term. Recording a
payment against an invoice's receivable updates that invoice's amount paid and balance in Sales ›
Invoices.

**Why this priority**: this is the cross-module story that makes the whole demo coherent — the
numbers named in feature 001 and 002 messages become records you can open and pay.

**Independent Test**: record a credit sale to Mountain Goats, then find the new `RCV-` receivable
named in the confirmation message in Receivables with type "Sale on credit" and the sale's total.

**Acceptance Scenarios**:

1. **Given** a credit sale to a named customer, **When** it is recorded, **Then** the `RCV-`
   reference in "Credit sale recorded. KES … added to Receivables as {RCV}, due in 30 days." exists
   in Receivables with that customer, type "Sale on credit", the sale reference and total.
2. **Given** a new invoice, **When** it is saved, **Then** the `RCV-` named in its message exists in
   Receivables with type "Invoice" and the invoice number.
3. **Given** goods received on an unpaid purchase order, **When** the receipt is saved, **Then**
   the `PYB-` named in the message exists in Payables with type "Goods received", the receipt and
   order references, status Approved, and the value of accepted goods.
4. **Given** an invoice receivable, **When** it is paid in full, **Then** Sales › Invoices shows
   that invoice with balance 0 and status Paid.
5. **Given** an unpaid invoice open in Sales, **When** the presenter chooses "Record payment",
   **Then** the customer payment form opens with that customer and the invoice's receivable ticked,
   and saving it pays the receivable and updates the invoice.

---

### User Story 4 - Payment plans, bulk payments and credits (Priority: P2)

The presenter sets up a payment plan on an open receivable or approved payable (number of
instalments, how often, first instalment due), sees the instalment amount and schedule, and later
records or pays an instalment or cancels the plan. They record a bulk payment that clears several
receivables (or payables) at once. They issue a customer credit (reason, amount, optional expiry)
or a supplier credit, use a credit to pay, or void it.

**Why this priority**: valuable for the demo's depth but secondary to collecting and paying.

**Independent Test**: create a 3-instalment monthly plan on RCV-0008 and record its first
instalment; confirm the plan shows 1 of 3 paid and the receivable's balance drops by one instalment.

**Acceptance Scenarios**:

1. **Given** an open receivable without an active plan, **When** a plan of 3 monthly instalments
   is created, **Then** a `PLN-` plan is listed with each instalment rounded up as the design does,
   the next due date, and status Active.
2. **Given** an active plan, **When** "Record instalment" (or "Pay instalment") is used, **Then** a
   payment for one instalment is saved against the plan's receivable or payable and the plan's
   progress and next due date update; "Cancel plan" ends it with "{ref} cancelled.".
3. **Given** "New bulk payment", **When** the presenter pays several of one customer's receivables
   (or supplier's payables) in one payment, **Then** one payment of type "Bulk" lists all of them
   and it also appears under Bulk payments.
4. **Given** "Issue credit", **When** a credit is saved, **Then** a `CRD-` (customer) or `SCR-`
   (supplier) credit is listed with amount, used and left; it can be chosen as a payment method
   ("Customer credit" / "Supplier credit") up to what is left, and "Void credit" voids it.

---

### User Story 5 - See what is owed by age (Priority: P2)

The presenter opens the Receivables statement and the Supplier ageing tabs, which group open
balances per customer or supplier into Not yet due, 1–30, 31–60, 61–90 and Over 90 days as of the
demo's today, with totals. On the Receivables statement they can set a date range and customer and
"Generate statement".

**Why this priority**: reporting views built on the same data; no new records.

**Independent Test**: open Supplier ageing and confirm Magaliesburg Wheels' PYB-0013 balance of
24,200 appears in the 1–30 days column (due 25 Oct 2026, today 10 Nov 2026).

**Acceptance Scenarios**:

1. **Given** the seed data, **When** the presenter opens either ageing view, **Then** each open
   balance appears in the right age bucket and the totals equal the open balances.
2. **Given** the Receivables statement, **When** a customer and dates are chosen and "Generate
   statement" is used, **Then** the statement updates as the design does and "Statement updated."
   is shown.

---

### Edge Cases

- A payment cannot exceed the selected open balances: the design blocks it with "That is more than
  the {n} KES selected. Lower the amount or tick more receivables." (or "…payables."). Paying with
  credit is limited to the credit left ("This customer only has KES {n} credit to use." / "This
  supplier only owes you KES {n} in credit.").
- Paid receivables and payables have "Record payment" / "Pay supplier" disabled; so do Voided
  receivables (FR-016b).
- Bills waiting approval or rejected are never offered for payment.
- A receivable with an active payment plan is not offered for a second plan.
- A credit used as a payment method can never go below zero left; expired or voided credits are
  not offered.
- Payment methods and accounts are recorded on payments, but account balances do not change:
  Accounts is out of scope for this feature.
- The dashboard's attention items ("9 customers are late paying", "Road & Travel Tyres bill is
  late") keep their fixed design text.
- Reload resets all records to the design seed (Constitution Principle III).

## Requirements *(mandatory)*

### Functional Requirements

**Receivables**

- **FR-001**: Receivables MUST provide the Receivables, Payments, Payment plans, Customer credits,
  Bulk payments and Receivables statement tabs with the design's columns, seed rows, computed
  balances and statuses, filters, row actions and header actions.
- **FR-002**: Receivable status MUST be computed as the design does: Paid (balance 0), Overdue (due
  before the demo's today, 10 Nov 2026), Part paid (some paid), otherwise Unpaid; a voided
  receivable shows "Voided" (FR-016b).
- **FR-003**: Users MUST be able to record a customer payment (customer, open receivables oldest
  first, amount or "Pay full balance", method, account, reference) that is allocated to the chosen
  receivables and listed under Payments with the design's message.
- **FR-004**: Users MUST be able to verify payments and toggle a receivable's priority.

**Payables**

- **FR-005**: Payables MUST provide the Payables, Payments, Bulk payments, Supplier credits, Supplier
  ageing and Payment plans tabs with the design's columns, seed rows, computed balances, approval and
  status, row actions and header actions.
- **FR-006**: Users MUST be able to approve or reject payables waiting approval with the design's
  messages; only approved payables can be paid.
- **FR-007**: Users MUST be able to pay a supplier (supplier, approved payables oldest first,
  amount, method including "Supplier credit", account, reference); the payment is listed under
  Payments and allocated to the payables.
- **FR-008**: Users MUST be able to verify supplier payments.

**Plans, bulk payments, credits, ageing**

- **FR-009**: Users MUST be able to create payment plans on open receivables or approved payables
  (instalments, frequency, first due date), record or pay instalments, and cancel plans.
- **FR-010**: Users MUST be able to record bulk payments clearing several receivables or payables of
  one customer or supplier, shown as type "Bulk" and listed under Bulk payments.
- **FR-011**: Users MUST be able to issue customer and supplier credits (reason or source, amount,
  optional expiry, notes), use them as a payment method up to the amount left, and void them.
- **FR-012**: The Receivables statement and Supplier ageing MUST group open balances into the
  design's age buckets as of 10 Nov 2026, with per-party totals; the statement supports the
  design's date-range and customer filter and "Generate statement".

**Integration with features 001 and 002**

- **FR-013**: A credit sale MUST create a "Sale on credit" receivable (due in 30 days) with the
  reference named in its confirmation message.
- **FR-014**: Saving an invoice MUST create an "Invoice" receivable with the reference named in its
  message.
- **FR-015**: Receiving goods on an unpaid purchase order MUST create an approved "Goods received"
  payable with the reference named in its message, due per the order's payment term.
- **FR-016**: Payments allocated to an invoice's receivable MUST update that invoice's amount paid,
  balance and status in Sales › Invoices.
- **FR-016b**: Voiding a credit sale or an invoice (feature 001) MUST close its receivable: it stays
  listed with balance 0 and status "Voided", is no longer offered for payment, plans or statements,
  and payments already received on it are left unchanged.
- **FR-016c**: Approving a credit note raised from a sale with money back as store credit
  (feature 001) MUST create a customer credit (`CRD-`, reason "Credit note {ref}", amount = the
  credit note total, issued 10 Nov 2026), as the design does. Approved purchase returns do not
  create supplier credits automatically (supplier credits are issued by hand, as in the design).
- **FR-016a**: The Sales invoice view MUST offer the design's "Record payment" action (except when
  the invoice is Paid). It opens the customer payment form for that customer with the invoice's
  receivable already ticked.

**Cross-cutting**

- **FR-017**: Every action MUST show the design's confirmation or error text, and references MUST
  follow the design's sequences (`RCV-`, `PAY-`, `PLN-`, `CRD-`, `PYB-`, `VPMT-`, `PPL-`, `SCR-`).
- **FR-018**: All changes MUST appear immediately in every affected list for the rest of the session
  and reset on reload.
- **FR-019**: Accounts and Expenses remain out of scope: payment accounts and methods are stored on
  payments only and no account balances change.

### Key Entities

- **Receivable**: reference (`RCV-`), customer, type (Invoice, Sale on credit, Opening balance),
  source document, raised date, due date, priority (High, Normal, Low), total, paid, voided flag;
  balance and status are computed (Voided receivables have balance 0 and status "Voided").
- **Customer payment**: reference (`PAY-`), date, customer, allocations (receivable → amount),
  method, account, payment reference, type (Single / Bulk), amount, verification (Verified /
  Unverified).
- **Payable**: reference (`PYB-`), supplier, type (Purchase order, Goods received, Bill, Opening
  balance), document, branch, due date, priority, total, paid, approval (Waiting approval, Approved,
  Rejected); balance and status computed like receivables.
- **Supplier payment**: reference (`VPMT-`), date, supplier, allocations (payable → amount),
  method, account, reference, type, amount, verification.
- **Payment plan**: reference (`PLN-` for receivables, `PPL-` for payables), party, target
  receivable or payable, total, instalment count, each, frequency, first due, paid count, next due,
  status (Active, Completed, Cancelled).
- **Credit**: reference (`CRD-` customer, `SCR-` supplier), party, reason or source, issued, amount,
  used, left, expiry, notes, status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side review, 100% of Receivables and Payables screens, tabs, forms and
  dialogs match the design's layout, wording and figures, apart from documented deviations.
- **SC-002**: A presenter can record a customer payment or pay a supplier in under 1 minute.
- **SC-003**: 100% of receivable and payable references named in sales, invoice and goods-receipt
  confirmation messages exist as records in the matching list.
- **SC-004**: After any payment, every affected balance and status (and, for invoices, the Sales ›
  Invoices row) is correct with no reload.
- **SC-005**: For each role, 100% of visible Receivables and Payables tabs match the design's role
  definitions; a full click-through produces no visible errors, and a reload restores the seed.

## Design deviations

Required by Constitution Principle I.

| Deviation | Reason | Reference |
|---|---|---|
| Voiding a credit sale or invoice closes its receivable (balance 0, "Voided") | The design leaves a debt for a voided sale; closing it keeps the demo consistent | Clarification Q2, FR-016b |
| Payment methods and accounts are stored on payments but account balances do not change | Accounts is out of scope for this feature | FR-019 |
| The supplier payment form omits the design's soft warning about paying more than an account holds | Account balances are out of scope (FR-019) | FR-007, FR-019 |
| Payment, plan and credit forms use the shared Modal (h2 heading, no header rule) rather than the design's card-title header | Reuses the feature 001 primitive; content and order are unchanged | SC-001 |

## Assumptions

- Seed data is ported verbatim: 7 receivables, 3 customer payments, 1 customer plan, 2 customer
  credits, 5 payables, 2 supplier payments, 1 supplier credit, 1 supplier plan, plus the detail
  objects (`UZ_RCVDETAIL`, `UZ_PAYDETAIL`, `UZ_PLANDETAIL`, `UZ_SCDETAIL`).
- The demo's today is 10 Nov 2026 (as in features 001–002), which drives Overdue and age buckets.
- Feature 002's frozen Payables number counter is replaced by real `PYB-` records; feature 001's
  receivables counter is replaced by real `RCV-` records.
- Payment accounts come from the design's account list (Equity Bank — Main, M-Pesa Till, Cash
  drawer) for display; Accounts screens remain placeholders.
- Desktop is the primary demo target; phone width must stay usable.
