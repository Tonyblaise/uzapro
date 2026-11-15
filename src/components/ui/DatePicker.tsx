"use client";
/**
 * shadcn/ui's date picker (Popover + Calendar) in the Uzapoint style.
 *
 * - `DateInput`: the "date picker with input" pattern: type a date ("12 Nov 2026", "12/11/2026" or
 *   "2026-11-12") or open the calendar from the button inside the field. Every `<Input type="date">`
 *   renders one of these, so values stay ISO "YYYY-MM-DD" strings.
 * - `DateRangePicker`: one button showing the range that opens a two-month calendar; the range is
 *   applied once both ends are picked.
 */
import * as Popover from "@radix-ui/react-popover";
import { useState, type ReactNode } from "react";
import type { DateRange } from "react-day-picker";
import { date as fmtDate } from "@/lib/format";
import { dateToIso, isoToDate, parseTypedDate } from "@/lib/dates";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { Calendar } from "./Calendar";
import { Icon } from "./Icon";

const POPOVER = "z-[var(--z-date-popover)] rounded-lg border border-border bg-surface shadow-lg outline-none";

/** Keep Escape inside the calendar from also closing the drawer or modal underneath. */
const keepEscape = (e: KeyboardEvent) => e.stopPropagation();

export interface DateInputProps {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  /** Names the field and the calendar button when there is no visible label. */
  ariaLabel?: string;
  label?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  className: string;
}

export function DateInput({ id, value, onChange, ariaLabel, label, disabled, required, invalid, placeholder = "DD/MM/YYYY", min, max, className }: DateInputProps) {
  const [open, setOpen] = useState(false);
  const shownValue = value ? fmtDate(value) : "";
  // While typing, show what was typed; otherwise the value as "12 Nov 2026".
  const [text, setText] = useState<string | null>(null);

  const selected = isoToDate(value);
  const name = ariaLabel ?? (typeof label === "string" ? label : "date");
  const type = (t: string) => {
    setText(t);
    if (!t.trim()) return onChange("");
    const iso = parseTypedDate(t);
    if (iso && iso !== value) onChange(iso);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className={`${className} flex items-center gap-1 pl-3 pr-1 text-text-muted`}>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-label={ariaLabel}
            aria-invalid={invalid ? true : undefined}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            value={text ?? shownValue}
            onFocus={() => setText(shownValue)}
            onBlur={() => setText(null)}
            onChange={(e) => type(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && e.altKey) {
                e.preventDefault();
                setOpen(true);
              }
            }}
            className="type-body h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-text outline-none"
          />
          <Popover.Trigger asChild disabled={disabled}>
            <button
              type="button"
              aria-label="Open calendar"
              title={`Pick ${name.toLowerCase()} from the calendar`}
              className="inline-flex size-7 flex-none items-center justify-center rounded-sm text-text-muted hover:bg-grey-100 hover:text-text disabled:opacity-40"
            >
              <Icon name="calendar" size={16} />
            </button>
          </Popover.Trigger>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={4} collisionPadding={8} className={POPOVER} onEscapeKeyDown={keepEscape}>
          <Calendar
            mode="single"
            autoFocus
            selected={selected}
            defaultMonth={selected ?? isoToDate(DEMO_TODAY)}
            disabled={[...(min ? [{ before: isoToDate(min)! }] : []), ...(max ? [{ after: isoToDate(max)! }] : [])]}
            onSelect={(d) => {
              if (d) onChange(dateToIso(d));
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** "1 Nov 2026 – 10 Nov 2026", or one date when both ends are the same day. */
const rangeText = (from: string, to: string) => (from === to ? fmtDate(from) : `${fmtDate(from)} – ${fmtDate(to)}`);

export function DateRangePicker({ from, to, onChange, label = "Dates" }: { from: string; to: string; onChange: (from: string, to: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const shown: DateRange | undefined = draft ?? {
    from: isoToDate(from),
    to: isoToDate(to),
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        setDraft(undefined);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${rangeText(from, to)}`}
          className="type-body inline-flex h-[var(--control-height)] items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-text hover:bg-surface-hover focus-visible:border-action focus-visible:shadow-[0_0_0_3px_var(--green-100)] focus-visible:outline-none"
        >
          <Icon name="calendar" size={16} />
          <span className="u-num whitespace-nowrap">{rangeText(from, to)}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={4} collisionPadding={8} className={POPOVER} onEscapeKeyDown={keepEscape}>
          <Calendar
            mode="range"
            autoFocus
            showOutsideDays={false}
            numberOfMonths={2}
            defaultMonth={isoToDate(to) && isoToDate(from) && from.slice(0, 7) === to.slice(0, 7) ? new Date(isoToDate(to)!.getFullYear(), isoToDate(to)!.getMonth() - 1, 1) : isoToDate(from)}
            selected={shown}
            onSelect={(_, day) => {
              // First click starts a new range; the second click ends it (either order).
              if (!draft?.from) return setDraft({ from: day, to: undefined });
              const [a, b] = day < draft.from ? [day, draft.from] : [draft.from, day];
              onChange(dateToIso(a), dateToIso(b));
              setDraft(undefined);
              setOpen(false);
            }}
          />
          <div className="type-small border-t border-border px-3 py-2 text-text-muted">
            {draft?.from ? `From ${fmtDate(dateToIso(draft.from))}. Pick the end date.` : "Pick the start date, then the end date."}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
