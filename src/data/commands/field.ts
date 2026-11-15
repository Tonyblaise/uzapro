/**
 * Field sales and their deliveries (feature 024, design `fieldVals`). Messages copied from the
 * design's script. A field sale is saved without moving stock: the goods leave the store when the
 * delivery is dispatched, and come back if it can't be delivered or is cancelled while out.
 */
import { currentUserName } from "../profile";
import { DEMO_TODAY, addDays, demoTime } from "@/lib/demo-clock";
import { date as fmtDate, kes } from "@/lib/format";
import { nextRef } from "@/lib/refs";
import { WALK_IN } from "../fixtures/customers";
import { fail, ok, type FieldDelivery, type FieldSale, type NewDelivery, type NewFieldRep, type NewFieldSale, type Pill, type Result, type Sale } from "../types";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import { creditGate } from "../creditGate";
import { post } from "../ledger";
import { addReceivable, closeReceivableFor } from "./money";
import { applyStockChanges, type StockChange } from "../store/stockOps";

/** How the money arrives, by method (design `fieldPost`). */
export const FIELD_ACCOUNT: Record<string, string> = { Cash: "Cash drawer", "M-Pesa": "M-Pesa Till", "Bank transfer": "Equity Bank — Main" };
export const FIELD_PAY_METHODS = ["M-Pesa", "Cash", "Bank transfer"] as const;

const DELIVERY_OUT: Pill = { label: "Delivery", tone: "info" };
const DELIVERY_BACK: Pill = { label: "Returned", tone: "neutral" };
const VAT_RATE = 0.16;

const who = () => currentUserName(getStore().getState());
/** "10 Nov 2026, 14:05" */
const stamp = () => `${fmtDate(DEMO_TODAY)}, ${demoTime()}`;
const round2 = (n: number) => Math.round(n * 100) / 100;

export const fieldTotal = (x: Pick<FieldSale, "lines">) => round2(x.lines.reduce((a, l) => a + l.price * l.qty, 0));
/** Prices include VAT (design: "VAT 16% (included)"). */
export const fieldVat = (total: number) => round2((total * VAT_RATE) / (1 + VAT_RATE));

/** Whether a delivery is still to go out or on its way (Deliveries › To deliver). */
export const deliveryOpen = (d: Pick<FieldDelivery, "status">) => d.status === "Pending" || d.status === "Rescheduled" || d.status === "Out for delivery";

const findSale = (s: AppState, ref: string) => s.field.sales.find((x) => x.ref === ref || x.delivery.ref === ref);

/** Replace one field sale (and optionally its Sales row) in the store. */
function save(s: AppState, x: FieldSale, saleStatus?: Pill, payment?: Sale["payments"][number]): Partial<AppState> {
  return {
    field: { ...s.field, sales: s.field.sales.map((y) => (y.ref === x.ref ? x : y)) },
    ...(saleStatus || payment
      ? {
          sales: {
            ...s.sales,
            sales: s.sales.sales.map((r) => (r.ref === x.ref ? { ...r, ...(saleStatus ? { status: saleStatus } : {}), ...(payment ? { payments: [...r.payments, payment] } : {}) } : r)),
          },
        }
      : {}),
  };
}

/** Stock out (sign -1) or back (+1) for every line, from the sale's store, logged against the delivery. */
function stockFor(x: FieldSale, sign: 1 | -1, by: string): StockChange[] {
  return x.lines.map((l) => ({ product: l.product, variant: l.variant, store: x.store, change: sign * l.qty, kind: sign < 0 ? DELIVERY_OUT : DELIVERY_BACK, ref: x.delivery.ref, by }));
}

function postMoney(s: AppState, method: string, ref: string, amount: number, desc: string): AppState {
  const account = FIELD_ACCOUNT[method];
  return account ? post(s, { date: DEMO_TODAY, account, ref, desc, kind: "Sale", amt: amount }) : s;
}

