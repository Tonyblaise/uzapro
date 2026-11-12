"use client";
/**
 * Upload file (design `isDocUpload`, markup lines 2746–2765, logic `docPick` / `docUploadSave`).
 * Only the chosen file's name and size are read; its content is never read or kept.
 */
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { baseName, createFolder, docExt, docSize, folderOptions, uploadFile, useDocs } from "@/data";
import { NotesField, PENDING } from "./shared";

export function UploadForm({ folder: initial, onDone }: { folder: string; onDone: () => void }) {
  const { folders } = useDocs();
  const input = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{ name: string; bytes: number } | null>(null);
  const [name, setName] = useState("");
  const [folder, setFolder] = useState(initial);
  const [notes, setNotes] = useState("");

  const onPick = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    setPicked({ name: f.name, bytes: f.size });
    setName(baseName(f.name));
    if (input.current) input.current.value = "";
  };
  const onCreate = (n: string) => {
    void createFolder(n).then((r) => r.ok && setFolder(r.value.id));
    return PENDING;
  };
  const save = async () => {
    if (!picked) return;
    const r = await uploadFile({ name, fileName: picked.name, bytes: picked.bytes, folder, notes });
    if (r.ok) onDone();
  };
  const ext = picked ? docExt(picked.name) : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-md bg-grey-100 p-3">
        <span className="text-text-muted">
          <Icon name="file-text" size={18} />
        </span>
        <span className="type-small min-w-0 flex-1 truncate text-text-secondary">{picked ? `${picked.name} · ${docSize(picked.bytes / 1024)}` : "No file chosen"}</span>
        <input ref={input} type="file" aria-label="Choose a file to upload" className="sr-only" tabIndex={-1} onChange={(e) => onPick(e.target.files)} />
        <Button variant="secondary" size="sm" onClick={() => input.current?.click()}>
          {picked ? "Change file" : "Choose file"}
        </Button>
      </div>
      <Input label="File name" placeholder="Enter a name" value={name} suffix={ext || undefined} onChange={(e) => setName(e.target.value)} />
      <SearchSelect label="Folder" noun="folder" options={folderOptions(folders)} value={folder} onChange={(v) => v !== PENDING && setFolder(v)} onCreate={onCreate} />
      <NotesField id="doc-up-notes" rows={4} value={notes} onChange={setNotes} />
      <div className="flex gap-2">
        <Button icon="upload" disabled={!picked || !name.trim()} onClick={() => void save()}>
          Upload
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
