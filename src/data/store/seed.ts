/**
 * Pure seed: converts the verbatim design fixtures into typed state (research R5).
 * No browser storage access here; StoreProvider applies uzAuth / uzNavClosed after mount.
 */
import { parseAmount } from "@/lib/format";
import { CATEGORY_ROWS, EXTRA_UNITS, PRODUCT_ROWS, UZ_PRODADDED, UZ_VARIANTS } from "../fixtures/catalog";
import { CUSTOMER_ROWS } from "../fixtures/customers";
import { UZ_NONTAX, UZ_UNITS } from "../fixtures/reference";
import { CREDIT_NOTE_ROWS, INVOICE_ROWS, QUOTATION_ROWS, SALE_NO_START, SALE_ROWS, UZ_TARGETS, VOID_ROWS } from "../fixtures/sales";
import { STOCK_LINES, STOCK_MOVES, TRANSFER_DETAILS, TRANSFER_ROWS, WAREHOUSE_ROWS, WASTAGE_ROWS } from "../fixtures/stock";
import type { Product, Sale, SalesTarget, Store, TransferStatus, Variant } from "../types";
import { GRN_ROWS, PO_ROWS, PRT_ROWS, PYB_LAST, REJ_ROWS } from "../fixtures/purchases";
import { SUPPLIER_ROWS, UZ_NATIONS } from "../fixtures/suppliers";
import type { GoodsReceipt, PurchaseOrder, Supplier } from "../types";
import type { AppState, PurchasesState } from "./state";

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/** "9 Nov 2026" → "2026-11-09" */
export function parseDisplayDate(v: string): string {
  const m = v.trim().match(/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})/);
  if (!m) return "";
  const [, d, mon, y] = m;
  return `${y}-${MONTHS[mon!] ?? "01"}-${d!.padStart(2, "0")}`;
}

/** "Carbon Road Frame · 54cm" → { product, variant } */
export function splitItemKey(key: string): { product: string; variant: string } {
  const [product = key, variant = ""] = key.split(" · ");
  return { product, variant };
}

function variantsFor(name: string): Variant[] {
  const extras = EXTRA_UNITS.find(([p]) => p === name)?.[1] ?? [];
  return (UZ_VARIANTS[name] ?? []).map(([vName, price, cost]) => ({
    name: vName,
    price,
    cost,
    unit: "Piece",
    extraUnits: extras.map(([unit, mult]) => ({ unit, price: price * mult, cost: cost * mult })),
  }));
}

export function createSeed(): AppState {
  const products: Product[] = PRODUCT_ROWS.map(([name, category, priceLabel, , status]) => {
    const added = UZ_PRODADDED[name];
    return {
      name,
      category,
      priceLabel,
      taxable: !UZ_NONTAX.includes(name),
      status: { ...status },
      addedAt: added?.[2] ?? "",
      addedBy: added?.[1] ?? "",
      variants: variantsFor(name),
    };
  });

  const stores: Store[] = WAREHOUSE_ROWS.map(([name, branch, type]) => ({ name, branch, type }));

  const movements = STOCK_MOVES.map(([d, product, variant, kind, store, change, left, by, ref], i) => ({
    id: `seed-${i}`,
    date: parseDisplayDate(d),
    product,
    variant,
    kind: { ...kind },
    store,
    change: parseAmount(change),
    left: parseAmount(left),
    by,
    ref,
  }));

  const transfers = TRANSFER_ROWS.map(([ref, from, to, , status]) => {
    const det = TRANSFER_DETAILS[ref];
    return {
      ref,
      from,
      to,
      date: det?.date ?? "",
      notes: det?.notes ?? "",
      status: status.label as TransferStatus,
      items: (det?.rows ?? []).map((r) => ({ ...splitItemKey(r.key), qty: Number(r.qty), unit: r.unit })),
    };
  });

  const wasteDates: Record<string, string> = Object.fromEntries(movements.filter((m) => m.ref.startsWith("WST-")).map((m) => [m.ref, m.date]));
  const wastage = WASTAGE_ROWS.map(([ref, item, qty, reason, value]) => ({
    ref,
    location: "Stores",
    date: wasteDates[ref] ?? "",
    notes: "",
    items: [{ product: item, variant: "", qty: Number(qty), unit: "Piece", reason }],
    value: parseAmount(value),
  }));

  // Seed sales have no reference in the design; number them below the design's first new sale.
  const sales: Sale[] = SALE_ROWS.map(([customer, type, channel, total, status], i) => ({
    ref: `SAL-${String(SALE_NO_START - i).padStart(6, "0")}`,
    customer,
    type,
    channel,
    store: "Point of Sale",
    date: "",
    time: "",
    lines: [],
    payments: [],
    subtotal: parseAmount(total),
    vat: 0,
    total: parseAmount(total),
    status: { ...status },
    by: "",
    session: false,
  }));

  return {
    session: { authed: false, role: "owner", remember: true, hydrated: false, navClosed: {} },
    catalog: {
      products,
      categories: CATEGORY_ROWS.map(([name, description, , parent]) => ({ name, description, parent })),
      units: [...UZ_UNITS],
      extraWasteReasons: [],
    },
    stock: {
      stores,
      levels: STOCK_LINES.map(([product, store, quantity]) => ({ product, store, quantity })),
      movements,
      transfers,
      wastage,
    },
    sales: {
      sales,
      saleNo: SALE_NO_START,
      quotations: QUOTATION_ROWS.map(([number, customer, d, status, amount]) => ({
        number,
        customer,
        date: parseDisplayDate(d),
        due: "",
        store: "Main Store",
        lines: [],
        discount: { value: 0, type: "KES" as const },
        notes: "",
        terms: "",
        status: { ...status },
        amount: parseAmount(amount),
      })),
      invoices: INVOICE_ROWS.map(([number, customer, d, due, status, amount, balance]) => ({
        number,
        customer,
        date: parseDisplayDate(d),
        due: parseDisplayDate(due),
        store: "Main Store",
        lines: [],
        discount: { value: 0, type: "KES" as const },
        notes: "",
        terms: "",
        status: { ...status },
        amount: parseAmount(amount),
        paid: parseAmount(amount) - parseAmount(balance.pill),
      })),
      creditNotes: CREDIT_NOTE_ROWS.map(([number, customer, d, source, reason, amount, status]) => ({
        number,
        customer,
        date: parseDisplayDate(d),
        source,
        items: [],
        reason,
        notes: "",
        returnToStock: true,
        refundMethod: "",
        amount: parseAmount(amount),
        status: { ...status },
      })),
      voids: VOID_ROWS.map(([ref, original, customer, d, reason, by, amount]) => ({
        ref,
        original,
        customer,
        date: parseDisplayDate(d),
        reason,
        by,
        amount: parseAmount(amount),
      })),
      targets: UZ_TARGETS.map((t) => ({ ...t }) as SalesTarget),
    },
    customers: CUSTOMER_ROWS.map(([name, phone, email, address, status]) => ({ name, phone, email, address, status: { ...status } })),
    suppliers: SUPPLIER_ROWS.map(
      ([name, type, phone, email, town, status]): Supplier => ({
        name,
        type: (type as string) === "Individual" ? "Individual" : "Business",
        phone,
        email,
        town,
        nation: "Kenya",
        address: "",
        county: "",
        postal: "",
        status: { ...status },
      }),
    ),
    purchases: seedPurchases(),
    ui: { toast: null, search: "" },
  };
}

