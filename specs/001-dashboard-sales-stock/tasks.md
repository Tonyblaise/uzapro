---

description: "Task list for feature 001: Dashboard, Products, Stock, Sales and Customers"
---

# Tasks: Dashboard, Products, Stock, Sales and Customers

**Input**: Design documents from `specs/001-dashboard-sales-stock/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routes.md,
contracts/data-access.md, quickstart.md

**Tests**: The constitution's quality gates require a Playwright smoke suite (role × route
matrix + form flows). Each story phase therefore ends with a smoke test task. Vitest unit tests
cover only pure helpers. Full TDD is not required.

**Organization**: tasks are grouped by user story so each story can be built and demoed on its
own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: the user story the task belongs to (US1–US6 from spec.md)

## How to read the design (applies to every UI task)

- **Screens and logic**: `design/canvas/Uzapoint ERP.dc.html`. The markup lives in the
  `<sc-if value="{{ flag }}">` blocks. The logic is the `class Component extends DCLogic`
  script near the end of the file. Search for the flag named in the task (e.g. `isSaleNew`,
  `isTrForm`) to find its markup, then search the script for the same name to find its
  behaviour, validation and `showToast('…')` text.
- **Data**: `design/canvas/erp-data.js` (`UZ_*` globals). Port it verbatim.
- **Design system**: `design/design-system/README.md`, `tokens/*.css`, and `_ds_bundle.js`
  (reference markup for Button, KpiCard, DataTable, Sidebar, Modal, Drawer…).
- **Rendered view**: https://claude.ai/artifact/KKMZcTUgzkopE2izUei3TS
- Copy all user-facing strings exactly (sentence case, no exclamation marks). Use only
  token-based classes (no raw hex, except `--banner-orange`).

## Path Conventions

Single Next.js app at the repo root: `src/`, `tests/` (see plan.md › Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: scaffold the project, tooling, tokens and fonts.

- [X] T001 Scaffold Next.js 16 + React 19 + TypeScript. `create-next-app` refuses a non-empty folder, so run `npx create-next-app@16 uzapro-scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes` in the scratchpad or parent directory, then move its contents (including dotfiles, excluding `.git`) into the repo root without overwriting `design/`, `specs/`, `.specify/` or `.claude/`. Merge `.gitignore`, run `npm install`, then delete the boilerplate in `src/app/page.tsx` and `src/app/globals.css`
- [X] T002 Set `"strict": true`, `"noUncheckedIndexedAccess": true` and `"noImplicitOverride": true` in `tsconfig.json`. Add npm scripts `typecheck` (`tsc --noEmit`), `test:smoke` (`playwright test tests/smoke`) and `test:unit` (`vitest run`) to `package.json`
- [X] T003 [P] Install runtime deps `zustand@5` and `lucide-react`. Install dev deps `@playwright/test`, `vitest` and `@vitejs/plugin-react`. Pin the exact versions in `package.json`
- [X] T004 [P] Create `playwright.config.ts` (chromium, baseURL `http://localhost:3000`, `webServer: npm run build && npm run start`, fail on console errors via a shared fixture `tests/smoke/fixtures.ts`) and `vitest.config.ts` (environment `node`, include `tests/unit/**/*.test.ts`, `@` alias → `src`)
- [X] T005 [P] Configure ESLint in `eslint.config.mjs`. Add `no-restricted-imports` that blocks `@/data/fixtures/*` and `@/data/store/*` outside `src/data/**` (Principle II), and a `no-restricted-syntax` rule that flags hex colour literals in `src/components/**` and `src/features/**` (Principle IV)
- [X] T006 [P] Port `design/design-system/tokens/colors.css`, `typography.css`, `spacing.css` and `base.css` verbatim into `src/styles/tokens.css`, and add `--banner-orange: #C2570C` (research R2)
- [X] T007 Create `src/styles/globals.css`: `@import "tailwindcss"`, `@import "./tokens.css"`, and an `@theme inline` block that maps the colour, radius, shadow, spacing, font and duration tokens to Tailwind (`--color-action: var(--action)`, `--color-canvas`, `--color-surface`, `--color-text-muted`, `--color-success-soft`, …). Add utility classes `.type-display`, `.type-h1`, `.type-kpi`, `.type-h2`, `.type-card-title`, `.type-title`, `.type-body`, `.type-label`, `.type-small`, `.type-caption`, `.type-micro`, `.type-eyebrow` (uppercase + `--tracking-caps`), `.type-table-head` and `.u-num`
- [X] T008 [P] Copy `design/design-system/assets/fonts/Inter-latin.woff2` and `Inter-latin-ext.woff2` to `src/app/fonts/`, and load them with `next/font/local` (weight `400 700`, variable `--font-sans`) in `src/app/layout.tsx`, which imports `@/styles/globals.css` and sets `<html lang="en-KE">`

**Checkpoint**: `npm run dev` serves a blank page in Inter on the `--canvas` background. `npm run typecheck` and `npm run lint` pass.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: types, fixtures, store, data layer, helpers, UI primitives, shell, login and routing. These are needed by every story.

**⚠️ CRITICAL**: no user story work can begin until this phase is complete.

### Helpers

- [X] T009 [P] Create `src/lib/demo-clock.ts` exporting `DEMO_TODAY = '2026-11-01'` and `demoNow()` (research R12)
- [X] T010 [P] Create `src/lib/format.ts` with `kes(n)` → "KES 45,600.00", `kesCompact(n)` → "KES 4.82M" / "KES 184K", `num(n)` → "45,600", `date(iso)` → "12 Nov 2026" and `pct(n)` → "12.4%", matching the design's number formatting
- [X] T011 [P] Create `src/lib/refs.ts` with `nextRef(existing: string[], prefix: string, width: number)`: the highest numeric suffix + 1, zero-padded (the same as `expNextRef` in the design script)
- [X] T012 [P] Create `src/lib/totals.ts` with `lineTotal`, `docTotals({ lines, discount: { value, type: 'KES' | '%' }, vatRate: 0.16 })` → `{ subtotal, discount, vat, total }`. VAT applies only to taxable lines after discount, rounded to 2 dp
- [X] T013 [P] Create `src/lib/storage.ts` with try/catch-wrapped `readAuth()`, `writeAuth(role)`, `clearAuth()` (key `uzAuth`) and `readNavClosed()`, `writeNavClosed(map)` (key `uzNavClosed`). Only these keys are allowed (constitution v1.1.0)
- [X] T014 [P] Write unit tests for T010–T012 in `tests/unit/format.test.ts`, `tests/unit/refs.test.ts` and `tests/unit/totals.test.ts` (e.g. `kesCompact(4820000)` → "KES 4.82M", `nextRef(['VOID-0001'],'VOID-',4)` → "VOID-0002", and a Bike Pump line with VAT 0)

### Types, config and fixtures

- [X] T015 Create `src/data/types.ts` with every type in `data-model.md` (Tone, Pill, RoleId, ModuleId, Result<T>, Module, Tab, Role, QuickTask, Alert, Product, Variant, Category, Store, StockLevel, StockMovement, Transfer, Wastage, Customer, Sale, SaleLine, Payment, Quotation, Invoice, CreditNote, VoidRecord, SalesTarget, and the overview data types)
- [X] T016 [P] Create `src/config/modules.ts`: a typed port of all 20 `UZ_MODS` entries (id, section, icon, name, subtitle, tabs with kind and column defs) plus `slug` and `inScope` (`home`, `prod`, `inv`, `sales` and `cust` only) per research R7. Add `tabSlug(title)`, `findModuleBySlug()` and `findTab()`
- [X] T017 [P] Create `src/config/roles.ts`: port `ALERTS` and `UZ_ROLES` verbatim, plus `visibleModules(role)`, `visibleTabs(role, moduleId)` and `roleFromLogin(id)` (the first-name prefix match, otherwise `owner`). Add unit tests in `tests/unit/roles.test.ts` against the table in `contracts/routes.md`
- [X] T018 [P] Create `src/data/fixtures/reference.ts`: `UZ_UNITS`, `UZ_NONTAX`, `UZ_PAYMETHODS`, `UZ_REFUND`, `UZ_VOID`, `UZ_LOC`, `UZ_BIZ` and the wastage reasons (from the `wReason` options in the design script)
- [X] T019 [P] Create `src/data/fixtures/catalog.ts`: products (from the `UZ_MODS` prod "All products" rows), variants (`UZ_VARIANTS`, including the extra-unit post-processing for Muthokinju Paint, Bike Pump and Helmet), `UZ_PRODADDED`, and the categories (from the prod "Categories" rows, with their parent column)
- [X] T020 [P] Create `src/data/fixtures/stock.ts`: stores (from the inv "Warehouses" rows), `UZ_STOCK.lines`, `UZ_STOCK.moves`, transfers (inv "Transfer stock" rows merged with `UZ_STOCK.transfers`), and wastage (inv "Wastage" rows)
- [X] T021 [P] Create `src/data/fixtures/sales.ts` with the sales rows for "All sales", "Quotations", "Invoices", "Refunds (credit notes)" and "Voided items", plus `UZ_TARGETS`
- [X] T022 [P] Create `src/data/fixtures/customers.ts` (cust "Customers" rows)
- [X] T023 [P] Create `src/data/fixtures/overviews.ts`: `UZ_HOME`, `UZ_SALES`, `UZ_PRODUCTS` (with the `PR` table), `UZ_PRODTREND` and the fixed parts of `UZ_STOCK` (kpis, low, week, categories)

### Store and data layer

- [X] T024 Create `src/data/store/seed.ts` with a pure `createSeed()` that builds the initial state for the session, catalog, stock, sales and customers slices from the fixtures (session starts as `authed: false`, `role: 'owner'`, `hydrated: false`; no storage access, so the server and browser renders match)
- [X] T025 Create `src/data/store/index.ts`: a Zustand vanilla store (`createStore`) with the slices `session`, `catalog`, `stock`, `sales`, `customers` and `ui` (toast `{ text, id }`, plus `showToast(text)` that auto-clears after 3 s). Create `src/data/store/StoreProvider.tsx` (a client component that creates the store once per tab and provides it through context, with a `useAppStore(selector)` hook. A `useEffect` reads `readAuth()` and `readNavClosed()` once, applies them, and sets `hydrated: true`)
- [X] T026 Create `src/data/queries.ts` with the read hooks from `contracts/data-access.md` (`useSession`, `useVisibleModules`, `useVisibleTabs`, `useToast`) and the fixed getters `getDashboard`, `getSalesOverview`, `getProductsOverview` and `getStockOverview`. `getDashboard` derives "Pending invoices" and the invoice analytics once from the seed invoices (research R9)
- [X] T027 Create `src/data/commands/session.ts` with `login`, `requestPasswordReset`, `switchRole` and `signOut`. Validation and messages must match the design's `lg` block (research R8). Add the 600 ms delay, the toast "Welcome back, {first}.", and `writeAuth` when `remember` is set
- [X] T028 Create `src/data/index.ts`, the only public entry. It re-exports types, queries, commands and `StoreProvider`, so app code never imports `@/data/store/*` (the commands for later stories are added in their phases)

### UI primitives and charts

- [X] T029 [P] Create `src/components/ui/Icon.tsx` (a design icon name → lucide component map from research R4, `strokeWidth={1.5}`, sizes 14/16/18) and `src/components/ui/Logo.tsx` (green-500 tile with a white "U", and "Uza" + "Pro" wordmark as in the design header)
- [X] T030 [P] Create `src/components/ui/Button.tsx` (variants primary, secondary, soft, ghost, danger; sizes sm, md, lg) and `src/components/ui/IconButton.tsx` (`aria-label` required), matching `_ds_bundle.js`
- [X] T031 [P] Create `src/components/ui/Card.tsx`, `KpiCard.tsx` (label, value, caption with ▲ delta tone, icon chip), `Delta.tsx` and `StatusPill.tsx` (tone → soft bg + text colour + dot)
- [X] T032 [P] Create `src/components/ui/DataTable.tsx`: columns `{ title, numeric?, render? }`, edge-to-edge in a card, sticky header, row hover, numeric columns right-aligned with `.u-num`, optional row click and row actions menu, scrolls inside the card, and an empty-state sentence. It also has a toolbar with a search input (filters rows; empty text "No records match that search.") and an "Export CSV" button that copies the rows as CSV (headers = column titles) to the clipboard with the toast "Copied {n} rows as CSV." or "Copy is not available here.", matching the design's `exportCsv` (FR-026a)
- [X] T033 [P] Create `src/components/ui/Field.tsx` (label + input + hint + error), `Select.tsx`, `SearchSelect.tsx` (port of `window.UzForms.SearchSelect` in `erp-data.js`: searchable options with optional "create" entry), `Checkbox.tsx` and `ImageDrop.tsx` (SVG/PNG/JPG, 5 MB limit, the design's error texts)
- [X] T034 [P] Create `src/components/ui/Modal.tsx` and `Drawer.tsx` (40% overlay, focus trap, Escape closes, `shadow-lg`, radius-lg, 200 ms slide), `ConfirmDialog.tsx`, `Menu.tsx`, `Tabs.tsx` (links to `/[module]/[tab]`), `PageHeader.tsx` (eyebrow, title, subtitle, actions), `EmptyState.tsx` and `Toast.tsx` (fixed, bottom, reads `useToast`)
- [X] T035 [P] Create `src/components/charts/BarChart.tsx` (grouped bars with y-axis "KES 5M" ticks and month labels), `LineChart.tsx`, `AreaChart.tsx` (pale green fill), `HBarList.tsx` (labelled horizontal bars with values), `ProgressBar.tsx` and `Legend.tsx`. All are SVG and token colours only, with `role="img"` + `aria-label`

### Shell, login and routing

- [X] T036 Create `src/features/auth/LoginScreen.tsx`, `ForgotScreen.tsx` and `SentScreen.tsx` from the design's `isLogin` block: the two-column layout with the green side panel (points + bars), Show/Hide password, Remember me (default on), "Forgot password?", "Create a free account" (toast), the footer, and inline errors. `src/app/(auth)/login/page.tsx` hosts them and redirects to `/dashboard` when signed in
- [X] T037 Create `src/components/shell/Sidebar.tsx` and `NavItem.tsx`: logo, sections from `visibleModules` grouped by `section`, collapsible section headers persisted with `writeNavClosed`, active state, and a collapsed drawer below 760 px
- [X] T038 Create `src/components/shell/AppHeader.tsx` and `UserChip.tsx`: search input (placeholder "Search products, invoices, customers"), help and bell icon buttons (bell with a red dot), and the user chip (initials, name, role). The chip menu holds the role select ("roleOptions" in the design) and "Sign out"
- [X] T039 Create `src/components/shell/RouteGuard.tsx` (client. It renders a blank canvas until `hydrated` is true, then: signed out → `/login`; hidden module or tab → `/dashboard`, per `contracts/routes.md` › Guards) and `src/components/shell/ModulePlaceholder.tsx` (PageHeader with the registry name and subtitle + "Not built yet in this prototype.")
- [X] T041 Create `src/features/screens.ts`, a map of `moduleId/tabSlug → component`. It starts with every in-scope tab mapped to a temporary `ModulePlaceholder`, and story phases replace the entries. *(Listed before T040 on purpose: T040 imports this file.)*
- [X] T040 Create `src/components/shell/AppShell.tsx` and `src/app/(app)/layout.tsx` (`StoreProvider` imported from `@/data` at root, AppShell + RouteGuard + Toast). Create `src/app/page.tsx` (redirect), `src/app/(app)/[module]/page.tsx` (redirect to the first visible tab), `src/app/(app)/[module]/[tab]/page.tsx` (lookup in `src/features/screens.ts`, with out-of-scope modules rendering ModulePlaceholder, `generateStaticParams` from the registry, and `notFound()` for unknown slugs) and `src/app/(app)/not-found.tsx`

**Checkpoint**: log in as tony@… → the shell renders, every sidebar link routes, and out-of-scope modules show the placeholder.

---

## Phase 3: User Story 1 - Enter the app and see the business at a glance (Priority: P1) 🎯 MVP

**Goal**: the Owner logs in and sees the complete Dashboard from the design.

**Independent Test**: log in and compare every banner, KPI, chart and panel with the design (quickstart scenarios 1–2).

- [X] T048 [US1] Add `useRecentActivity` to `src/data/queries.ts` and export it from `src/data/index.ts` *(listed first on purpose: T047 depends on it)*
- [X] T042 [P] [US1] Create `src/features/dashboard/BannerRow.tsx` (4 banners: Today, This week, This month, Annual. Colours green-600, grey-900, `--banner-orange`, info. Icons file-text, refresh-cw, calendar, chart-column) from `getDashboard().banners`
- [X] T043 [P] [US1] Create `src/features/dashboard/KpiGrid.tsx`: 8 KPI tiles in the design's order (revenue, expenses, net profit, pending invoices, customers, suppliers, stock value, low stock items), with icons banknote, receipt, chart-column, file-text, users, truck, boxes and circle-alert. The last chip uses warning-soft. Layout `.uz-kpi8`-equivalent grid
- [X] T044 [P] [US1] Create `src/features/dashboard/ComparePanel.tsx` ("Comparative analysis", "Sales and purchases over 6 months", Bars/Lines/Area toggle with local state, legend) and `CashflowPanel.tsx` ("Inflow and outflow")
- [X] T045 [P] [US1] Create `src/features/dashboard/InvoiceAnalytics.tsx` (Overdue/Pending/Paid rows with count and amount, "View details" → `/sales/invoices`) and `TopProducts.tsx` (HBarList, "View stock" → `/stock/overview`)
- [X] T046 [P] [US1] Create `src/features/dashboard/StockPerformance.tsx` (total stock value, items in storage, turnover rate, daily movement with opening/closing, low/out tiles, "View details" → `/stock/overview`)
- [X] T047 [P] [US1] *(Done per the design: RecentActivity, ExpensesPanel and PaymentsPanel are not rendered by the canvas, so they were not built; the Cashier and Store keeper get the simple home.)* Create the remaining dashboard panels from the design's home section (search the script for `hRecent`, `hd.expenses`, `hd.customers`, `hd.payments` and `hd.suppliers`) in `src/features/dashboard/RecentActivity.tsx` (Sale/Purchase tabs from `useRecentActivity`), `ExpensesPanel.tsx`, `CustomersPanel.tsx`, `PaymentsPanel.tsx`, `SuppliersPanel.tsx`, `QuickTasks.tsx` and `AttentionList.tsx` (links go to the module/tab with `?action=`)
- [X] T049 [US1] Create `src/features/dashboard/DashboardScreen.tsx`, laying out all panels in the design's order and grid ("Welcome back, {name}" title, subtitle "Here's what's happening with your store"). Wire it in `src/app/(app)/dashboard/page.tsx` and `src/features/screens.ts`
- [X] T050 [US1] Write smoke tests in `tests/smoke/dashboard.spec.ts`: login validation errors, the forgot → sent → back flow, the dashboard values (KES 184K, Pending invoices 2, Overdue "1, KES 1,026"), the chart toggle, and the panel links

**Checkpoint**: MVP demo. Login and the full Dashboard work.

---

## Phase 4: User Story 2 - Switch role and see what each person sees (Priority: P1)

**Goal**: four roles with correct sidebar, tabs, greeting, quick tasks and attention items.

**Independent Test**: switch roles from the user chip and check against `contracts/routes.md` (quickstart scenario 3).

- [X] T051 [US2] Wire the role select in `src/components/shell/UserChip.tsx` to `switchRole` (navigates to `/dashboard`), and make `Sidebar`, `Tabs`, `DashboardScreen` (name/greeting), `QuickTasks` and `AttentionList` read the current role reactively
- [X] T052 [US2] Make `src/app/(app)/[module]/page.tsx` and `RouteGuard` use `visibleTabs(role, module)[0]` for module redirects (e.g. Cashier `/sales` → `/sales/all-sales`)
- [X] T053 [US2] Write `tests/smoke/navigation.spec.ts`: for each role (log in as tony@, mary@, jane@ or grant@ with password `demo1234`), visit every visible in-scope module/tab route, assert the page heading, assert hidden routes redirect to `/dashboard`, assert out-of-scope modules show "Not built yet in this prototype.", and assert no console errors

**Checkpoint**: role switching is complete. Story screens can now be added and checked per role.

---

## Phase 5: User Story 3 - Record a sale and follow it through sales documents (Priority: P1)

**Goal**: all seven Sales tabs plus the new-sale, sale view, quotation/invoice, credit note and void flows, with stock moving on sale, void and credit approval.

**Independent Test**: quickstart scenarios 4–6.

- [X] T054 [US3] Create `src/data/commands/sales.ts` with `recordSale` (validate customer and lines and that stock is on hand at the store, default "Point of Sale"; decrement levels; log Sold movements; prepend the sale with `SAL-` ref; toast), `voidSale` (VOID record, remove from All sales and Invoices, return stock for session sales, "Sale voided."), `createQuotation`, `createInvoice`, `createCreditNote` (Waiting approval), `approveCreditNote` (stock return if `returnToStock`), `deleteTarget` ("Target deleted."), `printDocument` and `downloadPdf` (toast only). Use the exact design messages from the script (`showToast` calls near `voidSale`, `qKind`, `cn*` and `target`)
- [X] T055 [US3] Add the sales read hooks (`useSales`, `useQuotations`, `useInvoices`, `useCreditNotes`, `useVoids`, `useTargets`) to `src/data/queries.ts`, and export them and the sales commands from `src/data/index.ts`
- [X] T056 [P] [US3] Create `src/features/sales/SalesOverview.tsx` (design `salesdash`: 4 KPIs, sales by channel, orders summary, trend, categories, and the 7 boards from `getSalesOverview()`)
- [X] T057 [P] [US3] Create `src/features/sales/SalesList.tsx` (All sales: columns Customer, Type, Channel, Total, Status. Status filter chips as in the design, row click → `?view=`, "New sale" primary action → `?action=new`)
- [X] T058 [P] [US3] Create `src/features/sales/QuotationList.tsx`, `InvoiceList.tsx` (Balance due column with the "Amount paid: …" sub-line), `CreditNoteList.tsx`, `VoidList.tsx` and `TargetList.tsx` (progress bar, status, delete via ConfirmDialog), using the design's columns and filters (`hasQuoteFilter`)
- [X] T059 [US3] Create `src/features/sales/NewSaleForm.tsx` (design `isSaleNew`: "Customer and items", product/variant picker "Add to sale", "This sale" lines, "No items in this sale.", VAT 16% and Total from `docTotals`, payment method, Cancel/"Record sale") as a Drawer opened by `?action=new`. Payment options include "Later (credit)". Choosing credit with no customer, or with "Walk-in Customer", blocks recording with "Pick the customer first. Walk-in customers can't buy on credit."
- [X] T060 [US3] Create `src/features/sales/SaleView.tsx` (design `isPosView`: "Sale {ref}", Reprint/PDF/Credit note/Void actions, "Products in this sale" table, Payments table, Summary with subtotal, VAT, grand total, amount paid and balance due, Details) opened by `?view=<ref>`
- [X] T061 [US3] Create `src/features/sales/VoidForm.tsx` (design `isVoidForm`: reason select from `UZ_VOID`, "Void sale"/Cancel)
- [X] T062 [US3] Create `src/features/sales/DocumentForm.tsx` (design `isQuoteForm`, shared by quotation and invoice through `qKind`: customer, dates, store, line items "Item description/Qty/Unit/Rate/Tax/Amount", "No items added yet.", discount KES/%, VAT 16%, notes, terms, totals), opened by `?action=quote` / `?action=invoice`
- [X] T063 [US3] Create `src/features/sales/CreditNoteForm.tsx` (design `isCnForm`: the waiting-approval note, sections 1–5 (what is being credited, items with Sold/Credited/Open/Credit qty/Unit price/Credit, reason, "Return goods to stock" checkbox, money back), Summary) and `CreditNoteView.tsx` (design `isCnView`: Approve, Print, PDF, lines and totals)
- [X] T064 [US3] Register all Sales tabs in `src/features/screens.ts`, and mount the overlays on their tabs using `?action=`/`?view=`
- [X] T065 [US3] Write `tests/smoke/sales.spec.ts`: record a sale (Bike Pump ×2 + Helmet Medium ×1, VAT only on the Helmet, Point of Sale Bike Pump 28 → 26), void it (VOID-0002, stock back to 28), raise and approve a credit note, create a quotation with a discount, block an empty sale, block a walk-in credit sale, and delete a target

**Checkpoint**: the selling flow is complete and changes stock.

---

## Phase 6: User Story 4 - Manage products and their catalogue (Priority: P2)

**Goal**: the Products overview, product, category and unit lists, the add forms, and the product record with stock history.

**Independent Test**: quickstart scenario 7.

- [X] T066 [US4] Create `src/data/commands/catalog.ts` with `createProduct` (unique name, ≥1 variant, price > 0, image rules), `createCategory`, `updateCategory`, `deleteCategory` (blocked when in use or when it has children, with the design messages) and `createUnit` (unique). Add `useProducts`, `useProduct`, `useCategories` and `useUnits` to `src/data/queries.ts`, and export them from `src/data/index.ts`
- [X] T067 [P] [US4] Create `src/features/products/ProductsOverview.tsx` (design `prodboard`: highlights, "Sales by product" and "Units sold by product" bars, categories, best sellers, monthly units trend from `getProductsOverview()`)
- [X] T068 [P] [US4] Create `src/features/products/ProductList.tsx` (columns Product, Category, Price, On hand, Status, row → `?view=<name>`), `CategoryList.tsx` (with parent, edit/delete row actions) and `UnitList.tsx`
- [X] T069 [US4] Create `src/features/products/ProductForm.tsx` (design `isProdNew`: name, category SearchSelect, "Product variants" table with Variant/Base buying price/Unit/Base selling price/Margin, "Add variant", extra unit prices "+", the "Each product needs at least one price…" hint, image ImageDrop, Tax select, Save/Cancel)
- [X] T070 [P] [US4] Create `src/features/products/CategoryForm.tsx` (design `isCatNew`: name, description, image) and `UnitForm.tsx` (design `isUnitForm`)
- [X] T071 [US4] Create `src/features/products/ProductRecord.tsx` (design `isRecord` + `isStockHist`: overview, variants, stock history table with Date/Variant/Change/Store/Quantity/Left/By/Ref, and the empty text "No stock changes recorded for this product yet.")
- [X] T072 [US4] Register the Products tabs and overlays in `src/features/screens.ts`
- [X] T073 [US4] Write `tests/smoke/products.spec.ts`: add Test Saddle (40% margin) and see it listed, block a duplicate category, block deleting "Parts", reject an oversize image, and open the Bike Pump history

**Checkpoint**: catalogue management works independently.

---

## Phase 7: User Story 5 - Track and move stock (Priority: P2)

**Goal**: the Stock overview, levels with filters, add stock, transfers (lifecycle), wastage and warehouses.

**Independent Test**: quickstart scenarios 8–9.

- [X] T074 [US5] Create `src/data/commands/stock.ts` with `addStock` ("Stock added to {store}."), `createTransfer` (confirm, ship or shipAndReceive per the data-model state diagram), `receiveTransfer` ("Transfer received at {to}."), `cancelTransfer` (Not finished only, no stock change) and `recordWastage` ("Wastage recorded at {location}."). Enforce quantity ≥ 0 and `from ≠ to`. Add `useStores`, `useStockLevels`, `useMovements`, `useTransfers` and `useWastage` to `src/data/queries.ts`, and export them from `src/data/index.ts`
- [X] T075 [P] [US5] Create `src/features/stock/StockOverview.tsx` (design `stockboard`: 3 KPIs, low-stock list with pills, week in/out bars, categories share, and recent movements from the live `useMovements({ limit })`)
- [X] T076 [P] [US5] Create `src/features/stock/StockLevels.tsx` (Stock management: Product/Store/Quantity/Stock value (KES), store filter "All stores" + level filter (design `hasStoreFilter`, `storeFilter`, `levelFilter`), empty state, "Add stock" → `?action=stock`), `TransferList.tsx`, `WastageList.tsx` and `WarehouseList.tsx`
- [X] T077 [US5] Create `src/features/stock/StockInForm.tsx` (design `isStockForm`: Storage details, Reference or notes, Documents (optional) with "Take a photo"/"Upload a file" simulated, "Items to receive" table, "No items added", the "Skip Purchases and add to stock now" option, Cancel/Save)
- [X] T078 [US5] Create `src/features/stock/TransferForm.tsx` (design `isTrForm`: Transfer details, notes, "Items to transfer" Product/Quantity/Unit/Type, and the three submit buttons "Confirm transfer", "Transfer and ship", "Transfer, ship and receive") and `TransferView.tsx` (design `isTrLocked`/`isTrCancel`: items, "Mark as received", "Cancel transfer" confirm with the design text, "Keep transfer")
- [X] T079 [US5] Create `src/features/stock/WastageForm.tsx` (design `isWasteForm`: "Declare damaged, expired or lost stock.", location, default reason, notes, items Product/Quantity/Unit/Reason, the hint text, "Record wastage")
- [X] T080 [US5] Register the Stock tabs and overlays in `src/features/screens.ts`
- [X] T081 [US5] Write `tests/smoke/stock.spec.ts`: transfer Bike Pump ×2 Main Store → Point of Sale with ship then receive (30 → 28, 28 → 30), cancel a Not finished transfer, record wastage (Carbon Sole Shoes 40 → 39), block over-quantity, and filter by store

**Checkpoint**: stock control works independently, and sales still reduce stock correctly.

---

## Phase 8: User Story 6 - Look up and add customers (Priority: P3)

**Goal**: the customer list and the add-customer form, feeding the sale picker.

**Independent Test**: quickstart scenario 10.

- [X] T082 [US6] Create `src/data/commands/customers.ts` with `createCustomer` (unique name, the design message "Another customer is already called …"). Add `useCustomers` to `src/data/queries.ts` and export both from `src/data/index.ts`
- [X] T083 [P] [US6] Create `src/features/customers/CustomerList.tsx` (Name/Phone/Email/Address/Status, "New customer" → `?action=new`) and `CustomerForm.tsx` (design `isCustNew`: name, phone, email, address, Save/Cancel)
- [X] T084 [US6] Register the Customers tab in `src/features/screens.ts`, and make `NewSaleForm` customer picker read `useCustomers()`, so new customers appear (the SearchSelect "create" option opens CustomerForm if the design has it)
- [X] T085 [US6] Write `tests/smoke/customers.spec.ts`: add Kilele Riders, pick it in a new sale, and block the duplicate "Mountain Goats"

**Checkpoint**: all six stories work.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T086 [P] Wire the header search in `src/components/shell/AppHeader.tsx` to a `ui.search` value in the store, so it filters the rows of the current tab's `DataTable` (case-insensitive, any column). The empty text is "No records match that search." (design `q` / `onSearch`). Clear the search on tab change. There is no cross-module results list
- [X] T087 [P] Responsive pass at 360, 768, 1100 and 1440 px across all in-scope screens (sidebar drawer, KPI grids, tables scrolling inside cards), per the design's media queries (`.uz-c4`, `.uz-kpi8`, `.uz-scroll`)
- [X] T088 [P] Accessibility pass: icon-only buttons have `aria-label`, focus rings are visible, overlays trap focus and restore it, pills are not colour-only (they have text), and contrast follows the DS "Known contrast gaps"
- [X] T089 Visual fidelity review against the canvas for every in-scope screen and overlay. Log any accepted differences in plan.md › Design deviations
- [X] T090 Run every gate (`npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke`) and walk through all 12 quickstart scenarios

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → user stories.
- **US1 (Phase 3)** and **US2 (Phase 4)** only need Foundational. US2's role-reactive bits touch
  US1's dashboard components, so do US1 first.
- **US3 (Sales)**, **US4 (Products)**, **US5 (Stock)** and **US6 (Customers)** each need only
  Foundational and can run in parallel. Cross-story touchpoints:
  - US3 `recordSale` uses stock levels from the foundational store (not US5's commands).
  - US4 `ProductRecord` history shows movements created by US3/US5 when those exist.
  - US6 T084 edits `NewSaleForm` (US3), so do it after T059.
- **Polish (Phase 9)** comes after all the desired stories.

### Within each story

Commands + queries → list/overview screens [P] → forms and views → `screens.ts` registration → smoke test.

### Parallel opportunities

- Phase 1: T003–T006 and T008.
- Phase 2: T009–T014 (helpers), T016–T023 (config and fixtures), T029–T035 (UI primitives and charts).
- US1: T042–T047.
- US3: T056–T058 once T054–T055 are done.
- US4–US6 phases can be split across developers after Phase 2.

## Parallel Example: User Story 3

```bash
# After T054 (commands) and T055 (queries):
Task: "T056 SalesOverview in src/features/sales/SalesOverview.tsx"
Task: "T057 SalesList in src/features/sales/SalesList.tsx"
Task: "T058 Quotation/Invoice/CreditNote/Void/Target lists in src/features/sales/"
```

## Implementation Strategy

### MVP first (User Story 1)

1. Phase 1 → Phase 2 → Phase 3.
2. **Stop and validate**: login + the full Dashboard against the design (quickstart 1–2). Demo-able.

### Incremental delivery

1. + US2 (roles) → demo the per-role views.
2. + US3 (Sales) → demo selling, which is the core flow.
3. + US4 (Products), + US5 (Stock), + US6 (Customers).
4. Polish, then run all gates.

## Notes

- [P] = different files with no incomplete dependencies. [USn] maps a task to its spec story.
- Commit after each task or logical group.
- Every string, figure and status label is copied from the design files. Never invent copy or data.
- After each phase checkpoint, run `npm run typecheck && npm run lint`.
