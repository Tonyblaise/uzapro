# Research: Stock counts

## R1. What approval applies

**Decision**: the variance (counted − system at the start of the count), applied to the current
stock level, never below zero.

**Rationale**: sales continue while a count is open. Setting stock to the counted figure would
wipe out movements made after the count started.

## R2. Movement kind

**Decision**: a new `KIND.counted` pill ("Counted", neutral). The stock type already lists
"Counted" as a movement kind from the design.

## R3. Who approves

**Decision**: Delete on Stock (spec › Assumptions). Write starts, enters and submits.

## R4. One open count per store

**Decision**: refused at start. Two overlapping counts would each apply a variance against a
different snapshot of the same products.
