# UI Contract: Accounts and Expenses routes

This extends the earlier route contracts. The guards and the `?action=` / `?view=` conventions
are unchanged.

## Routes (now in scope)

| Path | Tabs |
|---|---|
| `/accounts` → `/accounts/bank-accounts` | `bank-accounts`, `deposits`, `withdrawals`, `transfers`, `transactions` |
| `/expenses` → `/expenses/overview` | `overview`, `expenses`, `recurring`, `voided`, `expense-categories` |

## Search-param actions

| Param | Valid on | Opens |
|---|---|---|
| `?action=account` / `?view=<name>` | `/accounts/bank-accounts` | New / edit account |
| `?action=deposit` | `/accounts/deposits` | New deposit |
| `?action=withdrawal` | `/accounts/withdrawals` | New withdrawal |
| `?action=transfer` | `/accounts/transfers` | New transfer |
| `?view=<ref>` | deposits, withdrawals, transfers, transactions | Record view |
| `?action=new` | `/expenses/expenses` (and Overview) | Record expenses (multi-row form) |
| `?view=<EXP>` / `?view=<EXP>&step=void` | `/expenses/expenses` | Expense view / Void expense |
| `?action=new` / `?view=<REC>` | `/expenses/recurring` | New / edit recurring expense |
| `?action=new` / `?view=<name>` | `/expenses/expense-categories` | New / edit category |

## Role visibility

| Role | Accounts | Expenses |
|---|---|---|
| Owner, Accountant | all 5 tabs | all 5 tabs |
| Cashier, Store keeper | — | — |
