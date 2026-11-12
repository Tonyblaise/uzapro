"use client";
/** The till's main views (design `vSell`, `vToday`, `vOrders`, `vCust`, `vShift`). */
import {
  WALK_IN,
  askCloseShift,
  discardHeld,
  expectedCash,
  initialsOf,
  openNewCustomer,
  openReceipt,
  pickCustomer,
  posK,
  posK0,
  resumeHeld,
  setPosCategory,
  setPosView,
  shiftCollections,
  tapProduct,
  tintIndex,
  todayStats,
  useCustomers,
  usePos,
  usePosTill,
  useReceivables,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { Eyebrow, tint } from "./shared";

/** The category order used for tile colours (the product list's category order, as in the design). */
function useCats() {
  const { products } = usePosTill();
  return Array.from(new Set(products.map((p) => p.cat)));
}

export function SellView() {
  const { ui, settings } = usePos();
  const { products } = usePosTill();
  const cats = useCats();
  const q = ui.q.trim().toLowerCase();
  const shown = products.filter((p) => (ui.cat === "All" || p.cat === ui.cat) && (!q || `${p.name} ${p.cat} ${p.vs.map((v) => v[0]).join(" ")}`.toLowerCase().includes(q)));
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...cats].map((c) => {
          const on = c === ui.cat;
          const n = c === "All" ? products.length : products.filter((p) => p.cat === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => setPosCategory(c)}
              className={`type-label inline-flex items-center gap-2 rounded-pill border py-2 pl-2.5 pr-4 ${on ? "border-green-700 bg-green-700 text-white" : "border-border bg-surface text-text"}`}
            >
              <span
                aria-hidden="true"
                className="size-3.5 rounded-full border-2"
                style={{
                  borderColor: on ? "var(--white)" : "transparent",
                  background: c === "All" ? "conic-gradient(var(--pos-ink-1) 0 25%, var(--pos-ink-2) 0 50%, var(--pos-ink-3) 0 75%, var(--pos-ink-4) 0)" : `var(--pos-ink-${tintIndex(cats, c)})`,
                }}
              />
              {c} <span className="font-medium opacity-60">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(170px, 100%), 1fr))" }}>
        {shown.map((p) => {
          const i = tintIndex(cats, p.cat);
          const inCart = ui.cart.filter((l) => l.product === p.name).reduce((a, l) => a + l.qty, 0);
          const badge = p.stock > 5 ? "bg-white/90 text-text-secondary" : p.stock > 0 ? "bg-warning-soft text-warning-text" : "bg-danger-soft text-danger-text";
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => tapProduct(p.name)}
              className="uz-ptile relative flex flex-col overflow-hidden rounded-[16px] border border-b-4 border-border bg-surface p-0 text-left"
              style={{ borderBottomColor: `var(--pos-ink-${i})` }}
            >
              <span aria-hidden="true" className="grid h-[104px] place-items-center overflow-hidden text-[28px] font-extrabold tracking-[-0.02em]" style={tint(i)}>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="size-full object-cover" />
                ) : (
                  initialsOf(p.name)
                )}
              </span>
              {settings.stock && <span aria-hidden="true" className={`absolute left-2 top-2 rounded-pill px-2 py-0.5 text-[11px] font-bold ${badge}`}>{p.stock > 0 ? `${p.stock} left` : "None here"}</span>}
              {inCart > 0 && <span aria-hidden="true" className="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-pill bg-green-700 px-1.5 text-[12px] font-bold text-white">{inCart}</span>}
              <span className="flex flex-col gap-0.5 px-3 pb-3 pt-2.5">
                <span className="type-label truncate text-text">
                  <span className="sr-only">Add </span>
                  {p.name}
                </span>
                <span className="type-caption text-text-muted">{p.vs.length > 1 ? `${p.vs.length} options · ${p.cat}` : p.cat}</span>
                <span className="type-title u-num mt-1 text-green-800">
                  {p.min !== p.max ? "From " : ""}
                  {posK0(p.min)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {!shown.length && <div className="type-body p-8 text-center text-text-muted">No products match your search.</div>}
    </>
  );
}

