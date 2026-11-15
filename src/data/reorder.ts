/**
 * Pure reorder rules (feature 014, research R4–R5): what is on order from suppliers, what a line
 * suggests ordering, and its status.
 */
import { baseUnitOf, unitFactor } from "./units";
import type { Pill, Product, PurchaseOrder, ReorderRule } from "./types";

export interface ReorderPosition {
  onHand: number;
  /** Not yet received on open purchase orders, in base units. */
  onOrder: number;
  /** Base units in one order unit. */
  factor: number;
  /** Suggested order in order units (0 = nothing to order). */
  units: number;
  /** The same in base units. */
  need: number;
  status: Pill;
}

const productOf = (key: string) => {
  const cut = key.indexOf(" · ");
  return cut < 0 ? null : { product: key.slice(0, cut), variant: key.slice(cut + 3) };
};

const CLOSED = new Set(["Cancelled", "Completed"]);

/** Quantity still to come for a product at a store, from orders that are not cancelled or completed. */
export function onOrderQty(orders: readonly Pick<PurchaseOrder, "store" | "status" | "lines">[], products: readonly Product[], product: string, store: string): number {
  let total = 0;
  for (const o of orders) {
    if (o.store !== store || CLOSED.has(o.status.label)) continue;
    for (const l of o.lines) {
      const item = productOf(l.key);
      if (item?.product !== product) continue;
      total += Math.max(0, l.qty - l.recv) * unitFactor(products, item.product, item.variant, l.unit);
    }
  }
  return total;
}

/**
 * Suggest an order when on hand plus on order is at or below the reorder point: enough to reach
 * the order-up-to level, rounded up to whole order units.
 */
export function reorderPosition(rule: Pick<ReorderRule, "min" | "max">, onHand: number, onOrder: number, factor: number): ReorderPosition {
  const f = Math.max(1, factor);
  const due = onHand + onOrder <= rule.min;
  const units = due ? Math.ceil(Math.max(0, rule.max - onHand - onOrder) / f) : 0;
  const status: Pill =
    units > 0
      ? onHand <= 0
        ? { label: "Out of stock", tone: "danger" }
        : { label: "Reorder now", tone: "warning" }
      : onHand <= rule.min
        ? { label: "On order", tone: "info" }
        : { label: "OK", tone: "success" };
  return { onHand, onOrder, factor: f, units, need: units * f, status };
}

/** The variant a rule orders, or the product's first variant when it has gone. */
export function ruleVariant(products: readonly Product[], rule: Pick<ReorderRule, "product" | "variant">) {
  const p = products.find((x) => x.name === rule.product);
  return p?.variants.find((v) => v.name === rule.variant) ?? p?.variants[0];
}

/** The rule's order unit, falling back to the base unit when the variant no longer has it. */
export function ruleUnit(products: readonly Product[], rule: Pick<ReorderRule, "product" | "variant" | "unit">): string {
  const v = ruleVariant(products, rule);
  if (!v) return rule.unit || "Piece";
  return rule.unit === baseUnitOf(v) || v.extraUnits.some((u) => u.unit === rule.unit) ? rule.unit : baseUnitOf(v);
}

/** Buying price for one order unit. */
export function ruleCost(products: readonly Product[], rule: Pick<ReorderRule, "product" | "variant" | "unit">): number {
  const v = ruleVariant(products, rule);
  if (!v) return 0;
  const unit = ruleUnit(products, rule);
  return unit === baseUnitOf(v) ? v.cost : (v.extraUnits.find((u) => u.unit === unit)?.cost ?? v.cost);
}

/** The reorder-at and order-up-to checks shared by the Reorder edit form and the product form. */
export function validateLevels(min: number, max: number): string | null {
  if (!Number.isFinite(min) || min < 0) return "Enter a reorder point of 0 or more";
  if (!Number.isFinite(max) || max <= min) return "Order up to must be above the reorder point";
  return null;
}

/**
 * Stores a product-wide reorder point applies to: every store stock is bought into. Transit
 * locations are filled by transfers, not purchase orders, so they are left out.
 */
export function reorderStores<T extends { type: string }>(stores: readonly T[]): T[] {
  return stores.filter((s) => s.type !== "Transfer");
}

export function validateRule(rule: ReorderRule, rules: readonly ReorderRule[], products: readonly Product[], editing?: Pick<ReorderRule, "product" | "store">): string | null {
  const p = products.find((x) => x.name === rule.product);
  if (!p || !p.variants.some((v) => v.name === rule.variant) || !rule.store) return "Pick a product, variant and store";
  const levels = validateLevels(rule.min, rule.max);
  if (levels) return levels;
  const clash = rules.some((r) => r.product === rule.product && r.store === rule.store && !(editing && r.product === editing.product && r.store === editing.store));
  if (clash) return `${rule.product} already has a reorder point at ${rule.store}. Edit that one.`;
  return null;
}
