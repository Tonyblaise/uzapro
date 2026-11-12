# Implementation Plan: Receivables and Payables

**Branch**: `003-receivables-payables` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-receivables-payables/spec.md`

## Summary

Bring Receivables (`rcv`) and Payables (`pay`) into scope as faithful ports of the canvas:
- lists with the design's computed balances and statuses
- one shared payment form for customer payments and supplier payments (oldest-first allocation,
  credit as a method, overpay blocks)
- approvals, verification, payment plans, bulk payments, customer and supplier credits
- the receivables statement and supplier ageing

A new `money` store slice is seeded verbatim from `erp-data.js`. Feature 001 and 002 commands stop
faking `RCV-`/`PYB-` numbers and create real records instead:
- credit sales, invoices and unpaid receipts create receivables or payables
- voids close receivables
- invoice payments update Sales › Invoices
- store-credit credit notes create customer credits

Accounts stays out of scope: payments record their account, but no balances move.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: Next.js 16.4, React 19, Tailwind 4, Zustand 5, lucide-react. Nothing new.

**Storage**: in-memory store only (constitution v1.1.0); no new storage keys

**Testing**: Vitest for the pure money helpers (balance, status, ageing buckets, instalment
maths); Playwright smoke tests `receivables.spec.ts` and `payables.spec.ts`; the existing role ×
route test covers the 12 new tabs

**Target Platform / Project Type**: unchanged (single Next.js frontend)

**Performance Goals**: screens open in under 1 s; balances update immediately after a payment

**Constraints**: design tokens only; no network; no account-balance changes

**Scale/Scope**: 2 modules, 12 tabs, about 6 drawers (payment, plan, credit, record views), about
20 seed records, and 5 touch-points in existing commands

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ | Behaviour and wording come from the canvas logic (research R1–R6). Deviations are recorded in spec › Design deviations (voided receivables; no account balances). |
| II. Data behind a seam | ✅ | New `fixtures/money.ts`, `types/money.ts`, `queries-money.ts`, and commands `money.ts`. UI uses `@/data` only. |
| III. Ephemeral in-memory | ✅ | The new slice resets on reload. `pybNo` and the module counter `rcvNo` are removed in favour of state-derived numbering. |
| IV. Tokens & accessibility | ✅ | Reuses the feature 001 primitives. Priority and status pills use existing tones. |
| V. Component and config-driven | ✅ | `rcv`/`pay` set `inScope`. One shared payment-form feature (`src/features/receivables/PaymentForm`) is exported from its index for Sales' "Record payment" (same public-entry pattern as Customers and Suppliers). |
| VI. Simplicity & types | ✅ | No new dependencies. Receivables and payables share helpers and the form through a `side` parameter instead of being duplicated. |

**Gate result**: PASS.

## Project Structure

### Documentation

```text
specs/003-receivables-payables/
├── plan.md  research.md  data-model.md  quickstart.md
├── contracts/ (routes.md, data-access.md)
├── checklists/requirements.md
└── tasks.md   (/speckit-tasks)
```

### Source Code (changes on top of features 001–002)

```text
src/
├── config/modules.ts                 # rcv, pay → inScope: true with column defs
├── data/
│   ├── fixtures/money.ts             # NEW: rcv/pay rows + UZ_RCVDETAIL, UZ_PAYDETAIL, UZ_PLANDETAIL, UZ_SCDETAIL (verbatim)
│   ├── types/money.ts                # NEW: Receivable, Payable, Payment, Plan, Credit, inputs, rows
│   ├── money.ts                      # NEW: pure helpers (balance, rcvStatus, payStatus, ageBucket, each)
│   ├── store/state.ts, seed.ts       # NEW slice `money`; remove purchases.pybNo
│   ├── commands/money.ts             # NEW: recordPayment, verifyPayment, approve/rejectPayable, plans, credits, statement, priority
│   │                                 #      + internal addReceivable/closeReceivableFor/addPayable/addCustomerCredit
│   ├── commands/sales.ts             # CHANGE: credit sale & invoice → addReceivable; voidSale → closeReceivableFor;
│   │                                 #         approveCreditNote (money back credit) → addCustomerCredit; remove rcvNo
│   ├── commands/purchases.ts         # CHANGE: receiveGoods (unpaid) → addPayable; remove pybNo
│   ├── queries-money.ts              # NEW hooks
│   └── index.ts                      # exports
├── features/
│   ├── receivables/                  # lists + PaymentForm (shared, side-aware) + PlanForm + CreditForm + record views; index.ts exports PaymentForm
│   ├── payables/                     # lists (reuses receivables' forms with side="pay")
│   ├── sales/…InvoiceView            # CHANGE: "Record payment" → PaymentForm overlay (FR-016a)
│   └── screens.ts                    # register rcv, pay
tests/unit/money.test.ts, tests/smoke/receivables.spec.ts, payables.spec.ts
```

**Structure Decision**: Receivables and Payables are separate feature folders. The payment, plan
and credit forms live once in `features/receivables` with a `side` prop and are exported through
its `index.ts`. Payables and Sales import them from there, never from internals.

### Build order (input to `/speckit-tasks`)

1. Foundation: types, fixtures, `money` slice, helpers with unit tests, registry, hooks.
2. US1 Receivables list, payments and verification.
3. US2 Payables list, approvals and supplier payments.
4. US3 Integration (sales, invoices, voids, receipts, credit notes, invoice "Record payment").
5. US4 Plans, bulk payments and credits.
6. US5 Statement and ageing.
7. Smoke tests, phone width and accessibility, visual review, all gates, commit.

## Complexity Tracking

No violations.
