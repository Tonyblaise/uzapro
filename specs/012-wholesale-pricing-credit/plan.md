# Implementation Plan: Wholesale pricing and customer credit

**Branch**: `012-wholesale-pricing-credit` | **Date**: 2026-11-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-wholesale-pricing-credit/spec.md`

## Summary

Two additions that make the app usable by a wholesaler:

- **Group prices.** Customers belong to a customer group. Each group other than Retail has a price
  list: prices per product variant and unit, with quantity breaks. The new sale form, the
  quotation and invoice form, and the till fill in the group price for the chosen customer, and
  fall back to the standard price.
- **Credit control.** Customers get an optional credit limit and payment terms. A credit sale, an
  invoice or a till "Pay later" is stopped when the customer is on cash terms, has something
  overdue, or would go over the limit. A role with Write on Receivables can approve it with a
  reason.

**Technical approach**:

- **One new store slice, `pricing`**: `{ groups, prices }`. `Customer` gains `group`,
  `creditLimit` and `terms`. `Sale` and `Invoice` gain an optional `creditApproval`.
- **Two pure modules** hold all the rules and are unit tested:
  - `src/data/pricing.ts`: `standardPrice`, `groupPrice`, `priceFor`, entry validation.
  - `src/data/credit.ts`: `creditPosition`, `creditStop`, `termDays`.
- **Commands enforce, forms explain.** `recordSale`, `createInvoice` and `completePosSale` run
  `creditStop` themselves and refuse unless the input carries an approval and the signed-in role
  may approve (SC-003). The forms run the same check first to show the stop dialog.
- **One shared stop dialog**, `CreditStop`, in `src/features/customers/` and exported from its
  index, so Sales and Point of sale import it the same way Sales already imports `CustomerForm`.
- **Two new tabs** from the module registry: Products › Price lists and Customers › Customer
  groups, each a feature screen built from the existing DataTable, Drawer, SearchSelect and Input
  primitives.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: unchanged (Next.js 16.4.6, React 19.3, Zustand 5.1, lucide-react,
Tailwind 4). No new packages.

**Storage**: none. The `pricing` slice and the new customer fields are in memory and reload to
the seed (Principle III).

**Testing**:

- Vitest:
  - `tests/unit/pricing.test.ts`: break selection, below-first-break hint, fallback to standard
    price per unit, entry validation, and SC-002 over every seed entry.
  - `tests/unit/credit.test.ts`: balance owed, overdue, available credit, the three stop reasons
    and their order, no-limit and walk-in cases, and the two seed customers' positions.
- Playwright `tests/smoke/pricing-credit.spec.ts`: group price on a new sale and an invoice, break
  change, hand-typed price kept, over-limit stop as Cashier (no approve) and as Owner (approve
  with a reason), overdue stop, till Pay later stop, customer form fields, price list add and
  duplicate refusal, customer group add and delete refusal. `responsive.spec.ts` gains the two new
  tabs and the stop dialog at 320px.
- Existing suites must stay green without edits to their expectations (FR-027), apart from the
  Customers table columns and the ideas-list status.

**Target Platform / Project Type**: unchanged (a static-export web app)

**Performance Goals**: price lookup and credit check are instant; both are linear scans over tens
of rows.

**Constraints**:

- Read the relevant guide in `node_modules/next/dist/docs/` before touching routing or client
  component boundaries (`AGENTS.md`).
- Components read and write only through `@/data` (Principle II).
- Feature folders do not import each other's internals; cross-feature use goes through a folder's
  `index.ts` (Principle V).
- Tokens only; sentence case; "KES 45,600.00" in tables (Principle IV).
- No sideways scrolling from 320px.

**Scale/Scope**: 3 groups, 2 price lists with about 12 seed entries, 3 customers. About 10 new
files and 20 changed files.

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Design fidelity | The canvas has none of these screens. The user asked for them (approved roadmap, 2026-11-14). Every addition is listed in spec › Design deviations (8 rows). Existing screens keep their canvas copy; new copy follows the content rules. | ✅ with recorded deviations |
| II. Data seam | New seed values live in `src/data/fixtures/pricing.ts` and `fixtures/customers.ts`. They are new, not ported, and that is recorded as a deviation. Components use `@/data` hooks and commands only. | ✅ with recorded deviation |
| III. Ephemeral | In-memory slice; no storage keys; a reload restores the seed. | ✅ |
| IV. Tokens and accessibility | Existing primitives and tokens. The stop dialog is a Modal with a focus trap; warning pills use StatusPill tones. Scanned at 320 and 1440px. | ✅ |
| V. Config-driven modules | The two tabs are added to the registry. `CreditStop` is exported from `features/customers/index.ts`. | ✅ |
| VI. Simplicity and types | Two pure modules, one slice, no new dependencies, no `any`. | ✅ |

There are no unjustified violations, so Complexity Tracking is empty.

**Post-design re-check**: still ✅. The data model adds one slice, three customer fields and one
optional field on sales and invoices. The contracts keep components on `@/data`.

## Project Structure

### Documentation (this feature)

```text
specs/012-wholesale-pricing-credit/
├── spec.md
├── plan.md              # this file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── data-access.md   # pure helpers, hooks, commands
│   └── ui.md            # screens, dialog, copy
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/
├── config/modules.ts                 # + Products › Price lists, Customers › Customer groups
├── data/
│   ├── types/pricing.ts              # CustomerGroup, PriceEntry, PriceBreak, PayTerms, CreditApproval, PricingState (new)
│   ├── types/sales.ts                # Customer + group, creditLimit, terms; Sale/Invoice + creditApproval; inputs + approval
│   ├── fixtures/pricing.ts           # seed groups and price entries (new)
│   ├── fixtures/customers.ts         # + seed group, limit and terms per customer
│   ├── pricing.ts                    # pure price rules (new)
│   ├── credit.ts                     # pure credit rules (new)
│   ├── queries-pricing.ts            # hooks (new)
│   ├── commands/pricing.ts           # group and price commands (new)
│   ├── commands/customers.ts         # create/update take group, limit, terms
│   ├── commands/sales.ts             # recordSale, createInvoice: credit stop, terms-based due date, approval
│   ├── commands/pos.ts               # cart prices by customer; completePosSale credit stop
│   ├── store/{state,seed}.ts         # + pricing slice
│   ├── fixtures/uzaai.ts             # idea i3 → Done
│   ├── fixtures/helpcenter.ts        # + article
│   └── index.ts                      # exports
├── features/
│   ├── customers/                    # CustomerList (columns, pills), CustomerForm (fields, Credit section),
│   │                                 # GroupList, GroupForm, CreditStop (new), index, screens
│   ├── products/                     # PriceLists, PriceEntryForm (new), ProductRecord (group prices), screens
│   ├── sales/                        # NewSaleForm, DocumentForm (pricing, stop dialog), SaleView/RecordView (approval line)
│   └── pos/                          # Dialogs (checkout stop), Cart (price note)
tests/
├── unit/{pricing,credit}.test.ts     # new
└── smoke/pricing-credit.spec.ts      # new (+ rows in responsive.spec.ts, customers.spec.ts)
```

**Structure Decision**: keep the single Next.js app layout. One slice, two pure modules, one
shared dialog. Price lists live under Products and groups under Customers, because that is where
the Write and Delete switches that govern them already are (FR-025).

## Complexity Tracking

No constitution violations to justify.
