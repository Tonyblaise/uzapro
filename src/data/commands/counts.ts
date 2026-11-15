/**
 * Stock count commands (design `scVals`, feature 025). Counting saves as you go; only approval
 * changes stock. Approving, sending back and cancelling need the "Approve stock counts" right
 * (feature 018).
 */
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { nextRef } from "@/lib/refs";
import { myApprovals } from "../approvals";
import { countTotals, isOpenCount, signedKes, validCounted, variance } from "../counts";
import { currentUserName } from "../profile";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import { applyStockChanges, type StockChange } from "../store/stockOps";
import { fail, ok, type CountLine, type Pill, type Result, type StockCount } from "../types";

const refuse = <T = never>(message: string): Result<T> => {
  showToast(message);
  return fail(message);
};
const stamp = () => `${fmtDate(DEMO_TODAY)}, ${demoTime()}`;
const who = () => currentUserName(getStore().getState());
const find = (ref: string) => getStore().getState().stock.counts.find((c) => c.ref === ref);

function patch(ref: string, fn: (c: StockCount) => StockCount): void {
  getStore().setState((s) => ({ stock: { ...s.stock, counts: s.stock.counts.map((c) => (c.ref === ref ? fn(c) : c)) } }));
}
const logged = (c: StockCount, what: string): StockCount["history"] => [...c.history, { when: stamp(), what, who: who() }];

/** Buying price of a product's first variant: count values are at cost. */
export const costOf = (s: Pick<AppState, "catalog">) => (product: string) => s.catalog.products.find((p) => p.name === product)?.variants[0]?.cost ?? 0;

const mayApprove = () => myApprovals(getStore().getState()).counts;
const NOT_ALLOWED = "Your role can't approve stock counts.";

/** Stores you can count (design: every warehouse but Goods in Transit). */
export const countStores = (s: Pick<AppState, "stock">) => s.stock.stores.filter((x) => x.type !== "Transfer").map((x) => x.name);

/** The lines a new count would have: every product, or one category, with the store's stock now. */
export function countLines(s: Pick<AppState, "stock" | "catalog">, store: string, category?: string): CountLine[] {
  return s.catalog.products
    .filter((p) => !category || p.category === category)
    .map((p) => ({
      product: p.name,
      category: p.category,
      variants: p.variants.map((v) => v.name),
      system: s.stock.levels.find((l) => l.product === p.name && l.store === store)?.quantity ?? 0,
      counted: null,
      note: "",
    }));
}

export interface NewCount {
  store: string;
  scope: "all" | "cat";
  category: string;
  by: string;
  blind: boolean;
}

/** "Start counting". */
export async function startCount(input: NewCount): Promise<Result<StockCount>> {
  const st = getStore();
  const s = st.getState();
  if (!input.store) return fail("Pick the store to count.");
  if (input.scope === "cat" && !input.category) return fail("Pick the category.");
  if (!input.by) return fail("Pick who is counting.");
  const scope = input.scope === "all" ? "Everything" : input.category;
  // Two open counts of the same store may not cover the same products.
  const clash = s.stock.counts.find((c) => c.store === input.store && isOpenCount(c) && (c.scope === "Everything" || scope === "Everything" || c.scope === scope));
  if (clash) return fail(`${input.store} already has a count open that covers this: ${clash.ref}.`);
  const lines = countLines(s, input.store, input.scope === "cat" ? input.category : undefined);
  if (!lines.length) return fail("There is nothing to count in that category.");
  const count: StockCount = {
    ref: nextRef(s.stock.counts.map((c) => c.ref), "SC-", 4),
    store: input.store,
    scope,
    blind: input.blind,
    date: DEMO_TODAY,
    by: input.by,
    status: "Counting",
    lines,
    history: [{ when: stamp(), what: "Count started", who: currentUserName(s) }],
  };
  st.setState((x) => ({ stock: { ...x.stock, counts: [count, ...x.stock.counts] } }));
  return ok(count, `${count.ref} started.`);
}

/** A counted quantity (or null to clear it), saved as you go. */
export async function setCounted(ref: string, product: string, counted: number | null): Promise<Result<void>> {
  const cur = find(ref);
  if (!cur || cur.status !== "Counting") return fail(`${ref} can no longer be changed.`);
  const n = counted === null ? null : Math.max(0, Math.round(counted));
  if (!validCounted(n)) return fail("Enter a whole number of 0 or more.");
  patch(ref, (c) => ({ ...c, lines: c.lines.map((l) => (l.product === product ? { ...l, counted: n } : l)) }));
  return ok(undefined);
}

