# Contract: UI (orders)

## Sales › Sales orders

- Table: Order #, Customer, Order date, Deliver by, Status, Amount (KES). Header action "New order"
  (`?action=order`). Row menu: View, Edit (while open), Dispatch, Create invoice, Cancel order.
- Order form (drawer): Customer, Order date, Deliver by, Dispatch from (store), "Add item", lines
  (Item, Qty, Unit, Rate, Amount, remove), Subtotal, VAT 16%, Total, Notes, Save, Cancel.
- Order record (`?view=SO-…`): status pill; facts (Customer, Order date, Deliver by, Dispatch from,
  Taken by); lines table (Item, Unit, Ordered, Dispatched, Left, Rate, Amount); "Delivery notes"
  and "Invoices" lists; buttons Dispatch, Create invoice, Edit, Cancel order.

## Dispatch form (`?view=SO-…&step=dispatch`)

Per line: item, "Left", and "Send now" (number). Then Driver, Vehicle registration, Notes,
"Confirm dispatch", Cancel. Errors: "Send at least one item", "You can send at most {n} {unit} of
{item}", "Enter the driver's name", "Enter the vehicle registration".

## Sales › Deliveries

- Table: Delivery note, Order, Customer, Date, Driver, Vehicle, Items, Status.
- Record (`?view=DN-…`): status pill; facts (Order, Customer, Dispatched from, Date, Driver,
  Vehicle, Received by); lines; buttons "Mark delivered" (`step=deliver`: "Received by" field,
  error "Enter who received the goods") and "Print delivery note".
