# Data model: Breaking bulk and reorder points

## ExtraUnitPrice (extended, `types/catalog.ts`)

`unit`, `price`, `cost`, **`contains`** (whole number ≥ 1: base units in one of this unit).

Seed: Muthokinju Paint: Tray 6, Crate 24. Bike Pump: Box 12. Helmet: Carton 10.

## StockChange (extended, `store/stockOps.ts`)

**`unit?`**: the line's unit. `change` stays in that unit; the stock functions convert.

## ReorderRule (`types/stock.ts`, `AppState.stock.reorder`)

| Field | Rules |
|---|---|
| `product`, `store` | unique together |
| `variant` | the variant to order |
| `min` | reorder point, base units, ≥ 0 |
| `max` | order-up-to level, base units, > min |
| `unit` | order unit: the base unit or one of the variant's extra units |
| `supplier` | optional ("" = none) |

## ReorderPosition (derived, `reorder.ts`)

`onHand`, `onOrder`, `need` (base units), `units` (order units), `factor`, `status`.

| Status | When | Tone |
|---|---|---|
| Out of stock | suggestion and on hand is 0 | danger |
| Reorder now | suggestion | warning |
| On order | on hand ≤ min, no suggestion | info |
| OK | otherwise | success |

## Seed reorder lines (new values)

| Product | Variant | Store | Reorder at | Order up to | Unit | Supplier | On hand | Expect |
|---|---|---|---|---|---|---|---|---|
| Muthokinju Paint | White | Main Store | 24 | 72 | Crate | Eastside Bicycle Supplies | 0 | Out of stock, 3 Crate |
| Racing Wheelset | 700c | Main Store | 20 | 40 | Piece | Magaliesburg Wheels | 16 | Reorder now, 24 Piece |
| Groupset | Standard | Point of Sale | 5 | 10 | Piece | (none) | 3 | Reorder now, 7 Piece |
| Bike Pump | Standard | Main Store | 24 | 60 | Box | Eastside Bicycle Supplies | 30 | OK |
| Helmet | Medium | Point of Sale | 20 | 60 | Carton | Eastside Bicycle Supplies | 44 | OK |
