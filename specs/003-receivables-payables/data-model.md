# Data Model: Receivables and Payables

**Feature**: `003-receivables-payables` | **Date**: 2026-11-12

New store slice `money` (seeded verbatim from `UZ_MODS` › rcv / pay, `UZ_RCVDETAIL`,
`UZ_PAYDETAIL`, `UZ_PLANDETAIL`, `UZ_SCDETAIL` in `src/data/fixtures/money.ts`). Types go in
`src/data/types/money.ts`. Helpers (`balance`, `rcvStatus`, `payStatus`, `ageBucket`) go in
`src/data/money.ts`. Demo today: 2026-11-10.

## Receivable [`rcv › Receivables` + `UZ_RCVDETAIL`]
| Field | Type | Rules |
|---|---|---|
| `ref` | `RCV-####` | `nextRef` |
| `customer` | string | |
| `type` | "Invoice" \| "Sale on credit" \| "Opening balance" | |
| `doc` | string | INV-…, SAL-… or "—" |
| `raised`, `due` | ISO | |
| `priority` | "High" \| "Normal" \| "Low" | High shows a danger pill, Low a neutral one |
| `total`, `paid` | number | |
| `voided` | boolean | FR-016b |
| *balance* | derived | `voided ? 0 : max(0, total − paid)` |
| *status* | derived | Voided → Paid → Overdue (due < today) → Part paid → Unpaid |

## Payable [`pay › Payables`]
Same as Receivable plus `supplier` (instead of customer), `branch`, `type` ("Purchase order" |
"Goods received" | "Bill" | "Opening balance") and `approval` (Waiting approval | Approved |
Rejected). Only Approved payables can be paid. Rejected payables are excluded from ageing.

## Payment (customer `PAY-####`, supplier `VPMT-####`)
`ref`, `date` (ISO), `party`, `alloc: Record<ref, number>`, `method`, `account` ("" for credit),
`payRef`, `type` (Single | Bulk | Instalment), `amount`, `plan?`, and `verification` (Verified |
Pending | Unverified).
- Σ alloc = amount ≤ Σ selected balances. With credit, amount ≤ the party's usable credit.
- Saving adds `alloc[ref]` to each target's `paid`. Invoice receivables also update the Sales
  invoice's `paid` and status (FR-016).
- Verify: verification becomes Verified ("{ref} verified.").

## Payment plan (customer `PLN-####`, supplier `PPL-####`)
`ref`, `party`, `target` (RCV/PYB ref), `total` (balance when created), `count`,
`each = ceil(total / count)`, `freq` (as the design's frequency list), `start`, `paid` (number of
Instalment payments with this plan), `status` (Active | Completed | Cancelled). *next due* is
derived from start + paid steps.

```text
 create ─► Active ──instalment(s)──► Completed (target balance 0)
             └──Cancel plan──► Cancelled
```

## Credit (customer `CRD-####`, supplier `SCR-####`)
`ref`, `party`, `reason` (customer: "{reason}: {why}"; supplier: source), `issued`, `amount`,
`used`, `expires?`, `notes`, `currency` (KES), `voided`. *left* = amount − used; usable when left > 0,
not voided and not expired.

```text
 issue ─► Active ──used fully──► Used up (left 0)   Active ──Void credit──► Voided
```
(Status pills come from the design list rendering: Available / Part used / Used up / Expired /
Voided.)

## Statement / ageing (derived, not stored)
Per party: `[open count, not yet due, 1–30, 31–60, 61–90, over 90, total]`, using days late =
floor((today − due) / 1 day) on open, non-voided receivables or non-rejected payables. The
statement also filters by `from`/`to` (raised date) and customer.

## Changes to existing slices
- `purchases.pybNo` is removed. Payables numbering uses `nextRef` on `money.payables`.
- The module-level `rcvNo` counter in `commands/sales.ts` is removed. Receivables numbering uses
  `nextRef` on `money.receivables`.
- `Invoice.paid` is updated by payments, and invoice status becomes Paid when settled.
