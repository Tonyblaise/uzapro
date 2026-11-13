"use client";
/** Point of sale › Terminals (design `isPosLaunch`): a card per terminal; `?till={id}` opens the till. */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hrefFor } from "@/config/modules";
import { exitTill, launchTill, posK0, toast, useCan, usePos, useTerminals } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Till } from "./Till";

export function PosLaunch() {
  const { list } = useTerminals();
  const pos = usePos();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tillId = Number(params.get("till"));
  // Selling creates records, so a till needs Point of sale Write (feature 011, research R5).
  const canSell = useCan("write", "pos");
  const term = canSell ? list.find((t) => t.id === tillId && t.active) : undefined;

  // This tab is a till tab opened from the cards (`?till=1&tab=1`), as the design's `#pos-term-1`.
  const tillTab = params.get("tab") === "1";
  // Whether this tab launched the till (the slice is shared with a linked till tab).
  const launchedHere = useRef(false);
  const [mine, setMine] = useState(false);

  // The URL drives the till in this tab: open it for an active terminal.
  useEffect(() => {
    if (term && (!pos.ui.open || pos.ui.termId !== term.id || !launchedHere.current)) {
      launchTill(term.id);
      launchedHere.current = true;
      setMine(true);
    }
    if (!term && launchedHere.current) {
      launchedHere.current = false;
      setMine(false);
      if (pos.ui.open) exitTill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term?.id]);

  // Leaving the till (Exit, Close shift): a till tab closes itself; otherwise back to the cards.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !pos.ui.open && params.get("till") && launchedHere.current) {
      launchedHere.current = false;
      setMine(false);
      if (tillTab) {
        try {
          window.close();
        } catch {
          /* ignore */
        }
      }
      // If the browser keeps the tab open (it wasn't opened by script), show the cards.
      setTimeout(() => router.replace(pathname, { scroll: false }), 150);
    }
    wasOpen.current = pos.ui.open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.ui.open]);

  // A till tab: name the tab, hide Uza AI here only, and close the till if the tab is closed.
  const tillShown = !!term && pos.ui.open && pos.ui.termId === term.id && mine;
  useEffect(() => {
    if (!tillShown || !term) return;
    const title = document.title;
    const want = `UzaPro POS · ${term.name}`;
    // Next.js re-applies the page title on render, so keep the till's name on the tab.
    const keep = () => {
      if (tillTab && document.title !== want) document.title = want;
    };
    keep();
    const watch = new MutationObserver(keep);
    if (tillTab) watch.observe(document.head, { subtree: true, childList: true, characterData: true });
    document.documentElement.dataset.till = "1";
    const bye = () => exitTill();
    if (tillTab) window.addEventListener("pagehide", bye);
    return () => {
      watch.disconnect();
      document.title = title;
      delete document.documentElement.dataset.till;
      window.removeEventListener("pagehide", bye);
    };
  }, [tillShown, tillTab, term]);

  /** Design `tm.go`: open the till in a new tab; if the browser blocks it, open it here. */
  const openTill = (id: number, name: string) => {
    let w: Window | null = null;
    try {
      w = window.open(`${pathname}?${new URLSearchParams({ till: String(id), tab: "1" })}`, "_blank");
    } catch {
      w = null;
    }
    if (w) toast(`${name} opened in a new tab.`);
    else {
      router.push(`${pathname}?till=${id}`, { scroll: false });
      toast("Your browser blocked the new tab, so the POS opened here.");
    }
  };

  // While the till is open it is the whole screen, so the cards aren't rendered behind it.
  if (tillShown) return <Till tab={tillTab} />;

  return (
    <>
      <div className="flex max-w-[1100px] flex-col gap-5">
        <ul className="m-0 grid list-none gap-4 p-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))" }} aria-label="Terminals">
          {list.map((t) => {
            const sh = pos.shifts[t.id];
            const off = !t.active;
            const open = !!sh?.open;
            const sales = (sh?.refs ?? []).reduce((a, r) => a + (pos.docs[r]?.total ?? 0), 0);
            const status = off ? "Inactive" : open ? "Shift open" : "Closed";
            return (
              <li key={t.id} className="flex flex-col gap-4 rounded-[16px] border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="grid size-11 flex-none place-items-center rounded-[12px] bg-green-50 text-green-700">
                    <Icon name="scan-barcode" size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="type-title m-0 text-[18px] text-text">{t.name}</h2>
                    <div className="type-small text-text-secondary">
                      {t.branch || "Any branch"} · {t.store}
                    </div>
                  </div>
                  <span className={`type-caption inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-bold uppercase tracking-[0.04em] ${open && !off ? "bg-warning-soft text-warning-text" : off ? "bg-canvas text-text-muted" : "bg-canvas text-text-secondary"}`}>
                    <span aria-hidden="true" className="size-[7px] rounded-full bg-current" />
                    {status}
                  </span>
                </div>
                <dl className="m-0 grid grid-cols-2 gap-3 rounded-[12px] bg-canvas px-4 py-3">
                  <div>
                    <dt className="type-eyebrow text-text-muted">{open ? "Opened by" : "Code"}</dt>
                    <dd className="type-label m-0 mt-0.5 text-text">{open ? `${sh!.by}, ${sh!.at}` : t.code || "—"}</dd>
                  </div>
                  <div>
                    <dt className="type-eyebrow text-text-muted">{open ? "Sales this shift" : "Last closed"}</dt>
                    <dd className="type-label u-num m-0 mt-0.5 text-text">{open ? `${sh!.refs.length} · ${posK0(sales)}` : sh?.closedAt || "—"}</dd>
                  </div>
                </dl>
                {canSell ? (
                  <Button size="lg" icon="arrow-up-right" fullWidth disabled={off} onClick={() => openTill(t.id, t.name)}>
                    {off ? "Terminal is off" : open ? "Launch" : "Open shift"}
                  </Button>
                ) : (
                  <p className="type-label m-0 grid h-12 place-items-center rounded-md bg-canvas text-text-muted">View only</p>
                )}
              </li>
            );
          })}
        </ul>
        <div className="type-small flex flex-wrap items-center gap-2 text-text-secondary">
          <Icon name="info" size={15} />
          <span>Need another till? Add terminals in Settings › Terminals.</span>
          <button type="button" onClick={() => router.push(hrefFor("set", "Terminals"))} className="type-label border-0 bg-transparent p-0 text-action hover:underline">
            Manage terminals
          </button>
        </div>
      </div>
    </>
  );
}
