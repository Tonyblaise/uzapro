/**
 * Point of sale commands — the canvas `posVals` handlers and `posApplySale` (feature 010,
 * research R4–R7). All state lives in the in-memory `pos` slice and resets on reload.
 */
import { DEMO_TODAY, addDays, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { DEMO_PIN, POS_SELLER } from "../fixtures/pos";
import { WALK_IN } from "../fixtures/customers";
import { post } from "../ledger";
import { checkoutFigures, isSafaricom, matchCode, posProducts, posTotals, type PosProduct } from "../pos";
import { currentUserName } from "../profile";
import { variantLevels } from "../queries-stock";
import { getStore, showToast } from "../store";
import { posUiDefault } from "../store/seed";
import type { AppState } from "../store/state";
import { KIND, applyStockChanges, type StockChange } from "../store/stockOps";
import type { PosCheckout, PosMethod, PosSaleDoc, PosSettings, PosUi, PosView, Sale, Terminal } from "../types";
import { addReceivable } from "./money";

const DAY_LABEL = "10 Nov 2026";
const ACCOUNT_FOR: Record<"Cash" | "M-Pesa" | "Card", string> = { Cash: "Cash drawer", "M-Pesa": "M-Pesa Till", Card: "Equity Bank — Main" };

const setUi = (fn: (ui: PosUi, s: AppState) => Partial<PosUi>) => getStore().setState((s) => ({ pos: { ...s.pos, ui: { ...s.pos.ui, ...fn(s.pos.ui, s) } } }));
const setCo = (fn: (co: PosCheckout) => Partial<PosCheckout>) => setUi((ui) => ({ co: { ...ui.co, ...fn(ui.co) } }));

/** The terminal the till is open on. */
export function tillTerminal(s: AppState, id = s.pos.ui.termId): Terminal | undefined {
  return s.settings.terminals.list.find((t) => t.id === id);
}

/** Products on the till with stock at the terminal's store (and per-variant stock). */
export function tillProducts(s: AppState): { products: PosProduct[]; variantStock: (product: string, variant: string) => number } {
  const store = tillTerminal(s)?.store ?? "Point of Sale";
  const split = variantLevels(s.stock.movements, s.catalog.products);
  const total = (p: string) => s.stock.levels.filter((l) => l.product === p && l.store === store).reduce((a, l) => a + l.quantity, 0);
  return {
    products: posProducts(s.catalog.products, total),
    variantStock: (p, v) => split(p, store, total(p))[v] ?? 0,
  };
}

let audio: AudioContext | null = null;
/** A short tone (design `beep`); a list of frequencies plays a quick rising chime. */
function beep(settings: PosSettings, notes: number[] = [880]) {
  if (!settings.sound || typeof window === "undefined") return;
  try {
    const A = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!A) return;
    audio ??= new A();
    notes.forEach((hz, i) => {
      const o = audio!.createOscillator();
      const g = audio!.createGain();
      o.frequency.value = hz;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(audio!.destination);
      const at = audio!.currentTime + i * 0.09;
      o.start(at);
      o.stop(at + 0.07);
    });
  } catch {
    /* audio blocked */
  }
}

// ── Launch, shift and PIN ──────────────────────────────────────────────────

export function launchTill(id: number): void {
  const s = getStore().getState();
  const who = currentUserName(s) || POS_SELLER;
  const ui = posUiDefault(id, who);
  getStore().setState((st) => ({
    pos: { ...st.pos, ui: { ...ui, open: true, step: st.pos.shifts[id]?.open ? "pin" : "shift", co: { ...ui.co, notify: { Print: st.pos.settings.autoPrint, SMS: false, Email: false } } } },
  }));
}

export function exitTill(): void {
  setUi(() => ({ open: false, modal: null }));
}

export function continueToPin(): void {
  setUi(() => ({ step: "pin", pin: "", pinErr: "" }));
}

export function setFloatDraft(v: string): void {
  setUi(() => ({ floatDraft: v }));
}

