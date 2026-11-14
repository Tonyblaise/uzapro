# Contract: UI (bulk units and reorder)

## Product form

The variants grid gains a "Contains" column. On a variant's first row it shows "Base unit". On a
row that prices the variant in another unit it is a number field (aria-label "Base units in this
unit"), with a placeholder showing the default.

## Product record

Under the variants: "Bulk units" lines, for example "Medium: Carton of 10 Piece".

## Stock › Reorder

- Table: Product (with the variant to order under it), Store, On hand, On order, Reorder at, Order
  up to, Suggested order ("3 Crate" with "72 Piece" under it, or "—"), Supplier ("Not set"),
  Status.
- Header action "Set reorder point" (`?action=new`). Row menu: Edit (`?edit=<product>|<store>`),
  Remove.
- Above the table: a summary "{n} to reorder" and the button "Create draft purchase orders".
- Form (drawer): Product, Variant to order, Store, Reorder at, Order up to, Order unit, Supplier
  (optional). Errors: "Pick a product, variant and store", "Enter a reorder point of 0 or more",
  "Order up to must be above the reorder point",
  "{product} already has a reorder point at {store}. Edit that one."
- Toasts: "Reorder point saved.", "Reorder point removed.", "{n} draft purchase orders created.",
  "1 draft purchase order created.", "… {m} skipped: no supplier set.", "Nothing needs reordering."
