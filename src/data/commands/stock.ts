/**
 * Stock commands (FR-013–FR-016). Messages are the design's `showToast(...)` text
 * (design/canvas/Uzapoint ERP.dc.html: stSubmit, trFinish, trMarkReceived, trDoCancel, wSubmit,
 * wasteUndo, locSave). The design blocks invalid input by disabling the submit buttons, so the
 * guard messages below are defensive only and never shown by the stock screens.
 */
import { ROLES } from "@/config/roles";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { nextRef } from "@/lib/refs";
import {
  fail,
  ok,
  type GoodsReceipt,
  type NewStockIn,
  type NewStore,
  type NewTransfer,
  type NewWastage,
  type Pill,
  type Result,
  type Store,
  type Transfer,
  type Wastage,
} from "../types";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import { KIND, applyStockChanges, findShortfall, type StockChange } from "../store/stockOps";

const who = () => ROLES[getStore().getState().session.role].name;

/** Defensive guard text (not in the design, which disables the button instead). */
function shortfallMessage(s: { product: string; store: string; available: number }): string {
  return `Only ${s.available} ${s.product} left at ${s.store}.`;
}

/** Cost of one `unit` of a variant: the base unit uses the variant cost, extra units their own (design `unitsOf`). */
function unitCost(state: AppState, product: string, variant: string, unit: string): number {
  const p = state.catalog.products.find((x) => x.name === product);
  const v = p?.variants.find((x) => x.name === variant) ?? p?.variants[0];
  if (!v) return 0;
  if (!unit || unit === v.unit) return v.cost;
  return v.extraUnits.find((u) => u.unit === unit)?.cost ?? v.cost;
}

// ---- Stock in ---------------------------------------------------------------------------------

/** "Add to stock" (the "Skip Purchases and add to stock now" option is ticked). */
export async function addStock(input: NewStockIn): Promise<Result<string>> {
  const items = input.items.filter((i) => i.qty > 0);
  if (!input.store) return fail("Choose a store.");
  if (items.length === 0) return fail("No items added");
  const store = getStore();
  // The design logs the movement against the notes, or the supplier when there are none.
  const ref = input.notes?.trim() || input.supplier || nextRef(store.getState().stock.movements.map((m) => m.ref), "STK-", 4);
  const by = who();
  const changes: StockChange[] = items.map((i) => ({ product: i.product, variant: i.variant, store: input.store, change: i.qty, kind: KIND.received, ref, by }));
  store.setState((s) => applyStockChanges(s, changes));
  const message = `Stock added to ${input.store}.`;
  showToast(message);
  return ok(ref, message);
}

/** "Send to Purchases" (option not ticked). The goods receipt lands in Purchases, which is out of scope. */
/**
 * "Send to Purchases" (Stock in with "Skip Purchases" unticked): the design adds a Goods receipts
 * row [GRN-…, "—", supplier, store, line count, Waiting] and leaves stock unchanged (FR-015).
 */
export async function sendStockToPurchases(input: NewStockIn): Promise<Result<GoodsReceipt>> {
  const items = input.items.filter((i) => i.qty > 0);
  if (items.length === 0) return fail("No items added");
  const store = getStore();
  const receipts = store.getState().purchases.receipts;
  const receipt: GoodsReceipt = {
    ref: nextRef(receipts.map((g) => g.ref), "GRN-", 4),
    po: "—",
    supplier: input.supplier ?? "",
    store: input.store,
    date: DEMO_TODAY,
    dn: "",
    inv: "",
    notes: input.notes ?? "",
    who: ROLES[store.getState().session.role].name,
    lines: items.map((i) => ({ key: `${i.product} · ${i.variant}`, unit: i.unit, ordered: i.qty, recv: 0, acc: 0, rej: 0, cost: 0 })),
    lineCount: items.length,
    status: { label: "Waiting", tone: "warning" },
    returned: {},
  };
  store.setState((s) => ({ purchases: { ...s.purchases, receipts: [receipt, ...s.purchases.receipts] } }));
  const message = "Sent to Purchases.";
  showToast(message);
  return ok(receipt, message);
}

