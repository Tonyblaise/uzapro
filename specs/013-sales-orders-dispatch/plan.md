# Implementation Plan: Sales orders and dispatch

**Branch**: `012-wholesale-pricing-credit` | **Date**: 2026-11-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-sales-orders-dispatch/spec.md`

## Summary

Two new sales documents: a **sales order** (no stock, no receivable) and a **delivery note**
(stock leaves the order's store). An order can be dispatched in several delivery notes, each can
be marked delivered with the receiver's name, and the dispatched quantities can be invoiced.

**Technical approach**:

- **Two lists in the sales slice**: `sales.orders` and `sales.deliveries`.
- **One pure module, `src/data/orders.ts`**: remaining quantities, order status, dispatch
  validation and the lines to invoice. Unit tested.
- **Commands in `src/data/commands/orders.ts`**: `createOrder`, `updateOrder`, `cancelOrder`,
  `dispatchOrder`, `markDelivered`, `invoiceOrder`. Stock goes through the existing
  `findShortfall` / `applyStockChanges`; credit through feature 012's `creditGate`.
- **`createInvoice` gains an internal option** so an invoice from an order skips the stock
  movement and the credit check (research R3). Its public behaviour does not change.
- **UI in `src/features/sales/`**: `OrderLists.tsx` (the two tabs), `OrderForm.tsx`,
  `OrderView.tsx`, `DispatchForm.tsx`, `DeliveryView.tsx`, built from the existing DataTable,
  Drawer, SearchSelect, Input and StatusPill, and reusing `usePricer`, `useCreditCheck` and
  `CreditStop` from feature 012.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: unchanged. No new packages.

**Storage**: none (in memory, reloads to the seed).

**Testing**:

- Vitest `tests/unit/orders.test.ts`: status and remaining quantities, dispatch validation,
  invoice lines, and the commands end to end (stock, receivable, credit stop, permissions-free
  paths).
- Playwright `tests/smoke/orders.spec.ts`: take an order, part dispatch, second dispatch, mark
  delivered, invoice, cancel, stock shortfall, read-only role. `responsive.spec.ts`: the new
  screens at 320px with the accessibility scan.

**Target Platform / Project Type**: unchanged (static-export web app).

**Constraints**: read the relevant Next.js guide in `node_modules/next/dist/docs/` before touching
routing (`AGENTS.md`); components use `@/data` only; tokens only; no sideways page scroll from
320px.

**Scale/Scope**: about 8 new files and 12 changed files.

## Constitution Check

| Principle | Check | Status |
|---|---|---|
| I. Design fidelity | No canvas screens for this. Added at the user's request; recorded in spec › Design deviations (4 rows). | ✅ with recorded deviations |
| II. Data seam | New seed in `src/data/fixtures/orders.ts` (new values, recorded). Components use `@/data`. | ✅ with recorded deviation |
| III. Ephemeral | In memory; no storage keys. | ✅ |
| IV. Tokens and accessibility | Existing primitives; drawers trap focus; scanned at 320 and 1440px. | ✅ |
| V. Config-driven modules | Two tabs added to the registry; all UI inside `features/sales`, using `features/customers`' public `CreditStop`. | ✅ |
| VI. Simplicity and types | One pure module, one command file, no new dependencies, no `any`. | ✅ |

No unjustified violations. **Post-design re-check**: still ✅.

## Project Structure

```text
src/
├── config/modules.ts                # + Sales › Sales orders, Deliveries
├── config/roles.ts                  # Accountant's Sales tab list gains the two tabs
├── components/shell/ModuleScreen.tsx# STEP_NEED: dispatch, deliver, invoice → write
├── data/
│   ├── types/orders.ts              # SalesOrder, OrderLine, DeliveryNote, inputs (new)
│   ├── fixtures/orders.ts           # seed SO-0001 and DN-0001 (new)
│   ├── orders.ts                    # pure rules (new)
│   ├── commands/orders.ts           # commands (new)
│   ├── commands/sales.ts            # createInvoice: internal `fromOrder` option
│   ├── commands/customers.ts        # rename follows orders and delivery notes
│   ├── queries-orders.ts            # hooks (new)
│   ├── store/{state,seed}.ts        # + sales.orders, sales.deliveries
│   ├── fixtures/helpcenter.ts       # + article
│   └── index.ts
├── features/sales/
│   ├── OrderLists.tsx, OrderForm.tsx, OrderView.tsx, DispatchForm.tsx, DeliveryView.tsx (new)
│   └── screens.tsx
tests/
├── unit/orders.test.ts              # new
└── smoke/orders.spec.ts             # new (+ responsive.spec.ts)
```

## Complexity Tracking

No constitution violations to justify.
