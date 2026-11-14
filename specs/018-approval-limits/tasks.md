# Tasks: Approval rights and discount limits

- [X] T001 Add `RoleApprovals` and `PermissionsState.approvals` to `src/data/types/permissions.ts`; create `src/data/approvals.ts`; seed in `seedPermissions`.
- [X] T002 [US1] Carry approvals through `saveRoleAccess`, `addRole`, `duplicateRole` and `deleteRole` in `src/data/commands/permissions.ts`; add `useRoleApprovals` and `useMyApprovals` to `src/data/queries.ts`; export from `src/data/index.ts`.
- [X] T003 [US1] Create `src/features/permissions/ApprovalsSection.tsx` and use it in `EditRoleDialog.tsx`.
- [X] T004 [US2] Switch `canApproveCredit` in `src/data/creditGate.ts` to the credit right.
- [X] T005 [US2] Enforce the counts right in `src/data/commands/counts.ts` and use it in `src/features/stock/CountView.tsx`.
- [X] T006 [US2] Enforce the dispatch right in `src/data/commands/orders.ts`; use it in `src/features/sales/{OrderView,OrderLists,DeliveryView}.tsx`; drop `dispatch` and `deliver` from `STEP_NEED` in `src/components/shell/ModuleScreen.tsx`.
- [X] T007 [US3] Check discounts in `src/data/commands/sales.ts` and `src/data/commands/pos.ts`.
- [X] T008 [P] Write `tests/unit/approvals.test.ts`; update the existing tests that change (research R4).
- [X] T009 [P] Write `tests/smoke/approvals.spec.ts`.
- [X] T010 [P] Add the Help Center article; update counts in existing tests.
- [X] T011 Run the gates and fix what fails.
- [ ] T012 Walk through quickstart.md in the browser. (Not done by hand; the flows are covered by `approvals.spec.ts`.)
