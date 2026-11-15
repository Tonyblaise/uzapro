"use client";
/**
 * shadcn/ui's Calendar (react-day-picker v9) in the Uzapoint tokens: Monday first, the demo day as
 * "today", chevrons from the icon set, green selection and a soft green range.
 */
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { isoToDate } from "@/lib/dates";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { Icon } from "./Icon";

const NAV =
  "inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-grey-100 disabled:opacity-40";

export function Calendar({
  className = "",
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      today={isoToDate(DEMO_TODAY)}
      className={`p-3 ${className}`}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "type-label text-text",
        nav: "absolute inset-x-0 top-0 z-[1] flex items-center justify-between",
        button_previous: NAV,
        button_next: NAV,
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday: "type-caption w-9 font-normal text-text-muted",
        week: "mt-1 flex",
        day: "group/day relative size-9 p-0 text-center",
        day_button:
          "type-body inline-flex size-9 items-center justify-center rounded-md text-text outline-none hover:bg-grey-100 focus-visible:shadow-[0_0_0_3px_var(--green-100)] focus-visible:ring-1 focus-visible:ring-green-600",
        today:
          "[&>button]:font-bold [&:not([aria-selected=true])>button]:text-green-700",
        selected:
          "[&>button]:!bg-green-600 [&>button]:text-white [&>button]:hover:!bg-green-700",
        range_start: "rounded-l-md bg-green-50",
        range_middle:
          "bg-green-50 [&>button]:!bg-transparent [&>button]:!text-text [&>button]:rounded-none",
        range_end: "rounded-r-md bg-green-50",
        outside: "[&>button]:text-text-muted [&>button]:opacity-60",
        disabled: "[&>button]:opacity-40 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (
          <Icon
            name={orientation === "left" ? "chevron-left" : "chevron-right"}
            size={16}
          />
        ),
      }}
      {...props}
    />
  );
}
