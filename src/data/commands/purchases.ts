/**
 * Purchases commands (feature 002, specs/002-purchases-suppliers/contracts/data-access.md).
 * Messages are the design's `showToast(...)` text (design/canvas/Uzapoint ERP.dc.html: poFinish,
 * poAccept, pvNext, pvPay, the receive drawer's `save`, the purchase return `finish`, `prtStock`,
 * the "Purchase returns" row action "Approve", the rejected-item view `mark`, gvPrint / gvPdf).
 * The design blocks invalid input by disabling its buttons, so the guard messages below are
 * defensive only and never shown by the purchases screens.
 */
import { ROLES } from "@/config/roles";
import { DEMO_TODAY, addDays, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { nextRef } from "@/lib/refs";
import {
  fail,
  ok,
  type GoodsReceipt,
  type GrnLine,
  type NewPurchaseOrder,
  type NewPurchaseReturn,
  type NewReceipt,
  type Pill,
  type PoLine,
  type PurchaseOrder,
  type PurchaseReturn,
  type RejectedItem,
  type RejectedOutcome,
  type Result,
} from "../types";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import { KIND, applyStockChanges, findShortfall, type StockChange } from "../store/stockOps";

const who = () => ROLES[getStore().getState().session.role].name;
const n = (x: number) => Math.max(0, Number(x) || 0);
const split = (key: string) => {
  const cut = key.indexOf(" · ");
  return cut < 0 ? null : { product: key.slice(0, cut), variant: key.slice(cut + 3) };
};

const PILL = {
  none: { label: "None", tone: "neutral" },
  partial: { label: "Partial", tone: "warning" },
  full: { label: "Full", tone: "success" },
  draft: { label: "Draft", tone: "neutral" },
  approved: { label: "Approved", tone: "success" },
  accepted: { label: "Accepted", tone: "success" },
  completed: { label: "Completed", tone: "success" },
  saved: { label: "Saved", tone: "success" },
  waiting: { label: "Waiting", tone: "warning" },
  waitingApproval: { label: "Waiting approval", tone: "warning" },
} satisfies Record<string, Pill>;

/** The design's purchase-return movement kind (`prtStock`). */
const RETURNED_TO_SUPPLIER: Pill = { label: "Returned to supplier", tone: "warning" };

/** Defensive guard text (not in the design, which disables the button instead). */
function shortfallMessage(s: { product: string; store: string; available: number }): string {
  return `Only ${s.available} ${s.product} left at ${s.store}.`;
}

function patchOrder(ref: string, patch: (o: PurchaseOrder) => PurchaseOrder): void {
  getStore().setState((s) => ({ purchases: { ...s.purchases, orders: s.purchases.orders.map((o) => (o.ref === ref ? patch(o) : o)) } }));
}

const isAccepted = (o: PurchaseOrder) => o.status.label === "Accepted" || o.status.label === "Completed";

// ---- Purchase orders -------------------------------------------------------------------------

/** "Save and approve" / "Save as draft" on the purchase order form (design `poFinish`). */
export async function savePurchaseOrder(input: NewPurchaseOrder, opts: { approve: boolean; edit?: string }): Promise<Result<PurchaseOrder>> {
  if (!input.supplier || !input.store || input.lines.length === 0 || input.lines.some((l) => !(l.qty > 0))) {
    return fail("No items added yet. Search for a product above.");
  }
  const store = getStore();
  const state = store.getState();
  const prev = opts.edit ? state.purchases.orders.find((o) => o.ref === opts.edit) : undefined;
  if (opts.edit && !prev) return fail(`${opts.edit} is not in the list.`);
  const ref = prev?.ref ?? nextRef(state.purchases.orders.map((o) => o.ref), "PUR-ORD-", 4);
  const by = who();
  const orderDate = input.date || "2026-11-01";
  const term = input.term || "Cash on delivery";
  const method = input.method || "Cash";
  const activity: [string, string][] = (prev?.activity ?? [["Order created", `${by} · ${fmtDate(orderDate)}`]]).slice();
  if (opts.approve && !activity.some((a) => a[0] === "Sent to supplier")) activity.push(["Sent to supplier", by]);
  if (input.paid && !prev?.paid) activity.push([`Paid by ${method}`, term]);
  const stamp = Date.now();
  const lines: PoLine[] = input.lines.map((l, i) => ({ id: l.id ?? `po${stamp}-${i}`, key: l.key, qty: l.qty, unit: l.unit, cost: l.cost, recv: l.recv ?? 0 }));
  const order: PurchaseOrder = {
    ref,
    supplier: input.supplier,
    store: input.store,
    date: orderDate,
    expected: input.expected || "",
    notes: input.notes,
    term,
    method,
    account: input.account || "",
    paid: input.paid,
    lines,
    total: Math.round(lines.reduce((a, l) => a + l.qty * l.cost, 0)),
    received: PILL.none,
    status: opts.approve ? PILL.approved : PILL.draft,
    activity,
    grns: prev?.grns ?? [],
  };
  store.setState((s) => {
    const orders = prev ? s.purchases.orders.map((o) => (o.ref === ref ? order : o)) : [order, ...s.purchases.orders];
    return { purchases: { ...s.purchases, orders } };
  });
  const message = `${ref} saved.`;
  showToast(message);
  return ok(order, message);
}

/** Row action "Accept" and the order view's "Mark as accepted" (design `poAccept(raw, false)`). */
export async function acceptPurchaseOrder(ref: string): Promise<Result<PurchaseOrder>> {
  const o = getStore().getState().purchases.orders.find((x) => x.ref === ref);
  if (!o) return fail(`${ref} is not in the list.`);
  const updated: PurchaseOrder = {
    ...o,
    activity: isAccepted(o) ? o.activity : [...o.activity, ["Accepted", who()]],
    status: PILL.accepted,
  };
  patchOrder(ref, () => updated);
  const message = `${ref} accepted.`;
  showToast(message);
  return ok(updated, message);
}

/** The order view's "Mark as sent" on a draft (design `pvNext`). */
export async function sendPurchaseOrder(ref: string): Promise<Result<PurchaseOrder>> {
  const o = getStore().getState().purchases.orders.find((x) => x.ref === ref);
  if (!o || o.status.label !== "Draft") return fail(`${ref} is not a draft.`);
  const updated: PurchaseOrder = { ...o, status: PILL.approved, activity: [...o.activity, ["Sent to supplier", who()]] };
  patchOrder(ref, () => updated);
  const message = `${ref} sent.`;
  showToast(message);
  return ok(updated, message);
}

/** The order view's "Mark as paid" (design `pvPay`). Stored on the order only (FR-018). */
export async function markPurchaseOrderPaid(ref: string): Promise<Result<PurchaseOrder>> {
  const o = getStore().getState().purchases.orders.find((x) => x.ref === ref);
  if (!o) return fail(`${ref} is not in the list.`);
  const updated: PurchaseOrder = { ...o, paid: true, activity: [...o.activity, [`Paid by ${o.method || "Cash"}`, o.term || "Cash on delivery"]] };
  patchOrder(ref, () => updated);
  const message = `${ref} marked as paid.`;
  showToast(message);
  return ok(updated, message);
}

// ---- Receiving -------------------------------------------------------------------------------

/**
 * "Receive {n} lines" (the design's receive drawer `save`): a Saved goods receipt, accepted
 * quantities into stock with Received movements, rejected quantities as Waiting rejected items,
 * and the order's received/status/activity. An unpaid order names the next Payables bill in the
 * message; no Payables record is kept (FR-018).
 */
export async function receiveGoods(ref: string, input: NewReceipt): Promise<Result<GoodsReceipt>> {
  const store = getStore();
  const state = store.getState();
  const order = state.purchases.orders.find((o) => o.ref === ref);
  if (!order) return fail(`${ref} is not in the list.`);
  const picked = input.lines
    .map((x) => ({ line: order.lines.find((l) => l.id === x.id), recv: n(x.recv), acc: n(x.acc) }))
    .filter((x): x is { line: PoLine; recv: number; acc: number } => !!x.line);
  const totRecv = picked.reduce((a, x) => a + x.recv, 0);
  if (!input.store || !input.date || picked.length === 0 || !totRecv) return fail("Choose the lines to receive.");
  if (picked.some((x) => x.acc > x.recv)) return fail("accepted cannot be more than received");
  if (picked.some((x) => x.recv > Math.max(0, x.line.qty - x.line.recv))) return fail("Received cannot be more than is still to come.");

  const by = who();
  const grnRef = nextRef(state.purchases.receipts.map((g) => g.ref), "GRN-", 4);
  const rejRefs = state.purchases.rejected.map((r) => r.ref);
  const gl: GrnLine[] = [];
  const changes: StockChange[] = [];
  const rejected: RejectedItem[] = [];
  let totAcc = 0;
  let value = 0;
  const recvBy = new Map<string, number>();
  for (const x of picked) {
    const acc = Math.min(x.acc, x.recv);
    const rej = x.recv - acc;
    totAcc += acc;
    value += acc * x.line.cost;
    gl.push({ key: x.line.key, unit: x.line.unit, ordered: x.line.qty, recv: x.recv, acc, rej, cost: x.line.cost });
    recvBy.set(x.line.id, (recvBy.get(x.line.id) ?? 0) + x.recv);
    const item = split(x.line.key);
    if (acc && item) changes.push({ product: item.product, variant: item.variant, store: input.store, change: acc, kind: KIND.received, ref: grnRef, by });
    if (rej) {
      const rejRef = nextRef(rejRefs, "REJ-", 4);
      rejRefs.push(rejRef);
      rejected.unshift({ ref: rejRef, grn: grnRef, supplier: order.supplier, item: x.line.key, qty: rej, reason: "Rejected on delivery", status: PILL.waiting });
    }
  }
  const lines = order.lines.map((l) => (recvBy.has(l.id) ? { ...l, recv: l.recv + (recvBy.get(l.id) ?? 0) } : l));
  const full = lines.every((l) => l.recv >= l.qty);
  const activity: [string, string][] = [...order.activity];
  if (!isAccepted(order)) activity.push(["Accepted", by]);
  activity.push(["Goods received", `${grnRef} · ${totAcc} accepted${totRecv - totAcc ? `, ${totRecv - totAcc} rejected` : ""}`]);

  let pyb: string | null = null;
  let pybNo = state.purchases.pybNo;
  if (!order.paid && value > 0) {
    const term = order.term || "Cash on delivery";
    const days = Number(term.match(/(\d+)\s*day/)?.[1]) || 0;
    const due = addDays(input.date || DEMO_TODAY, days);
    pybNo += 1;
    pyb = `PYB-${String(pybNo).padStart(4, "0")}`;
    activity.push(["Added to Payables", `${pyb} · KES ${Math.round(value).toLocaleString("en-US")} due ${fmtDate(due)}`]);
  }

  const receipt: GoodsReceipt = {
    ref: grnRef,
    po: order.ref,
    supplier: order.supplier,
    store: input.store,
    date: input.date,
    dn: input.dn,
    inv: input.inv,
    notes: input.notes,
    who: by,
    lines: gl,
    lineCount: picked.length,
    status: PILL.saved,
    returned: {},
    session: true,
  };
  const updated: PurchaseOrder = {
    ...order,
    lines,
    activity,
    received: full ? PILL.full : PILL.partial,
    status: full ? PILL.completed : PILL.accepted,
    grns: [...order.grns, grnRef],
  };
  store.setState((s) => {
    const base: AppState = changes.length ? { ...s, ...applyStockChanges(s, changes) } : s;
    return {
      stock: base.stock,
      purchases: {
        ...s.purchases,
        orders: s.purchases.orders.map((o) => (o.ref === ref ? updated : o)),
        receipts: [receipt, ...s.purchases.receipts],
        rejected: [...rejected, ...s.purchases.rejected],
        pybNo,
      },
    };
  });
  const message = `${grnRef} saved. ${totAcc} accepted into ${input.store}.${pyb ? ` ${pyb} added to Payables.` : ""}`;
  showToast(message);
  return ok(receipt, message);
}

// ---- Purchase returns ------------------------------------------------------------------------

function returnChanges(r: Pick<PurchaseReturn, "lines" | "store" | "ref">, by: string): StockChange[] {
  return r.lines.flatMap((l) => {
    const item = split(l.key);
    return item && l.qty ? [{ product: item.product, variant: item.variant, store: r.store, change: -l.qty, kind: RETURNED_TO_SUPPLIER, ref: r.ref, by }] : [];
  });
}

const stamp = () => `${fmtDate(DEMO_TODAY)}, ${demoTime()}`;

/** "Submit only" / "Submit and approve" on the purchase return form (design `finish`). */
export async function createPurchaseReturn(input: NewPurchaseReturn, approve: boolean): Promise<Result<PurchaseReturn>> {
  const store = getStore();
  const state = store.getState();
  const grn = state.purchases.receipts.find((g) => g.ref === input.grn);
  const chosen = input.lines.filter((l) => n(l.qty) > 0);
  if (!grn || !input.reason || chosen.length === 0) return fail("Choose a goods receipt above to load the items you can return.");
  const lines = chosen.map((c) => {
    const gl = grn.lines.find((l) => l.key === c.key);
    return { gl, qty: n(c.qty), max: gl ? Math.max(0, gl.acc - (grn.returned[gl.key] ?? 0)) : 0 };
  });
  if (lines.some((x) => !x.gl || x.qty > x.max)) return fail("Return quantities cannot be more than can be returned.");
  const ref = nextRef(state.purchases.returns.map((r) => r.ref), "PRT-", 4);
  const qty = lines.reduce((a, x) => a + x.qty, 0);
  const value = Math.round(lines.reduce((a, x) => a + x.qty * (x.gl?.cost ?? 0), 0));
  const by = who();
  const ret: PurchaseReturn = {
    ref,
    supplier: grn.supplier,
    po: grn.po,
    grn: grn.ref,
    reason: input.reason,
    notes: input.notes,
    lines: lines.map((x) => ({ key: x.gl!.key, unit: x.gl!.unit, qty: x.qty, cost: x.gl!.cost })),
    qty,
    value,
    status: approve ? PILL.approved : PILL.waitingApproval,
    store: grn.store,
    date: stamp(),
  };
  const changes = approve ? returnChanges(ret, by) : [];
  const short = changes.length ? findShortfall(state, changes) : null;
  if (short) return fail(shortfallMessage(short));
  const returned = { ...grn.returned };
  for (const l of ret.lines) returned[l.key] = (returned[l.key] ?? 0) + l.qty;
  store.setState((s) => {
    const base: AppState = changes.length ? { ...s, ...applyStockChanges(s, changes) } : s;
    return {
      stock: base.stock,
      purchases: {
        ...s.purchases,
        returns: [ret, ...s.purchases.returns],
        receipts: s.purchases.receipts.map((g) => (g.ref === grn.ref ? { ...g, returned } : g)),
        orders: s.purchases.orders.map((o) =>
          o.ref === grn.po ? { ...o, activity: [...o.activity, ["Returned to supplier", `${ref} · ${qty} items, ${input.reason}`] as [string, string]] } : o,
        ),
      },
    };
  });
  const message = `${ref}${approve ? " approved. Stock reduced." : " submitted for approval."}`;
  showToast(message);
  return ok(ret, message);
}

/**
 * Approve a waiting return: stock leaves the receipt's store (design `prtStock`). From the list's
 * row action the design says "{ref} approved."; from the return view "{ref} approved. Stock reduced.".
 */
export async function approvePurchaseReturn(ref: string, from: "list" | "view" = "view"): Promise<Result<PurchaseReturn>> {
  const store = getStore();
  const state = store.getState();
  const r = state.purchases.returns.find((x) => x.ref === ref);
  if (!r || r.status.label === "Approved") return fail(`${ref} is already approved.`);
  const changes = returnChanges(r, who());
  const short = changes.length ? findShortfall(state, changes) : null;
  if (short) return fail(shortfallMessage(short));
  const updated: PurchaseReturn = { ...r, status: PILL.approved, approvedAt: from === "view" ? stamp() : r.approvedAt };
  store.setState((s) => {
    const base: AppState = changes.length ? { ...s, ...applyStockChanges(s, changes) } : s;
    return { stock: base.stock, purchases: { ...s.purchases, returns: s.purchases.returns.map((x) => (x.ref === ref ? updated : x)) } };
  });
  const message = from === "view" ? `${ref} approved. Stock reduced.` : `${ref} approved.`;
  showToast(message);
  return ok(updated, message);
}

// ---- Rejected items --------------------------------------------------------------------------

const OUTCOME: Record<RejectedOutcome, { tone: Pill["tone"]; text: string }> = {
  "Sent back": { tone: "info", text: "marked as sent back." },
  Replaced: { tone: "success", text: "marked as replaced." },
  "Written off": { tone: "danger", text: "written off." },
};

/** "Mark sent back" / "Mark replaced" / "Write off" on a waiting rejected item. No stock effect. */
export async function markRejected(ref: string, outcome: RejectedOutcome): Promise<Result<RejectedItem>> {
  const store = getStore();
  const item = store.getState().purchases.rejected.find((r) => r.ref === ref);
  if (!item || item.status.label !== "Waiting") return fail(`${ref} has already been handled.`);
  const o = OUTCOME[outcome];
  const updated: RejectedItem = { ...item, status: { label: outcome, tone: o.tone } };
  store.setState((s) => ({ purchases: { ...s.purchases, rejected: s.purchases.rejected.map((r) => (r.ref === ref ? updated : r)) } }));
  const message = `${ref} ${o.text}`;
  showToast(message);
  return ok(updated, message);
}

// ---- Print and PDF (messages only) -----------------------------------------------------------

/** "Download PDF" / "PDF" on orders, receipts, returns and rejected items. */
export async function downloadPurchasePdf(ref: string): Promise<Result<void>> {
  const message = `Downloading ${ref}.pdf.`;
  showToast(message);
  return ok(undefined, message);
}

/** Goods receipt "Print" (design `gvPrint`). */
export async function printGoodsReceipt(ref: string): Promise<Result<void>> {
  const message = `Opening print for ${ref}.`;
  showToast(message);
  return ok(undefined, message);
}

/** "Print" on the purchase return and rejected item views. */
export async function printPurchaseRecord(ref: string): Promise<Result<void>> {
  const message = `${ref} sent to the printer.`;
  showToast(message);
  return ok(undefined, message);
}
