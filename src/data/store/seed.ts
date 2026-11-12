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
import { GRN_ROWS, PO_ROWS, PRT_ROWS, REJ_ROWS } from "../fixtures/purchases";
import { SUPPLIER_ROWS, UZ_NATIONS } from "../fixtures/suppliers";
import type { GoodsReceipt, PurchaseOrder, Supplier } from "../types";
import {
  CUSTOMER_CREDIT_ROWS,
  PAYABLE_ROWS,
  PAY_PAYMENT_ROWS,
  PAY_PLAN_ROWS,
  RCV_PAYMENT_ROWS,
  RCV_PLAN_ROWS,
  RCV_ROWS,
  SUPPLIER_CREDIT_ROWS,
  UZ_PAYDETAIL,
  UZ_PLANDETAIL,
  UZ_RCVDETAIL,
  UZ_SCDETAIL,
} from "../fixtures/money";
import type { Credit, MoneyPayment, Payable, Plan, Priority, Receivable } from "../types";
import { CHAT_SEED } from "../fixtures/help";
import type { AccountsState, AppState, ExpensesState, MoneyState, PurchasesState } from "./state";
import { ACCOUNT_ROWS, DEPOSIT_ROWS, TRANSFER_ROWS as MONEY_TRANSFER_ROWS, UZ_ACCDETAIL, UZ_BANKS, UZ_DEPDETAIL, UZ_LEDGER, UZ_TRDETAIL, UZ_WDDETAIL, WITHDRAWAL_ROWS } from "../fixtures/accounts";
import { EXPENSE_ROWS, RECURRING_ROWS, UZ_EXPCAT, UZ_EXPDETAIL, UZ_RECDETAIL, VOIDED_ROWS } from "../fixtures/expenses";
import type { AccountType, ExpenseStatus, LedgerKind } from "../types";
import { ROLE_IDS, ROLES } from "@/config/roles";
import { CAL_TYPES, EVENT_ROWS } from "../fixtures/calendar";
import { FILE_ROWS, FOLDER_ROWS } from "../fixtures/docs";
import { GENERIC_ROWS } from "../fixtures/generic";
import { PROFILE_DEFAULTS, PROFILE_EMAIL_DOMAIN, UZ_BIZ_FULL, UZ_BRANCHES, UZ_GROUPS, UZ_LOC_BRANCHES, UZ_LOC_TYPES, UZ_LOCPOS, UZ_TERMS } from "../fixtures/settings";
import { nextCode } from "../settings";
import type { Branch, Profile, RoleId } from "../types";
import type { CalendarState, DocsState, SettingsState } from "./state";

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
    money: seedMoney(),
    accounts: seedAccounts(),
    expenses: seedExpenses(),
    calendar: seedCalendar(),
    docs: seedDocs(),
    settings: seedSettings(),
    profiles: seedProfiles(),
    help: { messages: CHAT_SEED.map((m) => ({ ...m })) },
    generic: Object.fromEntries(Object.entries(GENERIC_ROWS).map(([k, rows]) => [k, rows.map((r) => r.map((c) => (typeof c === "string" ? c : { ...c })))])),
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
  };
}

