"use client";
/**
 * The design's report cards (`isCards`, design lines 842–858) for Reports › Popular, Sales, Money
 * and Stock: a file icon, the title and "Run, schedule or export". The cards are not clickable in
 * the design (Clarification Q1).
 */
import { REPORT_CARDS, type ModuleId } from "@/data";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { NewRecordDrawer } from "./NewRecordDrawer";

export function ReportCards({ moduleId, tab }: { moduleId: ModuleId; tab: string }) {
  const cards = REPORT_CARDS[`${moduleId}/${tab}`] ?? [];
  return (
    <>
      <ul className="m-0 grid list-none gap-4 p-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }} aria-label="Reports">
        {cards.map((r) => (
          <li key={r.title} className="flex">
            <Card className="flex-1">
              <div className="flex flex-col gap-3">
                <span className="grid size-9 place-items-center rounded-sm bg-green-50 text-green-600" aria-hidden="true">
                  <Icon name="file-text" size={18} />
                </span>
                <div>
                  <div className="type-title text-text">{r.title}</div>
                  <div className="type-small mt-0.5 text-text-muted">{r.desc}</div>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <NewRecordDrawer moduleId={moduleId} />
    </>
  );
}
