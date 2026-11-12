# Feature Specification: Dashboard, Products, Stock, Sales and Customers

**Feature Branch**: `001-dashboard-sales-stock`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "I want to design the dashboard, products, stock, sales and customers sections from the design"

**Design source**: `design/canvas/Uzapoint ERP.dc.html` (screens and flows) and
`design/canvas/erp-data.js` (all figures and records). Every screen, label, figure and
message in this feature comes from these files (Constitution Principle I).

## Clarifications

### Session 2026-11-12

- Q: What should happen when someone clicks a sidebar module this feature doesn't cover? → A: Show a plain "not built yet in this prototype" page (the module stays listed in the sidebar).
- Q: When a presenter records a sale, should the stock of the products sold go down? → A: Yes. Recording a sale reduces stock at the sale's store and adds a "Sold" movement. Voiding the sale, or approving a credit note with "Return goods to stock", puts the stock back.
- Q: Should headline figures on the Dashboard and module overviews update after session changes? → A: No. Headline banners, KPIs and charts stay exactly as in the design. Only lists, stock quantities, counts within lists and document totals update.
- Q: After a page reload, should the presenter return to login or stay signed in? → A: Stay signed in. Only "signed in" and the chosen role are remembered for the browser tab. A reload keeps the page and role and resets all data. Logging out returns to the login screen.
- Follow-up (plan, research R8): per the design and constitution v1.1.0, remembering uses the design's "Remember me" (browser storage), not the tab only.

## User Scenarios & Testing *(mandatory)*

The demo audience is a prospective customer or stakeholder watching someone click through UzaPro.
The presenter acts as one of four demo people: Tony Ashiuma (Owner), Mary Achieng (Accountant),
Jane Smith (Cashier) or Grant Jensen (Store keeper).

### User Story 1 - Enter the app and see the business at a glance (Priority: P1)

The presenter opens UzaPro, logs in on the login screen, and lands on the Dashboard for the
Owner. The dashboard greets them by first name ("Welcome back, Tony Ashiuma") and shows:

- the four period sales banners (today, this week, this month, annual)
- the eight KPI tiles (total revenue, total expenses, net profit, pending invoices, customers,
  suppliers, stock value, low stock items)
- the "Comparative analysis" chart of sales and purchases over 6 months, with Bars, Lines and
  Area views
- the "Inflow and outflow" chart
- invoice analytics (overdue, pending, paid)
- top selling products
- stock performance (total stock value, items in storage, turnover rate, daily movement, low
  and out-of-stock counts)
- the remaining panels the design renders: Customers overview, Top customers and Top suppliers

The Cashier and Store keeper get the design's simpler home instead: "What would you like to do?"
quick tasks and "Needs your attention". (The design computes recent-activity, expense and
payment-method data but never displays it, so those panels are not built.)

The sidebar lists every module in its sections, and the header shows search, help,
notifications and the user chip.

**Why this priority**: it is the first thing every demo shows, and the shell (login, sidebar,
header) is needed by every other story.

**Independent Test**: open the app, log in with a valid email and a 6+ character password,
and check every dashboard figure, chart and panel against the design for the Owner.

**Acceptance Scenarios**:

1. **Given** the app is opened fresh, **When** the presenter submits the login form with a
   valid email (e.g. tony@buildbyblaise.co.ke) and a password of 6 or more characters,
   **Then** they land on the Dashboard as Tony Ashiuma (Owner). A shorter password shows
   "Wrong email or password. Check them and try again."
2. **Given** the login screen, **When** the presenter uses "Forgot password?", enters a
   value and sends, **Then** the "Check your messages" confirmation appears, and "Back to log in"
   returns to the login screen.
3. **Given** the Dashboard, **When** the presenter switches the comparative analysis chart
   between Bars, Lines and Area, **Then** the same six months of sales and purchases data is
   redrawn in the chosen style.
4. **Given** the Dashboard, **When** the presenter clicks a panel link such as "View stock"
   or "View details", **Then** they are taken to the matching module and tab.
5. **Given** any page, **When** the presenter clicks a sidebar entry, **Then** that module
   opens on its first visible tab and the entry shows as active.

---

### User Story 2 - Switch role and see what each person sees (Priority: P1)

From the user chip, the presenter switches between Owner, Accountant, Cashier and Store keeper.
Each role shows its own name, greeting, sidebar modules, tabs, dashboard quick tasks and
attention items, exactly as defined in the design.

**Why this priority**: role-based views are a key selling point and decide which modules
and tabs every other story must show.

**Independent Test**: switch to each of the four roles and compare the sidebar, the visible
tabs in Sales, Stock and Customers, and the dashboard tasks against the design's role
definitions.

