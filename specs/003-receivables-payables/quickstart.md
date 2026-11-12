# Quickstart & Validation: Receivables and Payables

## Run and gates

The same commands as feature 001:

```bash
npm run dev
npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke
```

Log in as `tony@…` (Owner) or `mary@…` (Accountant). The password is any 6 or more characters.

## Manual validation scenarios

Use one session per scenario, moving with in-app links after login, because a full page load
resets the data.

1. **Seed statuses (US1/US2)**:
   - Receivables:
     - RCV-0012: balance 45,600, Overdue
     - RCV-0011: 1,026, Overdue
     - RCV-0010: 48,400, Part paid
     - RCV-0008: 32,000, Unpaid
     - RCV-0009, RCV-0007, RCV-0006: Paid
   - Payables:
     - PYB-0014: 79,560, Unpaid, Approved
     - PYB-0013: 24,200, Overdue
     - PYB-0012: 12,800, Waiting approval
     - PYB-0011, PYB-0010: Paid
2. **Collect (US1)**: on RCV-0011, choose "Record payment", then "Pay full balance", Bank
   transfer, Equity Bank — Main, and "Save payment". The toast reads "PAY-0022 saved. KES 1,026
   applied to RCV-0011.". RCV-0011 is Paid, and PAY-0022 is listed as Pending. Then "Verify" →
   "PAY-0022 verified.".
3. **Overpay block**: for Mountain Goats, tick RCV-0008 and enter 40,000. The form shows "That is
   more than the 32,000 KES selected. Lower the amount or tick more receivables." and Save is
   disabled.
4. **Pay a supplier (US2)**: approve PYB-0012 ("PYB-0012 approved for payment."), then pay it in full
   from Equity Bank — Main. VPMT-0009 is listed and PYB-0012 is Paid.
5. **Integration (US3)**:
   - Record a credit sale to Mountain Goats ("Pay later (credit)"). The toast names RCV-0013, and
     Receivables lists RCV-0013 "Sale on credit" with the sale's total.
   - Create an invoice for Morningview Bicycles. It names RCV-0014, which is listed as "Invoice".
   - Receive an unpaid purchase order (feature 002 quickstart 2–3). It names PYB-0015, which is
     listed as "Goods received", Approved.
6. **Pay from the invoice (FR-016a)**: in Sales › Invoices, open INV-0355 and choose "Record
   payment". The form opens for Blazing Cycle Trails with RCV-0011 ticked. Paying in full makes
   INV-0355 Paid with balance 0.
7. **Void (FR-016b)**: void a credit sale made in step 5. Its RCV is listed as Voided with balance 0
   and is no longer offered for payment.
8. **Plan (US4)**: "New payment plan" on RCV-0008 with 3 monthly instalments. PLN-0004 each is
   10,667, and the toast reads "PLN-0004 created for Mountain Goats.". "Record instalment" saves a
   10,667 Instalment payment, and RCV-0008's balance becomes 21,333.
9. **Credits (US4)**: "Issue credit" for Morningview Bicycles, KES 3,000. The toast reads
   "CRD-0005: KES 3,000 credit for Morningview Bicycles.". Use it to pay part of RCV-0012 with
   "Customer credit"; Left falls to 0. "Void credit" on CRD-0004 reads "CRD-0004 voided.".
10. **Ageing (US5)**: in Supplier ageing, Magaliesburg Wheels shows 24,200 in 1–30 days and
    Eastside Bicycle Supplies shows 79,560 not yet due. In the Receivables statement, "Generate
    statement" reads "Statement updated.".
11. **Roles**: the Cashier and Store keeper see neither module. The Accountant sees all 12 tabs.
