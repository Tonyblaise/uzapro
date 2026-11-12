# Implementation Plan: Point of Sale

**Branch**: `010-point-of-sale` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-point-of-sale/spec.md`

## Summary

Add the canvas's **Point of sale** module (Sales section). Its **Terminals** tab lists tills and
launches a **full-screen till** in the same tab, at `?till={id}` (Clarification Q1). The till runs
through:

1. open shift;
2. PIN login;
3. selling (rail views Sell, Today, Orders, People and Shift; a product grid; the cart);
4. checkout (cash, M-Pesa, card, pay later, split) and the receipt;
5. held sales, customers, Today stats, session-only settings (Clarification Q2), and close shift
   with a cash count.

Completing a sale:
- adds a POS sale to Sales with the next sale number;
- reduces stock at the terminal's store;
- posts each payment to its account as a "Sale" transaction;
- adds a receivable for any pay-later part.

Technical approach:
- a `pos` store slice seeded from the design's `posStore`;
- pure helpers in `src/data/pos.ts`;
- commands in `src/data/commands/pos.ts`;
- the till UI in `src/features/pos/`;
- the design's `erp-data.js` changes (module, Cashier access, Point of Sale stock lines).

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: unchanged. There are no new packages. Icons come from lucide-react (add
`ScanBarcode` and `CreditCard`). The beep uses the browser's WebAudio.

**Storage**: none new. The `pos` slice is in memory; settings last for the session.

**Testing**:
- Vitest: `tests/unit/pos.test.ts`.
- Playwright: `tests/smoke/pos.spec.ts`, plus `responsive.spec.ts` for the till at 320px with the
  accessibility scan, and the role coverage that `navigation.spec.ts` already does.

**Target Platform / Project Type**: unchanged (a static-export web app on the Cloudflare Worker)

**Performance Goals**: tile taps update the cart instantly. The simulated M-Pesa request takes
1.8s, as in the design.

**Constraints**:
- **Tokens only**: the design's POS category and avatar colours and the receipt paper colour become
  named tokens (research R6, Principle IV).
- No network calls.
- Accessible dialogs, PIN pad, rail and switches.
- No sideways page scrolling from 320px up, with the slide-in cart below 860px.

**Scale/Scope**:
- 1 module and tab;
- 1 full-screen app with 3 entry steps, 5 views and 7 dialogs;
- about 60 commands and about 10 pure helpers;
- 6 seeded sales and 1 seeded shift.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ with recorded deviations | The structure, copy, flows and data follow canvas version 1794512813. The deviations are logged in spec › Design deviations: the same-tab till (Q1), session-only settings (Q2), the Tony Blaise seller, and the receipt footer without "!". |
| II. Data behind a seam | ✅ | The seed in `fixtures/pos.ts` is copied exactly from `posStore`. The `erp-data.js` changes are ported verbatim. The UI reads only `@/data`. M-Pesa, SMS, email and printing are simulated, with no network calls. |
| III. Ephemeral in-memory | ✅ | The `pos` slice resets on reload. There are no new storage keys: the design's `uzPosSettings` is dropped (Q2). |
| IV. Tokens & accessibility | ✅ | New special colours become named tokens. Dialogs reuse Modal and Drawer focus handling. There are labelled controls, `aria-current` and `aria-pressed`. The receipt footer drops the exclamation mark. |
| V. Component and config-driven | ✅ | A registry module entry and screen kind (`poslaunch`), role config, and the shared Button, Modal, Drawer, Input and StatusPill components. |
| VI. Simplicity & types | ✅ | No dependencies. Typed slice and pure helpers. It reuses `applyStockChanges`, `post`, `addReceivable`, `createCustomer`-style rules and the sale number. |

**Gate result**: PASS.

**Post-design re-check**: PASS.

## Project Structure

### Documentation

`specs/010-point-of-sale/` contains plan.md, research.md, data-model.md, quickstart.md,
contracts/ui-and-data.md, checklists/requirements.md, and tasks.md (from `/speckit-tasks`).

### Source Code (changes on top of features 001–009)

```text
src/
├── config/modules.ts, config/roles.ts         # pos module; Cashier mods + "pos"
├── components/ui/Icon.tsx                     # scan-barcode, credit-card
├── components/shell/AppShell.tsx              # hide Uza AI while ?till is set
├── data/
│   ├── types/{common,config,accounts,sales}.ts # ModuleId pos, ScreenKind poslaunch, LedgerKind Sale, POS types
│   ├── fixtures/pos.ts                        # NEW: shift + 6 docs seed, settings defaults, palette names
│   ├── fixtures/stock.ts, fixtures/catalog.ts # Point of Sale stock lines; product statuses
│   ├── pos.ts                                 # NEW: totals, quick cash, codes, X-report, close diff, today stats
│   ├── commands/pos.ts                        # NEW: launch/shift/PIN/cart/checkout/complete/hold/customers/settings/close
│   ├── queries-stock.ts                       # export variant stock helper
│   ├── queries-office.ts (or queries-pos.ts)  # usePos, usePosProducts, usePosShiftDocs
│   ├── store/state.ts, store/seed.ts          # pos slice
│   └── index.ts
├── features/pos/                              # NEW
│   ├── screens.tsx, PosLaunch.tsx             # terminal cards
│   ├── Till.tsx                               # overlay root: pre-steps vs app, modals
│   ├── PreSteps.tsx                           # step bar, open shift, PIN
│   ├── Rail.tsx, TillHeader.tsx, Cart.tsx
│   ├── SellView.tsx, TodayView.tsx, OrdersView.tsx, PeopleView.tsx, ShiftView.tsx
│   └── dialogs/{Variant,Customer,NewCustomer,Checkout,Receipt,Settings,CloseShift}.tsx
├── features/screens.ts                        # pos
└── styles/tokens.css, globals.css             # POS tokens and helper classes
tests/
├── unit/pos.test.ts                           # NEW
└── smoke/pos.spec.ts                          # NEW; responsive.spec.ts updated
```

**Structure Decision**: follows the existing feature pattern. The till is a large single surface, so
its views and dialogs are split into small files under `features/pos/`, sharing one store slice.

## Complexity Tracking

None. There are no constitution violations to justify. The till is large, but it is all in the
canvas.
