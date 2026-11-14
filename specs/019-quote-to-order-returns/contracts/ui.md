# Contract: UI

- **Quotation record**: action "Convert to order" (`?order=<number>` on Quotations), which opens
  the order form titled "New sales order" with the subtitle "From {quotation}".
- **Delivery note**: button "Record return"; an inline form with "Return now" per line (showing
  "Can return {n}"), "Reason" and "Confirm return"; a "Returns" list (RTN number, date, reason,
  items); the lines table gains a "Returned" column.
- Errors: "Return at least one item", "Pick a reason",
  "{n} {item} can be returned here. The rest is invoiced: raise a credit note from the invoice.",
  "You can return at most {n} {unit} of {item}".
