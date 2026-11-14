/** Van sales commands (feature 021, contracts/data-access.md). A visit's sale is a normal sale from the van. */
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { nextRef } from "@/lib/refs";
import { WALK_IN } from "../fixtures/customers";
import { currentUserName } from "../profile";
import { getStore, showToast } from "../store";
import { fail, ok, type NewSale, type Result, type Sale, type Visit } from "../types";
import { recordSale } from "./sales";

const refuse = <T = never>(message: string): Result<T> => {
  showToast(message);
  return fail(message);
};

const patch = (id: string, fn: (v: Visit) => Visit) => getStore().setState((s) => ({ sales: { ...s.sales, visits: s.sales.visits.map((v) => (v.id === id ? fn(v) : v)) } }));

/** Add a planned visit for today to a van's route. */
export async function addVisit(customer: string, van: string): Promise<Result<Visit>> {
  const store = getStore();
  const s = store.getState();
  if (!van) return fail("Pick a van");
  if (!customer || customer === WALK_IN || !s.customers.some((c) => c.name === customer)) return fail("Pick a customer");
  if (s.sales.visits.some((v) => v.van === van && v.date === DEMO_TODAY && v.customer === customer)) return refuse(`${customer} is already on today's route.`);
  const visit: Visit = { id: nextRef(s.sales.visits.map((v) => v.id), "VIS-", 4), date: DEMO_TODAY, customer, van, rep: currentUserName(s), status: "Planned" };
  store.setState((x) => ({ sales: { ...x.sales, visits: [...x.sales.visits, visit] } }));
  const message = `${customer} added to the route.`;
  showToast(message);
  return ok(visit, message);
}

/** Sell from the van on a visit: prices, credit, units and the shortfall check are the sale's own. */
export async function sellOnVisit(id: string, sale: Omit<NewSale, "customer" | "store">): Promise<Result<Sale>> {
  const visit = getStore().getState().sales.visits.find((v) => v.id === id);
  if (!visit) return fail("That visit is not on the route.");
  if (visit.status !== "Planned") return refuse(`The visit to ${visit.customer} is already closed.`);
  const r = await recordSale({ ...sale, customer: visit.customer, store: visit.van });
  if (r.ok) patch(id, (v) => ({ ...v, status: "Sold", sale: r.value.ref, at: demoTime() }));
  return r;
}

export async function noSaleOnVisit(id: string, reason: string): Promise<Result<void>> {
  const visit = getStore().getState().sales.visits.find((v) => v.id === id);
  if (!visit) return fail("That visit is not on the route.");
  if (visit.status !== "Planned") return refuse(`The visit to ${visit.customer} is already closed.`);
  if (!reason) return fail("Pick a reason");
  patch(id, (v) => ({ ...v, status: "No sale", reason, at: demoTime() }));
  const message = `No sale recorded for ${visit.customer}.`;
  showToast(message);
  return ok(undefined, message);
}