export async function setCountNote(ref: string, product: string, note: string): Promise<Result<void>> {
  const cur = find(ref);
  if (!cur || cur.status !== "Counting") return fail(`${ref} can no longer be changed.`);
  patch(ref, (c) => ({ ...c, lines: c.lines.map((l) => (l.product === product ? { ...l, note } : l)) }));
  return ok(undefined);
}

export async function toggleBlind(ref: string): Promise<Result<void>> {
  const cur = find(ref);
  if (!cur || cur.status !== "Counting") return fail(`${ref} can no longer be changed.`);
  patch(ref, (c) => ({ ...c, blind: !c.blind }));
  return ok(undefined);
}

/** "Save and close": counts are already saved. */
export async function saveCount(ref: string): Promise<Result<void>> {
  const message = `${ref} saved. Carry on any time.`;
  showToast(message);
  return ok(undefined, message);
}

export async function submitCount(ref: string): Promise<Result<void>> {
  const s = getStore().getState();
  const cur = s.stock.counts.find((c) => c.ref === ref);
  if (!cur) return fail("That count is not in the list.");
  if (cur.status !== "Counting") return refuse(`${ref} can no longer be changed.`);
  const left = cur.lines.filter((l) => l.counted === null).length;
  if (left) return refuse(`${left} ${left === 1 ? "line is" : "lines are"} not counted yet. Count them, even if the answer is 0.`);
  const t = countTotals(cur, costOf(s));
  patch(ref, (c) => ({ ...c, status: "Waiting approval", submittedAt: stamp(), history: logged(c, `Submitted for approval. ${t.diffs} differences, ${signedKes(t.value)} net`) }));
  const message = `${ref} sent for approval.`;
  showToast(message);
  return ok(undefined, message);
}

/** Lines with differences are cleared and counted again; the rest stay. */
export async function sendBackCount(ref: string): Promise<Result<void>> {
  if (!mayApprove()) return refuse(NOT_ALLOWED);
  const cur = find(ref);
  if (!cur) return fail("That count is not in the list.");
  if (cur.status !== "Waiting approval") return refuse(`${ref} is not waiting for approval.`);
  const diffs = cur.lines.filter((l) => (variance(l) ?? 0) !== 0).length;
  patch(ref, (c) => ({
    ...c,
    status: "Counting",
    lines: c.lines.map((l) => ((variance(l) ?? 0) !== 0 ? { ...l, counted: null } : l)),
    history: logged(c, `Sent back to recount ${diffs} lines with differences`),
  }));
  const message = "Lines with differences cleared for recount.";
  showToast(message);
  return ok(undefined, message);
}

/** Apply each difference to the store's stock (research R1: to the stock now) and close the count. */
export async function approveCount(ref: string): Promise<Result<void>> {
  if (!mayApprove()) return refuse(NOT_ALLOWED);
  const st = getStore();
  const s = st.getState();
  const cur = s.stock.counts.find((c) => c.ref === ref);
  if (!cur) return fail("That count is not in the list.");
  if (cur.status !== "Waiting approval") return refuse(`${ref} is not waiting for approval.`);
  const by = currentUserName(s);
  const t = countTotals(cur, costOf(s));
  const changes: StockChange[] = cur.lines.flatMap((l) => {
    const v = variance(l);
    if (!v) return [];
    const kind: Pill = { label: "Count", tone: v < 0 ? "warning" : "info" };
    return [{ product: l.product, variant: l.variants[0] ?? "", store: cur.store, change: v, kind, ref, by }];
  });
  const at = stamp();
  st.setState((x) => {
    const stock = changes.length ? applyStockChanges(x, changes).stock : x.stock;
    return {
      stock: {
        ...stock,
        counts: stock.counts.map((c) =>
          c.ref === ref ? { ...c, status: "Approved", approvedBy: by, approvedAt: at, history: [...c.history, { when: at, what: `Approved. Stock updated for ${t.diffs} lines (${signedKes(t.value)})`, who: by }] } : c,
        ),
      },
    };
  });
  const message = `${ref} approved. Stock updated.`;
  showToast(message);
  return ok(undefined, message);
}

export async function cancelCount(ref: string): Promise<Result<void>> {
  if (!mayApprove()) return refuse(NOT_ALLOWED);
  const cur = find(ref);
  if (!cur) return fail("That count is not in the list.");
  if (!isOpenCount(cur)) return refuse(`${ref} can no longer be changed.`);
  patch(ref, (c) => ({ ...c, status: "Cancelled", history: logged(c, "Count cancelled. Stock not changed") }));
  const message = `${ref} cancelled.`;
  showToast(message);
  return ok(undefined, message);
}