export function openShift(): void {
  const s = getStore().getState();
  const { floatDraft, termId, who } = s.pos.ui;
  const f = Number(floatDraft);
  if (floatDraft.trim() === "" || Number.isNaN(f) || f < 0) {
    showToast("Enter the opening cash. Use 0 if the drawer is empty.");
    return;
  }
  const term = tillTerminal(s);
  getStore().setState((st) => ({
    pos: { ...st.pos, shifts: { ...st.pos.shifts, [termId]: { open: true, by: who, at: demoTime(), date: DAY_LABEL, start: Date.now(), float: f, refs: [] } }, ui: { ...st.pos.ui, step: "pin", pin: "" } },
  }));
  showToast(`Shift opened on ${term?.name ?? "the terminal"}.`);
}

export function pickSeller(name: string): void {
  setUi(() => ({ pinWho: name, pin: "", pinErr: "" }));
}

export function pressPin(key: string): void {
  const s = getStore().getState();
  const { pin, pinWho, termId, shake } = s.pos.ui;
  if (key === "clr") return setUi(() => ({ pin: "", pinErr: "" }));
  if (key === "del") return setUi(() => ({ pin: pin.slice(0, -1), pinErr: "" }));
  if (!/^\d$/.test(key)) return;
  const p = (pin + key).slice(0, 4);
  if (p.length < 4) return setUi(() => ({ pin: p, pinErr: "" }));
  if (p === DEMO_PIN) {
    // A rising two-tone chime when someone logs in at the till (follows the Sound setting).
    beep(s.pos.settings, [660, 990]);
    const shift = s.pos.shifts[termId];
    getStore().setState((st) => ({
      pos: {
        ...st.pos,
        shifts: shift && !shift.start ? { ...st.pos.shifts, [termId]: { ...shift, start: Date.now() } } : st.pos.shifts,
        ui: { ...st.pos.ui, pin: "", pinErr: "", step: "app", who: pinWho },
      },
    }));
    return;
  }
  setUi(() => ({ pin: "", pinErr: "That PIN is wrong. Try again.", shake: shake + 1 }));
}

export function lockTill(): void {
  setUi(() => ({ step: "pin", pin: "", pinErr: "", modal: null }));
}

// ── Navigation ─────────────────────────────────────────────────────────────

export function setPosView(view: PosView): void {
  setUi(() => ({ view, q: "" }));
}

export function setPosQuery(q: string): void {
  setUi((ui) => ({ q, view: ui.view === "shift" || ui.view === "today" ? "sell" : ui.view }));
}

export function setPosCategory(cat: string): void {
  setUi(() => ({ cat }));
}

export function toggleCart(): void {
  setUi((ui) => ({ cartOpen: !ui.cartOpen }));
}

// ── Cart ───────────────────────────────────────────────────────────────────

function addLine(product: string, variant: string, price: number, qty: number) {
  const s = getStore().getState();
  const key = `${product}|${variant}`;
  const cart = s.pos.ui.cart.slice();
  const i = cart.findIndex((l) => l.key === key);
  if (i >= 0) cart[i] = { ...cart[i]!, qty: cart[i]!.qty + qty };
  else cart.push({ key, product, variant, price, qty });
  setUi(() => ({ cart }));
  beep(s.pos.settings);
}

export function tapProduct(name: string): void {
  const p = tillProducts(getStore().getState()).products.find((x) => x.name === name);
  if (!p) return;
  if (p.vs.length > 1) return setUi(() => ({ modal: "variant", varProduct: p.name, varSel: p.vs[0]![0], varQty: "1" }));
  const v = p.vs[0]!;
  addLine(p.name, v[0], v[1] || p.min, 1);
}

export function chooseVariant(v: string): void {
  setUi(() => ({ varSel: v }));
}

export function setVariantQty(q: string): void {
  setUi(() => ({ varQty: q }));
}

