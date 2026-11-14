/** Customer group and price list commands (feature 012, contracts/data-access.md). */
import { fail, ok, type CustomerGroup, type PriceEntry, type Result } from "../types";
import { RETAIL_GROUP, validateEntry, validateGroupName } from "../pricing";
import { getStore, showToast } from "../store";

const refuse = <T = never>(message: string): Result<T> => {
  showToast(message);
  return fail(message);
};

export async function addCustomerGroup(name: string): Promise<Result<CustomerGroup>> {
  const store = getStore();
  const { pricing } = store.getState();
  const err = validateGroupName(name, pricing.groups);
  if (err) return fail(err);
  const groupNo = pricing.groupNo + 1;
  const group: CustomerGroup = { id: `g-${groupNo}`, name: name.trim(), builtIn: false };
  store.setState((s) => ({ pricing: { ...s.pricing, groups: [...s.pricing.groups, group], groupNo } }));
  const message = `${group.name} added.`;
  showToast(message);
  return ok(group, message);
}

export async function renameCustomerGroup(id: string, name: string): Promise<Result<void>> {
  const store = getStore();
  const { groups } = store.getState().pricing;
  const cur = groups.find((g) => g.id === id);
  if (!cur) return fail("That group is not in the list.");
  if (cur.builtIn) return refuse(`${cur.name} can't be renamed.`);
  const err = validateGroupName(name, groups, id);
  if (err) return fail(err);
  const next = name.trim();
  store.setState((s) => ({ pricing: { ...s.pricing, groups: s.pricing.groups.map((g) => (g.id === id ? { ...g, name: next } : g)) } }));
  const message = `${next} saved.`;
  showToast(message);
  return ok(undefined, message);
}

/** Only a group with no customers can go; its prices go with it. */
export async function deleteCustomerGroup(id: string): Promise<Result<void>> {
  const store = getStore();
  const s = store.getState();
  const cur = s.pricing.groups.find((g) => g.id === id);
  if (!cur) return fail("That group is not in the list.");
  if (cur.builtIn || id === RETAIL_GROUP) return refuse(`${cur.name} can't be deleted.`);
  const n = s.customers.filter((c) => c.group === id).length;
  if (n) return refuse(`Move ${n} ${n === 1 ? "customer" : "customers"} to another group first.`);
  store.setState((st) => ({ pricing: { ...st.pricing, groups: st.pricing.groups.filter((g) => g.id !== id), prices: st.pricing.prices.filter((e) => e.group !== id) } }));
  const message = `${cur.name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

const sameKey = (a: PriceEntry, b: PriceEntry) => a.group === b.group && a.product === b.product && a.variant === b.variant && a.unit === b.unit;

/** Add a price, or save an edited one (`editing` is the entry as it was). */
export async function savePrice(entry: PriceEntry, editing?: PriceEntry): Promise<Result<void>> {
  const store = getStore();
  const s = store.getState();
  if (entry.group === RETAIL_GROUP || !s.pricing.groups.some((g) => g.id === entry.group)) return fail("Pick a price list");
  const was = editing ? s.pricing.prices.find((e) => sameKey(e, editing)) : undefined;
  const err = validateEntry(entry, s.pricing.prices, was);
  if (err) return fail(err);
  const variant = s.catalog.products.find((p) => p.name === entry.product)?.variants.find((v) => v.name === entry.variant);
  if (!variant) return fail("Pick a product, variant and unit");
  const clean: PriceEntry = { ...entry, breaks: [...entry.breaks].sort((a, b) => a.from - b.from) };
  store.setState((st) => ({ pricing: { ...st.pricing, prices: was ? st.pricing.prices.map((e) => (e === was ? clean : e)) : [...st.pricing.prices, clean] } }));
  showToast("Price saved.");
  return ok(undefined, "Price saved.");
}

export async function removePrice(entry: PriceEntry): Promise<Result<void>> {
  getStore().setState((s) => ({ pricing: { ...s.pricing, prices: s.pricing.prices.filter((e) => !sameKey(e, entry)) } }));
  showToast("Price removed.");
  return ok(undefined, "Price removed.");
}
