/**
 * The explainer strip above Branches, Location groups and Storage locations (design `structHelp`):
 * one card per part of the structure, the current tab's card highlighted.
 */
import { STRUCT_HELP } from "@/data";

const DOT: Record<(typeof STRUCT_HELP)[number]["tab"], string> = {
  "location-groups": "bg-green-600",
  branches: "bg-info-text",
  "storage-locations": "bg-warning-text",
};

export function StructHelp({ active }: { active: (typeof STRUCT_HELP)[number]["tab"] }) {
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
      {STRUCT_HELP.map((h) => {
        const on = h.tab === active;
        return (
          <div key={h.tab} className={`rounded-md border px-4 py-3 ${on ? "border-green-200 bg-green-50" : "border-border bg-surface"}`}>
            <div className="type-label flex items-center gap-1.5 text-text">
              <span aria-hidden="true" className={`size-2 rounded-full ${DOT[h.tab]}`} />
              {h.title}
            </div>
            <div className="type-small mt-0.5 text-text-secondary">{h.text}</div>
          </div>
        );
      })}
    </div>
  );
}