export function addVariantToCart(): void {
  const s = getStore().getState();
  const { varProduct, varSel, varQty } = s.pos.ui;
  const p = tillProducts(s).products.find((x) => x.name === varProduct);
  if (!p) return;
  const v = p.vs.find((x) => x[0] === varSel) ?? p.vs[0]!;
  addLine(p.name, v[0], v[1], Math.max(1, Number(varQty) || 1));
  setUi(() => ({ modal: null, varProduct: null }));
}

export function changeLine(i: number, delta: number): void {
  setUi((ui) => {
    const l = ui.cart[i];
    if (!l) return {};
    return { cart: l.qty + delta <= 0 ? ui.cart.filter((_, j) => j !== i) : ui.cart.map((x, j) => (j === i ? { ...x, qty: x.qty + delta } : x)) };
  });
}

export function removeLine(i: number): void {
  setUi((ui) => ({ cart: ui.cart.filter((_, j) => j !== i), noteLine: null }));
}

export function clearCart(): void {
  setUi(() => ({ cart: [], discVal: "", discOpen: false, noteLine: null }));
}

export function setLineNote(i: number, note: string): void {
  setUi((ui) => ({ cart: ui.cart.map((x, j) => (j === i ? { ...x, note } : x)) }));
}

export function toggleNoteLine(i: number): void {
  setUi((ui) => ({ noteLine: ui.noteLine === i ? null : i }));
}

export function setDiscount(v: string): void {
  setUi(() => ({ discVal: v }));
}

export function toggleDiscountType(): void {
  setUi((ui) => ({ discType: ui.discType === "%" ? "KES" : "%" }));
}

export function setDiscountOpen(open: boolean): void {
  setUi(() => ({ discOpen: open }));
}

export function setScan(v: string): void {
  setUi(() => ({ scan: v }));
}

/** Barcode box Enter (design `scanKey`). */
export function scanCode(raw: string): void {
  const code = raw.trim();
  if (!code) return;
  const hit = matchCode(code, tillProducts(getStore().getState()).products);
  if (!hit) {
    showToast(`No product matches "${raw}".`);
    return;
  }
  setUi(() => ({ scan: "" }));
  if (!hit.variant) return setUi(() => ({ modal: "variant", varProduct: hit.product.name, varSel: hit.product.vs[0]![0], varQty: "1" }));
  addLine(hit.product.name, hit.variant[0], hit.variant[1] || hit.product.min, 1);
}

// ── Hold and resume ────────────────────────────────────────────────────────

export function holdSale(): void {
  const { ui } = getStore().getState().pos;
  if (!ui.cart.length) return;
  getStore().setState((s) => ({ pos: { ...s.pos, held: [{ cust: ui.cust, cart: ui.cart, at: demoTime() }, ...s.pos.held], ui: { ...s.pos.ui, cart: [], cust: WALK_IN, discVal: "" } } }));
  showToast("Sale put on hold. Find it under Orders.");
}

export function resumeHeld(i: number): void {
  const h = getStore().getState().pos.held[i];
  if (!h) return;
  getStore().setState((s) => ({ pos: { ...s.pos, held: s.pos.held.filter((_, j) => j !== i), ui: { ...s.pos.ui, cart: h.cart, cust: h.cust, view: "sell" } } }));
  showToast("Sale resumed.");
}

export function discardHeld(i: number): void {
  getStore().setState((s) => ({ pos: { ...s.pos, held: s.pos.held.filter((_, j) => j !== i) } }));
}

// ── Customers ──────────────────────────────────────────────────────────────

export function openCustomerPicker(): void {
  setUi(() => ({ modal: "customer", cq: "" }));
}

export function setCustomerQuery(q: string): void {
  setUi(() => ({ cq: q }));
}

export function pickCustomer(name: string): void {
  setUi((ui) => ({ cust: name, modal: null, view: ui.view === "customers" ? "sell" : ui.view }));
}

