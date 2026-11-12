/** File Manager pure helpers (design `docsData`, `docsView`, `docsDrawer`, `docSubtree`; research R3). */
import type { DocFile, FileKind, Folder, FolderStats, StorageTotals } from "./types";

export const ROOT_FOLDER = "company";

/** Display type by extension (design `kind`). */
export function fileKind(name: string): FileKind {
  const e = (name.split(".").pop() ?? "").toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(e)) return "Image";
  if (["xls", "xlsx", "csv"].includes(e)) return "Spreadsheet";
  if (e === "pdf") return "PDF";
  return "Document";
}

/** ".pdf" or "" (design `docExt`: a leading dot is not an extension). */
export function docExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i) : "";
}

/** The name without its extension, for the edit and upload fields. */
export function baseName(name: string): string {
  const ext = docExt(name);
  return ext ? name.slice(0, -ext.length) : name;
}

/** A rename keeps the old extension: keepExtension("x.pdf", "y") → "y.pdf". */
export function keepExtension(oldName: string, typed: string): string {
  return typed.trim() + docExt(oldName);
}

/** The folder and every folder below it (design `docSubtree`). */
export function subtree(folders: readonly Folder[], id: string): string[] {
  const ids = [id];
  for (let i = 0; i < ids.length; i++) for (const f of folders) if (f.parent === ids[i]) ids.push(f.id);
  return ids;
}

/** Folder name, "Company" for the root or an unknown id (design `docName`). */
export function folderName(folders: readonly Folder[], id: string | null | undefined): string {
  return folders.find((f) => f.id === id)?.name ?? "Company";
}

/** Breadcrumb trail from the top level down to `id` (excludes "company" and "All files"). */
export function folderPath(folders: readonly Folder[], id: string | null | undefined): Folder[] {
  const trail: Folder[] = [];
  const seen = new Set<string>();
  for (let cur = id; cur && cur !== ROOT_FOLDER && !seen.has(cur); ) {
    seen.add(cur);
    const f = folders.find((x) => x.id === cur);
    if (!f) break;
    trail.unshift(f);
    cur = f.parent;
  }
  return trail;
}

/** Folder pickers: "Company" first, then every folder by name (design `docOptions`). */
export function folderOptions(folders: readonly Folder[]): { value: string; label: string }[] {
  return [{ value: ROOT_FOLDER, label: "Company" }].concat(
    folders.map((f) => ({ value: f.id, label: f.name })).sort((a, b) => a.label.localeCompare(b.label)),
  );
}

/** Storage ring totals in KB (design `stat`). Documents = PDF + Document. */
export function storageTotals(files: readonly DocFile[]): StorageTotals {
  const sum = (pred: (k: FileKind) => boolean) => files.reduce((a, f) => a + (pred(fileKind(f.name)) ? f.size : 0), 0);
  return {
    total: sum(() => true),
    images: sum((k) => k === "Image"),
    documents: sum((k) => k === "PDF" || k === "Document"),
    spreadsheets: sum((k) => k === "Spreadsheet"),
  };
}

/** Ring fill, 2–100 % of the 5 GB quota (design `pct`). */
export function storagePct(kb: number): number {
  return Math.max(2, Math.min(100, (kb / (5 * 1024 * 1024)) * 100));
}

/** "412 KB" / "1.8 MB" (design `docSize`). */
export function docSize(kb: number): string {
  return kb < 1024 ? `${Math.max(1, Math.round(kb))} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

/** "3 items" / "1 item": subfolders plus files directly inside (design `count`). */
export function folderItemCount(folders: readonly Folder[], files: readonly DocFile[], id: string): string {
  const n = folders.filter((x) => x.parent === id).length + files.filter((x) => x.folder === id).length;
  return `${n} ${n === 1 ? "item" : "items"}`;
}

/** The delete confirmation body (design `docsDrawer` › docConfirm). */
export function deleteDocText(folders: readonly Folder[], files: readonly DocFile[], kind: "file" | "folder", id: string): string {
  if (kind === "file") return "This permanently deletes the file.";
  const ids = subtree(folders, id);
  const nf = ids.length - 1;
  const nd = files.filter((x) => ids.includes(x.folder)).length;
  if (nf + nd === 0) return "This permanently deletes the folder. It is empty.";
  return `This permanently deletes the folder and everything in it: ${nf}${nf === 1 ? " subfolder and " : " subfolders and "}${nd}${nd === 1 ? " file." : " files."}`;
}

/** Folder-info drawer fields; `id` null = the whole company (design `docsDrawer` › docFolder). */
export function folderStats(folders: readonly Folder[], files: readonly DocFile[], id: string | null): FolderStats {
  const cur = id ? folders.find((x) => x.id === id) : undefined;
  const ids = id ? subtree(folders, id) : null;
  const inside = ids ? files.filter((x) => ids.includes(x.folder)) : files;
  return {
    location: cur ? folderName(folders, cur.parent) : "Top level",
    access: cur ? cur.access : "Set per folder",
    folders: ids ? ids.length - 1 : folders.length,
    files: inside.length,
    size: inside.reduce((a, x) => a + x.size, 0),
  };
}