**Acceptance Scenarios**:

1. **Given** the Owner is signed in, **When** the presenter switches to Cashier, **Then** the
   header shows Jane Smith (Cashier), the sidebar shows only the Cashier's modules, and Sales
   shows only "All sales" and "Refunds (credit notes)".
2. **Given** the Store keeper role, **When** the presenter opens a deep link to a module the
   role cannot see (e.g. Sales), **Then** they are sent to that role's Dashboard.
3. **Given** any role, **When** the presenter uses a dashboard quick task (e.g. "New sale",
   "Stock in"), **Then** the matching module, tab and form open.

---

### User Story 3 - Record a sale and follow it through sales documents (Priority: P1)

In Sales, the presenter reviews the Sales overview (sales KPIs, sales by channel, order
counts, and the other panels in the design). They browse All sales, Quotations, Invoices,
Refunds (credit notes), Voided items and Sales targets. They:

- record a new sale (pick a customer, add products, see VAT 16% and the total, record it)
- open a sale to view its items, payments and summary
- create a quotation or invoice
- raise a credit note against a sale, then view and approve it
- void a sale with a reason

Each action updates the lists and confirms with the design's message.

**Why this priority**: selling is the core business flow of the product.

**Independent Test**: record a new sale, then confirm it appears in All sales with the right
total and that the confirmation message matches the design.

**Acceptance Scenarios**:

1. **Given** All sales, **When** the presenter starts a new sale, picks a customer, adds two
   products and records it, **Then** the sale appears at the top of All sales with the
   computed total including VAT 16%, and a confirmation message is shown. Each product's
   quantity at the sale's store drops by the amount sold, and its stock history shows a
   "Sold" movement with the sale reference.
2. **Given** a new sale with no items, **When** the presenter tries to record it, **Then**
   recording is blocked and "No items in this sale." stays visible.
3. **Given** a recorded sale, **When** the presenter opens it, **Then** they see "Products in
   this sale", "Payments", a summary (subtotal, VAT, grand total, amount paid, balance due)
   and the actions Reprint, PDF, Credit note and Void.
4. **Given** a sale, **When** the presenter voids it with a reason from the design's list
   ("Customer cancelled", "Entered by mistake", "Wrong amount", "Duplicate sale"), **Then** it
   is listed under Voided items and "Sale voided." is shown.
5. **Given** a sale, **When** the presenter raises a credit note, sets quantities and a
   reason, and saves, **Then** the credit note is listed as "Waiting approval". Approving it
   from its view changes the status as the design shows.
6. **Given** Quotations, **When** the presenter creates a quotation with lines, a discount
   and VAT, **Then** the subtotal, discount, VAT and total are computed and the quotation is
   listed.
7. **Given** Sales targets, **When** the presenter views the targets, **Then** each target
   shows target and achieved amounts, progress and status from the design data. Deleting
   one shows "Target deleted."

---

### User Story 4 - Manage products and their catalogue (Priority: P2)

In Products, the presenter reviews the Products overview (highlights such as best seller and
best category, sales by product, and the product trend). They browse All products, Categories
and Units of measure, and:

- add a product with a category, variants (variant name, buying price, unit, selling price,
  computed margin), extra unit prices, tax status and an optional image
- add a category (name, optional description, optional image)
- add a unit of measure
- open a product record to see its overview, variants and stock history

**Why this priority**: products feed sales and stock, but the demo can still show selling
with the seeded catalogue.

**Independent Test**: add a product with two variants and confirm it appears in All
products with its category, price and status.

**Acceptance Scenarios**:

1. **Given** All products, **When** the presenter adds "Test Saddle" in category "Parts" with
   one variant priced 2,500 (cost 1,500), **Then** the margin is shown before saving, and
   after saving the product appears in the list.
2. **Given** a new category named the same as an existing one, **When** the presenter
   saves, **Then** saving is blocked with the design's duplicate-name message.
3. **Given** a category that still has products or sub-categories, **When** the presenter
   deletes it, **Then** deletion is blocked with "Move its products to another category
   first." or "Move or delete its sub-categories first."
4. **Given** a product image over 5MB or of the wrong type, **When** the presenter uploads
   it, **Then** it is rejected with "That image is over 5MB." or "Choose an SVG, PNG or JPG
   image."
5. **Given** a product record, **When** the presenter opens its stock history, **Then** each
   movement shows date, variant, change, store, quantity, quantity left, who did it and the
   reference. A product with no movements shows "No stock changes recorded for this product
   yet."

---

### User Story 5 - Track and move stock (Priority: P2)

