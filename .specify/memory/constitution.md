<!--
Sync Impact Report
- Version change: 1.0.1 → 1.1.0 (MINOR: Principle III materially expanded)
- Modified principles: III. Ephemeral In-Memory Interactivity. Business data is still never
  persisted. The signed-in role (`uzAuth`) and sidebar collapse state (`uzNavClosed`) may now
  be kept in browser storage, matching the design's "Remember me" behaviour. Storage access
  must be guarded.
- Reason: feature 001 plan (research R8). The design persists these two keys, and Principle I
  makes the design the source of truth.
- Templates: no changes required.
- Follow-up: specs/001-dashboard-sales-stock/spec.md FR-004a still says "browser tab" and should
  be aligned with this principle.
- Previous (1.0.1): 1.0.0 → 1.0.1 (PATCH: points Principles I, II and IV at the in-repo copy of
  the design under `design/`; no change in meaning)
- Previous (1.0.0): (template, unversioned) → 1.0.0
- Modified principles (template placeholder → new title):
  - [PRINCIPLE_1_NAME] → I. Design Fidelity (NON-NEGOTIABLE)
  - [PRINCIPLE_2_NAME] → II. Hardcoded Demo Data Behind a Data-Access Seam
  - [PRINCIPLE_3_NAME] → III. Ephemeral In-Memory Interactivity
  - [PRINCIPLE_4_NAME] → IV. Design-System Tokens & Accessibility
  - [PRINCIPLE_5_NAME] → V. Component-Driven, Config-Driven Modules
- Added principles: VI. Simplicity & Type Safety
- Added sections: Technology Constraints; Development Workflow & Quality Gates
- Removed sections: none
- Templates reviewed (not modified by this command; they read the constitution at runtime):
  - .specify/templates/plan-template.md ✅ (has a generic "Constitution Check" gate)
  - .specify/templates/spec-template.md ✅
  - .specify/templates/tasks-template.md ✅
- Follow-up TODOs: none
-->

# UzaPro Constitution

