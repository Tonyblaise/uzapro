"use client";
/**
 * File Manager › All documents (design `docsView`, markup lines 1154–1208): storage rings, the
 * "All Files" toolbar, breadcrumbs from `?dir=`, grid cards or the list table, and the empty states.
 */
import { useMemo, useState, type KeyboardEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { Table, type DataColumn } from "@/components/ui/DataTable";
import {
  DOC_SORT_OPTIONS,
  DOC_TYPE_OPTIONS,
  docSize,
  fileKind,
  folderItemCount,
  folderPath,
  setSearch,
  storagePct,
  toggleStar,
  useDocs,
  useSearch,
  useStorageTotals,
  type DocKind,
} from "@/data";
import { FileOverlays } from "./FileOverlays";
import { DocIcon, LOOK, StarButton, docDate, useDocsUrl, type DocLook } from "./shared";

type DocType = (typeof DOC_TYPE_OPTIONS)[number];
type DocSort = (typeof DOC_SORT_OPTIONS)[number];

interface Item {
  id: string;
  kind: DocKind;
  name: string;
  type: DocLook;
  size: string;
  modified: string;
  owner: string;
  sub: string;
  on: boolean;
}

/** One storage ring (design `stat`): the conic fill uses the ring's token colour. */
function Ring({ label, icon, color, kb }: { label: string; icon: string; color: string; kb: number }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
      <span className="grid size-[52px] flex-none place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${storagePct(kb)}%, var(--border) 0)` }} aria-hidden="true">
        <span className="grid size-[42px] place-items-center rounded-full bg-surface" style={{ color }}>
          <DocIcon name={icon} size={20} />
        </span>
      </span>
      <span className="min-w-0">
        <span className="type-small block text-text-muted">{label}</span>
        <span className="type-title u-num block text-text">{docSize(kb)}</span>
        <span className="type-caption block text-text-muted">of 5 GB</span>
      </span>
    </div>
  );
}

function Chip({ type, size, round }: { type: DocLook; size: number; round: string }) {
  const l = LOOK[type];
  return (
    <span className={`grid flex-none place-items-center ${round} ${l.chip} ${l.color}`} style={{ width: size, height: size }} aria-hidden="true">
      <DocIcon name={l.icon} size={size === 44 ? 22 : 18} />
    </span>
  );
}

