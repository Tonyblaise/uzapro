"use client";
/**
 * Helpers shared by the Accounts screens: URL-driven overlays (contracts/routes.md), the design's
 * account-type looks, list cells and the generic `record` drawer.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import type { AccountType, Pill } from "@/data";
import { Button } from "@/components/ui/Button";
import type { IconName } from "@/components/ui/Icon";
import { Drawer } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { date as fmtDate, num } from "@/lib/format";

/** Module name, used as the drawer subtitle (design `drawerCrumb: m.n`). */
export const CRUMB = "Accounts";

/** The design's list amounts: `toLocaleString('en-KE')`. */
export const fmt = (n: number) => num(n);

/** Two-decimal amounts (`toLocaleString('en-KE', { minimumFractionDigits: 2 })`). */
export const fmt2 = (n: number) => Math.round(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The design's `docDate`: "1 Nov 2026" from an ISO date. */
export const docDate = (iso: string) => (iso ? fmtDate(iso) : "");

/** Overlay state lives in the URL: `?action=account|deposit|withdrawal|transfer`, `?view=…`, `?record=…` (Transactions). */
export function useFinOverlay() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback(
    (next: Record<string, string | undefined>) => {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) if (v !== undefined && v !== "") q.set(k, v);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { params, open, close };
}

/** The design's `looks`: account type → icon and text colour class. */
export const LOOKS: Record<AccountType, { icon: IconName; color: string }> = {
  Bank: { icon: "landmark", color: "text-info-text" },
  "Mobile money": { icon: "smartphone", color: "text-green-700" },
  Cash: { icon: "banknote", color: "text-warning-text" },
  "Petty cash": { icon: "wallet", color: "text-warning-text" },
};

/** Page body stack used by every list (`gap: var(--space-3)`). */
export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

/** `{ main, note }` cell. */
export function MainNote({ main, note }: { main: ReactNode; note?: ReactNode }) {
  return (
    <span className="inline-flex flex-col">
      <span className="text-text">{main}</span>
      {note ? <span className="type-caption text-text-muted">{note}</span> : null}
    </span>
  );
}

/** Signed ledger amount (design `{ amt }` cell): "+ 18,450" green, "− 42,300" red. */
export const signed = (amt: number) => `${amt < 0 ? "− " : "+ "}${fmt(Math.abs(amt))}`;

export function SignedAmount({ amt }: { amt: number }) {
  return <span className={`u-num font-semibold ${amt < 0 ? "text-danger-text" : "text-success-text"}`}>{signed(amt)}</span>;
}

export interface RecordField {
  label: string;
  text: string;
  pill?: Pill;
}

/**
 * The design's generic record drawer (`isRecord`): the row's status pill, "Overview" with one
 * line per column, and the Edit / Duplicate / Print buttons (no actions in the design).
 */
export function RecordDrawer({ title, fields, onClose }: { title: string; fields: RecordField[]; onClose: () => void }) {
  const status = fields.find((f) => f.pill)?.pill;
  return (
    <Drawer open title={title} subtitle={CRUMB} onClose={onClose} width={440}>
      <div className="flex flex-col gap-5">
        {status && (
          <div>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>
        )}
        <div>
          <div className="type-card-title mb-2 text-text">Overview</div>
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-4 border-t border-border py-3">
              <span className="type-eyebrow flex-none text-text-muted">{f.label}</span>
              {f.pill ? <StatusPill tone={f.pill.tone}>{f.pill.label}</StatusPill> : <span className="type-label u-num text-right text-text">{f.text || "—"}</span>}
            </div>
          ))}
        </div>
        {/* The design's generic record drawer shows these buttons without actions. */}
        <div className="flex flex-wrap gap-2">
          <Button icon="pencil">Edit</Button>
          <Button variant="secondary">Duplicate</Button>
          <Button variant="secondary" icon="printer">
            Print
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
