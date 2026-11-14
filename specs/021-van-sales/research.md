# Research

## R1. A van is a store

**Decision**: a storage location of the type "Van". Loading and unloading are stock transfers.

**Rationale**: stock, transfers, counts, batches and reorder points then work for a van with no
new code.

## R2. One sale path

**Decision**: `recordSale(input)` takes `store?`. A visit's sale is a normal sale from the van.

**Rationale**: prices, the credit gate, unit conversion, batches and the shortfall check all live
there already.

## R3. Seed

**Decision**: "Van KDG 412X" (Nairobi HQ, Van). Its load is taken out of the Main Store in the
seed function, not by editing the ported stock lines: 20 Aluminium Frame, 10 Carbon Road Frame. (Bike Pump and Helmet are left alone: earlier features' demo figures depend on them.) Route for
10 Nov 2026: Mountain Goats and Morningview Bicycles, both Planned.

**Rationale**: moving stock keeps every product's total on hand as the canvas has it.

## R4. What the summary counts

**Decision**: sales whose reference is on one of the van's visits for the day. Cash and M-Pesa by
payment method; a sale with no payments is credit.
