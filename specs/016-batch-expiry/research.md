# Research: Batch and expiry tracking

## R1. Batches are a breakdown, not a second stock figure

**Decision**: `StockLevel.quantity` stays the stock on hand. Batches say which part of it expires
when; whatever is left over is "not in a batch". Invariant: batches ≤ level.

**Rationale**: products without batches need no change, and every existing screen keeps working.

## R2. Where batches are used up

**Decision**: in `applyStockChanges`, for every outgoing change, through `consume()`. In
`findShortfall`, a "Sold" change is checked against in-date stock (level less expired batches).

**Rationale**: all stock movements already pass through these two functions (feature 014 put unit
conversion there for the same reason).

## R3. Order of use

**Decision**: "Sold" changes: in-date batches by earliest expiry, then unbatched stock; never
expired. Other outgoing changes: a named batch first (write-off), then expired, then earliest
expiry, then unbatched.

**Rationale**: FEFO for sales; anything leaving for another reason should clear the oldest first.

## R4. Write-off

**Decision**: `writeOffBatch` calls the existing `recordWastage` with the reason "Expired" and the
batch's id on the item, so `consume()` takes that exact batch.

**Rationale**: reuses the wastage record, value and undo.

## R5. Transfers and incoming stock

**Decision**: incoming stock is unbatched. A transfer reduces the sender's batches and arrives
unbatched.

**Rationale**: ship and receive are separate commands, so carrying batch slices would need a
transit store. Recorded as a known limit.
