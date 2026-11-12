"use client";
/**
 * The design's generic record drawer (`record`, design lines 1517–1543): the first cell as the
 * title, the row's status pill, then an "Overview" label/value list of every column. The design's
 * Edit, Duplicate and Print buttons have no handlers, so they render disabled.
 */
import { cellText, type Column, type GenericRow, type ModuleId } from "@/data";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { GenericDrawer } from "./shared";

export function RecordDrawer({ moduleId, columns, row, onClose }: { moduleId: ModuleId; columns: readonly Column[]; row: GenericRow; onClose: () => void }) {
  const status = row.find((c) => typeof c === "object");
  return (
    <GenericDrawer moduleId={moduleId} title={cellText(row[0])} onClose={onClose}>
      <div className="flex flex-col gap-5">
        {status && typeof status === "object" && (
          <div>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>
        )}
        <div>
          <div className="type-card-title mb-2 text-text">Overview</div>
          {columns.map((c, i) => {
            const v = row[i];
            return (
              <div key={c.title} className="flex items-center justify-between gap-4 border-t border-border py-3">
                <span className="type-eyebrow flex-none text-text-muted">{c.title}</span>
                {v && typeof v === "object" ? (
                  <StatusPill tone={v.tone}>{v.label}</StatusPill>
                ) : (
                  <span className="type-label u-num text-right text-text">{v ?? "—"}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon="pencil" disabled>
            Edit
          </Button>
          <Button variant="secondary" disabled>
            Duplicate
          </Button>
          <Button variant="secondary" icon="printer" disabled>
            Print
          </Button>
        </div>
      </div>
    </GenericDrawer>
  );
}
