/** Reorder point commands (feature 014, contracts/data-access.md). */
import { DEMO_TODAY } from "@/lib/demo-clock";
import { onOrderQty, reorderPosition, reorderStores, ruleCost, ruleUnit, ruleVariant, validateLevels, validateRule } from "../reorder";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import { fail, ok, type ReorderRule, type Result } from "../types";
import { baseUnitOf, unitFactor } from "../units";
import { savePurchaseOrder } from "./purchases";

const same = (r: Pick<ReorderRule, "product" | "store">, product: string, store: string) => r.product === product && r.store === store;

export async function saveReorderRule(rule: ReorderRule, editing?: { product: string; store: string }): Promise<Result<void>> {
  const store = getStore();
  const s = store.getState();
  const clean: ReorderRule = { ...rule, min: Math.round(rule.min), max: Math.round(rule.max), supplier: rule.supplier.trim() };
  const err = validateRule(clean, s.stock.reorder, s.catalog.products, editing);
  if (err) return fail(err);
  clean.unit = ruleUnit(s.catalog.products, clean);
  store.setState((st) => {
    const at = editing ? st.stock.reorder.findIndex((r) => same(r, editing.product, editing.store)) : -1;
    const reorder = at >= 0 ? st.stock.reorder.map((r, i) => (i === at ? clean : r)) : [...st.stock.reorder, clean];
    return { stock: { ...st.stock, reorder } };
  });
  showToast("Reorder point saved.");
  return ok(undefined, "Reorder point saved.");
}

/**
 * Sets a product's reorder point from its variant in the product form: the same levels at every
 * store stock is bought into (`reorderStores`), ordering that variant. Stock is counted per product
 * and store, so this is one rule per store. An existing rule keeps its order unit and supplier.
 * `null` removes the product's reorder points. Silent: the product save shows the message.
 */
export async function setProductReorder(product: string, point: { variant: string; min: number; max: number } | null): Promise<Result<void>> {
  const store = getStore();
  const s = store.getState();
  if (!point) {
    store.setState((st) => ({ stock: { ...st.stock, reorder: st.stock.reorder.filter((r) => r.product !== product) } }));
    return ok(undefined, "Reorder points removed.");
  }
  const p = s.catalog.products.find((x) => x.name === product);
  const v = p?.variants.find((x) => x.name === point.variant);
  if (!p || !v) return fail("Pick a product and variant");
  const min = Math.round(point.min);
  const max = Math.round(point.max);
  const err = validateLevels(min, max);
  if (err) return fail(err);
  const stores = reorderStores(s.stock.stores).map((x) => x.name);
  store.setState((st) => {
    const kept = st.stock.reorder.filter((r) => r.product !== product || !stores.includes(r.store));
    const next = stores.map((name): ReorderRule => {
      const cur = st.stock.reorder.find((r) => same(r, product, name));
      const draft: ReorderRule = { product, variant: v.name, store: name, min, max, unit: cur?.unit ?? baseUnitOf(v), supplier: cur?.supplier ?? "" };
      return { ...draft, unit: ruleUnit(st.catalog.products, draft) };
    });
    return { stock: { ...st.stock, reorder: [...kept, ...next] } };
  });
  return ok(undefined, "Reorder points saved.");
}

export async function removeReorderRule(product: string, store: string): Promise<Result<void>> {
  getStore().setState((s) => ({ stock: { ...s.stock, reorder: s.stock.reorder.filter((r) => !same(r, product, store)) } }));
  showToast("Reorder point removed.");
  return ok(undefined, "Reorder point removed.");
}

/** Every rule with its live position (on hand, on order, suggestion, status). */
export function reorderRows(s: Pick<AppState, "stock" | "catalog" | "purchases">) {
  const products = s.catalog.products;
  return s.stock.reorder.map((rule) => {
    const unit = ruleUnit(products, rule);
    const variant = ruleVariant(products, rule)?.name ?? rule.variant;
    const onHand = s.stock.levels.find((l) => l.product === rule.product && l.store === rule.store)?.quantity ?? 0;
    const position = reorderPosition(rule, onHand, onOrderQty(s.purchases.orders, products, rule.product, rule.store), unitFactor(products, rule.product, variant, unit));
    return { ...rule, unit, variant, ...position };
  });
}

/**
 * One draft purchase order per supplier and store for the current suggestions (research R6).
 * Lines with no supplier are skipped. The drafts then count as on order, so a second run creates
 * nothing.
 */
export async function createReorderDrafts(): Promise<Result<string[]>> {
  const state = getStore().getState();
  const due = reorderRows(state).filter((r) => r.units > 0);
  if (due.length === 0) {
    showToast("Nothing needs reordering.");
    return ok([], "Nothing needs reordering.");
  }
  const skipped = due.filter((r) => !r.supplier).length;
  const groups = new Map<string, typeof due>();
  for (const r of due.filter((x) => x.supplier)) {
    const key = `${r.supplier}@@${r.store}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const refs: string[] = [];
  for (const rows of groups.values()) {
    const first = rows[0]!;
    const r = await savePurchaseOrder(
      {
        supplier: first.supplier,
        store: first.store,
        date: DEMO_TODAY,
        expected: "",
        notes: "Created from reorder points",
        term: "",
        method: "",
        account: "",
        paid: false,
        lines: rows.map((x) => ({ key: `${x.product} · ${x.variant}`, qty: x.units, unit: x.unit, cost: ruleCost(state.catalog.products, x) })),
      },
      { approve: false },
    );
    if (r.ok) refs.push(r.value.ref);
  }
  const made = refs.length ? `${refs.length} draft purchase ${refs.length === 1 ? "order" : "orders"} created.` : "No draft purchase orders created.";
  const message = skipped ? `${made} ${skipped} skipped: no supplier set.` : made;
  showToast(message);
  return ok(refs, message);
}
