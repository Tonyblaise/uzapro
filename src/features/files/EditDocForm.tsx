"use client";
/** Edit file / Edit folder (design `isDocEdit`, markup lines 1593–1606, logic `docEditOpen` / `docEditSave`). */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { baseName, docExt, renameDoc, type DocFile, type DocKind, type Folder } from "@/data";
import { NotesField } from "./shared";

export function EditDocForm({ kind, item, onSaved, onCancel }: { kind: DocKind; item: DocFile | Folder; onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState(kind === "file" ? baseName(item.name) : item.name);
  const [notes, setNotes] = useState(item.notes || "");
  const ext = kind === "file" ? docExt(item.name) : "";

  const save = async () => {
    const r = await renameDoc(kind, item.id, name, notes);
    if (r.ok) onSaved();
  };

  return (
    <div className="flex flex-col gap-4">
      <Input label="Name" placeholder="Enter a name" value={name} suffix={ext || undefined} onChange={(e) => setName(e.target.value)} />
      <NotesField id="doc-ed-notes" rows={5} value={notes} onChange={setNotes} />
      <div className="flex gap-2">
        <Button disabled={!name.trim()} onClick={() => void save()}>
          Save
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
