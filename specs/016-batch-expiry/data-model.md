# Data model: Batch and expiry tracking

## StockBatch (`types/stock.ts`, `AppState.stock.batches`)

| Field | Rules |
|---|---|
| `id` | `b-{n}` |
| `product`, `store` | an existing stock level |
| `batch` | required; unique per product and store (ignoring case) |
| `expiry` | ISO date, required |
| `qty` | base units, whole number ≥ 1 |

`StockItem` and `StockChange` gain `batchId?` (take from this batch first).

## Derived (`batches.ts`)

`daysLeft(expiry)`, `batchStatus` (Expired: danger; Expires soon, ≤ 30 days: warning; OK:
success), `expiredQty`, `unbatchedQty`, `consume`.

## Seed (new values; today is 10 Nov 2026)

Muthokinju Paint at Point of Sale (12 on hand):

| Batch | Expiry | Qty | Status |
|---|---|---|---|
| MP-2409 | 31 Oct 2026 | 2 | Expired 10 days ago |
| MP-2411 | 28 Nov 2026 | 4 | Expires soon (18 days) |
| MP-2502 | 30 Apr 2027 | 6 | OK |
