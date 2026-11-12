"use client";
/** Helpers shared by the File Manager screens (design `docsView`, `docsDrawer`; research R3). */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { FileKind } from "@/data";
import { date as fmtDate } from "@/lib/format";

/** The design's drawer subtitle is the module name (`drawerCrumb: m.n`). */
export const CRUMB = "File Manager";

/** The design's drawer width for every File Manager drawer. */
export const DRAWER_WIDTH = 440;

/** Sentinel returned to SearchSelect by an inline "New folder": the real id arrives asynchronously. */
export const PENDING = "__pending_folder__";

/** The design's `docDate`: "28 Oct 2026". */
export const docDate = (iso: string) => fmtDate(iso);

/**
 * Overlay and folder state lives in the URL (contracts/routes.md): `?dir=<folderId>` is the open
 * folder; `?action=folder|upload` and `?view=<id>[&kind=folder][&step=edit|delete]` are the drawers.
 * `go` keeps `dir` unless it is given (null removes it).
 */
export interface DocsUrl {
  dir?: string | null;
  action?: string;
  view?: string;
  kind?: string;
  step?: string;
}

export function useDocsUrl() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dir = params.get("dir");
  const go = useCallback(
    (next: DocsUrl) => {
      const q = new URLSearchParams();
      const d = next.dir === undefined ? dir : next.dir;
      if (d) q.set("dir", d);
      for (const k of ["action", "view", "kind", "step"] as const) {
        const v = next[k];
        if (v) q.set(k, v);
      }
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [router, pathname, dir],
  );
  return { params, dir, go };
}

/** Item look (design `look`): icon, chip background, icon colour. */
export type DocLook = "Folder" | FileKind;
export const LOOK: Record<DocLook, { icon: string; chip: string; color: string }> = {
  Folder: { icon: "folder", chip: "bg-warning-soft", color: "text-warning-text" },
  Image: { icon: "image", chip: "bg-green-50", color: "text-green-600" },
  Spreadsheet: { icon: "sheet", chip: "bg-green-50", color: "text-green-700" },
  PDF: { icon: "file-text", chip: "bg-danger-soft", color: "text-danger-text" },
  Document: { icon: "file-text", chip: "bg-info-soft", color: "text-info-text" },
};

/** Design icons for files and folders (all in the shared Icon map). */
export function DocIcon({ name, size }: { name: string; size: number }) {
  return <Icon name={name} size={size} />;
}

/** The design's star toggle (an outlined or filled star). */
export function StarButton({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={on ? "Remove star" : "Add star"}
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`inline-flex cursor-pointer border-0 bg-transparent p-1 ${on ? "text-warning" : "text-text-muted"}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? "var(--warning)" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.3" />
      </svg>
    </button>
  );
}

/** Drawer detail rows (eyebrow label, value right-aligned). */
export function FieldRows({ rows }: { rows: { label: string; text: ReactNode }[] }) {
  return (
    <div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4 border-t border-border py-3">
          <span className="type-eyebrow flex-none text-text-muted">{r.label}</span>
          <span className="type-label u-num text-right text-text">{r.text}</span>
        </div>
      ))}
    </div>
  );
}

/** Notes block of the file and folder drawers. */
export function NotesBlock({ notes, className = "" }: { notes: string; className?: string }) {
  if (!notes) return null;
  return (
    <div className={className}>
      <div className="type-eyebrow mb-2 text-text-muted">Notes</div>
      <div className="type-body whitespace-pre-wrap text-text [overflow-wrap:anywhere]">{notes}</div>
    </div>
  );
}

/** The design's plain textarea with a label (`doc-ed-notes`, `doc-up-notes`). */
export function NotesField({ id, rows, value, onChange }: { id: string; rows: number; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-label text-text">
        Notes
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder="Optional"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="type-body w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2 text-text outline-none focus:border-action focus:shadow-[0_0_0_3px_var(--green-100)]"
      />
    </div>
  );
}
