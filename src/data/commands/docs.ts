/**
 * File Manager commands (feature 005, US2). Wording from the design's `docCreate`, `docUploadSave`,
 * `docEditSave`, `docMove`, `docRemove` and `docDownload` (research R3). Uploads keep only the name,
 * size and owner; file contents are never stored or sent anywhere.
 */
import { docExt, folderName, keepExtension, ROOT_FOLDER, subtree } from "../docs";
import { currentUserName } from "../profile";
import { getStore, showToast } from "../store";
import { fail, ok, type DocFile, type DocKind, type Folder, type Result, type UploadInput } from "../types";

/** The design stamps uploads and edited files with this date. */
const DOC_TODAY = "2026-11-01";
let seq = 0;
const newId = (p: string) => `${p}${Date.now().toString(36)}${seq++}`;

/** "Create" in New folder: the folder takes its parent's access ("All staff" at the top level). */
export async function createFolder(name: string, parent: string = ROOT_FOLDER): Promise<Result<Folder>> {
  const n = name.trim();
  if (!n) return fail("Enter a folder name.");
  const store = getStore();
  const folders = store.getState().docs.folders;
  const up = folders.find((f) => f.id === parent);
  const folder: Folder = { id: newId("n"), name: n, parent, access: up ? up.access : "All staff", notes: "" };
  store.setState((s) => ({ docs: { ...s.docs, folders: [...s.docs.folders, folder] } }));
  const message = `${n} created in ${folderName(folders, parent)}.`;
  showToast(message);
  return ok(folder, message);
}

/** "Upload": blocked without a chosen file or a name. The chosen file's extension is kept. */
export async function uploadFile(input: UploadInput): Promise<Result<DocFile>> {
  const typed = input.name.trim();
  if (!input.fileName || !typed) return fail("Choose a file and give it a name.");
  const store = getStore();
  const s0 = store.getState();
  const name = typed + docExt(input.fileName);
  const file: DocFile = {
    id: newId("u"),
    name,
    folder: input.folder || "inbox",
    size: input.bytes / 1024,
    modified: DOC_TODAY,
    owner: currentUserName(s0),
    linked: "—",
    notes: input.notes.trim(),
  };
  store.setState((s) => ({ docs: { ...s.docs, files: [file, ...s.docs.files] } }));
  const message = `${name} added to ${folderName(s0.docs.folders, file.folder)}.`;
  showToast(message);
  return ok(file, message);
}

/** "Save" in Edit file / Edit folder: a file keeps its extension. Blocked with an empty name. */
export async function renameDoc(kind: DocKind, id: string, name: string, notes: string): Promise<Result<void>> {
  const typed = name.trim();
  if (!typed) return fail("Enter a name.");
  const store = getStore();
  const { docs } = store.getState();
  if (kind === "file") {
    if (!docs.files.some((f) => f.id === id)) return fail("That file is no longer listed.");
    store.setState((s) => ({
      docs: { ...s.docs, files: s.docs.files.map((f) => (f.id === id ? { ...f, name: keepExtension(f.name, typed), notes: notes.trim(), modified: DOC_TODAY } : f)) },
    }));
  } else {
    if (!docs.folders.some((f) => f.id === id)) return fail("That folder is no longer listed.");
    store.setState((s) => ({ docs: { ...s.docs, folders: s.docs.folders.map((f) => (f.id === id ? { ...f, name: typed, notes: notes.trim() } : f)) } }));
  }
  const message = "Changes saved.";
  showToast(message);
  return ok(undefined, message);
}

/** The file drawer's Folder select. */
export async function moveFile(id: string, folder: string): Promise<Result<void>> {
  const store = getStore();
  if (!store.getState().docs.files.some((f) => f.id === id)) return fail("That file is no longer listed.");
  store.setState((s) => ({ docs: { ...s.docs, files: s.docs.files.map((f) => (f.id === id ? { ...f, folder } : f)) } }));
  const message = `Moved to ${folderName(store.getState().docs.folders, folder)}.`;
  showToast(message);
  return ok(undefined, message);
}

/**
 * "Delete" after the confirmation. A folder takes its whole subtree and every file in it. Returns
 * the folder to show next: when `openDir` was inside the deleted folder, its parent (null = All
 * files); otherwise `openDir` unchanged.
 */
export async function deleteDoc(kind: DocKind, id: string, openDir: string | null = null): Promise<Result<{ dir: string | null }>> {
  const store = getStore();
  const { docs } = store.getState();
  let dir = openDir;
  let name: string;
  if (kind === "file") {
    const f = docs.files.find((x) => x.id === id);
    if (!f) return fail("That file is no longer listed.");
    name = f.name;
    store.setState((s) => ({ docs: { ...s.docs, files: s.docs.files.filter((x) => x.id !== id), starred: s.docs.starred.filter((x) => x !== id) } }));
  } else {
    const f = docs.folders.find((x) => x.id === id);
    if (!f) return fail("That folder is no longer listed.");
    name = f.name;
    const ids = subtree(docs.folders, id);
    const gone = new Set([...ids, ...docs.files.filter((x) => ids.includes(x.folder)).map((x) => x.id)]);
    if (openDir && ids.includes(openDir)) dir = f.parent === ROOT_FOLDER ? null : f.parent;
    store.setState((s) => ({
      docs: {
        folders: s.docs.folders.filter((x) => !ids.includes(x.id)),
        files: s.docs.files.filter((x) => !ids.includes(x.folder)),
        starred: s.docs.starred.filter((x) => !gone.has(x)),
      },
    }));
  }
  const message = `${name} deleted.`;
  showToast(message);
  return ok({ dir }, message);
}

/** Star / unstar a file or folder. No message. Returns the new state. */
export async function toggleStar(id: string): Promise<Result<boolean>> {
  const store = getStore();
  const on = !store.getState().docs.starred.includes(id);
  store.setState((s) => ({ docs: { ...s.docs, starred: on ? [...s.docs.starred, id] : s.docs.starred.filter((x) => x !== id) } }));
  return ok(on, "");
}

/** "Download" in the file drawer: a message only, no file is saved. */
export async function downloadFile(id: string): Promise<Result<void>> {
  const f = getStore().getState().docs.files.find((x) => x.id === id);
  if (!f) return fail("That file is no longer listed.");
  const message = `Downloading ${f.name}.`;
  showToast(message);
  return ok(undefined, message);
}