export function openNewCustomer(): void {
  setUi(() => ({ modal: "newcust", nc: { name: "", phone: "" }, ncErr: "" }));
}

export function setNewCustomer(patch: Partial<PosUi["nc"]>): void {
  setUi((ui) => ({ nc: { ...ui.nc, ...patch }, ncErr: "" }));
}

export function saveNewCustomer(): void {
  const s = getStore().getState();
  const name = s.pos.ui.nc.name.trim();
  if (!name) return setUi(() => ({ ncErr: "Enter the customer's name." }));
  if (s.customers.some((c) => c.name.toLowerCase() === name.toLowerCase())) return setUi(() => ({ ncErr: "A customer with this name already exists." }));
  getStore().setState((st) => ({ customers: [{ name, phone: st.pos.ui.nc.phone.trim() || "—", email: "—", address: "—", status: { label: "Active", tone: "success" } }, ...st.customers] }));
  pickCustomer(name);
  showToast(`${name} added to customers.`);
}

// ── Checkout ───────────────────────────────────────────────────────────────

export function charge(): void {
  const s = getStore().getState();
  const { ui } = s.pos;
  if (!ui.cart.length) return;
  const phone = s.customers.find((c) => c.name === ui.cust)?.phone;
  setUi(() => ({ modal: "checkout", co: { ...ui.co, pays: [], method: "Cash", amt: null, ref: "", mpesa: "", err: "", phone: phone && phone !== "—" ? phone : "" } }));
}

export function setPayMethod(method: PosMethod): void {
  setCo(() => ({ method, amt: null, ref: "", mpesa: "", err: "" }));
}

export function setPayAmount(v: string): void {
  setCo(() => ({ amt: v, err: "" }));
}

export function pressCashKey(k: string): void {
  setCo((co) => {
    const cur = co.amt ?? "";
    return { amt: k === "del" ? cur.slice(0, -1) : (cur === "0" ? "" : cur) + k, err: "" };
  });
}

export function setPayRef(v: string): void {
  setCo(() => ({ ref: v }));
}

export function setPayPhone(v: string): void {
  setCo(() => ({ phone: v }));
}

export function setSaleNote(v: string): void {
  setCo(() => ({ note: v }));
}

export function toggleNotify(k: keyof PosCheckout["notify"]): void {
  setCo((co) => ({ notify: { ...co.notify, [k]: !co.notify[k] } }));
}

/** Simulated M-Pesa request: waits 1.8s, then fills in a code (nothing is sent). */
export function requestMpesa(): void {
  const { co } = getStore().getState().pos.ui;
  if (!isSafaricom(co.phone)) return setCo(() => ({ err: "Enter the customer's Safaricom number, for example 0712 345 678." }));
  setCo(() => ({ mpesa: "waiting", err: "" }));
  setTimeout(() => {
    const code = `S${Math.random().toString(36).slice(2, 11).toUpperCase().padEnd(9, "X")}`;
    setCo(() => ({ mpesa: "paid", ref: code }));
  }, 1800);
}

function figures(s: AppState) {
  const { ui } = s.pos;
  const t = posTotals(ui.cart, ui.discVal, ui.discType);
  return { t, f: checkoutFigures(ui.co, t.total, ui.cust === WALK_IN) };
}

export function addPartPayment(): void {
  const s = getStore().getState();
  const { co } = s.pos.ui;
  const { f } = figures(s);
  if (!f.canSplit || co.method === "Credit") return;
  setCo(() => ({ pays: [...co.pays, { method: co.method as "Cash" | "M-Pesa" | "Card", amount: f.amt, ref: co.ref.trim() || "—" }], amt: null, ref: "", mpesa: "", method: co.method === "Cash" ? "M-Pesa" : "Cash", err: "" }));
}

export function removePayment(i: number): void {
  setCo((co) => ({ pays: co.pays.filter((_, j) => j !== i), amt: null }));
}