/** "New field sale" › "Save and send to deliveries". */
export async function createFieldSale(input: NewFieldSale): Promise<Result<FieldSale>> {
  const walk = !input.customer || input.customer === WALK_IN;
  if (!input.customer) return fail("Pick the customer.");
  if (!input.rep) return fail("Pick the sales rep who took the order.");
  if (!input.lines.length) return fail("Add at least one item.");
  if (!input.location.trim()) return fail("Add where to deliver it.");
  if (input.pay === "credit" && walk) return fail("Pick a named customer to sell on credit.");
  if (!input.date) return fail("Pick the delivery date.");
  if (input.pay === "now" && !FIELD_ACCOUNT[input.method]) return fail("Pick how the customer paid.");

  const store = getStore();
  const state = store.getState();
  const total = fieldTotal(input);
  // Feature 012: a credit sale goes through the customer's credit limit and terms.
  const gate = creditGate(state, input.customer, input.pay === "credit" ? total : 0);
  if (!gate.ok) return fail(gate.message);

  const by = who();
  const at = stamp();
  const route = input.route.trim();
  const ref = nextRef(state.field.sales.map((x) => x.ref), "FS-", 4);
  const dlvRef = nextRef(state.field.sales.map((x) => x.delivery.ref), "DLV-", 4);
  const x: FieldSale = {
    ref,
    date: DEMO_TODAY,
    time: at.slice(-5),
    rep: input.rep,
    route,
    customer: input.customer,
    phone: input.phone.trim() || "—",
    location: input.location.trim(),
    store: input.store,
    lines: input.lines.map((l) => ({ ...l })),
    pay: { mode: input.pay, method: input.pay === "now" ? input.method : "", ref: input.pay === "now" ? input.ref.trim() || "—" : "" },
    delivery: {
      ref: dlvRef,
      date: input.date,
      driver: input.driver || input.rep,
      status: "Pending",
      note: input.note.trim(),
      history: [{ when: at, what: `Order taken by ${input.rep}${route ? ` on ${route}` : ""}`, who: by }],
    },
  };
  const vat = fieldVat(total);
  const products = state.catalog.products;
  const sale: Sale = {
    ref,
    customer: x.customer,
    type: "Field sale",
    channel: "Field",
    store: x.store,
    date: DEMO_TODAY,
    time: x.time,
    lines: x.lines.map((l) => ({ product: l.product, variant: l.variant, unit: products.find((p) => p.name === l.product)?.variants.find((v) => v.name === l.variant)?.unit || "Piece", qty: l.qty, price: l.price, taxable: true })),
    payments: input.pay === "now" ? [{ method: x.pay.method, ref: x.pay.ref, date: at, amount: total }] : [],
    subtotal: round2(total - vat),
    vat,
    total,
    status: input.pay === "now" ? { label: "Paid", tone: "success" } : input.pay === "credit" ? { label: "Unpaid", tone: "warning" } : { label: "Awaiting delivery", tone: "info" },
    by,
    session: true,
  };
  store.setState((s) => {
    let next: AppState = { ...s, field: { ...s.field, sales: [x, ...s.field.sales] }, sales: { ...s.sales, sales: [sale, ...s.sales.sales] } };
    if (input.pay === "now") next = postMoney(next, x.pay.method, ref, total, `Field sale by ${x.rep}`);
    if (input.pay === "credit") next = { ...next, money: addReceivable(next, { party: x.customer, type: "Sale on credit", doc: ref, due: addDays(DEMO_TODAY, gate.days), total }).money };
    return next;
  });
  const message = `${ref} saved. Delivery ${dlvRef} is waiting in Field sales › Deliveries.`;
  showToast(message);
  return ok(x, message);
}

/** "Send it out": the goods leave the store with the driver. */
export async function dispatchFieldDelivery(ref: string, driver: string): Promise<Result<void>> {
  const store = getStore();
  const x = findSale(store.getState(), ref);
  if (!x) return fail("That delivery is not in the list.");
  if (x.delivery.status !== "Pending" && x.delivery.status !== "Rescheduled") return fail(`${x.delivery.ref} is not waiting to go out.`);
  if (!driver) return fail("Pick the driver.");
  const by = who();
  const at = stamp();
  const next: FieldSale = {
    ...x,
    delivery: { ...x.delivery, driver, status: "Out for delivery", outAt: at, history: [...x.delivery.history, { when: at, what: `Dispatched with ${driver}`, who: by }] },
  };
  store.setState((s) => ({ ...applyStockChanges(s, stockFor(x, -1, by)), ...save(s, next) }));
  const message = `${x.delivery.ref} is out for delivery.`;
  showToast(message);
  return ok(undefined, message);
}

