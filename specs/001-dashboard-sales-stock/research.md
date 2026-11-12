# Research: Dashboard, Products, Stock, Sales and Customers

**Feature**: `001-dashboard-sales-stock` | **Date**: 2026-11-12

All Technical Context unknowns are resolved below. Design facts were read from
`design/canvas/Uzapoint ERP.dc.html` (its logic `<script>` block) and `design/canvas/erp-data.js`.

## R1. Framework and versions

- **Decision**: Next.js 16 (App Router) + React 19 + TypeScript 5 (`strict`), Node 22 LTS
  (installed: v22.22.2), npm. Pin exact versions at scaffold time via
  `create-next-app@16` and commit `package-lock.json`.
- **Rationale**: the constitution fixes Next.js App Router. Next 16 is the current stable
  line, and Node 22 meets its minimum.
- **Alternatives**: Vite SPA. The user rejected it in favour of Next.js so real features can
  be added later.

## R2. Styling: Tailwind v4 mapped to design tokens

- **Decision**: Tailwind CSS v4 (CSS-first config). `src/styles/tokens.css` is a verbatim
  port of `design/design-system/tokens/{colors,typography,spacing,base}.css`. `globals.css`
  maps those variables into Tailwind with `@theme inline` (e.g. `--color-action:
  var(--action)`, `--radius-md: var(--radius-md)`, `--spacing-*`). Composite type styles
  (`--type-h1` etc.) are exposed as small utility classes (`.type-h1`, `.type-eyebrow`…)
  in `globals.css`.
- **Rationale**: one source of truth (Principle IV). Tailwind utilities are generated from
  tokens only, so stray hex values are easy to lint for.
- **Alternatives**: CSS Modules only (more boilerplate, harder to keep consistent), and
  Tailwind v3 JS config (v4 is current, and CSS variables map natively).
- **Special colours**: the dashboard banners use `#C2570C` (orange). The design's
  expense-category colours are out of scope. Add `--banner-orange: #C2570C` to
  `tokens.css` as the one named non-DS token.

## R3. Font

- **Decision**: `next/font/local` with `design/design-system/assets/fonts/Inter-latin.woff2`
  and `Inter-latin-ext.woff2`, both copied to `src/app/fonts/`, as a variable font with
  weight 400–700. Bind it to `--font-sans`.
- **Rationale**: self-hosted, the same files as the design, and no layout shift.

## R4. Icons

- **Decision**: `lucide-react`, rendered with `strokeWidth={1.5}` through a single `Icon`
  wrapper that maps the design's icon names (`house`, `package`, `boxes`, `shopping-cart`,
  `users`, `truck`, `store`, `calculator`, `wallet`, `banknote`, `landmark`,
  `chart-column`, `sliders-horizontal`, `calendar`, `mail`, `folder`, `circle-help`,
  `settings`, `file-text`, `refresh-cw`, `receipt`, `circle-alert`, `user`) to components.
- **Rationale**: the design system substitutes Lucide, and a name map keeps registry data
  verbatim.

## R5. Client state store

- **Decision**: Zustand 5, as one store split into slices (`session`, `catalog`, `stock`,
  `sales`, `customers`, `ui`). Each slice is seeded from fixtures by a pure
  `createSeed()` function. The store lives in `src/data/store/` and is created once per
  browser tab in a client provider.
- **Rationale**: cross-module writes (a sale reduces stock, a credit note returns stock) need
  one shared state, and Zustand selectors avoid re-rendering the whole tree. It is small,
  with no boilerplate.
- **Alternatives**: React Context + `useReducer` (re-render fan-out across about 20 screens
  and verbose cross-slice updates) and Redux Toolkit (heavier than needed).

## R6. Data-access seam (Principle II)

- **Decision**: UI code imports only from `@/data`, which exposes:
  - **Read hooks** (`useProducts()`, `useStockLevels(filter)`, `useSales(tab)`, …) backed by
    store selectors.
  - **Async command functions** (`recordSale(input): Promise<Result<Sale>>`,
    `createTransfer(...)`, …) that validate, mutate the store, and resolve with a
    success or error result carrying the design's message text.
  - **Static read functions** for fixed figures (`getDashboard()`, `getSalesOverview()`,
    `getProductsOverview()`, `getStockOverview()`), returned as `Promise`s and consumed in
    Server Components where possible.

  Fixtures in `src/data/fixtures/` are imported only by `src/data/store/seed.ts` and the
  static read functions. ESLint `no-restricted-imports` blocks
  `@/data/fixtures/*` outside `src/data/`.
- **Rationale**: real APIs can later replace the command and read bodies (e.g. with fetch +
  TanStack Query) without changing component call sites.
