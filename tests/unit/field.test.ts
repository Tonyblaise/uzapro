import { beforeEach, describe, expect, it } from "vitest";
import { cancelField, createDelivery, createFieldSale, deliverField, dispatchFieldDelivery, fieldTotal, fieldVat, rescheduleField, saveFieldRep, setFieldRepActive } from "@/data/commands/field";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import type { NewDelivery, NewFieldSale } from "@/data/types";

let store: AppStore;
const s = () => store.getState();
const qtyAt = (product: string, at: string) => s().stock.levels.find((l) => l.product === product && l.store === at)?.quantity ?? 0;
const balance = (account: string) => s().accounts.accounts.find((a) => a.name === account)!.balance;
const sale = (ref: string) => s().sales.sales.find((x) => x.ref === ref)!;
const field = (ref: string) => s().field.sales.find((x) => x.ref === ref || x.delivery.ref === ref)!;

/** Two pumps for Mountain Goats from the Main Store, KES 690. */
const input = (o: Partial<NewFieldSale> = {}): NewFieldSale => ({
  customer: "Mountain Goats",
  phone: "+254 733 208 561",
  location: "Ridgeways Mall, shop 4",
  lines: [{ product: "Bike Pump", variant: "Standard", qty: 2, price: 345 }],
  store: "Main Store",
  date: "2026-11-11",
  driver: "",
  note: "",
  rep: "Kevin Otieno",
  route: "Kiambu Road",
  pay: "delivery",
  method: "M-Pesa",
  ref: "",
  ...o,
});

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("field sales (feature 024)", () => {
  it("seeds the design's reps and six field sales", () => {
    expect(s().field.reps.map((r) => r.name)).toEqual(["Peter Roadie", "Kevin Otieno", "Faith Wanjiku"]);
    expect(s().field.sales.map((x) => x.ref)).toEqual(["FS-0112", "FS-0111", "FS-0110", "FS-0109", "FS-0108", "FS-0107"]);
    expect(fieldTotal(field("FS-0112"))).toBe(6 * 1639 + 10 * 345);
    expect(fieldVat(1160)).toBe(160);
  });

  it("refuses an incomplete sale with the design's messages, in order", async () => {
    expect((await createFieldSale(input({ customer: "" }))).message).toBe("Pick the customer.");
    expect((await createFieldSale(input({ rep: "" }))).message).toBe("Pick the sales rep who took the order.");
    expect((await createFieldSale(input({ lines: [] }))).message).toBe("Add at least one item.");
    expect((await createFieldSale(input({ location: " " }))).message).toBe("Add where to deliver it.");
    expect((await createFieldSale(input({ customer: "Walk-in Customer", pay: "credit" }))).message).toBe("Pick a named customer to sell on credit.");
    expect((await createFieldSale(input({ date: "" }))).message).toBe("Pick the delivery date.");
    expect(s().field.sales).toHaveLength(6);
  });

  it("saves a pay-on-delivery sale to Deliveries without moving stock", async () => {
    const before = qtyAt("Bike Pump", "Main Store");
    const r = await createFieldSale(input());
    expect(r.message).toBe("FS-0113 saved. Delivery DLV-0241 is waiting in Field sales › Deliveries.");
    const x = field("FS-0113");
    expect(x.delivery).toMatchObject({ ref: "DLV-0241", status: "Pending", driver: "Kevin Otieno", date: "2026-11-11" });
    expect(x.delivery.history[0]!.what).toBe("Order taken by Kevin Otieno on Kiambu Road");
    expect(sale("FS-0113")).toMatchObject({ type: "Field sale", channel: "Field", total: 690, status: { label: "Awaiting delivery" } });
    expect(qtyAt("Bike Pump", "Main Store")).toBe(before);
  });

  it("paid now goes into the method's account; on credit adds a receivable", async () => {
    const till = balance("M-Pesa Till");
    await createFieldSale(input({ pay: "now", method: "M-Pesa", ref: "SKX1" }));
    expect(balance("M-Pesa Till")).toBe(till + 690);
    expect(sale("FS-0113").status.label).toBe("Paid");

    await createFieldSale(input({ pay: "credit" }));
    expect(sale("FS-0114").status.label).toBe("Unpaid");
    expect(s().money.receivables.find((r) => r.doc === "FS-0114")).toMatchObject({ party: "Mountain Goats", type: "Sale on credit", total: 690 });
  });

  it("dispatch takes the stock; delivery collects the money and marks the sale Paid", async () => {
    await createFieldSale(input());
    const pumps = qtyAt("Bike Pump", "Main Store");
    const cash = balance("Cash drawer");
    expect((await dispatchFieldDelivery("DLV-0241", "Sam Mwangi")).message).toBe("DLV-0241 is out for delivery.");
    expect(qtyAt("Bike Pump", "Main Store")).toBe(pumps - 2);
    expect(field("DLV-0241").delivery).toMatchObject({ status: "Out for delivery", driver: "Sam Mwangi" });

    expect((await deliverField("DLV-0241", { receivedBy: "", method: "M-Pesa", payRef: "", note: "" })).message).toBe("Add the name of the person who received it.");
    expect((await deliverField("DLV-0241", { receivedBy: "Ann", method: "M-Pesa", payRef: "", note: "" })).message).toBe("Add the M-Pesa code for the payment.");
    expect((await deliverField("DLV-0241", { receivedBy: "Ann", method: "Cash", payRef: "", note: "" })).message).toBe("DLV-0241 delivered.");
    expect(field("DLV-0241").delivery).toMatchObject({ status: "Delivered", receivedBy: "Ann", collected: { method: "Cash", amount: 690 } });
    expect(balance("Cash drawer")).toBe(cash + 690);
    expect(sale("FS-0113").status.label).toBe("Paid");
  });

  it("couldn't deliver puts the stock back; cancelling a credit sale closes its receivable", async () => {
    await createFieldSale(input({ pay: "credit" }));
    const pumps = qtyAt("Bike Pump", "Main Store");
    await dispatchFieldDelivery("DLV-0241", "Kevin Otieno");
    expect((await rescheduleField("DLV-0241", "", "2026-11-12")).message).toBe("Say why.");
    expect((await rescheduleField("DLV-0241", "Shop closed", "2026-11-12")).message).toBe("DLV-0241 rescheduled.");
    expect(qtyAt("Bike Pump", "Main Store")).toBe(pumps);
    expect(field("DLV-0241").delivery).toMatchObject({ status: "Rescheduled", date: "2026-11-12" });

    expect((await cancelField("DLV-0241", "Customer changed their mind")).message).toBe("DLV-0241 cancelled.");
    expect(qtyAt("Bike Pump", "Main Store")).toBe(pumps);
    expect(sale("FS-0113").status.label).toBe("Cancelled");
    expect(s().money.receivables.find((r) => r.doc === "FS-0113")!.voided).toBe(true);
  });

  it("tells you to refund when a paid-now delivery is cancelled", async () => {
    await createFieldSale(input({ pay: "now", method: "Cash" }));
    expect((await cancelField("DLV-0241", "Wrong address")).message).toBe("DLV-0241 cancelled. The customer already paid, so record a refund in Sales.");
  });

  it("adds and edits a sales rep with the design's checks; renaming moves their sales", async () => {
    const rep = { name: "Brian Mutua", phone: "0712 345 678", route: "Thika Road", vehicle: "", active: true };
    expect((await saveFieldRep({ ...rep, name: " " })).message).toBe("Enter the rep's name.");
    expect((await saveFieldRep({ ...rep, phone: "12345" })).message).toBe("Enter a Kenyan phone number, for example 0712 345 678.");
    expect((await saveFieldRep({ ...rep, route: "" })).message).toBe("Add the route or area they cover.");
    expect((await saveFieldRep({ ...rep, name: "peter roadie" })).message).toBe("There is already a rep with this name.");
    expect((await saveFieldRep(rep)).message).toBe("Brian Mutua added. They can now take field sales and drive deliveries.");
    expect(s().field.reps.at(-1)).toMatchObject({ name: "Brian Mutua", vehicle: "—", active: true });

    expect((await saveFieldRep({ name: "Peter Mwangi", phone: "+254 722 100 200", route: "Thika Road", vehicle: "KDA 412M · van", active: true }, "Peter Roadie")).message).toBe("Peter Mwangi updated.");
    expect(s().field.sales.filter((x) => x.rep === "Peter Roadie")).toHaveLength(0);
    expect(s().field.sales.filter((x) => x.rep === "Peter Mwangi").length).toBeGreaterThan(0);
    await setFieldRepActive("Peter Mwangi", false);
    expect(s().field.reps.find((r) => r.name === "Peter Mwangi")!.active).toBe(false);
  });

  it("creates a standalone delivery: no sale, stock at dispatch, nothing to collect", async () => {
    const d: NewDelivery = { link: "", customer: "Mountain Goats", phone: "", location: "Ridgeways Mall", lines: [{ product: "Bike Pump", variant: "Standard", qty: 1, price: 345 }], store: "Main Store", date: "2026-11-11", driver: "", note: "", pay: "none" };
    expect((await createDelivery({ ...d, location: "" })).message).toBe("Add where to deliver it.");
    expect((await createDelivery(d)).message).toBe("Pick the driver.");
    const sales = s().sales.sales.length;
    expect((await createDelivery({ ...d, driver: "Sam Mwangi", link: "SAL-001184" })).message).toBe("DLV-0241 created. It's in Field sales › Deliveries.");
    expect(field("DLV-0241")).toMatchObject({ kind: "delivery", link: "SAL-001184", rep: "", pay: { mode: "none" } });
    expect(field("DLV-0241").delivery.history[0]!.what).toBe("Delivery created for SAL-001184");
    expect(s().sales.sales).toHaveLength(sales);

    const pumps = qtyAt("Bike Pump", "Main Store");
    await dispatchFieldDelivery("DLV-0241", "Sam Mwangi");
    expect(qtyAt("Bike Pump", "Main Store")).toBe(pumps - 1);
    expect((await deliverField("DLV-0241", { receivedBy: "Ann", method: "", payRef: "", note: "" })).message).toBe("DLV-0241 delivered.");
    expect(field("DLV-0241").delivery.collected).toBeUndefined();
  });
});
