# Data Model: Purchases and Suppliers

**Feature**: `002-purchases-suppliers` | **Date**: 2026-11-12

Shared value types (`Pill`, `Result<T>`, `Tone`), the stock slice (levels, movements) and the
`nextRef` rule come from feature 001 (`specs/001-dashboard-sales-stock/data-model.md`). Seeds are
ported verbatim from `design/canvas/erp-data.js` into `src/data/fixtures/purchases.ts` and
`src/data/fixtures/suppliers.ts`. Types go in `src/data/types/purchases.ts`.

## Suppliers slice

### Supplier [`UZ_MODS.vend.Suppliers`, `UZ_SUPDETAIL`, `UZ_NATIONS`]
| Field | Type | Rules |
|---|---|---|
| `name` | string | Required. Unique, case-insensitive ("{name} is already in the list."). |
| `type` | `"Individual" \| "Business"` | The form shows "Individual person" / "Registered business". |
| `phone`, `email`, `town` | string | Stored as "—" when empty. |
| `nation` | string | Default "Kenya". The list can grow during the session. |
| `address`, `county`, `postal` | string | Optional. |
| `status` | Pill | Active (success) or Inactive (neutral). |

Only Active suppliers appear in pickers (PO form, return filter, Stock in).

## Purchases slice

### PurchaseOrder [`UZ_MODS.buy['Purchase orders']` + `poDoc`]
| Field | Type | Rules |
|---|---|---|
| `ref` | `PUR-ORD-####` | `nextRef`. |
| `supplier` | string | Required. Must be an active supplier. |
| `store` | string | Default "Main Store". |
| `date`, `expected` | ISO | Default date 2026-11-01. `expected` is optional. |
| `notes` | string | Internal notes. |
| `term`, `method`, `account`, `paid` | string, string, string, boolean | Default term "Cash on delivery" and method "Cash". Stored only (FR-018). |
| `lines` | `PoLine[]` | At least 1 ("No items added yet. Search for a product above."). |
| `total` | number | Σ qty × cost, rounded. |
| `received` | Pill: None / Partial / Full | |
| `status` | Pill: Draft / Approved / To receive / Accepted / Completed / Cancelled | |
| `activity` | `[title, detail][]` | "Order created", "Sent to supplier", "Paid by …", "Accepted", "Goods received", "Added to Payables", "Returned to supplier". |
| `grns` | string[] | Receipts raised against this order. |

`PoLine`: `{ key: "Product · Variant" | "Items on {ref}", qty, unit, cost, recv }`.

```text
 Save ─► Draft ──Accept──► Accepted ─┐
 Save and approve ─► Approved ─Accept─┤
 (seed) To receive ──Accept──────────┤
                                     ├─ receive (some lines short) ─► Accepted · Partial
 any non-Completed ─Accept and receive goods─► receive ─► Completed · Full (all lines received)
```

### GoodsReceipt [`UZ_MODS.buy['Goods receipts']` + `grnInfo`]
`ref` (`GRN-####`), `po` (ref or "—"), `supplier`, `store`, `date`, `dn` (delivery note no.),
`inv` (supplier invoice no.), `notes`, `who`,
`lines: { key, unit, ordered, recv, acc, rej, cost }[]`, `lineCount`, `status` (Saved / Partial /
Waiting), and `returned: Record<key, qty>`.
- Accepted ≤ received ≤ outstanding on the line. Only `acc` changes stock (+ at `store`, a
  **Received** movement with `ref`).
- A "Waiting" receipt comes from Stock in › Send to Purchases (`po` "—", no stock change).

### PurchaseReturn [`UZ_MODS.buy['Purchase returns']`]
`ref` (`PRT-####`), `supplier`, `po`, `grn`, `reason`, `notes`,
`lines: { key, unit, qty }[]`, `qty` (Σ), `value` (Σ qty × cost, rounded), `status` (Waiting
approval / Approved), and `store` (the receipt's store).
- Per-line quantity ≤ "Can return" (accepted on the GRN − already returned).
- Approve: − stock at `store` for each product line, plus a return movement. Stock must stay ≥ 0.

```text
 Submit only ─► Waiting approval ──Approve──► Approved (stock reduced)
 Submit and approve ─────────────────────────► Approved (stock reduced)
```

### RejectedItem [`UZ_MODS.buy['Rejected items']`]
`ref` (`REJ-####`), `grn`, `supplier`, `item` (key), `qty`, `reason` ("Rejected on delivery" for
new ones), `status` (Waiting / Sent back / Replaced / Written off; the seed also has "Sent back").
No stock effect.

## Fixed overview data [`UZ_BUY` + seed-derived counts, frozen]

`leadTime`, `rejected`, `spendDelta`, `orders` chart, `spend` chart, `onTime` (supplier → %),
plus the KPIs computed once from the seed lists (research R7). "Recent orders" reads the live PO
list.