- **Contract**: see `contracts/data-access.md`.

## R7. Routing and module registry (Principle V)

- **Decision**:
  - `src/config/modules.ts` is a typed port of `UZ_MODS` (id, section, icon, name, subtitle,
    tabs[], and per tab a screen kind and seed reference) plus a URL slug map:
    `home→dashboard`, `prod→products`, `inv→stock`, `sales→sales`, `cust→customers`. The
    other modules slug from their names (`buy→purchases`, `vend→suppliers`,
    `fin→accounts`, `exp→expenses`, `rcv→receivables`, `pay→payables`, `rep→reports`,
    `ppl→team`, `perm→permissions`, `cal→calendar`, `comm→messages`, `docs→file-manager`,
    `sup→help`, `prof→profile`, `set→settings`).
  - Tab slugs are kebab-case of the tab title (`All sales→all-sales`,
    `Refunds (credit notes)→refunds-credit-notes`).
  - Routes: `/login`, `/[module]` (redirects to the first visible tab), and
    `/[module]/[tab]`. Dashboard uses `/dashboard`. `generateStaticParams` comes from the
    registry, and unknown slugs return `notFound()`.
  - Forms open as drawers or modals controlled by an `?action=` search param (`new`,
    `invoice`, `stock`, `transfer`, `waste`, `credit`, the same keys as the design's
    quick-task 6th element) or `?view=<ref>` for record views. This makes quick tasks
    and deep links work.
- **Role filtering**: `src/config/roles.ts` ports `UZ_ROLES` verbatim. Visible modules are
  `role.mods ?? all`, and visible tabs are `role.tabs?.[moduleId] ?? module.tabs`. Owner has
  no restriction (as in the design). A client `RouteGuard` in the `(app)` layout redirects
  hidden routes to `/dashboard`, and signed-out visitors to `/login`.

## R8. Login and session: follow the design (spec correction needed)

- **Design facts** (from the canvas logic, `lg` block):
  - Validates: empty email/phone → "Enter your email or phone number."; empty password →
    "Enter your password."; bad format → "That doesn't look like an email or phone
    number."; password shorter than 6 → "Wrong email or password. Check them and try
    again."
  - The role is chosen from the email prefix matching a role's first name (`mary…` →
    Accountant, `jane…` → Cashier, `grant…` → Store keeper), otherwise Owner.
  - A 600 ms "Logging in…" state, then the toast "Welcome back, {first}.".
  - "Remember me" (default on) stores `{role}` under `uzAuth` in **localStorage**. Off means
    the session lasts only until reload.
  - The role is also switchable from a role select in the shell (`roleOptions`/`onRole`),
    which navigates to the dashboard. "Sign out" in the user menu clears `uzAuth` and
    returns to login.
  - Collapsed sidebar sections persist under `uzNavClosed` (localStorage).
- **Decision**: implement exactly the design's behaviour (Principle I is non-negotiable).
  This refines the spec in two places that must be corrected before `/speckit-tasks`:
  1. FR-001 "accept any input" → "validate as the design does; any well-formed email/phone
     with a 6+ character password is accepted".
  2. FR-004a / Clarification Q4 "remember for the browser tab" → "remember the role in
     browser storage when 'Remember me' is ticked (the design default), so reloads and new
     tabs stay signed in; unticked lasts until reload".
- **Constitution**: Principle III currently allows a UI convenience "in memory only". This
  needs a MINOR amendment (v1.1.0) to allow browser storage for the signed-in role and
  sidebar collapse state, with business data still never persisted. Recorded in the plan's
  Complexity Tracking.

## R9. Headline figures vs derived figures (spec FR-005 nuance)

- **Design facts**: most headline numbers are literals in `UZ_HOME`, `UZ_SALES`,
  `UZ_PRODUCTS` and `UZ_STOCK`. Two dashboard items are **derived from the Invoices list**
  in the design: the "Pending invoices" KPI (count of invoices not Paid → `2`) and the
  "Invoice analytics" panel (count and amount per status).