/** Complete the sale (design `complete` + `posApplySale`). */
export function completePosSale(): string | null {
  const s = getStore().getState();
  const { ui } = s.pos;
  const { co } = ui;
  const { t, f } = figures(s);
  const walkIn = ui.cust === WALK_IN;
  if (f.isCredit && walkIn) {
    setCo(() => ({ err: "Pick a named customer to sell on credit." }));
    return null;
  }
  if (!f.isCredit && !f.isCash && f.amt > f.remaining + 0.001) {
    setCo(() => ({ err: `${co.method} payment can't be more than what is due.` }));
    return null;
  }
  if (!f.covered) {
    setCo(() => ({ err: `KES ${(t.total - f.totalPaid).toLocaleString("en-KE", { minimumFractionDigits: 2 })} is still due. Add another payment or pay the full amount.` }));
    return null;
  }
  const term = tillTerminal(s);
  const store = term?.store ?? "Point of Sale";
  const hm = demoTime();
  const when = `${DAY_LABEL}, ${hm}`;
  const pays = [...co.pays, ...(!f.isCredit && f.entryAmt > 0 ? [{ method: co.method as "Cash" | "M-Pesa" | "Card", amount: f.entryAmt, ref: co.ref.trim() || "—" }] : [])].map((p) => ({ ...p, date: when }));
  const saleNo = s.sales.saleNo + 1;
  const ref = `SAL-${String(saleNo).padStart(6, "0")}`;
  const doc: PosSaleDoc = {
    ref,
    date: DEMO_TODAY,
    time: hm,
    cust: ui.cust,
    store,
    term: ui.termId,
    lines: ui.cart.map((l) => ({ product: l.product, variant: l.variant, unit: "Piece", qty: l.qty, price: l.price, ...(l.note?.trim() ? { note: l.note.trim() } : {}) })),
    subtotal: t.sub,
    vat: t.vat,
    disc: t.disc,
    total: t.total,
    ...(co.note.trim() ? { note: co.note.trim() } : {}),
    pays,
    who: ui.who,
    tendered: f.isCash ? f.amt : 0,
    change: f.change,
  };
  const sale: Sale = {
    ref,
    customer: ui.cust,
    type: "POS sale",
    channel: "POS",
    store,
    date: DEMO_TODAY,
    time: hm,
    lines: doc.lines.map((l) => ({ product: l.product, variant: l.variant, unit: l.unit, qty: l.qty, price: l.price, taxable: true })),
    payments: pays.map((p) => ({ method: p.method, ref: p.ref, date: when, amount: p.amount })),
    subtotal: t.sub,
    vat: t.vat,
    total: t.total,
    status: f.creditPart ? { label: "Unpaid", tone: "warning" } : { label: "Paid", tone: "success" },
    by: ui.who,
    session: true,
  };
  const changes: StockChange[] = doc.lines.map((l) => ({ product: l.product, variant: l.variant, store, change: -l.qty, kind: KIND.sold, ref, by: ui.who }));
  getStore().setState((st) => {
    let next: AppState = { ...st, ...applyStockChanges(st, changes), sales: { ...st.sales, sales: [sale, ...st.sales.sales], saleNo } };
    for (const p of pays) next = post(next, { date: DEMO_TODAY, account: ACCOUNT_FOR[p.method], ref, desc: `POS sale, ${term?.name ?? "Terminal"}`, kind: "Sale", amt: p.amount });
    if (f.creditPart > 0) next = { ...next, money: addReceivable(next, { party: ui.cust, type: "Sale on credit", doc: ref, due: addDays(DEMO_TODAY, 30), total: f.creditPart }).money };
    const shift = next.pos.shifts[ui.termId];
    return {
      ...next,
      pos: {
        ...next.pos,
        docs: { ...next.pos.docs, [ref]: doc },
        shifts: shift ? { ...next.pos.shifts, [ui.termId]: { ...shift, refs: [ref, ...shift.refs] } } : next.pos.shifts,
        ui: {
          ...next.pos.ui,
          cart: [],
          discVal: "",
          discOpen: false,
          noteLine: null,
          cust: WALK_IN,
          cartOpen: false,
          modal: "receipt",
          rcpt: ref,
          fresh: true,
          co: { ...next.pos.ui.co, pays: [], amt: null, ref: "", mpesa: "", note: "", err: "", notify: { Print: next.pos.settings.autoPrint, SMS: false, Email: false } },
        },
      },
    };
  });
  const sent = (["SMS", "Email"] as const).filter((k) => co.notify[k]);
  if (sent.length) showToast(`Receipt sent by ${sent.join(" and ")}.`);
  if (co.notify.Print) setTimeout(() => showToast("Receipt printing…"), 400);
  return ref;
}

