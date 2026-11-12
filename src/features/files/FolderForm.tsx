"use client";
/** New folder (design `isDocNew`, markup lines 2766–2775, logic `docCreate`). */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { createFolder, folderOptions, useDocs } from "@/data";
import { PENDING } from "./shared";

export function FolderForm({ parent: initial, onDone }: { parent: string; onDone: () => void }) {
  const { folders } = useDocs();
  const [name, setName] = useState("");
  const [parent, setParent] = useState(initial);

  const onCreate = (n: string) => {
    void createFolder(n).then((r) => r.ok && setParent(r.value.id));
    return PENDING;
  };
  const create = async () => {
    const r = await createFolder(name, parent);
    if (r.ok) onDone();
  };

  return (
    <div className="flex flex-col gap-4">
      <Input label="Folder name" placeholder="Enter a name" value={name} onChange={(e) => setName(e.target.value)} />
      <SearchSelect label="Create in" noun="folder" options={folderOptions(folders)} value={parent} onChange={(v) => v !== PENDING && setParent(v)} onCreate={onCreate} />
      <div className="flex gap-2">
        <Button disabled={!name.trim()} onClick={() => void create()}>
          Create
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
