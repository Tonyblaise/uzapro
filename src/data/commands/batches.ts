/** Batch and expiry commands (feature 016, contracts/data-access.md). */
import { isExpired, validateBatch, type BatchInput } from "../batches";
import { getStore, showToast } from "../store";
import { fail, ok, type Result, type StockBatch } from "../types";
import { baseUnitOf } from "../units";
import { recordWastage } from "./stock";

const refuse = <T = never>(message: string): Result<T> => {
  showToast(message);
  return fail(message);
};

/** Put stock that is on hand, and not yet in a batch, into a batch with an expiry date. */
export async function recordBatch(input: BatchInput): Promise<Result<StockBatch>> {
  const store = getStore();
  const s = store.getState();
  const level = s.stock.levels.find((l) => l.product === input.product && l.store === input.store)?.quantity;
  const err = validateBatch(input, s.stock.batches, level);
  if (err) return fail(err);
  const n = s.stock.batches.reduce((m, b) => Math.max(m, Number(b.id.replace(/\D/g, "")) || 0), 0) + 1;
  const batch: StockBatch = { id: `b-${n}`, product: input.product, store: input.store, batch: input.batch.trim(), expiry: input.expiry, qty: input.qty };
  store.setState((st) => ({ stock: { ...st.stock, batches: [...st.stock.batches, batch] } }));
  const message = `Batch ${batch.batch} recorded.`;
  showToast(message);
  return ok(batch, message);
}

/** Delete the batch record. Stock on hand does not change; the stock is no longer in a batch. */
export async function removeBatch(id: string): Promise<Result<void>> {
  const store = getStore();
  const cur = store.getState().stock.batches.find((b) => b.id === id);
  if (!cur) return fail("That batch is not in the list.");
  store.setState((s) => ({ stock: { ...s.stock, batches: s.stock.batches.filter((b) => b.id !== id) } }));
  const message = `Batch ${cur.batch} removed.`;
  showToast(message);
  return ok(undefined, message);
}

/** Record an expired batch as wastage (reason "Expired"); exactly that batch leaves stock. */
export async function writeOffBatch(id: string): Promise<Result<void>> {
  const s = getStore().getState();
  const cur = s.stock.batches.find((b) => b.id === id);
  if (!cur) return fail("That batch is not in the list.");
  if (!isExpired(cur)) return refuse(`Batch ${cur.batch} has not expired.`);
  const variant = s.catalog.products.find((p) => p.name === cur.product)?.variants[0];
  const r = await recordWastage({
    location: cur.store,
    notes: `Batch ${cur.batch} expired`,
    items: [{ product: cur.product, variant: variant?.name ?? "", qty: cur.qty, unit: variant ? baseUnitOf(variant) : "Piece", reason: "Expired", batchId: cur.id }],
  });
  if (!r.ok) return refuse(r.message);
  const message = `Batch ${cur.batch} written off.`;
  showToast(message);
  return ok(undefined, message);
}
