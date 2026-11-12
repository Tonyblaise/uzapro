# Data Model: Dashboard, Products, Stock, Sales and Customers

**Feature**: `001-dashboard-sales-stock` | **Date**: 2026-11-12

Seed source for every entity is `design/canvas/erp-data.js` (the `UZ_*` name is in brackets).
Values are ported **verbatim** into `src/data/fixtures/*.ts` (Principle II). Types live in
`src/data/types.ts`. Money is stored as a number in KES. Dates are stored as ISO strings and
displayed with `format.date`.

## Shared value types

| Type | Shape | Notes |
|---|---|---|
| `Tone` | `'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | The design's `P(text, good/warn/bad/info/mut)` maps to these. |
| `Pill` | `{ label: string; tone: Tone }` | Status pills. Labels are kept verbatim ("Low stock", "Not finished"). |
| `RoleId` | `'owner' \| 'accountant' \| 'cashier' \| 'store'` | |
| `ModuleId` | `'home' \| 'prod' \| 'inv' \| 'sales' \| 'cust' \| …` (all 20 from `UZ_MODS`) | |
| `Result<T>` | `{ ok: true; value: T; message: string } \| { ok: false; message: string }` | `message` is the design's toast or error text. |

## Configuration (static, not in the store)

### Module [`UZ_MODS`]
- `id: ModuleId`, `section` (Overview, Sales, Procurement, Financials, People, Office,
  Account), `icon`, `name`, `subtitle`, `slug`, `inScope: boolean`.
- `tabs: Tab[]`. A `Tab` has `title`, `slug`, `kind` (`stats`, `prodboard`, `stockboard`,
  `salesdash`, `table`, …) and, for `table`, the column definitions `{ title, numeric?,
  balance? }`.
- Only `home`, `prod`, `inv`, `sales` and `cust` have `inScope: true`.

### Role [`UZ_ROLES`]
- `id: RoleId`, `label`, `name`, `first`, `mods?: ModuleId[]` (absent = all),
  `tabs?: Partial<Record<ModuleId, string[]>>`, `figures?: boolean`.
- `tasks: QuickTask[]`. A `QuickTask` is `{ title, subtitle, icon, module, tab, action? }`,
  where `action` is one of `new`, `invoice`, `stock`, `transfer`, `waste` or `credit`.
- `attention: Alert[]`, with `Alert` taken from the design's `ALERTS`:
  `{ title, subtitle, tone, module, tab }`.
- **Rule**: the visible tabs of module M are `role.tabs?.[M] ?? M.tabs`.

## Session slice

| Field | Type | Rules |
|---|---|---|
| `authed` | boolean | `false` on first load unless `uzAuth` is present in storage (research R8). |
| `role` | `RoleId` | Set on login from the email prefix, or from the role select. |
| `remember` | boolean | Default `true`. When true, `{role}` is written to `localStorage.uzAuth`. |
| `navClosed` | `Record<section, boolean>` | Stored under `localStorage.uzNavClosed`. |

No business data is ever written to storage.

## Catalogue slice

### Product [`UZ_MODS.prod['All products']`, `UZ_VARIANTS`, `UZ_PRODADDED`, `UZ_NONTAX`]
| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, unique (case-insensitive). The key used by other entities. |
| `category` | string | Must exist in Categories. |
| `taxable` | boolean | `false` for names in `UZ_NONTAX`. |
| `status` | Pill | Seed is verbatim. For new products it is derived: on hand = 0 → Out (danger); on hand at or below the low threshold → Low stock (warning); otherwise Active (success). |
| `image?` | `{ name, url }` | SVG, PNG or JPG only, up to 5 MB, otherwise "Choose an SVG, PNG or JPG image." or "That image is over 5MB.". |
| `addedAt`, `addedBy` | string | From `UZ_PRODADDED`. New products get `DEMO_TODAY` and the current role's name. |
| `variants` | `Variant[]` | At least 1 ("Each product needs at least one price."). |

Display price is the lowest variant price, shown as "From 12,900" when variant prices differ
(as in the seed). On hand is the sum of the product's `StockLevel` quantities.

### Variant
`name` (e.g. "54cm", "Standard"), `price`, `cost`, `unit` (default "Piece"), and
`extraUnits: { unit, price, cost }[]` (e.g. Bike Pump → Box ×12). Margin is shown as
`(price − cost) / price`, as a percentage with 0 dp. Price must be > 0 and cost ≥ 0.

### Category [`UZ_MODS.prod.Categories`]
`name` (unique), `description?`, `parent?` (e.g. Frames → Parts), `image?`.
- Delete is blocked if any product uses it ("Move its products to another category
  first.") or if it has children ("Move or delete its sub-categories first.").
- A duplicate name is blocked: "A category called … already exists." (the exact design
  text is copied during implementation).

### Unit of measure [`UZ_UNITS`]
`name`, unique. The seed list has 47 units. The Units tab table starts empty in the design and
lists units added during the session (this needs confirming against the design render during
implementation).

## Stock slice

### Store [`UZ_MODS.inv.Warehouses`, `UZ_LOC`]
`name` (Main Store, Finished Goods, Stores, Point of Sale, Goods in Transit), `branch`,
`type` (Store, Manufacturing, Retail, Transfer).

### StockLevel [`UZ_STOCK.lines`]
`(product, store) → quantity`. Value = quantity × the product's base-variant cost.
- **Invariant**: quantity ≥ 0. Any command that would break this fails.

### StockMovement [`UZ_STOCK.moves`]
`date`, `product`, `variant`, `kind: Pill` (Sold, Moved out, Moved in, Received, Counted,
Damaged or lost), `store`, `change` (signed), `left` (quantity after), `by`, `ref`.
New movements are prepended.

### Transfer [`UZ_MODS.inv['Transfer stock']`, `UZ_STOCK.transfers`]
`ref` (`TRF-####`), `from`, `to`, `date`, `notes`, `items: { product, variant, qty, unit }[]`,
`status`.

