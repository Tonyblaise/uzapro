# Data model

## Visit (`AppState.sales.visits`)

`id` (VIS-0001 …), `date` (ISO), `customer`, `van` (store name), `rep`, `status` ("Planned" |
"Sold" | "No sale"), `sale?` (sale ref), `reason?`, `at?` (time).

## Changed

`NewSale.store?`: the store the goods leave; the sale's channel is "Field sales" when set.

## Seed (new values)

- Store: Van KDG 412X, Nairobi HQ, type Van.
- Van load (moved from Main Store): Aluminium Frame 20 (Main Store 165 → 145), Carbon Road Frame 10 (35 → 25).
- Visits, 10 Nov 2026, rep Tony Blaise: VIS-0001 Mountain Goats, VIS-0002 Morningview Bicycles; both Planned.
