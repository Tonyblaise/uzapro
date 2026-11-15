# Tasks: The till uses the saved M-Pesa set-up

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

- [x] T001 `MpesaRoute` type (`src/data/types/integrations.ts`)
- [x] T002 [US1] [US2] `mpesaRoute`, `mpesaRouteNote` (`src/data/integrations.ts`), exported from `src/data/index.ts`
- [x] T003 [US1] `requestMpesa` refuses without a usable set-up (`src/data/commands/pos.ts`)
- [x] T004 [US2] `useTillMpesa` (`src/data/queries-integrations.ts`)
- [x] T005 [US1] [US2] Checkout dialog (`src/features/pos/Dialogs.tsx`)
- [x] T006 [P] Unit tests (`tests/unit/integrations.test.ts`, `tests/unit/integrations-commands.test.ts`)
- [x] T007 [P] Smoke test (`tests/smoke/till-mpesa.spec.ts`)
