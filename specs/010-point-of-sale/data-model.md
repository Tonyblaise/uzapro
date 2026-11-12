# Data Model: Point of Sale

The types go in `src/data/types/sales.ts` (POS section), the seed in `src/data/fixtures/pos.ts`, and
the slice `pos` in `src/data/store/state.ts`. All of it is in memory and re-seeded on reload.

## Types

```ts
type PosStep = "shift" | "pin" | "app";
type PosView = "sell" | "today" | "orders" | "customers" | "shift";
type PosMethod = "Cash" | "M-Pesa" | "Card" | "Credit";        // "Credit" is labelled "Pay later"
type PosModal = "variant" | "customer" | "newcust" | "checkout" | "receipt" | "settings" | "close" | null;

interface PosShift {
  open: boolean;
  by?: string; at?: string; date?: string;   // "Tony Blaise", "09:05", "10 Nov 2026"
  start?: number;                            // epoch ms; "On shift {h}h {m}m"
  float?: number;
  refs: string[];                            // sale refs this shift, newest first
  closedAt?: string; lastCount?: number; lastDiff?: number;
}

interface PosCartLine { key: string; product: string; variant: string; price: number; qty: number; note?: string }
interface PosHeld { cust: string; cart: PosCartLine[]; at: string }
interface PosPayment { method: Exclude<PosMethod, "Credit">; ref: string; amount: number; date?: string }

/** The receipt document (design UZ_SALEDOCS entry). */
interface PosSaleDoc {
  ref: string; date: string; time: string; cust: string; store: string; term: number;
  lines: { product: string; variant: string; unit: string; qty: number; price: number; note?: string }[];
  subtotal: number; vat: number; disc: number; total: number; note?: string;
  pays: PosPayment[]; who: string; tendered: number; change: number;
}

interface PosSettings { sound: boolean; stock: boolean; scan: boolean; notes: boolean; autoPrint: boolean; askCust: boolean; qn: string[] }
```

## Store slice `pos`

```ts
interface PosState {
  shifts: Record<number, PosShift>;
  docs: Record<string, PosSaleDoc>;       // seeded POS docs + every sale completed at a till
  held: PosHeld[];
  settings: PosSettings;                  // session only (Clarification Q2)
  ui: {                                   // reset on launch
    step: PosStep; termId: number; who: string; pinWho: string; pin: string; pinErr: string; shake: number;
    floatDraft: string; view: PosView; q: string; cat: string; cart: PosCartLine[]; cust: string;
    discVal: string; discType: "KES" | "%"; discOpen: boolean; noteLine: number | null; cartOpen: boolean;
    modal: PosModal; varProduct: string | null; varSel: string; varQty: string; cq: string;
    nc: { name: string; phone: string }; ncErr: string;
    co: { pays: PosPayment[]; method: PosMethod; amt: string | null; ref: string; phone: string;
          mpesa: "" | "waiting" | "paid"; note: string; notify: Record<"Print" | "SMS" | "Email", boolean>; err: string };
    rcpt: string | null; fresh: boolean; count: string; closeNote: string; clErr: string; qnDraft: string;
  };
}
```

## Seed (`fixtures/pos.ts`, from `posStore`)

**Terminal 1 shift**: open; by Tony Blaise; at "09:05"; date "10 Nov 2026"; float 5000; start = when
the till opens minus 3h 12m (worked out at seed time).

**The six POS docs** (all on 10 Nov 2026 at the Point of Sale store, terminal 1, by Tony Blaise; the
total is the sum of price × quantity):

| Ref | Time | Customer | Lines | Payment |
|---|---|---|---|---|
| SAL-POS-0006 | 12:10 | Walk-in Customer | Carbon Sole Shoes Size 43 ×1 @ 4,140 | Card, ref 4821 |
| SAL-POS-0005 | 11:52 | Morningview Bicycles | Bike Pump Standard ×4 @ 345; Helmet Large ×2 @ 1,739 | M-Pesa, ref SKB7Q2LM0P |
| SAL-POS-0004 | 11:20 | Walk-in Customer | Helmet Small ×1 @ 1,639 | Cash |
| SAL-POS-0003 | 10:58 | Walk-in Customer | Bike Pump ×1 @ 345; Carbon Sole Shoes Size 42 ×1 @ 4,140 | M-Pesa, ref SKC3H8TT2R |
| SAL-POS-0002 | 10:41 | Walk-in Customer | Bike Pump ×2 @ 345; Helmet Medium ×1 @ 1,639 | Cash |
| SAL-POS-0001 | 09:32 | Walk-in Customer | Muthokinju Paint White ×1 @ 467 | M-Pesa, ref SKA1B2C3D4 |

Each doc has `vat = round2(total × 16/116)`, `subtotal = total − vat`, `disc` 0, the payment amount
equal to the total, `tendered` = total and `change` 0.

**Settings**: sound, stock, scan, notes and autoPrint on; askCust off; quick notes ["Gift wrap",
"No bag", "Deliver later"].

**Held sales**: none.

## Derived values (pure helpers in `src/data/pos.ts`)

| Helper | Returns |
|---|---|
| `posTotals(cart, discVal, discType)` | `{ gross, disc, total, vat, sub, count }`. The discount is capped at gross; values are rounded to cents. |
| `quickCash(remaining)` | "Exact", then the remaining amount rounded up to 50, 100, 500 and 1000 (unique, up to 5) |
| `matchCode(code, products)` | `{ product, variant }` or `{ product, variant: null }` (opens the chooser) or `null` |
| `productCode(name, variant)` | "bikpum-standard" |
| `shiftCollections(docs)` | Cash, M-Pesa, Card and Credit sums, and the total |
| `expectedCash(shift, docs)` | The float plus cash payments |
| `closeDiff(count, expected)` | `{ diff, label: "Drawer balances" \| "Over by" \| "Short by" }` |
| `todayStats(docs)` | KPIs, the top 5 products, hourly totals (8–19), peak hour, axis ticks |
| `onShiftLabel(start, now)` | "3h 12m" |
| `staffList(roles, profiles)` | The four demo people, with their role and colour index |

## Validation and messages

| Where | Rule | Message |
|---|---|---|
| Open shift | The float is blank, not a number, or below 0 | Toast "Enter the opening cash. Use 0 if the drawer is empty." |
| PIN | Not 1234 | "That PIN is wrong. Try again." (shake) |
| Checkout | Credit with a walk-in | "Pick a named customer to sell on credit." |
| Checkout | M-Pesa or Card amount above what's due | "{method} payment can't be more than what is due." |
| Checkout | Not covered | "KES {x} is still due. Add another payment or pay the full amount." |
| M-Pesa | Not a Safaricom number | "Enter the customer's Safaricom number, for example 0712 345 678." |
| New customer | Blank name | "Enter the customer's name." |
| New customer | Duplicate (case-insensitive) | "A customer with this name already exists." |
| Close shift | No count | "Enter the cash you counted." |
| Barcode | No match | Toast `No product matches "{code}".` |

## State transitions

- **Shift**: closed → open (Open shift: by, at, date, start, float, refs []) → closed (Close shift:
  closedAt, lastCount, lastDiff, refs []).
- **Till step**: shift → pin → app. Lock goes from app to pin; Exit leaves the till.
- **Sale**: cart → (Hold → held → Resume → cart) → checkout → completed (with a receipt).