// ── Receipt and dialogs ────────────────────────────────────────────────────

export function openReceipt(ref: string): void {
  setUi(() => ({ modal: "receipt", rcpt: ref, fresh: false }));
}

export function closeModal(): void {
  setUi(() => ({ modal: null, varProduct: null }));
}

export function receiptNext(): void {
  const s = getStore().getState();
  setUi((ui) => ({ modal: ui.fresh && s.pos.settings.askCust ? "customer" : null, cq: "", view: "sell" }));
}

export function printReceipt(): void {
  showToast("Receipt sent to the printer.");
}

export function sendReceipt(): void {
  showToast("Receipt sent to the customer.");
}

// ── Close shift ────────────────────────────────────────────────────────────

export function askCloseShift(): void {
  setUi(() => ({ modal: "close", count: "", closeNote: "", clErr: "" }));
}

export function setCloseCount(v: string): void {
  setUi(() => ({ count: v, clErr: "" }));
}

export function setCloseNote(v: string): void {
  setUi(() => ({ closeNote: v }));
}

export function confirmCloseShift(expected: number): void {
  const s = getStore().getState();
  const { count, termId } = s.pos.ui;
  if (count === "" || Number.isNaN(Number(count))) return setUi(() => ({ clErr: "Enter the cash you counted." }));
  const diff = Number(count) - expected;
  const term = tillTerminal(s);
  getStore().setState((st) => ({
    pos: {
      ...st.pos,
      shifts: { ...st.pos.shifts, [termId]: { open: false, closedAt: `${DAY_LABEL}, ${demoTime()}`, lastCount: Number(count), lastDiff: diff, refs: [] } },
      ui: { ...st.pos.ui, open: false, modal: null, step: "shift" },
    },
  }));
  const tail = Math.abs(diff) < 0.01 ? "The drawer balanced." : `${diff > 0 ? "Over by" : "Short by"} KES ${Math.abs(diff).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
  showToast(`${term?.name ?? "Terminal"} shift closed. ${tail}`);
}

// ── Settings ───────────────────────────────────────────────────────────────

const setSettings = (fn: (st: PosSettings) => Partial<PosSettings>) => getStore().setState((s) => ({ pos: { ...s.pos, settings: { ...s.pos.settings, ...fn(s.pos.settings) } } }));

export function openPosSettings(): void {
  setUi(() => ({ modal: "settings", qnDraft: "" }));
}

export function togglePosSetting(k: Exclude<keyof PosSettings, "qn">): void {
  setSettings((st) => ({ [k]: !st[k] }));
}

export function setQuickNoteDraft(v: string): void {
  setUi(() => ({ qnDraft: v }));
}

export function addQuickNote(): void {
  const n = getStore().getState().pos.ui.qnDraft.trim();
  if (n) setSettings((st) => (st.qn.includes(n) ? {} : { qn: [...st.qn, n] }));
  setUi(() => ({ qnDraft: "" }));
}

export function removeQuickNote(i: number): void {
  setSettings((st) => ({ qn: st.qn.filter((_, j) => j !== i) }));
}

/** Display date for receipts. */
export const posReceiptDate = (iso: string, time: string) => `${fmtDate(iso)} ${time}`;