- **Decision**: per Clarification Q3, headline banners, KPIs and charts stay fixed. The
  "Pending invoices" KPI and Invoice analytics are computed **once from the seed invoice
  list** (giving the design's values `2`, `1 · KES 1,026` and so on) and then frozen.
  "Recent activity" panels (the dashboard's Sale/Purchase tabs) read from the live lists,
  because they are lists.
- **Rationale**: it matches the design's first render exactly and honours Q3.

## R10. Charts

- **Decision**: hand-written SVG chart components (`BarChart` grouped,
  `LineChart`, `AreaChart`, `HBarList`, `ProgressBar`) driven by the design's data
  shapes (`{l, a, b, max, aName, bName}` and `rows` with `max`/`step`). No chart library.
- **Rationale**: there are few chart types with fixed data, and an exact visual match is
  easier with custom SVG. It also avoids an extra dependency (Principle VI).
- **Alternatives**: Recharts (about 100 KB; styling it to match the flat design costs about
  as much as writing the SVG).

## R11. Stock model granularity

- **Design facts**: on-hand levels (`UZ_STOCK.lines`) are per **product + store**, while
  movements (`UZ_STOCK.moves`) record a **variant**. Transfers reference
  `"Product · Variant"` keys.
- **Decision**: keep both as designed. `StockLevel` is keyed by `(productName, store)`.
  `StockMovement` carries a variant. Sales, transfers, wastage and credit-note returns
  change the product-level quantity and log a variant-level movement.

## R12. Demo "today", IDs and number formats

- **Decision**:
  - `DEMO_TODAY = 2026-11-01`, matching the design's form defaults (`qDate`, `trDate`) and
    void date "1 Nov 2026". It lives in one place: `src/lib/demo-clock.ts`.
  - New references use the design's `nextRef` rule: highest numeric suffix in the list + 1,
    zero-padded with the same prefix and width (`INV-0363`, `TRF-0033`, `WST-0009`,
    `VOID-0002`, `CRN-0008`, `Q-001003`, `SAL-001183`).
  - Formatting helpers in `src/lib/format.ts`: `kesCompact` ("KES 4.82M", "KES 184K"),
    `kes` ("KES 45,600.00"), `num` ("45,600"), `date` ("12 Nov 2026"). All use
    `en-KE`-style grouping and tabular numerals.
- **VAT**: 16% (design label "VAT 16%"). Products in `UZ_NONTAX` (Bike Pump) are zero-rated.
  Line VAT is computed per line and rounded to 2 dp.

## R13. Testing (constitution quality gates)

- **Decision**:
  - Playwright smoke suite `tests/smoke/navigation.spec.ts`. For each of the 4 roles, log in
    (role chosen by email prefix), visit every visible module/tab route in scope, assert the
    heading renders, and assert no `console.error` or page errors. Out-of-scope modules
    assert the placeholder text.
  - `tests/smoke/flows.spec.ts`: open every in-scope form via `?action=` / buttons, submit a
    valid entry, and assert the toast text.
  - Vitest unit tests (optional per constitution) only for `format.ts`, `nextRef`, VAT and
    totals maths, and role visibility.
- **Rationale**: this meets the constitution's light testing bar, and the role × route
  matrix is where regressions are likeliest.

## R14. Out-of-scope modules (Clarification Q1)

- **Decision**: one `ModulePlaceholder` screen renders `PageHeader` with the module name and
  subtitle from the registry, plus the line "Not built yet in this prototype.". Sidebar
  entries stay. Quick tasks and attention items that target these modules land on it.
- **Design deviation**: yes. It is recorded in plan.md under "Design deviations".

## Addendum (implementation, 2026-11-12)

- **R1a. `cacheComponents` off.** The Next 16.4 scaffold enables Cache Components + Partial
  Prefetching. With it on, previously visited routes stay mounted as hidden `<Activity>` trees
  (drawers and forms would persist across navigation, and the smoke tests would see duplicate
  headings), and prerendering adds Suspense rules this client-only demo does not need. It is off in
  `next.config.ts` (Principle VI). Pages still wrap search-param consumers in `<Suspense>`.
- **R12a. Demo date is 10 Nov 2026.** The design records new sales on `2026-11-10` and the latest
  seed movement is 9 Nov 2026, so `DEMO_TODAY = 2026-11-10` (not 1 Nov).
- **R15. Export CSV copies to the clipboard.** The design's `exportCsv` writes CSV to the
  clipboard and toasts "Copied {n} rows as CSV." / "Copy is not available here."; FR-026a and T032
  were corrected to match.
- **R16. Header search.** In the canvas the header search box has no handler. Per the spec
  assumption it shares the list search ("Search this list") value, so typing in either filters the
  current tab's table.
- **R17. "Keep me logged in".** The design's checkbox label is "Keep me logged in" (the spec's
  "Remember me" refers to this control).
- **R12b. Reference numbers follow each list.** New invoices continue from the highest number in
  the Invoices list (INV-0356), and quotations from Q-001003, exactly as the design's `nextRef` does;
  the earlier "INV-0363" floor was dropped.
- **R18. VAT on new sales.** The design's sale form charges 16% on the whole subtotal; this build
  charges VAT only on taxable lines (Bike Pump is zero-rated per `UZ_NONTAX`), following R12 and the
  quickstart. Overselling is blocked (spec FR-018) with "Only N {product} left at {store}.", which
  the design does not have.
