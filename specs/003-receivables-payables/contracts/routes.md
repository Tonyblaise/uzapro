# UI Contract: Receivables and Payables routes

This extends the feature 001 and 002 route contracts. The guards and `?action=` / `?view=`
conventions are unchanged.

## Routes (now in scope)

| Path | Tabs |
|---|---|
| `/receivables` → `/receivables/receivables` | `receivables`, `payments`, `payment-plans`, `customer-credits`, `bulk-payments`, `receivables-statement` |
| `/payables` → `/payables/payables` | `payables`, `payments`, `bulk-payments`, `supplier-credits`, `supplier-ageing`, `payment-plans` |

## Search-param actions

| Param | Valid on | Opens |
|---|---|---|
| `?action=pay` (optional `&party=<name>&sel=<ref,ref>&amount=<n>&plan=<ref>&method=<m>`) | any Receivables or Payables tab | Record payment / Pay supplier form, pre-filled |
| `?action=bulk` | `…/bulk-payments` | New bulk payment |
| `?action=plan` | `…/payment-plans` | New payment plan / Create plan |
| `?action=credit` | `/receivables/customer-credits`, `/payables/supplier-credits` | Issue credit |
| `?view=<ref>` | any list | Record view (receivable, payable, payment, plan, credit) |

From Sales › Invoices, "Record payment" on an invoice opens the same customer payment form as an
overlay inside Sales (shared form from `@/features/receivables`), pre-filled with the customer and
the invoice's receivable.

## Role visibility

| Role | Receivables | Payables |
|---|---|---|
| Owner | all 6 tabs | all 6 tabs |
| Accountant | all 6 tabs | all 6 tabs |
| Cashier, Store keeper | — | — |
