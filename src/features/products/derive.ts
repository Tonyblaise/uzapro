import type { Category, Product } from "@/data";
import { num } from "@/lib/format";

/** "Parts › Frames" for a sub-category, as the design's All products table shows it. */
export function categoryPath(category: string, categories: readonly Category[]): string {
  const parent = categories.find((c) => c.name === category)?.parent;
  return parent ? `${parent} › ${category}` : category;
}

/** List price from the variants: lowest price, "From …" when they differ; else the seed label. */
export function variantPrice(p: Product): string {
  const prices = p.variants.map((v) => v.price).filter(Boolean);
  if (!prices.length) return p.priceLabel;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return `${low === high ? "" : "From "}${num(low)}`;
}