export function FileManager() {
  const { folders, files, starred } = useDocs();
  const totals = useStorageTotals();
  const q = useSearch();
  const { dir, go } = useDocsUrl();
  const [type, setType] = useState<DocType>("All file types");
  const [sort, setSort] = useState<DocSort>("Newest first");
  const [view, setView] = useState<"grid" | "list">("grid");

  const needle = q.trim().toLowerCase();
  const items = useMemo<Item[]>(() => {
    const stars = new Set(starred);
    let fo = needle ? folders.filter((f) => `${f.name} ${f.notes}`.toLowerCase().includes(needle)) : dir ? folders.filter((f) => f.parent === dir) : folders;
    let fi = needle ? files.filter((f) => `${f.name} ${f.linked} ${f.notes}`.toLowerCase().includes(needle)) : dir ? files.filter((f) => f.folder === dir) : files;
    const want = ({ Images: ["Image"], Documents: ["PDF", "Document"], Spreadsheets: ["Spreadsheet"] } as Partial<Record<DocType, string[]>>)[type];
    if (type === "Folders") fi = [];
    if (want) {
      fo = [];
      fi = fi.filter((f) => want.includes(fileKind(f.name)));
    }
    if (type === "Starred") {
      fo = fo.filter((f) => stars.has(f.id));
      fi = fi.filter((f) => stars.has(f.id));
    }
    fi = fi.slice().sort((a, b) => (sort === "Oldest first" ? a.modified.localeCompare(b.modified) : b.modified.localeCompare(a.modified)));
    return [
      ...fo.map((f): Item => {
        const count = folderItemCount(folders, files, f.id);
        return { id: f.id, kind: "folder", name: f.name, type: "Folder", size: count, modified: "—", owner: "—", sub: count, on: stars.has(f.id) };
      }),
      ...fi.map((f): Item => {
        const t = fileKind(f.name);
        return { id: f.id, kind: "file", name: f.name, type: t, size: docSize(f.size), modified: docDate(f.modified), owner: f.owner, sub: `${docSize(f.size)} • ${t}`, on: stars.has(f.id) };
      }),
    ];
  }, [folders, files, starred, needle, dir, type, sort]);

  /** The design's `docOpenDir`: open a folder and clear the search. */
  const openDir = (id: string | null) => {
    setSearch("");
    go({ dir: id });
  };
  const open = (it: Item) => (it.kind === "folder" ? openDir(it.id) : go({ view: it.id }));
  const actions = (it: Item): MenuItem[] => [
    { label: "View", onClick: () => open(it) },
    { label: "Edit", onClick: () => go({ view: it.id, kind: it.kind === "folder" ? "folder" : undefined, step: "edit" }) },
    { label: "Delete", danger: true, onClick: () => go({ view: it.id, kind: it.kind === "folder" ? "folder" : undefined, step: "delete" }) },
  ];
  const star = (it: Item) => () => void toggleStar(it.id);

  const crumbs = [{ label: "All files", id: null as string | null }, ...folderPath(folders, dir).map((f) => ({ label: f.name, id: f.id as string | null }))];
  const inFolder = !!dir && !needle;

  const columns: DataColumn<Item>[] = [
    {
      key: "name",
      title: "Name",
      render: (r) => (
        <span className="inline-flex items-center gap-3 font-medium text-text">
          <Chip type={r.type} size={36} round="rounded-sm" />
          {r.name}
        </span>
      ),
    },
    { key: "size", title: "Size" },
    { key: "type", title: "Type" },
    { key: "modified", title: "Modified" },
    { key: "owner", title: "Owner" },
    { key: "_star", title: "", render: (r) => <StarButton on={r.on} onToggle={star(r)} /> },
    { key: "_act", title: "Actions", numeric: true, render: (r) => <RowActions items={actions(r)} /> },
  ];

  const onCardKey = (it: Item) => (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(it);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="uz-c4 uz-c4-four">
        <Ring label="Total storage" icon="folder" color="var(--grey-700)" kb={totals.total} />
        <Ring label="Images" icon="image" color="var(--green-600)" kb={totals.images} />
        <Ring label="Documents" icon="file-text" color="var(--info)" kb={totals.documents} />
        <Ring label="Spreadsheets" icon="sheet" color="var(--green-700)" kb={totals.spreadsheets} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="type-card-title m-0 mr-2 text-text">All Files</h2>
        <div className="w-[170px]">
          <SearchSelect noun="File type" options={DOC_TYPE_OPTIONS} value={type} onChange={(v) => setType(v as DocType)} />
        </div>
        <div className="w-[170px]">
          <SearchSelect noun="Sort order" options={DOC_SORT_OPTIONS} value={sort} onChange={(v) => setSort(v as DocSort)} />
        </div>
        <div className="flex-1" />
        <div className="min-w-[180px] flex-[0_1_280px]">
          <Input icon="search" placeholder="Search by file name" aria-label="Search by file name" value={q} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 rounded-md bg-surface p-0.5" role="group" aria-label="View">
          {(
            [
              ["list", "list", "List view"],
              ["grid", "layout-grid", "Grid view"],
            ] as const
          ).map(([v, icon, label]) => (
            <button
              key={v}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`inline-grid size-[30px] place-items-center rounded-sm border p-0 ${view === v ? "border-transparent bg-action-soft text-green-700" : "border-transparent bg-transparent text-text hover:bg-grey-100"}`}
            >
              <DocIcon name={icon} size={16} />
            </button>
          ))}
        </div>
      </div>

      {inFolder && (
        <nav aria-label="Folder path" className="flex flex-wrap items-center gap-1">
          {crumbs.map((c, i) => (
            <span key={c.id ?? "root"} className="inline-flex items-center gap-1">
              {i > 0 && (
                <span className="text-text-muted" aria-hidden="true">
                  <Icon name="chevron-right" size={14} />
                </span>
              )}
              <button
                type="button"
                onClick={() => openDir(c.id)}
                aria-current={i === crumbs.length - 1 ? "page" : undefined}
                className={`type-label cursor-pointer border-0 bg-transparent p-1 ${i === crumbs.length - 1 ? "text-text" : "text-text-muted"}`}
              >
                {c.label}
              </button>
            </span>
          ))}
        </nav>
      )}

      {items.length === 0 && (
        <Card>
          <div className="type-small text-text-muted">{needle ? "No files match that search." : "Nothing here yet."}</div>
        </Card>
      )}

      {items.length > 0 && view === "grid" && (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>
          {items.map((it) => (
            <div
              key={it.id}
              role="button"
              tabIndex={0}
              aria-label={it.name}
              title={it.name}
              onClick={() => open(it)}
              onKeyDown={onCardKey(it)}
              className="flex min-w-0 cursor-pointer flex-col gap-3 rounded-md border border-border bg-surface p-4 hover:bg-surface-hover focus-visible:bg-surface-hover"
            >
              <div className="flex items-center justify-between gap-2">
                <Chip type={it.type} size={44} round="rounded-md" />
                <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5">
                  <StarButton on={it.on} onToggle={star(it)} />
                  <RowActions items={actions(it)} />
                </span>
              </div>
              <div className="min-w-0">
                <div className="type-label truncate text-text">{it.name}</div>
                <div className="type-small mt-0.5 truncate text-text-muted">{it.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && view === "list" && (
        <Card flush>
          <Table columns={columns} rows={items} rowKey={(r) => r.id} onRowClick={open} />
        </Card>
      )}

      <FileOverlays />
    </div>
  );
}
