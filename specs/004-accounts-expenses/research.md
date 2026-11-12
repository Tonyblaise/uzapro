# Research: Accounts and Expenses

**Feature**: `004-accounts-expenses` | **Date**: 2026-11-12

Sources:
- `design/canvas/Uzapoint ERP.dc.html`, logic script: the `fin` money-movement save (`isAcc`,
  `isDep`, `isWd`, `isTr` and the `add` helper), `expAdd`, `expPost`, the expense form
  (`expRows`, summary and save), `recSave`, `recStep`/`recNext`, the expense row actions
  (Approve / Void), the void form, the category form, the Recurring row actions, `expboard`, and
  the credit-note refund (`moneyDone`) ledger write.
- `design/canvas/erp-data.js`.

The stack, store and seam decisions from features 001–003 apply unchanged.

## R1. Accounts and balances

- **Design facts**:
  - Bank account row: [name, bank or provider, account number, type, balance]. The balance is a
    stored figure that every posting adjusts (the `add(acc, ref, desc, kind, amount)` helper
    unshifts a ledger row and adds the amount to the balance).
  - Details per account are in `UZ_ACCDETAIL`: branch, till, opening, branchName, swift, iban,
    active. Provider choices are in `UZ_BANKS`.
  - "New account" calls `finOpen('finAcc')`, which immediately calls `accOpen()`, so new and edit
    share the `isAccEdit` drawer (types Bank, Mobile money, Cash, Petty cash). The `isFinModal`
    account branch (balance 0 plus an "OPEN" ledger line) is unreachable and is not ported.
  - A new account's balance is its opening balance, with no ledger line. Editing the opening
    balance moves the balance by the difference. Renaming an account renames it in the ledger and
    in the Deposits, Withdrawals and Transfers rows. Saving is blocked without a name or branch, or
    when the name is taken (case-insensitive).
  - Toasts: "{name} added." / "Changes saved.".
- **Decision**: store accounts with `balance`, seeded from the design's literal Balance column. Use
  one pure `post(state, entry)` helper (ledger row + balance change) for every money movement.

## R2. Deposits, withdrawals, transfers

- **Design facts**:
  - Deposit: [DEP-, date, account, method, description, amount, **Cleared**]. A fee posts a
    separate "Bank fee" line of kind Fee.
  - Withdrawal: [WDL-, date, account, method, purpose or "—", description, amount, **Completed**].
  - Transfer: [TRN-, date, from, to, description, amount, **Completed**]. It posts "Transfer to
    {to}" (−) and "Transfer from {from}" (+), plus a fee line if there is a fee.
  - Each detail holds time, fee, bankRef, notes and who.
  - Toasts: "Deposit saved.", "Withdrawal saved.", "Transfer saved.".
  - References are `nextRef` per list.
- **Decision**: implement exactly this. Validation (the same from/to account, an empty amount) is
  read from the form's `blocked` rule during implementation.

## R3. Expenses

- **Design facts** (`expAdd`):
  - The reference continues from Expenses plus Voided.
  - Paid = not "later" and (auto, or the category doesn't need approval).
  - Row: [EXP-, date, category, payee or "—", account (or "Not paid yet"), reason or "—", tax, gross,
    status (Paid | Waiting approval | Unpaid bill)].
  - "Later" adds a payable: type **Bill**, doc = the EXP ref, branch, due (form due or +30 days),
    total = gross, approved = !category.approval.
  - Paid posts `expPost`: −gross as kind Expense, with description = reason or category. A fee posts
    a separate Fee line ("Transaction cost").
- **Decision**: implement exactly this. The posted amount is **gross** (it already includes tax),
  so EXP-0043 approval takes 6,500.

## R4. Expense form, approval, void

- **Design facts**:
  - The form holds several rows. Each row is a one-off expense (kind "one") or a recurring schedule
    (kind "rec", which calls `recSave`).
  - Row warnings: "Tax is more than the gross amount. Check the figures." / "This goes to Payables
    as a bill[ waiting for approval]. Pay it from there when it is due." / "{category} expenses
    wait for approval before they are paid.".
  - Summary line and "Save {n} expense(s)".
  - Toast: "{n} paid, {n} waiting approval, {n} added to Payables, {n} recurring set up." (only
    the non-zero parts).
  - Approve: Paid, posts the expense, "{ref} approved and paid from {account}.".
  - Void:
    - Requires a reason.
    - A paid expense posts a reversal ("Voided: …", kind Expense voided, +gross, plus a fee
      reversal).
    - An unpaid bill's payable is removed. Void is disabled when that payable has been partly paid.
    - The row moves to Voided: [ref, date, category, payee, amount, "10 Nov 2026", who, reason].
    - Toast: "{ref} voided.[ Money returned to {account}.]".
- **Decision**: implement as designed. When a supplier payment (feature 003) fully pays a payable
  whose doc is an EXP ref, mark that expense Paid with the paying account (design `payPay` save,
  FR-014).

## R5. Recurring expenses and categories

- **Design facts**:
  - Recurring row: [REC-, name, category, paid from, amount, repeats, next date, status].
    `UZ_RECDETAIL` holds freq, interval, day, start, end, max, auto, made, payee, method, tax and
    reason.
  - Next date comes from `recNext` / `recStep` (daily, weekly, monthly on a day, yearly). "Repeats"
    is a label like "Every month" or "Every 2 weeks".
  - Row actions:
    - Record now: creates an expense via `expAdd` with `auto`, bumps made, and toasts "{EXP}
      recorded from {name}.".
    - Pause / Resume.
    - Edit.
  - Save toast: "Set up {name} ({ref})." / "Saved {name} ({ref}).".
  - Categories come from `UZ_EXPCAT`: color, parent, desc, budget, approval, active. "Spent this
    month" is derived from this month's non-voided expenses in that category.
  - Category toast: "{name} created." / "{name} saved.", plus extra text if the design adds any.
- **Decision**: implement as designed. Category colours are design hex values used only for the
  colour swatch and chart segments. Map each to the nearest token-safe value or keep it as data
  (rendered via a `style` attribute from fixture data, not hard-coded in components). This is noted
  as acceptable under Principle IV because the colours are user data, not UI styling.

## R6. Integration with feature 003 and credit notes

- **Decision**:
  - In `recordPayment` (commands/money.ts), a non-credit payment posts to the chosen account:
    "Payment from {customer}" (+) or "Payment to {supplier}" (−), with kind Customer payment or
    Supplier payment.
  - Supplier payments that settle an EXP payable mark that expense Paid.
  - In `approveCreditNote`, money back in cash or by the original method posts "Refund to
    {customer}" (−) to the refund account. Read the account mapping from the design's `moneyDone`
    during implementation.
  - Feature 003's FR-019 note ("no balances change") is superseded. Record this in that spec's
    Design deviations as resolved by feature 004.

## R7. Overview (expboard)

- **Design facts**: KPIs (`expKpis`), the monthly trend (`UZ_EXPTREND` plus November computed from
  paid expenses), category spend versus budget, and recent expenses. Exact panels are read from
  the `isExpBoard` markup and its logic during implementation.
- **Decision**: follow the feature 001 rule. Figures the design derives from lists are computed
  from live data where the design does so (the November trend point and category spend). Literal
  figures stay fixed.

## R8. Scope and roles

- `fin` and `exp` set `inScope: true`. The Owner sees everything. The Accountant has no tab
  restrictions for these modules. The Cashier and Store keeper can't see them.
- The dashboard attention items that link to Accounts tabs now land on real screens.
