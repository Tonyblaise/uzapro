/** Customer commands (FR-025). Messages from the design (`custStore`). */
import { fail, ok, type Customer, type NewCustomer, type Result } from "../types";
import { getStore, showToast } from "../store";
import { WALK_IN } from "../fixtures/customers";
import { RETAIL_GROUP } from "../pricing";
import { PAY_TERMS } from "../credit";
import type { AppState } from "../store/state";

/** Feature 012: the group, limit and terms to store. The walk-in customer is always Retail with no limit. */
function creditFields(s: AppState, name: string, input: NewCustomer, cur?: Customer): Pick<Customer, "group" | "creditLimit" | "terms"> | string {
  const base = { group: cur?.group ?? RETAIL_GROUP, creditLimit: cur?.creditLimit ?? null, terms: cur?.terms ?? ("30 days" as const) };
  if (name === WALK_IN || cur?.name === WALK_IN) return { group: RETAIL_GROUP, creditLimit: null, terms: "30 days" };
  const limit = input.creditLimit === undefined ? base.creditLimit : input.creditLimit;
  if (limit !== null && !(Number.isFinite(limit) && limit >= 0)) return "Enter an amount of 0 or more";
  const group = input.group && s.pricing.groups.some((g) => g.id === input.group) ? input.group : base.group;
  const terms = input.terms && PAY_TERMS.includes(input.terms) ? input.terms : base.terms;
  return { group, creditLimit: limit, terms };
}

const dash = (v: string) => v.trim() || "—";

export async function createCustomer(input: NewCustomer): Promise<Result<Customer>> {
  const name = input.name.trim();
  if (!name) return fail("Enter a name");
  const store = getStore();
  if (store.getState().customers.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    const m = `${name} is already a customer.`;
    showToast(m);
    return fail(m);
  }
  const extra = creditFields(store.getState(), name, input);
  if (typeof extra === "string") return fail(extra);
  const customer: Customer = {
    ...extra,
    name,
    phone: dash(input.phone),
    email: dash(input.email),
    address: dash(input.address),
    status: { label: "Active", tone: "success" },
  };
  // The design appends new customers to the end of the list.
  store.setState((s) => ({ customers: [...s.customers, customer] }));
  const message = `${name} added.`;
  showToast(message);
  return ok(customer, message);
}

/** "Edit customer": renaming also renames the customer on every sales document (design `custStore`). */
export async function updateCustomer(original: string, input: NewCustomer): Promise<Result<Customer>> {
  const name = input.name.trim();
  if (!name) return fail("Enter a name");
  const store = getStore();
  const list = store.getState().customers;
  const cur = list.find((c) => c.name === original);
  if (!cur) return fail("That customer is not in the list.");
  if (list.some((c) => c !== cur && c.name.toLowerCase() === name.toLowerCase())) {
    const m = `Another customer is already called ${name}.`;
    showToast(m);
    return fail(m);
  }
  const extra = creditFields(store.getState(), name, input, cur);
  if (typeof extra === "string") return fail(extra);
  const updated: Customer = { ...cur, ...extra, name, phone: dash(input.phone), email: dash(input.email), address: dash(input.address) };
  const fix = <T extends { customer: string }>(rows: T[]): T[] => (name === original ? rows : rows.map((r) => (r.customer === original ? { ...r, customer: name } : r)));
  store.setState((s) => ({
    customers: s.customers.map((c) => (c === cur ? updated : c)),
    sales: {
      ...s.sales,
      sales: fix(s.sales.sales),
      quotations: fix(s.sales.quotations),
      invoices: fix(s.sales.invoices),
      creditNotes: fix(s.sales.creditNotes),
      voids: fix(s.sales.voids),
      orders: fix(s.sales.orders),
      deliveries: fix(s.sales.deliveries),
      visits: fix(s.sales.visits),
    },
  }));
  const message = `${name} saved.`;
  showToast(message);
  return ok(updated, message);
}

/** Row action "Mark inactive" / "Mark active" (no toast in the design). */
export async function toggleCustomerActive(name: string): Promise<Result<void>> {
  getStore().setState((s) => ({
    customers: s.customers.map((c) =>
      c.name === name ? { ...c, status: c.status.label === "Inactive" ? { label: "Active", tone: "success" } : { label: "Inactive", tone: "neutral" } } : c,
    ),
  }));
  return ok(undefined);
}
