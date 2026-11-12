"use client";
/**
 * The design's report cards (`isCards`, design lines 851–863) for Reports › Popular, Sales, Money
 * and Stock: a file icon, the title, the per-report description and a Run (or Coming soon) button.
 * Run opens the report view in place of the cards (feature 009; the open report lives in the URL).
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { REPORT_CARDS, periodFromSlug, periodSlug, reportFromSlug, reportSlug, useReportPeriod, type ModuleId } from "@/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { NewRecordDrawer } from "./NewRecordDrawer";
import { ReportView } from "./ReportView";

export function ReportCards({ moduleId, tab }: { moduleId: ModuleId; tab: string }) {
  const cards = REPORT_CARDS[`${moduleId}/${tab}`] ?? [];
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastPeriod = useReportPeriod();
  const open = reportFromSlug(params.get("report"));
  const onTab = open && cards.some((c) => c.title === open && c.runnable) ? open : null;

  if (onTab) return <ReportView key={onTab} name={onTab} period={periodFromSlug(params.get("period")) ?? lastPeriod} />;

  return (
    <>
      <ul className="m-0 grid list-none gap-4 p-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }} aria-label="Reports">
        {cards.map((r) => (
          <li key={r.title} className="flex">
            <Card className="flex-1" bodyClassName="flex">
              <div className="flex h-full flex-1 flex-col gap-3">
                <span className="grid size-9 place-items-center rounded-sm bg-green-50 text-green-600" aria-hidden="true">
                  <Icon name="file-text" size={18} />
                </span>
                <div className="flex-1">
                  <div className="type-title text-text">{r.title}</div>
                  <div className="type-small mt-0.5 text-text-muted">{r.desc}</div>
                </div>
                <div className="flex justify-end">
                  {r.runnable ? (
                    <Button
                      size="sm"
                      icon="chevron-right"
                      aria-label={`Run ${r.title}`}
                      onClick={() => router.push(`${pathname}?${new URLSearchParams({ report: reportSlug(r.title), period: periodSlug(lastPeriod) })}`, { scroll: false })}
                    >
                      Run
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      Coming soon
                    </Button>
                  )}
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