export function TodayView() {
  const { shiftDocs } = usePosTill();
  const cats = useCats();
  const { products } = usePosTill();
  const d = todayStats(shiftDocs);
  const catOf = (n: string) => products.find((p) => p.name === n)?.cat ?? n;
  return (
    <div className="flex max-w-[1200px] flex-col gap-4">
      <ul aria-label="Shift figures" className="m-0 grid list-none gap-3 p-0" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
        {d.kpis.map((k) => (
          <li key={k.label} className={`flex min-h-[150px] flex-col gap-5 rounded-[20px] border px-5 py-4 ${k.hi ? "border-green-200 bg-[linear-gradient(135deg,var(--green-100),var(--green-50))]" : "border-border bg-surface"}`}>
            <span aria-hidden="true" className={`grid size-11 place-items-center rounded-full text-green-800 ${k.hi ? "bg-white" : "bg-canvas"}`}>
              <Icon name={k.icon} size={20} />
            </span>
            <div className="mt-auto">
              <div className="type-body text-text-secondary">{k.label}</div>
              <div className="u-num text-[30px] font-extrabold tracking-[-0.02em] text-text">{k.value}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="uz-dash2 grid gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)" }}>
        <section className="flex flex-col gap-3 rounded-[20px] border border-border bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="type-title m-0 text-[18px]">Best sellers this shift</h2>
            <button type="button" onClick={() => setPosView("orders")} className="type-label border-0 bg-transparent text-green-700 underline">
              See orders
            </button>
          </div>
          {d.top.map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-11 place-items-center rounded-[12px] font-extrabold" style={tint(tintIndex(cats, catOf(t.name)))}>
                {initialsOf(t.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="type-label text-text">{t.name}</div>
                <div className="type-small text-text-secondary">{t.units} sold</div>
              </div>
              <div className="type-label u-num">{t.amount}</div>
            </div>
          ))}
          {!d.top.length && <div className="type-body text-text-muted">No sales yet.</div>}
        </section>
        <section className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="type-title m-0 text-[18px]">Sales by hour</h2>
            <div className="type-small text-text-muted">{d.peak}</div>
          </div>
          <div className="grid h-[240px] gap-2" style={{ gridTemplateColumns: "56px minmax(0,1fr)" }}>
            <div className="type-caption flex flex-col justify-between pb-[22px] text-right text-text-muted" aria-hidden="true">
              {d.ticks.map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-1 items-end gap-2 border-b border-border bg-[repeating-linear-gradient(to_top,transparent_0,transparent_calc(25%-1px),var(--border)_calc(25%-1px),var(--border)_25%)]" role="img" aria-label={`Sales by hour. ${d.peak}.`}>
                {d.bars.map((b) => (
                  <div key={b.label} title={b.tip} className="min-h-0.5 flex-1 rounded-t-md" style={{ height: `${b.pct}%`, background: b.peak ? "var(--green-600)" : "var(--green-200)" }} />
                ))}
              </div>
              <div className="flex h-[22px] items-end gap-2" aria-hidden="true">
                {d.bars.map((b) => (
                  <span key={b.label} className="type-caption flex-1 text-center text-text-muted">
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function OrdersView() {
  const { ui, held } = usePos();
  const { shiftDocs } = usePosTill();
  const q = ui.q.trim().toLowerCase();
  const orders = shiftDocs.filter((d) => !q || `${d.ref} ${d.cust}`.toLowerCase().includes(q));
  return (
    <div className="flex max-w-[1000px] flex-col gap-3">
      {held.map((h, i) => (
        <div key={`${h.at}-${i}`} className="flex flex-wrap items-center gap-4 rounded-[14px] border border-dashed border-warning bg-warning-soft p-4">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-[12px] bg-surface text-warning-text">
            <Icon name="clock" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="type-label text-text">On hold · {h.cust}</div>
            <div className="type-small text-text-secondary">
              {h.cart.reduce((a, l) => a + l.qty, 0)} items · parked at {h.at}
            </div>
          </div>
          <div className="type-title u-num">{posK(h.cart.reduce((a, l) => a + l.price * l.qty, 0))}</div>
          <Button size="sm" onClick={() => resumeHeld(i)}>
            Resume
          </Button>
          <IconButton icon="trash-2" size="sm" label="Discard" onClick={() => discardHeld(i)} />
        </div>
      ))}
      {orders.map((d) => {
        const credit = !d.pays.length;
        const items = d.lines.reduce((a, l) => a + l.qty, 0);
        return (
          <button
            key={d.ref}
            type="button"
            onClick={() => openReceipt(d.ref)}
            className="uz-orow grid items-center gap-4 rounded-[14px] border border-l-4 border-border bg-surface px-5 py-4 text-left"
            style={{ gridTemplateColumns: "minmax(0,1.6fr) 80px 140px 120px 110px", borderLeftColor: credit ? "var(--warning-text)" : "var(--green-500)" }}
          >
            <span className="min-w-0">
              <span className="type-title block text-text">{d.ref}</span>
              <span className="type-small block truncate text-text-secondary">
                {d.cust} · {credit ? "Pay later" : Array.from(new Set(d.pays.map((p) => p.method))).join(" + ")}
              </span>
            </span>
            <span className="uz-orow-items">
              <span className="type-eyebrow block text-text-muted">Items</span>
              <span className="type-label">{items}</span>
            </span>
            <span>
              <span className="type-eyebrow block text-text-muted">Total</span>
              <span className="type-label u-num text-green-800">{posK(d.total)}</span>
            </span>
            <span className="uz-orow-time">
              <span className="type-eyebrow block text-text-muted">Time</span>
              <span className="type-label">{d.time}</span>
            </span>
            <span className="justify-self-end">
              <StatusPill tone={credit ? "warning" : "success"}>{credit ? "On credit" : "Paid"}</StatusPill>
            </span>
          </button>
        );
      })}
      {!orders.length && !held.length && <div className="type-body rounded-[16px] border-[1.5px] border-dashed border-border-strong p-8 text-center text-text-muted">No sales on this shift yet.</div>}
    </div>
  );
}

export function PeopleView() {
  const { ui } = usePos();
  const customers = useCustomers();
  const rcv = useReceivables();
  const q = ui.q.trim().toLowerCase();
  const names = [WALK_IN, ...customers.map((c) => c.name).filter((n) => n !== WALK_IN)].filter((n) => !q || n.toLowerCase().includes(q));
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button icon="plus" onClick={openNewCustomer}>
          Add customer
        </Button>
      </div>
      <ul aria-label="Customers" className="m-0 grid list-none gap-3 p-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))" }}>
        {names.map((n) => {
          const walk = n === WALK_IN;
          const c = customers.find((x) => x.name === n);
          const owes = rcv.filter((r) => r.party === n).reduce((a, r) => a + r.balance, 0);
          const on = n === ui.cust;
          return (
            <li key={n} className={`flex flex-col gap-3 rounded-[14px] border bg-surface p-4 ${on ? "border-green-600" : "border-border"}`}>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-green-50 font-bold text-green-800">
                  {initialsOf(n)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="type-label truncate text-text">{n}</div>
                  <div className="type-small text-text-secondary">{walk ? "No name needed" : c?.phone && c.phone !== "—" ? c.phone : "No phone"}</div>
                </div>
              </div>
              <div className={`type-small ${!walk && owes ? "text-warning-text" : "text-text-muted"}`}>{walk ? "Default for quick sales" : owes ? `Owes ${posK0(owes)}` : "Nothing owed"}</div>
              <Button size="sm" variant={on ? "primary" : "secondary"} fullWidth onClick={() => pickCustomer(n)}>
                {on ? "Selected" : `Sell to ${n.split(" ")[0]}`}
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function ShiftView() {
  const { shift, shiftDocs } = usePosTill();
  const { ui } = usePos();
  const c = shiftCollections(shiftDocs);
  const credit = shiftDocs.filter((d) => !d.pays.length).reduce((a, d) => a + d.total, 0);
  const rows: [string, number, boolean?][] = [
    ["Opening cash", shift?.float ?? 0, true],
    ["Cash", c.Cash],
    ["M-Pesa", c["M-Pesa"]],
    ["Card", c.Card],
    ["On credit", credit],
    ["Total sales", c.total],
  ];
  return (
    <div className="grid max-w-[1000px] gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))" }}>
      <section className="overflow-hidden rounded-[16px] border border-border bg-surface">
        <div className="border-b border-border bg-[linear-gradient(135deg,var(--green-50),var(--surface))] px-5 py-4">
          <Eyebrow>X-report · so far</Eyebrow>
          <h2 className="type-title m-0 mt-1 text-[20px] text-text">Shift collections</h2>
          <dl className="m-0 mt-3 flex flex-wrap gap-6">
            {[
              ["Opened by", shift?.by ?? ui.who],
              ["Opened at", shift?.at ?? ""],
              ["Sales", String(shiftDocs.length)],
            ].map(([l, v]) => (
              <div key={l}>
                <dt className="type-eyebrow text-text-muted">{l}</dt>
                <dd className="type-label m-0">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="px-5 pb-4 pt-2">
          {rows.map(([l, v, muted]) => (
            <div key={l} className={`type-body flex justify-between border-b border-border py-3 ${muted ? "text-text-secondary" : "text-text"}`}>
              <span>{l}</span>
              <span className="u-num font-semibold">{posK(v)}</span>
            </div>
          ))}
          <div className="flex items-baseline justify-between pt-4">
            <span className="type-label uppercase tracking-[0.06em] text-green-800">Expected cash in drawer</span>
            <span className="u-num text-[22px] font-extrabold text-green-800">{posK(expectedCash(shift ?? { float: 0 }, shiftDocs))}</span>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-3 self-start rounded-[16px] border border-border bg-surface p-5">
        <h2 className="type-title m-0 text-text">End of shift</h2>
        <div className="type-body text-text-secondary">Count the cash in the drawer, then close the shift. You&apos;ll see any difference before you confirm.</div>
        <Button variant="danger" icon="log-out" fullWidth onClick={askCloseShift}>
          Close shift
        </Button>
      </section>
    </div>
  );
}
