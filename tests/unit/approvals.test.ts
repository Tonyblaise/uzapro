import { beforeEach, describe, expect, it } from "vitest";
import { approvalsFor, discountBlock, discountGiven, myApprovals, seedApprovals, validDiscountMax } from "@/data/approvals";
import { approveCount, cancelCount, sendBackCount } from "@/data/commands/counts";
import { dispatchOrder, markDelivered } from "@/data/commands/orders";
import { addRole, deleteRole, duplicateRole, saveRoleAccess } from "@/data/commands/permissions";
import { addVariantToCart, charge, chooseVariant, completePosSale, launchTill, pressPin, setDiscount, tapProduct, toggleDiscountType } from "@/data/commands/pos";
import { createInvoice, createQuotation, recordSale, updateDocument } from "@/data/commands/sales";
import { accessFor } from "@/data/permissions";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import type { NewDocument, RoleApprovals } from "@/data/types";

let store: AppStore;
const s = () => store.getState();
const as = (role: "owner" | "accountant" | "cashier" | "store") => store.setState((x) => ({ session: { ...x.session, role } }));
const grant = async (key: string, patch: Partial<RoleApprovals>) => saveRoleAccess(key, accessFor(s(), key), { ...approvalsFor(s(), key), ...patch });
const doc = (kind: "quote" | "invoice", discount: NewDocument["discount"]): NewDocument => ({
  kind,
  customer: "Mountain Goats",
  date: "2026-11-10",
  due: "2026-12-10",
  store: "Main Store",
  lines: [{ description: "Bike Pump · Standard", qty: 10, unit: "Piece", rate: 100, taxable: false }],
  discount,
  notes: "",
  terms: "",
});

beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("approval rules (feature 018)", () => {
  it("seeds the four roles (FR-003) and gives the owner everything", () => {
    expect(seedApprovals()).toEqual({
      owner: { credit: true, counts: true, dispatch: true, discountMax: 100 },
      accountant: { credit: true, counts: false, dispatch: true, discountMax: 20 },
      cashier: { credit: false, counts: false, dispatch: false, discountMax: 5 },
      store: { credit: false, counts: false, dispatch: false, discountMax: 0 },
    });
    expect(myApprovals(s())).toMatchObject({ credit: true, counts: true, dispatch: true, discountMax: 100 });
    expect(approvalsFor(s(), "nope")).toEqual({ credit: false, counts: false, dispatch: false, discountMax: 0 });
  });

  it("works out the discount given and blocks one above the limit", () => {
    expect([discountGiven(1000, 50), discountGiven(1984, 198.4), discountGiven(300, 100), discountGiven(0, 10), discountGiven(100, 0)]).toEqual([5, 10, 33.3, 0, 0]);
    expect(discountBlock(5, 1000, 50)).toBeNull();
    expect(discountBlock(5, 1000, 51)).toBe("Your role can give discounts up to 5%. This one is 5.1%.");
    expect(discountBlock(0, 1000, 0)).toBeNull();
    expect(discountBlock(100, 1000, 1000)).toBeNull();
    expect([0, 5, 100, -1, 101, 2.5, NaN].map(validDiscountMax)).toEqual([true, true, true, false, false, false, false]);
  });
});

describe("saving approvals (feature 018, US1)", () => {
  it("saves a role's approvals, refuses a bad limit, and keeps the owner's locked", async () => {
    expect((await grant("store", { dispatch: true, discountMax: 10 })).message).toBe("Store keeper access saved.");
    expect(approvalsFor(s(), "store")).toEqual({ credit: false, counts: false, dispatch: true, discountMax: 10 });
    expect((await grant("store", { discountMax: 101 })).message).toBe("Enter a discount limit from 0 to 100");
    expect((await grant("store", { discountMax: NaN })).ok).toBe(false);
    await saveRoleAccess("owner", accessFor(s(), "owner"), { credit: false, counts: false, dispatch: false, discountMax: 0 });
    expect(approvalsFor(s(), "owner")).toMatchObject({ credit: true, discountMax: 100 });
    // Saving access alone leaves approvals as they were.
    await saveRoleAccess("store", accessFor(s(), "store"));
    expect(approvalsFor(s(), "store").dispatch).toBe(true);
  });

  it("a new role has none, a duplicate copies them, and a deleted role's go", async () => {
    const added = await addRole("Supervisor");
    const key = added.ok ? added.value : "";
    expect(approvalsFor(s(), key)).toEqual({ credit: false, counts: false, dispatch: false, discountMax: 0 });
    const copy = await duplicateRole("accountant");
    const copyKey = copy.ok ? copy.value : "";
    expect(approvalsFor(s(), copyKey)).toEqual({ credit: true, counts: false, dispatch: true, discountMax: 20 });
    await deleteRole(copyKey);
    expect(s().permissions.approvals[copyKey]).toBeUndefined();
  });
});

