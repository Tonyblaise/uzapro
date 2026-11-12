"use client";
/**
 * The design's calendar (`isCal`, `calView`): month header with Previous/Next month, "Today" and
 * the title, the Monday-first month grid with type-coloured chips, and "Coming up" (5 events on or
 * after 1 Nov 2026). Clicking an empty part of a day opens "New event" on that date.
 */
import { useMemo, useState } from "react";
import { CAL_TODAY_MONTH, CAL_TODAY_YEAR, WEEKDAYS, calStamp, calTone, eventsOn, monthGrid, monthTitle, shiftMonth, useCalendarEvents, useComingUp } from "@/data";
import { date as fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { CalOverlays } from "./CalOverlays";
import { CHIP, useCalOverlay } from "./shared";

export function CalendarScreen() {
  const { open } = useCalOverlay();
  const events = useCalendarEvents();
  const upcoming = useComingUp();
  const [ym, setYm] = useState({ year: CAL_TODAY_YEAR, month: CAL_TODAY_MONTH });
  const cells = useMemo(() => monthGrid(ym.year, ym.month), [ym]);
  const shift = (n: number) => setYm((c) => shiftMonth(c.year, c.month, n));
  const add = (iso: string) => open({ action: "new", date: iso });
  const view = (id: string) => open({ view: id });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <IconButton icon="chevron-left" variant="secondary" label="Previous month" onClick={() => shift(-1)} />
        <IconButton icon="chevron-right" variant="secondary" label="Next month" onClick={() => shift(1)} />
        <Button variant="secondary" onClick={() => setYm({ year: CAL_TODAY_YEAR, month: CAL_TODAY_MONTH })}>
          Today
        </Button>
        <h2 className="type-h2 m-0 ml-2 text-text">{monthTitle(ym.year, ym.month)}</h2>
      </div>

      <Card flush>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map((d) => (
                <div key={d} className="type-table-head p-3 text-text-muted">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((c) => {
                const list = eventsOn(events, c.iso);
                return (
                  <div
                    key={c.iso}
                    onClick={() => add(c.iso)}
                    title="Add an event"
                    data-date={c.iso}
                    className={`box-border flex min-h-[104px] min-w-0 cursor-pointer flex-col gap-1 border-b border-r border-border p-2 hover:bg-surface-hover ${c.inMonth ? "bg-surface" : "bg-canvas"}`}
                  >
                    <button
                      type="button"
                      aria-label={`Add an event on ${calStamp(c.iso)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        add(c.iso);
                      }}
                      className={`type-small u-num grid size-6 place-items-center rounded-full border-0 p-0 ${c.isToday ? "bg-action text-text-on-action" : `bg-transparent ${c.inMonth ? "text-text" : "text-text-muted"}`}`}
                    >
                      {c.day}
                    </button>
                    {list.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        title={e.title}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          view(e.id);
                        }}
                        className={`type-caption cursor-pointer truncate whitespace-nowrap rounded-sm border-0 px-2 py-0.5 text-left font-sans ${CHIP[calTone(e.type)]}`}
                      >
                        {e.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <section aria-labelledby="cal-coming-up" className="flex flex-col gap-3">
        <h2 id="cal-coming-up" className="type-card-title m-0 text-text">
          Coming up
        </h2>
        <Card flush>
          {upcoming.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => view(u.id)}
              className="flex w-full cursor-pointer items-center gap-4 border-0 border-b border-solid border-border bg-transparent px-5 py-3 text-left font-sans hover:bg-surface-hover"
            >
              <span className="type-small u-num w-24 flex-none text-text-muted">{fmtDate(u.date)}</span>
              <span className="type-label min-w-0 flex-1 text-text">{u.title}</span>
              <span className="text-text-muted">
                <Icon name="chevron-right" size={16} />
              </span>
            </button>
          ))}
        </Card>
      </section>

      <CalOverlays />
    </div>
  );
}