// ---- Transfers --------------------------------------------------------------------------------

export type TransferMode = "confirm" | "ship" | "shipAndReceive";

/** Not yet shipped: still editable and cancellable (design `trLocked` is false). */
export function isTransferOpen(status: Transfer["status"]): boolean {
  return status === "Not finished" || status === "Confirmed";
}

/**
 * Save a transfer with one of the three submit buttons (design `trFinish`). With `editRef`, an
 * open transfer is replaced in place and keeps its reference.
 */
export async function createTransfer(input: NewTransfer, mode: TransferMode, editRef?: string): Promise<Result<Transfer>> {
  const items = input.items.filter((i) => i.qty > 0);
  if (!input.from || !input.to) return fail("Choose where the stock comes from and where it goes.");
  if (input.from === input.to) return fail("Choose two different stores.");
  if (items.length === 0) return fail("No items added");
  const store = getStore();
  const state = store.getState();
  const existing = editRef ? state.stock.transfers.find((t) => t.ref === editRef) : undefined;
  if (editRef && (!existing || !isTransferOpen(existing.status))) return fail("That transfer can no longer be changed.");
  const ref = existing?.ref ?? nextRef(state.stock.transfers.map((t) => t.ref), "TRF-", 4);
  const by = who();
  const out: StockChange[] = items.map((i) => ({ product: i.product, variant: i.variant, store: input.from, change: -i.qty, kind: KIND.movedOut, ref, by }));
  const inn: StockChange[] = items.map((i) => ({ product: i.product, variant: i.variant, store: input.to, change: i.qty, kind: KIND.movedIn, ref, by }));
  // The design blocks every submit button while a quantity is more than the source store holds.
  const short = findShortfall(state, out);
  if (short) return fail(shortfallMessage(short));
  const status: Transfer["status"] = mode === "confirm" ? "Confirmed" : mode === "ship" ? "In transit" : "Received";
  const transfer: Transfer = { ref, from: input.from, to: input.to, date: input.date || DEMO_TODAY, notes: input.notes.trim(), items, status };
  store.setState((s) => {
    const transfers = existing ? s.stock.transfers.map((t) => (t.ref === ref ? transfer : t)) : [transfer, ...s.stock.transfers];
    let next: Pick<AppState, "stock"> = { stock: { ...s.stock, transfers } };
    if (mode !== "confirm") next = applyStockChanges({ ...s, ...next }, out);
    if (mode === "shipAndReceive") next = applyStockChanges({ ...s, ...next }, inn);
    return next;
  });
  const message = mode === "shipAndReceive" ? `Transfer received at ${input.to}.` : mode === "ship" ? `Transfer on its way to ${input.to}.` : "Transfer confirmed.";
  showToast(message);
  return ok(transfer, message);
}

/** Ship an open transfer (stock leaves `from`). Not reachable from the design's screens. */
export async function shipTransfer(ref: string): Promise<Result<Transfer>> {
  const store = getStore();
  const state = store.getState();
  const t = state.stock.transfers.find((x) => x.ref === ref);
  if (!t || !isTransferOpen(t.status)) return fail("That transfer cannot be shipped.");
  const by = who();
  const out: StockChange[] = t.items.map((i) => ({ product: i.product, variant: i.variant, store: t.from, change: -i.qty, kind: KIND.movedOut, ref, by }));
  const short = findShortfall(state, out);
  if (short) return fail(shortfallMessage(short));
  const updated: Transfer = { ...t, status: "In transit" };
  store.setState((s) => {
    const applied = applyStockChanges(s, out);
    return { stock: { ...applied.stock, transfers: s.stock.transfers.map((x) => (x.ref === ref ? updated : x)) } };
  });
  const message = `Transfer on its way to ${t.to}.`;
  showToast(message);
  return ok(updated, message);
}

