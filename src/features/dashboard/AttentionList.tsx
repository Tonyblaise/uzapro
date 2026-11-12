import Link from "next/link";
import { hrefFor } from "@/config/modules";
import type { Alert } from "@/data";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const DOT: Partial<Record<Alert["tone"], string>> = { danger: "bg-danger", warning: "bg-warning" };

/** "Needs your attention" rows (canvas `v.attention`, simple home). */
export function AttentionList({ items }: { items: readonly Alert[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="type-card-title m-0 text-text">Needs your attention</h2>
      <Card flush>
        {items.map((a) => (
          <Link
            key={a.title}
            href={hrefFor(a.module, a.tab)}
            className="flex w-full items-center gap-3 border-b border-border px-5 py-4 text-left no-underline hover:bg-surface-hover"
          >
            <span aria-hidden="true" className={`size-2 flex-none rounded-full ${DOT[a.tone] ?? "bg-neutral"}`} />
            <span className="min-w-0 flex-1">
              <span className="type-label block text-text">{a.title}</span>
              <span className="type-small block text-text-muted">{a.subtitle}</span>
            </span>
            <span className="text-text-muted">
              <Icon name="chevron-right" size={16} />
            </span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
