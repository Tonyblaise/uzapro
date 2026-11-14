# Implementation Plan: Integrations

**Spec**: [spec.md](./spec.md) · **Date**: 2026-11-15

## Summary

A new `intg` module with three tabs (M-Pesa (Daraja), M-Pesa bank integrations, QuickBooks) backed by a new `integrations` state slice. Settings › Connected apps and Import and export are removed. No shell or routing changes: `/[module]/[tab]` builds its static params from the module registry.

## Technical Context

- **Stack**: Next.js 16.4 (static export), React 19, TypeScript 5, Tailwind 4, Zustand 5. No new dependencies.
- **Storage**: in memory only; reload restores the seed.
- **Testing**: Vitest (rules and commands), Playwright (flows, 390px layout).
- **Next.js APIs**: none added, so no version-specific guide applies.

## Constitution Check

| Principle | Result |
|---|---|
| I. Design fidelity | Deviation recorded in spec › Design deviations (new module, tabs instead of fly-out). |
| II. Data behind `src/data` | Pass. Screens import only from `@/data`. Requests are simulated. |
| III. No persisted business data | Pass. No new storage keys. Typed secrets are not kept even in memory. |
| IV. Design system | Pass. Existing tokens and primitives; one `required` prop added to Field. |
| V. Routing and structure | Pass. One feature folder, registered in `src/features/screens.ts`. |

## Project Structure

```
src/config/modules.ts                    intg module; two tabs removed from set
src/data/types/integrations.ts           types
src/data/fixtures/integrations.ts        environments, account types, banks
src/data/integrations.ts                 pure rules: validation, scope options, demo credentials
src/data/commands/integrations.ts        save / test / register
src/data/queries-integrations.ts         hooks
src/data/store/{state,seed}.ts           integrations slice
src/features/integrations/               DarajaScreen, BankScreen, shared, screens
src/features/generic/screens.tsx         two Settings tabs removed
src/components/ui/{Field,Icon}.tsx       required marker; plug and link icons
tests/unit/integrations*.test.ts
tests/smoke/integrations.spec.ts
```

## Complexity Tracking

None.
