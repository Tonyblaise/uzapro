"use client";
/** Point of sale › Terminals (design `isPosLaunch`): a card per terminal; `?till={id}` opens the till. */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { hrefFor } from "@/config/modules";
import { exitTill, launchTill, posK0, usePos, useTerminals } from "@/data";
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
  const term = list.find((t) => t.id === tillId && t.active);

  // The URL drives the till: open it for an active terminal, close it otherwise (Clarification Q1).
  useEffect(() => {
    if (term && (!pos.ui.open || pos.ui.termId !== term.id)) launchTill(term.id);
    if (!term && pos.ui.open) exitTill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term?.id]);
  // Leaving the till (Exit, Close shift) returns to the cards: only on an open → closed change.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !pos.ui.open && params.get("till")) router.replace(pathname, { scroll: false });
    wasOpen.current = pos.ui.open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.ui.open]);

  // While the till is open it is the whole screen, so the cards aren't rendered behind it.
  if (term && pos.ui.open && pos.ui.termId === term.id) return <Till />;

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
                <Button size="lg" icon="arrow-up-right" fullWidth disabled={off} onClick={() => router.push(`${pathname}?till=${t.id}`, { scroll: false })}>
                  {off ? "Terminal is off" : open ? "Continue selling" : "Open shift"}
                </Button>
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
