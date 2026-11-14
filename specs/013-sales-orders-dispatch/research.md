# Research: Sales orders and dispatch

No NEEDS CLARIFICATION items. Decisions on the open design points:

## R1. Where quantities are tracked

**Decision**: each order line stores `dispatched` and `invoiced`. Status and "left" are worked out
from them. Delivery notes hold their own lines for the record.

**Rationale**: one place to check SC-003 and SC-004. Summing delivery notes on every read would
give the same answer with more code.

## R2. Order form

**Decision**: a dedicated `OrderForm`, not a fourth mode of `DocumentForm`.

**Rationale**: `DocumentForm` already switches between three kinds and carries the printed-document
layout (logo, business name, terms). An order needs none of that, and a fourth mode would put
feature 013 at risk of breaking quotations and invoices (FR-021). It reuses `usePricer`, so the
price rules stay in one place.

## R3. Invoice from an order

**Decision**: `createInvoice(input, opts?: { fromOrder: string })`. With `fromOrder`, it skips the
stock movement (goods left with the delivery note) and the credit check (done at the order), and
its `Sale` row carries no stock-returning lines on void.

**Rationale**: reuses the invoice, receivable and All sales wiring unchanged. The option is not
exported to components; only `invoiceOrder` passes it.

**Alternatives considered**: a second invoice-creating function. Rejected: two copies of the
receivable and sales-row logic.

## R4. Credit check timing

**Decision**: at order save, on the order total. Not at dispatch or at the order's invoices.

**Rationale**: the order is the commitment. Checking again at invoice time would stop a delivery
that has already left.

## R5. Stock kind for a dispatch

**Decision**: the existing `KIND.sold` ("Sold") with the DN number as the reference.

**Rationale**: stock history filters and reports already treat "Sold" as sales; a new kind would
need changes there.

## R6. Voiding an invoice raised from an order

**Decision**: voiding closes the receivable as today and returns no stock (the `Sale` row is not
marked as a session sale with stock). The order's invoiced quantities are not rolled back.

**Rationale**: goods stay delivered. Recorded as a known limit; returns go through credit notes.
