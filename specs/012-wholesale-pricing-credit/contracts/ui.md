# Contract: UI (pricing and credit)

All copy is sentence case, with no exclamation marks. Money in tables is "KES 45,600.00".

## Customers › Customers

- Columns: Name, Phone, Email, Address, **Group**, **Credit limit (KES)**, **Balance owed (KES)**,
  Status.
  - Credit limit: the amount, "No limit", or "—" for the walk-in customer.
  - Balance owed: the amount, or "—" when zero.
  - Under the status pill, a warning pill "Over limit" or a danger pill "Overdue" when it applies.
- Customer form (drawer) adds, below Address:
  - **Customer group** (SearchSelect of group names; locked to Retail for walk-in);
  - **Credit limit (KES) (optional)**, helper "Leave blank for no limit";
  - **Payment terms** (Cash, 7 days, 14 days, 30 days).
- When editing, a **Credit** panel sits between Address and Customer group (so the Name field keeps the first focus): Credit limit, Balance owed, Available
  credit, Payment terms, Overdue, and a link "See what {Customer} owes" to Receivables.
- Inline error: "Enter an amount of 0 or more".

## Customers › Customer groups

- Table: Group, Price list ("Standard prices" for Retail, otherwise "{N} prices"), Customers.
- Header action "New group". Row menu: Rename, Delete (not for Retail).
- Form (drawer): Group name. Errors: "Enter a name", "Another group is already called {Name}.",
  "Use 40 characters or fewer".

## Products › Price lists

- A group picker (segmented, one per group other than Retail) with "{N} prices · {M} customers".
- Table: Product, Variant, Unit, Standard price (KES), Group price (first break), Quantity breaks
  ("5+ 15,000.00 · 20+ 13,900.00" or "—"). A note pill "Higher than the standard price" where it
  applies.
- Header action "Add price". Row menu: Edit, Remove.
- Form (drawer): Product, Product variant, Unit of measure, then break rows "From quantity" and
  "Price (KES)" with "Add a quantity break" and a remove button per row.
- Errors: "Pick a product, variant and unit", "Enter a quantity of 1 or more",
  "Enter a price above 0", "Two breaks start at {N}",
  "This list already has a price for {product} ({variant}, {unit}). Edit that one."
- Empty state: "No prices in this list yet."

## Product record

- A "Group prices" block under the variant prices: Group, Unit, Price, Breaks, with a link
  "Open price lists". Hidden when the product has none.

## Sale and document forms

- Under a line or the entry row: "{Group} price" in the secondary text style, or
  "{Group} price from {from} {unit}" when below the first break.
- After a hand-typed price that differs: a text button "Use {Group} price" or "Use standard price".
- Document form: when the customer is picked on a new invoice, Due date becomes the date plus the
  customer's terms.

## Till

- Cart line: the same "{Group} price" note under the line name.
- Checkout with Pay later: the stop dialog opens on "Complete sale".

## CreditStop dialog

Modal, title by reason:

| Reason | Title | Lead line |
|---|---|---|
| cash | "{Customer} is on cash terms" | "Customers on cash terms pay when they buy." |
| overdue | "{Customer} has KES {amount} overdue" | "Oldest: {doc}, due {date}." |
| limit | "Over the credit limit" | "This sale is KES {over} over what {Customer} can still take on credit." |

- Figures list: Credit limit, Balance owed, Available credit, This sale on credit.
- Without approval rights: text "Ask a manager to approve this, or take another payment method."
  and one button "Close".
- With approval rights: a field "Reason for approving" (required, at least 5 characters, error
  "Give a reason of at least 5 characters") and buttons "Cancel" and "Approve anyway".
- Focus is trapped, Escape closes, focus returns to the button that opened it.

## Record views

- Sale and invoice views show "Credit approved by {name}: {reason}" with the date when
  `creditApproval` is set.

## Toasts

- Credit sale: "Credit sale recorded. KES {total} added to Receivables as {ref}, due in {N} days."
  (unchanged for 30 days).
- Refusal from a command without approval: "{Customer} is over their credit limit." /
  "{Customer} has KES {amount} overdue." / "{Customer} is on cash terms."