describe("the rights decide who can act (feature 018, US2, SC-002)", () => {
  const creditSale = () => recordSale({ customer: "Mountain Goats", lines: [{ product: "Helmet", variant: "Medium", unit: "Carton", qty: 2, price: 14900, taxable: true }], payMethod: "Pay later (credit)", approval: { reason: "Agreed with the owner" } });

  it("credit approval follows its right, not Write on Receivables", async () => {
    as("accountant");
    expect((await creditSale()).ok).toBe(true);
    as("owner");
    await grant("accountant", { credit: false });
    await grant("cashier", { credit: true });
    as("accountant");
    expect(await creditSale()).toMatchObject({ ok: false, stop: { why: "limit" } });
    as("cashier");
    expect((await creditSale()).ok).toBe(true);
  });

  it("stock count approval follows its right, not Delete on Stock", async () => {
    // SC-0014 is seeded waiting for approval (design UZ_COUNTS).
    as("store");
    for (const act of [approveCount, sendBackCount, cancelCount]) expect((await act("SC-0014")).message).toBe("Your role can't approve stock counts.");
    expect(s().stock.counts.find((c) => c.ref === "SC-0014")!.status).toBe("Waiting approval");
    as("owner");
    await grant("store", { counts: true });
    as("store");
    expect((await approveCount("SC-0014")).message).toBe("SC-0014 approved. Stock updated.");
  });

  it("dispatch follows its right, not Write on Sales", async () => {
    const send = () => dispatchOrder({ order: "SO-0001", qty: [1], driver: "Peter Kamau", vehicle: "KDG 412X", notes: "" });
    as("cashier"); // Write on Sales in the seed, but no dispatch right
    expect((await send()).message).toBe("Your role can't dispatch sales orders.");
    as("store"); // no Sales access at all in the seed
    expect((await send()).ok).toBe(false);
    as("owner");
    await grant("store", { dispatch: true });
    as("store");
    const r = await send();
    expect(r.ok).toBe(true);
    expect((await markDelivered(r.ok ? r.value.number : "", "Amina Yusuf")).ok).toBe(true);
    as("cashier");
    expect((await markDelivered("DN-0001", "X")).message).toBe("Your role can't dispatch sales orders.");
  });
});

describe("discount limits (feature 018, US3, SC-003)", () => {
  it("refuses a document discount above the role's limit", async () => {
    as("accountant"); // 20%
    expect((await createQuotation(doc("quote", { value: 20, type: "%" }))).ok).toBe(true);
    expect((await createQuotation(doc("quote", { value: 21, type: "%" }))).message).toBe("Your role can give discounts up to 20%. This one is 21%.");
    expect((await createInvoice(doc("invoice", { value: 250, type: "KES" }))).message).toBe("Your role can give discounts up to 20%. This one is 25%.");
    const q = await createQuotation(doc("quote", { value: 0, type: "KES" }));
    expect((await updateDocument("quote", q.ok ? q.value.number : "", doc("quote", { value: 300, type: "KES" }))).ok).toBe(false);
    as("owner");
    expect((await createInvoice(doc("invoice", { value: 90, type: "%" }))).ok).toBe(true);
  });

  it("refuses a till discount above the role's limit", () => {
    launchTill(1);
    for (const k of "1234") pressPin(k);
    as("cashier"); // 5%
    tapProduct("Helmet");
    chooseVariant("Medium");
    addVariantToCart();
    toggleDiscountType(); // to %
    const type = s().pos.ui.discType;
    setDiscount(type === "%" ? "10" : "163.9");
    charge();
    expect(completePosSale()).toBeNull();
    expect(s().pos.ui.co.err).toBe("Your role can give discounts up to 5%. This one is 10%.");
    setDiscount(type === "%" ? "5" : "81.95");
    expect(completePosSale()).not.toBeNull();
  });
});
