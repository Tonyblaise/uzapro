# Data Model: Accounts and Expenses

**Feature**: `004-accounts-expenses` | **Date**: 2026-11-12

New store slices `accounts` and `expenses`, seeded verbatim from `UZ_MODS` › fin / exp rows,
`UZ_LEDGER`, `UZ_ACCDETAIL`, `UZ_BANKS`, `UZ_DEPDETAIL`, `UZ_WDDETAIL`, `UZ_TRDETAIL`, `UZ_EXPCAT`,
`UZ_EXPDETAIL`, `UZ_RECDETAIL` and `UZ_EXPTREND` (in `src/data/fixtures/accounts.ts` and
`src/data/fixtures/expenses.ts`). Types go in `src/data/types/accounts.ts`. Demo today:
2026-11-10.

## Accounts slice

### Account
`name` (unique), `provider`, `number`, `type` (Bank | Mobile money | Cash), `balance`, `branch`,
`till`, `opening`, `branchName`, `swift`, `iban`, `active`.

### LedgerEntry
`date` (ISO), `account`, `ref`, `desc`, `kind` (Deposit | Withdrawal | Transfer | Customer payment
| Supplier payment | Expense | Expense voided | Fee | Fee voided | Refund | Opening balance), `amt`
(signed). Entries are kept newest first.

**`post(state, entry)`** is the only way money moves: it unshifts the entry and adds `amt` to that
account's `balance`.

### Deposit / Withdrawal / Transfer
| Field | Deposit | Withdrawal | Transfer |
|---|---|---|---|
| ref | DEP-#### | WDL-#### | TRN-#### |
| date, time, who, fee, bankRef, notes | ✓ | ✓ | ✓ |
| account | ✓ | ✓ | from / to |
| method | ✓ | ✓ | — |
| purpose | — | ✓ | — |
| description, amount | ✓ | ✓ | ✓ |
| status | Cleared | Completed | Completed |

Postings: a deposit adds +amount, a withdrawal −amount, a transfer −amount from and +amount to.
A fee adds a separate −fee Fee line.

## Expenses slice

### Expense
`ref` (EXP-####, `nextRef` over Expenses plus Voided), `date`, `category`, `payee`, `account`
("Not paid yet" for bills), `reason`, `tax`, `gross`, `branch`, `method`, `payRef`, `fee`, and
`status` (Paid | Waiting approval | Unpaid bill).

```text
 record ─┬─ later ───────────────────────► Unpaid bill ──(payable fully paid in Payables)──► Paid
         ├─ category needs approval ──────► Waiting approval ──Approve──► Paid
         └─ otherwise / auto ─────────────► Paid
 Paid ──Void──► (Voided list, money returned)
 Unpaid bill ──Void (payable not partly paid)──► (Voided list, payable removed)
```

### VoidedExpense
`ref`, `date`, `category`, `payee`, `amount`, `voidedOn` ("10 Nov 2026"), `by`, `reason`, and
`voidAcc`.

### RecurringExpense
`ref` (REC-####), `name`, `category`, `account`, `amount`, `freq` (Daily | Weekly | Monthly |
Yearly), `interval`, `day`, `start`, `end`, `max`, `auto`, `made`, `payee`, `method`, `tax`,
`reason`, `active` (Active | Paused). *repeats* and *next date* are derived as in the design's
`recNext`/`recStep`.

### ExpenseCategory
`name` (unique), `color`, `parent`, `desc`, `budget`, `approval`, `active`. *Spent this month* is
derived as Σ gross of non-voided expenses in November 2026 in that category (and its
sub-categories, if the design rolls them up).

## Changes to existing slices
- `money.payables`: bills from expenses are added with type "Bill" and doc = the EXP ref.
- Feature 003 `recordPayment` posts to accounts (FR-013).
- Feature 001 `approveCreditNote` posts refunds (FR-013a).