/** Receivables and Payables seed (feature 003), ported from the design's rcv/pay rows + details. */
function seedMoney(): MoneyState {
  const pr = (v: string) => (v === "High" || v === "Low" ? v : "Normal") as Priority;
  const receivables: Receivable[] = RCV_ROWS.map(([ref, party, type, doc, due, priority, total, paid]) => ({
    ref,
    party,
    type,
    doc,
    due: parseDisplayDate(due),
    priority: pr(priority),
    total: parseAmount(total),
    paid: parseAmount(paid),
    raised: UZ_RCVDETAIL[ref]?.raised ?? "",
    voided: false,
  }));
  const payables: Payable[] = PAYABLE_ROWS.map(([ref, party, type, doc, branch, due, priority, total, paid, approval]) => ({
    ref,
    party,
    type,
    doc,
    branch,
    due: parseDisplayDate(due),
    priority: pr(priority),
    total: parseAmount(total),
    paid: parseAmount(paid),
    approval: approval.label as Payable["approval"],
  }));
  const payments = (rows: readonly (readonly [string, string, string, string, string, string, string, { label: string; tone: string }])[]): MoneyPayment[] =>
    rows.map(([ref, date, party, refs, method, type, amount, verification]) => {
      const det = UZ_PAYDETAIL[ref];
      const list = refs.split(", ");
      const amt = parseAmount(amount);
      return {
        ref,
        date: parseDisplayDate(date),
        party,
        alloc: det?.alloc ?? (list.length === 1 ? { [list[0]!]: amt } : Object.fromEntries(list.map((x) => [x, 0]))),
        method,
        account: det?.account ?? "",
        payRef: det?.payRef ?? "",
        type: type as MoneyPayment["type"],
        amount: amt,
        verification: { ...(verification as MoneyPayment["verification"]) },
      };
    });
  const plans = (rows: readonly (readonly [string, string, string, string, string, string, string, { label: string; tone: string }])[]): Plan[] =>
    rows.map(([ref, party, target, total, , each, , status]) => {
      const d = UZ_PLANDETAIL[ref] ?? { count: 1, paid: 0, freq: "Monthly", start: "2026-11-10" };
      return { ref, party, target, total: parseAmount(total), each: parseAmount(each), count: d.count, paid: d.paid, freq: d.freq, start: d.start, status: { ...(status as Plan["status"]) } };
    });
  const credits = (rows: readonly (readonly [string, string, string, string, string, string])[]): Credit[] =>
    rows.map(([ref, party, reason, issued, amount, used]) => ({
      ref,
      party,
      reason,
      issued,
      amount: parseAmount(amount),
      used: parseAmount(used),
      currency: "KES",
      expires: UZ_SCDETAIL[ref]?.expires ?? "",
      notes: UZ_SCDETAIL[ref]?.notes ?? "",
      payRef: "",
      voided: false,
    }));
  return {
    receivables,
    payables,
    rcvPayments: payments(RCV_PAYMENT_ROWS),
    payPayments: payments(PAY_PAYMENT_ROWS),
    rcvPlans: plans(RCV_PLAN_ROWS),
    payPlans: plans(PAY_PLAN_ROWS),
    customerCredits: credits(CUSTOMER_CREDIT_ROWS),
    supplierCredits: credits(SUPPLIER_CREDIT_ROWS),
    statement: { from: "2026-01-01", to: "2026-11-10", customer: "All customers" },
  };
}

const NO_DETAIL = { time: "", fee: 0, bankRef: "", notes: "", who: "" };

function seedAccounts(): AccountsState {
  return {
    accounts: ACCOUNT_ROWS.map(([name, provider, number, type, bal]) => {
      const d = UZ_ACCDETAIL[name];
      return {
        name,
        provider,
        number,
        type: type as AccountType,
        balance: parseAmount(bal),
        branch: d?.branch ?? "Nairobi HQ",
        till: d?.till ?? "All tills",
        opening: d?.opening ?? 0,
        bankBranch: d?.branchName ?? "",
        swift: d?.swift ?? "",
        iban: d?.iban ?? "",
        active: d?.active !== false,
      };
    }),
    ledger: UZ_LEDGER.map((e) => ({ ...e, kind: e.kind as LedgerKind })),
    deposits: DEPOSIT_ROWS.map(([ref, d, account, method, description, amount, status]) => ({
      ref, date: parseDisplayDate(d), account, method, description, amount: parseAmount(amount), status: { ...status }, ...(UZ_DEPDETAIL[ref] ?? NO_DETAIL),
    })),
    withdrawals: WITHDRAWAL_ROWS.map(([ref, d, account, method, purpose, description, amount, status]) => ({
      ref, date: parseDisplayDate(d), account, method, purpose, description, amount: parseAmount(amount), status: { ...status }, ...(UZ_WDDETAIL[ref] ?? NO_DETAIL),
    })),
    transfers: MONEY_TRANSFER_ROWS.map(([ref, d, from, to, description, amount, status]) => ({
      ref, date: parseDisplayDate(d), from, to, description, amount: parseAmount(amount), status: { ...status }, ...(UZ_TRDETAIL[ref] ?? NO_DETAIL),
    })),
    banks: [...UZ_BANKS],
  };
}

