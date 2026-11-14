# Quickstart: Stock counts

1. Stock › Stock counts lists CNT-0001 (Point of Sale, Approved, Partial, −1 units).
2. New count › Main Store › Start count: CNT-0002, In progress, one line per product there.
3. Enter Bike Pump 33 (system 30) and Racing Wheelset 14 (system 16); count the rest as shown;
   Save, then Submit for approval: Waiting approval. Totals: over 3, short 2.
4. As the Owner, Approve: "CNT-0002 approved. Stock updated." Bike Pump at Main Store is 33 and
   Racing Wheelset 14; the stock history shows "Counted" with CNT-0002.
5. As the Store keeper, a waiting count shows no Approve button.
6. Reload: back to the seed.

Automated: `npm run typecheck`, `lint`, `test:unit`, `build`, `test:smoke`.
