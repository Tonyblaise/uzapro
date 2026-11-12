# Feature Specification: Point of Sale

**Feature Branch**: `010-point-of-sale`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "I added a feature called point of sale"

## Scope at a glance

The updated canvas (version 1794512813) adds a **Point of sale** module to the Sales section of the
sidebar (icon: scan-barcode; subtitle "Pick a terminal to start selling"). It has one tab,
**Terminals**, which lists the business's tills. From there the presenter launches a **full-screen
till app**. The till runs in four stages:

1. **Open shift**: count the opening cash in the drawer, or continue a shift that is already open.
2. **Secure login**: pick who is selling, then enter a 4-digit PIN. The demo PIN is 1234.
3. **Selling**: a left-hand rail with Sell, Today, Orders, People and Shift, plus Settings, Lock and
   Exit. The main view shows product tiles. A cart runs down the right-hand side.
4. **Checkout and close**: take payment by cash, M-Pesa, card or pay later, with split payments.
   Show the receipt. At the end, close the shift with a cash count.

A POS sale updates the rest of the demo:
- it appears in Sales › All sales;
- stock drops at the terminal's store;
- money lands in the matching account (cash drawer, M-Pesa Till, or the main bank account for card);
- a pay-later sale adds a receivable;
- a new customer added at the till appears in Customers.

The design's `erp-data.js` also changes:
- a `pos` module;
- the Cashier role can now open it;
- new stock at the Point of Sale store (Carbon Road Frame 6, Aluminium Frame 5, Racing Wheelset 4,
  Muthokinju Paint 12, Groupset 3), with the matching "On hand" totals in Products.

## Clarifications

### Session 2026-11-12

- Q: Should the till open in the same tab or a new browser tab, as in the design? → A: Full-screen in
  the same tab, at its own address (`/point-of-sale/terminals?till={id}`), so POS sales update All sales,
  stock, accounts and receivables. Exit returns to UzaPro.
- Q: Should till settings be remembered across reloads (a new browser-storage key)? → A: No. They
  last for the session only, and the subtitle reads "Saved for {terminal} in this session". There is
  no constitution change.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ring up a sale at a till (Priority: P1)

The presenter opens Point of sale, sees "Terminal 1" with its shift already open, and chooses
"Continue selling". They pick their name, enter PIN 1234, tap a Bike Pump tile and a Helmet (choosing
"Medium"), choose **Charge**, and pay KES 3,000 in cash. The checkout shows the change to give. They
choose **Complete sale** and the receipt appears.

**Why this priority**: selling is the reason a point of sale exists. Everything else supports it.

**Independent Test**: with no setup:

1. Open Point of sale › Terminals and choose "Continue selling" on Terminal 1.
2. At the PIN screen, keep the current user selected and type 1234.
3. Tap Bike Pump, then Helmet. Choose Medium, then "Add 1 · KES 1,639.00".
4. Choose Charge, then type 3000 as the cash received. "Give change KES 1,016.00" shows.
5. Choose Complete sale.

The receipt reads "Sale complete" and lists 1 × Bike Pump and 1 × Helmet Medium, with a TOTAL of
1,984.00. The sale is listed first in Sales › All sales.

**Acceptance Scenarios**:

1. **Given** Point of sale › Terminals, **Then** each terminal shows on a card with:
   - a scan icon, the name ("Terminal 1") and "{branch} · {store}" ("Nairobi HQ · Point of Sale");
   - a status pill: "Shift open" (amber), "Closed" or "Inactive";
   - two facts. With an open shift these are "Opened by {name}, {time}" and "Sales this shift {n} ·
     KES {total}". Otherwise they are the terminal "Code" and when it was "Last closed";
   - a large button: "Continue selling", "Open shift", or a disabled "Terminal is off".

   Below the cards is the line "Need another till? Add terminals in Settings › Terminals." with a
   "Manage terminals" link to Settings › Terminals. The page header has no action button.
2. **Given** the seed, **Then** Terminal 1's shift is already open:
   - opened by Tony Blaise at 09:05 on 10 Nov 2026, with KES 5,000 opening cash;
   - six sales already made (SAL-POS-0001 to SAL-POS-0006), matching the design's sales and
     payment methods.
