"use client";
/** Delete confirmation (design `isDocConfirm`, markup lines 1607–1615, logic `docRemove`). */
import { Button } from "@/components/ui/Button";
import { deleteDoc, deleteDocText, useDocs, type DocFile, type DocKind, type Folder } from "@/data";

export function DeleteDocConfirm({
  kind,
  item,
  openDir,
  onCancel,
  onDeleted,
}: {
  kind: DocKind;
  item: DocFile | Folder;
  openDir: string | null;
  onCancel: () => void;
  /** Receives the folder to show next (null = All files). */
  onDeleted: (dir: string | null) => void;
}) {
  const { folders, files } = useDocs();
  const remove = async () => {
    const r = await deleteDoc(kind, item.id, openDir);
    if (r.ok) onDeleted(r.value.dir);
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="type-body text-text">{deleteDocText(folders, files, kind, item.id)}</div>
      <div className="flex gap-2">
        <Button variant="danger" icon="trash-2" onClick={() => void remove()}>
          Delete
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
