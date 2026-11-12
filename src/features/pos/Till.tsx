"use client";
/**
 * The full-screen till (design `ps.app` / `ps.pre`): entry steps, or the rail, header, the active
 * view and the cart, plus the till's dialogs. Rendered by Point of sale › Terminals at `?till={id}`.
 */
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Field";
import { exitTill, lockTill, onShiftLabel, openPosSettings, setPosQuery, setPosView, toggleCart, useLinkedTab, usePos, usePosTill, initialsOf, type PosView } from "@/data";
import { Cart } from "./Cart";
import { Dialogs } from "./Dialogs";
import { PreSteps } from "./PreSteps";
import { OrdersView, PeopleView, SellView, ShiftView, TodayView } from "./Views";
import { UMark } from "./shared";

const RAIL: [PosView, string, IconName][] = [
  ["sell", "Sell", "shopping-cart"],
  ["today", "Today", "chart-column"],
  ["orders", "Orders", "receipt"],
  ["customers", "People", "users"],
  ["shift", "Shift", "clock"],
];

const SEARCH_PH: Record<PosView, string> = {
  today: "Search products",
  sell: "Search products, variants or categories",
  orders: "Search by receipt number or customer",
  customers: "Search customers",
  shift: "Search products",
};

/** Full screen for the till (Fullscreen API): the state follows the browser, so Esc stays in sync. */
function useFullscreen() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const toggle = () => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.();
    } catch {
      /* not supported */
    }
  };
  return { on, toggle, supported: typeof document !== "undefined" && !!document.fullscreenEnabled };
}

/** The current time, refreshed every 30 seconds ("On shift {h}h {m}m"). */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function Till({ tab = false }: { tab?: boolean }) {
  const now = useNow();
  const fs = useFullscreen();
  const { term } = usePosTill();
  const linked = useLinkedTab();
  const { ui, held, shifts } = usePos();
  if (!term) return null;
  if (ui.step !== "app") return <PreSteps term={term} tab={tab} />;
  const title = { sell: "Sell", today: `Today on ${term.name}`, orders: "Orders this shift", customers: "Customers", shift: "Shift" }[ui.view];
  const count = ui.cart.reduce((a, l) => a + l.qty, 0);
  const railBtn = "flex w-16 flex-col items-center gap-1 rounded-[12px] border-0 px-0 pb-2 pt-2.5 text-[11px] font-semibold";

  return (
    <div className="uz-pos fixed inset-0 z-[var(--z-till)] flex bg-canvas" role="dialog" aria-modal="true" aria-label={`${term.name} till`}>
      <nav aria-label="Point of sale" className="flex w-[76px] flex-none flex-col items-center gap-1.5 overflow-y-auto border-r border-border bg-surface py-3">
        <div className="mb-3">
          <UMark />
        </div>
        {RAIL.map(([k, label, icon]) => {
          const on = ui.view === k;
          return (
            <button key={k} type="button" aria-current={on ? "page" : undefined} onClick={() => setPosView(k)} className={`${railBtn} relative ${on ? "bg-green-50 text-green-800" : "bg-transparent text-text-secondary hover:text-text"}`}>
              <Icon name={icon} size={20} />
              {label}
              {k === "orders" && held.length > 0 && (
                <span className="absolute right-2.5 top-1 grid h-4 min-w-4 place-items-center rounded-pill bg-danger-text px-1 text-[10px] text-white" aria-label={`${held.length} on hold`}>
                  {held.length}
                </span>
              )}
            </button>
          );
        })}
        <span className="flex-1" />
        <button type="button" onClick={openPosSettings} className={`${railBtn} bg-transparent text-text-secondary hover:text-text`}>
          <Icon name="settings" size={20} />
          Settings
        </button>
        <button type="button" onClick={lockTill} className={`${railBtn} bg-transparent text-text-secondary hover:text-text`}>
          <Icon name="lock" size={20} />
          Lock
        </button>
        <button type="button" onClick={exitTill} className={`${railBtn} bg-transparent text-danger-text`}>
          <Icon name="log-out" size={20} />
          Exit
        </button>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-none items-center gap-4 border-b border-border bg-surface px-5 py-3 max-sm:gap-2 max-sm:px-3">
          <div className="min-w-0 max-sm:hidden">
            <div className="type-eyebrow text-text-muted">
              {term.name} · {term.store}
            </div>
            <h1 className="type-title m-0 text-[18px] text-text">{title}</h1>
          </div>
          <div className="mx-auto min-w-0 max-w-[560px] flex-1">
            <Input icon="search" placeholder={SEARCH_PH[ui.view]} aria-label="Search" value={ui.q} onChange={(e) => setPosQuery(e.target.value)} />
          </div>
          <div className="uz-pos-who flex items-center gap-2.5 rounded-pill border border-border py-1.5 pl-1.5 pr-3">
            <span aria-hidden="true" className="type-small grid size-[30px] place-items-center rounded-full bg-green-100 font-bold text-green-800">
              {initialsOf(ui.who)}
            </span>
            <div className="leading-tight">
              <div className="type-label text-text">{ui.who}</div>
              <div className="type-caption text-text-muted">On shift {onShiftLabel(shifts[term.id]?.start, now)}</div>
            </div>
          </div>
          {fs.supported && (
            <button
              type="button"
              onClick={fs.toggle}
              aria-pressed={fs.on}
              aria-label={fs.on ? "Exit full screen" : "Full screen"}
              title={fs.on ? "Exit full screen" : "Full screen"}
              className="grid size-10 flex-none place-items-center rounded-full border border-border bg-surface text-text-secondary hover:text-text"
            >
              <Icon name={fs.on ? "minimize" : "maximize"} size={18} />
            </button>
          )}
          {tab && !linked && (
            <span title="Sales made now stay in this tab" className="type-caption inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill bg-warning-soft px-2.5 py-1.5 font-bold text-warning-text">
              Not linked to UzaPro
            </span>
          )}
          <button type="button" onClick={toggleCart} aria-expanded={ui.cartOpen} className="uz-pos-cartbtn type-label hidden items-center gap-1.5 rounded-pill border border-green-200 bg-green-50 px-3 py-2 text-green-800">
            <Icon name="shopping-cart" size={16} />
            {count} {count === 1 ? "item" : "items"}
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-5 max-sm:p-3">
          {ui.view === "sell" && <SellView />}
          {ui.view === "today" && <TodayView />}
          {ui.view === "orders" && <OrdersView />}
          {ui.view === "customers" && <PeopleView />}
          {ui.view === "shift" && <ShiftView />}
        </div>
      </div>

      <Cart />
      <Dialogs />
    </div>
  );
}
