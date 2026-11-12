# Research: Receivables and Payables

**Feature**: `003-receivables-payables` | **Date**: 2026-11-12

Sources are the logic script of `design/canvas/Uzapoint ERP.dc.html` (`rcvBal`/`rcvStatus`,
`payBal`/`payStatus`, the payment drawers `rcvPay`/`payPay`, plans `rcvPlan`/`payPlan`, credits
`rcvCredit`/`payCredit`, the rcv/pay row actions and header actions, Bulk payments, Supplier
ageing, the statement `rs`, `rcvAdd`/`payAdd`, and credit-note `moneyDone`) and
`design/canvas/erp-data.js`. The stack, store and seam decisions from features 001 and 002 apply
unchanged.

## R1. Balances and statuses

- **Design facts**:
  - Receivable balance = max(0, total − paid). Status, in order: **Paid** (balance 0), **Overdue**
    (due < 10 Nov 2026), **Part paid** (paid > 0), else **Unpaid**.
  - Payables use the same rule on payable total/paid and due date. Approval is a separate pill:
    Waiting approval, Approved or Rejected.
- **Decision**: these are pure helpers in `src/data/money.ts` (`balance`, `rcvStatus`, `payStatus`).
  Per the clarification, Voided receivables have balance 0 and status **Voided**.

## R2. Recording a payment (customer and supplier)

- **Design facts** (`rcvPay`; `payPay` mirrors it with supplier wording):
  - The party picker loads that party's open items, oldest due first. The user ticks items; the
    amount is applied to the ticked items in order (`alloc`). "Pay full balance" fills the selected
    total, capped by credit when paying with credit.
  - Blocks:
    - "That is more than the {n} KES selected. Lower the amount or tick more receivables." /
      "…payables."
    - "This customer only has KES {n} credit to use." / "This supplier only owes you KES {n} in
      credit."
  - Methods are `UZ_PAYMETHODS` plus "Customer credit" / "Supplier credit". An account ("Paid into"
    / "Paid from") is required unless paying with credit.
  - The payment row is [`PAY-`/`VPMT-`, date, party, refs joined ", ", method, type, amount,
    verification]. Type is **Bulk** if more than one ref, **Instalment** if from a plan, else
    **Single**. Verification is **Verified** for Cash or credit, otherwise **Pending**; seed supplier
    rows also use "Unverified".
  - Paying with credit consumes the party's credits, oldest first.
  - Customer toast: "{ref} saved. KES {amt} applied to {refs}.". Supplier toast: read from `payPay`'s
    save (pattern "…paid to {supplier}.").
  - Titles: "Record payment" / "New bulk payment". The subtitle is "Money received from a customer
    against what they owe." / "One payment that clears several receivables for a customer." /
    "Instalment for {plan}.". The button is "Save payment".
- **Decision**: implement exactly this. The design's ledger write (`UZ_LEDGER`) is skipped because
  Accounts is out of scope (FR-019).

## R3. Payment plans

- **Design facts**:
  - Plans can only be made on open items without an active plan.
  - Each instalment = ceil(balance / count) (count ≥ 2). The schedule steps by frequency (`recStep`).
  - Defaults: customer plan count 3, Monthly, start 2026-11-17; supplier plan count 2, Monthly,
    start 2026-11-20.
  - Toast: "{ref} created for {party}.".
  - "Record instalment" / "Pay instalment" opens the payment form pre-filled with
    min(each, balance) and `plan`. "Cancel plan" sets **Cancelled** with "{ref} cancelled.".
  - Seed plan details are in `UZ_PLANDETAIL` (count, paid, freq, start).
- **Decision**: implement as designed. The plan's paid count is derived from Instalment payments
  that carry its ref. When the target is fully paid the status becomes **Completed** (confirm the
  exact pill from the design list rendering).

## R4. Credits

