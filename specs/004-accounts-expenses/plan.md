# Implementation Plan: Accounts and Expenses

**Branch**: `004-accounts-expenses` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-accounts-expenses/spec.md`

## Summary

Bring Accounts (`fin`) and Expenses (`exp`) into scope as faithful ports of the canvas:
- bank accounts with live balances
- deposits, withdrawals and transfers
- the Transactions ledger
- a multi-row expense form (paid, waiting approval, bill to Payables, or a recurring schedule)
- expense approval and void
- recurring expenses (Record now, pause, resume)
- categories with budgets
- the expenses overview

One pure `post()` helper is the only thing that moves money: it adds a ledger line and adjusts the
balance. Customer and supplier payments (feature 003), expenses and credit-note refunds now post
real money, which retires feature 003's "balances don't change" rule. Paid sales still don't post
(clarification Q1).

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: Next.js 16.4, React 19, Tailwind 4, Zustand 5, lucide-react. Nothing new.

**Storage**: in-memory store only; no new storage keys

**Testing**: Vitest for `post`, recurring next dates and category spend; Playwright smoke tests
`accounts.spec.ts` and `expenses.spec.ts`; the role × route test covers the 10 new tabs

**Target Platform / Project Type**: unchanged

**Performance Goals**: balances and the ledger update immediately after any action

**Constraints**: design tokens for UI. Category colours are seed data rendered from fixtures
(research R5), not hard-coded component colours.

**Scale/Scope**: 2 modules, 10 tabs, about 7 forms and views, about 30 seed rows, and 3 touch-points
in existing commands

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ | Behaviour and wording come from the canvas (research R1–R7). Paid sales don't post, as in the design (Q1). |
| II. Data behind a seam | ✅ | New fixtures, types and slices behind `@/data`. `post()` is internal to `src/data`. |
| III. Ephemeral in-memory | ✅ | The new slices reset on reload. |
| IV. Tokens & accessibility | ✅ | Category colours are user data from fixtures, shown through a `style` binding on swatches and chart segments, never hard-coded. Everything else uses tokens. |
| V. Component and config-driven | ✅ | `fin` and `exp` set `inScope`. Separate feature folders. The expense form is local to Expenses. |
| VI. Simplicity & types | ✅ | No new dependencies. A single posting helper replaces scattered balance edits. |

**Gate result**: PASS.

## Project Structure

### Documentation
`specs/004-accounts-expenses/`: plan.md, research.md, data-model.md, quickstart.md,
contracts/ (routes.md, data-access.md), checklists/requirements.md, and tasks.md (from
`/speckit-tasks`).

### Source Code (changes on top of features 001–003)

```text
src/
├── config/modules.ts                       # fin, exp → inScope: true with column defs
├── data/
│   ├── fixtures/accounts.ts, expenses.ts   # NEW verbatim ports
│   ├── types/accounts.ts                   # NEW
│   ├── ledger.ts                           # NEW pure: post(), recurring next date / repeats label, category spend
│   ├── store/state.ts, seed.ts             # NEW slices accounts, expenses
│   ├── commands/accounts.ts, expenses.ts   # NEW
│   ├── commands/money.ts                   # CHANGE: recordPayment posts; EXP payable settles expense
│   ├── commands/sales.ts                   # CHANGE: approveCreditNote refund posts
│   ├── queries-accounts.ts                 # NEW hooks (+ expenses hooks)
│   └── index.ts
├── features/
│   ├── accounts/                           # BankAccountList, AccountForm, MoneyMoveForm (deposit/withdrawal/transfer), lists, Transactions, record views
│   ├── expenses/                           # ExpensesOverview, ExpenseList, ExpenseForm (multi-row), ExpenseView, VoidForm, RecurringList/Form, CategoryList/Form
│   └── screens.ts                          # register fin, exp
tests/unit/ledger.test.ts, tests/smoke/accounts.spec.ts, expenses.spec.ts
```

**Structure Decision**: two feature folders, the same pattern as features 002–003. The data layer
(including all commands and integration) is written first, then the UI is built against it.

### Build order (input to `/speckit-tasks`)

1. Foundation: types, fixtures, slices, `post` with unit tests, registry, hooks.
2. US1 and US2 Accounts (data commands, then UI).
3. US3 Expenses (commands, form, approve, void, bills).
4. US6 Integration (payments, refunds, EXP payables).
5. US4 Recurring and categories.
6. US5 Overview.
7. Smoke tests, phone width and accessibility, visual review, gates, commit.

## Complexity Tracking

No violations.
