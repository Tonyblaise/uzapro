/** Supplier commands (FR-013, FR-014). Messages from the design's `supSave`. */
import { fail, ok, type NewSupplier, type Result, type Supplier } from "../types";
import { getStore, showToast } from "../store";

const dash = (v: string) => v.trim() || "—";
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Create (appended to the list) or edit a supplier. */
export async function saveSupplier(input: NewSupplier, edit?: string): Promise<Result<Supplier>> {
  const name = input.name.trim();
  if (!name) return fail("Enter a name");
  const store = getStore();
  const list = store.getState().suppliers;
  if (list.some((s) => same(s.name, name) && s.name !== edit)) {
    const m = `${name} is already in the list.`;
    showToast(m);
    return fail(m);
  }
  const supplier: Supplier = {
    name,
    type: input.type,
    phone: dash(input.phone),
    email: dash(input.email),
    town: dash(input.town),
    nation: input.nation || "Kenya",
    address: input.address.trim(),
    county: input.county.trim(),
    postal: input.postal.trim(),
    status: input.active ? { label: "Active", tone: "success" } : { label: "Inactive", tone: "neutral" },
  };
  store.setState((s) => {
    const at = edit ? s.suppliers.findIndex((x) => x.name === edit) : -1;
    const suppliers = at >= 0 ? s.suppliers.map((x, i) => (i === at ? supplier : x)) : [...s.suppliers, supplier];
    // Renaming keeps purchasing documents pointing at the supplier.
    const rename = <T extends { supplier: string }>(rows: T[]): T[] => (edit && edit !== name ? rows.map((r) => (r.supplier === edit ? { ...r, supplier: name } : r)) : rows);
    return {
      suppliers,
      purchases: {
        ...s.purchases,
        orders: rename(s.purchases.orders),
        receipts: rename(s.purchases.receipts),
        returns: rename(s.purchases.returns),
        rejected: rename(s.purchases.rejected),
      },
    };
  });
  const message = edit ? "Changes saved." : `${name} added.`;
  showToast(message);
  return ok(supplier, message);
}

export async function setSupplierActive(name: string, active: boolean): Promise<Result<void>> {
  getStore().setState((s) => ({
    suppliers: s.suppliers.map((x) => (x.name === name ? { ...x, status: active ? { label: "Active", tone: "success" } : { label: "Inactive", tone: "neutral" } } : x)),
  }));
  return ok(undefined);
}

export async function deleteSupplier(name: string): Promise<Result<void>> {
  getStore().setState((s) => ({ suppliers: s.suppliers.filter((x) => x.name !== name) }));
  const message = `${name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

/** The Nationality picker's "New nationality" (design `newNation`). */
export function addNation(name: string): string {
  const n = name.trim();
  if (n) getStore().setState((s) => (s.purchases.nations.includes(n) ? s : { purchases: { ...s.purchases, nations: [...s.purchases.nations, n] } }));
  return n;
}
