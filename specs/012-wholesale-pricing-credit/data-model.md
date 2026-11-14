# Data model: Wholesale pricing and customer credit

Types live in `src/data/types/pricing.ts` unless noted. All state is in memory.

## Entities

### CustomerGroup

| Field | Type | Rules |
|---|---|---|
| `id` | string | `g-retail`, `g-wholesale`, `g-distributor`, then `g-{n}` |
| `name` | string | required, unique ignoring case, at most 40 characters |
| `builtIn` | boolean | true for Retail only: no rename, no delete, no price list |

### PriceEntry

| Field | Type | Rules |
|---|---|---|
| `group` | string | a group id other than `g-retail` |
| `product`, `variant` | string | an existing product variant |
| `unit` | string | a unit the variant sells in (base unit or one of its extra units) |
| `breaks` | `PriceBreak[]` | at least one; sorted by `from` ascending; `from` values unique |

Unique on group + product + variant + unit.

### PriceBreak

| Field | Type | Rules |
|---|---|---|
| `from` | number | whole number, 1 or more |
| `price` | number | more than 0, KES, same convention as `Variant.price` |

### Customer (extended, `types/sales.ts`)

| Field | Type | Rules |
|---|---|---|
| `group` | string | group id; defaults to `g-retail`; the walk-in customer is always `g-retail` |
| `creditLimit` | `number \| null` | null = no limit; otherwise 0 or more |
| `terms` | `PayTerms` | `"Cash" \| "7 days" \| "14 days" \| "30 days"`; defaults to `"30 days"` |

`NewCustomer` gains the same three fields as optional inputs.

### CreditApproval (on `Sale` and `Invoice`, optional)

| Field | Type |
|---|---|
| `by` | string, the approver's name |
| `at` | string, "10 Nov 2026, 14:05" |
| `reason` | string, at least 5 characters |
| `why` | `"cash" \| "overdue" \| "limit"` |
| `amount` | number: the amount over the limit, the overdue amount, or the credit amount for cash terms |

`NewSale` and `NewDocument` gain `approval?: { reason: string }`.

### PricingState (`AppState.pricing`)

```ts
{ groups: CustomerGroup[]; prices: PriceEntry[]; groupNo: number }
```

## Derived values (pure, not stored)

### CreditPosition

For one customer: `limit` (number or null), `owed`, `available` (null when there is no limit,
otherwise `max(0, limit − owed)`), `overdue` (amount), `oldest` (`{ doc, ref, due }` of the
earliest overdue receivable, or null), `terms`.

### CreditStop

`null`, or `{ why, position, amount, over }`:

| `why` | When | `over` |
|---|---|---|
| `cash` | terms are Cash and the credit amount is above 0 | the credit amount |
| `overdue` | `position.overdue > 0` | the overdue amount |
| `limit` | there is a limit and the credit amount is above `available` | credit amount − available |

Checked in that order (research R8). Never raised for the walk-in customer, which keeps its
existing refusal.

### LinePrice

`priceFor(...)` returns `{ price, source: "list" | "std", group?: string, hint?: { from, unit } }`.
`hint` is set when the group has an entry for the variant and unit but the quantity is below the
first break.

## Seed

### Groups

Retail (built in), Wholesale, Distributor.

### Customers

| Customer | Group | Limit (KES) | Terms |
|---|---|---|---|
| Morningview Bicycles | Wholesale | 50,000 | 30 days |
| Mountain Goats | Distributor | 100,000 | 30 days |
| Walk-in Customer | Retail | none | 30 days |

### Price entries (KES)

| Group | Product | Variant | Unit | Standard | Breaks (from → price) |
|---|---|---|---|---|---|
| Wholesale | Helmet | Small | Carton | 16,390 | 1 → 15,500; 5 → 15,000 |
| Wholesale | Helmet | Medium | Carton | 16,390 | 1 → 15,500; 5 → 15,000 |
| Wholesale | Helmet | Large | Carton | 17,390 | 1 → 16,400; 5 → 15,900 |
| Wholesale | Muthokinju Paint | White | Crate | 11,208 | 1 → 10,600; 4 → 10,200 |
| Wholesale | Muthokinju Paint | White | Tray | 2,802 | 2 → 2,700 |
| Wholesale | Bike Pump | Standard | Piece | 345 | 6 → 320 |
| Distributor | Helmet | Small | Carton | 16,390 | 1 → 14,900; 5 → 14,400; 20 → 13,900 |
| Distributor | Helmet | Medium | Carton | 16,390 | 1 → 14,900; 5 → 14,400; 20 → 13,900 |
| Distributor | Helmet | Large | Carton | 17,390 | 1 → 15,800; 5 → 15,300 |
| Distributor | Muthokinju Paint | White | Crate | 11,208 | 1 → 10,100; 4 → 9,700 |
| Distributor | Bike Pump | Standard | Box | 4,140 | 1 → 3,800; 10 → 3,600 |
| Distributor | Bike Pump | Standard | Piece | 345 | 6 → 310 |

A unit test checks each Standard figure against the catalogue seed, so the table cannot drift.

## State changes

- **Product or variant removed or renamed**: catalogue commands drop or rename the matching
  entries.
- **Group deleted** (only with 0 customers): its entries are removed.
- **Customer renamed**: nothing to do; credit position is looked up by the current name, as
  receivables already are.
