# Tasks

- [X] T001 Add `DeliveryReturn`, `DeliveryNote.returns` and `NewOrder.convertedFrom` to `src/data/types/orders.ts`; add `returns: []` to the seed note in `src/data/fixtures/orders.ts`.
- [X] T002 [P] Add `DELIVERY_RETURN_REASONS`, `orderLinesFromQuote`, `returnedQty`, `returnable` and `checkReturn` to `src/data/orders.ts`.
- [X] T003 [US1] Make `createOrder` stamp the quotation when `convertedFrom` is set, in `src/data/commands/orders.ts`.
- [X] T004 [US1] Give `src/features/sales/OrderForm.tsx` a `from` quotation; add "Convert to order" to `RecordView.tsx` and wire it in `DocumentLists.tsx`.
- [X] T005 [US2] Add `returnDelivery` to `src/data/commands/orders.ts`.
- [X] T006 [US2] Add "Record return", the returns list and the Returned column to `src/features/sales/DeliveryView.tsx`.
- [X] T007 [P] Extend `tests/unit/orders.test.ts` and `tests/smoke/orders.spec.ts`; extend the Help Center article.
- [X] T008 Run the gates and fix what fails.
- [ ] T009 Walk through quickstart.md in the browser. (Not done by hand; the flows are covered by `orders.spec.ts`.)
