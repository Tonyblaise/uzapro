# Implementation Plan: Dashboard, Products, Stock, Sales and Customers

**Branch**: `001-dashboard-sales-stock` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-dashboard-sales-stock/spec.md`

## Summary

Build the first slice of the UzaPro demo:

- the app shell, login and role switching
- the five in-scope modules (Dashboard, Products, Stock, Sales, Customers), as faithful,
  working copies of the Claude Design canvas
- a placeholder page for every other module

All data is ported verbatim from `design/canvas/erp-data.js` into typed fixtures. The fixtures
seed an in-memory Zustand store that the UI reaches only through `@/data` (read hooks and async
commands). Writes update lists and stock live, sales and voids move stock, headline figures stay
frozen, and a reload resets the data. The stack is Next.js 16 App Router, Tailwind v4 mapped to the
Uzapoint tokens, Lucide, and hand-written SVG charts. Quality gates are typecheck, lint, build and
a Playwright smoke test per role × route.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), Node 22 LTS

**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Zustand 5,
lucide-react. Dev: ESLint 9 (flat, `eslint-config-next`), Playwright, Vitest

**Storage**: none for business data (in-memory store). `localStorage` holds only
`uzAuth` ({role}) and `uzNavClosed`, as the design does (research R8)

**Testing**: Playwright smoke (role × route matrix + form flows); Vitest for pure helpers

**Target Platform**: modern evergreen browsers (desktop first, usable at phone width ≥ 360px)

**Project Type**: web application (single Next.js frontend, no backend)

**Performance Goals**: every in-scope screen interactive in under 1 s on a dev laptop (SC-006);
form submit to list update under 100 ms

**Constraints**: zero network calls for data; design-token-only styling; WCAG AA contrast;
no business data persisted

**Scale/Scope**: 5 modules / 21 tabs in scope, about 17 forms, drawers and modals, 4 roles, 15
placeholder modules, and about 60 seed records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Design Fidelity | ✅ with 1 documented deviation | All screens and copy come from the canvas. Research R8 corrects two spec statements to match the design. The placeholder page is the only deviation (see Design deviations). |
| II. Data behind a seam | ✅ | Fixtures go in `src/data/fixtures/`, and the UI imports only `@/data` (contract `contracts/data-access.md`). ESLint `no-restricted-imports` enforces it. |
| III. Ephemeral in-memory | ✅ (constitution v1.1.0) | Business data is in memory and resets on reload. Only `uzAuth` and `uzNavClosed` go to `localStorage`, as v1.1.0 allows, through the guarded `src/lib/storage.ts`. |
| IV. Tokens & accessibility | ✅ | Token port (R2), with one named extra token `--banner-orange`. Inter via `next/font/local` (R3), Lucide at 1.5 stroke (R4). Real buttons and labels, focus rings, and overlays that trap focus. |
| V. Component and config-driven | ✅ | Registry `src/config/modules.ts` + `roles.ts` (R7), routes `/[module]/[tab]`, and shared primitives in `src/components/ui/`. Feature folders have no cross-imports. |
| VI. Simplicity & types | ✅ | Strict TS. Every dependency is justified (Zustand R5, no chart lib R10). Server Components for pages, and client components only for interactive parts. |

**Gate result**: PASS against constitution v1.1.0. The spec alignment items below have been
applied to spec.md.

### Spec alignment items (from research): all applied to spec.md on 2026-11-12

1. FR-001: login validates as the design does (R8), instead of "accept any input".
2. FR-004a / Clarification Q4: the role is remembered in browser storage when "Remember me" is
   ticked (the design default), so it survives reloads **and new tabs**. Unticked, it lasts until reload.
3. FR-005: "Pending invoices" and "Invoice analytics" are computed from the seed invoice list once,
   then frozen (R9). Values are unchanged from the design.

## Design deviations

| Deviation | Reason | Spec reference |
|---|---|---|
| Out-of-scope modules show "Not built yet in this prototype." instead of their screens | Phased delivery; those modules come in later features | Clarification Q1, FR-029 |
| "View as" role select in the account menu | The canvas has role data but no visible switcher; US2 needs one | US2, FR-003 |

## Project Structure

### Documentation (this feature)

```text
specs/001-dashboard-sales-stock/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── routes.md        # URLs, actions, guards, role visibility
│   └── data-access.md   # @/data read hooks + async commands
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                 # <html>, Inter font, globals.css, StoreProvider
│   ├── page.tsx                   # redirect → /dashboard or /login
│   ├── fonts/                     # Inter-latin(-ext).woff2 (copied from design/)
│   ├── (auth)/login/page.tsx      # Login / Forgot / Sent
│   └── (app)/
│       ├── layout.tsx             # AppShell (Sidebar, AppHeader) + RouteGuard
│       ├── dashboard/page.tsx
│       ├── [module]/page.tsx      # redirect to first visible tab
│       ├── [module]/[tab]/page.tsx  # registry lookup → feature screen or placeholder
│       └── not-found.tsx
├── components/
│   ├── ui/                        # Button, IconButton, Icon, Logo, Card, KpiCard, Delta,
│   │                              # StatusPill, DataTable, Field/Input, Select, SearchSelect,
│   │                              # Checkbox, Tabs, PageHeader, Menu, Modal, Drawer, Toast,
│   │                              # EmptyState, ConfirmDialog, ImageDrop
│   ├── charts/                    # BarChart, LineChart, AreaChart, HBarList, ProgressBar, Legend
│   └── shell/                     # AppShell, Sidebar, NavItem, AppHeader, UserChip,
│                                  # RoleSelect, RouteGuard, ModulePlaceholder
├── features/
│   ├── auth/                      # LoginScreen, ForgotScreen, SentScreen
│   ├── dashboard/                 # DashboardScreen + panels
│   ├── products/                  # ProductsOverview, ProductList, CategoryList, UnitList,
│   │                              # ProductForm, CategoryForm, UnitForm, ProductRecord
│   ├── stock/                     # StockOverview, StockLevels, TransferList, WastageList,
│   │                              # WarehouseList, StockInForm, TransferForm, TransferView,
│   │                              # WastageForm
│   ├── sales/                     # SalesOverview, SalesList, QuotationList, InvoiceList,
│   │                              # CreditNoteList, VoidList, TargetList, NewSaleForm,
│   │                              # SaleView, DocumentForm (quote/invoice), CreditNoteForm,
│   │                              # CreditNoteView, VoidForm
│   └── customers/                 # CustomerList, CustomerForm
├── config/
│   ├── modules.ts                 # UZ_MODS port + slugs + inScope
│   └── roles.ts                   # UZ_ROLES + ALERTS port, visibility helpers
├── data/
│   ├── index.ts                   # the ONLY public entry (@/data)
│   ├── types.ts
│   ├── fixtures/                  # verbatim ports: catalog.ts, stock.ts, sales.ts,
│   │                              # customers.ts, overviews.ts, reference.ts (units, VAT, reasons)
│   ├── store/                     # Zustand store, slices, seed.ts, StoreProvider.tsx
│   ├── queries.ts                 # read hooks + fixed overview getters
│   └── commands/                  # session.ts, catalog.ts, stock.ts, sales.ts, customers.ts
├── lib/
│   ├── format.ts                  # kes, kesCompact, num, date, pct
│   ├── refs.ts                    # nextRef
│   ├── totals.ts                  # line/VAT/discount maths
│   ├── demo-clock.ts              # DEMO_TODAY = 2026-11-01
│   └── storage.ts                 # try/catch-wrapped uzAuth / uzNavClosed access
└── styles/
    ├── tokens.css                 # verbatim port of design tokens (+ --banner-orange)
    └── globals.css                # Tailwind v4 import, @theme inline mapping, type utilities

tests/
├── smoke/
│   ├── navigation.spec.ts         # role × route matrix, no console errors
│   └── flows.spec.ts              # every in-scope form → submit → toast
└── unit/                          # format, refs, totals, roles (Vitest)
```

**Structure Decision**: a single Next.js app at the repo root, with no backend. `features/*`
own their screens and forms and depend only on `components/`, `data/`, `config/` and `lib/`
(Principle V). `design/` stays read-only reference material.

### Build order (input to `/speckit-tasks`)

1. Scaffold, tokens, fonts, lint and test tooling.
2. Fixtures, types, store, `@/data`, lib helpers, and unit tests.
3. UI primitives and charts.
4. Shell: login, RouteGuard, Sidebar/Header, role select, placeholder (US1/US2 foundation).
5. Dashboard (US1).
6. Sales + Customers (US3, US6).
7. Products (US4).
8. Stock (US5).
9. Smoke suite, then a visual pass against the canvas.

## Complexity Tracking

No open violations. The earlier Principle III conflict (persisting `uzAuth` and `uzNavClosed`)
was resolved by constitution amendment v1.1.0 on 2026-11-12.
