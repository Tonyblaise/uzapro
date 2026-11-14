/** Sales order, dispatch and delivery commands (feature 013, contracts/data-access.md). */
import { DEMO_TODAY, addDays, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { nextRef } from "@/lib/refs";
import { myApprovals } from "../approvals";
import { creditGate, positionOf } from "../creditGate";
import { termDays } from "../credit";
import { WALK_IN } from "../fixtures/customers";
import { canDispatch, canEditOrder, canInvoice, checkDispatch, checkReturn, itemName, orderTotals, toInvoice } from "../orders";
import { currentUserName } from "../profile";
import { getStore, showToast } from "../store";
import { KIND, applyStockChanges, findShortfall, type StockChange } from "../store/stockOps";
import { fail, ok, type DeliveryNote, type DeliveryReturn, type Invoice, type NewDispatch, type NewOrder, type OrderLine, type Result, type SalesOrder } from "../types";
import { createInvoice } from "./sales";

const refuse = <T = never>(message: string): Result<T> => {
  showToast(message);
  return fail(message);
};

function checkOrder(input: NewOrder): string | null {
  if (!input.customer || input.customer === WALK_IN) return "Pick the customer first. Walk-in customers can't place orders.";
  if (!input.date) return "Pick the order date.";
  if (!input.deliverBy) return "Pick the deliver-by date.";
  if (!input.store) return "Pick the store to dispatch from.";
  if (input.lines.length === 0 || input.lines.some((l) => !(l.qty > 0))) return "No items added yet.";
  return null;
}

const cleanLines = (input: NewOrder): OrderLine[] => input.lines.map((l) => ({ product: l.product, variant: l.variant, unit: l.unit, qty: l.qty, rate: l.rate, taxable: l.taxable, dispatched: 0, invoiced: 0 }));

/** A new order: no stock moves and nothing is owed yet. The credit check runs here (research R4). */
export async function createOrder(input: NewOrder): Promise<Result<SalesOrder>> {
  const err = checkOrder(input);
  if (err) return refuse(err);
  const store = getStore();
  const state = store.getState();
  const lines = cleanLines(input);
  const amount = orderTotals(lines).total;
  const gate = creditGate(state, input.customer, amount, input.approval);
  if (!gate.ok) {
    showToast(gate.message);
    return fail(gate.message, gate.stop);
  }
  const order: SalesOrder = {
    number: nextRef(state.sales.orders.map((o) => o.number), "SO-", 4),
    customer: input.customer,
    date: input.date,
    deliverBy: input.deliverBy,
    store: input.store,
    lines,
    notes: input.notes.trim(),
    amount,
    by: currentUserName(state),
    cancelled: false,
    invoices: [],
    ...(gate.approval ? { creditApproval: gate.approval } : {}),
  };
  store.setState((s) => ({
    sales: {
      ...s.sales,
      orders: [order, ...s.sales.orders],
      // Feature 019: an order converted from a quotation is recorded on the quotation.
      quotations: input.convertedFrom ? s.sales.quotations.map((q) => (q.number === input.convertedFrom ? { ...q, convertedTo: order.number } : q)) : s.sales.quotations,
    },
  }));
  const message = `${order.number} saved.`;
  showToast(message);
  return ok(order, message);
}

/** Edit an order while nothing has been dispatched. */
export async function updateOrder(number: string, input: NewOrder): Promise<Result<SalesOrder>> {
  const err = checkOrder(input);
  if (err) return refuse(err);
  const store = getStore();
  const cur = store.getState().sales.orders.find((o) => o.number === number);
  if (!cur) return fail("That order is not in the list.");
  if (!canEditOrder(cur)) return refuse(`${number} can't be changed after goods are dispatched.`);
  const lines = cleanLines(input);
  const next: SalesOrder = { ...cur, customer: input.customer, date: input.date, deliverBy: input.deliverBy, store: input.store, lines, notes: input.notes.trim(), amount: orderTotals(lines).total };
  store.setState((s) => ({ sales: { ...s.sales, orders: s.sales.orders.map((o) => (o.number === number ? next : o)) } }));
  const message = `${number} saved.`;
  showToast(message);
  return ok(next, message);
}

export async function cancelOrder(number: string): Promise<Result<void>> {
  const store = getStore();
  const cur = store.getState().sales.orders.find((o) => o.number === number);
  if (!cur) return fail("That order is not in the list.");
  if (!canEditOrder(cur)) return refuse(`${number} can't be cancelled after goods are dispatched.`);
  store.setState((s) => ({ sales: { ...s.sales, orders: s.sales.orders.map((o) => (o.number === number ? { ...o, cancelled: true } : o)) } }));
  const message = `${number} cancelled.`;
  showToast(message);
  return ok(undefined, message);
}

/** Send goods against an order: a delivery note is created and stock leaves the order's store. */
export async function dispatchOrder(input: NewDispatch): Promise<Result<DeliveryNote>> {
  const store = getStore();
  const state = store.getState();
  // Feature 018: dispatching needs its own right, not Write on Sales.
  if (!myApprovals(state).dispatch) return refuse("Your role can't dispatch sales orders.");
  const order = state.sales.orders.find((o) => o.number === input.order);
  if (!order) return fail("That order is not in the list.");
  const err = checkDispatch(order, input.qty, input.driver, input.vehicle);
  if (err) return fail(err);
  const by = currentUserName(state);
  const number = nextRef(state.sales.deliveries.map((d) => d.number), "DN-", 4);
  const sent = order.lines.map((l, i) => ({ l, q: input.qty[i] ?? 0 })).filter((x) => x.q > 0);
  const changes: StockChange[] = sent.map(({ l, q }) => ({ product: l.product, variant: l.variant, store: order.store, change: -q, kind: KIND.sold, ref: number, by, unit: l.unit }));
  const short = findShortfall(state, changes);
  if (short) return refuse(`Only ${short.available} ${short.product} left at ${short.store}.`);
  const note: DeliveryNote = {
    number,
    order: order.number,
    customer: order.customer,
    store: order.store,
    date: DEMO_TODAY,
    lines: sent.map(({ l, q }) => ({ product: l.product, variant: l.variant, unit: l.unit, qty: q })),
    driver: input.driver.trim(),
    vehicle: input.vehicle.trim(),
    notes: input.notes.trim(),
    delivered: false,
    by,
    returns: [],
  };
  store.setState((s) => ({
    ...applyStockChanges(s, changes),
    sales: {
      ...s.sales,
      deliveries: [note, ...s.sales.deliveries],
      orders: s.sales.orders.map((o) => (o.number === order.number ? { ...o, lines: o.lines.map((l, i) => ({ ...l, dispatched: l.dispatched + (input.qty[i] ?? 0) })) } : o)),
    },
  }));
  const items = sent.reduce((a, x) => a + x.q, 0);
  const message = `${number} created. ${items} ${items === 1 ? "item" : "items"} left ${order.store}.`;
  showToast(message);
  return ok(note, message);
}

/** Proof of delivery: who received the goods, with the date and time. */
export async function markDelivered(number: string, receivedBy: string): Promise<Result<void>> {
  const store = getStore();
  if (!myApprovals(store.getState()).dispatch) return refuse("Your role can't dispatch sales orders.");
  const cur = store.getState().sales.deliveries.find((d) => d.number === number);
  if (!cur) return fail("That delivery note is not in the list.");
  if (cur.delivered) return refuse(`${number} is already delivered.`);
  if (!receivedBy.trim()) return fail("Enter who received the goods");
  const deliveredAt = `${fmtDate(DEMO_TODAY)}, ${demoTime()}`;
  store.setState((s) => ({ sales: { ...s.sales, deliveries: s.sales.deliveries.map((d) => (d.number === number ? { ...d, delivered: true, receivedBy: receivedBy.trim(), deliveredAt } : d)) } }));
  const message = `${number} marked delivered.`;
  showToast(message);
  return ok(undefined, message);
}

/** Invoice the dispatched quantities that are not yet invoiced. No stock moves (research R3). */
export async function invoiceOrder(number: string): Promise<Result<Invoice>> {
  const store = getStore();
  const state = store.getState();
  const order = state.sales.orders.find((o) => o.number === number);
  if (!order) return fail("That order is not in the list.");
  if (!canInvoice(order)) return refuse(`Nothing on ${number} is waiting to be invoiced.`);
  const position = positionOf(state.customers, state.money.receivables, state.sales.orders, order.customer);
  const days = position && position.terms !== "Cash" ? termDays(position.terms) : 30;
  const r = await createInvoice(
    {
      kind: "invoice",
      customer: order.customer,
      date: DEMO_TODAY,
      due: addDays(DEMO_TODAY, days),
      store: order.store,
      lines: order.lines.filter((l) => toInvoice(l) > 0).map((l) => ({ description: itemName(l), qty: toInvoice(l), unit: l.unit, rate: l.rate, taxable: l.taxable })),
      discount: { value: 0, type: "KES" },
      notes: `Sales order ${number}`,
      terms: "",
      approve: true,
    },
    { fromOrder: number },
  );
  if (!r.ok) return r;
  store.setState((s) => ({
    sales: { ...s.sales, orders: s.sales.orders.map((o) => (o.number === number ? { ...o, invoices: [...o.invoices, r.value.number], lines: o.lines.map((l) => ({ ...l, invoiced: l.dispatched })) } : o)) },
  }));
  return r;
}

/**
 * Goods that came back from a delivery (feature 019): stock returns to the note's store and the
 * order line is "left to dispatch" again. Only goods that are not yet invoiced can come back here.
 */
export async function returnDelivery(input: { note: string; qty: number[]; reason: string }): Promise<Result<DeliveryReturn>> {
  const store = getStore();
  const state = store.getState();
  if (!myApprovals(state).dispatch) return refuse("Your role can't dispatch sales orders.");
  const note = state.sales.deliveries.find((d) => d.number === input.note);
  if (!note) return fail("That delivery note is not in the list.");
  const order = state.sales.orders.find((o) => o.number === note.order);
  const err = checkReturn(note, order, input.qty, input.reason);
  if (err) return fail(err);
  const by = currentUserName(state);
  const ref = nextRef(state.sales.deliveries.flatMap((d) => d.returns.map((r) => r.ref)), "RTN-", 4);
  const back = note.lines.map((l, i) => ({ l, q: input.qty[i] ?? 0 })).filter((x) => x.q > 0);
  const ret: DeliveryReturn = { ref, date: DEMO_TODAY, by, reason: input.reason, lines: back.map(({ l, q }) => ({ product: l.product, variant: l.variant, unit: l.unit, qty: q })) };
  const changes: StockChange[] = back.map(({ l, q }) => ({ product: l.product, variant: l.variant, store: note.store, change: q, kind: KIND.returned, ref, by, unit: l.unit }));
  // Each returned quantity comes off the first matching order line(s), never below what is invoiced.
  const left = new Map(back.map(({ l, q }) => [`${l.product}|${l.variant}|${l.unit}`, q]));
  const relined = (lines: OrderLine[]): OrderLine[] =>
    lines.map((ol) => {
      const key = `${ol.product}|${ol.variant}|${ol.unit}`;
      const take = Math.min(left.get(key) ?? 0, toInvoice(ol));
      if (take <= 0) return ol;
      left.set(key, (left.get(key) ?? 0) - take);
      return { ...ol, dispatched: ol.dispatched - take };
    });
  const orders = state.sales.orders.map((o) => (o.number === note.order ? { ...o, lines: relined(o.lines) } : o));
  store.setState((s) => ({
    ...applyStockChanges(s, changes),
    sales: {
      ...s.sales,
      deliveries: s.sales.deliveries.map((d) => (d.number === note.number ? { ...d, returns: [...d.returns, ret] } : d)),
      orders,
    },
  }));
  const items = back.reduce((a, x) => a + x.q, 0);
  const message = `${ref} recorded. ${items} ${items === 1 ? "item" : "items"} back at ${note.store}.`;
  showToast(message);
  return ok(ret, message);
}

export { canDispatch, canEditOrder, canInvoice };