In Stock, the presenter reviews the Stock overview (stock levels, low-stock list and recent
movements). They browse Stock management, Transfer stock, Wastage and Warehouses, and:

- filter stock by store and level
- add stock into a store (products, quantities, units, notes, optional documents)
- create a transfer between stores, with the actions confirm, ship, or ship and receive
- mark a transfer as received, or cancel it
- record wastage with a reason per item

**Why this priority**: stock control is the second core flow after selling.

**Independent Test**: transfer 2 units from Main Store to Point of Sale, mark the transfer
received, and confirm both stores' quantities and the transfer status change.

**Acceptance Scenarios**:

1. **Given** Stock management, **When** the presenter adds 10 units of a product to Main
   Store, **Then** that store's quantity and stock value go up, and "Stock added to Main
   Store…" is shown.
2. **Given** Transfer stock, **When** the presenter creates a transfer from Main Store to
   Point of Sale and chooses "Transfer and ship", **Then** the transfer is listed as
   "In transit". Marking it received moves the quantities and shows "Transfer received
   at…".
3. **Given** a transfer that is not yet shipped, **When** the presenter cancels it, **Then**
   the design's cancel message is shown, stock levels do not change, and the transfer stays
   listed as Cancelled.
4. **Given** Wastage, **When** the presenter records 1 damaged unit at a location, **Then**
   the quantity at that location drops by 1, a wastage entry with its value is listed, and
   "Wastage recorded at…" is shown.
5. **Given** a transfer or wastage form with no items, **When** the presenter tries to
   submit, **Then** submission is blocked and "No items added" stays visible.

---

### User Story 6 - Look up and add customers (Priority: P3)

In Customers, the presenter browses the customer list (name, phone, email, address and
status) and adds a new customer.

**Why this priority**: simple, and the seeded customers already support the sales flow.

**Independent Test**: add a customer, then pick that customer in a new sale.

**Acceptance Scenarios**:

1. **Given** Customers, **When** the presenter adds a customer with a name and phone,
   **Then** the customer appears in the list as Active and can be picked in a new sale.
2. **Given** a name that matches an existing customer, **When** the presenter saves,
   **Then** saving is blocked with the design's "{name} is already a customer."
   message.

---

### Edge Cases

- Recording a sale on credit without a named customer is blocked with "Pick the customer
  first. Walk-in customers can…" (as in the design).
- Tables whose seed data is empty in the design (Units of measure, Stock management in some
  views, Sales targets per filter) show the design's one-sentence empty state.
- Quantities can never go below zero in a store. Transfers and wastage larger than the
  quantity on hand are blocked.
- Reloading the page restores all seed data (Constitution Principle III) but keeps the
  presenter signed in, as the same role and on the same page. Opening the app in a new
  browser tab stays signed in only if "Remember me" was ticked.
- Modules in the sidebar that are outside this feature (Purchases, Suppliers, Accounts,
  Expenses, Receivables, Payables, Reports, Team, Permissions, Calendar, Messages, File
  Manager, Help, Profile, Settings) are still listed. Opening one shows a plain
  "not built yet in this prototype" page, and links that point to them behave the same way.
- On a phone-width screen, the sidebar collapses and wide tables scroll inside their card,
  as in the design.

## Requirements *(mandatory)*

### Functional Requirements

**Shell, login and roles**

- **FR-001**: The system MUST show the login screen on first load and validate it as the
  design does. An empty or badly formed email/phone, an empty password, or a password shorter
  than 6 characters is rejected with the design's message. Any other input signs in, and the
  role is chosen from the start of the email (`mary…` Accountant, `jane…` Cashier, `grant…`
  Store keeper, anything else Owner), followed by the toast "Welcome back, {first name}.".
  Selecting "Create a free account" MUST show "Sign-ups are not open in this prototype yet."
  It MUST also offer the forgot-password and "Check your messages" views with the design's
  copy.
- **FR-002**: After login, the system MUST show the app shell: a sidebar with the UzaPro logo
  and grouped module list, and a header with search, help, notifications and the user chip.
- **FR-003**: The system MUST support the four demo roles from the design (Owner,
  Accountant, Cashier, Store keeper). Switching roles MUST change the name, greeting, visible
  modules, visible tabs, dashboard quick tasks and attention items.
- **FR-004**: Every module and tab MUST have its own address. Opening an address the
  current role cannot see MUST redirect to that role's Dashboard. Opening any app address
  while signed out MUST show the login screen.
- **FR-004a**: When "Remember me" is ticked on the login screen (the design default), the
  system MUST remember the signed-in role in browser storage, so reloads and new tabs stay
  signed in on the same role. Unticked, the sign-in lasts until reload. No business data may
  be remembered. "Sign out" in the user menu MUST clear this and return to the login screen.

