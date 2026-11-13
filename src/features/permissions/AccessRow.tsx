"use client";
/** One module row in Edit role: Read / Write / Delete, one level picked (contracts/ui.md › Access button). */
import { Icon } from "@/components/ui/Icon";
import { ACCESS_LEVELS, LEVEL_LABEL, type AccessLevel } from "@/data";

export function AccessRow({
  name,
  icon,
  level,
  locked,
  note,
  onPick,
}: {
  name: string;
  icon: string;
  level: AccessLevel;
  locked: boolean;
  note?: string;
  onPick: (l: AccessLevel) => void;
}) {
  return (
    <div role="group" aria-label={name} className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Icon name={icon} size={16} className="flex-none text-text-muted" />
        <span className="type-label min-w-0 break-words text-text">{name}</span>
        {note && <span className="type-caption text-text-muted">{note}</span>}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-none">
        {ACCESS_LEVELS.map((l) => {
          const on = level === l;
          return (
            <button
              key={l}
              type="button"
              aria-pressed={on}
              aria-label={`${name}: ${LEVEL_LABEL[l]}`}
              disabled={locked}
              onClick={() => onPick(l)}
              className={`type-label inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-surface px-3 sm:min-w-[88px] ${
                on ? "border-2 border-action text-action" : "border border-border-strong text-text hover:enabled:bg-surface-hover"
              } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {on && <Icon name="check" size={16} />}
              {LEVEL_LABEL[l]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
