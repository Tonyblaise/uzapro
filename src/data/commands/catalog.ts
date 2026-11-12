/**
 * Catalogue commands (FR-009, FR-010). Messages are copied from the design's script
 * (`prodSave`, `catSave`, `unitSave`, `removeRow` and the Categories row "Delete" action).
 */
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { num } from "@/lib/format";
import { currentUserName } from "../profile";
import { fail, ok, type Category, type NewCategory, type NewProduct, type Product, type Result } from "../types";
import { UZ_UNITS } from "../fixtures/reference";
import { getStore, showToast } from "../store";

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const IMAGE_TYPES = ["image/svg+xml", "image/png", "image/jpeg"];
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Validate a picked image file with the design's messages (`prodImage`, `catImage`). */
export function checkImage(file: { type: string; size: number }): Result<void> {
  if (!IMAGE_TYPES.includes(file.type)) return fail("Choose an SVG, PNG or JPG image.");
  if (file.size > IMAGE_MAX_BYTES) return fail("That image is over 5MB.");
  return ok(undefined);
}

/** The design's list price: lowest variant price, "From …" when the prices differ (`prodSave`). */
export function priceLabel(prices: number[]): string {
  if (prices.length === 0) return "0";
  const min = Math.min(...prices);
  return prices.every((p) => p === min) ? num(min) : `From ${num(min)}`;
}

/**
 * The full unit list. The design's Units of measure tab lists `UZ_UNITS` and edits it in place.
 * The store slice starts empty, so an empty slice means "the seed list, unchanged".
 */
export function unitList(units: readonly string[]): string[] {
  return units.length ? [...units] : [...UZ_UNITS];
}

function cleanVariants(input: NewProduct): Product["variants"] {
  return input.variants
    .filter((v) => (input.hasVariants === false || v.name.trim()) && v.price > 0)
    .map((v) => ({ ...v, name: input.hasVariants === false ? "Standard" : v.name.trim(), extraUnits: v.extraUnits.filter((u) => u.price > 0) }));
}

export async function createProduct(input: NewProduct): Promise<Result<Product>> {
  const name = input.name.trim();
  // The design disables Save until these hold; the messages below are defensive (not in the design).
  if (!name) return fail("Enter a product name.");
  const store = getStore();
  const state = store.getState();
  if (state.catalog.products.some((p) => same(p.name, name))) return fail(`${name} is already a product.`);
  const variants = cleanVariants(input);
  if (variants.length === 0) return fail("Each product needs at least one price.");
  const product: Product = {
    name,
    category: input.category,
    priceLabel: priceLabel(variants.flatMap((v) => [v.price, ...v.extraUnits.map((u) => u.price)])),
    taxable: input.taxable,
    // The design lists a new product as Active (`prodSave`).
    status: { label: "Active", tone: "success" },
    ...(input.image ? { image: input.image } : {}),
    ...(input.tax ? { tax: input.tax } : {}),
    hasVariants: input.hasVariants !== false,
    addedAt: `${DEMO_TODAY}T${demoTime()}`,
    addedBy: currentUserName(state),
    variants,
  };
  store.setState((s) => ({ catalog: { ...s.catalog, products: [product, ...s.catalog.products] } }));
  const message = `${name} added.`;
  showToast(message);
  return ok(product, message);
}

/** Edit a product (design `prodEdit` + `prodSave` with `edit`). A rename follows into stock records. */
export async function updateProduct(original: string, input: NewProduct): Promise<Result<Product>> {
  const name = input.name.trim();
  if (!name) return fail("Enter a product name.");
  const store = getStore();
  const { products } = store.getState().catalog;
  const current = products.find((p) => p.name === original);
  if (!current) return fail("That product is not in the list.");
  if (!same(name, original) && products.some((p) => same(p.name, name))) return fail(`${name} is already a product.`);
  const variants = cleanVariants(input);
  if (variants.length === 0) return fail("Each product needs at least one price.");
  const { image: _oldImage, ...rest } = current;
  void _oldImage;
  const updated: Product = {
    ...rest,
    name,
    category: input.category,
    priceLabel: priceLabel(variants.flatMap((v) => [v.price, ...v.extraUnits.map((u) => u.price)])),
    taxable: input.taxable,
    ...(input.image ? { image: input.image } : {}),
    ...(input.tax ? { tax: input.tax } : {}),
    hasVariants: input.hasVariants !== false,
    variants,
  };
  const rename = (p: string) => (p === original ? name : p);
  store.setState((s) => ({
    catalog: { ...s.catalog, products: s.catalog.products.map((p) => (p.name === original ? updated : p)) },
    stock:
      name === original
        ? s.stock
        : {
            ...s.stock,
            levels: s.stock.levels.map((l) => ({ ...l, product: rename(l.product) })),
            movements: s.stock.movements.map((m) => ({ ...m, product: rename(m.product) })),
          },
  }));
  showToast("Changes saved.");
  return ok(updated, "Changes saved.");
}

