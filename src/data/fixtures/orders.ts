/**
 * Sales orders and delivery notes seed (feature 013). These values are NEW: the design canvas has
 * no sales orders or sales delivery notes (specs/013-sales-orders-dispatch/spec.md › Design
 * deviations). The seed dispatch has no stock movement, like the seed invoices.
 */
import type { DeliveryNote, SalesOrder } from "../types";

export const ORDER_SEED: readonly SalesOrder[] = [
  {
    number: "SO-0001",
    customer: "Morningview Bicycles",
    date: "2026-11-06",
    deliverBy: "2026-11-12",
    store: "Main Store",
    lines: [{ product: "Bike Pump", variant: "Standard", unit: "Box", qty: 4, rate: 4140, taxable: false, dispatched: 2, invoiced: 0 }],
    notes: "",
    amount: 16560,
    by: "Tony Blaise",
    cancelled: false,
    invoices: [],
    // Morningview Bicycles has an overdue invoice, so the order was approved (feature 012).
    creditApproval: { by: "Tony Blaise", at: "6 Nov 2026, 10:12", reason: "Paying the overdue invoice this week", why: "overdue", amount: 45600 },
  },
];

export const DELIVERY_SEED: readonly DeliveryNote[] = [
  {
    number: "DN-0001",
    order: "SO-0001",
    customer: "Morningview Bicycles",
    store: "Main Store",
    date: "2026-11-08",
    lines: [{ product: "Bike Pump", variant: "Standard", unit: "Box", qty: 2 }],
    driver: "Peter Kamau",
    vehicle: "KDG 412X",
    notes: "",
    delivered: true,
    receivedBy: "Amina Yusuf",
    deliveredAt: "8 Nov 2026, 15:20",
    by: "Tony Blaise",
  },
];
