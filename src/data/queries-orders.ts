"use client";
/** Sales order and delivery note read hooks (feature 013, contracts/data-access.md). */
import { useMemo } from "react";
import { deliveryStatus, orderStatus } from "./orders";
import { useAppStore } from "./store/StoreProvider";
import type { DeliveryNote, Pill, SalesOrder } from "./types";

export type OrderRow = SalesOrder & { status: Pill };
export type DeliveryRow = DeliveryNote & { status: Pill; items: number };

export function useOrders(): OrderRow[] {
  const orders = useAppStore((s) => s.sales.orders);
  return useMemo(() => orders.map((o) => ({ ...o, status: orderStatus(o) })), [orders]);
}

export function useOrder(number: string | null): OrderRow | undefined {
  const orders = useOrders();
  return number ? orders.find((o) => o.number === number) : undefined;
}

export function useDeliveries(): DeliveryRow[] {
  const list = useAppStore((s) => s.sales.deliveries);
  return useMemo(() => list.map((d) => ({ ...d, status: deliveryStatus(d), items: d.lines.reduce((a, l) => a + l.qty, 0) })), [list]);
}

export function useDelivery(number: string | null): DeliveryRow | undefined {
  const list = useDeliveries();
  return number ? list.find((d) => d.number === number) : undefined;
}

/** An order's delivery notes, oldest first. */
export function useOrderDeliveries(order: string | null): DeliveryRow[] {
  const list = useDeliveries();
  return useMemo(() => (order ? list.filter((d) => d.order === order).reverse() : []), [list, order]);
}
