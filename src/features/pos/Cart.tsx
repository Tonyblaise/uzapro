"use client";
/** The till's cart (design `aside`): customer, barcode box, lines with notes, totals, Hold and Charge. */
import {
  WALK_IN,
  changeLine,
  charge,
  clearCart,
  holdSale,
  openCustomerPicker,
  posK,
  posK0,
  posTotals,
  removeLine,
  scanCode,
  setDiscount,
  setDiscountOpen,
  setLineNote,
  setScan,
  toggleCart,
  toggleDiscountType,
  toggleNoteLine,
  usePos,
  usePosTill,
  useCustomers,
  useReceivables,
} from "@/data";
import { Icon } from "@/components/ui/Icon";

export function Cart() {
  const { ui, settings } = usePos();
  const { variantStock } = usePosTill();
  const customers = useCustomers();
  const rcv = useReceivables();
  const t = posTotals(ui.cart, ui.discVal, ui.discType);
  const walkIn = ui.cust === WALK_IN;
  const phone = customers.find((c) => c.name === ui.cust)?.phone;
  const owes = rcv.filter((r) => r.party === ui.cust).reduce((a, r) => a + r.balance, 0);
  const empty = !ui.cart.length;

  return (
    <aside aria-label="Cart" style={{ background: "linear-gradient(180deg, var(--green-50), var(--surface) 220px)" }} className={`uz-cart flex w-[400px] min-h-0 flex-none flex-col border-l border-border bg-surface ${ui.cartOpen ? "uz-cart-open" : ""}`}>
      <div className="flex flex-col gap-3 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="type-eyebrow text-text-muted">Customer</div>
          {/* Phones: the slide-in cart covers the header, so it needs its own close (spec › Design deviations). */}
          <button type="button" onClick={toggleCart} aria-label="Close cart" className="uz-pos-cartbtn hidden size-8 items-center justify-center rounded-full border border-border bg-surface text-text-secondary">
            <Icon name="x" size={16} />
          </button>
        </div>
        <button type="button" onClick={openCustomerPicker} className="flex w-full items-center gap-3 rounded-[14px] border-[1.5px] border-green-200 bg-surface px-3 py-2.5 text-left">
          <span aria-hidden="true" className="grid size-[38px] flex-none place-items-center rounded-full bg-green-50 text-green-800">
            <Icon name={walkIn ? "user" : "users"} size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-label block truncate text-text">{ui.cust}</span>
            <span className="type-caption block text-text-muted">{walkIn ? "Default customer · tap to change" : `${phone && phone !== "—" ? phone : "No phone"} · ${owes ? `Owes ${posK0(owes)}` : "Nothing owed"}`}</span>
          </span>
          <span className="type-label text-green-700">Change</span>
        </button>
        {settings.scan && (
          <div className="flex h-[42px] items-center gap-2 rounded-[12px] border border-border bg-surface px-3">
            <Icon name="scan-barcode" size={18} />
            <input
              type="text"
              placeholder="Scan or type a product code, then Enter"
              aria-label="Barcode"
              value={ui.scan}
              onChange={(e) => setScan(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") scanCode((e.target as HTMLInputElement).value);
              }}
              className="type-body min-w-0 flex-1 border-0 bg-transparent outline-none"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="type-eyebrow text-text-muted">Cart</span>
            <span className="type-caption rounded-pill border border-border bg-surface px-2 font-bold text-text-secondary">
              {t.count} {t.count === 1 ? "item" : "items"}
            </span>
          </span>
          {!empty && (
            <button type="button" onClick={clearCart} className="type-small inline-flex items-center gap-1 border-0 bg-transparent font-semibold text-danger-text">
              <Icon name="trash-2" size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-4">
        {empty && (
          <div className="my-auto flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span aria-hidden="true" className="grid size-16 place-items-center rounded-full border-2 border-dashed border-green-200 text-green-600">
              <Icon name="shopping-cart" size={26} />
            </span>
            <div className="type-label mt-2 text-text">The cart is empty</div>
            <div className="type-small text-text-muted">Tap a product or search to add it.</div>
          </div>
        )}
        {ui.cart.map((l, i) => {
          const left = variantStock(l.product, l.variant);
          const editing = ui.noteLine === i;
          return (
            <div key={l.key} className="flex flex-col gap-2 rounded-[14px] border border-border bg-surface px-3 py-2.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="type-label text-text">{l.product}</div>
                  <div className="type-caption text-text-muted">
                    {l.variant && l.variant !== "Standard" ? `${l.variant} · ` : ""}
                    {posK(l.price)} each
                  </div>
                  {l.qty > left && <div className="type-caption mt-0.5 text-warning-text">Only {left} in stock here</div>}
                  {!!l.note?.trim() && !editing && <div className="type-caption mt-0.5 text-info-text">Note: {l.note}</div>}
                </div>
                <div className="type-label u-num text-text">{posK(l.price * l.qty)}</div>
              </div>
              {editing && (
                <div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {settings.qn.map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={l.note === n}
                        onClick={() => setLineNote(i, l.note === n ? "" : n)}
                        className={`type-caption rounded-pill border px-2.5 py-0.5 font-semibold text-text ${l.note === n ? "border-green-600 bg-green-50" : "border-border bg-surface"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Or type a note" aria-label="Item note" value={l.note ?? ""} onChange={(e) => setLineNote(i, e.target.value)} className="type-small rounded-md border border-border-strong px-2.5 py-1.5" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Fewer" onClick={() => changeLine(i, -1)} className="grid size-[30px] place-items-center rounded-full border border-border bg-surface text-text">
                  <Icon name={l.qty > 1 ? "minus" : "trash-2"} size={14} />
                </button>
                <span className="type-label u-num min-w-6 text-center">{l.qty}</span>
                <button type="button" aria-label="More" onClick={() => changeLine(i, 1)} className="grid size-[30px] place-items-center rounded-full border-0 bg-green-700 text-white">
                  <Icon name="plus" size={14} />
                </button>
                <span className="flex-1" />
                {settings.notes && (
                  <button type="button" onClick={() => toggleNoteLine(i)} className="type-caption inline-flex items-center gap-1 rounded-pill border border-border bg-canvas px-2.5 py-1 font-semibold text-text-secondary">
                    <Icon name="pencil" size={12} />
                    {editing ? "Done" : l.note ? "Edit note" : "Note"}
                  </button>
                )}
                <button type="button" aria-label="Remove" onClick={() => removeLine(i)} className="grid place-items-center border-0 bg-transparent p-1 text-text-muted">
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 border-t border-border bg-surface px-4 pb-4 pt-3">
        <div className="type-body flex justify-between text-text-secondary">
          <span>Subtotal (before VAT)</span>
          <span className="u-num">{posK(t.sub)}</span>
        </div>
        <div className="type-body flex items-center justify-between text-text-secondary">
          <span>Discount</span>
          {ui.discOpen ? (
            <span className="flex items-center gap-1.5">
              <input type="number" min={0} aria-label="Discount" value={ui.discVal} onChange={(e) => setDiscount(e.target.value)} className="type-body w-20 rounded-md border border-border-strong px-2 py-1" />
              <button type="button" onClick={toggleDiscountType} aria-label={`Discount in ${ui.discType === "%" ? "percent" : "KES"}`} className="type-small rounded-md border border-border bg-canvas px-2 py-1 font-bold">
                {ui.discType}
              </button>
              <button type="button" onClick={() => setDiscountOpen(false)} className="type-small border-0 bg-transparent font-bold text-green-700">
                Done
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setDiscountOpen(true)} className={`type-small rounded-md border border-dashed border-border-strong bg-transparent px-2.5 py-0.5 font-semibold ${t.disc ? "text-danger-text" : "text-text-secondary"}`}>
              {t.disc ? `−${posK(t.disc)}${ui.discType === "%" ? ` (${Number(ui.discVal) || 0}%)` : ""}` : "+ Add"}
            </button>
          )}
        </div>
        <div className="type-body flex justify-between text-text-secondary">
          <span>VAT 16% (included)</span>
          <span className="u-num">{posK(t.vat)}</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-2">
          <span className="type-title text-text">Total</span>
          <span className="u-num text-[28px] font-extrabold tracking-[-0.02em] text-text">{posK(t.total)}</span>
        </div>
        <div className="mt-1 grid gap-2" style={{ gridTemplateColumns: "110px 1fr" }}>
          <button type="button" onClick={holdSale} disabled={empty} className="type-label flex h-[52px] items-center justify-center gap-1.5 rounded-[14px] border-0 bg-text text-surface disabled:opacity-45">
            <Icon name="clock" size={16} />
            Hold
          </button>
          <button
            type="button"
            onClick={charge}
            disabled={empty}
            className="flex h-[52px] items-center justify-between rounded-[14px] border-0 bg-[linear-gradient(135deg,var(--green-500),var(--green-700))] px-[18px] text-[16px] font-bold text-white shadow-[var(--shadow-charge)] disabled:opacity-45"
          >
            <span>Charge</span>
            <span className="u-num">{posK(t.total)}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
