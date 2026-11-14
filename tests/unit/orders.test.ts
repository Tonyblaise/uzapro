import { beforeEach, describe, expect, it } from "vitest";
import { cancelOrder, createOrder, dispatchOrder, invoiceOrder, markDelivered, updateOrder } from "@/data/commands/orders";
import { positionOf } from "@/data/creditGate";
import { recordSale } from "@/data/commands/sales";
import { updateCustomer } from "@/data/commands/customers";
import { voidSale } from "@/data/commands/sales";
import { checkDispatch, leftToDispatch, orderStatus, orderTotals, toInvoice, uninvoicedValue } from "@/data/orders";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import type { NewOrder, OrderLine } from "@/data/types";

let store: AppStore;
const s = () => store.getState();
const qtyAt = (product: string, at: string) => s().stock.levels.find((l) => l.product === product && l.store === at)?.quantity ?? 0;
const order = (number: string) => s().sales.orders.find((o) => o.number === number)!;
const pumps = (qty: number, o: Partial<NewOrder> = {}): NewOrder => ({
  customer: "Mountain Goats",
  date: "2026-11-10",
  deliverBy: "2026-11-14",
  store: "Main Store",
  lines: [{ product: "Bike Pump", variant: "Standard", unit: "Box", qty, rate: 3800, taxable: false }],
  notes: "",
  ...o,
});
const line = (o: Partial<OrderLine>): OrderLine => ({ product: "P", variant: "V", unit: "Box", qty: 4, rate: 100, taxable: true, dispatched: 0, invoiced: 0, ...o });
const send = (number: string, qty: number[]) => dispatchOrder({ order: number, qty, driver: "Peter Kamau", vehicle: "KDG 412X", notes: "" });

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("order rules (feature 013)", () => {
  it("works out what is left to dispatch and to invoice", () => {
    expect(leftToDispatch(line({ dispatched: 3 }))).toBe(1);
    expect(toInvoice(line({ dispatched: 3, invoiced: 1 }))).toBe(2);
    expect(orderTotals([line({}), line({ taxable: false, qty: 1, rate: 50 })])).toEqual({ subtotal: 450, vat: 64, total: 514 });
  });

  it("derives the order status", () => {
    const st = (lines: OrderLine[], cancelled = false) => orderStatus({ lines, cancelled }).label;
    expect(st([line({})])).toBe("Open");
    expect(st([line({ dispatched: 4 }), line({})])).toBe("Part dispatched");
    expect(st([line({ dispatched: 2 })])).toBe("Part dispatched");
    expect(st([line({ dispatched: 4 })])).toBe("Dispatched");
    expect(st([line({ dispatched: 4, invoiced: 2 })])).toBe("Dispatched");
    expect(st([line({ dispatched: 4, invoiced: 4 })])).toBe("Invoiced");
    expect(st([line({})], true)).toBe("Cancelled");
  });

  it("validates a dispatch", () => {
    const o = { lines: [line({ dispatched: 1 }), line({ product: "Q" })], cancelled: false };
    expect(checkDispatch(o, [3, 4], "A", "K")).toBeNull();
    expect(checkDispatch(o, [0, 0], "A", "K")).toBe("Send at least one item");
    expect(checkDispatch(o, [4, 0], "A", "K")).toBe("You can send at most 3 Box of P · V");
    expect(checkDispatch(o, [-1, 1], "A", "K")).toBe("Send at least one item");
    expect(checkDispatch(o, [1, 0], " ", "K")).toBe("Enter the driver's name");
    expect(checkDispatch(o, [1, 0], "A", "")).toBe("Enter the vehicle registration");
    expect(checkDispatch({ ...o, cancelled: true }, [1, 0], "A", "K")).toBe("There is nothing left to dispatch on this order.");
  });

  it("seeds SO-0001 part dispatched with its delivered note", () => {
    expect(order("SO-0001")).toMatchObject({ customer: "Morningview Bicycles", amount: 16560, creditApproval: { why: "overdue" } });
    expect(orderStatus(order("SO-0001")).label).toBe("Part dispatched");
    expect(order("SO-0001").amount).toBe(orderTotals(order("SO-0001").lines).total);
    expect(s().sales.deliveries[0]).toMatchObject({ number: "DN-0001", order: "SO-0001", delivered: true, receivedBy: "Amina Yusuf" });
  });
});

