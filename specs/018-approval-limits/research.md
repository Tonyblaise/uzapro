# Research: Approval rights and discount limits

## R1. Shape

**Decision**: `RoleApprovals = { credit, counts, dispatch: boolean; discountMax: number }`, stored
per role key next to the module access. Not a fourth switch on a module row.

**Rationale**: these are decisions, not access to a screen, and two of them cut across modules.

## R2. Dispatch without Write

**Decision**: the dispatch right alone allows Dispatch and Mark delivered. The module screen's
step gate drops `dispatch` and `deliver`; the commands check the right.

**Rationale**: the point is to let a store keeper dispatch without being able to edit or invoice.

## R3. Discount percentage

**Decision**: `given = discount amount ÷ amount before discount × 100`, rounded to one decimal,
compared with the limit. Checked in the commands that save a discount.

## R4. Seed parity (SC-001)

**Decision**: as in spec FR-003 and Assumptions. Existing tests for credit approval (Owner and
Accountant yes, Cashier no), count approval (Owner yes, Store keeper no) and dispatch (Owner) keep
passing unchanged, except one that turned off the Accountant's Write on Sales and expected
Dispatch to disappear: Dispatch now follows its own right.