/**
 * Seed purchase orders and receipts, derived exactly as the design's `poDoc` / `grnInfo` do:
 * one placeholder line "Items on {ref}" (qty 1, cost = total), Main Store, 28 Oct 2026, Cash on
 * delivery, Bank transfer; receipts received/accepted in full by Grant Jensen on 29 Oct 2026.
 */
function seedPurchases(): PurchasesState {
  const orders: PurchaseOrder[] = PO_ROWS.map(([supplier, ref, total, received, status]) => {
    const t = parseAmount(total);
    const draft = status.label === "Draft";
    return {
      ref,
      supplier,
      store: "Main Store",
      date: "2026-10-28",
      expected: "",
      notes: "",
      term: "Cash on delivery",
      method: "Bank transfer",
      account: "",
      paid: status.label === "Completed",
      lines: [{ id: `po${ref}`, key: `Items on ${ref}`, qty: 1, unit: "Piece", cost: t, recv: received.label === "Full" ? 1 : 0 }],
      total: t,
      received: { ...received },
      status: { ...status },
      activity: [["Order created", "Tony Ashiuma · 28 Oct 2026"] as [string, string]].concat(draft ? [] : [["Sent to supplier", "Tony Ashiuma"]]),
      grns: GRN_ROWS.filter((g) => g[1] === ref).map((g) => g[0]),
    };
  });
  const receipts: GoodsReceipt[] = GRN_ROWS.map(([ref, po, supplier, store, lines, status]) => {
    const order = orders.find((o) => o.ref === po);
    return {
      ref,
      po,
      supplier,
      store,
      date: "2026-10-29",
      dn: "",
      inv: "",
      notes: "",
      who: "Grant Jensen",
      lines: (order?.lines ?? []).map((l) => ({ key: l.key, unit: l.unit, ordered: l.qty, recv: l.qty, acc: l.qty, rej: 0, cost: l.cost })),
      lineCount: Number(lines),
      status: { ...status },
      returned: {},
    };
  });
  return {
    orders,
    receipts,
    returns: PRT_ROWS.map(([ref, supplier, po, grn, reason, qty, value, status]) => ({
      ref,
      supplier,
      po,
      grn,
      reason,
      notes: "",
      lines: [],
      qty: Number(qty),
      value: parseAmount(value),
      status: { ...status },
      store: receipts.find((r) => r.ref === grn)?.store ?? "Main Store",
      date: "",
    })),
    rejected: REJ_ROWS.map(([ref, grn, supplier, item, qty, reason, status]) => ({ ref, grn, supplier, item, qty: Number(qty), reason, status: { ...status } })),
    nations: [...UZ_NATIONS],
    pybNo: PYB_LAST,
  };
}