```text
            Confirm transfer            Transfer and ship
  (new) ─────────────────► Confirmed* ─────────────────► In transit ── Mark as received ──► Received
    │                         │  (no stock moves)            (stock leaves `from`)     (stock arrives at `to`)
    │ Transfer, ship and receive                              │
    └──────────────────────────────────────────────────────────┼──────────────────────────► Received
                              Not finished ── Cancel transfer ──► Cancelled (no stock change)
```
- `from ≠ to`. Items required ("No items added"). Each qty is no more than on hand at `from`.
- *The design's "Confirm transfer" sets **Confirmed**; seed TRF-0030 is **Not finished**. Both can be edited, shipped, received or cancelled.
- Cancel is allowed only from Not finished or Confirmed, with the design text "This cancels the transfer.
  No stock has moved…". After that the transfer is locked (view only).

### Wastage [`UZ_MODS.inv.Wastage`]
`ref` (`WST-####`), `location`, `notes`, `items: { product, variant, qty, unit, reason }[]`.
Reasons come from the design's wastage reasons, with the default "Damaged". The list row shows
the first item, the total qty, the reason and the value (qty × cost). Recording one reduces
levels, logs "Damaged or lost" movements, and toasts "Wastage recorded at {location}.".

### StockIn
Not stored as its own list. It produces "Received" movements with ref `STK-####`, increases
levels, and toasts "Stock added to {store}.". The optional supplier, notes and documents are
kept on the movement note only.

## Sales slice

### Customer [`UZ_MODS.cust.Customers`]
`name` (unique, case-insensitive: "Another customer is already called …"), `phone`, `email`,
`address`, `status: Pill` (Active). "Walk-in Customer" is seeded and cannot be used for credit
sales.

