# Quickstart: Breaking bulk and reorder points

**Prerequisites**: `npm install`, `npm run dev`, sign in as the demo Owner.

1. **Bulk sale** (US1): Sales › New sale, Walk-in Customer, Helmet, Medium, Carton, 2 units, paid
   by Cash. Stock › Stock management shows Helmet at Point of Sale as 24 (was 44).
2. **Shortage**: a second sale of 3 cartons is refused: "Only 24 Helmet left at Point of Sale."
3. **Product form**: Products › Helmet › Edit. The Carton rows show Contains 10.
4. **Reorder list** (US2): Stock › Reorder. Muthokinju Paint: Out of stock, 3 Crate (72 Piece).
   Racing Wheelset: Reorder now, 24 Piece. Groupset: Reorder now, 7 Piece, supplier Not set. Bike
   Pump and Helmet: OK.
5. **Drafts** (US3): Create draft purchase orders: "2 draft purchase orders created. 1 skipped: no
   supplier set." Purchases › Purchase orders lists two drafts. Back on Reorder, the paint and the
   wheelset show On order; a second run reads "Nothing needs reordering." apart from the skipped
   line.
6. **Set a line**: Set reorder point for Carbon Sole Shoes at Main Store, 50 and 80: Reorder now,
   40 Piece.
7. **Reload**: everything returns to the seed.

## Automated checks

`npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:smoke`.
