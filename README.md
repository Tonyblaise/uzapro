# UzaPro

A clickable prototype of the Uzapoint ERP for small businesses: products, stock, sales, point of
sale, purchasing, money and office tools in one app. It is a front-end demo. Every screen comes
from the Claude Design canvas, all data is hardcoded, and a page reload resets everything.

Live demo: <https://uza.buildwithblaise.com>

## Signing in

Log in as the demo Owner:

| Email | Password |
|---|---|
| `demo@uzapro.com` | `demo@123` |

To see the app as another role, open the account menu and choose **View as**. There are four roles:
Owner, Accountant, Cashier and Store keeper. Each role sees only the modules and tabs its
permissions allow.

The login is a demo gate, not real security. Credentials are checked in the browser and nothing is
sent anywhere.

## What's in it

| Group | Modules |
|---|---|
| Overview | Dashboard, Products, Stock |
| Sales | Sales, Point of sale, Customers |
| Procurement | Purchases, Suppliers |
| Financials | Accounts, Expenses, Receivables, Payables, Reports |
| People | Team, Permissions |
| Office | Calendar, Messages, File Manager, Help |
| Account | Profile, Settings |

Uza AI, the in-app assistant, is also included.

Each module was built as a separate feature. Its spec, plan and tasks are in `specs/`:

| Spec | Feature |
|---|---|
| `001-dashboard-sales-stock` | Dashboard, products, stock, sales and customers |
| `002-purchases-suppliers` | Purchases and suppliers |
| `003-receivables-payables` | Receivables and payables |
| `004-accounts-expenses` | Accounts and expenses |
| `005-office-people-settings` | Team, permissions, calendar, messages, files, profile and settings |
| `006-help-centre` | Help centre (replaced by 007) |
| `007-help-center-articles` | Documentation-style Help Center |
| `008-uza-ai` | Uza AI |
| `009-run-reports` | Running individual reports |
| `010-point-of-sale` | Point of sale |
| `011-modular-permissions` | Modular role permissions with Read, Write and Delete switches |

## How it works

- **Design is the source of truth.** `design/` holds a read-only copy of the canvas
  (`design/canvas/Uzapoint ERP.dc.html`), its data (`erp-data.js`) and the Uzapoint design system.
  Screens, copy and figures follow it exactly. See `design/README.md`.
- **Data goes through one layer.** Fixtures in `src/data/fixtures/` are copied verbatim from the
  design. UI code reads them only through the query and command functions in `src/data/`, so real
  APIs can replace them later without changing the UI.
- **Changes live in memory.** Forms and actions update a Zustand store (`src/data/store/`) seeded
  from the fixtures. No business data is saved. The browser stores only two things: the
  remembered role (`uzAuth`) and which sidebar sections are collapsed (`uzNavClosed`).
- **Modules come from config.** `src/config/modules.ts` defines every module and tab, and
  `src/config/roles.ts` defines the roles. Routes follow the pattern `/[module]/[tab]`, and each
  module's screens are in its own folder under `src/features/<module>/`.
- **The demo date is fixed.** "Today" is always 10 Nov 2026 (`src/lib/demo-clock.ts`) so the
  seeded figures always match.

The rules behind these decisions are in `.specify/memory/constitution.md`.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript in strict mode
- Tailwind CSS 4 using the Uzapoint design tokens, with Inter self-hosted
- Zustand for client state and `lucide-react` for icons
- Vitest for unit tests and Playwright for smoke tests
- Cloudflare Workers to host the static export

## Getting started

You need Node.js 22 or later and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and sign in with the demo credentials above.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Make a production build and serve it |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run lint` | Run ESLint |
| `npm run test:unit` | Run the Vitest unit tests in `tests/unit/` |
| `npm run test:smoke` | Build, start on port 3100 and run the Playwright tests in `tests/smoke/` |
| `npm run build:static` | Build a static export into `out/` |
| `npm run preview:worker` | Build the static export and serve it with `wrangler dev` |
| `npm run deploy` | Build the static export and deploy it with `wrangler deploy` |

A feature counts as done when typecheck, lint, build and the smoke tests all pass, and its screens
have been checked side by side against the canvas.

## Deployment

The app is deployed as a static site. `STATIC_EXPORT=1` makes `next build` output to `out/`
(see `next.config.ts`). `wrangler.jsonc` then serves that folder from a Cloudflare Worker on
`uza.buildwithblaise.com`. Run `npm run deploy` with Wrangler logged in to your Cloudflare account.

## Contributing

New features use the Spec Kit flow, which writes each feature's documents to `specs/NNN-name/`:

1. `/speckit-specify`
2. `/speckit-clarify` (if needed)
3. `/speckit-plan`
4. `/speckit-tasks`
5. `/speckit-implement`

Every plan must include a Constitution Check.

## Licence

Copyright (c) 2026 Tony Blaise. All rights reserved. You may not use, copy or distribute this
code without written permission. See [LICENSE](LICENSE).