- **Design facts**:
  - Customer credit:
    - Form fields: customer, reason + "why", amount, currency, optional expiry, notes, reference.
    - The row is [`CRD-`, customer, "{reason}: {why}", "10 Nov 2026", amount, "0", left, status].
    - Toast: "{ref}: KES {amt} credit for {customer}.". Title "Issue customer credit".
  - Supplier credit:
    - Form fields: supplier, source, amount, expiry, notes.
    - Toast: "{ref}: KES {amt} credit from {supplier}.". Title "Issue supplier credit".
  - "Use to pay" opens the payment form with the credit method. "Void credit" sets **Voided** with
    "{ref} voided.". Expired credits (expiry < 10 Nov 2026) and voided ones are not usable.
  - An approved credit note from a sale with money back "credit" adds
    [`CRD-`, customer, "Credit note {ref}", "10 Nov 2026", total, "0"].
- **Decision**: implement as designed, including the credit-note hook (FR-016c) in
  `approveCreditNote`.

## R5. Bulk payments, ageing and statement

- **Design facts**:
  - The **Bulk payments** tab is the Payments list filtered to type Bulk: [ref, date, party, refs,
    method, amount]. "New bulk payment" opens the payment form in bulk mode.
  - **Supplier ageing** groups payables with balance > 0 that are not Rejected by supplier, into
    [count, Not yet due (late ≤ 0), 1–30, 31–60, 61–90, Over 90, total] using days late against
    10 Nov 2026.
  - The **Receivables statement** groups receivables the same way. It filters by from/to (defaults
    2026-01-01 to 2026-11-10) and customer ("All customers"). "Generate statement" applies the
    draft and toasts "Statement updated.".
- **Decision**: implement as designed. Voided receivables are excluded.

## R6. Approvals and row actions

- **Design facts**:
  - Receivables: Record payment (disabled when Paid), Mark high / normal priority, View.
  - Payments: Verify ("{ref} verified."), View.
  - Payables: Approve ("{ref} approved for payment."), Reject ("{ref} rejected."), each enabled only
    when Waiting approval; Pay supplier; View.
  - Plans: Record/Pay instalment, Cancel plan. Credits: Use to pay, Void credit.
  - Header actions per tab: "Record payment", "New payment plan" / "Create plan", "Issue credit",
    "New bulk payment".
- **Decision**: implement as designed. Record payment is also disabled for Voided receivables.

## R7. Integration with features 001 and 002

- **Current code**:
  - `src/data/commands/sales.ts` keeps a module-level `rcvNo` counter (floor 12) used in the
    credit-sale and invoice messages.
  - `src/data/commands/purchases.ts` keeps `purchases.pybNo`.
- **Decision**:
  - Replace both counters with real records using `nextRef` on the lists:
    - `recordSale` with credit creates "Sale on credit" due +30 days.
    - `createInvoice` creates "Invoice" due on the invoice's due date.
    - `receiveGoods` with an unpaid order and value > 0 creates "Goods received", Approved, due per
      term days, with branch from the store's warehouse row.
  - The next numbers are therefore RCV-0013 and PYB-0015, the same as the current messages.
  - `voidSale` closes the matching receivable (FR-016b).
  - Customer payments allocated to an "Invoice" receivable add to that invoice's `paid` and set it
    to Paid when the balance is 0 (FR-016).
  - The invoice view regains "Record payment" (FR-016a), which opens the payment form through
    `?action=pay&customer=…&rcv=…` on the Receivables tab, or as an overlay inside Sales via the
    shared payment form exported from `@/features/receivables`.
  - `pybNo` is removed from the purchases slice.

## R8. Scope and roles

- `rcv` and `pay` set `inScope: true`. Roles: Owner and Accountant have no tab restrictions for
  these modules; Cashier and Store keeper can't see them. The feature 001 role × route smoke test
  covers them automatically.
- Accountant dashboard attention links (`fin` Deposits etc.) still point at the Accounts
  placeholder.
