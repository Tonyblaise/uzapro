# Contract: UI (batches)

## Stock › Expiry

- Summary: "{n} expired · {m} expiring in 30 days".
- Table: Product, Store, Batch, Expiry date, Days left ("18 days", "Today", "Expired 10 days
  ago"), Quantity, Status. Header action "Record batch" (`?action=new`). Row menu: Write off
  (expired only), Remove.
- Form (drawer): Product, Store, Batch number, Expiry date, Quantity (hint: "{n} not in a batch
  yet"). Errors: "Pick a product and store", "Enter a batch number", "Pick the expiry date",
  "Enter a quantity of 1 or more", "Only {n} {product} at {store} is not in a batch yet.",
  "{product} already has a batch {number} at {store}."
- Toasts: "Batch {number} recorded.", "Batch {number} removed.", "Batch {number} written off."