describe("order commands (feature 013)", () => {
  it("takes an order without moving stock or adding a receivable (FR-006)", async () => {
    const stock = qtyAt("Bike Pump", "Main Store");
    const owed = s().money.receivables.length;
    const r = await createOrder(pumps(3));
    expect(r).toMatchObject({ ok: true, message: "SO-0002 saved.", value: { number: "SO-0002", amount: 11400, by: "Tony Blaise" } });
    expect(orderStatus(order("SO-0002")).label).toBe("Open");
    expect(qtyAt("Bike Pump", "Main Store")).toBe(stock);
    expect(s().money.receivables).toHaveLength(owed);
  });

  it("refuses a walk-in order, an empty order and a credit stop without approval", async () => {
    expect((await createOrder(pumps(1, { customer: "Walk-in Customer" }))).message).toBe("Pick the customer first. Walk-in customers can't place orders.");
    expect((await createOrder(pumps(1, { lines: [] }))).message).toBe("No items added yet.");
    expect((await createOrder(pumps(1, { deliverBy: "" }))).ok).toBe(false);
    expect(await createOrder(pumps(6))).toMatchObject({ ok: false, stop: { why: "limit", over: 3200 } }); // 22,800 > 19,600
    expect(await createOrder(pumps(1, { customer: "Morningview Bicycles" }))).toMatchObject({ ok: false, stop: { why: "overdue" } });
    const ok = await createOrder(pumps(6, { approval: { reason: "Agreed with the owner" } }));
    expect(ok.ok && ok.value.creditApproval).toMatchObject({ why: "limit", amount: 3200 });
  });

  it("dispatches in parts: stock falls by exactly what is sent and never more than ordered (SC-003)", async () => {
    await createOrder(pumps(3));
    const start = qtyAt("Bike Pump", "Main Store");
    const first = await send("SO-0002", [2]);
    expect(first).toMatchObject({ ok: true, message: "DN-0002 created. 2 items left Main Store.", value: { number: "DN-0002", delivered: false, driver: "Peter Kamau" } });
    expect(qtyAt("Bike Pump", "Main Store")).toBe(start - 2);
    expect(s().stock.movements[0]).toMatchObject({ ref: "DN-0002", change: -2, store: "Main Store" });
    expect(orderStatus(order("SO-0002")).label).toBe("Part dispatched");
    expect((await send("SO-0002", [2])).message).toBe("You can send at most 1 Box of Bike Pump · Standard");
    expect((await send("SO-0002", [1])).message).toBe("DN-0003 created. 1 item left Main Store.");
    expect(qtyAt("Bike Pump", "Main Store")).toBe(start - 3);
    expect(orderStatus(order("SO-0002")).label).toBe("Dispatched");
    expect((await send("SO-0002", [1])).ok).toBe(false);
    expect(qtyAt("Bike Pump", "Main Store")).toBe(start - 3);
  });

  it("refuses a dispatch the store cannot cover and changes nothing", async () => {
    await updateCustomer("Mountain Goats", { name: "Mountain Goats", phone: "", email: "", address: "", creditLimit: null });
    await createOrder(pumps(40));
    const before = qtyAt("Bike Pump", "Main Store");
    expect((await send("SO-0002", [40])).message).toBe(`Only ${before} Bike Pump left at Main Store.`);
    expect(qtyAt("Bike Pump", "Main Store")).toBe(before);
    expect(order("SO-0002").lines[0]!.dispatched).toBe(0);
    expect(s().sales.deliveries).toHaveLength(1);
  });

  it("marks a delivery note delivered once, with the receiver's name", async () => {
    await send("SO-0001", [1]);
    expect((await markDelivered("DN-0002", "  ")).message).toBe("Enter who received the goods");
    expect((await markDelivered("DN-0002", " Amina Yusuf ")).message).toBe("DN-0002 marked delivered.");
    expect(s().sales.deliveries[0]).toMatchObject({ delivered: true, receivedBy: "Amina Yusuf" });
    expect(s().sales.deliveries[0]!.deliveredAt).toMatch(/^10 Nov 2026, \d\d:\d\d$/);
    expect((await markDelivered("DN-0002", "Someone")).ok).toBe(false);
  });

  it("invoices exactly what was dispatched, without moving stock (SC-004)", async () => {
    const stock = qtyAt("Bike Pump", "Main Store");
    const first = await invoiceOrder("SO-0001"); // seed: 2 of 4 dispatched
    expect(first.ok && first.value).toMatchObject({ customer: "Morningview Bicycles", amount: 8280, due: "2026-12-10", notes: "Sales order SO-0001" });
    expect(first.ok && first.value.lines).toEqual([{ description: "Bike Pump · Standard", qty: 2, unit: "Box", rate: 4140, taxable: false }]);
    expect(qtyAt("Bike Pump", "Main Store")).toBe(stock);
    expect(s().money.receivables[0]).toMatchObject({ party: "Morningview Bicycles", type: "Invoice", total: 8280 });
    expect(order("SO-0001")).toMatchObject({ invoices: [first.ok ? first.value.number : ""] });
    expect((await invoiceOrder("SO-0001")).ok).toBe(false);

    await send("SO-0001", [2]);
    const second = await invoiceOrder("SO-0001");
    expect(second.ok && second.value.amount).toBe(8280);
    expect(orderStatus(order("SO-0001")).label).toBe("Invoiced");
    expect(order("SO-0001").invoices).toHaveLength(2);

    // Voiding an order's invoice closes the receivable and returns no stock (research R6).
    const after = qtyAt("Bike Pump", "Main Store");
    await voidSale(second.ok ? second.value.number : "", "Entered by mistake");
    expect(qtyAt("Bike Pump", "Main Store")).toBe(after);
  });

  it("edits and cancels only while nothing is dispatched", async () => {
    await createOrder(pumps(2));
    const u = await updateOrder("SO-0002", pumps(3, { deliverBy: "2026-11-20" }));
    expect(u.ok && u.value).toMatchObject({ amount: 11400, deliverBy: "2026-11-20" });
    expect((await cancelOrder("SO-0002")).message).toBe("SO-0002 cancelled.");
    expect(orderStatus(order("SO-0002")).label).toBe("Cancelled");
    expect((await send("SO-0002", [1])).ok).toBe(false);
    expect((await updateOrder("SO-0001", pumps(9))).message).toBe("SO-0001 can't be changed after goods are dispatched.");
    expect((await cancelOrder("SO-0001")).message).toBe("SO-0001 can't be cancelled after goods are dispatched.");
  });

  it("follows a customer rename", async () => {
    await updateCustomer("Morningview Bicycles", { name: "Morningview Ltd", phone: "", email: "", address: "" });
    expect(order("SO-0001").customer).toBe("Morningview Ltd");
    expect(s().sales.deliveries[0]!.customer).toBe("Morningview Ltd");
  });

  it("counts open orders against the credit limit until they are invoiced or cancelled", async () => {
    const pos = () => positionOf(s().customers, s().money.receivables, s().sales.orders, "Mountain Goats")!;
    const helmet = () => recordSale({ customer: "Mountain Goats", lines: [{ product: "Helmet", variant: "Medium", unit: "Carton", qty: 1, price: 14900, taxable: true }], payMethod: "Pay later (credit)" });
    expect(pos()).toMatchObject({ owed: 80400, onOrder: 0, available: 19600 });

    await createOrder(pumps(3)); // 11,400 on order
    expect(uninvoicedValue(order("SO-0002"))).toBe(11400);
    expect(pos()).toMatchObject({ owed: 80400, onOrder: 11400, available: 8200 });
    // A credit sale that fitted before the order is now stopped, and so is a second order.
    expect(await helmet()).toMatchObject({ ok: false, stop: { why: "limit", over: 9084 } }); // 17,284 against 8,200
    expect(await createOrder(pumps(3))).toMatchObject({ ok: false, stop: { why: "limit", over: 3200 } });

    // Dispatching changes nothing; invoicing moves the amount from "on order" to "owed".
    await send("SO-0002", [2]);
    expect(pos()).toMatchObject({ onOrder: 11400, available: 8200 });
    await invoiceOrder("SO-0002");
    expect(pos()).toMatchObject({ owed: 88000, onOrder: 3800, available: 8200 });

    // Cancelling an order frees its credit.
    await createOrder(pumps(1));
    expect(pos().available).toBe(4400);
    await cancelOrder("SO-0003");
    expect(pos().available).toBe(8200);

    // The seed order counts for Morningview Bicycles.
    expect(positionOf(s().customers, s().money.receivables, s().sales.orders, "Morningview Bicycles")).toMatchObject({ owed: 45600, onOrder: 16560, available: 0 });
  });
});
