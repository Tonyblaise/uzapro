# Tasks: Integrations

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [x] T001 Add `"intg"` to `ModuleId` (`src/data/types/common.ts`)
- [x] T002 Add the Integrations module and remove two tabs from Settings (`src/config/modules.ts`)
- [x] T003 [P] Add `plug` and `link` icons (`src/components/ui/Icon.tsx`)
- [x] T004 [P] Add `required` to Field, Input and Select (`src/components/ui/Field.tsx`)
- [x] T005 Types, fixtures and the state slice (`src/data/types/integrations.ts`, `fixtures/integrations.ts`, `store/state.ts`, `store/seed.ts`)
- [x] T006 Remove Settings › Connected apps and Import and export (`src/features/generic/screens.tsx`, `src/data/fixtures/generic.ts`, `src/features/screens.ts`)

## Phase 2: User Story 1 - M-Pesa (Daraja) (P1)

- [x] T007 [US1] Rules: `darajaErrors`, `scopeOptions` (`src/data/integrations.ts`)
- [x] T008 [US1] Commands: save, test, register (`src/data/commands/integrations.ts`)
- [x] T009 [US1] Hooks (`src/data/queries-integrations.ts`) and exports (`src/data/index.ts`)
- [x] T010 [US1] Shared pieces and the screen (`src/features/integrations/shared.tsx`, `DarajaScreen.tsx`)

## Phase 3: User Story 2 - Bank integrations (P2)

- [x] T011 [US2] Rules: `bankErrors`, `generateBankCredentials`
- [x] T012 [US2] Commands: `saveBankCredentials`, `testBankConnection`
- [x] T013 [US2] `BankScreen.tsx` with `CopyField`

## Phase 4: User Story 3 - Access (P2)

- [x] T014 [US3] Disable fields and hide actions without Write (both screens)

## Phase 4b: User Story 4 - QuickBooks (P2)

- [x] T018 [US4] Types, reference lists and `quickbooks` in the state slice
- [x] T019 [US4] Rules: `quickbooksErrors`, `quickbooksCounts`, `syncSummary`
- [x] T020 [US4] Commands: connect, save settings, sync, disconnect
- [x] T021 [US4] `QuickbooksScreen.tsx` and the QuickBooks tab
- [x] T022 [US4] Unit and smoke tests; 390px page list

## Phase 5: Tests

- [x] T015 [P] `tests/unit/integrations.test.ts`, `tests/unit/integrations-commands.test.ts`
- [x] T016 [P] `tests/smoke/integrations.spec.ts`
- [x] T017 Module counts 21 → 22 and moved paths in the existing unit and smoke tests

## Dependencies

Phase 1 blocks everything. US2 and US3 reuse US1's shared pieces.

## Not in this feature

API management, Third party apps, Webhooks; real Daraja, bank or QuickBooks requests; bringing data back from QuickBooks; the till reading these credentials.
