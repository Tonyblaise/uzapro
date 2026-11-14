# Data model

## DeliveryReturn (on `DeliveryNote.returns`)

`ref` (RTN-0001 …, unique across all notes), `date` (ISO), `by`, `reason`,
`lines: { product, variant, unit, qty }[]`.

## Derived

- `returnedQty(note, lineIndex)`: sum over the note's returns for that line's product, variant and unit.
- `returnable(note, order, lineIndex)`: `min(line.qty − returned, orderLine.dispatched − orderLine.invoiced)`.

## Changed

- `NewOrder.convertedFrom?`: the quotation number; `createOrder` sets the quotation's `convertedTo`.
