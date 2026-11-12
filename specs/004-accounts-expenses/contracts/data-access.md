# Contract: Data-access additions (`@/data`)

This extends the earlier contracts. UI imports only `@/data`; commands return `Promise<Result<T>>`
with the design's message.

## Reads

```ts
useAccounts(): Account[]                         // with live balance
useActiveAccountNames(): string[]                // pickers
useLedger(filter?: { account?: string; from?: string; to?: string }): LedgerEntry[]
useDeposits(); useWithdrawals(); useMoneyTransfers()  // money-movement lists
useAccountNames(); useBanks(); useUnvoidableExpenses()
useExpenses(); useVoidedExpenses(); useRecurring(): RecurringRow[]   // with repeats + next date
useExpenseCategories(): CategoryRow[]            // with spent this month
useExpensesOverview(): ExpensesOverview          // the design's `eo` block from live data
```

## Commands

```ts
saveAccount(input, edit?)                     // "{name} added." | design edit message
recordDeposit(input) / recordWithdrawal(input) / recordTransfer(input)   // "Deposit saved." …
recordExpenses(rows: NewExpenseRow[])         // summary toast "{n} paid, {n} waiting approval, …"
approveExpense(ref)                           // "{ref} approved and paid from {account}."
voidExpense(ref, reason)                      // "{ref} voided.[ Money returned to {account}.]"
saveRecurring(input, edit?)                   // "Set up {name} ({ref})." | "Saved {name} ({ref})."
recordRecurringNow(ref)                       // "{EXP} recorded from {name}."
setRecurringActive(ref, active)
saveExpenseCategory(input, edit?)             // "{name} created." | "{name} saved."

// shared, pure
post(state, entry): AppState                  // ledger + balance; the only money mover
```

## Integration changes

- `recordPayment` (feature 003): a non-credit payment calls `post`. A supplier payment that fully
  settles a payable whose doc is `EXP-…` marks that expense Paid with the paying account.
- `approveCreditNote` (feature 001): money back in cash or by the original method calls `post`
  with "Refund to {customer}".

## Invariants

- Balances change only through `post`. The ledger is newest first.
- `EXP-` numbering spans Expenses and Voided.
- Payments by credit never post.
