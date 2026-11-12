---

description: "Task list for feature 004: Accounts and Expenses"
---

# Tasks: Accounts and Expenses

**Input**: Design documents from `specs/004-accounts-expenses/`

**Prerequisites**: plan.md, spec.md (with Clarifications), research.md, data-model.md,
contracts/routes.md, contracts/data-access.md, quickstart.md. Builds on features 001–003.

**Tests**: the constitution requires Playwright smoke tests, so each story ends with one. Vitest
covers the pure ledger helpers. The role × route test covers the 10 new tabs once they're in scope.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US6 from spec.md

## How to read the design

Use the same method as feature 001 (`specs/001-dashboard-sales-stock/tasks.md` › "How to read
the design"). Relevant names in the logic script of `design/canvas/Uzapoint ERP.dc.html`:
- **Accounts**: the money-movement save (search `isAcc ? st.fName.trim() + ' added.'`, with
  `isDep`/`isWd`/`isTr` and the `add` helper), `fBlocked`, `isFinModal`, `isAccEdit`,
  `hasAccFilter`, and the `fin` row and header actions.
- **Expenses**: `expAdd`, `expPost`, the expense form (`expRows`, `summary`, `saveLabel`, `save`),
  `recSave`, `recStep`, `recNext`, and the `exp` row actions (Approve, Void, Record now,
  Pause/Resume).
- **Forms**: `isExpForm`, `isRecForm`, `isExpVoid`, `isExpCat`.
- **Overview**: `isExpBoard` / `expKpis`.
- **Credit notes**: the refund ledger write in `moneyDone`.

Data comes from `design/canvas/erp-data.js` (`UZ_MODS` › fin/exp, `UZ_LEDGER`, `UZ_ACCDETAIL`,
`UZ_BANKS`, `UZ_DEPDETAIL`, `UZ_WDDETAIL`, `UZ_TRDETAIL`, `UZ_EXPCAT`, `UZ_EXPDETAIL`,
`UZ_RECDETAIL`, `UZ_EXPTREND`). Copy all strings exactly.

---

## Phase 1: Setup

- [X] T001 Create branch `004-accounts-expenses` from `003-receivables-payables` (`git checkout -b`) and confirm `npm run typecheck && npm run lint && npm run test:unit` pass

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: complete this phase before any user story.

- [X] T002 [P] Create `src/data/types/accounts.ts` (Account, LedgerEntry, Deposit, Withdrawal, MoneyTransfer, Expense, VoidedExpense, RecurringExpense, ExpenseCategory, and the input and row types) and export it from `src/data/types/index.ts`
- [X] T003 [P] Create `src/data/fixtures/accounts.ts` (fin rows for Bank accounts, Deposits, Withdrawals and Transfers; `UZ_LEDGER`, `UZ_ACCDETAIL`, `UZ_BANKS`, `UZ_DEPDETAIL`, `UZ_WDDETAIL`, `UZ_TRDETAIL`) and `src/data/fixtures/expenses.ts` (exp rows for Expenses, Recurring and Voided; `UZ_EXPCAT`, `UZ_EXPDETAIL`, `UZ_RECDETAIL`, `UZ_EXPTREND`), all verbatim
- [X] T004 [P] Create `src/data/ledger.ts` with the pure helpers `post(state, entry)` (newest-first ledger row plus balance change), `recNext`/`recStep`/`repeatsLabel` (as the design does) and `categorySpent(expenses, name, month)`. Add `tests/unit/ledger.test.ts` (posting and balance, a transfer as two lines, next dates for monthly on a day and every 2 weeks, November spend)
- [X] T005 Add `accounts` and `expenses` slices to `src/data/store/state.ts` and seed them in `src/data/store/seed.ts`
- [X] T006 Set `inScope: true` for `fin` and `exp` in `src/config/modules.ts` with their column definitions. Create `src/features/accounts/screens.tsx` and `src/features/expenses/screens.tsx` (empty) and register them in `src/features/screens.ts`
- [X] T007 Create `src/data/queries-accounts.ts` with the hooks in contracts/data-access.md (accounts, active names, ledger with filter, deposits/withdrawals/transfers, expenses, voided, recurring rows, category rows, overview data) and export it from `src/data/index.ts`

**Checkpoint**: `/accounts/*` and `/expenses/*` render their headers and tabs; the existing smoke suites pass.

---

## Phase 3: User Story 1 - Know where the money is (Priority: P1) 🎯 MVP

**Independent Test**: quickstart 1.

- [X] T008 [US1] Create `src/data/commands/accounts.ts` with `saveAccount(input, edit?)` (the design's `accEdit` save: a new account's balance is its opening balance; editing the opening balance moves the balance by the difference; a rename cascades to the ledger and the movement rows; toasts "{name} added." / "Changes saved.") and export it from `src/data/index.ts`
- [X] T009 [P] [US1] Create `src/features/accounts/BankAccountList.tsx`. It shows the card grid (`isBankCards`): type icon and tone from `looks`, balance, opening, and net inflow or outflow, with Deposit / Withdraw / Edit account, plus the "Account type" select (All account types, Bank, Mobile money, Cash, Petty cash). The design's chips and list view are never rendered, so they are not built. Also create `AccountForm.tsx` (`isAccEdit`: name, type, bank or provider from `UZ_BANKS`, number, branch, till, opening balance, bank branch, SWIFT, IBAN, active, and the account preview)
- [X] T010 [P] [US1] Create `src/features/accounts/TransactionsList.tsx` (Date, Account, Reference, Description, signed Amount; `hasAccFilter` account picker and From/To dates; newest first)
- [X] T011 [US1] Register the `bank-accounts` and `transactions` tabs, and write `tests/smoke/accounts.spec.ts` covering quickstart 1 (balances, the M-Pesa Till filter), the card view and the Mobile money "Account type" filter, and adding an account

---

## Phase 4: User Story 2 - Move money in, out and between accounts (Priority: P1)

**Independent Test**: quickstart 2–4.

- [X] T012 [US2] Add `recordDeposit`, `recordWithdrawal` and `recordTransfer` to `src/data/commands/accounts.ts`:
  - deposits are Cleared; withdrawals and transfers are Completed
  - a fee posts a separate Fee line
  - a transfer posts two lines
  - toasts are "Deposit saved." / "Withdrawal saved." / "Transfer saved."
  - validation follows the design's `fBlocked`
  - the withdrawal shows the soft "more than the account holds" warning without blocking
- [X] T013 [US2] Create `src/features/accounts/MoneyMoveForm.tsx` (`isFinModal` for deposit, withdrawal and transfer: account(s), method, purpose, description, amount, fee, reference, notes) and `DepositList.tsx`, `WithdrawalList.tsx`, `TransferList.tsx`, plus a record view (`?view=`) showing time, fee, bank reference, notes and who, with the design's Reverse flow (`reverseMove`)
- [X] T014 [US2] Register the `deposits`, `withdrawals` and `transfers` tabs with their header actions, and extend `tests/smoke/accounts.spec.ts` with quickstart 2–4 (DEP-0219 → Cash drawer 34,600; WDL-0105; TRN-0032 → 336,450 / 4,862,300 and two ledger lines)

---

## Phase 5: User Story 3 - Record and approve expenses (Priority: P1)

**Independent Test**: quickstart 5–8.

- [X] T015 [US3] Create `src/data/commands/expenses.ts`:
  - `recordExpenses(rows)`:
    - a one-off row becomes `expAdd`: Paid (posts −gross plus a fee line), Waiting approval, or Unpaid bill (adds a payable of type "Bill" with doc = the EXP ref, due as given or +30 days, approved = !category.approval, source "Not paid yet")
    - a recurring row becomes `saveRecurring`
    - the summary message joins only the non-zero parts of "{n} paid, {n} waiting approval, {n} added to Payables, {n} recurring set up" and ends with "." (e.g. "1 paid.")
  - `approveExpense(ref)`: "{ref} approved and paid from {account}."
  - `voidExpense(ref, reason)`:
    - a paid expense posts the reversal; an unpaid bill's payable is removed (blocked if that payable is partly paid)
    - the expense moves to Voided
    - toast "{ref} voided.[ Money returned to {account}.]"
  - `EXP-` numbers continue across Expenses and Voided
- [X] T016 [US3] Create `src/features/expenses/ExpenseForm.tsx` (`isExpForm` with multiple rows; each row one-off or recurring, with date, branch, category, payee, reason, account, method, reference, gross, tax, fee, "pay later" with due date, and the row notes or warnings from the design; add-row; summary; "Save {n} expense(s)")
- [X] T017 [P] [US3] Create `src/features/expenses/ExpenseList.tsx` (design columns: "Reference and reason", "Category and payee", source account, net amount, status; row actions View / Approve / Void with the design's disabled rules; header "Record expenses"), `ExpenseView.tsx`, `VoidExpenseForm.tsx` (`isExpVoid`) and `VoidedList.tsx`
- [X] T018 [US3] Register the `expenses` and `voided` tabs, and write `tests/smoke/expenses.spec.ts` covering quickstart 5–8 (EXP-0044 paid; approve EXP-0043 → M-Pesa −6,500; a bill → a Payables "Bill"; void EXP-0040 → Cash drawer +18,650)

---

## Phase 6: User Story 6 - Payments move real money (Priority: P1)

**Independent Test**: quickstart 11.

- [X] T019 [US6] Change `recordPayment` in `src/data/commands/money.ts`:
  - a non-credit payment posts to its account: "Payment from {customer}" (+) or "Payment to {supplier}" (−), kind Customer payment or Supplier payment
  - a supplier payment that fully settles a payable whose doc is `EXP-…` marks that expense Paid, and sets its account to the paying account unless the payment was made with credit
- [X] T020 [US6] Change `approveCreditNote` in `src/data/commands/sales.ts`: money back in cash or by the original method posts "Refund to {customer}" (−) to the refund account, using the mapping in the design's `moneyDone`
- [X] T021 [US6] Write `tests/smoke/money-accounts.spec.ts`:
  - pay RCV-0011 into Equity Bank — Main → +1,026 and a "Payment from Blazing Cycle Trails" ledger line
  - pay the expense bill from T018 in Payables → the expense becomes Paid
  - approve a credit note with a cash refund → the refund account drops, and "Refund to {customer}" appears in Transactions

  Also mark feature 003's FR-019 as superseded in `specs/003-receivables-payables/spec.md` › Design deviations

---

## Phase 7: User Story 4 - Repeat bills and spending categories (Priority: P2)

**Independent Test**: quickstart 9–10.

- [X] T022 [US4] Add `saveRecurring(input, edit?)` ("Set up {name} ({ref})." / "Saved {name} ({ref})."), `recordRecurringNow(ref)` (creates an expense via `expAdd` with `auto`, bumps made; "{EXP} recorded from {name}.") , `setRecurringActive(ref, active)` ("{name} paused." / "{name} resumed.") and `deleteRecurring(ref)` ("{name} deleted.") to `src/data/commands/expenses.ts`, plus `saveExpenseCategory(input, edit?)` ("{name} created." / "{name} saved.") and `deleteExpenseCategory(name)`, which refuses while the category is in use
- [X] T023 [P] [US4] Create `src/features/expenses/RecurringList.tsx` (Ref, Name, Category, Paid from, Amount, Repeats, Next date, Status; Edit / Record now (disabled unless Active) / Pause or Resume (disabled when Ended) / Delete) and `RecurringForm.tsx` (`isRecForm`)
- [X] T024 [P] [US4] Create `src/features/expenses/CategoryList.tsx` (Category with a colour swatch from data, Parent, Monthly budget, Spent this month, Needs approval, Status; row actions Edit / Delete, disabled while the category is in use) and `CategoryForm.tsx` (`isExpCat`)
- [X] T025 [US4] Register the `recurring` and `expense-categories` tabs, and extend `tests/smoke/expenses.spec.ts` with quickstart 9–10

---

## Phase 8: User Story 5 - See spending at a glance (Priority: P2)

**Independent Test**: quickstart 12.

- [X] T026 [US5] Create `src/features/expenses/ExpensesOverview.tsx` (`isExpBoard`: KPIs, the trend from `UZ_EXPTREND` plus November computed from paid expenses, category spend against budget, recent expenses), register the `overview` tab, and extend `tests/smoke/expenses.spec.ts` with the overview headings and values

---

## Phase 9: Polish & Cross-Cutting

- [X] T027 [P] Add `/accounts/bank-accounts`, `/accounts/transactions`, `/expenses/overview` and `/expenses/expenses` to `tests/smoke/responsive.spec.ts`, and run the accessibility scan over the new forms
- [X] T028 Do a visual fidelity review against the canvas for every new tab and drawer, logging accepted differences in spec › Design deviations
- [X] T029 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`), walk through quickstart 1–13, and commit on `004-accounts-expenses`

---

## Dependencies & Execution Order

- Setup → Foundational (T002–T007) → stories.
- **US1** → **US2** (forms share the account pickers). **US3** depends on Foundational (`post`) and
  can run alongside US1–US2. **US6** depends on US3 (EXP payables) and on feature 003.
- **US4** depends on US3 (`expAdd`). **US5** depends on US3 data.
- The data-layer tasks (T008, T012, T015, T019, T020, T022) are best done by one person in order,
  and the UI tasks can then run in parallel.

### Parallel opportunities

- T002–T004. T009 and T010. T017 alongside T016. T023 and T024.
- Two developers: A takes all data-layer tasks and US6, while B takes the UI for US1 → US2 → US3 →
  US4 → US5.

## Implementation Strategy

1. **MVP**: Phases 1–3 (balances and the ledger).
2. Add US2 (moving money), then US3 (expenses), then US6 (payments post), which makes the whole
   money picture consistent.
3. Add US4 and US5, then polish, run every gate and commit.

## Notes

- `post()` is the only place balances change.
- Category colours are fixture data bound through `style`, never hard-coded in components.
- Copy all wording from the design.
