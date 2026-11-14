# Tasks

- [X] T001 Create `src/data/whatsapp.ts` (pure) and `tests/unit/whatsapp.test.ts`.
- [X] T002 Add `money.reminders` to state and seed; create `src/data/commands/whatsapp.ts` and `src/data/queries-whatsapp.ts`; export from `src/data/index.ts`; make "WhatsApp" and "Send reminder" Read actions in `src/data/permissions.ts`.
- [X] T003 Create `src/components/ui/WhatsAppDialog.tsx`.
- [X] T004 [US1] Add "Send reminder" to `src/features/receivables/ReceivableList.tsx`.
- [X] T005 [US2] Add "WhatsApp" to `src/features/sales/SaleView.tsx`, the invoice record (`RecordView.tsx`, `DocumentLists.tsx`) and the till receipt (`src/features/pos/Dialogs.tsx`).
- [X] T006 [P] Write `tests/smoke/whatsapp.spec.ts`; add the dialog at 320px to `tests/smoke/responsive.spec.ts`.
- [X] T007 [P] Set idea `i6` to Done; add the Help Center article; update counts in existing tests.
- [X] T008 Run the gates and fix what fails.
- [ ] T009 Walk through quickstart.md in the browser. (Partly done: the reminder dialog was checked from a screenshot; the flows are covered by `whatsapp.spec.ts`. Sending a real message from WhatsApp has not been tried.)
