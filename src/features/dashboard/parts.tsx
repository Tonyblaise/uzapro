import Link from "next/link";
import type { ReactNode } from "react";
import { num } from "@/lib/format";

/** The home `money` helper: "KES 1.31M" from a million up, else "KES 807,300". */
export function homeMoney(n: number): string {
  return n >= 1_000_000 ? `KES ${(n / 1_000_000).toFixed(2)}M` : `KES ${num(n)}`;
}

/** Panel header row: card title on the left, optional text link on the right. */
export function PanelHead({ title, link }: { title: string; link?: { label: string; href: string } }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="type-card-title m-0 text-text">{title}</h2>
      {link && (
        <Link href={link.href} className="type-small font-medium text-link">
          {link.label}
        </Link>
      )}
    </div>
  );
}

/**
 * The home `ranked` list: each name sits on a pale green bar sized to its share of the top value,
 * with the formatted amount on the right.
 */
export function RankedList({ rows, format, label }: { rows: readonly (readonly [string, number])[]; format: (v: number) => string; label: string }) {
  const top = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <ul aria-label={label} className="m-0 list-none p-0">
      {rows.map(([name, v]) => (
        <li key={name} className="type-body u-num grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-1 text-text">
          <span className="relative min-w-0 px-2 py-1">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 rounded-sm bg-green-50" style={{ width: `${(v / top) * 100}%` }} />
            <span className="relative block truncate">{name}</span>
          </span>
          <span className="text-right">{format(v)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Flex cell for the design's two-to-one panel rows ("flex:2 1 480px" / "flex:1 1 280px"). */
export function Wide({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-[2_1_480px]">{children}</div>;
}

export function Narrow({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-[1_1_280px]">{children}</div>;
}
