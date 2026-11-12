"use client";
/**
 * Folder info drawer (design `isDocFolder`, markup lines 1571–1592). As in the design it is reached
 * only by cancelling or saving a folder's Edit, or cancelling its Delete (`docBack`).
 */
import { Button } from "@/components/ui/Button";
import { docSize, folderStats, useDocs, type Folder } from "@/data";
import { FieldRows, NotesBlock, useDocsUrl } from "./shared";

export function FolderDrawer({ folder }: { folder: Folder }) {
  const { folders, files } = useDocs();
  const { go } = useDocsUrl();
  const s = folderStats(folders, files, folder.id);
  return (
    <div>
      <FieldRows
        rows={[
          { label: "Location", text: s.location },
          { label: "Access", text: s.access },
          { label: "Folders", text: s.folders },
          { label: "Files", text: s.files },
          { label: "Total size", text: docSize(s.size) },
        ]}
      />
      <NotesBlock notes={folder.notes} className="border-t border-border pt-4" />
      <div className="mt-5 flex flex-wrap gap-2">
        <Button icon="pencil" onClick={() => go({ view: folder.id, kind: "folder", step: "edit" })}>
          Edit
        </Button>
        <Button variant="secondary" icon="trash-2" onClick={() => go({ view: folder.id, kind: "folder", step: "delete" })}>
          Delete
        </Button>
      </div>
    </div>
  );
}
