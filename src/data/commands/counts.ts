/** Stock count commands (feature 017, contracts/data-access.md). Only approval changes stock. */
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { nextRef } from "@/lib/refs";
import { isOpenCount, validCounted, variance } from "../counts";
import { currentUserName } from "../profile";
import { getStore, showToast } from "../store";
import { KIND, applyStockChanges, type StockChange } from "../store/stockOps";
import { fail, ok, type Result, type StockCount } from "../types";

const refuse = <T = never>(message: string): Result<T> => {
  showToast(message);
  return fail(message);
};

function patch(ref: string, fn: (c: StockCount) => StockCount): void {
  getStore().setState((s) => ({ stock: { ...s.stock, counts: s.stock.counts.map((c) => (c.ref === ref ? fn(c) : c)) } }));
}

const find = (ref: string) => getStore().getState().stock.counts.find((c) => c.ref === ref);

/** Start a count of some or all of the products in stock at a store; each line keeps the system quantity now. */
export async function startCount(store: string, products: string[]): Promise<Result<StockCount>> {
  const st = getStore();
  const s = st.getState();
  if (!store) return fail("Pick a store");
  const open = s.stock.counts.find((c) => c.store === store && isOpenCount(c));
  if (open) return refuse(`${store} already has a count open: ${open.ref}.`);
  const here = s.stock.levels.filter((l) => l.store === store);
  const picked = here.filter((l) => products.includes(l.product));
  if (picked.length === 0) return fail("Tick at least one product");
  const count: StockCount = {
    ref: nextRef(s.stock.counts.map((c) => c.ref), "CNT-", 4),
    store,
    date: DEMO_TODAY,
    by: currentUserName(s),
    status: "In progress",
    full: picked.length === here.length,
    lines: picked.map((l) => ({ product: l.product, system: l.quantity, counted: null })),
  };
  st.setState((x) => ({ stock: { ...x.stock, counts: [count, ...x.stock.counts] } }));
  const message = `${count.ref} started.`;
  showToast(message);
  return ok(count, message);
}

/** Save counted quantities (by product) on a count in progress. Stock does not change. */
export async function saveCount(ref: string, counted: Record<string, number | null>): Promise<Result<void>> {
  const cur = find(ref);
  if (!cur) return fail("That count is not in the list.");
  if (cur.status !== "In progress") return refuse(`${ref} can no longer be changed.`);
  if (Object.values(counted).some((n) => !validCounted(n))) return fail("Enter whole numbers of 0 or more");
  patch(ref, (c) => ({ ...c, lines: c.lines.map((l) => (l.product in counted ? { ...l, counted: counted[l.product] ?? null } : l)) }));
  const message = `${ref} saved.`;
  showToast(message);
  return ok(undefined, message);
}

export async function submitCount(ref: string): Promise<Result<void>> {
  const cur = find(ref);
  if (!cur) return fail("That count is not in the list.");
  if (cur.status !== "In progress") return refuse(`${ref} can no longer be changed.`);
  const left = cur.lines.filter((l) => l.counted === null).length;
  if (left) return refuse(`Count every line first. ${left} left.`);
  patch(ref, (c) => ({ ...c, status: "Waiting approval" }));
  const message = `${ref} sent for approval.`;
  showToast(message);
  return ok(undefined, message);
}

/** Apply each line's variance to the current stock at the store (research R1) and close the count. */
export async function approveCount(ref: string): Promise<Result<void>> {
  const st = getStore();
  const s = st.getState();
  const cur = s.stock.counts.find((c) => c.ref === ref);
  if (!cur) return fail("That count is not in the list.");
  if (cur.status !== "Waiting approval") return refuse(`${ref} is not waiting for approval.`);
  const by = currentUserName(s);
  const changes: StockChange[] = cur.lines.flatMap((l) => {
    const v = variance(l);
    const p = s.catalog.products.find((x) => x.name === l.product);
    return v && p ? [{ product: l.product, variant: p.variants[0]?.name ?? "", store: cur.store, change: v, kind: KIND.counted, ref, by }] : [];
  });
  st.setState((x) => {
    const stock = changes.length ? applyStockChanges(x, changes).stock : x.stock;
    return { stock: { ...stock, counts: stock.counts.map((c) => (c.ref === ref ? { ...c, status: "Approved", approvedBy: by, approvedAt: `${fmtDate(DEMO_TODAY)}, ${demoTime()}` } : c)) } };
  });
  const message = `${ref} approved. Stock updated.`;
  showToast(message);
  return ok(undefined, message);
}

export async function sendBackCount(ref: string): Promise<Result<void>> {
  const cur = find(ref);
  if (!cur) return fail("That count is not in the list.");
  if (cur.status !== "Waiting approval") return refuse(`${ref} is not waiting for approval.`);
  patch(ref, (c) => ({ ...c, status: "In progress" }));
  const message = `${ref} sent back for a recount.`;
  showToast(message);
  return ok(undefined, message);
}

export async function cancelCount(ref: string): Promise<Result<void>> {
  const cur = find(ref);
  if (!cur) return fail("That count is not in the list.");
  if (!isOpenCount(cur)) return refuse(`${ref} can no longer be changed.`);
  patch(ref, (c) => ({ ...c, status: "Cancelled" }));
  const message = `${ref} cancelled.`;
  showToast(message);
  return ok(undefined, message);
}
