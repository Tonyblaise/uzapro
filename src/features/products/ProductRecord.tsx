"use client";

import { useState } from "react";
import { useCategories, useProduct, useProductLevels, type StockMovement } from "@/data";
import { date, num } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { CRUMB, marginText } from "./shared";
import { categoryPath, variantPrice } from "./derive";

type HistFilter = "All" | "Sales" | "Stock in" | "Other";
const FILTERS: HistFilter[] = ["All", "Sales", "Stock in", "Other"];
const STOCK_IN = ["Received", "Moved in", "Returned"];

function matches(m: StockMovement, f: HistFilter): boolean {
  const k = m.kind.label;
  if (f === "Sales") return k === "Sold";
  if (f === "Stock in") return STOCK_IN.includes(k);
  if (f === "Other") return k !== "Sold" && !STOCK_IN.includes(k);
  return true;
}

const signed = (n: number) => (n > 0 ? `+${num(n)}` : n < 0 ? `−${num(-n)}` : "0");

/**
 * Product record (`?view=<name>` on All products): the design's generic record (`isRecord`:
 * status pill, "Overview" fields, Edit) followed by the variants and the product stock history
 * (`isStockHist`: store cards, Sales card, All/Sales/Stock in/Other filters, movement table).
 */
export function ProductRecord({ name, onClose, onEdit }: { name: string | null; onClose: () => void; onEdit: () => void }) {
  const data = useProduct(name);
  const levels = useProductLevels(name);
  const categories = useCategories();
  const [filter, setFilter] = useState<HistFilter>("All");
  if (!name || !data) return null;
  const { product, history } = data;

  const sold = history.filter((m) => m.kind.label === "Sold");
  const units = sold.reduce((a, m) => a + Math.abs(m.change), 0);
  const soldText = sold.length ? `${units} sold in ${sold.length} ${sold.length === 1 ? "sale" : "sales"}` : "No sales yet";
  const rows = history.filter((m) => matches(m, filter));

  const fields: { label: string; value: string }[] = [
    { label: "Product", value: product.name },
    { label: "Category", value: categoryPath(product.category, categories) },
    { label: "Variants", value: String(product.variants.length) },
    { label: "Price", value: variantPrice(product) },
    { label: "On hand", value: num(product.onHand) },
  ];

  return (
    <Drawer open title={product.name} subtitle={CRUMB} width={860} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div>
          <StatusPill tone={product.status.tone}>{product.status.label}</StatusPill>
        </div>

        <div>
          <div className="type-card-title mb-2 text-text">Overview</div>
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-4 border-t border-border py-3">
              <span className="type-eyebrow flex-none text-text-muted">{f.label}</span>
              <span className="type-label u-num text-right text-text">{f.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 border-t border-border py-3">
            <span className="type-eyebrow flex-none text-text-muted">Status</span>
            <StatusPill tone={product.status.tone}>{product.status.label}</StatusPill>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {["Variant", "Unit of measure", "Base buying price", "Base selling price", "Margin"].map((h, i) => (
                  <th key={h} scope="col" className={`type-eyebrow whitespace-nowrap p-2 text-text-muted ${i >= 2 ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.variants.flatMap((v) => [
                { key: `${v.name}|${v.unit}`, name: v.name, unit: v.unit, cost: v.cost, price: v.price },
                ...v.extraUnits.map((u) => ({ key: `${v.name}|${u.unit}`, name: v.name, unit: u.unit, cost: u.cost, price: u.price })),
              ]).map((r) => (
                <tr key={r.key} className="border-b border-border">
                  <td className="type-small p-2 text-text">{r.name}</td>
                  <td className="type-small p-2 text-text">{r.unit}</td>
                  <td className="type-small u-num p-2 text-right text-text">{r.cost ? num(r.cost) : "—"}</td>
                  <td className="type-small u-num p-2 text-right text-text">{num(r.price)}</td>
                  <td className="type-small u-num p-2 text-right text-text-muted">{marginText(r.cost, r.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <div key={l.store} className="flex-[1_1_150px] rounded-md border border-border p-3">
                <div className="type-eyebrow text-text-muted">{l.store}</div>
                <div className="type-title u-num text-text">{num(l.quantity)}</div>
              </div>
            ))}
            <div className="flex-[1_1_150px] rounded-md border border-border bg-info-soft p-3">
              <div className="type-eyebrow text-info-text">Sales</div>
              <div className="type-title text-text">{soldText}</div>
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
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Date", "Variant", "Change", "Store", "Quantity", "Left", "By", "Ref"].map((h) => (
                      <th key={h} scope="col" className={`type-eyebrow whitespace-nowrap p-2 text-text-muted ${h === "Quantity" || h === "Left" ? "text-right" : "text-left"}`}>
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
                      <td className="type-small u-num px-2 py-3 text-text">{m.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="type-body m-0 text-text-muted">No stock changes recorded for this product yet.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button icon="pencil" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