/** "Mark as received" on an In transit transfer: stock arrives at `to` (design `trMarkReceived`). */
export async function receiveTransfer(ref: string): Promise<Result<Transfer>> {
  const store = getStore();
  const state = store.getState();
  const t = state.stock.transfers.find((x) => x.ref === ref);
  if (!t || (t.status !== "In transit" && !isTransferOpen(t.status))) return fail("That transfer cannot be received.");
  const by = who();
  const changes: StockChange[] = [];
  if (isTransferOpen(t.status)) {
    changes.push(...t.items.map((i) => ({ product: i.product, variant: i.variant, store: t.from, change: -i.qty, kind: KIND.movedOut, ref, by })));
    const short = findShortfall(state, changes);
    if (short) return fail(shortfallMessage(short));
  }
  changes.push(...t.items.map((i) => ({ product: i.product, variant: i.variant, store: t.to, change: i.qty, kind: KIND.movedIn, ref, by })));
  const updated: Transfer = { ...t, status: "Received" };
  store.setState((s) => {
    const applied = applyStockChanges(s, changes);
    return { stock: { ...applied.stock, transfers: s.stock.transfers.map((x) => (x.ref === ref ? updated : x)) } };
  });
  const message = `Transfer received at ${t.to}.`;
  showToast(message);
  return ok(updated, message);
}

/** Cancel an open transfer. No stock has moved, so levels stay the same (design `trDoCancel`). */
export async function cancelTransfer(ref: string): Promise<Result<Transfer>> {
  const store = getStore();
  const t = store.getState().stock.transfers.find((x) => x.ref === ref);
  if (!t || !isTransferOpen(t.status)) return fail("Only a transfer that has not shipped can be cancelled.");
  const updated: Transfer = { ...t, status: "Cancelled" };
  store.setState((s) => ({ stock: { ...s.stock, transfers: s.stock.transfers.map((x) => (x.ref === ref ? updated : x)) } }));
  const message = `Transfer ${ref} cancelled.`;
  showToast(message);
  return ok(updated, message);
}

// ---- Wastage ----------------------------------------------------------------------------------

/**
 * Record wastage (design `wSubmit`): one list entry per item, each with its own WST reference and
 * value (qty × the unit's cost). Movements use the notes as their reference when given.
 * Returns the first entry created.
 */
export async function recordWastage(input: NewWastage): Promise<Result<Wastage>> {
  const items = input.items.filter((i) => i.qty > 0);
  if (!input.location) return fail("Choose a location, then add the products to write off.");
  if (items.length === 0) return fail("No items added");
  const store = getStore();
  const state = store.getState();
  const by = who();
  const notes = input.notes.trim();
  const refs: string[] = state.stock.wastage.map((w) => w.ref);
  const entries: Wastage[] = [];
  const changes: StockChange[] = [];
  for (const i of items) {
    const ref = nextRef(refs, "WST-", 4);
    refs.push(ref);
    entries.push({
      ref,
      location: input.location,
      date: DEMO_TODAY,
      notes,
      items: [i],
      value: Math.round(i.qty * unitCost(state, i.product, i.variant, i.unit)),
      session: true,
    });
    changes.push({ product: i.product, variant: i.variant, store: input.location, change: -i.qty, kind: KIND.damaged, ref: notes || ref, by });
  }
  const short = findShortfall(state, changes);
  if (short) return fail(shortfallMessage(short));
  store.setState((s) => {
    const applied = applyStockChanges(s, changes);
    return { stock: { ...applied.stock, wastage: [...entries.slice().reverse(), ...s.stock.wastage] } };
  });
  const message = `Wastage recorded at ${input.location}.`;
  showToast(message);
  return ok(entries[0]!, message);
}

