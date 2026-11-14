# Data model: Sales orders and dispatch

Types in `src/data/types/orders.ts`. State in `AppState.sales`.

## SalesOrder

| Field | Type | Rules |
|---|---|---|
| `number` | string | SO-0001 … |
| `customer` | string | a named customer (not walk-in) |
| `date`, `deliverBy` | ISO date | both required |
| `store` | string | the store goods leave from |
| `lines` | `OrderLine[]` | at least one |
| `notes` | string | optional |
| `amount` | number | total with VAT, rounded |
| `by` | string | who took the order |
| `cancelled` | boolean | only while nothing is dispatched |
| `creditApproval?` | `CreditApproval` | when a credit stop was approved |
| `invoices` | string[] | invoice numbers raised from it |

## OrderLine

`product`, `variant`, `unit`, `qty` (> 0), `rate`, `taxable`, `dispatched` (0…qty), `invoiced` (0…dispatched).

## DeliveryNote

| Field | Type |
|---|---|
| `number` | DN-0001 … |
| `order`, `customer`, `store` | string |
| `date` | ISO date |
| `lines` | `{ product, variant, unit, qty }[]` |
| `driver`, `vehicle` | string, required |
| `notes` | string |
| `status` | "Out for delivery" \| "Delivered" |
| `receivedBy?`, `deliveredAt?` | string ("10 Nov 2026, 14:05") |
| `by` | string |

## Derived (pure, `src/data/orders.ts`)

- `leftToDispatch(line) = qty − dispatched`; `toInvoice(line) = dispatched − invoiced`.
- `orderStatus(order)`: Cancelled → Invoiced (all dispatched and all invoiced) → Dispatched →
  Part dispatched → Open.

| Status | Tone |
|---|---|
| Open | info |
| Part dispatched | warning |
| Dispatched | success |
| Invoiced | success |
| Cancelled | neutral |
| Out for delivery | warning |
| Delivered | success |

## Credit (amends feature 012)

`CreditPosition` gains `onOrder`: the sum of `uninvoicedValue(order)` over the customer's orders,
where `uninvoicedValue` is the total with VAT of each line's `qty − invoiced` (0 when cancelled).
`available = max(0, limit − owed − onOrder)`.

## Seed (new values)

- **SO-0001**: Morningview Bicycles, ordered 6 Nov 2026, deliver by 12 Nov 2026, Main Store, taken
  by Tony Blaise. One line: Bike Pump · Standard, Box, 4 at KES 4,140 (the standard price; the
  Wholesale list has none for a box), 2 dispatched, 0 invoiced. Amount KES 16,560 (Bike Pump is
  not taxed). Credit approved by Tony Blaise ("Paying the overdue invoice this week").
- **DN-0001**: for SO-0001, 8 Nov 2026, 2 boxes, driver Peter Kamau, vehicle KDG 412X, delivered,
  received by Amina Yusuf on 8 Nov 2026, 15:20.

The seed dispatch has no stock movement, like the seed invoices.