UzaPro is a clickable demo prototype of the Uzapoint ERP for small Kenyan businesses
(demo tenant: "Build by Blaise", Nairobi HQ, currency KES). It is a faithful rebuild of the
Claude Design canvas "Uzapoint ERP dashboard rebuild"
(https://claude.ai/artifact/KKMZcTUgzkopE2izUei3TS), using hardcoded data only.
Real backend features will be added later.

## Core Principles

### I. Design Fidelity (NON-NEGOTIABLE)

- The Claude Design canvas (page `Uzapoint ERP.dc.html`, data `erp-data.js`, design system
  `uzapoint-design-system`) is the single source of truth for layout, copy, figures,
  navigation, and flows. A read-only copy lives in the repo under `design/` (see
  `design/README.md`). Work from that copy, and re-copy it when the canvas changes.
- Every module, tab, table column, KPI, chart, form field, modal, drawer, toast, and empty
  state MUST match the canvas in structure, wording, and values.
- Screens or controls that do not exist in the canvas MUST NOT be added. Any intentional
  deviation (e.g. a technical constraint) MUST be recorded in the feature spec under a
  "Design deviations" heading, with the reason.
- Each feature is accepted only after a side-by-side visual check against the canvas.

Rationale: the prototype exists to demo the design. Drift makes the demo untrustworthy.

### II. Hardcoded Demo Data Behind a Data-Access Seam

- All data MUST come from typed fixtures ported verbatim from `design/canvas/erp-data.js`
  (`UZ_MODS`, `UZ_HOME`, `UZ_ROLES`, `UZ_PRODUCTS`, `UZ_LEDGER`, etc.) into
  `src/data/fixtures/`. Values, names, IDs, dates, and amounts MUST NOT be invented or altered.
- UI code MUST read and write data only through a repository/service layer in `src/data/`
  that exposes async-shaped functions (e.g. `getInvoices(): Promise<Invoice[]>`).
  Components and pages MUST NOT import fixtures directly.
- No network calls, databases, auth providers, or third-party APIs are allowed in this phase.

Rationale: real features come later. A single seam lets fixtures be swapped for real
APIs without rewriting the UI.

### III. Ephemeral In-Memory Interactivity

- Every form, modal, and action in the canvas MUST work: open, validate, submit, and
  confirm with a toast using the canvas wording (e.g. "Sale recorded. KES 1,234.00 paid by
  M-Pesa.").
- Mutations (create, edit, void, approve, transfer, pay, etc.) MUST update an in-memory
  client store seeded from the fixtures. Affected tables, pills, and KPIs MUST update where the
  canvas shows that.
- Business data MUST NOT persist: a full reload restores the seed data. localStorage,
  sessionStorage, cookies, and IndexedDB MUST NOT store business data (products, stock,
  sales, customers, documents, or any record a form creates or changes).
- Per-viewer UI conveniences that the design itself persists MAY be kept in browser storage:
  the signed-in role (`uzAuth`, written only when "Remember me" is ticked) and the sidebar
  sections' collapsed state (`uzNavClosed`). Any other key requires an amendment. All access
  to storage MUST be wrapped in try/catch, and the app MUST work correctly when storage is
  empty or unavailable.

Rationale: a demo has to feel alive and also reset predictably for every audience.

### IV. Design-System Tokens & Accessibility

- Styling MUST use the Uzapoint design tokens (colors, typography, spacing, radii, shadows,
  motion) exposed as CSS custom properties and mapped into the Tailwind theme. Raw hex values
  or ad-hoc sizes outside the token set MUST NOT appear in components. Tokens are ported from
  `design/design-system/tokens/`. Special colors the
  canvas uses, such as the dashboard banner tones, MUST be defined once as named tokens.
- Typeface: Inter only (weights 400–700), self-hosted via `next/font`. Icons: Lucide only, as
  line icons with a 1.5px stroke.
- Content rules from the design system MUST be followed: sentence case; "KES 45,600.00"
  in tables and "KES 4.82M" in KPIs; dates like "12 Nov 2026"; prefixed IDs (`INV-0358`);
  tabular numerals for figures; no emoji, exclamation marks, or superlatives.
- Accessibility: use real `<button>`, `<a href>`, and `<label>`/`<input>` elements; give every
  icon-only control an `aria-label`; keep text contrast at 4.5:1 or above; show a visible
  2px green-600 focus ring; make modals and drawers trap focus and close on Escape.

Rationale: tokens keep fidelity cheap to maintain, and accessibility is part of the design.

### V. Component-Driven, Config-Driven Modules

- Shared primitives MUST mirror the design-system inventory (Button, IconButton, Icon, Logo,
  Card, KpiCard, Delta, StatusPill, DataTable, Input/Field, Select, Checkbox, Sidebar, NavItem,
  AppHeader, UserChip, PageHeader, Tabs, Menu, Modal, Drawer, Toast). They live in
  `src/components/ui/` and are reused instead of re-implemented per module.
- Modules and tabs MUST be driven by a typed registry ported from `UZ_MODS`. Visibility is
  filtered by the active role's whitelist from `UZ_ROLES` (Owner, Accountant, Cashier,
  Store keeper).
- Routing uses the App Router with one route segment per module and tab
  (`/[module]/[tab]`). Deep links MUST work, and a role that cannot see a module or tab is
  redirected to its dashboard.
- Each module is a self-contained feature folder (`src/features/<module>/`) that depends
  only on `src/components/`, `src/data/`, and `src/lib/`. Modules MUST NOT import from each
  other's internals.

Rationale: the canvas defines about 20 modules and about 70 tabs built from a few screen
kinds. Building them from config and shared parts keeps the work tractable.

### VI. Simplicity & Type Safety

- TypeScript `strict` mode is mandatory. Data models MUST NOT use `any`. Fixtures MUST
  satisfy their domain types.
- Server Components are the default. `"use client"` is added only where state, effects, or
  browser events are needed.
- New runtime dependencies MUST be justified in the feature plan. Prefer the platform and
  the approved stack over extra libraries.
- YAGNI: do not build the real-backend abstractions (auth, caching, API clients) beyond
  the data-access seam until a feature requires them.

Rationale: a small, typed codebase is the fastest path to a demo that can later grow into
a product.

## Technology Constraints

- Framework: Next.js (App Router, latest stable) with React and TypeScript (strict).
- Styling: Tailwind CSS mapped to Uzapoint design tokens. Fonts: Inter via `next/font`.
- Icons: `lucide-react`.
- Client state: Zustand or React Context for the in-memory store and session (role).
  Pick one in the first plan and use it everywhere after that.
- Charts: lightweight SVG components or a single justified chart library, styled to match
  the canvas (bars, lines, area variants).
- Auth: fake only. The login, forgot-password, and "sent" views accept any input and lead
  to role selection. No credentials are validated or stored.
- Layout: a 240px sidebar and 64px header shell, responsive down to phone width as in the
  canvas.
- Tooling: ESLint (Next config), Playwright for smoke tests, and npm as the package manager
  unless a plan justifies otherwise.
- Hosting: any static or Node host. Vercel is the expected target but deployment is not
  required.

## Development Workflow & Quality Gates

- Work follows the Spec Kit flow: `/speckit-specify` → `/speckit-clarify` (when needed) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. One feature covers one coherent
  slice (e.g. app shell + login + roles + dashboard; then module groups: Products & Stock;
  Sales & Customers; Procurement; Financials; People; Office; Account & Settings).
- Every plan MUST include a Constitution Check against Principles I–VI and list any
  justified exceptions.
- Required gates before a feature is considered done:
  1. `tsc --noEmit` passes with zero errors.
  2. `eslint` passes with zero errors.
  3. `next build` succeeds.
  4. The Playwright smoke suite passes. For each role, every visible module and tab renders
     without console errors, and each implemented form opens and submits to a toast.
  5. A visual review against the canvas for every screen in the feature.
- Full TDD is not required. Unit tests are optional and reserved for non-trivial logic
  (e.g. money formatting, role filtering, store reducers).

## Governance

- This constitution supersedes all other project practices. Where a spec, plan, or task
  conflicts with it, the constitution wins until it is amended.
- Amendments are made via `/speckit-constitution`. Each amendment MUST update the Sync
  Impact Report and bump the version using semantic versioning:
  - MAJOR: a principle is removed or redefined in a backward-incompatible way.
  - MINOR: a principle or section is added or materially expanded.
  - PATCH: clarifications and wording fixes.
- Moving from demo to real features (e.g. replacing fixtures with APIs, adding real auth or
  persistence) REQUIRES amending Principles II and III first.
- Reviews of every feature MUST verify compliance with this document. Complexity beyond it
  MUST be justified in the plan's Complexity Tracking section.

**Version**: 1.1.0 | **Ratified**: 2026-11-12 | **Last Amended**: 2026-11-12