const WASTAGE_UNDONE: Pill = { label: "Wastage undone", tone: "neutral" };

/** Row action "Undo" (design `wasteUndo`): removes the entry and, for one recorded this session, returns its stock. */
export async function undoWastage(ref: string): Promise<Result<void>> {
  const store = getStore();
  const w = store.getState().stock.wastage.find((x) => x.ref === ref);
  if (!w) return fail("That wastage entry is no longer listed.");
  const by = who();
  const changes: StockChange[] = w.session ? w.items.map((i) => ({ product: i.product, variant: i.variant, store: w.location, change: i.qty, kind: WASTAGE_UNDONE, ref, by })) : [];
  store.setState((s) => {
    const base = changes.length ? applyStockChanges(s, changes).stock : s.stock;
    return { stock: { ...base, wastage: s.stock.wastage.filter((x) => x.ref !== ref) } };
  });
  const message = `${ref} undone. Stock returned.`;
  showToast(message);
  return ok(undefined, message);
}

/** Row action "Delete" (owner only): removes the entry without touching stock. The design shows no toast. */
export async function deleteWastage(ref: string): Promise<Result<void>> {
  getStore().setState((s) => ({ stock: { ...s.stock, wastage: s.stock.wastage.filter((x) => x.ref !== ref) } }));
  return ok(undefined, "");
}

export function addWasteReason(name: string): string {
  const reason = name.trim();
  if (reason) getStore().setState((s) => ({ catalog: { ...s.catalog, extraWasteReasons: [...s.catalog.extraWasteReasons, reason] } }));
  return reason;
}

// ---- Warehouses -------------------------------------------------------------------------------

/** "New {store}" from a store picker (design `newStore`): adds it silently with branch "—" and type Store. */
export function addStoreQuick(name: string): string {
  const n = name.trim();
  if (!n) return n;
  const store = getStore();
  if (!store.getState().stock.stores.some((s) => s.name.toLowerCase() === n.toLowerCase())) {
    store.setState((s) => ({ stock: { ...s.stock, stores: [...s.stock.stores, { name: n, branch: "—", type: "Store" }] } }));
  }
  return n;
}

/** Warehouse form Save (design `locSave`). Renaming carries the store's levels and movements over. */
export async function saveStore(input: NewStore, editName?: string): Promise<Result<Store>> {
  const name = input.name.trim();
  if (!name || !input.branch || !input.type) return fail("Enter a name, branch and type.");
  const store = getStore();
  const list = store.getState().stock.stores;
  if (list.some((s) => s.name.toLowerCase() === name.toLowerCase() && s.name !== editName)) {
    const message = `${name} is already in the list.`;
    showToast(message);
    return fail(message);
  }
  const saved: Store = { name, branch: input.branch, type: input.type };
  store.setState((s) => {
    if (!editName) return { stock: { ...s.stock, stores: [...s.stock.stores, saved] } };
    const rename = (v: string) => (v === editName ? name : v);
    return {
      stock: {
        ...s.stock,
        stores: s.stock.stores.map((x) => (x.name === editName ? saved : x)),
        levels: name === editName ? s.stock.levels : s.stock.levels.map((l) => ({ ...l, store: rename(l.store) })),
        movements: name === editName ? s.stock.movements : s.stock.movements.map((m) => ({ ...m, store: rename(m.store) })),
      },
    };
  });
  const message = editName ? "Changes saved." : `${name} added.`;
  showToast(message);
  return ok(saved, message);
}

/** Row action "Delete" (owner only, disabled while the store holds stock). */
export async function deleteStore(name: string): Promise<Result<void>> {
  const store = getStore();
  const held = store.getState().stock.levels.some((l) => l.store === name && l.quantity > 0);
  if (held) return fail("Move its stock to another store first.");
  store.setState((s) => ({ stock: { ...s.stock, stores: s.stock.stores.filter((x) => x.name !== name) } }));
  const message = `${name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}
