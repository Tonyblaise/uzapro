/** Field sales seed, ported verbatim from design/canvas/erp-data.js (`UZ_FIELD`, feature 024). */
import type { FieldRep, FieldSale } from "../types";

export const FIELD_REPS: FieldRep[] = [
  { name: "Peter Roadie", phone: "+254 711 402 118", route: "Thika Road", vehicle: "KDA 412M · van" },
  { name: "Kevin Otieno", phone: "+254 722 918 334", route: "Kiambu Road", vehicle: "KMEA 221Q · motorbike" },
  { name: "Faith Wanjiku", phone: "+254 733 554 019", route: "Westlands – Kangemi", vehicle: "KCX 908T · pickup" },
];

/** Drivers who are not reps. */
export const FIELD_DRIVERS = ["Sam Mwangi"];

export const FIELD_SALE_SEED: FieldSale[] = [
  {
    ref: "FS-0112", date: "2026-11-10", time: "11:05", rep: "Faith Wanjiku", route: "Westlands – Kangemi", customer: "Morningview Bicycles", phone: "+254 712 340 118",
    location: "Westlands, Woodvale Grove, Morningview shop", store: "Main Store",
    lines: [{ product: "Helmet", variant: "Medium", qty: 6, price: 1639 }, { product: "Bike Pump", variant: "Standard", qty: 10, price: 345 }],
    pay: { mode: "credit", method: "", ref: "" },
    delivery: { ref: "DLV-0240", date: "2026-11-11", driver: "Faith Wanjiku", status: "Pending", note: "Deliver before 10am", history: [{ when: "10 Nov 2026, 11:05", what: "Order taken by Faith Wanjiku on Westlands – Kangemi", who: "Faith Wanjiku" }] },
  },
  {
    ref: "FS-0111", date: "2026-11-10", time: "09:48", rep: "Kevin Otieno", route: "Kiambu Road", customer: "Mountain Goats", phone: "+254 733 208 561",
    location: "Ridgeways Mall, ground floor, shop 4", store: "Main Store",
    lines: [{ product: "Carbon Sole Shoes", variant: "Size 42", qty: 2, price: 4140 }],
    pay: { mode: "delivery", method: "", ref: "" },
    delivery: {
      ref: "DLV-0239", date: "2026-11-10", driver: "Sam Mwangi", status: "Out for delivery", outAt: "10 Nov 2026, 10:30", note: "",
      history: [
        { when: "10 Nov 2026, 09:48", what: "Order taken by Kevin Otieno on Kiambu Road", who: "Kevin Otieno" },
        { when: "10 Nov 2026, 10:30", what: "Dispatched with Sam Mwangi", who: "Grant Jensen" },
      ],
    },
  },
  {
    ref: "FS-0110", date: "2026-11-10", time: "08:30", rep: "Peter Roadie", route: "Thika Road", customer: "Walk-in Customer", phone: "0723 118 902",
    location: "Kahawa Sukari, Third Avenue, blue gate", store: "Main Store",
    lines: [{ product: "Racing Wheelset", variant: "700c", qty: 1, price: 13800 }],
    pay: { mode: "now", method: "M-Pesa", ref: "SKJ8T2PL0Q" },
    delivery: { ref: "DLV-0238", date: "2026-11-10", driver: "Peter Roadie", status: "Pending", note: "Call on arrival", history: [{ when: "10 Nov 2026, 08:30", what: "Order taken by Peter Roadie on Thika Road", who: "Peter Roadie" }] },
  },
  {
    ref: "FS-0109", date: "2026-11-09", time: "15:20", rep: "Peter Roadie", route: "Thika Road", customer: "Alpha Systems", phone: "+254 701 555 210",
    location: "Ruiru, Kimbo, Alpha Systems warehouse", store: "Main Store",
    lines: [{ product: "Groupset", variant: "Standard", qty: 1, price: 8452 }, { product: "Bike Pump", variant: "Standard", qty: 4, price: 345 }],
    pay: { mode: "delivery", method: "", ref: "" },
    delivery: {
      ref: "DLV-0237", date: "2026-11-10", driver: "Peter Roadie", status: "Rescheduled", note: "",
      history: [
        { when: "9 Nov 2026, 15:20", what: "Order taken by Peter Roadie on Thika Road", who: "Peter Roadie" },
        { when: "9 Nov 2026, 17:40", what: "Not delivered: shop closed. Rescheduled to 10 Nov 2026", who: "Peter Roadie" },
      ],
    },
  },
  {
    ref: "FS-0108", date: "2026-11-08", time: "12:10", rep: "Kevin Otieno", route: "Kiambu Road", customer: "Mountain Goats", phone: "+254 733 208 561",
    location: "Ridgeways Mall, ground floor, shop 4", store: "Main Store",
    lines: [{ product: "Helmet", variant: "Large", qty: 4, price: 1739 }],
    pay: { mode: "delivery", method: "", ref: "" },
    delivery: {
      ref: "DLV-0236", date: "2026-11-08", driver: "Sam Mwangi", status: "Delivered", outAt: "8 Nov 2026, 13:00", doneAt: "8 Nov 2026, 14:25", receivedBy: "Ann Mwende",
      collected: { method: "M-Pesa", ref: "SKG2W9RT4N", amount: 6956 }, note: "",
      history: [
        { when: "8 Nov 2026, 12:10", what: "Order taken by Kevin Otieno on Kiambu Road", who: "Kevin Otieno" },
        { when: "8 Nov 2026, 13:00", what: "Dispatched with Sam Mwangi", who: "Grant Jensen" },
        { when: "8 Nov 2026, 14:25", what: "Delivered, received by Ann Mwende. Collected KES 6,956.00 by M-Pesa", who: "Sam Mwangi" },
      ],
    },
  },
  {
    ref: "FS-0107", date: "2026-11-07", time: "10:00", rep: "Faith Wanjiku", route: "Westlands – Kangemi", customer: "Morningview Bicycles", phone: "+254 712 340 118",
    location: "Westlands, Woodvale Grove, Morningview shop", store: "Main Store",
    lines: [{ product: "Aluminium Frame", variant: "56cm", qty: 2, price: 31050 }],
    pay: { mode: "now", method: "Bank transfer", ref: "FT26311MVB" },
    delivery: {
      ref: "DLV-0235", date: "2026-11-07", driver: "Faith Wanjiku", status: "Delivered", outAt: "7 Nov 2026, 11:15", doneAt: "7 Nov 2026, 12:05", receivedBy: "John Kariuki", note: "",
      history: [
        { when: "7 Nov 2026, 10:00", what: "Order taken by Faith Wanjiku on Westlands – Kangemi", who: "Faith Wanjiku" },
        { when: "7 Nov 2026, 11:15", what: "Dispatched with Faith Wanjiku", who: "Grant Jensen" },
        { when: "7 Nov 2026, 12:05", what: "Delivered, received by John Kariuki", who: "Faith Wanjiku" },
      ],
    },
  },
];
