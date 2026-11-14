# Quickstart: Batch and expiry tracking

1. Stock › Expiry lists three Muthokinju Paint batches at Point of Sale: MP-2409 (Expired 10 days
   ago, 2), MP-2411 (18 days, Expires soon, 4), MP-2502 (OK, 6). Summary: "1 expired · 1 expiring
   in 30 days".
2. Sell 5 Muthokinju Paint (White) from a new sale: MP-2411 is gone, MP-2502 shows 5, MP-2409
   still shows 2.
3. A sale of 6 more is refused: "Only 5 Muthokinju Paint left at Point of Sale."
4. Write off MP-2409: "Batch MP-2409 written off." Stock › Wastage has an Expired entry for 2.
5. Record batch: Bike Pump, Main Store, BP-01, any date, 10: listed. Recording 25 more is refused
   ("Only 20 Bike Pump at Main Store is not in a batch yet.").
6. Reload: back to the seed.

Automated: `npm run typecheck`, `lint`, `test:unit`, `build`, `test:smoke`.