**Dashboard**

- **FR-005**: The Dashboard MUST show every banner, KPI, chart and panel from the design,
  with the design's exact figures. Headline banners, KPI tiles and charts on the Dashboard
  and on the Products, Stock and Sales overviews MUST stay fixed at the design's values and
  MUST NOT change when records are added or changed during the session. "Pending invoices"
  and the "Invoice analytics" panel are computed once from the seed invoice list, as in the
  design, and then stay fixed.
- **FR-006**: The comparative analysis chart MUST offer Bars, Lines and Area views of the
  same data, and both charts MUST show legends and month labels as in the design.
- **FR-007**: Dashboard links and quick tasks MUST open the target module, tab and (where
  defined) form.

**Products**

- **FR-008**: Products MUST provide the Overview, All products, Categories and Units of
  measure tabs, with the design's columns, rows, status pills and panels.
- **FR-009**: Users MUST be able to add a product with a name, category, one or more
  variants (name, buying price, unit, selling price), extra unit prices, a tax setting and an
  optional image. The margin MUST be computed from price and cost.
- **FR-010**: Users MUST be able to add, edit and delete categories and add units of
  measure. Duplicate names, and categories that are still in use, MUST be blocked with the
  design's messages.
- **FR-011**: Users MUST be able to open a product record showing its overview, variants and
  stock movement history.

**Stock**

- **FR-012**: Stock MUST provide the Overview, Stock management, Transfer stock, Wastage and
  Warehouses tabs, with the design's data, store filter and stock-level filter.
- **FR-013**: Users MUST be able to add stock to a store, which increases that store's
  quantity and stock value.
- **FR-014**: Users MUST be able to create transfers with the three submit options, mark
  them received, and cancel them, with statuses Not finished, Confirmed, In transit, Received
  and Cancelled as in the design.
- **FR-015**: Users MUST be able to record wastage with a reason per item. Wastage reduces
  quantity and is listed with its value.
- **FR-016**: The system MUST block any stock movement that would take a store's quantity
  below zero.

**Sales**

- **FR-017**: Sales MUST provide the Overview, All sales, Quotations, Invoices, Refunds
  (credit notes), Voided items and Sales targets tabs, with the design's data and filters.