3. **Given** a terminal is launched, **Then** a full-screen till covers the app. The Uza AI
   launcher and the app shell are hidden. A step bar shows "1 Terminal · 2 Open shift · 3 PIN".
   - **Open shift step**: either a card "Shift opened by {name}, {date}, {time} · opening cash KES
     {float}" with "Continue to PIN", or "Opening cash in the drawer (KES)" with quick amounts (KES
     1,000 / 2,000 / 5,000 / 10,000), the counting hint, and "Open shift".
   - **PIN step**: "Secure login", the terminal name, "Pick your name, then enter your 4-digit
     PIN", a "Who is selling?" list of the four demo people (the shift opener marked "· opened this
     shift"), four PIN dots, a keypad (1–9, Clear, 0, Delete) and "Demo PIN: 1234". The PIN works
     from the keyboard too: digits, Backspace, and Escape to clear.
   - A wrong PIN shakes the dots and shows "That PIN is wrong. Try again.".
   - "Back to UzaPro" leaves the till.
4. **Given** the Sell view, **Then**:
   - **Header**: "{terminal} · {store}" over "Sell"; a search box ("Search products, variants or
     categories"); the seller's chip ("{name}", "On shift {h}h {m}m").
   - **Category chips**: "All" and one per product category, each with a count.
   - **Product tiles**: a coloured initials block or the product photo, the name, "{n} options ·
     {category}" or the category, the price ("From KES …" when variants differ), a "{n} left",
     "None here" or low-stock badge for the terminal's store, and a cart-quantity badge.
5. **Given** a product with one variant, **When** its tile is tapped, **Then** it is added to the
   cart. For several variants, a "Choose a variant" dialog appears:
   - each option shows its price and "{n} in stock here" or "None in stock here";
   - a quantity stepper;
   - a button reading "Add {qty} · KES {amount}".
6. **Given** the cart, **Then** it shows:
   - **Customer**: "Walk-in Customer" ("Default customer · tap to change") with a Change control;
   - an optional barcode box: "Scan or type a product code, then Enter". Matching uses the design's
     product code or name;
   - **Cart heading**: "Cart" with an item count and "Clear";
   - **Lines**: each with name, variant and unit price, a line total, − and +, "Note" and remove.
     When the quantity is more than is in stock here, the line warns "Only {n} in stock here".
   - **Totals**: "Subtotal (before VAT)"; a "Discount" control ("+ Add" opens an amount box and a
     KES / % switch); "VAT 16% (included)"; and the Total;
   - **Actions**: "Hold" and "Charge {total}". Both are disabled when the cart is empty.

   An empty cart reads "The cart is empty" and "Tap a product or search to add it.".
7. **Given** Charge, **Then** a Checkout dialog opens:
   - **Left column**: "Amount due"; Paid and Still due / Due tiles; the item lines (and a discount
     line); any payments already added; and a "Sale note".
   - **Right column**: "Pay with" (Cash, M-Pesa, Card, Pay later), the amount field, and per method:
     - **Cash**: a keypad and quick amounts (Exact, then rounded-up values);
     - **M-Pesa**: the customer's phone with "Send request", which waits about 2 seconds, then
       shows "Payment received. Code {code} added below."; and an "M-Pesa code" field;
     - **Card**: "Card reference (optional)".
   - "Add as part payment and split the rest" appears when less than the amount due is entered.
   - "Give change" appears for cash over the amount due.
   - "Send receipt" toggles for Print, SMS and Email. Print is on by default.
   - The button reads "Complete sale", "Take payment first" or "Complete on credit".
8. **Given** checkout, **When** completing, **Then** the design's checks apply:
   - "Pick a named customer to sell on credit." (pay later for a walk-in);
   - "{method} payment can't be more than what is due." (M-Pesa or card over the amount);
   - "KES {amount} is still due. Add another payment or pay the full amount.".

   On success:
   - the sale gets the next sale number (SAL-001185 first);
   - the receipt opens with "Sale complete", the change to give, and a printable-looking slip:
     business name and address, terminal, "Served by", the reference and time, the customer, lines
     and notes, subtotal, discount, VAT and TOTAL, payments, cash given and change, the note, and
     "Prices include VAT at 16%. Thank you for shopping with us!";
   - a toast reads "Receipt printing…" when Print is on, and "Receipt sent by SMS and Email." for the
     others;
   - the receipt's buttons are Print ("Receipt sent to the printer."), Send ("Receipt sent to the
     customer.") and "New sale".
9. **Given** a completed sale, **Then** the rest of UzaPro reflects it:
   - Sales › All sales lists it first, as a POS sale;
   - stock at the terminal's store drops, and a "Sold" stock movement is recorded;
   - each payment adds an incoming "Sale" transaction: cash to Cash drawer, M-Pesa to M-Pesa Till,
     card to Equity Bank — Main. The account balances rise accordingly;
   - a pay-later sale (named customer) adds a receivable due in 30 days, and the sale is marked
     Unpaid.

---

### User Story 2 - Open and close a shift (Priority: P1)

At the start of the day the presenter opens a shift with the cash in the drawer. At the end, they
review the X-report on the Shift view, count the cash, and close the shift. Any shortage or surplus
is shown before they confirm.

**Why this priority**: cash control is part of every real till, and the design puts it on the path
into the till.

**Independent Test**: close Terminal 1's open shift.

1. Go to Shift, then "Close shift".
2. Enter KES 9,000. The dialog shows "Short by" or "Over by" against the expected cash.
3. Confirm. The toast reads "Terminal 1 shift closed. …". The till closes, and the terminal card now
   reads "Closed" with "Open shift".
4. Open a new shift with KES 2,000. The toast reads "Shift opened on Terminal 1.". The PIN step
   follows.

**Acceptance Scenarios**:

1. **Given** a closed terminal, **When** opening a shift, **Then**:
   - a blank or negative amount shows the toast "Enter the opening cash. Use 0 if the drawer is
     empty.";
   - a valid amount opens the shift, recording the seller, the time, the date 10 Nov 2026 and the
     float.
2. **Given** the Shift view, **Then** the "X-report · so far" card shows:
   - "Shift collections";
   - Opened by, Opened at and the number of sales;
   - rows for Opening cash, Cash, M-Pesa, Card, On credit and Total sales;
   - "Expected cash in drawer" (the float plus cash payments).

   Beside it, an "End of shift" card has the counting text and a danger "Close shift" button.
3. **Given** the Close shift dialog ("{terminal} · opened {time}"), **Then** it shows:
   - Expected cash in drawer;
   - "Cash you counted (KES)", with a live "Drawer balances", "Over by" or "Short by" line;
   - "Note (optional)";
   - Cancel and Close shift buttons.

   With no count, it shows "Enter the cash you counted.". Confirming closes the shift (recording
   the time, count and difference), exits the till, and shows a toast ending "The drawer balanced."
   or "Over by" / "Short by" KES {amount}.

---

### User Story 3 - Customers, held sales and orders at the till (Priority: P2)

The presenter sells to a regular customer, adds a new customer from the till, parks a sale while
serving someone else, resumes it, and looks up an earlier receipt.

**Why this priority**: these make the till realistic, but a basic walk-in sale works without them.

**Independent Test**:

1. In the cart, choose "Change" and search "Morn". Pick Morningview Bicycles. The cart shows their
   phone number and what they owe.
2. Add a product, then choose "Hold". The toast reads "Sale put on hold. Find it under Orders.".
   Orders shows "On hold · Morningview Bicycles" with Resume, and the rail's Orders badge shows 1.
3. Resume it: the toast reads "Sale resumed.".
4. Open SAL-POS-0005 from Orders. "Receipt SAL-POS-0005" shows with its M-Pesa reference.
5. Add a new customer "Grace Wanjiru". The toast reads "Grace Wanjiru added to customers.", and she
   appears in Customers › Customers.

**Acceptance Scenarios**:

1. **Given** the customer picker ("Who is this sale for?"), **Then** it shows:
   - "Name or phone number" search;
   - a "Walk-in customer / No name needed" option;
   - matching customers, each with phone and "Owes KES …" or "Nothing owed";
   - "No one matches. Add them as a new customer." when nothing matches;
   - "New customer" and Cancel.
2. **Given** "New customer", **Then** the form has "Name" (for example, Grace Wanjiru), "Phone
   number" and "Save and select". The checks are "Enter the customer's name." and "A customer with
   this name already exists.".
3. **Given** the People view, **Then** it shows customer cards: initials, name, phone, what they
   owe, and "Sell to {first name}" or "Selected". There is an "Add customer" button, and the search
   box filters the cards.
4. **Given** the Orders view ("Orders this shift"), **Then**:
   - held sales come first: "On hold · {customer}", "{n} items · parked at {time}", the total,
     Resume and Discard;
   - this shift's sales follow, each showing the reference, "{customer} · {methods}", Items, Total,
     Time and a Paid or On credit pill. Selecting one opens its receipt ("Receipt {ref}", with a
     "Done" button);
   - the search box filters by receipt number or customer;
   - "No sales on this shift yet." shows when there are none.

---

### User Story 4 - Today's numbers and till settings (Priority: P3)

The presenter shows the shift dashboard and tunes the till's settings.

**Why this priority**: useful polish, but not part of making a sale.

**Independent Test**: open Today. It shows "Today on Terminal 1":
- KPI tiles: Sales this shift, Paid orders, Average sale, Items sold;
- "Best sellers this shift" with "See orders";
- a "Sales by hour" bar chart from 08:00 to 19:00 with the busiest hour named.

Open Settings and turn off "Show stock on products": the stock badges disappear from the tiles. Add
the quick note "No box" and use it on a cart line.

**Acceptance Scenarios**:

1. **Given** Today, **Then** the figures come from this shift's sales:
   - KPI tiles: total, paid orders, average sale, and units;
   - the top 5 products by amount;
   - hourly totals, with the peak hour highlighted and "Busiest: {h}:00 – {h+1}:00", or "No sales
     yet".
2. **Given** Settings ("Terminal settings · Saved for {terminal} in this session"), **Then** it has
   switches for:
   - Sound (a short beep when an item is added);
   - Show stock on products;
   - Barcode box;
   - Item notes;
   - Print receipts (by default);
   - Ask who each sale is for (open the customer picker after every sale).

   It also has "Quick item notes" (seeded "Gift wrap", "No bag", "Deliver later") that can be added
   and removed. The notes appear as chips under a cart line's Note.
3. **Given** Lock, **Then** the till returns to the PIN step without losing the cart. Exit returns
   to UzaPro.

---

### Edge Cases

- **Roles**:
  - The Owner and the Cashier see Point of sale. In the design the Cashier gains the `pos` module,
    and the Owner sees every module.
  - The Accountant and the Store keeper don't see it.
  - Anyone at the PIN step can pick any of the four demo people as the seller.
- **Inactive terminals** show "Inactive" and a disabled "Terminal is off" button.
- **Stock**:
  - Selling more than is in stock at the terminal's store is allowed, with the cart warning.
    Stock can't go below 0.
  - Tiles show "None here" with a red badge when there's none.
- **Pay later**:
  - It is only allowed for a named customer. For a walk-in, the dialog shows "Pick a named customer
    first. Walk-in customers can't buy on credit.".
  - The full remaining amount goes to Receivables, due in 30 days ("{amount} will be added to
    {customer}'s balance in Receivables, due in 30 days.").
- **Split payments**: payments already added can be removed. After a split, the method switches
  (Cash → M-Pesa, others → Cash) as in the design.
- **M-Pesa request** needs a Safaricom-format number. Otherwise it shows "Enter the customer's
  Safaricom number, for example 0712 345 678.". Nothing is really sent (Constitution Principle II).
- **Barcode box**: an unknown code shows "No product matches "{code}".". A product with several
  variants opens the variant chooser.
- **Discount**: it can't exceed the cart value. A percentage applies to the cart value.
- **Phones and narrow screens**: below 860px the cart becomes a slide-in panel opened by a cart
  button in the header showing the item count. The checkout dialog stacks into one column. Order rows
  drop their Items and Time columns. The PIN screen stacks. No sideways page scrolling happens at
  320px.
- **Reload**: a reload resets the demo data, and with it the till, to the seed (Terminal 1 open with 6 sales). The till reopens at its address, at the shift step or the PIN step.
- **Uza AI**: the launcher and panel are hidden while the till is open.

## Requirements *(mandatory)*

### Functional Requirements

**Module and launch**

- **FR-001**: The sidebar's Sales section MUST include "Point of sale" (scan-barcode icon) with one
  tab, Terminals, and no header button. The design's role change applies: the Cashier gains access,
  as the Owner already has.
- **FR-002**: The Terminals tab MUST list the terminals from Settings › Terminals with the design's
  card, status pill, facts and button (User Story 1, scenario 1), plus the "Manage terminals" link.
- **FR-003**: Launching a terminal MUST open the full-screen till in the same browser tab, at its own
  address (`/point-of-sale/terminals?till={id}`, Clarification Q1), so sales flow into the rest of the
  demo. "Back to UzaPro" and Exit return to Point of sale › Terminals. Reloading the till's address
  reopens it at the right step for that terminal.

**Shift and login**

- **FR-004**: The till MUST start at the open-shift step (or the PIN step when a shift is open), with
  the design's step bar, copy, quick floats and validation.
- **FR-005**: The PIN step MUST accept the demo PIN 1234 by keypad or keyboard, show the error and
  shake for a wrong PIN, and let the presenter pick the seller from the four demo people.
- **FR-006**: The Shift view and Close shift dialog MUST compute the X-report and the difference as
  in User Story 2, and closing MUST end the shift and leave the till.

**Selling**

- **FR-007**: The Sell view MUST show the category chips, product tiles, search, stock badges and
  cart-quantity badges described in User Story 1. Products marked Inactive are left out. Stock is
  the terminal's store stock from the live data.
- **FR-008**: The cart MUST support adding (with the variant chooser), quantity changes, removal,
  clearing, item notes with quick-note chips, discounts in KES or %, the barcode box, and the
  customer picker. Totals MUST follow the design: prices include VAT; VAT = total × 16/116;
  subtotal = total − VAT.
- **FR-009**: Hold MUST park the cart (with its customer and time) in Orders. Resume MUST restore
  it, and Discard MUST drop it. The Orders rail item MUST show the number of held sales.
- **FR-010**: Checkout MUST support Cash (keypad, quick amounts, change), M-Pesa (simulated
  request, code), Card (optional reference), Pay later (named customers only), split payments, a
  sale note and receipt toggles, with the design's validation messages and button states.
- **FR-011**: Completing a sale MUST:
  - give it the next sale number;
  - add it to Sales › All sales as a POS sale (Paid, or Unpaid when on credit);
  - reduce stock at the terminal's store and record a Sold movement;
  - post each payment to its account as a Sale transaction;
  - create a receivable due in 30 days for any pay-later part;
  - add it to the shift;
  - show the receipt.
- **FR-012**: The Orders view MUST list this shift's sales and open any receipt. The People view
  MUST list customers to sell to and add new ones. A new customer MUST be added to the customer
  list.
- **FR-013**: The Today view MUST show the shift KPIs, best sellers and sales-by-hour chart.
- **FR-014**: Terminal settings MUST include the six switches and quick-note management, and each
  setting MUST take effect at once.
  Settings last for the session and reset on reload (Clarification Q2). The settings subtitle
  reads "Saved for {terminal} in this session".
- **FR-015**: Lock MUST return to the PIN step and keep the cart. Exit MUST return to UzaPro.

**Data and general**

- **FR-016**: The design's data changes MUST be applied:
  - the `pos` module;
  - the Cashier's access;
  - the new Point of Sale stock lines and the matching product "On hand" figures;
  - the seeded Terminal 1 shift with its six sales (the seller shown as the demo Owner, Tony
    Blaise).
- **FR-017**: The design's text MUST be used exactly (labels, placeholders, messages, toasts), except
  where Design deviations says otherwise.
- **FR-018**: The till MUST be keyboard- and screen-reader-usable:
  - labelled rail buttons, with `aria-current` on the active view;
  - `aria-pressed` on picks;
  - dialogs that trap focus and close on Escape;
  - a labelled PIN pad.
- **FR-019**: The till MUST work from 320px wide without sideways page scrolling, using the design's
  slide-in cart below 860px.
- **FR-020**: Nothing MUST be sent over the network. M-Pesa requests, SMS, email and printing are
  simulated with the design's messages.

### Key Entities

- **Terminal**: from Settings › Terminals. It has an id, name, code, branch, store and whether it is
  active.
- **Shift**: per terminal. It records whether it is open, who opened it and when, the opening float,
  the start time, its sale references, and (when closed) the closing time, count and difference.
- **Cart line**: product, variant, unit price, quantity and an optional note.
- **Held sale**: the customer, the cart lines and the time it was parked.
- **POS sale document**:
  - reference, date, time, customer, terminal and store;
  - lines;
  - subtotal, VAT, discount and total;
  - note;
  - payments (method, reference, amount);
  - seller, cash tendered and change.

  It appears in Sales as a sale with channel POS.
- **Till settings**: sound, show stock, barcode box, item notes, print receipts, ask for customer,
  and quick notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From Point of sale, a presenter can complete a two-item cash sale, PIN included, in
  under 60 seconds and 10 actions.
- **SC-002**: After a POS sale, Sales › All sales, the stock at Point of Sale, the relevant account
  balance and (for pay later) Receivables all reflect it, in 100% of checks.
- **SC-003**: Every validation message in the design (shift, PIN, credit, over-payment, still due,
  M-Pesa number, new customer, close shift) can be triggered and reads exactly as designed.
- **SC-004**: A shift can be opened, sold through, and closed with the correct expected cash and
  difference.
- **SC-005**: The till passes the automated accessibility scan with no serious or critical issues,
  and shows no sideways page scrolling at widths of 320, 360, 375, 390, 414 and 430px.
- **SC-006**: All existing smoke tests still pass, including role visibility for the Cashier.

## Assumptions

- **The canvas is the source**: this spec was written from the canvas file
  `design/canvas/Uzapoint ERP.dc.html` and `erp-data.js` (version 1794512813, now saved in the
  repository). The `poslaunch` markup, the till markup, `posStore`, `posVals` and `posApplySale`
  define the behaviour.
- **Seed seller**: the design names Tony Ashiuma as the seller on the seeded shift and sales. Here
  that is the demo Owner, Tony Blaise (the renaming from 2026-11-12).
- **Sale numbers**: POS sales continue the app's existing sale numbering. The design starts at
  SAL-001185; if our existing counter is already further on, the next number in that series is used.
- **Product codes for the barcode box** follow the design: the first three letters of each word,
  then "-" and the variant (for example "BikPum-Standard"). The product name, or "name variant", also
  matches.
- **Sound** is a short beep from the browser when enabled. Nothing is played when it is off or the
  browser blocks audio.
- **The Help module** is unchanged, even though the design's Cashier still lists the old Help tabs.
  Feature 007 replaced Help with the Help Center.

## Design deviations

Required by Constitution Principle I. These are the only intended differences from the canvas.

| Deviation | Reason | Reference |
|---|---|---|
| The seeded shift and sales are by Tony Blaise, not Tony Ashiuma | The demo Owner was renamed (feature 001 deviation, 2026-11-12) | FR-016 |
| The till opens full-screen in the same tab at `/point-of-sale/terminals?till={id}`, not in a new browser tab; the "Not linked to UzaPro" state and "Close POS tab" label are not used | A new tab can't share the in-memory demo data, so its sales wouldn't reach the rest of the app (Clarification Q1) | FR-003 |
| Till settings last for the session; the subtitle reads "Saved for {terminal} in this session" instead of "on this device" | Constitution Principle III forbids new browser-storage keys (Clarification Q2) | FR-014 |
| The receipt footer reads "Thank you for shopping with us." instead of the canvas's "Thank you for shopping with us!" | Constitution Principle IV forbids exclamation marks | FR-017 |
| Below 860px the slide-in cart has its own "Close cart" button | The canvas's cart panel covers the header button that opens it, leaving no way to close it on a phone (Principle IV) | FR-019 |
| The till (entry steps and app) is a modal dialog named "{terminal} till", and the toast layer sits above it | Screen readers stay inside the till, and the till's toasts stay visible (analysis U1) | FR-018 |

Visual review (T029, 2026-11-12): the terminals, PIN, sell, cart, checkout, receipt, Today, Orders, People, Shift and Settings views were compared with the canvas markup at 1440px and 375px. There are no differences beyond the rows above.

The "Sale complete" receipt is the sale's confirmation. The toast follows the receipt toggles, as in the design ("Receipt printing…" when Print is on).