### Sale [`UZ_MODS.sales['All sales']`]
| Field | Type | Rules |
|---|---|---|
| `ref` | string | New sales are `SAL-######`. Seed rows keep the design's references where shown. |
| `customer` | string | Required. Must exist in Customers. |
| `type` | Tax invoice, Sales order, Invoice, Quotation | New POS sales are "Tax invoice" unless the form sets otherwise. |
| `channel` | In-store, Shopify, Amazon, POS | New sales use "POS". |
| `store` | string | Defaults to "Point of Sale" (from the design's sale form). |
| `lines` | `SaleLine[]` | At least 1 ("No items in this sale."). Seed rows have none. |
| `payments` | `{ method, ref, date, amount }[]` | Method comes from `UZ_PAYMETHODS`. |
| `subtotal`, `vat`, `total` | number | Derived: VAT 16% on taxable lines. |
| `status` | Pill | Paid, Pending, Overdue, Not finished. |

`SaleLine`: `{ product, variant, qty, unitPrice, taxable }`.
**Record sale**: validate stock at `store` → decrement levels → log Sold movements →
prepend the sale → toast.

```text
 recorded ──(Void, reason)──► removed from All sales; VoidRecord added; stock returned (session sales only)
 recorded ──(Credit note)───► CreditNote (Waiting approval)
```

### Quotation [`…Quotations`] and Invoice [`…Invoices`]
Common document fields: `number` (`Q-######` / `INV-####`), `customer`, `date`, `due`,
`store`, `lines: { description, qty, unit, rate, tax }[]`, `discount: { value, type: 'KES' |
'%' }`, `notes`, `terms`, `status: Pill`, `amount`. Invoices also have `paid` and
`balance` (the "Balance due" column, with its sub-line "Amount paid: …").
Totals: `subtotal − discount + VAT 16% (on taxable lines after discount) = amount`.
Quotation statuses: Not finished → Approved. Invoice statuses: Pending, Overdue, Paid.

### CreditNote [`…Refunds (credit notes)`, `UZ_REFUND`]
`number` (`CRN-####`), `customer`, `date`, `source` (invoice/sale ref), `items: { product,
variant, sold, credited, qty, unitPrice }[]`, `reason` (from `UZ_REFUND.reasons`),
`notes`, `returnToStock` (default true), `refundMethod` (from `UZ_REFUND.methods`),
`amount`, `status`.
```text
 (new) ──Save──► Waiting approval ──Approve──► Approved  [if returnToStock: + stock at the sale's store, "Received" movement]
```
Credit quantity is no more than sold minus already credited. The amount is computed from the sale's
line prices including VAT.

### VoidRecord [`…Voided items`, `UZ_VOID`]
`ref` (`VOID-####`), `original`, `customer`, `date` (DEMO_TODAY), `reason` (from `UZ_VOID`),
`by` (current role name), `amount`. Toast: "Sale voided.".

### SalesTarget [`UZ_TARGETS`]
`id`, `name`, `scope` (Whole business, Branch, Staff member), `who`, `start`, `end`, `amount`,
`base` (achieved). Progress is `base / amount`. Status is derived as in the design (implementation
reads the design's rule). Delete toasts "Target deleted.".

## Fixed overview data (read-only, not in the store)

| Read function | Source | Contents |
|---|---|---|
| `getDashboard()` | `UZ_HOME` + frozen seed derivations (R9) | banners, kpis (8), compare, cash, expenses, stock, customers, payments, suppliers, invoice analytics |
| `getSalesOverview()` | `UZ_SALES` | kpis, channels, orders, trend, categories, boards (7) |
| `getProductsOverview()` | `UZ_PRODUCTS`, `UZ_PRODTREND` | highlights, bars (2), categories, best sellers, trend |
| `getStockOverview()` | `UZ_STOCK` | kpis, low list, week in/out, categories, and the recent movements from the live movement list |
