# Research: Point of Sale

The source is the canvas files `design/canvas/Uzapoint ERP.dc.html` and `erp-data.js` at version
1794512813:

- the CSS (lines ~35–43);
- the `poslaunch` markup (~902–922);
- the till markup (~2853–3130);
- the launch hook (~3329);
- `posApplySale`, `posStore` and `posVals` (~4074–4264);
- the `UZ_MODS`, `UZ_ROLES.cashier` and `UZ_STOCK.lines` changes.

## R1 Till address (Clarification Q1)

**Decision**: the till is a full-screen overlay rendered by the `poslaunch` screen when the URL has
`?till={id}`. The address is `/point-of-sale/terminals?till=1`.

- Launching a terminal uses `router.push`; Exit uses `router.replace` back to
  `/point-of-sale/terminals`.
- The step (shift, PIN or app) is held in memory. A reload restarts at the shift step, or at the PIN
  step when the shift is open (as the design's launch hook does).

**Rationale**:
- The app is a static export. `[module]/[tab]` already prerenders `/point-of-sale/terminals`, but a
  `/point-of-sale/terminal/[id]` route couldn't prerender terminals added during the session.
- A query parameter follows the app's existing `?action=` / `?view=` convention and keeps the
  RouteGuard and store.

The spec now uses this address in FR-003 and in the deviation.

**Alternatives considered**:
- A new route segment: needs `generateStaticParams` for unknown ids.
- A separate layout outside the shell: duplicates the auth guard.

## R2 Module, role and screen kind

**Decision**:
- Add `"pos"` to `ModuleId`, and `"poslaunch"` to `ScreenKind`.
- Add the module to `MODULES` in the Sales section after Sales: `mod("pos", "Sales", "scan-barcode",
  "Point of sale", "Pick a terminal to start selling", "point-of-sale", [["Terminals",
  "poslaunch"]], true)`.
- Add `"pos"` to the Cashier's `mods` in `config/roles.ts`. The Accountant and Store keeper keep
  their lists, which don't include `pos`.
- Add a `scan-barcode` (`ScanBarcode`) icon, plus `credit-card` if it's missing.
- The page header has no action for `pos`.
- Register `pos: { terminals: { Body: PosLaunch } }` in `src/features/screens.ts`.

The smoke test `navigation.spec.ts`, which visits every visible module and tab per role, will now
cover Point of sale for the Owner and the Cashier.

## R3 Data changes from `erp-data.js`

**Decision**:
- **Stock**: append the five design stock lines to `STOCK_LINES` (fixtures/stock.ts):
  - Carbon Road Frame @ Point of Sale 6;
  - Aluminium Frame @ Point of Sale 5;
  - Racing Wheelset @ Point of Sale 4;
  - Muthokinju Paint @ Point of Sale 12;
  - Groupset @ Point of Sale 3.

  Products' "On hand" is already worked out from the stock levels (`onHandMap`), so the totals
  follow: 141, 170, 20, 12 and 30.
- **Product status pills**: update `PRODUCT_ROWS` to match the design. Muthokinju Paint changes from
  "Out" to "Low stock"; the other changed rows keep their status. Check each row against the new
  `erp-data.js`.
- **Variant stock**: the till needs stock per variant at the terminal's store (the design's
  `stockVariants`). Export the existing pure `variantLevels` logic from `queries-stock.ts` as
  `variantStock(movements, products)(product, store, total)`, so the till and the stock screens
  agree. The seed split covers the new lines because `SEED_QTY` reads `STOCK_LINES`.
- **Existing tests and reports**: stock-related smoke tests and the Stock valuation and Low stock
  reports may shift because of the new lines. Re-run them and update expectations only where the
  design's new data changes them, and note it.

## R4 POS state

**Decision**: add a `pos` slice to `AppState`:

- **Data** (persists for the session):
  - `shifts: Record<terminalId, Shift>`;
  - `held: HeldSale[]`;
  - `settings` (Clarification Q2: in memory, seeded with the design's defaults: sound, stock,
    scan, notes, autoPrint on; askCust off; quick notes "Gift wrap", "No bag", "Deliver later").
- **Session UI** (reset when the till opens):
  - `step`, `who`, `pinWho`, `pin`, `pinErr`, `view`, `q`, `cat`;
  - `cart` and `cust`;
  - discount value, type and whether the editor is open;
  - `noteLine`;
  - `modal` (variant, customer, newcust, checkout, receipt, settings or close) and its fields;
  - the checkout fields: `pays`, `method`, `amt`, `ref`, `phone`, `mpesa`, `note`, `notify`, `err`;
  - the receipt fields: `rcpt`, `fresh`;
  - `cartOpen`.

The seed for terminal 1 comes from `posStore`'s `mk` helper:
- an open shift by Tony Blaise, 09:05 on 10 Nov 2026, with a KES 5,000 float, started 3h 12m before
  the till opens;
- six sales, SAL-POS-0006 to SAL-POS-0001, with their lines, methods and payment references.

