import type { ReactNode } from "react";

/** DS PageHeader: eyebrow, h1 title, subtitle, actions on the right. */
export function PageHeader({ title, subtitle, eyebrow, actions }: { title: ReactNode; subtitle?: ReactNode; eyebrow?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="type-eyebrow mb-1 text-text-muted">{eyebrow}</div>}
        <h1 className="type-h1 m-0 text-text">{title}</h1>
        {subtitle && <div className="type-body mt-1 text-text-muted">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
