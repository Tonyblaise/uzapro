# Implementation Plan: Approval rights and discount limits

**Branch**: `018-approval-limits` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

`permissions.approvals` holds one `RoleApprovals` per role. `src/data/approvals.ts` (pure) seeds
them, reads them for the signed-in role and checks a discount. The three existing gates switch to
it: `canApproveCredit` (creditGate), the count commands, and the dispatch commands. Discounts are
checked in `createQuotation`, `createInvoice`, `updateDocument` and `completePosSale`. The Edit
role dialog gains an Approvals section and `saveRoleAccess` takes the approvals with the access.

## Technical Context

TypeScript strict, no new dependencies, in memory only. Tests: Vitest `tests/unit/approvals.test.ts`;
Playwright `tests/smoke/approvals.spec.ts`; existing tests for the three gates stay green on the
seed (SC-001). Read the Next.js guide in `node_modules/next/dist/docs/` before touching routing.

## Constitution Check

| Principle | Status |
|---|---|
| I. Design fidelity | ✅ with recorded deviations (3 rows) |
| II. Data seam | ✅ new seed recorded; components use `@/data` |
| III. Ephemeral | ✅ |
| IV. Tokens and accessibility | ✅ toggle buttons with `aria-pressed`, like the access rows |
| V. Config-driven modules | ✅ no new tabs |
| VI. Simplicity and types | ✅ one pure module; three gates each change in one place |

## Project Structure

```text
src/data/types/permissions.ts         # RoleApprovals; PermissionsState.approvals
src/data/approvals.ts                 # seed, lookup, discount check (new)
src/data/permissions.ts               # seedPermissions includes approvals
src/data/commands/permissions.ts      # save, add, duplicate, delete carry approvals
src/data/creditGate.ts                # canApproveCredit → approvals.credit
src/data/commands/{counts,orders,sales,pos}.ts  # enforce
src/data/queries.ts                   # useRoleApprovals, useMyApprovals
src/components/shell/ModuleScreen.tsx # dispatch/deliver steps no longer need Write
src/features/permissions/EditRoleDialog.tsx, ApprovalsSection.tsx
src/features/{stock/CountView,sales/OrderView,sales/OrderLists,sales/DeliveryView}.tsx
tests/unit/approvals.test.ts, tests/smoke/approvals.spec.ts
```

## Complexity Tracking

No constitution violations to justify.
