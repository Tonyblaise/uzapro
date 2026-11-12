# Research: Purchases and Suppliers

**Feature**: `002-purchases-suppliers` | **Date**: 2026-11-12

Design facts were read from the logic script of `design/canvas/Uzapoint ERP.dc.html` (`poDoc`,
`poOpen`, `poFinish`, `poAccept`, the receive drawer `rv` and its `save`, the purchase return
`finish`/`prtStock`, `supSave`, the overview `v.bKpis`/`bStatus`, the Stock in `stSubmit`) and from
`design/canvas/erp-data.js` (`UZ_MODS` › buy / vend, `UZ_BUY`). The stack, data seam, store,
routing and testing decisions from feature 001 (`specs/001-dashboard-sales-stock/research.md`)
apply unchanged.

## R1. Purchase order lifecycle

- **Design facts**:
  - New order: "Save" → status **Draft**, "Save and approve" → **Approved**. Received is **None**.
    The activity starts with "Order created" (who · order date); approving adds "Sent to supplier";
    ticking "Already paid" adds "Paid by {method}".
  - Row actions: View, Edit, **Accept** (disabled when Accepted or Completed), **Accept and receive
    goods** (disabled when Completed; it opens the receive drawer), Download PDF ("Downloading
    {ref}.pdf.").
  - Receiving sets Received **Partial**/**Full** and status **Accepted**/**Completed**.
  - The overview groups statuses into stages: Draft, Sent (To receive), Accepted (Approved),
    Delivered (Completed), Cancelled.
  - The reference is `PUR-ORD-` + (highest number + 1), padded to 4. The total is
    Σ qty × cost, rounded.
  - Defaults: store "Main Store", date 2026-11-01, term "Cash on delivery", method "Cash".
- **Decision**: implement exactly this. The status set is
  `Draft | Approved | To receive | Accepted | Completed | Cancelled` and received is
  `None | Partial | Full`.

## R2. Seed order and receipt details

- **Design facts**: `poDoc(row)` gives each seed order one placeholder line,
  `{ key: "Items on {ref}", qty 1, unit "Piece", cost = row total }`, with store "Main Store",
  date 2026-10-28, term "Cash on delivery", method "Bank transfer", `paid` = Completed, and activity
  "Order created" plus "Sent to supplier" unless the order is a Draft. Seed goods receipts are
  rebuilt by `grnInfo` from their order.
- **Decision**: port `poDoc`/`grnInfo` as pure derivations in the seed. Placeholder lines have no
  " · " product key, so receiving them changes no product stock, exactly as the design behaves
  (its `stockAdjust` is skipped when `cut < 0`). The quickstart uses a new order with real products
  to show stock rising.

## R3. Receiving goods

- **Design facts**:
  - Each line has received, accepted (≤ received) and rejected (= received − accepted) quantities.
    "Receive all as ordered" and "Accept all received" fill the quantities.
  - Saving:
    - creates `GRN-` (highest + 1) with status **Saved**
    - for every accepted product line: `stockAdjust(+acc)` at the destination store, plus a
      **Received** movement whose reference is the GRN
    - for every rejected line: `REJ-` (highest + 1) with reason "Rejected on delivery" and status
      **Waiting**
  - The order's activity gets "Accepted" (if not already) and "Goods received". Its
    received/status are updated.
  - If the order is unpaid and the value is above 0, a Payables bill `PYB-` is added.
  - Toast: "{GRN} saved. {acc} accepted into {store}." plus " {PYB} added to Payables." when a bill
    was added.
- **Decision**: implement it all, except that Payables is out of scope (spec FR-018). The `PYB-`
  reference is computed from the design's payables seed numbering and shown in the toast, but no
  record is kept. Receiving can never exceed what is still outstanding on a line.

## R4. Purchase returns

- **Design facts**:
  - Steps: (1) supplier filter (optional) → purchase order → goods receipt, (2) reason and notes,
    (3) items with "Can return" and a return quantity.
  - Reference `PRT-` (highest + 1).
  - Row: [ref, supplier, PO, GRN, reason, qty, value, status], with status **Approved** ("Submit and
    approve") or **Waiting approval** ("Submit only").
  - Approving (on submit, or later with the row action "Approve") runs `prtStock`, which reduces
    stock at the receipt's store and logs a movement.
  - Toasts: "{ref} approved. Stock reduced." / "{ref} submitted for approval." / "{ref}
    approved." (row action).
  - The order's activity gets "Returned to supplier".
- **Decision**: implement as designed. The return movement uses the existing feature 001 stock
  operations, which also enforce stock ≥ 0. The design's return movement kind should be checked
  in `prtStock`; use "Returned to supplier" if present.

## R5. Rejected items

- **Design facts**: the rejected-item view offers "Mark sent back" (Sent back, info), "Mark
  replaced" (Replaced, success) and "Write off" (Written off, danger). Toasts read "{ref} marked as
  sent back." / "marked as replaced." / "written off.". Once one is done, no actions remain.
- **Decision**: implement as designed. No stock effect (rejected units never entered stock).

## R6. Suppliers

- **Design facts**:
  - Type is "Individual" or "Business" (seed rows say "Business"). The name label is "Full name"
    or "Registered business name".
  - Fields: primary phone, primary email, nationality (default Kenya, from `UZ_NATIONS`, can
    create new), active switch, street or building, town or city, county, postal address.
  - Buttons: "Create supplier" / "Save changes".
  - A duplicate name gives "{name} is already in the list.". Add gives "{name} added."; edit gives
    "Changes saved.".
  - New suppliers are appended. Empty fields show "—".
  - When the form is opened from another form (Stock in, PO), saving returns to that form with the
    new supplier selected.
- **Decision**: implement as designed. Suppliers become a store slice seeded from
  `src/data/fixtures/suppliers.ts` (created in feature 001's follow-up). `useSuppliers()` (now in
  `queries-stock.ts`) moves to read active suppliers from the slice.

## R7. Overview figures

- **Design facts**:
  - KPIs are derived from the lists: total orders, total spend (Σ PO totals) with `UZ_BUY.spendDelta`,
    active suppliers, goods received (count of GRNs), avg lead time `UZ_BUY.leadTime`, orders pending
    (count "To receive"), rejected items (Σ qty), returns (Σ qty).
  - Charts are `UZ_BUY.orders` and `UZ_BUY.spend` (ticks "KES {n}K").
  - Also shown: a status-stage bar, "Delivered on time" from `UZ_BUY.onTime`, and "Recent orders".
- **Decision**: follow feature 001's rule (FR-005 there, FR-011 here). The KPI figures are computed
  once from the seed and frozen. "Recent orders" is a list, so it reads live data.

## R8. "Send to Purchases" from Stock in

- **Design fact**: if "Skip Purchases" is unticked, the submit adds a Goods receipts row
  `[GRN-…, "—", supplier, store, lineCount, Waiting]` and toasts "Sent to Purchases.". Stock is
  unchanged.
- **Decision**: replace feature 001's toast-only `sendStockToPurchases` with this behaviour. The
  GRN number follows the same `GRN-` sequence as receipts. A Waiting receipt has no order and is
  view-only in this feature.

## R9. Module scope and roles

- **Decision**:
  - Set `inScope: true` for `buy` and `vend` in `src/config/modules.ts` and register their screens.
  - The role tab lists already exist in `src/config/roles.ts`: Accountant `buy` = Overview,
    Purchase orders, Purchase returns, Rejected items; Store keeper `buy` = Purchase orders, Goods
    receipts, Purchase returns, Rejected items.
  - Suppliers have one tab, visible to the Owner, Accountant and Store keeper.
  - Feature 001's role smoke test automatically covers the new routes.
