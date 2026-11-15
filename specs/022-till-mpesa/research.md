# Research: The till uses the saved M-Pesa set-up

## R1. What counts as usable

**Decision**: saved and tested. Registered payment URLs are not required.
**Why**: a request needs working credentials; the URLs are for payments the customer starts themselves.

## R2. Order when several set-ups apply

**Decision**: terminal's own Daraja, terminal's own bank, business-wide Daraja, business-wide bank; untested ones are skipped.
**Why**: matches "Terminals without their own credentials use the business-wide ones" on the Integrations form. Daraja first because it is the business's own Paybill or Till.

## R3. When nothing is usable

**Decision**: hide the phone field and "Send request", keep the code field, and explain.
**Why**: a disabled button gives no reason, and the cashier can still take the payment by typing the code. The cashier usually cannot open Integrations, so the note points to an owner and has no link.
