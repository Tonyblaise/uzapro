# Implementation Plan: Purchases and Suppliers

**Branch**: `002-purchases-suppliers` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-purchases-suppliers/spec.md`

## Summary

Bring the Purchases (`buy`) and Suppliers (`vend`) modules into scope as faithful, working ports
of the canvas:
- purchase orders: create, edit, view, accept
- receiving goods into stock, with accepted and rejected quantities
- goods receipts
- purchase returns, with approval that reduces stock
- rejected-item outcomes
- the Purchases overview
- supplier management

Seed data is ported verbatim from `erp-data.js`, and seed order and receipt details are derived
the way the design's `poDoc`/`grnInfo` do. A new `purchases` and `suppliers` slice joins the
existing store. Receipts and returns reuse feature 001's stock operations, so Stock reflects every
receipt and approved return. Feature 001's "Send to Purchases" becomes a Waiting goods receipt.
Payables and Accounts stay out of scope.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), Node 22 LTS (unchanged)

**Primary Dependencies**: Next.js 16.4 App Router, React 19, Tailwind 4, Zustand 5, lucide-react.
No new dependencies.

**Storage**: in-memory store only (constitution v1.1.0). No new browser-storage keys.

**Testing**: Playwright smoke (new `purchases.spec.ts`, `suppliers.spec.ts`; the feature 001
role × route matrix picks up the new routes automatically). Vitest only if new pure helpers are
added.

**Target Platform**: modern browsers, desktop first, usable at phone width (unchanged)

**Project Type**: single Next.js frontend (unchanged)

**Performance Goals**: every screen opens in under 1 s; a receipt is reflected in stock with no
reload

**Constraints**: design-token styling only; no network; no Payables or Accounts records

**Scale/Scope**: 2 modules / 6 tabs, about 8 forms and views, about 14 seed records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ | Every flow and message comes from the canvas logic (research R1–R8), including the design's own quirks (placeholder seed lines, Send to Purchases → Waiting GRN). |
| II. Data behind a seam | ✅ | New fixtures `purchases.ts`, plus the existing `suppliers.ts`. UI uses `@/data` only (contracts/data-access.md). |
| III. Ephemeral in-memory | ✅ | New slices live in the store and reset on reload. No new storage keys. |
| IV. Tokens & accessibility | ✅ | Reuses the feature 001 primitives (DataTable, Drawer, SearchSelect…), so there are no new raw colours. The overview stage colours map to tokens. |
| V. Component and config-driven | ✅ | `buy`/`vend` set `inScope: true` in the registry. Screens go in `src/features/purchases/` and `src/features/suppliers/`. Stock integration goes through `@/data` commands, not feature imports. |
| VI. Simplicity & types | ✅ | No new dependencies. Strict types in `types/purchases.ts`. |

**Gate result**: PASS.

## Design deviations

| Deviation | Reason | Spec reference |
|---|---|---|
| Receiving goods and "Already paid" capture payment details, but no Payables or Accounts record is created (the toast still names the `PYB-` bill) | Payables and Accounts are out of scope | FR-018 |
| Receiving and returns are blocked when they would exceed the outstanding or returnable quantity, or take stock below 0 | Data integrity, as in feature 001 (FR-016 there) | Edge cases |
| Not built: "New product" in product searches, the generic "New" button on Rejected items, the real print dialog | Out of this demo's scope (see spec › Design deviations) | FR-002, FR-007 |

## Project Structure

### Documentation (this feature)

```text
specs/002-purchases-suppliers/
├── plan.md  research.md  data-model.md  quickstart.md
├── contracts/ (routes.md, data-access.md)
├── checklists/requirements.md
└── tasks.md   (/speckit-tasks)
```

### Source Code (changes on top of feature 001)

```text
src/
├── config/modules.ts                  # buy, vend → inScope: true (column defs from UZ_MODS)
├── data/
│   ├── fixtures/purchases.ts          # NEW: UZ_MODS buy rows (PO, GRN, PRT, REJ) + UZ_BUY, verbatim
│   ├── fixtures/suppliers.ts          # existing; add UZ_NATIONS
│   ├── types/purchases.ts             # NEW: Supplier, PurchaseOrder, PoLine, GoodsReceipt, PurchaseReturn, RejectedItem, inputs
│   ├── store/state.ts, store/seed.ts  # NEW slices: suppliers, purchases (+ poDoc/grnInfo seed derivations)
│   ├── commands/purchases.ts          # NEW: savePurchaseOrder, acceptPurchaseOrder, receiveGoods, createPurchaseReturn, approvePurchaseReturn, markRejected
│   ├── commands/suppliers.ts          # NEW: saveSupplier, setSupplierActive, addNation
│   ├── commands/stock.ts              # CHANGE: sendStockToPurchases → Waiting GRN
│   ├── queries-purchases.ts           # NEW hooks + purchasesOverviewData
│   ├── queries-stock.ts               # CHANGE: useSuppliers reads the slice
│   └── index.ts                       # export the new modules
├── features/
│   ├── purchases/                     # PurchasesOverview, PurchaseOrderList/Form/View, ReceiveForm,
│   │                                  # GoodsReceiptList/View, PurchaseReturnList/Form/View,
│   │                                  # RejectedItemList/View, screens.tsx
│   ├── suppliers/                     # SupplierList, SupplierForm, screens.tsx
│   └── screens.ts                     # register buy, vend
tests/smoke/purchases.spec.ts, suppliers.spec.ts
```

**Structure Decision**: same layout as feature 001. Purchases and Suppliers are separate feature
folders. Supplier pickers in Stock in and the PO form both read `useSuppliers()`. The
"New supplier" option in pickers opens the Suppliers form through `@/features/suppliers`' public
entry (the same pattern as Sales → Customers in feature 001).

### Build order (input to `/speckit-tasks`)

1. Foundation: types, fixtures, slices + seed derivations, the registry `inScope` flag, the
   `useSuppliers` move.
2. US5 Suppliers (smallest, unblocks pickers).
3. US1 Purchase orders.
4. US2 Receive and goods receipts (stock integration).
5. US3 Returns and rejected items.
6. US4 Overview.
7. Send to Purchases change, smoke tests, visual review against the canvas.

## Complexity Tracking

No violations.