- **FR-018**: Users MUST be able to record a new sale by choosing a customer and products.
  The subtotal, VAT 16% and total MUST be computed, and the new sale MUST appear in All sales.
  Recording the sale MUST reduce each sold variant's quantity at the sale's store (the store
  set in the design's sale form) and add a "Sold" stock movement with the sale reference and
  the person recording it. A sale for more than the quantity on hand MUST be blocked.
- **FR-019**: Users MUST be able to open a sale and see its products, payments, summary and
  actions (Reprint, PDF, Credit note, Void). Reprint and PDF MUST show the design's
  confirmation messages only; no file is produced.
- **FR-020**: Users MUST be able to create quotations and invoices with lines, a discount
  (amount or percent), VAT and notes, and see the computed totals.
- **FR-021**: Users MUST be able to raise a credit note against a sale (items and credit
  quantities, reason, return-to-stock option, refund method). It is saved as "Waiting
  approval" and can be approved from its view. Returned stock is added back only on approval.
- **FR-022**: Users MUST be able to void a sale with one of the design's reasons. The sale
  then appears in Voided items with who voided it and when. Voiding a sale recorded in this
  session MUST return its items to the store they were sold from. Seeded sales that have no
  item lines in the design are voided without any stock change.
- **FR-023**: Users MUST be able to view and delete sales targets, each showing its target,
  achieved amount, progress and status.

**Customers**

- **FR-024**: Customers MUST list all seeded customers with name, phone, email, address and
  status.
- **FR-025**: Users MUST be able to add a customer (name, phone, email, address). Duplicate
  names MUST be blocked ("{name} is already a customer." when adding; "Another customer is
  already called {name}." when editing, as in the design), and the new customer MUST be selectable in sales forms.

**Cross-cutting**

- **FR-026**: Every completed action MUST show the design's confirmation message, and every
  blocked action MUST show the design's error or empty-state wording.
- **FR-026a**: Every list table MUST offer the design's table toolbar: a search box filtering
  its rows, and "Export CSV", which copies the rows as CSV (column titles as headers) to the
  clipboard and confirms "Copied {n} rows as CSV." ("Copy is not available here." if the
  clipboard is blocked), as the design does.
- **FR-027**: All changes MUST appear immediately in every affected list, stock quantity and
  document total for the rest of the session (headline figures excepted, see FR-005), and
  MUST reset on reload.
- **FR-028**: All money, dates, IDs and numbers MUST follow the design's formats ("KES 4.82M"
  in KPIs, "45,600" in tables with the currency in the column header, "12 Nov 2026",
  `INV-0358`).
- **FR-029**: Modules outside this feature MUST remain visible in the sidebar (subject to role
  filtering). Opening one, or following any link or quick task that points to one, MUST show a
  plain page with the module's name and the line "Not built yet in this prototype." No tabs
  or tables from those modules are shown in this feature.

### Key Entities

- **Role / demo user**: one of four people. Each has a name, a role label, visible modules
  and tabs, dashboard quick tasks and attention items.
- **Product**: name, category, status, tax setting, image, and one or more variants.
- **Variant**: variant name, selling price, buying price (cost), base unit, and extra unit
  prices.
- **Category**: name, description, optional parent, optional image.
- **Unit of measure**: name (from the design's unit list).
- **Store / warehouse**: name, branch, type (Store, Manufacturing, Retail, Transfer).
- **Stock level**: quantity of a product variant held in a store, and its value.
- **Stock movement**: date, product, variant, kind (sold, added, transferred, wasted), store,
  change, quantity left, person, reference.
- **Transfer**: reference, from store, to store, date, notes, items, status.
- **Wastage entry**: reference, location, items with quantity and reason, value.
- **Customer**: name, phone, email, address, status.
- **Sale**: reference, customer, type (tax invoice, sales order, invoice, quotation),
  channel, items, payments, totals, status.
- **Quotation / Invoice**: number, customer, dates, lines, discount, VAT, totals, status,
  balance due.
- **Credit note**: number, customer, original invoice or sale, items, reason,
  return-to-stock flag, amount, status.
- **Void record**: void reference, original sale, customer, date, reason, person, amount.
- **Sales target**: name, scope (whole business, branch, staff member), period, target
  amount, achieved amount.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side review, 100% of the screens, tabs, forms and dialogs in the
  five modules (plus login and the shell) match the design's layout, wording and figures,
  with no unexplained differences.
- **SC-002**: A presenter can log in and reach any of the five modules in 3 clicks or fewer.
- **SC-003**: A presenter can record a new sale with two products in under 60 seconds.
- **SC-004**: For each of the four roles, 100% of the visible modules and tabs match the
  design's role definitions, and no hidden module or tab can be reached.
- **SC-005**: Every write action in the five modules (add, transfer, waste, sell, quote,
  credit, void, delete) shows its result in the affected lists, stock quantities and document
  totals straight away, with no reload.
- **SC-006**: Every screen in scope opens in under 1 second during a demo, and a full
  click-through of all five modules produces no visible errors.
- **SC-007**: After a page reload, 100% of the data matches the original design figures, and
  the presenter is still on the same page as the same role.

## Design deviations

Required by Constitution Principle I. These are the only intended differences from the design.

| Deviation | Reason | Reference |
|---|---|---|
| ~~Modules outside this feature open a plain page reading "Not built yet in this prototype." instead of their designed screens~~ | **Superseded by features 002–006**: every module is now built; the placeholder remains only as a code fallback | Clarification Q1, FR-029 |
| The login accepts only demo@uzapro.com / demo@123 (the Owner) and shows that as a hint under the form; "Create a free account" and its divider are removed | User request after deployment (constitution 1.2.0 › Auth); the design accepts any input | FR-001, US1 |
| A "View as" role select in the account menu | The canvas has role data (`roleOptions`) but no visible switcher; US2 needs one for demos. Logging in as mary@, jane@ or grant@ also picks the role, as the design does | US2, FR-003 |
| Product record drawer (`?view=<name>`: overview, variants, stock history, Edit) | In the canvas a product row opens "Edit product" and stock history opens only from Stock; FR-011 asks for a product record | FR-011 |

## Assumptions

- "Design" means building these sections as working screens in the prototype, as the
  constitution requires, not new visual design work.
- The shell, login and role switching are included in this feature because the five
  sections cannot be shown without them.
- The Sales overview ("salesdash"), Products overview ("prodboard") and Stock overview
  ("stockboard") panels are built exactly as rendered in the design. Their detailed
  contents are taken from the design file during planning.
- Printing, PDF downloads, file uploads to File Manager, sending messages and e-commerce
  channels are simulated with the design's confirmation messages only.
- Header search, help and notifications look and behave as in the design. Typing in search
  filters the rows of the table on the current tab. When nothing matches, the table shows
  "No records match that search." There is no cross-module results list.
- Desktop is the primary demo target. Phone width must remain usable, as in the design.