These six are kept as POS sale documents (`posSales`) linked to the shift. They are **not** added to
Sales › All sales, because the design keeps them only in `UZ_SALEDOCS`, outside the All sales rows.

**Alternatives considered**: component state. That would lose the shift and held sales between
launches, and settings would have nowhere to live.

## R5 Completing a sale (`posApplySale`)

**Decision**: a command, `completePosSale()`, that:

1. Validates as the design does (credit needs a named customer; M-Pesa or card can't exceed what's
   due; everything must be covered).
2. Gives the sale the next app-wide number: `sales.saleNo + 1` gives SAL-001185 first, shared with
   New sale.
3. Builds a `Sale`:
   - channel "POS", type "POS sale", store = the terminal's store, by = the seller;
   - lines with `taxable: true` and the variant;
   - `payments` with the methods and references;
   - status Paid, or Unpaid when there's a credit part;
   - `session: true`, so a void returns the stock;
   - plus a `PosSaleDoc` with the terminal, note, discount, tendered and change.
4. Applies stock changes at the terminal's store through `applyStockChanges` with `KIND.sold`. The
   design doesn't block shortfalls; levels floor at 0.
5. Posts each payment through `post()` as a `"Sale"` ledger entry ("POS sale, {terminal}"), dated
   10 Nov 2026, to the payment method's account:
   - Cash → Cash drawer;
   - M-Pesa → M-Pesa Till;
   - Card → Equity Bank — Main.

   `"Sale"` is added to `LedgerKind`.
6. For a credit part, calls `addReceivable` (type "Sale on credit", due in 30 days).
7. Adds the reference to the shift, clears the cart, and opens the receipt.
8. Shows the toasts "Receipt printing…" and/or "Receipt sent by SMS and Email.".

Totals follow the design, not `docTotals`. Prices include VAT, so `total = gross − discount`,
`vat = round2(total × 16/116)` and `subtotal = total − vat`. The `Sale` stores those figures.

## R6 Variant prices, codes and categories

- **Prices**: from `UZ_VARIANTS` (already in fixtures). Tile prices show "From KES {min}" when
  variants differ. Single-variant products add directly at their variant price.
- **Product codes for the barcode box**: the first three letters of each word, then "-" and the
  variant with spaces removed, lower-cased (`bikpum-standard`). A match on "name variant", or a
  partial name match, also counts. A multi-variant partial match opens the variant chooser.
- **Category palette**: the design's six tint and ink pairs. These are content colours, not UI
  tokens, so they become named tokens (`--pos-tint-1..6`, `--pos-ink-1..6`) in `tokens.css`, as
  Principle IV requires for special colours. The seller avatar colours (four pairs) and the
  receipt's paper colour (`#FFFEF9`) become `--pos-avatar-*` and `--receipt-paper` tokens in the
  same way.

## R7 Simulations

- **M-Pesa request**: validates the phone against the design's Safaricom pattern, then waits
  1,800ms. The code is `"S" + 9 random uppercase alphanumerics`. Status text and button labels are
  the design's.
- **Sound**: a 0.07s, 880Hz WebAudio beep, created lazily and wrapped in try/catch; nothing plays if
  sound is off or audio is blocked.
- **Print, SMS and email**: toasts only.

## R8 Layout and accessibility

- **Overlay**: `fixed inset-0 z-[250]`, above the shell, drawers and toasts. Toasts stay visible
  because their layer is raised above the till while it's open.
- **Rail and header**: the rail is a `nav` labelled "Point of sale" with `aria-current` on the active
  view. The header shows the seller chip and, on narrow screens, the cart button.
- **Narrow screens**:
  - below 1100px the cart is 340px wide;
  - below 860px it becomes a fixed slide-in panel (translateX), opened by the header's cart button;
  - below 860px the checkout grid stacks, order rows drop their Items and Time columns, and the
    header's seller chip is hidden;
  - below 760px the PIN grid stacks.
- **Dialogs**: built on the existing `Modal` (focus trap and Escape) and `Drawer` for Settings, with
  POS styling (20px radius). The PIN pad has a labelled group and focus on the pad.
- **Settings switches**: `role="switch"` checkboxes using a `.uz-switch` style ported to
  globals.css.
- **Uza AI**: the launcher hides while `?till` is set.

## R9 Testing

- **Vitest** (`tests/unit/pos.test.ts`):
  - totals with % and KES discounts, and the discount cap;
  - quick cash amounts;
  - product-code matching;
  - X-report collections and expected cash;
  - close difference and labels;
  - shift seed totals (6 sales; collections by method);
  - `completePosSale` effects: sale row, stock, ledger, receivable for credit, number SAL-001185.
- **Playwright** (`tests/smoke/pos.spec.ts`): quickstart 1–9.
- **Responsive**: the till at 320px (sell view, cart panel, checkout), plus the accessibility scan.
- **Existing suites**: `navigation.spec.ts` for the Cashier gains the module automatically.
