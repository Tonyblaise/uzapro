"use client";

import { useState } from "react";
import { useMovements, useProductStoreLevels } from "@/data";
import { StatusPill } from "@/components/ui/StatusPill";
import { date, num } from "@/lib/format";
import { StockDrawer, signed } from "./shared";

const FILTERS = ["All", "Sales", "Stock in", "Other"] as const;
type HistFilter = (typeof FILTERS)[number];

const STOCK_IN = ["Received", "Moved in", "Returned"];

const TEST: Record<HistFilter, (pill: string) => boolean> = {
  All: () => true,
  Sales: (p) => p === "Sold",
  "Stock in": (p) => STOCK_IN.includes(p),
  Other: (p) => p !== "Sold" && !STOCK_IN.includes(p),
};

const HEAD = ["Date", "Variant", "Change", "Store", "Quantity", "Left", "By", "Ref"];
const RIGHT = new Set(["Quantity", "Left"]);

/** Design `isStockHist`: "{product} stock history" drawer opened from a Stock management row. */
export function StockHistory({ product, store, onClose }: { product: string; store: string; onClose: () => void }) {
  const [filter, setFilter] = useState<HistFilter>("All");
  const lines = useProductStoreLevels(product);
  const moves = useMovements({ product });
  const sold = moves.filter((m) => m.kind.label === "Sold");
  const units = sold.reduce((a, m) => a + Math.abs(m.change), 0);
  const rows = moves.filter((m) => TEST[filter](m.kind.label));

  return (
    <StockDrawer title={`${product} stock history`} onClose={onClose} width={860}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {lines.map((l) => (
            <div key={l.store} className={`flex-[1_1_150px] rounded-md border border-border p-3 ${l.store === store ? "bg-green-50" : ""}`}>
              <div className="type-eyebrow text-text-muted">{l.store}</div>
              <div className="type-title u-num text-text">{num(l.quantity)}</div>
            </div>
          ))}
          <div className="flex-[1_1_150px] rounded-md border border-border bg-info-soft p-3">
            <div className="type-eyebrow text-info-text">Sales</div>
            <div className="type-title text-text">{sold.length ? `${units} sold in ${sold.length} ${sold.length === 1 ? "sale" : "sales"}` : "No sales yet"}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter stock changes">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`type-small cursor-pointer rounded-pill border px-3 py-1 font-semibold ${filter === f ? "border-green-600 bg-green-50 text-green-700" : "border-border bg-surface text-text-secondary"}`}
            >
              {f}
            </button>
          ))}
        </div>
        {moves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {HEAD.map((h) => (
                    <th key={h} scope="col" className={`type-eyebrow whitespace-nowrap p-2 text-text-muted ${RIGHT.has(h) ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} className="border-b border-border">
                    <td className="type-small u-num px-2 py-3 text-text">{date(m.date)}</td>
                    <td className="type-small px-2 py-3 text-text">{m.variant}</td>
                    <td className="type-small px-2 py-3 text-text">
                      <StatusPill tone={m.kind.tone}>{m.kind.label}</StatusPill>
                    </td>
                    <td className="type-small px-2 py-3 text-text">{m.store}</td>
                    <td className="type-small u-num px-2 py-3 text-right text-text">{signed(m.change)}</td>
                    <td className="type-small u-num px-2 py-3 text-right text-text">{num(m.left)}</td>
                    <td className="type-small px-2 py-3 text-text">{m.by}</td>
                    <td className="type-small px-2 py-3 text-text">{m.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="type-body m-0 text-text-muted">No stock changes recorded for this product yet.</p>
        )}
      </div>
    </StockDrawer>
  );
}