/** "Confirm delivery": who received it and, for pay on delivery, how the money was collected. */
export async function deliverField(ref: string, input: { receivedBy: string; method: string; payRef: string; note: string }): Promise<Result<void>> {
  const store = getStore();
  const x = findSale(store.getState(), ref);
  if (!x) return fail("That delivery is not in the list.");
  if (x.delivery.status !== "Out for delivery") return fail(`${x.delivery.ref} is not out for delivery.`);
  const receivedBy = input.receivedBy.trim();
  if (!receivedBy) return fail("Add the name of the person who received it.");
  const collect = x.pay.mode === "delivery";
  if (collect && !FIELD_ACCOUNT[input.method]) return fail("Pick how the customer paid.");
  if (collect && input.method === "M-Pesa" && !input.payRef.trim()) return fail("Add the M-Pesa code for the payment.");
  const total = fieldTotal(x);
  const by = who();
  const at = stamp();
  const note = input.note.trim();
  const collected = collect ? { method: input.method, ref: input.payRef.trim() || "—", amount: total } : undefined;
  const next: FieldSale = {
    ...x,
    delivery: {
      ...x.delivery,
      status: "Delivered",
      doneAt: at,
      receivedBy,
      ...(collected ? { collected } : {}),
      history: [...x.delivery.history, { when: at, what: `Delivered, received by ${receivedBy}${note ? `. Note: ${note}` : ""}${collected ? `. Collected ${kes(total)} by ${collected.method}` : ""}`, who: by }],
    },
  };
  store.setState((s) => {
    const paid = collected ? { method: collected.method, ref: collected.ref, date: at, amount: total } : undefined;
    let st: AppState = { ...s, ...save(s, next, collected ? { label: "Paid", tone: "success" } : undefined, paid) };
    if (collected) st = postMoney(st, collected.method, x.ref, total, `Delivery ${x.delivery.ref} collected`);
    return st;
  });
  const message = `${x.delivery.ref} delivered.`;
  showToast(message);
  return ok(undefined, message);
}

/** "Couldn't deliver": the goods come back and the delivery moves to a new date. */
export async function rescheduleField(ref: string, reason: string, newDate: string): Promise<Result<void>> {
  const store = getStore();
  const x = findSale(store.getState(), ref);
  if (!x) return fail("That delivery is not in the list.");
  if (!deliveryOpen(x.delivery)) return fail(`${x.delivery.ref} is already ${x.delivery.status.toLowerCase()}.`);
  const why = reason.trim();
  if (!why) return fail("Say why.");
  const date = newDate || x.delivery.date;
  const by = who();
  const wasOut = x.delivery.status === "Out for delivery";
  const { outAt: _outAt, ...rest } = x.delivery;
  void _outAt;
  const next: FieldSale = { ...x, delivery: { ...rest, status: "Rescheduled", date, history: [...x.delivery.history, { when: stamp(), what: `Not delivered: ${why}. Rescheduled to ${fmtDate(date)}`, who: by }] } };
  store.setState((s) => ({ ...(wasOut ? applyStockChanges(s, stockFor(x, 1, by)) : {}), ...save(s, next) }));
  const message = `${x.delivery.ref} rescheduled.`;
  showToast(message);
  return ok(undefined, message);
}

/** "Cancel this delivery": the sale is cancelled; goods already out come back. */
export async function cancelField(ref: string, reason: string): Promise<Result<void>> {
  const store = getStore();
  const x = findSale(store.getState(), ref);
  if (!x) return fail("That delivery is not in the list.");
  if (!deliveryOpen(x.delivery)) return fail(`${x.delivery.ref} is already ${x.delivery.status.toLowerCase()}.`);
  const why = reason.trim();
  if (!why) return fail("Say why.");
  const by = who();
  const at = stamp();
  const wasOut = x.delivery.status === "Out for delivery";
  const next: FieldSale = { ...x, delivery: { ...x.delivery, status: "Cancelled", doneAt: at, history: [...x.delivery.history, { when: at, what: `Cancelled: ${why}`, who: by }] } };
  store.setState((s) => {
    let st: AppState = { ...s, ...(wasOut ? applyStockChanges(s, stockFor(x, 1, by)) : {}) };
    st = { ...st, ...save(st, next, { label: "Cancelled", tone: "danger" }) };
    // A credit sale's receivable is closed with the sale.
    if (x.pay.mode === "credit") st = { ...st, money: closeReceivableFor(st, x.ref) };
    return st;
  });
  const message = `${x.delivery.ref} cancelled.${x.pay.mode === "now" && x.kind !== "delivery" ? " The customer already paid, so record a refund in Sales." : ""}`;
  showToast(message);
  return ok(undefined, message);
}