/** Row "Delete" on All products, after the confirm drawer (design `removeRow`). */
export async function deleteProduct(name: string): Promise<Result<void>> {
  const store = getStore();
  if (!store.getState().catalog.products.some((p) => p.name === name)) return fail("That product is not in the list.");
  store.setState((s) => ({ catalog: { ...s.catalog, products: s.catalog.products.filter((p) => p.name !== name) } }));
  const message = `${name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

export async function createCategory(input: NewCategory): Promise<Result<Category>> {
  const name = input.name.trim();
  if (!name) return fail("Enter a name.");
  const store = getStore();
  if (store.getState().catalog.categories.some((c) => same(c.name, name))) return fail(`A category called ${name} already exists.`);
  const category: Category = { name, description: input.description.trim(), parent: input.parent ?? "", ...(input.image ? { image: input.image } : {}) };
  store.setState((s) => ({ catalog: { ...s.catalog, categories: [...s.catalog.categories, category] } }));
  const message = `${name} added${category.parent ? ` under ${category.parent}` : ""}.`;
  showToast(message);
  return ok(category, message);
}

/** Sub-category created inline from the product form's picker (design `newSubCategory`). */
export function addSubCategory(name: string, parent: string): string {
  const store = getStore();
  const t = name.trim();
  if (!t || !parent || store.getState().catalog.categories.some((c) => same(c.name, t))) return t;
  store.setState((s) => ({ catalog: { ...s.catalog, categories: [...s.catalog.categories, { name: t, description: "", parent }] } }));
  showToast(`${t} added under ${parent}.`);
  return t;
}

export async function updateCategory(original: string, patch: NewCategory): Promise<Result<Category>> {
  const name = patch.name.trim();
  if (!name) return fail("Enter a name.");
  const store = getStore();
  const { categories } = store.getState().catalog;
  const current = categories.find((c) => c.name === original);
  if (!current) return fail("That category is not in the list.");
  if (!same(name, original) && categories.some((c) => same(c.name, name))) return fail(`A category called ${name} already exists.`);
  const parent = patch.parent !== undefined && patch.parent !== original ? patch.parent : current.parent;
  const { image: _oldImage, ...rest } = current;
  void _oldImage;
  const updated: Category = { ...rest, name, description: patch.description.trim(), parent, ...(patch.image ? { image: patch.image } : {}) };
  store.setState((s) => ({
    catalog: {
      ...s.catalog,
      categories: s.catalog.categories.map((c) => (c.name === original ? updated : c.parent === original ? { ...c, parent: name } : c)),
      products: s.catalog.products.map((p) => (p.category === original ? { ...p, category: name } : p)),
    },
  }));
  showToast("Changes saved.");
  return ok(updated, "Changes saved.");
}

/**
 * Categories row "Delete". Blocked while it (or its sub-categories) hold products, or while it
 * has sub-categories, as the design does. On success the caller has already confirmed.
 */
export function canDeleteCategory(name: string): Result<void> {
  const { categories, products } = getStore().getState().catalog;
  const subs = categories.filter((c) => c.parent === name).map((c) => c.name);
  if (products.some((p) => p.category === name || subs.includes(p.category))) return fail("Move its products to another category first.");
  if (subs.length) return fail("Move or delete its sub-categories first.");
  return ok(undefined);
}

export async function deleteCategory(name: string): Promise<Result<void>> {
  const check = canDeleteCategory(name);
  if (!check.ok) return check;
  const store = getStore();
  store.setState((s) => ({ catalog: { ...s.catalog, categories: s.catalog.categories.filter((c) => c.name !== name) } }));
  const message = `${name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

/**
 * Add a unit of measure (design `unitSave`). `silent` is the unit picker's inline create
 * (`stNewUnit`), which adds the unit without a toast.
 */
export async function createUnit(name: string, opts: { silent?: boolean } = {}): Promise<Result<string>> {
  const unit = name.trim();
  if (!unit) return fail("Enter a name.");
  const store = getStore();
  const list = unitList(store.getState().catalog.units);
  if (list.includes(unit)) return fail(`${unit} is already in the list.`);
  store.setState((s) => ({ catalog: { ...s.catalog, units: [...unitList(s.catalog.units), unit] } }));
  const message = `${unit} added.`;
  if (!opts.silent) showToast(message);
  return ok(unit, message);
}

export async function updateUnit(original: string, name: string): Promise<Result<string>> {
  const unit = name.trim();
  if (!unit) return fail("Enter a name.");
  const store = getStore();
  const list = unitList(store.getState().catalog.units);
  if (list.includes(unit) && unit !== original) return fail(`${unit} is already in the list.`);
  store.setState((s) => ({ catalog: { ...s.catalog, units: unitList(s.catalog.units).map((u) => (u === original ? unit : u)) } }));
  showToast("Changes saved.");
  return ok(unit, "Changes saved.");
}

export async function deleteUnit(name: string): Promise<Result<void>> {
  const store = getStore();
  store.setState((s) => ({ catalog: { ...s.catalog, units: unitList(s.catalog.units).filter((u) => u !== name) } }));
  const message = `${name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}
