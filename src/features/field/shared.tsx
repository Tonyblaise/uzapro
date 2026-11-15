"use client";
/** Shared bits for Field sales and Deliveries (feature 024). */
import type { ReactNode } from "react";
import type { FieldDeliveryStatus, FieldSale, Pill } from "@/data";

/** Delivery status tones (design `tone` map). */
export const DELIVERY_TONE: Record<FieldDeliveryStatus, Pill["tone"]> = {
  Pending: "neutral",
  Rescheduled: "warning",
  "Out for delivery": "info",
  Delivered: "success",
  Cancelled: "danger",
};

export const deliveryPill = (x: FieldSale): Pill => ({ label: x.delivery.status, tone: DELIVERY_TONE[x.delivery.status] });

/** Field sales › Payment column (design). */
export function payPill(x: FieldSale): Pill {
  if (x.pay.mode === "now") return { label: "Paid", tone: "success" };
  if (x.pay.mode === "credit") return { label: "On credit", tone: "warning" };
  return x.delivery.collected ? { label: "Collected", tone: "success" } : { label: "On delivery", tone: "info" };
}

/** A table cell with a main line and a muted note under it (design `{ main, note }`). */
export function TwoLine({ main, note, noteClass = "text-text-muted", strong }: { main: ReactNode; note?: ReactNode; noteClass?: string; strong?: boolean }) {
  return (
    <span className="inline-flex min-w-0 flex-col">
      <span className={strong ? "whitespace-nowrap font-semibold text-text" : "text-text"}>{main}</span>
      {note ? <span className={`type-small ${noteClass}`}>{note}</span> : null}
    </span>
  );
}

export const itemCount = (x: Pick<FieldSale, "lines">) => x.lines.reduce((a, l) => a + l.qty, 0);
/** KES without decimals, as the design's lists. */
export const k0 = (n: number) => Math.round(n).toLocaleString("en-KE");