/**
 * "New delivery" on Field sales › Deliveries: send goods to a customer for a sale already made or
 * anything else. No sale is created; stock leaves at dispatch as for a field sale.
 */
export async function createDelivery(input: NewDelivery): Promise<Result<FieldSale>> {
  if (!input.customer) return fail("Pick the customer.");
  if (!input.lines.length) return fail("Add at least one item.");
  if (!input.location.trim()) return fail("Add where to deliver it.");
  if (!input.date) return fail("Pick the delivery date.");
  if (!input.driver) return fail("Pick the driver.");
  const store = getStore();
  const state = store.getState();
  const by = who();
  const at = stamp();
  const ref = nextRef(state.field.sales.map((x) => x.delivery.ref), "DLV-", 4);
  const link = input.link.trim();
  const x: FieldSale = {
    kind: "delivery",
    link,
    ref,
    date: DEMO_TODAY,
    time: at.slice(-5),
    rep: "",
    route: "",
    customer: input.customer,
    phone: input.phone.trim() || "—",
    location: input.location.trim(),
    store: input.store,
    lines: input.lines.map((l) => ({ ...l })),
    pay: { mode: input.pay === "delivery" ? "delivery" : input.pay === "paid" ? "now" : "none", method: "", ref: "" },
    delivery: {
      ref,
      date: input.date,
      driver: input.driver,
      status: "Pending",
      note: input.note.trim(),
      history: [{ when: at, what: `Delivery created${link ? ` for ${link}` : ""}`, who: by }],
    },
  };
  store.setState((s) => ({ field: { ...s.field, sales: [x, ...s.field.sales] } }));
  const message = `${ref} created. It's in Field sales › Deliveries.`;
  showToast(message);
  return ok(x, message);
}

const KE_PHONE = /^(\+?254|0)\s?[17]\d{2}\s?\d{3}\s?\d{3}$/;

/** "New sales rep" / "Edit sales rep" (design `fr`). Renaming moves their sales and deliveries with them. */
export async function saveFieldRep(input: NewFieldRep, edit?: string): Promise<Result<void>> {
  const name = input.name.trim();
  if (!name) return fail("Enter the rep's name.");
  if (!KE_PHONE.test(input.phone.trim())) return fail("Enter a Kenyan phone number, for example 0712 345 678.");
  if (!input.route.trim()) return fail("Add the route or area they cover.");
  const store = getStore();
  const reps = store.getState().field.reps;
  if (reps.some((r) => r.name.toLowerCase() === name.toLowerCase() && r.name !== edit)) return fail("There is already a rep with this name.");
  if (edit && !reps.some((r) => r.name === edit)) return fail("That rep is not in the list.");
  const rec = { name, phone: input.phone.trim(), route: input.route.trim(), vehicle: input.vehicle.trim() || "—", active: input.active };
  store.setState((s) => {
    if (!edit) return { field: { ...s.field, reps: [...s.field.reps, rec] } };
    const renamed = edit !== name;
    return {
      field: {
        ...s.field,
        reps: s.field.reps.map((r) => (r.name === edit ? rec : r)),
        sales: renamed
          ? s.field.sales.map((x) => (x.rep === edit || x.delivery.driver === edit ? { ...x, rep: x.rep === edit ? name : x.rep, delivery: { ...x.delivery, driver: x.delivery.driver === edit ? name : x.delivery.driver } } : x))
          : s.field.sales,
      },
    };
  });
  const message = edit ? `${name} updated.` : `${name} added. They can now take field sales and drive deliveries.`;
  showToast(message);
  return ok(undefined, message);
}

/** "Mark off duty" / "Mark on route". Off-duty reps stay in the list. */
export async function setFieldRepActive(name: string, active: boolean): Promise<Result<void>> {
  getStore().setState((s) => ({ field: { ...s.field, reps: s.field.reps.map((r) => (r.name === name ? { ...r, active } : r)) } }));
  return ok(undefined);
}
