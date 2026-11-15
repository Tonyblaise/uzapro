# Feature 025: Stock counts as in the design

**Date**: 2026-11-15 · **Status**: Implemented

## Summary
The design (canvas version `1794713355-85bd`) adds **Stock › Stock counts**. It replaces the screens of feature 017, keeping its rule that only approval changes stock. Stock › Reorder is removed at the user's request: reorder points are set on the product form (`specs/024`).

## Requirements
- **FR-001** The list shows each count's ref and start date, store and scope, who is counting, a progress bar, the number of differences, the net value at cost, and the status: Counting, Waiting approval, Approved or Cancelled. While a blind count is being counted, its differences and value are hidden.
- **FR-002** **New stock count** asks for:
  - the store (every store but transit locations)
  - Everything or One category, plus the category
  - who is counting
  - Blind count (on by default)

  A summary shows how many lines it will have. **Start counting** opens the count, using the design's messages.
- **FR-003** The count screen shows:
  - progress and KPIs: Short / Over / Net difference at cost, or for a blind count Blind count / Left to count / Counted by
  - search, and filters for All, Not counted and Differences
  - a line per product with − / + counters and a note, both saved as you go, and the history
- **FR-004** While counting, **Save and close** and **Submit for approval** are available. Submit refuses, and shows Not counted, until every line is counted.
- **FR-005** While a count waits for approval, **Send back to recount** clears only the lines with differences, and **Approve and update stock** applies each difference to the stock now, logged as "Count".
- **FR-006** **Cancel count** keeps the count as Cancelled and leaves stock as it is.
- **FR-007** Approving, sending back and cancelling need the **Approve stock counts** right (feature 018).

## Design deviations
- **One line per product.** The design counts each variant. UzaPro keeps stock per product and store, so a line is a product with its variants listed under its name. The design's seed (`UZ_COUNTS`) is ported by adding variants together, and notes keep their variant ("650b: One box damaged"). SC-0014's history reads 2 differences, per product, where the design's per-variant figure was 3.
- **Approval right kept.** The design lets anyone approve.
- **No overlapping counts.** Two open counts of a store may not cover the same products (Everything, or the same category).
- **Owner name.** The design's "Tony Ashiuma" is the app's owner, Tony Blaise.
