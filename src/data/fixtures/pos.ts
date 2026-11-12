/**
 * Point of sale seed — the canvas `posStore()` (`Uzapoint ERP.dc.html` v1794512813): Terminal 1's
 * open shift and its six sales, and the till settings defaults (`SETDEF`). Seller renamed to the demo
 * Owner, Tony Blaise (spec › Design deviations). Feature 010.
 */
import type { PosSaleDoc, PosSettings } from "../types";

export const DEMO_PIN = "1234";
export const POS_SELLER = "Tony Blaise";
export const POS_FLOATS = [1000, 2000, 5000, 10000];

type Line = { product: string; variant: string; qty: number; price: number };
const mk = (ref: string, time: string, cust: string, lines: Line[], method: "Cash" | "M-Pesa" | "Card", payRef = "—"): PosSaleDoc => {
  const total = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const vat = Math.round(((total * 16) / 116) * 100) / 100;
  return {
    ref,
    date: "2026-11-10",
    time,
    cust,
    store: "Point of Sale",
    term: 1,
    lines: lines.map((l) => ({ ...l, unit: "Piece" })),
    subtotal: total - vat,
    vat,
    disc: 0,
    total,
    pays: [{ method, ref: payRef, date: `10 Nov 2026, ${time}`, amount: total }],
    who: POS_SELLER,
    tendered: total,
    change: 0,
  };
};

export const POS_SEED_DOCS: PosSaleDoc[] = [
  mk("SAL-POS-0006", "12:10", "Walk-in Customer", [{ product: "Carbon Sole Shoes", variant: "Size 43", qty: 1, price: 4140 }], "Card", "4821"),
  mk("SAL-POS-0005", "11:52", "Morningview Bicycles", [{ product: "Bike Pump", variant: "Standard", qty: 4, price: 345 }, { product: "Helmet", variant: "Large", qty: 2, price: 1739 }], "M-Pesa", "SKB7Q2LM0P"),
  mk("SAL-POS-0004", "11:20", "Walk-in Customer", [{ product: "Helmet", variant: "Small", qty: 1, price: 1639 }], "Cash"),
  mk("SAL-POS-0003", "10:58", "Walk-in Customer", [{ product: "Bike Pump", variant: "Standard", qty: 1, price: 345 }, { product: "Carbon Sole Shoes", variant: "Size 42", qty: 1, price: 4140 }], "M-Pesa", "SKC3H8TT2R"),
  mk("SAL-POS-0002", "10:41", "Walk-in Customer", [{ product: "Bike Pump", variant: "Standard", qty: 2, price: 345 }, { product: "Helmet", variant: "Medium", qty: 1, price: 1639 }], "Cash"),
  mk("SAL-POS-0001", "09:32", "Walk-in Customer", [{ product: "Muthokinju Paint", variant: "White", qty: 1, price: 467 }], "M-Pesa", "SKA1B2C3D4"),
];

/** Terminal 1's shift: open since 09:05 with KES 5,000 float; selling for 3h 12m when the till opens. */
export const POS_SEED_SHIFT = { open: true, by: POS_SELLER, at: "09:05", date: "10 Nov 2026", float: 5000, startAgoMin: 3 * 60 + 12 } as const;

export const POS_SETTINGS_DEFAULT: PosSettings = { sound: true, stock: true, scan: true, notes: true, autoPrint: true, askCust: false, qn: ["Gift wrap", "No bag", "Deliver later"] };
