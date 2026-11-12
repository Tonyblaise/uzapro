import Link from "next/link";
import { hrefFor } from "@/config/modules";
import type { QuickTask } from "@/data";
import { Icon } from "@/components/ui/Icon";

/** "What would you like to do?" task tiles (canvas `v.tasks`, simple home). */
export function QuickTasks({ tasks }: { tasks: readonly QuickTask[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="type-card-title m-0 text-text">What would you like to do?</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--grid-kpi-min),1fr))] gap-4">
        {tasks.map((t) => (
          <Link
            key={t.title}
            href={hrefFor(t.module, t.tab, t.action ? { action: t.action } : undefined)}
            className="flex flex-col gap-3 rounded-md bg-surface p-5 text-left no-underline transition-colors duration-150 hover:bg-green-50"
          >
            <span className="grid size-10 place-items-center rounded-md bg-green-50 text-green-600">
              <Icon name={t.icon} size={18} />
            </span>
            <span>
              <span className="type-title block text-text">{t.title}</span>
              <span className="type-small mt-0.5 block text-text-muted">{t.subtitle}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