function seedExpenses(): ExpensesState {
  return {
    expenses: EXPENSE_ROWS.map(([ref, d, category, payee, account, reason, tax, amount, status]) => {
      const x = UZ_EXPDETAIL[ref];
      return {
        ref, date: parseDisplayDate(d), category, payee, account, reason, tax: parseAmount(tax), amount: parseAmount(amount),
        status: status.label as ExpenseStatus, branch: x?.branch ?? "", method: x?.method ?? "Cash", payRef: x?.payRef ?? "", fee: 0,
      };
    }),
    voided: VOIDED_ROWS.map(([ref, d, category, payee, amount, on, by, reason]) => ({
      ref, date: parseDisplayDate(d), category, payee, amount: parseAmount(amount), voidedOn: parseDisplayDate(on), voidedBy: by, reason, voidAccount: "—", branch: "", method: "Cash", payRef: "", fee: 0,
    })),
    recurring: RECURRING_ROWS.map(([ref, name, category, account, amount, , , status]) => {
      const d = UZ_RECDETAIL[ref] ?? { freq: "Monthly" as const, interval: 1, day: "", start: "2026-11-10", end: "", max: "", auto: false, made: 0, payee: "", method: "Cash", tax: 0, reason: "" };
      return { ref, name, category, account, amount: parseAmount(amount), ...d, notes: "", payRef: "", next: "", paused: status.label === "Paused" };
    }),
    categories: Object.entries(UZ_EXPCAT).map(([name, c]) => ({ name, ...c })),
  };
}

function seedCalendar(): CalendarState {
  return {
    events: EVENT_ROWS.map(([date, time, title, type, notes], i) => ({ id: `e${i}`, date, time, endDate: "", endTime: "", address: "", title, type, notes })),
    types: [...CAL_TYPES],
  };
}

function seedDocs(): DocsState {
  return {
    folders: FOLDER_ROWS.map(([id, name, parent, access]) => ({ id, name, parent, access, notes: "" })),
    files: FILE_ROWS.map(([name, folder, size, modified, owner, linked], i) => ({ id: `f${i}`, name, folder, size, modified, owner, linked, notes: "" })),
    starred: [],
  };
}

/** Branches are `UZ_BRANCHES` plus any `UZ_LOC.branches` missing from it (design `setSync`). */
function seedSettings(): SettingsState {
  const branches: Branch[] = UZ_BRANCHES.map((b) => ({ ...b }));
  for (const n of UZ_LOC_BRANCHES) {
    if (!branches.some((b) => b.name === n)) {
      branches.push({ name: n, code: nextCode("BRN", branches), group: UZ_GROUPS[0]?.name ?? "", phone: "", email: "", city: "", address: "", hq: false });
    }
  }
  return {
    biz: { ...UZ_BIZ_FULL },
    groups: UZ_GROUPS.map((g) => ({ ...g })),
    branches,
    pos: { ...UZ_LOCPOS },
    terminals: { ...UZ_TERMS, list: UZ_TERMS.list.map((t) => ({ ...t })) },
    locTypes: [...UZ_LOC_TYPES],
  };
}

/** The design's `_profiles` seed: the role name split into first and last, plus the defaults. */
function seedProfiles(): Record<RoleId, Profile> {
  return Object.fromEntries(
    ROLE_IDS.map((id) => {
      const r = ROLES[id];
      const [first = "", ...rest] = r.name.split(" ");
      return [id, { first, last: rest.join(" "), email: (r.first || "you").toLowerCase() + PROFILE_EMAIL_DOMAIN, ...PROFILE_DEFAULTS }];
    }),
  ) as Record<RoleId, Profile>;
}
