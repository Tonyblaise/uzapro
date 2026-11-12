"use client";
/** The till's dialogs (design `mVar`, `mCust`, `mNewCust`, `mPay`, `mRcpt`, `mSet`, `mClose`). */
import {
  WALK_IN,
  addPartPayment,
  addQuickNote,
  addVariantToCart,
  checkoutFigures,
  chooseVariant,
  closeDiff,
  closeModal,
  completePosSale,
  confirmCloseShift,
  expectedCash,
  initialsOf,
  openNewCustomer,
  pickCustomer,
  posK,
  posK0,
  posMoney,
  posReceiptDate,
  posTotals,
  pressCashKey,
  printReceipt,
  quickCash,
  receiptNext,
  removePayment,
  removeQuickNote,
  requestMpesa,
  saveNewCustomer,
  sendReceipt,
  setCloseCount,
  setCloseNote,
  setCustomerQuery,
  setNewCustomer,
  setPayAmount,
  setPayMethod,
  setPayPhone,
  setPayRef,
  setQuickNoteDraft,
  setSaleNote,
  setVariantQty,
  toggleNotify,
  togglePosSetting,
  useBusinessProfile,
  useCustomers,
  usePos,
  usePosTill,
  useReceivables,
  type PosMethod,
  type PosSettings,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Field";
import { useDialog } from "@/components/ui/Overlay";
import { Eyebrow, PosDialog } from "./shared";

export function Dialogs() {
  const { ui } = usePos();
  switch (ui.modal) {
    case "variant":
      return <VariantDialog />;
    case "customer":
      return <CustomerDialog />;
    case "newcust":
      return <NewCustomerDialog />;
    case "checkout":
      return <CheckoutDialog />;
    case "receipt":
      return <ReceiptDialog />;
    case "settings":
      return <SettingsDrawer />;
    case "close":
      return <CloseShiftDialog />;
    default:
      return null;
  }
}

function VariantDialog() {
  const { ui } = usePos();
  const { products, variantStock } = usePosTill();
  const p = products.find((x) => x.name === ui.varProduct);
  if (!p) return null;
  const qty = Math.max(1, Number(ui.varQty) || 1);
  const sel = p.vs.find((v) => v[0] === ui.varSel) ?? p.vs[0]!;
  return (
    <PosDialog
      title={p.name}
      sub="Choose a variant"
      onClose={closeModal}
      footer={
        <>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button icon="plus" disabled={!ui.varSel} onClick={addVariantToCart}>
            Add {qty} · {posK(sel[1] * qty)}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 px-6 py-5">
        {p.vs.map((v) => {
          const on = v[0] === ui.varSel;
          const sk = variantStock(p.name, v[0]);
          return (
            <button key={v[0]} type="button" aria-pressed={on} onClick={() => chooseVariant(v[0])} className={`flex items-center gap-3 rounded-[14px] border-2 px-4 py-3.5 text-left ${on ? "border-green-600 bg-green-50" : "border-border bg-surface"}`}>
              <span className="flex-1">
                <span className="type-label block text-text">{v[0]}</span>
                <span className={`type-caption block ${sk > 0 ? "text-text-muted" : "text-warning-text"}`}>{sk > 0 ? `${sk} in stock here` : "None in stock here"}</span>
              </span>
              <span className="type-title u-num">{posK(v[1])}</span>
            </button>
          );
        })}
        <div className="mt-2 flex items-center justify-between">
          <span className="type-label">Quantity</span>
          <span className="flex items-center gap-2.5">
            <button type="button" aria-label="Fewer" onClick={() => setVariantQty(String(Math.max(1, qty - 1)))} className="grid size-9 place-items-center rounded-full border border-border bg-surface">
              <Icon name="minus" size={16} />
            </button>
            <input type="number" min={1} aria-label="Quantity" value={ui.varQty} onChange={(e) => setVariantQty(e.target.value)} className="h-10 w-16 rounded-[10px] border-[1.5px] border-green-200 text-center text-[18px] font-bold" />
            <button type="button" aria-label="More" onClick={() => setVariantQty(String(qty + 1))} className="grid size-9 place-items-center rounded-full border-0 bg-green-700 text-white">
              <Icon name="plus" size={16} />
            </button>
          </span>
        </div>
      </div>
    </PosDialog>
  );
}

function useOwes() {
  const rcv = useReceivables();
  return (n: string) => rcv.filter((r) => r.party === n).reduce((a, r) => a + r.balance, 0);
}

function CustomerDialog() {
  const { ui } = usePos();
  const customers = useCustomers();
  const owes = useOwes();
  const cq = ui.cq.trim().toLowerCase();
  const list = customers.filter((c) => c.name !== WALK_IN && (!cq || `${c.name} ${c.phone}`.toLowerCase().includes(cq)));
  return (
    <PosDialog
      title="Who is this sale for?"
      sub="Search, pick a regular or add someone new"
      width={560}
      onClose={closeModal}
      footer={
        <div className="flex w-full justify-between gap-2">
          <Button variant="secondary" icon="plus" onClick={openNewCustomer}>
            New customer
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 px-6 py-4">
        <Input icon="search" placeholder="Name or phone number" aria-label="Search customers" value={ui.cq} onChange={(e) => setCustomerQuery(e.target.value)} />
        <button type="button" onClick={() => pickCustomer(WALK_IN)} className="flex items-center gap-3 rounded-[14px] border-2 border-green-200 bg-green-50 px-3.5 py-3 text-left">
          <span aria-hidden="true" className="grid size-[38px] place-items-center rounded-full bg-surface text-green-800">
            <Icon name="user" size={18} />
          </span>
          <span>
            <span className="type-label block text-text">Walk-in customer</span>
            <span className="type-caption block text-text-secondary">No name needed</span>
          </span>
        </button>
        {list.map((c) => {
          const o = owes(c.name);
          return (
            <button key={c.name} type="button" onClick={() => pickCustomer(c.name)} className="flex items-center gap-3 rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-left">
              <span aria-hidden="true" className="type-small grid size-[34px] place-items-center rounded-full bg-canvas font-bold">
                {initialsOf(c.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text">{c.name}</span>
                <span className="type-caption block text-text-secondary">{c.phone && c.phone !== "—" ? c.phone : "No phone"}</span>
              </span>
              <span className={`type-caption ${o ? "text-warning-text" : "text-text-muted"}`}>{o ? `Owes ${posK0(o)}` : "Nothing owed"}</span>
            </button>
          );
        })}
        {!list.length && <div className="type-small p-3 text-center text-text-muted">No one matches. Add them as a new customer.</div>}
      </div>
    </PosDialog>
  );
}

function NewCustomerDialog() {
  const { ui } = usePos();
  return (
    <PosDialog
      title="New customer"
      sub="They are added to your customer list"
      width={460}
      onClose={closeModal}
      footer={
        <>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button icon="check" onClick={saveNewCustomer}>
            Save and select
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <Input label="Name" placeholder="For example, Grace Wanjiru" value={ui.nc.name} onChange={(e) => setNewCustomer({ name: e.target.value })} />
        <Input label="Phone number" placeholder="07XX XXX XXX" value={ui.nc.phone} onChange={(e) => setNewCustomer({ phone: e.target.value })} />
        {ui.ncErr && (
          <div role="alert" className="type-small text-danger-text">
            {ui.ncErr}
          </div>
        )}
      </div>
    </PosDialog>
  );
}

const METHODS: [PosMethod, string, IconName, string, string][] = [
  ["Cash", "Cash", "banknote", "var(--pos-tint-1)", "var(--pos-ink-1)"],
  ["M-Pesa", "M-Pesa", "smartphone", "var(--pos-mpesa)", "var(--pos-mpesa-ink)"],
  ["Card", "Card", "credit-card", "var(--pos-card)", "var(--pos-card-ink)"],
  ["Credit", "Pay later", "calendar", "var(--pos-tint-3)", "var(--pos-ink-3)"],
];
const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"];

function CheckoutDialog() {
  const { ui } = usePos();
  const { co } = ui;
  const t = posTotals(ui.cart, ui.discVal, ui.discType);
  const walkIn = ui.cust === WALK_IN;
  const f = checkoutFigures(co, t.total, walkIn);
  const owing = t.total - f.totalPaid - f.creditPart > 0.001;
  return (
    <PosDialog title="Checkout" sub={`${t.count} ${t.count === 1 ? "item" : "items"} · ${ui.cust}`} width={920} onClose={closeModal}>
      <div className="uz-co grid min-h-0" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.25fr)" }}>
        <div className="flex flex-col gap-4 border-r border-border bg-canvas px-6 py-5">
          <div>
            <Eyebrow>Amount due</Eyebrow>
            <div className="u-num mt-1.5 text-[36px] font-extrabold leading-[1.1] tracking-[-0.02em] text-text">{posK(t.total)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[12px] border border-border bg-surface px-3 py-2.5">
              <Eyebrow>Paid</Eyebrow>
              <div className="type-title u-num text-green-800">{posK(f.totalPaid)}</div>
            </div>
            <div className="rounded-[12px] border border-border bg-surface px-3 py-2.5">
              <Eyebrow>{owing ? "Still due" : "Due"}</Eyebrow>
              <div className={`type-title u-num ${owing ? "text-danger-text" : "text-green-800"}`}>{posK(f.due)}</div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Eyebrow>Items</Eyebrow>
            {ui.cart.map((l) => (
              <div key={l.key} className="type-small flex justify-between gap-2 text-text">
                <span>
                  {l.qty} × {l.product}
                  {l.variant && l.variant !== "Standard" ? ` (${l.variant})` : ""}
                </span>
                <span className="u-num">{posMoney(l.price * l.qty)}</span>
              </div>
            ))}
            {t.disc > 0 && (
              <div className="type-small flex justify-between gap-2 text-text">
                <span>− × Discount</span>
                <span className="u-num">−{posMoney(t.disc)}</span>
              </div>
            )}
          </div>
          {co.pays.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Eyebrow>Payments added</Eyebrow>
              {co.pays.map((p, i) => (
                <div key={i} className="type-small flex items-center gap-2 rounded-[10px] border border-border bg-surface px-2.5 py-2">
                  <span className="flex-1">
                    <strong>{p.method}</strong> <span className="text-text-muted">{p.ref !== "—" ? p.ref : ""}</span>
                  </span>
                  <span className="u-num font-semibold">{posK(p.amount)}</span>
                  <button type="button" aria-label="Remove payment" onClick={() => removePayment(i)} className="grid place-items-center border-0 bg-transparent text-text-muted">
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex flex-col gap-1">
            <span className="type-eyebrow text-text-muted">Sale note</span>
            <textarea rows={2} placeholder="Optional, prints on the receipt" value={co.note} onChange={(e) => setSaleNote(e.target.value)} className="type-body w-full resize-y rounded-[10px] border border-border-strong bg-surface px-2.5 py-2" />
          </label>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          <Eyebrow>Pay with</Eyebrow>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Pay with">
            {METHODS.map(([k, label, icon, bg, ink]) => {
              const on = co.method === k;
              return (
                <button key={k} type="button" aria-pressed={on} onClick={() => setPayMethod(k)} className="type-label flex flex-col items-center gap-1.5 rounded-[14px] border-2 px-1.5 pb-3 pt-3.5 text-text" style={{ borderColor: on ? ink : "var(--border)", background: on ? bg : "var(--surface)" }}>
                  <span aria-hidden="true" className="grid size-9 place-items-center rounded-[10px]" style={{ background: bg, color: ink }}>
                    <Icon name={icon} size={18} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
          {f.isCredit && (
            <div className={`type-small rounded-[12px] px-4 py-3 ${walkIn ? "bg-danger-soft text-danger-text" : "bg-warning-soft text-warning-text"}`}>
              {walkIn ? "Pick a named customer first. Walk-in customers can't buy on credit." : `${posK(f.remaining)} will be added to ${ui.cust}'s balance in Receivables, due in 30 days.`}
            </div>
          )}
          {!f.isCredit && (
            <>
              <label className="flex flex-col gap-1">
                <span className="type-label">{f.isCash ? "Cash received" : `${co.method} amount`}</span>
                <span className="flex items-center overflow-hidden rounded-[12px] border-[1.5px] border-green-200">
                  <span className="type-label grid self-stretch place-items-center bg-canvas px-3 text-text-muted">KES</span>
                  <input type="number" min={0} aria-label="Amount" value={f.amtStr} onChange={(e) => setPayAmount(e.target.value)} className="u-num min-w-0 flex-1 border-0 p-3 text-[22px] font-bold outline-none" />
                </span>
              </label>
              {f.isCash && (
                <>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PAD.map((k) => (
                      <button key={k} type="button" aria-label={k === "del" ? "Delete digit" : k} onClick={() => pressCashKey(k)} className={`uz-key h-[42px] rounded-[10px] border border-border text-[17px] font-semibold text-text ${k === "del" ? "bg-canvas" : "bg-surface"}`}>
                        {k === "del" ? "⌫" : k}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickCash(f.remaining).map((q) => (
                      <button key={q.label} type="button" onClick={() => setPayAmount(String(q.value))} className="type-small u-num rounded-[10px] border border-border bg-canvas px-3 py-2 font-bold">
                        {q.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {co.method === "M-Pesa" && (
                <div className="flex flex-col gap-2 rounded-[12px] border border-green-200 bg-green-50 p-3">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[180px] flex-1">
                      <Input label="Customer's phone" placeholder="07XX XXX XXX" value={co.phone} onChange={(e) => setPayPhone(e.target.value)} />
                    </div>
                    <Button icon="smartphone" disabled={co.mpesa === "waiting"} onClick={requestMpesa}>
                      {co.mpesa === "waiting" ? "Waiting…" : co.mpesa === "paid" ? "Send again" : "Send request"}
                    </Button>
                  </div>
                  <div className={`type-small ${co.mpesa === "paid" ? "text-green-800" : "text-text-secondary"}`} aria-live="polite">
                    {co.mpesa === "waiting"
                      ? "Request sent. Ask the customer to enter their M-Pesa PIN on their phone."
                      : co.mpesa === "paid"
                        ? `Payment received. Code ${co.ref} added below.`
                        : "Send a payment request to the customer's phone, or type the M-Pesa code yourself."}
                  </div>
                </div>
              )}
              {!f.isCash && (
                <Input
                  label={co.method === "M-Pesa" ? "M-Pesa code" : "Card reference (optional)"}
                  placeholder={co.method === "M-Pesa" ? "For example, SKA1B2C3D4" : "Last 4 digits or approval code"}
                  value={co.ref}
                  onChange={(e) => setPayRef(e.target.value)}
                />
              )}
              {f.canSplit && (
                <button type="button" onClick={addPartPayment} className="type-label inline-flex items-center gap-1 self-start border-0 bg-transparent p-0 text-green-700">
                  <Icon name="plus" size={14} />
                  Add as part payment and split the rest
                </button>
              )}
            </>
          )}
          {f.change > 0 && (
            <div className="flex items-baseline justify-between rounded-[12px] border border-green-200 bg-green-50 px-4 py-3">
              <span className="type-label text-green-800">Give change</span>
              <span className="u-num text-[24px] font-extrabold text-green-800">{posK(f.change)}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-eyebrow text-text-muted">Send receipt</span>
            <span className="flex-1" />
            {(
              [
                ["Print", "printer"],
                ["SMS", "smartphone"],
                ["Email", "mail"],
              ] as const
            ).map(([k, icon]) => {
              const on = co.notify[k];
              return (
                <button key={k} type="button" aria-pressed={on} onClick={() => toggleNotify(k)} className={`type-small inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1.5 font-semibold ${on ? "border-green-600 bg-green-50 text-green-800" : "border-border bg-surface text-text-secondary"}`}>
                  <Icon name={icon} size={14} />
                  {k}
                </button>
              );
            })}
          </div>
          {co.err && (
            <div role="alert" className="type-small text-danger-text">
              {co.err}
            </div>
          )}
          <button
            type="button"
            onClick={() => completePosSale()}
            className="mt-auto flex h-14 items-center justify-between rounded-[14px] border-0 px-5 text-[17px] font-bold text-white"
            style={{ background: f.covered ? "linear-gradient(135deg,var(--green-500),var(--green-700))" : "var(--green-200)" }}
          >
            {f.isCredit ? "Complete on credit" : f.covered ? "Complete sale" : "Take payment first"}
            <span className="u-num">{posK(t.total)}</span>
          </button>
        </div>
      </div>
    </PosDialog>
  );
}

function ReceiptDialog() {
  const { ui, docs } = usePos();
  const { term } = usePosTill();
  const biz = useBusinessProfile();
  const rd = ui.rcpt ? docs[ui.rcpt] : undefined;
  if (!rd) return null;
  const sums: [string, number, boolean?][] = [["Subtotal", rd.subtotal], ...(rd.disc ? ([["Discount", -rd.disc]] as [string, number][]) : []), ["VAT 16%", rd.vat], ["TOTAL", rd.total, true]];
  const pays = rd.pays.length ? rd.pays.map((p) => [`${p.method}${p.ref && p.ref !== "—" ? ` ${p.ref}` : ""}`, p.amount] as [string, number]) : [["On credit (pay later)", rd.total] as [string, number]];
  if (rd.tendered && rd.change) pays.push(["Cash given", rd.tendered], ["Change", rd.change]);
  const addr = [biz.address, biz.city].filter(Boolean).join(", ") || "Nairobi";
  return (
    <PosDialog title={ui.fresh ? "Sale complete" : `Receipt ${rd.ref}`} width={460} onClose={closeModal}>
      <div className="flex flex-col items-center gap-1.5 px-6 pt-5 text-center">
        {ui.fresh && (
          <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-green-50 text-green-700">
            <Icon name="circle-check" size={30} />
          </span>
        )}
        {ui.fresh && rd.change > 0 && (
          <div className="type-body text-green-800">
            Give change: <strong>{posK(rd.change)}</strong>
          </div>
        )}
      </div>
      <div className="mx-6 my-4 rounded-[12px] border border-dashed border-border-strong bg-[var(--receipt-paper)] px-5 py-4 font-mono text-[13px] leading-[1.55] text-[var(--receipt-ink)]">
        <div className="text-center text-[15px] font-bold">{biz.name || "UzaPro"}</div>
        <div className="text-center text-[var(--receipt-muted)]">{addr}</div>
        <div className="mb-2 text-center text-[var(--receipt-muted)]">
          {term?.name} · Served by {rd.who}
        </div>
        <div className="flex justify-between border-t border-dashed border-[var(--receipt-rule)] pt-1.5">
          <span>{rd.ref}</span>
          <span>{posReceiptDate(rd.date, rd.time)}</span>
        </div>
        <div className="mb-1.5">Customer: {rd.cust}</div>
        {rd.lines.map((l, i) => (
          <div key={i}>
            <div className="flex justify-between gap-2">
              <span>
                {l.qty} × {l.product}
                {l.variant && l.variant !== "Standard" ? ` ${l.variant}` : ""}
              </span>
              <span>{posMoney(l.price * l.qty)}</span>
            </div>
            {l.note && <div className="pl-4 text-[var(--receipt-muted)]">– {l.note}</div>}
          </div>
        ))}
        <div className="mt-1.5 border-t border-dashed border-[var(--receipt-rule)] pt-1.5">
          {sums.map(([l, v, b]) => (
            <div key={l} className={`flex justify-between ${b ? "font-bold" : ""}`}>
              <span>{l}</span>
              <span>
                {v < 0 ? "−" : ""}
                {posMoney(Math.abs(v))}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 border-t border-dashed border-[var(--receipt-rule)] pt-1.5">
          {pays.map(([l, v]) => (
            <div key={l} className="flex justify-between">
              <span>{l}</span>
              <span>{posMoney(v)}</span>
            </div>
          ))}
        </div>
        {rd.note && <div className="mt-1.5 text-[var(--receipt-muted)]">Note: {rd.note}</div>}
        <div className="mt-2.5 text-center text-[var(--receipt-muted)]">
          Prices include VAT at 16%.
          <br />
          Thank you for shopping with us.
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-6 pb-5">
        <Button variant="secondary" icon="printer" onClick={printReceipt}>
          Print
        </Button>
        <Button variant="secondary" icon="smartphone" onClick={sendReceipt}>
          Send
        </Button>
        <span className="flex-1" />
        <Button icon="plus" onClick={receiptNext}>
          {ui.fresh ? "New sale" : "Done"}
        </Button>
      </div>
    </PosDialog>
  );
}

const SETTING_ROWS: [Exclude<keyof PosSettings, "qn">, string, string, IconName][] = [
  ["sound", "Sound", "Beep when an item is added", "bell"],
  ["stock", "Show stock on products", "How many are left at this till", "boxes"],
  ["scan", "Barcode box", "Scan or type product codes in the cart", "scan-barcode"],
  ["notes", "Item notes", 'Add notes like "Gift wrap" to cart items', "pencil"],
  ["autoPrint", "Print receipts", "Print a receipt for every sale by default", "printer"],
  ["askCust", "Ask who each sale is for", "Open the customer picker after every sale", "users"],
];

function SettingsDrawer() {
  const { ui, settings } = usePos();
  const { term } = usePosTill();
  const ref = useDialog(true, closeModal);
  return (
    <>
      <div className="fixed inset-0 z-[var(--z-till-dialog)] bg-[var(--pos-scrim)]" onClick={closeModal} aria-hidden="true" />
      <aside ref={ref} role="dialog" aria-modal="true" aria-label="Terminal settings" className="fixed inset-y-0 right-0 z-[var(--z-till-drawer)] flex w-[min(440px,100vw)] flex-col bg-[linear-gradient(180deg,var(--green-50),var(--surface)_200px)] shadow-[var(--shadow-panel)]">
        <div className="flex items-start gap-3 p-5">
          <div className="flex-1">
            <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.01em] text-text">Terminal settings</h2>
            <div className="type-small text-text-secondary">Saved for {term?.name} in this session</div>
          </div>
          <IconButton icon="x" size="sm" label="Close" data-close onClick={closeModal} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-auto px-5 pb-5">
          {SETTING_ROWS.map(([k, label, sub, icon]) => (
            <label key={k} className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-border bg-surface px-3.5 py-3">
              <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-[10px] bg-green-50 text-green-700">
                <Icon name={icon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text">{label}</span>
                <span className="type-caption block text-text-muted">{sub}</span>
              </span>
              <input type="checkbox" role="switch" aria-checked={settings[k]} checked={settings[k]} onChange={() => togglePosSetting(k)} className="uz-switch" aria-label={label} />
            </label>
          ))}
          <div className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-surface p-3.5">
            <div>
              <div className="type-label text-text">Quick item notes</div>
              <div className="type-caption text-text-muted">Tap to add them to a cart item, like &quot;Gift wrap&quot;</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {settings.qn.map((n, i) => (
                <span key={n} className="type-small inline-flex items-center gap-1 rounded-pill border border-border bg-canvas py-1 pl-2.5 pr-1.5">
                  {n}
                  <button type="button" aria-label={`Remove note ${n}`} onClick={() => removeQuickNote(i)} className="grid place-items-center border-0 bg-transparent p-0.5 text-text-muted">
                    <Icon name="x" size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New note, for example No box"
                aria-label="New quick note"
                value={ui.qnDraft}
                onChange={(e) => setQuickNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addQuickNote();
                  }
                }}
                className="type-body min-w-0 flex-1 rounded-[10px] border border-border-strong px-3 py-2"
              />
              <IconButton icon="plus" label="Add note" variant="secondary" onClick={addQuickNote} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function CloseShiftDialog() {
  const { ui } = usePos();
  const { term, shift, shiftDocs } = usePosTill();
  const expected = expectedCash(shift ?? { float: 0 }, shiftDocs);
  const d = closeDiff(ui.count, expected);
  const balanced = d.label === "Drawer balances";
  return (
    <PosDialog
      title="Close shift"
      sub={`${term?.name} · opened ${shift?.at ?? ""}`}
      onClose={closeModal}
      footer={
        <>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="danger" icon="check" onClick={() => confirmCloseShift(expected)}>
            Close shift
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex justify-between rounded-[12px] bg-canvas px-4 py-3">
          <span className="type-label">Expected cash in drawer</span>
          <span className="type-title u-num">{posK(expected)}</span>
        </div>
        <Input label="Cash you counted (KES)" type="number" min={0} placeholder="0.00" value={ui.count} onChange={(e) => setCloseCount(e.target.value)} />
        {d.has && (
          <div className={`type-label flex justify-between rounded-[12px] px-4 py-3 ${balanced ? "bg-green-50 text-green-800" : "bg-warning-soft text-warning-text"}`} aria-live="polite">
            <span>{d.label}</span>
            <span className="u-num">
              {d.diff > 0 ? "+" : d.diff < 0 ? "−" : ""}
              {posK(Math.abs(d.diff))}
            </span>
          </div>
        )}
        <label className="flex flex-col gap-1">
          <span className="type-label">Note (optional)</span>
          <textarea rows={2} placeholder="For example, KES 50 short, gave wrong change" value={ui.closeNote} onChange={(e) => setCloseNote(e.target.value)} className="type-body w-full resize-y rounded-[10px] border border-border-strong px-2.5 py-2" />
        </label>
        {ui.clErr && (
          <div role="alert" className="type-small text-danger-text">
            {ui.clErr}
          </div>
        )}
      </div>
    </PosDialog>
  );
}
