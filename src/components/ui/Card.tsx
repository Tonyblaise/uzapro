import type { CSSProperties, ReactNode } from "react";

/** Port of the design system Card: white, radius-md, no border or shadow, optional green cap. */
export function Card({
  title,
  subtitle,
  action,
  cap,
  flush,
  children,
  className = "",
  bodyClassName = "",
  style,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  cap?: boolean;
  /** Edge-to-edge body (tables). */
  flush?: boolean;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={`flex min-w-0 flex-col overflow-hidden rounded-md bg-surface ${cap ? "border-t-[3px] border-green-500" : ""} ${className}`} style={style}>
      {(title || action) && (
        <header className={`flex items-center justify-between gap-3 ${flush ? "px-5 py-4" : "px-5 pt-5"}`}>
          <div className="min-w-0">
            {title && <h2 className="type-card-title m-0 text-text">{title}</h2>}
            {subtitle && <div className="type-small mt-0.5 text-text-muted">{subtitle}</div>}
          </div>
          {action}
        </header>
      )}
      <div className={`min-w-0 flex-1 ${flush ? "" : "p-5"} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
